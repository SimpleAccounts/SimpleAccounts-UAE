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
cd .devcontainer/proxy
./setup-user.sh <your-username>

# Then attach VS Code:
# Cmd+Shift+P > "Dev Containers: Attach to Running Container"
# Select: dev-<your-username>
```

---

## Choose Your Setup

| Setup | Best For | Access URLs |
|-------|----------|-------------|
| **Single User** | Local development, one developer | `localhost:3000`, `localhost:8080` |
| **Multi-User** | Shared dev server, team collaboration | `alice.192-168-1-100.nip.io` |

---

## Single-User Setup (Default)

Uses `.devcontainer/docker-compose.yml` and `devcontainer.json`.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Network Namespace                  │
│                   (hostname: simpleaccounts-dev)             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ devcontainer │  │      db      │  │    redis     │       │
│  │              │  │  (postgres)  │  │              │       │
│  │ localhost:   │  │ localhost:   │  │ localhost:   │       │
│  │   5432 ─────────► 5432        │  │   6379 ◄─────────────│
│  │   6379 ◄────────────────────────────► 6379      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Service Connectivity

| Service    | Access From DevContainer |
| ---------- | ------------------------ |
| PostgreSQL | `localhost:5432`         |
| Redis      | `localhost:6379`         |
| Frontend   | `localhost:3000`         |
| Backend    | `localhost:8080`         |

### Why Shared Network Namespace?

1. **Simplicity**: No DNS resolution or service discovery needed
2. **Localhost Access**: Applications connect to `localhost` just like local development
3. **Consistency**: Same connection strings work locally and in the container
4. **Performance**: No network overlay overhead

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
- **Shareable URLs**: Share `http://alice.192-168-1-100.nip.io` with teammates
- **No port conflicts**: Traefik routes by hostname, not port
- **Zero DNS config**: Uses nip.io for automatic DNS resolution

### Usage

```bash
# Setup your environment (auto-starts proxy if needed)
cd .devcontainer/proxy
./setup-user.sh alice

# Access URLs printed after setup:
#   Frontend: http://alice.192-168-1-100.nip.io
#   Backend:  http://alice-api.192-168-1-100.nip.io
```

### User Management

```bash
# Add new user
./setup-user.sh bob

# List active users
docker ps --filter "name=dev-" --format "table {{.Names}}\t{{.Status}}"

# Stop user environment
docker compose -f docker-compose.alice.yml down

# Remove user environment (with data)
docker compose -f docker-compose.alice.yml down -v
```

See [proxy/README.md](proxy/README.md) for full documentation.

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

### Persistent Data

- `postgres-data` - PostgreSQL database files
- `redis-data` - Redis persistence

### Developer Tool Caches (Survives Rebuilds)

- `devcontainer-vscode-extensions` - VS Code extensions
- `devcontainer-maven-cache` - Maven dependencies (~/.m2)
- `devcontainer-npm-cache` - npm cache (~/.npm)

### Credentials & Configuration (Survives Rebuilds)

- `devcontainer-claude-config` - Claude CLI credentials (~/.claude)
- `devcontainer-gemini-config` - Gemini CLI config (~/.gemini)
- `devcontainer-codex-config` - Codex CLI config (~/.codex)
- `devcontainer-gh-config` - GitHub CLI auth (~/.config/gh)
- `devcontainer-ssh` - SSH keys (~/.ssh)
- `devcontainer-docker` - Docker config (~/.docker)
- `devcontainer-kube` - Kubernetes config (~/.kube)
- `devcontainer-aws` - AWS credentials (~/.aws)
- `devcontainer-azure` - Azure credentials (~/.azure)
- `devcontainer-gitconfig` - Git configuration (~/.gitconfig)
- `devcontainer-bash-history` - Bash history

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

### Check Hostname

```bash
hostname
# Output: simpleaccounts-dev
```

### Verify Network Connectivity

```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli ping
```

### View Container Logs

```bash
docker compose logs -f db
docker compose logs -f redis
```

## Troubleshooting

### "Connection refused" to localhost:5432

The db container may not be ready. Check health:

```bash
docker compose ps
docker compose logs db
```

### Hostname shows random ID instead of simpleaccounts-dev

The container needs to be rebuilt to pick up the hostname change:

```bash
docker compose down
docker compose up -d
```

### Credentials lost after rebuild

Credentials are stored in named volumes and should persist. Check volume exists:

```bash
docker volume ls | grep devcontainer-claude-config
```

### Multi-user: URL not accessible

Check Traefik is running and routing correctly:

```bash
# Check proxy is running
docker ps | grep dev-proxy

# Check your container is registered
docker logs dev-proxy 2>&1 | grep <your-username>
```
