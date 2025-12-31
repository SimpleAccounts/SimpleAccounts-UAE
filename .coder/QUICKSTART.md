# Coder Template - Quick Start

Complete Coder template for SimpleAccounts UAE is ready! 🎉

## Files Created

```
.coder/
├── template.tf              # Terraform template (main file)
├── build.yaml              # Template metadata
├── deploy.sh               # Deployment script ⭐
├── README.md               # User guide
├── MIGRATION_GUIDE.md      # DevPod → Coder migration
├── TRAEFIK_INTEGRATION.md  # Reverse proxy setup
├── DEPLOYMENT.md           # Deployment guide
└── QUICKSTART.md           # This file
```

## Deploy Now (2 minutes)

```bash
# Step 1: Navigate to template directory
cd .coder

# Step 2: Deploy to Coder
./deploy.sh

# That's it! ✅
```

The script will:

- ✅ Validate template files
- ✅ Connect to Coder (https://coder.dev.simpleaccounts.io)
- ✅ Push template
- ✅ Show success message

## What You Get

### Template Features

- ✅ **2 CPU, 4GB RAM** per workspace
- ✅ **Auto-stop** after 30 minutes idle
- ✅ **Persistent Git** repository
- ✅ **PostgreSQL 16** + **Redis 7**
- ✅ **Custom domains**: `username-workspace.dev.simpleaccounts.io`
- ✅ **Multi-IDE**: VS Code Web + Desktop + Cursor

### Pre-Installed Tools

- Java 21 + Maven
- Node.js 20 + npm
- Docker CLI + Compose
- GitHub CLI
- PostgreSQL Client
- Redis CLI
- Claude Code CLI
- Playwright with Chromium

## For Users

After deployment, users can:

1. **Login**: https://coder.dev.simpleaccounts.io (GitHub OAuth)
2. **Create Workspace**: Click "Create" → Select "SimpleAccounts UAE"
3. **Start Coding**: Opens in ~1 minute!

### User URLs

```
Frontend:  https://<user>-<workspace>.dev.simpleaccounts.io
Backend:   https://<user>-<workspace>-api.dev.simpleaccounts.io
```

Example for user `john` with workspace `dev`:

- Frontend: https://john-dev.dev.simpleaccounts.io
- Backend: https://john-dev-api.dev.simpleaccounts.io

## Update Template

When you make changes:

```bash
cd .coder
./deploy.sh --update
```

Users will see "Update Available" in their dashboard.

## Next Steps

### 1. Deploy Template (Now)

```bash
cd .coder && ./deploy.sh
```

### 2. Test Workspace Creation

- Go to https://coder.dev.simpleaccounts.io
- Create test workspace
- Verify all services work

### 3. Migrate Users

- Share migration guide: `.coder/MIGRATION_GUIDE.md`
- Help first user migrate
- Gather feedback
- Roll out to team

### 4. Documentation

- Add Coder URL to team wiki
- Update onboarding docs
- Create Slack announcement

## Troubleshooting

### Deployment Failed?

```bash
# Check Coder connection
export CODER_URL="https://coder.dev.simpleaccounts.io"
export CODER_SESSION_TOKEN="cGmYiyiZV1-qE8akRLOW8cx8fIywwnKGv"
coder whoami

# Validate template
cd .coder
terraform validate
```

### Need Help?

- **Deployment**: See `DEPLOYMENT.md`
- **Migration**: See `MIGRATION_GUIDE.md`
- **Traefik**: See `TRAEFIK_INTEGRATION.md`
- **User Guide**: See `README.md`

## Template Configuration

### Resource Limits

Edit `.coder/template.tf`:

```hcl
memory  = 4096  # 4GB RAM
cpus    = 2.0   # 2 CPUs
```

### Auto-Stop Duration

Currently: 30 minutes idle

To change, edit startup script in `template.tf`.

### Custom Domains

Currently: `*.dev.simpleaccounts.io`

Configured via Traefik labels in `template.tf`.

## Summary

✅ **Template ready** for deployment
✅ **Reuses existing** Docker image
✅ **No Traefik changes** needed
✅ **Auto-routes** to custom domains
✅ **Multi-IDE support** included

Deploy now:

```bash
cd .coder && ./deploy.sh
```

Then create your first workspace! 🚀
