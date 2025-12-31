# SimpleAccounts-UAE Coder Template

This Coder template provides a complete development environment for SimpleAccounts UAE with automatic provisioning of PostgreSQL, Redis, and all development tools.

## Features

- ✅ **Pre-built Docker image** for instant startup (~30 seconds)
- ✅ **Isolated environment** per developer (PostgreSQL + Redis)
- ✅ **Resource limits**: 2 CPU, 4GB RAM
- ✅ **Auto-stop**: 30 minutes idle timeout
- ✅ **Persistent Git**: Your code changes are saved
- ✅ **Custom domains**: `username-workspace.dev.simpleaccounts.io`
- ✅ **Multi-IDE support**: VS Code Web, VS Code Desktop, Cursor, SSH
- ✅ **Full stack**: Java 21, Node 20, PostgreSQL 16, Redis 7

## Quick Start

### For Users

1. **Login to Coder**: https://coder.dev.simpleaccounts.io
2. **Create Workspace**: Click "Create Workspace" → Select "SimpleAccounts-UAE"
3. **Wait ~1 minute**: Container provisions automatically
4. **Start coding**: Open in VS Code or use Web IDE

### Access Your Workspace

Once your workspace is running, you can access it via:

| Method              | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| **VS Code Desktop** | Click "Open in VS Code" button in Coder dashboard                |
| **VS Code Web**     | Click "Open in Browser" button in Coder dashboard                |
| **Cursor IDE**      | Use SSH: `ssh coder.workspace-name` (requires Cursor Remote SSH) |
| **SSH**             | `ssh coder.workspace-name`                                       |

### Your Environment URLs

After workspace creation, you'll have:

```
Frontend:  https://<username>-<workspace>.dev.simpleaccounts.io
Backend:   https://<username>-<workspace>-api.dev.simpleaccounts.io
```

Example for user `john` with workspace `dev`:

- Frontend: https://john-dev.dev.simpleaccounts.io
- Backend: https://john-dev-api.dev.simpleaccounts.io

## What's Included

### Services

| Service               | Version | Access       |
| --------------------- | ------- | ------------ |
| PostgreSQL            | 16      | `db:5432`    |
| Redis                 | 7       | `redis:6379` |
| Frontend (Vite)       | -       | Port 3000    |
| Backend (Spring Boot) | -       | Port 8080    |

### Database Connection

```bash
# From inside workspace
psql -h db -p 5432 -U simpleaccounts -d simpleaccounts

# Connection string for backend
jdbc:postgresql://db:5432/simpleaccounts

# Credentials
User: simpleaccounts
Password: simpleaccounts_dev
Database: simpleaccounts
```

### Development Tools

Pre-installed in the container:

- Java 21 (OpenJDK)
- Node.js 20 (via nvm)
- Maven (via wrapper)
- Docker CLI + Docker Compose
- GitHub CLI (`gh`)
- Google Cloud CLI (`gcloud`)
- Kubernetes CLI (`kubectl`)
- PostgreSQL Client (`psql`)
- Redis CLI (`redis-cli`)
- Playwright (with Chromium)
- Claude Code CLI
- Gemini CLI
- Cursor CLI

## Persistent Data

### What Persists

- ✅ **Git repository**: `/workspaces/SimpleAccounts-UAE`
- ✅ **Database data**: PostgreSQL volumes
- ✅ **Redis data**: Redis volumes
- ✅ **Maven cache**: `~/.m2`
- ✅ **npm cache**: `~/.npm`
- ✅ **VS Code extensions**: `~/.vscode-server`
- ✅ **Git config**: `~/.gitconfig`
- ✅ **SSH keys**: `~/.ssh`
- ✅ **GitHub CLI**: `~/.config/gh`
- ✅ **Bash history**: `~/.bash_history`
- ✅ **Claude/Gemini config**: `~/.claude`, `~/.gemini`

### What Doesn't Persist

- ❌ **Running processes**: Stop when workspace stops
- ❌ **Temporary files**: `/tmp`
- ❌ **System packages**: Use Dockerfile for permanent additions

## Common Tasks

### Start Frontend

```bash
cd apps/frontend
npm run dev
# Access at https://<username>-<workspace>.dev.simpleaccounts.io
```

### Start Backend

```bash
cd apps/backend
./mvnw spring-boot:run
# Access at https://<username>-<workspace>-api.dev.simpleaccounts.io
```

### Run Tests

```bash
# Frontend tests
cd apps/frontend && npm test

# Backend tests
cd apps/backend && ./mvnw test
```

### Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd apps/frontend && npm install

# Backend dependencies (automatic via Maven wrapper)
cd apps/backend && ./mvnw compile
```

### Database Operations

```bash
# Connect to PostgreSQL
psql -h db -p 5432 -U simpleaccounts -d simpleaccounts

# Reset database (WARNING: deletes all data!)
psql -h db -p 5432 -U simpleaccounts -d simpleaccounts -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations
cd apps/backend && ./mvnw liquibase:update
```

### Redis Operations

```bash
# Connect to Redis
redis-cli -h redis

# Check connection
redis-cli -h redis ping
# Should return: PONG

# Clear all data
redis-cli -h redis FLUSHALL
```

## Customization

### Dotfiles

You can personalize your workspace with dotfiles:

1. Create a dotfiles repository (e.g., `https://github.com/yourusername/dotfiles`)
2. When creating workspace, enter your dotfiles URL
3. Workspace will automatically clone and install them

### Environment Variables

Create local environment files:

```bash
# Frontend
apps/frontend/.env.local

# Backend
apps/backend/src/main/resources/application-local.properties
```

These files are gitignored and won't be committed.

## Using Cursor IDE

### Method 1: SSH Remote Development

1. Install Cursor IDE on your local machine
2. Install "Remote - SSH" extension
3. Get SSH config from Coder:
   ```bash
   coder config-ssh
   ```
4. In Cursor: File → Remote SSH → Connect to Host → `coder.workspace-name`

### Method 2: Direct Connection

```bash
# Get connection details
coder list

# Connect via SSH
ssh coder.<workspace-name>

# Open Cursor remotely
cursor /workspaces/SimpleAccounts-UAE
```

## Auto-Stop Behavior

Workspaces automatically stop after **30 minutes of inactivity** to save resources.

### What Counts as Activity?

- Running development servers (npm, mvn, etc.)
- Active SSH/IDE connections
- Recent file modifications

### Restarting

Stopped workspaces restart instantly:

1. Go to Coder dashboard
2. Click "Start" on your workspace
3. Wait ~10 seconds (containers resume from saved state)

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is ready
pg_isready -h db -p 5432 -U simpleaccounts

# View PostgreSQL logs
docker logs $(docker ps -qf "name=coder-.*-db")

# Wait for it to be ready (startup can take 10-20 seconds)
```

### Redis Connection Failed

```bash
# Check if Redis is ready
redis-cli -h redis ping

# View Redis logs
docker logs $(docker ps -qf "name=coder-.*-redis")
```

### Workspace Won't Start

1. Check Coder logs in the dashboard
2. Contact admin if persistent
3. Try creating a new workspace

### Frontend/Backend Not Accessible

1. Ensure process is running: `ps aux | grep node` or `ps aux | grep java`
2. Check port is correct: `netstat -tlnp | grep :3000`
3. Verify Traefik routing: `curl localhost:3000`

### Missing Tools/Packages

Tools are baked into the Docker image. To add new ones:

1. Update `.devcontainer/Dockerfile`
2. Rebuild image: `docker build -t ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest .`
3. Push to registry: `docker push ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest`
4. Restart workspace (or wait for next rebuild)

## Template Updates

### For Template Admins

To update the template after making changes:

```bash
# Push template to Coder
coder templates push simpleaccounts-uae \
  --directory .coder \
  --name "SimpleAccounts UAE"

# Or create new version
coder templates push simpleaccounts-uae \
  --directory .coder \
  --name "SimpleAccounts UAE" \
  --message "Updated resource limits"
```

### For Users

When template updates are available:

1. Coder dashboard will show "Update Available"
2. Click "Update" to apply changes
3. Workspace will restart with new configuration

## Resource Limits

Each workspace has:

- **CPU**: 2 cores (hard limit)
- **RAM**: 4GB (hard limit)
- **Disk**: Unlimited (shared from host)

If you need more resources, contact your Coder admin.

## Support

- **Documentation**: https://coder.dev.simpleaccounts.io
- **Coder Docs**: https://coder.com/docs
- **GitHub Issues**: https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Workspace: john-dev                                          │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │ Devcontainer                             │               │
│  │ - Java 21, Node 20                       │               │
│  │ - Git repository                         │               │
│  │ - Development tools                      │               │
│  │ - Coder agent (for IDE access)           │               │
│  └──────────────────────────────────────────┘               │
│         │                           │                        │
│         ▼                           ▼                        │
│  ┌──────────────┐           ┌──────────────┐                │
│  │  PostgreSQL  │           │    Redis     │                │
│  │  (db:5432)   │           │ (redis:6379) │                │
│  └──────────────┘           └──────────────┘                │
│                                                              │
│  Network: john-dev-internal (isolated)                       │
└─────────────────────────────────────────────────────────────┘
         │
         │ Connected to Traefik network
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Traefik Reverse Proxy                                        │
│ - john-dev.dev.simpleaccounts.io        → :3000             │
│ - john-dev-api.dev.simpleaccounts.io    → :8080             │
└─────────────────────────────────────────────────────────────┘
```

## Migration from DevPod

If you're migrating from DevPod:

1. **Backup your work**: Commit and push any changes
2. **Create Coder workspace**: Follow Quick Start above
3. **Your Git repo is preserved**: All commits are saved
4. **Credentials carry over**: SSH keys, GitHub CLI auth persist
5. **Delete DevPod workspace**: Once verified, remove old environment

## License

MIT License - See LICENSE file in repository root.
