# DevContainer Configuration

This directory contains the development container configuration for SimpleAccounts UAE.

## Quick Start

### Coder Workspaces (Recommended)

For team development with cloud workspaces:

1. **Login**: https://coder.dev.simpleaccounts.io
2. **Create Workspace**: Select "SimpleAccounts UAE" template
3. **Start Coding**: Automatically provisions PostgreSQL, Redis, and dev tools

See [../.coder/README.md](../.coder/README.md) for complete Coder guide.

### Local Development (VS Code)

For local development on your machine:

```bash
# Open in VS Code with Dev Containers extension
code .
# Then: Cmd+Shift+P > "Dev Containers: Reopen in Container"
```

---

## Architecture

All services share the same network namespace via `network_mode: service:db`.
This means all services (devcontainer, postgres, redis) are accessible via `localhost`.

```
┌─────────────────────────────────────────────────────────────┐
│              Shared Network Namespace (localhost)            │
│                   (network_mode: service:db)                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ devcontainer │  │  PostgreSQL  │  │    Redis     │       │
│  │              │  │              │  │              │       │
│  │ localhost:3000 (frontend)                        │       │
│  │ localhost:8080 (backend)                         │       │
│  │              │  │ localhost:5432                 │       │
│  │              │  │              │  │ localhost:6379       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Service Connectivity

| Service    | Access From Container |
| ---------- | --------------------- |
| PostgreSQL | `localhost:5432`      |
| Redis      | `localhost:6379`      |
| Frontend   | `localhost:3000`      |
| Backend    | `localhost:8080`      |

## Files

| File                          | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `devcontainer.json`           | VS Code devcontainer configuration        |
| `docker-compose.yml`          | Container orchestration                   |
| `docker-compose.override.yml` | Local overrides (secrets) - not committed |
| `Dockerfile`                  | Container image definition                |
| `init-db.sql`                 | PostgreSQL initialization script          |
| `post-create.sh`              | Runs once on container creation           |
| `post-start.sh`               | Runs on every container start             |

## Volumes

### Persistent Data (Named Volumes)

Named Docker volumes (user-specific to avoid conflicts):

- `${USER}-postgres-data` - PostgreSQL database files
- `${USER}-redis-data` - Redis persistence
- `${USER}-vscode-extensions` - VS Code extensions
- `${USER}-maven-cache` - Maven dependencies (~/.m2)
- `${USER}-npm-cache` - npm cache (~/.npm)

### Credentials & Configuration (Host Bind Mounts)

For Coder workspaces, persisted to `/home/coder/.coder-mount/`:

- `claude` → ~/.claude (Claude CLI)
- `gemini` → ~/.gemini (Gemini CLI)
- `gh` → ~/.config/gh (GitHub CLI)
- `ssh` → ~/.ssh (SSH keys)
- `docker` → ~/.docker (Docker config)
- `gitconfig` → ~/.gitconfig_dir (Git config)
- `bash-history` → ~/.bash_history_dir (Bash history)

## Common Tasks

### Rebuild Container

```bash
# VS Code Command Palette
Dev Containers: Rebuild Container

# Or via CLI
docker compose down
docker compose up -d
```

### Verify Network Connectivity

```bash
# PostgreSQL (all services share localhost via network_mode: service:db)
pg_isready -h localhost -p 5432

# Redis (all services share localhost via network_mode: service:db)
redis-cli -h localhost ping
```

### View Container Logs

```bash
docker compose logs -f db
docker compose logs -f redis
```

## Troubleshooting

### "Connection refused" to db:5432

The db container may not be ready. Check health:

```bash
docker compose ps
docker compose logs db
```

### Credentials lost after rebuild

Credentials are stored in named volumes and should persist. Check volume exists:

```bash
docker volume ls | grep "$(whoami)-"
```

## For Team Development

This devcontainer configuration is used by **Coder** to provision cloud workspaces for the team.

**Coder Advantages:**

- ✅ One-click workspace creation
- ✅ GitHub OAuth (no manual setup)
- ✅ Custom domains: `*.dev.simpleaccounts.io`
- ✅ Auto-stop after inactivity
- ✅ Resource quotas and monitoring
- ✅ Multi-IDE support (VS Code, Cursor, SSH)

See [../.coder/README.md](../.coder/README.md) for complete guide.
