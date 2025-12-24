# DevContainer Configuration

This directory contains the development container configuration for SimpleAccounts UAE.

## Architecture Overview

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

## Network Mode: Shared Namespace

All services use `network_mode: service:db`, which means they share the PostgreSQL container's network namespace.

### What This Means

| Aspect          | Behavior                                               |
| --------------- | ------------------------------------------------------ |
| **Hostname**    | All containers share the hostname `simpleaccounts-dev` |
| **IP Address**  | All containers share the same network interfaces       |
| **Port Access** | Services communicate via `localhost`                   |

### Service Connectivity

| Service    | Access From DevContainer |
| ---------- | ------------------------ |
| PostgreSQL | `localhost:5432`         |
| Redis      | `localhost:6379`         |

### Why This Design?

1. **Simplicity**: No DNS resolution or service discovery needed
2. **Localhost Access**: Applications connect to `localhost` just like local development
3. **Consistency**: Same connection strings work locally and in the container
4. **Performance**: No network overlay overhead

### Trade-offs

| Benefit                      | Consideration                              |
| ---------------------------- | ------------------------------------------ |
| Simple `localhost` access    | All containers share one hostname          |
| No DNS configuration         | Cannot run multiple instances of same port |
| Familiar development pattern | Debugging network issues can be confusing  |

## Files

| File                          | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `devcontainer.json`           | VS Code devcontainer configuration                       |
| `docker-compose.yml`          | Container orchestration and networking                   |
| `docker-compose.override.yml` | Local overrides (secrets, custom config) - not committed |
| `Dockerfile`                  | Container image definition                               |
| `init-db.sql`                 | PostgreSQL initialization script                         |

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
