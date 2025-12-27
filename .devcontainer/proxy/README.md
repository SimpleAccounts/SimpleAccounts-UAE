# Multi-User Development Environment

This setup allows multiple developers to work on the same dev-server with isolated environments and shareable URLs.

## Stack

Each user environment includes:

| Component    | Version  | Description                          |
| ------------ | -------- | ------------------------------------ |
| Devcontainer | Latest   | Pre-configured development environment |
| PostgreSQL   | **18**   | Database server                      |
| Redis        | 7        | Cache and session storage            |
| Traefik      | 2.11     | Reverse proxy for URL routing        |

**Features:**

- **Zombie-free containers** - Uses `init: true` (tini) to prevent zombie process accumulation
- **Isolated databases** - Each user has their own PostgreSQL instance
- **Shareable URLs** - Access via `username.server-ip.nip.io`
- **Auto-shutdown** - Idle containers are automatically stopped after 30 minutes of inactivity
- **DevPod Integration** - Works seamlessly with DevPod for IDE integration

## Quick Start

### Step 1: Install Traefik (One-time, Admin only)

```bash
# SSH to dev-server as admin
ssh dev-server

# Install Traefik as a system service
cd /path/to/SimpleAccounts-UAE/.devcontainer/proxy
sudo ./install-traefik-service.sh
```

This installs Traefik as a systemd service that:

- Starts automatically on server boot
- Runs continuously in the background
- Routes traffic to all user dev containers

### Step 2: Launch Your Environment

**Option A: Using DevPod (Recommended)**

```bash
# From your local machine
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git \
  --provider ssh \
  --provider-option HOST=dev-server \
  --ide vscode
```

DevPod will:

1. Clone the repo to your home directory on dev-server
2. Start isolated containers (devcontainer + db + redis)
3. Auto-connect to Traefik for shareable URLs
4. Open VS Code connected to the container


## Architecture

```
                    Your Local Machine
                          │
                    DevPod / VS Code
                          │
                          ▼
                       Dev Server
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────┐                                            │
│  │  Traefik Proxy  │ ← Port 80 (shared)                         │
│  │   (dev-proxy)   │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│     ┌─────┴─────┬─────────────┐                                 │
│     │           │             │                                 │
│     ▼           ▼             ▼                                 │
│  ┌──────┐   ┌──────┐     ┌──────┐                               │
│  │alice │   │ bob  │     │carol │  ← User Containers            │
│  │:3000 │   │:3000 │     │:3000 │    (via DevPod)               │
│  │:8080 │   │:8080 │     │:8080 │                               │
│  └──────┘   └──────┘     └──────┘                               │
│      │           │             │                                │
│  ┌──────┐   ┌──────┐     ┌──────┐                               │
│  │ DB   │   │ DB   │     │ DB   │  ← Isolated Databases         │
│  │Redis │   │Redis │     │Redis │                               │
│  └──────┘   └──────┘     └──────┘                               │
│                                                                 │
│  /home/alice/...     /home/bob/...    /home/carol/...           │
│  (own workspace)     (own workspace)  (own workspace)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## How It Works

### DevPod + Traefik Integration

1. **User runs DevPod** → Clones repo to their home directory
2. **Docker Compose starts** → Creates user-specific containers with Traefik labels
3. **Post-start script runs** → Detects Traefik and connects container to `dev-proxy-network`
4. **Traefik discovers container** → Routes traffic based on hostname labels
5. **User gets shareable URLs** → `http://username.server-ip.nip.io`

### What Each User Gets

| Resource          | Naming Convention          | Isolated? |
| ----------------- | -------------------------- | --------- |
| Workspace         | `/home/<user>/.devpod/...` | ✅ Yes    |
| Devcontainer      | `dev-<username>`           | ✅ Yes    |
| PostgreSQL        | `db-<username>`            | ✅ Yes    |
| Redis             | `redis-<username>`         | ✅ Yes    |
| Volumes           | `<username>-postgres-data` | ✅ Yes    |
| Network           | `<username>-internal`      | ✅ Yes    |
| Traefik Routes    | `<username>.*`             | ✅ Yes    |

## Access URLs

After starting your environment, you get shareable URLs:

| Service   | URL                                        |
| --------- | ------------------------------------------ |
| Frontend  | `http://<username>.<server-ip>.nip.io`     |
| Backend   | `http://<username>-api.<server-ip>.nip.io` |
| Web IDE   | `http://<username>-ide.<server-ip>.nip.io` |
| Dashboard | `http://proxy.<server-ip>.nip.io:8090`     |

**Example for user `alice` on server `65.108.51.136`:**

- Frontend: `http://alice.65-108-51-136.nip.io`
- Backend: `http://alice-api.65-108-51-136.nip.io`
- Web IDE: `http://alice-ide.65-108-51-136.nip.io`

**How nip.io works**: It's a free DNS service that resolves based on the IP in the domain name. No configuration needed!

## User Management

### Add New User (Admin)

```bash
# Create Linux user on dev-server
sudo adduser newuser
sudo usermod -aG docker newuser

# User can now run DevPod
```

### List Active Environments

```bash
docker ps --filter "name=dev-" --format "table {{.Names}}\t{{.Status}}"
```

### Stop User Environment

```bash
# User stops their own environment
devpod stop simpleaccounts-uae

# Or manually
docker compose -f docker-compose.yml down
```

### Remove User Environment (with data)

```bash
devpod delete simpleaccounts-uae

# Or manually with volumes
docker compose -f docker-compose.yml down -v
```

## Traefik Service Management

```bash
# Check status
sudo systemctl status traefik-proxy

# View logs
journalctl -u traefik-proxy -f

# Restart
sudo systemctl restart traefik-proxy

# Stop
sudo systemctl stop traefik-proxy

# Uninstall
sudo ./uninstall-traefik-service.sh
```

## Files

| File                           | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `docker-compose.proxy.yml`     | Traefik reverse proxy configuration  |
| `install-traefik-service.sh`   | Install Traefik as systemd service   |
| `uninstall-traefik-service.sh` | Remove Traefik systemd service       |
| `traefik.service`              | Systemd unit file                    |
| `idle-shutdown.sh`             | Auto-shutdown idle containers        |

## Troubleshooting

### Container Not Getting Traefik URLs

```bash
# Check if connected to Traefik network
docker network inspect dev-proxy-network | grep dev-<username>

# Manually connect if needed
docker network connect dev-proxy-network dev-<username>

# Verify Traefik sees your container
curl http://localhost:8090/api/http/routers | grep <username>
```

### Port 80 Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop nginx  # or apache2
```

### Database Connection Issues

```bash
# Check database is running
docker ps | grep db-<username>

# View database logs
docker logs db-<username>

# Connect manually
docker exec -it db-<username> psql -U simpleaccounts -d simpleaccounts
```

## Auto-Shutdown (Idle Timeout)

To conserve server resources, containers are automatically stopped after 30 minutes of inactivity.

### What counts as activity?

- Running development processes (node, java, npm, mvn, vite, webpack, etc.)
- Recent file modifications in the workspace (within last 5 minutes)

### Manual commands

```bash
# Check status without stopping (dry-run)
./idle-shutdown.sh --dry-run

# Use custom timeout (60 minutes)
./idle-shutdown.sh 60

# View shutdown logs
tail -f /var/log/idle-shutdown.log
```

### Restart after shutdown

```bash
# Using DevPod
devpod up simpleaccounts-uae

# Or manually
docker compose -f docker-compose.yml up -d
```
