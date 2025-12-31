# Coder Template Deployment Guide

Quick guide to deploy the SimpleAccounts-UAE template to your Coder instance.

## Prerequisites

- ✅ Coder running at: https://coder.dev.simpleaccounts.io
- ✅ API key (get from Coder dashboard: Account → Tokens)
- ✅ GitHub OAuth configured
- ✅ Docker access on server
- ✅ Traefik proxy running (optional, for custom domains)

## Quick Deployment

### Option 1: Automatic Script (Recommended)

```bash
# From repository root
cd .coder

# Deploy template
./deploy.sh

# Or test first (dry run)
./deploy.sh --dry-run
```

The script will:

1. Validate template files
2. Connect to Coder
3. Push template
4. Show success message with URLs

### Option 2: Manual Deployment

```bash
# Install Coder CLI if needed
curl -fsSL https://coder.com/install.sh | sh

# Login to Coder
export CODER_URL="https://coder.dev.simpleaccounts.io"
export CODER_SESSION_TOKEN="your-api-token-here"
coder login $CODER_URL

# Create template
cd .coder
coder templates create simpleaccounts-uae \
  --directory . \
  --name "SimpleAccounts UAE" \
  --message "Initial deployment"
```

### Option 3: Update Existing Template

```bash
cd .coder

# Update template
./deploy.sh --update

# Or manually
coder templates push simpleaccounts-uae \
  --directory . \
  --message "Updated resource limits"
```

## Verify Deployment

### 1. Check Template

```bash
# List templates
coder templates list

# Should show:
# NAME               ACTIVE VERSION   USED BY
# simpleaccounts-uae v1               0
```

### 2. Test Workspace Creation

**Via Web UI:**

1. Go to https://coder.dev.simpleaccounts.io
2. Click "Create Workspace"
3. Select "SimpleAccounts UAE"
4. Click "Create"

**Via CLI:**

```bash
coder create test-workspace \
  --template simpleaccounts-uae \
  --parameter git_clone_url=https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
```

### 3. Verify Workspace

```bash
# Check workspace status
coder list

# Should show:
# NAME           TEMPLATE            STATUS   LAST BUILT
# test-workspace simpleaccounts-uae  Running  1m ago

# Get workspace details
coder show test-workspace
```

### 4. Test Access

```bash
# SSH into workspace
coder ssh test-workspace

# Verify services
pg_isready -h db -p 5432 -U simpleaccounts
redis-cli -h redis ping

# Check URLs
curl http://localhost:3000
curl http://localhost:8080
```

## Template Configuration

### Resource Limits

Current settings (in `template.tf`):

```hcl
memory  = 4096  # 4GB RAM
cpus    = 2.0   # 2 CPUs
```

To change:

1. Edit `.coder/template.tf`
2. Update `memory` and `cpus` values
3. Run `./deploy.sh --update`

### Auto-Stop Duration

Current: 30 minutes idle

To change, add to workspace metadata:

```hcl
resource "coder_metadata" "auto_stop" {
  resource_id = coder_agent.main.id
  item {
    key   = "auto_stop_duration"
    value = "2h"  # 2 hours
  }
}
```

### Custom Domains

Current pattern: `username-workspace.dev.simpleaccounts.io`

To change domain pattern, edit Traefik labels in `template.tf`:

```hcl
labels {
  label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.rule"
  value = "Host(`your-pattern-here.dev.simpleaccounts.io`)"
}
```

## Directory Structure

```
.coder/
├── template.tf              # Main Terraform template ⭐
├── build.yaml              # Template metadata
├── deploy.sh               # Deployment script
├── README.md               # User documentation
├── MIGRATION_GUIDE.md      # DevPod → Coder migration
├── TRAEFIK_INTEGRATION.md  # Reverse proxy setup
└── DEPLOYMENT.md           # This file
```

## Troubleshooting

### "Template push failed"

**Check Coder connection:**

```bash
coder version
coder whoami
```

**Verify template syntax:**

```bash
cd .coder
terraform init
terraform validate
```

### "Docker image not found"

**Verify image exists:**

```bash
docker pull ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
```

**Or build locally:**

```bash
cd .devcontainer
docker build -t ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest .
docker push ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
```

### "Workspace won't start"

**Check Coder logs:**

```bash
coder logs <workspace-name>
```

**Check container logs:**

```bash
docker logs coder-<username>-<workspace>
```

**Common issues:**

- Docker socket permission denied → `sudo usermod -aG docker coder`
- Network conflict → Check `docker network ls`
- Port already in use → Stop conflicting containers

### "Can't access custom domain"

**Verify Traefik routing:**

```bash
# Check Traefik sees the workspace
curl http://localhost:8090/api/http/routers | jq .

# Should show routers like:
# "alice-dev-frontend@docker"
# "alice-dev-api@docker"
```

**Check DNS:**

```bash
nslookup alice-dev.dev.simpleaccounts.io
# Should resolve to your server IP
```

**See TRAEFIK_INTEGRATION.md for detailed troubleshooting**

## Post-Deployment

### 1. Update Documentation

Add to your team wiki/docs:

- Coder URL: https://coder.dev.simpleaccounts.io
- Template name: `simpleaccounts-uae`
- Support contact

### 2. Notify Users

Send migration guide to developers:

```
Subject: 🚀 New Development Environment: Coder

We've upgraded from DevPod to Coder for a better development experience!

Quick Start:
1. Go to: https://coder.dev.simpleaccounts.io
2. Login with GitHub
3. Create workspace → Select "SimpleAccounts UAE"
4. Start coding!

Migration Guide: .coder/MIGRATION_GUIDE.md
Support: #dev-environment Slack channel
```

### 3. Monitor Usage

```bash
# List all workspaces
coder list --all

# Check template usage
coder templates list

# View workspace metrics (if enabled)
coder stat cpu
coder stat mem
```

## Template Updates

When you update the template:

```bash
# Make changes to template.tf
vim .coder/template.tf

# Test locally (optional)
cd .coder
terraform init
terraform validate

# Deploy update
./deploy.sh --update

# Notify users to update their workspaces
```

**Users update their workspaces:**

1. Coder dashboard will show "Update Available"
2. Click "Update" button
3. Workspace restarts with new configuration

## Advanced Configuration

### Add Template Parameters

Allow users to choose workspace size:

```hcl
data "coder_parameter" "instance_size" {
  name         = "instance_size"
  display_name = "Workspace Size"
  type         = "string"
  default      = "medium"
  options {
    name  = "Small (2 CPU, 4GB RAM)"
    value = "small"
  }
  options {
    name  = "Medium (4 CPU, 8GB RAM)"
    value = "medium"
  }
  options {
    name  = "Large (8 CPU, 16GB RAM)"
    value = "large"
  }
}

# Use in resource limits
locals {
  resources = {
    small  = { cpu = 2, memory = 4096 }
    medium = { cpu = 4, memory = 8192 }
    large  = { cpu = 8, memory = 16384 }
  }
}

resource "docker_container" "workspace" {
  memory = local.resources[data.coder_parameter.instance_size.value].memory
  cpus   = local.resources[data.coder_parameter.instance_size.value].cpu
}
```

### Add Startup Script Parameter

Let users run custom scripts on startup:

```hcl
data "coder_parameter" "startup_script" {
  name         = "startup_script"
  display_name = "Startup Script (Optional)"
  description  = "Run custom commands on workspace start"
  type         = "string"
  default      = ""
  mutable      = true
}

resource "coder_agent" "main" {
  startup_script = <<-EOT
    # ... existing startup script ...

    # Run custom user script
    ${data.coder_parameter.startup_script.value}
  EOT
}
```

## Maintenance

### Regular Updates

Schedule template maintenance:

- **Weekly**: Update base image with security patches
- **Monthly**: Review resource limits and usage
- **Quarterly**: Survey users for feedback

### Backup

Template is in Git, but also backup:

```bash
# Export template
coder templates pull simpleaccounts-uae --output backup/

# Backup workspace data (if needed)
rsync -av /home/coder/workspaces/ /backup/workspaces/
```

### Monitoring

Set up alerts for:

- Template deployment failures
- Workspace creation errors
- High resource usage
- Docker host disk space

## Support

- **Template Issues**: File issue in GitHub repo
- **Coder Platform**: https://github.com/coder/coder/issues
- **Documentation**: https://coder.com/docs

## Next Steps

After successful deployment:

1. ✅ Test workspace creation
2. ✅ Verify all services work
3. ✅ Test custom domain access
4. ✅ Migrate test user from DevPod
5. ✅ Gather feedback
6. ✅ Roll out to team
7. ✅ Update team documentation
8. ✅ Decommission DevPod

Congratulations! Your Coder template is deployed! 🎉
