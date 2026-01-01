terraform {
  required_providers {
    coder = {
      source  = "coder/coder"
      version = "~> 0.12"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# Coder workspace metadata
data "coder_workspace" "me" {}
data "coder_workspace_owner" "me" {}

# User parameters
data "coder_parameter" "dotfiles_url" {
  name         = "Dotfiles URL"
  description  = "Personalize your workspace (optional)"
  display_name = "Dotfiles Repository (Optional)"
  type         = "string"
  default      = ""
  mutable      = true
  icon         = "/icon/git.svg"
}

data "coder_parameter" "git_clone_url" {
  name         = "git_clone_url"
  display_name = "Repository URL"
  description  = "Git repository to clone (defaults to SimpleAccounts-UAE)"
  type         = "string"
  default      = "https://github.com/SimpleAccounts/SimpleAccounts-UAE.git"
  mutable      = false
  icon         = "/icon/git.svg"
}

# Docker provider configuration
provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# Random password for PostgreSQL (generated once per workspace)
resource "random_password" "postgres" {
  length  = 32
  special = false # Avoid special chars that might cause shell escaping issues
}

# Persistent volumes
resource "docker_volume" "postgres_data" {
  name = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-postgres"
}

resource "docker_volume" "redis_data" {
  name = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-redis"
}

resource "docker_volume" "maven_cache" {
  name = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-maven"
}

resource "docker_volume" "npm_cache" {
  name = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-npm"
}

resource "docker_volume" "vscode_extensions" {
  name = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vscode"
}

# Isolated network for this workspace
resource "docker_network" "workspace" {
  name = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}"

  lifecycle {
    create_before_destroy = false
  }
}

# PostgreSQL container
resource "docker_container" "postgres" {
  image = "postgres:18-alpine"
  name  = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-db"

  hostname = "db"

  env = [
    "POSTGRES_USER=simpleaccounts",
    "POSTGRES_PASSWORD=${random_password.postgres.result}",
    "POSTGRES_DB=simpleaccounts"
  ]

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  # Database initialization script (creates extensions and test database)
  volumes {
    host_path      = "/workspaces/SimpleAccounts-UAE/.devcontainer/init-db.sql"
    container_path = "/docker-entrypoint-initdb.d/init.sql"
    read_only      = true
  }

  networks_advanced {
    name    = docker_network.workspace.name
    aliases = ["db", "postgres"]
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U simpleaccounts"]
    interval = "10s"
    timeout  = "5s"
    retries  = 5
  }

  restart = "unless-stopped"
}

# Redis container
resource "docker_container" "redis" {
  image = "redis:7-alpine"
  name  = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-redis"

  hostname = "redis"

  command = ["redis-server", "--appendonly", "yes"]

  volumes {
    volume_name    = docker_volume.redis_data.name
    container_path = "/data"
  }

  networks_advanced {
    name    = docker_network.workspace.name
    aliases = ["redis"]
  }

  restart = "unless-stopped"
}

# Coder agent (runs inside the main container)
resource "coder_agent" "main" {
  arch = "arm64"
  os   = "linux"
  dir  = "/workspaces/SimpleAccounts-UAE"

  # Startup script
  startup_script = <<-EOT
    #!/bin/bash
    set -e

    echo "🚀 Starting SimpleAccounts-UAE workspace..."

    # Fix workspace directory ownership for vscode user (runs as root first)
    # This ensures npm, git, and IDE tools work correctly
    echo "🔧 Fixing workspace permissions..."
    if [ -d /workspaces/SimpleAccounts-UAE ]; then
      chown -R vscode:vscode /workspaces/SimpleAccounts-UAE 2>/dev/null || true
      # Configure git to trust this directory (prevents dubious ownership warning)
      su vscode -c "git config --global --add safe.directory /workspaces/SimpleAccounts-UAE" 2>/dev/null || true
    fi

    # Wait for PostgreSQL
    echo "⏳ Waiting for PostgreSQL..."
    timeout 60 bash -c 'until pg_isready -h db -p 5432 -U simpleaccounts -q; do sleep 1; done' || echo "⚠️  PostgreSQL timeout"
    echo "✅ PostgreSQL is ready"

    # Wait for Redis
    echo "⏳ Waiting for Redis..."
    timeout 60 bash -c 'until redis-cli -h redis ping > /dev/null 2>&1; do sleep 1; done' || echo "⚠️  Redis timeout"
    echo "✅ Redis is ready"

    # Clone repository if not exists
    if [ ! -d /workspaces/SimpleAccounts-UAE/.git ]; then
      echo "📦 Cloning repository..."
      git clone ${data.coder_parameter.git_clone_url.value} /workspaces/SimpleAccounts-UAE || echo "⚠️  Clone failed, may already exist"
      cd /workspaces/SimpleAccounts-UAE
      chown -R vscode:vscode /workspaces/SimpleAccounts-UAE 2>/dev/null || true
    else
      echo "✅ Repository already cloned"
      cd /workspaces/SimpleAccounts-UAE
      git fetch --all || echo "⚠️  Fetch failed"
    fi

    # Install dotfiles if provided
    if [ -n "${data.coder_parameter.dotfiles_url.value}" ]; then
      echo "🎨 Installing dotfiles..."
      coder dotfiles -y ${data.coder_parameter.dotfiles_url.value} || echo "⚠️  Dotfiles install failed"
    fi

    # Run post-create script if this is first start
    if [ ! -f ~/.coder-workspace-initialized ]; then
      echo "🔧 Running post-create setup..."
      if [ -f .devcontainer/post-create.sh ]; then
        bash .devcontainer/post-create.sh || echo "⚠️  Post-create script had issues"
      fi
      touch ~/.coder-workspace-initialized
    fi

    # Run post-start script
    echo "🔄 Running post-start setup..."
    if [ -f .devcontainer/post-start.sh ]; then
      bash .devcontainer/post-start.sh || echo "⚠️  Post-start script had issues"
    fi

    echo "✅ Workspace ready!"
    echo ""
    echo "Quick start commands:"
    echo "  Frontend: cd apps/frontend && npm run dev"
    echo "  Backend:  cd apps/backend && ./mvnw spring-boot:run"
  EOT

  # Display apps (for web access)
  display_apps {
    vscode          = true
    vscode_insiders = false
    web_terminal    = true
    ssh_helper      = true
    port_forwarding_helper = true
  }

  # Metadata
  metadata {
    display_name = "CPU Usage"
    key          = "cpu"
    script       = "coder stat cpu"
    interval     = 10
    timeout      = 1
  }

  metadata {
    display_name = "RAM Usage"
    key          = "ram"
    script       = "coder stat mem"
    interval     = 10
    timeout      = 1
  }

  metadata {
    display_name = "Disk Usage"
    key          = "disk"
    script       = "df -h /workspaces | tail -n 1 | awk '{print $5}'"
    interval     = 60
    timeout      = 1
  }

  metadata {
    display_name = "PostgreSQL"
    key          = "postgres_status"
    script       = "pg_isready -h db -p 5432 -U simpleaccounts -q && echo '✅ Ready' || echo '❌ Not Ready'"
    interval     = 30
    timeout      = 5
  }

  metadata {
    display_name = "Redis"
    key          = "redis_status"
    script       = "redis-cli -h redis ping > /dev/null 2>&1 && echo '✅ Ready' || echo '❌ Not Ready'"
    interval     = 30
    timeout      = 5
  }
}

# Main workspace container
resource "docker_container" "workspace" {
  # Use pre-built image for fast startup
  image = "ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest"
  name  = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}"

  hostname = "simpleaccounts-dev"

  # Resource limits: 2 CPU, 4GB RAM
  memory  = 4096  # 4GB
  # cpus = 2.0 # DISABLED: Causes provider panic (interface conversion: interface {} is string, not float32) in kreuzwerker/docker v3.6.2

  # Environment variables
  env = [
    "CODER_AGENT_TOKEN=${coder_agent.main.token}",
    "CODER_AGENT_URL=${data.coder_workspace.me.access_url}",
    # Database credentials (auto-generated per workspace)
    "POSTGRES_USER=simpleaccounts",
    "POSTGRES_PASSWORD=${random_password.postgres.result}",
    "POSTGRES_DB=simpleaccounts",
    "POSTGRES_HOST=db",
    "POSTGRES_PORT=5432",
    # Application settings
    "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1",
    "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium",
    "MAVEN_OPTS=-Xmx2g -XX:+UseG1GC -XX:+UseStringDeduplication",
    "JAVA_TOOL_OPTIONS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0",
    "NODE_OPTIONS=--max-old-space-size=2048",
    "HISTFILE=/root/.bash_history_dir/bash_history",
    "GIT_CONFIG_GLOBAL=/root/.gitconfig_dir/gitconfig"
  ]

  # Workspace directory (persistent Git repository)
  volumes {
    host_path      = "/home/coder/workspaces/${data.coder_workspace_owner.me.name}/${data.coder_workspace.me.name}"
    container_path = "/workspaces/SimpleAccounts-UAE"
  }

  # Cache volumes (rebuilds are OK)
  volumes {
    volume_name    = docker_volume.vscode_extensions.name
    container_path = "/home/vscode/.vscode-server/extensions"
  }

  volumes {
    volume_name    = docker_volume.maven_cache.name
    container_path = "/home/vscode/.m2"
  }

  volumes {
    volume_name    = docker_volume.npm_cache.name
    container_path = "/home/vscode/.npm"
  }

  # User credentials (persistent across host)
  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/claude/.claude"
    container_path = "/root/.claude"
  }

  # Claude configuration file (must be pre-created as a file on host)
  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/claude/claude.json"
    container_path = "/root/.claude.json"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/gemini/.gemini"
    container_path = "/root/.gemini"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/.config/gh"
    container_path = "/root/.config/gh"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/bash-history/.bash_history"
    container_path = "/root/.bash_history_dir"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/gitconfig/.gitconfig"
    container_path = "/root/.gitconfig_dir"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/ssh/.ssh"
    container_path = "/root/.ssh"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/docker/.docker"
    container_path = "/root/.docker"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/kube/.kube"
    container_path = "/root/.kube"
  }

  # Docker socket for Docker-in-Docker
  volumes {
    host_path      = "/var/run/docker.sock"
    container_path = "/var/run/docker.sock"
  }

  # Network
  networks_advanced {
    name = docker_network.workspace.name
  }

  # Traefik labels for custom domain routing (*.dev.simpleaccounts.io)
  labels {
    label = "traefik.enable"
    value = "true"
  }

  # Frontend routing (port 3000)
  labels {
    label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.rule"
    value = "Host(`${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}.dev.simpleaccounts.io`)"
  }

  labels {
    label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.service"
    value = "${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend"
  }

  labels {
    label = "traefik.http.services.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.loadbalancer.server.port"
    value = "3000"
  }

  # Backend routing (port 8080)
  labels {
    label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.rule"
    value = "Host(`${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.dev.simpleaccounts.io`)"
  }

  labels {
    label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.service"
    value = "${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api"
  }

  labels {
    label = "traefik.http.services.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.loadbalancer.server.port"
    value = "8080"
  }

  # Depend on database containers
  depends_on = [
    docker_container.postgres,
    docker_container.redis
  ]

  # Auto-restart on failure
  restart = "unless-stopped"

  # Disable Coder's automatic devcontainer detection to prevent "exit status 127" error
  # The template already creates all containers directly, so nested devcontainer management is not needed
  # See: https://github.com/coder/coder/issues/19345
  command = ["sh", "-c", "export CODER_AGENT_DEVCONTAINERS_ENABLE=0; ${coder_agent.main.init_script}"]
}

# Workspace metadata
resource "coder_metadata" "workspace_info" {
  resource_id = coder_agent.main.id

  item {
    key   = "frontend_url"
    value = "https://${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}.dev.simpleaccounts.io"
  }

  item {
    key   = "backend_url"
    value = "https://${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.dev.simpleaccounts.io"
  }

  item {
    key   = "postgres_host"
    value = "db:5432"
  }

  item {
    key   = "redis_host"
    value = "redis:6379"
  }

  item {
    key   = "resources"
    value = "2 CPU, 4GB RAM"
  }

  item {
    key   = "auto_stop"
    value = "30 minutes idle"
  }
}
