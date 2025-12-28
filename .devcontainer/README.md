# DevContainer Configuration

This directory contains the development container configuration for SimpleAccounts UAE.

## Quick Start

### Single User (Local Development)

```bash
# Open in VS Code with Dev Containers extension
code .
# Then: Cmd+Shift+P > "Dev Containers: Reopen in Container"
```

### Multi-User (Shared Dev Server)

```bash
# Launch via DevPod (from your local machine)
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git \
  --provider ssh \
  --provider-option HOST=<dev-server>

# Container auto-connects to Traefik proxy for shareable URLs
```

---

## Choose Your Setup

| Setup | Best For | Access URLs |
|-------|----------|-------------|
| **Single User** | Local development, one developer | `localhost:3000`, `localhost:8080` |
| **Multi-User** | Shared dev server, team collaboration | `https://alice.dev.simpleaccounts.io` |

---

## Single-User Setup (Default)

Uses `.devcontainer/docker-compose.yml` and `devcontainer.json`.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internal Docker Network                   │
│                   (user-specific isolation)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ devcontainer │  │      db      │  │    redis     │       │
│  │              │  │  (postgres)  │  │              │       │
│  │   db:5432 ──────► :5432       │  │              │       │
│  │   redis:6379 ───────────────────────► :6379     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Service Connectivity

| Service    | Access From DevContainer |
| ---------- | ------------------------ |
| PostgreSQL | `db:5432`                |
| Redis      | `redis:6379`             |
| Frontend   | `localhost:3000`         |
| Backend    | `localhost:8080`         |

### Why Internal Network?

1. **Multi-user Isolation**: Each user gets their own network namespace
2. **Traefik Compatible**: Devcontainer can join Traefik network for external routing
3. **Simple Hostnames**: Services use predictable hostnames (`db`, `redis`)
4. **Consistent**: Same connection strings work for single and multi-user setups

---

## Multi-User Setup (Shared Server)

Uses `.devcontainer/proxy/` with Traefik reverse proxy.

### Architecture

```
                              Dev Server
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────┐                                         │
│  │  Traefik Proxy  │  ← Port 80 (shared)                     │
│  │   (dev-proxy)   │                                         │
│  └────────┬────────┘                                         │
│           │                                                  │
│     ┌─────┴─────┬─────────────┐                              │
│     │           │             │                              │
│     ▼           ▼             ▼                              │
│  ┌──────┐   ┌──────┐     ┌──────┐                            │
│  │alice │   │ bob  │     │carol │  ← Isolated containers     │
│  │ :3000│   │ :3000│     │ :3000│                            │
│  │ :8080│   │ :8080│     │ :8080│                            │
│  └──┬───┘   └──┬───┘     └──┬───┘                            │
│     │          │            │                                │
│  ┌──┴───┐   ┌──┴───┐     ┌──┴───┐                            │
│  │ DB   │   │ DB   │     │ DB   │  ← Isolated databases      │
│  │Redis │   │Redis │     │Redis │                            │
│  └──────┘   └──────┘     └──────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Features

- **Isolated environments**: Each user has their own DB, Redis, and container
- **Shareable URLs**: Share `https://alice.dev.simpleaccounts.io` with teammates
- **Valid SSL Certificates**: Wildcard Let's Encrypt certificate via Cloudflare DNS
- **No port conflicts**: Traefik routes by hostname, not port

### Usage

```bash
# Launch via DevPod (from your local machine)
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git \
  --provider ssh \
  --provider-option HOST=dev-server

# Container auto-registers with Traefik. Access URLs shown at startup:
#   Frontend: https://<username>.dev.simpleaccounts.io
#   Backend:  https://<username>-api.dev.simpleaccounts.io
#   Web IDE:  https://<username>-ide.dev.simpleaccounts.io
```

### User Management

```bash
# List active user containers
docker ps --filter "name=simpleaccounts" --format "table {{.Names}}\t{{.Status}}"

# Stop user environment (via DevPod)
devpod stop simpleaccounts-uae

# Delete user environment (via DevPod)
devpod delete simpleaccounts-uae
```

See [proxy/README.md](proxy/README.md) for Traefik proxy documentation.

---

## Files

| File                          | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `devcontainer.json`           | VS Code devcontainer configuration                       |
| `docker-compose.yml`          | Single-user container orchestration                      |
| `docker-compose.override.yml` | Local overrides (secrets, custom config) - not committed |
| `Dockerfile`                  | Container image definition                               |
| `init-db.sql`                 | PostgreSQL initialization script                         |
| `proxy/`                      | Multi-user setup with Traefik proxy                      |

## Volumes

### Persistent Data (Named Volumes)

Named Docker volumes (user-specific for isolation on shared hosts):

- `${USER}-postgres-data` - PostgreSQL database files
- `${USER}-redis-data` - Redis persistence
- `${USER}-vscode-extensions` - VS Code extensions
- `${USER}-maven-cache` - Maven dependencies (~/.m2)
- `${USER}-npm-cache` - npm cache (~/.npm)

> **Note**: Volume names include the username prefix via Docker Compose's `name:` property, ensuring isolation between users on shared Docker hosts.

### Credentials & Configuration (Host Bind Mounts)

Persisted to host directory `~/.devpod-mount/` for portability:

- `~/.devpod-mount/claude` → ~/.claude (Claude CLI)
- `~/.devpod-mount/gemini` → ~/.gemini (Gemini CLI)
- `~/.devpod-mount/codex` → ~/.codex (Codex CLI)
- `~/.devpod-mount/gh` → ~/.config/gh (GitHub CLI)
- `~/.devpod-mount/ssh` → ~/.ssh (SSH keys)
- `~/.devpod-mount/docker` → ~/.docker (Docker config)
- `~/.devpod-mount/kube` → ~/.kube (Kubernetes config)
- `~/.devpod-mount/aws` → ~/.aws (AWS credentials)
- `~/.devpod-mount/azure` → ~/.azure (Azure credentials)
- `~/.devpod-mount/gitconfig` → ~/.gitconfig_dir (Git config)
- `~/.devpod-mount/bash-history` → ~/.bash_history_dir (Bash history)
- `~/.devpod-mount/code-server` → ~/.config/code-server (Web IDE config)

## Local Overrides

For secrets and local customization, create `docker-compose.override.yml`:

```yaml
services:
  devcontainer:
    environment:
      - MY_SECRET_KEY=xxx
    volumes:
      - /path/to/local/secrets:/secrets:ro
```

This file is gitignored and won't be committed.

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
# PostgreSQL (uses internal hostname 'db')
pg_isready -h db -p 5432

# Redis (uses internal hostname 'redis')
redis-cli -h redis ping
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

### Multi-user: URL not accessible

Check Traefik is running and routing correctly:

```bash
# Check proxy is running
docker ps | grep dev-proxy

# Check your container is registered
docker logs dev-proxy 2>&1 | grep <your-username>
```
