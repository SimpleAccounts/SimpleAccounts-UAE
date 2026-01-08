terraform {
  required_providers {
    coder = {
      source  = "coder/coder"
      version = ">= 2.5.0"
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

data "coder_parameter" "enable_workspace_apps" {
  name         = "enable_workspace_apps"
  display_name = "Enable Workspace Apps"
  description  = "Show app shortcuts for Frontend, Backend API, and Swagger UI. Only enable if you're running these services."
  type         = "bool"
  default      = "false"
  mutable      = true
  icon         = "/icon/apps.svg"
}

# Docker provider configuration
provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# NOTE: .claude.json is created inside .claude/ directory using CLAUDE_CONFIG_DIR env var
# This avoids Docker file mount issues by keeping everything in one directory mount

# Create host directories for bind mounts before container starts
resource "null_resource" "host_directories" {
  # Re-run when workspace is rebuilt
  triggers = {
    workspace_id = data.coder_workspace.me.id
  }

  provisioner "local-exec" {
    command = <<-EOT
      #!/bin/bash
      set -e

      # Create base directory structure
      BASE_DIR="/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}"

      # Create directories for config files
      mkdir -p "$BASE_DIR/claude"
      mkdir -p "$BASE_DIR/claude/.claude"  # Claude data directory
      mkdir -p "$BASE_DIR/gemini/.gemini"  # Gemini data directory
      mkdir -p "$BASE_DIR/.config/gh"
      mkdir -p "$BASE_DIR/ssh/.ssh"        # SSH config and keys
      mkdir -p "$BASE_DIR/docker/.docker"  # Docker credentials
      mkdir -p "$BASE_DIR/kube/.kube"      # Kubernetes config
      mkdir -p "$BASE_DIR/bash_history"
      mkdir -p "$BASE_DIR/gitconfig"

      # NOTE: .claude.json will be auto-created by Claude Code inside .claude/ directory
      # via CLAUDE_CONFIG_DIR environment variable

      # Create .gemini/config.json if it doesn't exist
      if [ ! -f "$BASE_DIR/gemini/.gemini/config.json" ]; then
        echo '{}' > "$BASE_DIR/gemini/.gemini/config.json"
        echo "✅ Created empty gemini config.json file"
      fi

      # Create .bash_history if it doesn't exist
      if [ ! -f "$BASE_DIR/bash_history/.bash_history" ]; then
        touch "$BASE_DIR/bash_history/.bash_history"
        echo "✅ Created .bash_history file"
      fi

      # Create .gitconfig if it doesn't exist
      if [ ! -f "$BASE_DIR/gitconfig/.gitconfig" ]; then
        cat > "$BASE_DIR/gitconfig/.gitconfig" << 'EOF'
[user]
	name = ${data.coder_workspace_owner.me.name}
	email = ${data.coder_workspace_owner.me.email}
[init]
	defaultBranch = main
[pull]
	rebase = false
EOF
        echo "✅ Created .gitconfig file"
      fi

      # Ensure proper permissions (coder user should own these)
      chown -R coder:coder "$BASE_DIR" 2>/dev/null || true

      echo "✅ Host directories prepared for user: ${data.coder_workspace_owner.me.name}"
    EOT
    interpreter = ["bash", "-c"]
  }
}

# Prepare database init scripts (must exist before postgres container starts)
resource "null_resource" "db_init_scripts" {
  # Re-run when workspace is rebuilt
  triggers = {
    workspace_id = data.coder_workspace.me.id
  }

  provisioner "local-exec" {
    command = <<-EOT
      #!/bin/bash
      set -e

      # Directory for database init scripts (persists across workspace rebuilds)
      SCRIPT_DIR="/home/coder/.coder-db-scripts/${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}"
      mkdir -p "$SCRIPT_DIR"

      # Clone repository to temporary location to get init scripts
      TEMP_DIR=$(mktemp -d)
      trap "rm -rf $TEMP_DIR" EXIT

      echo "📦 Fetching database init scripts from repository..."
      git clone --depth 1 --branch ${data.coder_parameter.git_clone_url.value != "" ? "develop" : "develop"} \
        ${data.coder_parameter.git_clone_url.value != "" ? data.coder_parameter.git_clone_url.value : "https://github.com/SimpleAccounts/SimpleAccounts-UAE.git"} \
        "$TEMP_DIR" --quiet || true

      # Copy init scripts to persistent location
      if [ -f "$TEMP_DIR/.devcontainer/init-db.sh" ]; then
        cp "$TEMP_DIR/.devcontainer/init-db.sh" "$SCRIPT_DIR/init-db.sh"
        chmod +x "$SCRIPT_DIR/init-db.sh"
        echo "✅ Copied init-db.sh"
      else
        echo "⚠️  Warning: init-db.sh not found in repository"
      fi

      if [ -f "$TEMP_DIR/.devcontainer/postgres-startup-hook.sh" ]; then
        cp "$TEMP_DIR/.devcontainer/postgres-startup-hook.sh" "$SCRIPT_DIR/postgres-startup-hook.sh"
        chmod +x "$SCRIPT_DIR/postgres-startup-hook.sh"
        echo "✅ Copied postgres-startup-hook.sh"
      else
        echo "⚠️  Warning: postgres-startup-hook.sh not found in repository"
      fi

      echo "✅ Database init scripts prepared"
    EOT
    interpreter = ["bash", "-c"]
  }

  depends_on = [null_resource.host_directories]
}

# Random password for PostgreSQL (generated once per workspace)
# NOTE: This password persists in Terraform state across workspace stop/start cycles.
# However, if Terraform state is reset while the volume persists, password mismatch occurs.
#
# The sync-db-password.sh script in post-start attempts to fix this by updating
# the password in the database to match the environment variable.
# If that fails, the user needs to rebuild with: coder restart --build
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
    "POSTGRES_DB=simpleaccounts",
    # Application database user credentials (used by init-db.sh and password sync)
    "SIMPLEACCOUNTS_DB_USER=simpleaccounts",
    "SIMPLEACCOUNTS_DB_PASSWORD=${random_password.postgres.result}"
  ]

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  # Database initialization script (creates extensions and test database)
  # Note: Mounted from persistent location prepared by null_resource.db_init_scripts
  volumes {
    host_path      = "/home/coder/.coder-db-scripts/${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}/init-db.sh"
    container_path = "/docker-entrypoint-initdb.d/init-db.sh"
    read_only      = true
  }

  # Password sync hook (runs on every startup to fix password mismatch)
  # Note: Mounted from persistent location prepared by null_resource.db_init_scripts
  volumes {
    host_path      = "/home/coder/.coder-db-scripts/${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}/postgres-startup-hook.sh"
    container_path = "/usr/local/bin/password-sync.sh"
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

  # Custom command: start postgres normally, then run password sync in background
  # This ensures passwords are synchronized on EVERY container start, not just first init
  command = [
    "bash", "-c",
    "docker-entrypoint.sh postgres & PG_PID=$!; sleep 5; chmod +x /usr/local/bin/password-sync.sh && /usr/local/bin/password-sync.sh || true; wait $PG_PID"
  ]

  restart = "unless-stopped"

  # Ensure init scripts are prepared before container starts
  depends_on = [null_resource.db_init_scripts]
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

    # Fix ownership of workspace and config directories (needed when switching from root to vscode user)
    echo "🔧 Fixing workspace permissions..."
    if [ -d /workspaces/SimpleAccounts-UAE ]; then
      sudo chown -R vscode:vscode /workspaces/SimpleAccounts-UAE 2>/dev/null || true
    fi

    # Fix ownership of bind-mounted config files and directories
    for path in /home/vscode/.claude /home/vscode/.gemini \
                /home/vscode/.config/gh /home/vscode/.bash_history_dir /home/vscode/.gitconfig_dir \
                /home/vscode/.ssh /home/vscode/.docker /home/vscode/.kube; do
      if [ -e "$path" ]; then
        sudo chown -R vscode:vscode "$path" 2>/dev/null || true
      fi
    done

    # Ensure SSH directory has correct permissions if it exists
    if [ -d /home/vscode/.ssh ]; then
      sudo chmod 700 /home/vscode/.ssh 2>/dev/null || true
      # Fix key permissions if any exist
      find /home/vscode/.ssh -type f -name "id_*" ! -name "*.pub" -exec sudo chmod 600 {} \; 2>/dev/null || true
      find /home/vscode/.ssh -type f -name "*.pub" -exec sudo chmod 644 {} \; 2>/dev/null || true
    fi

    # Configure git to trust workspace directory (prevents dubious ownership warning)
    echo "🔧 Configuring git safe directory..."
    if [ -d /workspaces/SimpleAccounts-UAE ]; then
      git config --global --add safe.directory /workspaces/SimpleAccounts-UAE 2>/dev/null || true
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

    # Start VNC server for browser testing
    echo "🖥️  Starting VNC server..."
    if [ -x /usr/local/bin/start-vnc ]; then
      /usr/local/bin/start-vnc &
      echo "✅ VNC server started on port 6080"
    fi

    echo "✅ Workspace ready!"
    echo ""
    echo "Quick start commands:"
    echo "  Frontend: npm run frontend"
    echo "  Backend:  npm run backend:run"
    echo ""
    echo "Or from app directories:"
    echo "  Frontend: cd apps/frontend && npm start"
    echo "  Backend:  cd apps/backend && ./mvnw spring-boot:run"
    echo ""
    echo "VNC Browser: https://${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc.dev.simpleaccounts.io/vnc.html"
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

# code-server module for web-based VS Code access
module "code-server" {
  source   = "registry.coder.com/modules/code-server/coder"
  version  = "1.4.2"
  agent_id = coder_agent.main.id
  folder   = "/workspaces/SimpleAccounts-UAE"

  # Auto-install extensions from devcontainer.json
  auto_install_extensions = true

  # Display in Web Editors group
  group = "Web Editors"
}

# Frontend application (React + Vite on port 3000)
# Only shown if workspace apps are enabled via parameter
resource "coder_app" "frontend" {
  count = data.coder_parameter.enable_workspace_apps.value == "true" ? 1 : 0

  agent_id     = coder_agent.main.id
  slug         = "frontend"
  display_name = "Frontend (React)"
  icon         = "/icon/react.svg"
  url          = "http://localhost:3000"
  subdomain    = true
  share        = "owner"

  healthcheck {
    url       = "http://localhost:3000"
    interval  = 5
    threshold = 10
  }
}

# Backend API application (Spring Boot on port 8080)
# Only shown if workspace apps are enabled via parameter
resource "coder_app" "backend" {
  count = data.coder_parameter.enable_workspace_apps.value == "true" ? 1 : 0

  agent_id     = coder_agent.main.id
  slug         = "backend"
  display_name = "Backend API"
  icon         = "/icon/spring.svg"
  url          = "http://localhost:8080"
  subdomain    = true
  share        = "owner"

  healthcheck {
    url       = "http://localhost:8080/rest/config/getreleasenumber"
    interval  = 5
    threshold = 10
  }
}

# Swagger UI for API documentation
# Only shown if workspace apps are enabled via parameter
resource "coder_app" "swagger" {
  count = data.coder_parameter.enable_workspace_apps.value == "true" ? 1 : 0

  agent_id     = coder_agent.main.id
  slug         = "swagger"
  display_name = "API Docs (Swagger)"
  icon         = "/icon/swagger.svg"
  url          = "http://localhost:8080/swagger-ui.html"
  subdomain    = false
  share        = "owner"
}

# VNC Browser for UI testing and preview
# Always enabled - useful for Playwright tests and visual debugging
resource "coder_app" "vnc" {
  agent_id     = coder_agent.main.id
  slug         = "vnc"
  display_name = "VNC Browser"
  icon         = "/icon/desktop.svg"
  url          = "http://localhost:6080/"
  subdomain    = true
  share        = "owner"

  healthcheck {
    url       = "http://localhost:6080"
    interval  = 10
    threshold = 20
  }
}

# Main workspace container
resource "docker_container" "workspace" {
  # Use pre-built image for fast startup
  image = "ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest"
  name  = "coder-${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}"

  hostname = "simpleaccounts-dev"

  # Run as vscode user (non-root)
  user = "vscode"

  # Resource limits: 2 CPU, 4GB RAM
  memory  = 4096  # 4GB
  # cpus = 2.0 # DISABLED: Causes provider panic (interface conversion: interface {} is string, not float32) in kreuzwerker/docker v3.6.2

  # Environment variables
  env = [
    "CODER_AGENT_TOKEN=${coder_agent.main.token}",
    "CODER_AGENT_URL=${data.coder_workspace.me.access_url}",
    # Database credentials for PostgreSQL container
    "POSTGRES_USER=simpleaccounts",
    "POSTGRES_PASSWORD=${random_password.postgres.result}",
    "POSTGRES_DB=simpleaccounts",
    "POSTGRES_HOST=db",
    "POSTGRES_PORT=5432",
    # Backend Spring Boot configuration (uses 'db' hostname in Coder network)
    "SIMPLEACCOUNTS_DB_HOST=db",
    "SIMPLEACCOUNTS_DB_PORT=5432",
    "SIMPLEACCOUNTS_DB=simpleaccounts",
    "SIMPLEACCOUNTS_DB_USER=simpleaccounts",
    "SIMPLEACCOUNTS_DB_PASSWORD=${random_password.postgres.result}",
    "SIMPLEACCOUNTS_DB_SSL=false",
    "SIMPLEACCOUNTS_DB_SSLMODE=disable",
    "SIMPLEACCOUNTS_DB_SSLROOTCERT=",
    # Redis configuration (Spring Boot 3.x naming convention)
    "SPRING_DATA_REDIS_HOST=redis",
    "SPRING_DATA_REDIS_PORT=6379",
    # Application host
    "SIMPLEACCOUNTS_HOST=http://localhost:8080",
    # CORS configuration (allow all origins in dev environment)
    # Note: SimpleCorsFilter only treats literal "*" as wildcard (not pattern matching)
    # For production, this should be set to specific domain(s)
    "CORS_ALLOWED_ORIGINS=*",
    # File upload directory (for user uploads)
    "FILE_UPLOAD_DIR=/tmp/simpleaccounts-uploads",
    # Application settings
    "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1",
    "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium",
    "MAVEN_OPTS=-Xmx2g -XX:+UseG1GC -XX:+UseStringDeduplication",
    "JAVA_TOOL_OPTIONS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0",
    "NODE_OPTIONS=--max-old-space-size=2048",
    "HISTFILE=/home/vscode/.bash_history_dir/.bash_history",
    "GIT_CONFIG_GLOBAL=/home/vscode/.gitconfig_dir/.gitconfig",
    # Claude Code configuration directory (puts .claude.json inside .claude/ directory)
    "CLAUDE_CONFIG_DIR=/home/vscode/.claude"
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
  # Claude directory (contains .claude.json, settings.json, and cache)
  # CLAUDE_CONFIG_DIR env var tells Claude to look for .claude.json here
  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/claude/.claude"
    container_path = "/home/vscode/.claude"
  }

  # Gemini directory (contains config.json and other data)
  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/gemini/.gemini"
    container_path = "/home/vscode/.gemini"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/.config/gh"
    container_path = "/home/vscode/.config/gh"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/bash_history/.bash_history"
    container_path = "/home/vscode/.bash_history_dir"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/gitconfig/.gitconfig"
    container_path = "/home/vscode/.gitconfig_dir"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/ssh/.ssh"
    container_path = "/home/vscode/.ssh"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/docker/.docker"
    container_path = "/home/vscode/.docker"
  }

  volumes {
    host_path      = "/home/coder/.coder-mount/${data.coder_workspace_owner.me.name}/kube/.kube"
    container_path = "/home/vscode/.kube"
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

  # VNC routing (port 6080)
  labels {
    label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc.rule"
    value = "Host(`${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc.dev.simpleaccounts.io`)"
  }

  labels {
    label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc.service"
    value = "${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc"
  }

  labels {
    label = "traefik.http.services.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc.loadbalancer.server.port"
    value = "6080"
  }

  # Depend on database containers and host directory setup
  depends_on = [
    docker_container.postgres,
    docker_container.redis,
    null_resource.host_directories
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
    key   = "vnc_url"
    value = "https://${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-vnc.dev.simpleaccounts.io/vnc.html"
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
