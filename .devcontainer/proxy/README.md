# Multi-User Development Environment

This setup allows multiple developers to work on the same dev-server with isolated environments and shareable URLs.

## Stack

Each user environment includes:

| Component | Version | Description |
|-----------|---------|-------------|
| Devcontainer | Latest | Pre-configured development environment |
| PostgreSQL | **18** | Database server |
| Redis | 7 | Cache and session storage |
| Traefik | 3.0 | Reverse proxy for URL routing |

**Features:**
- **Zombie-free containers** - Uses `init: true` (tini) to prevent zombie process accumulation
- **Isolated databases** - Each user has their own PostgreSQL instance
- **Shareable URLs** - Access via `username.server-ip.nip.io`
- **Auto-shutdown** - Idle containers are automatically stopped after 30 minutes of inactivity

## Quick Start

### Step 1: Install Traefik (One-time, on the dev server)

```bash
# Install Traefik as a system service (runs on boot)
sudo ./install-traefik-service.sh
```

This installs Traefik as a systemd service that:
- Starts automatically on server boot
- Runs continuously in the background
- Routes traffic to all user dev containers

### Step 2: Setup Your Environment

```bash
./setup-user.sh <your-username>

# Example:
./setup-user.sh alice
```

The script will:

1. Create your isolated environment (devcontainer + database + redis)
2. Register with Traefik for routing
3. Print your access URLs

## Architecture

```
                              Dev Server
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────┐                                         │
│  │  Traefik Proxy  │ ← Port 80 (shared)                      │
│  │   (dev-proxy)   │                                         │
│  └────────┬────────┘                                         │
│           │                                                  │
│     ┌─────┴─────┬─────────────┐                              │
│     │           │             │                              │
│     ▼           ▼             ▼                              │
│  ┌──────┐   ┌──────┐     ┌──────┐                            │
│  │alice │   │ bob  │     │carol │  ← User Containers         │
│  │:3000 │   │:3000 │     │:3000 │                            │
│  │:8080 │   │:8080 │     │:8080 │                            │
│  └──────┘   └──────┘     └──────┘                            │
│      │           │             │                             │
│  ┌──────┐   ┌──────┐     ┌──────┐                            │
│  │ DB   │   │ DB   │     │ DB   │  ← Isolated Databases      │
│  │Redis │   │Redis │     │Redis │                            │
│  └──────┘   └──────┘     └──────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Access URLs

After running `./setup-user.sh alice`, you get two URL options:

### Option A: nip.io (Recommended - No DNS Config!)

| Service   | URL                                    |
| --------- | -------------------------------------- |
| Frontend  | `http://alice.192-168-1-100.nip.io`    |
| Backend   | `http://alice-api.192-168-1-100.nip.io`|
| Dashboard | `http://proxy.192-168-1-100.nip.io:8090` |

**How nip.io works**: It's a free DNS service that resolves based on the IP in the domain name. No configuration needed!

### Option B: Local Domain (Requires /etc/hosts)

| Service  | URL                                      |
| -------- | ---------------------------------------- |
| Frontend | `http://alice.dev.simpleaccounts.local`  |
| Backend  | `http://alice-api.dev.simpleaccounts.local` |

Add to `/etc/hosts`:

```
192.168.1.100  alice.dev.simpleaccounts.local
192.168.1.100  alice-api.dev.simpleaccounts.local
```

## User Management

### Add New User

```bash
./setup-user.sh <username>
```

### List Active Users

```bash
docker ps --filter "name=dev-" --format "table {{.Names}}\t{{.Status}}"
```

### Stop User Environment

```bash
docker compose -f docker-compose.<username>.yml down
```

### Remove User Environment (with data)

```bash
docker compose -f docker-compose.<username>.yml down -v
rm docker-compose.<username>.yml
```

### View User Logs

```bash
docker logs dev-<username>
docker logs db-<username>
```

## Connecting VS Code

### Method 1: Attach to Running Container

1. Open VS Code
2. Install "Dev Containers" extension
3. `Cmd+Shift+P` > "Dev Containers: Attach to Running Container"
4. Select `dev-<your-username>`

### Method 2: SSH + Remote Extension

```bash
# SSH into container
docker exec -it dev-<username> bash

# Inside container, start code-server if needed
code-server --bind-addr 0.0.0.0:8443
```

## Sharing URLs

Users can share their development URLs with others:

### Same Network

Just share the URL:

```
http://alice.192-168-1-100.nip.io
```

### Different Network (External Access)

Use ngrok or similar:

```bash
ngrok http alice.192-168-1-100.nip.io:80
```

## DNS Options

### Option 1: nip.io (Zero Config)

No setup needed! URLs like `alice.192-168-1-100.nip.io` automatically resolve.

**Pros**: Works immediately, no configuration
**Cons**: Requires internet for DNS lookup

### Option 2: /etc/hosts (Manual)

Edit `/etc/hosts` on each client machine:

```bash
# Mac/Linux
sudo nano /etc/hosts

# Add entries
192.168.1.100  alice.dev.simpleaccounts.local
192.168.1.100  alice-api.dev.simpleaccounts.local
```

**Pros**: Works offline
**Cons**: Manual update on each machine

### Option 3: dnsmasq (Automatic Wildcard)

Install dnsmasq on the dev server:

```bash
# Install
sudo apt install dnsmasq

# Configure wildcard
echo "address=/.dev.simpleaccounts.local/192.168.1.100" | sudo tee /etc/dnsmasq.d/dev-server.conf

# Restart
sudo systemctl restart dnsmasq
```

Then point client DNS to the dev server.

**Pros**: Automatic for all subdomains
**Cons**: Requires server configuration

### Generate /etc/hosts Entries

```bash
./generate-hosts.sh 192.168.1.100

# Output:
# 192.168.1.100  proxy.dev.simpleaccounts.local
# 192.168.1.100  alice.dev.simpleaccounts.local
# 192.168.1.100  alice-api.dev.simpleaccounts.local
```

## Traefik Service Management

Once installed via `install-traefik-service.sh`, manage Traefik with:

```bash
# Check status
sudo systemctl status traefik-proxy

# View logs
journalctl -u traefik-proxy -f

# Restart
sudo systemctl restart traefik-proxy

# Stop
sudo systemctl stop traefik-proxy

# Start
sudo systemctl start traefik-proxy

# Uninstall completely
sudo ./uninstall-traefik-service.sh
```

## Files

| File                           | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `docker-compose.proxy.yml`     | Traefik reverse proxy configuration  |
| `docker-compose.user.yml`      | Template for user environments       |
| `docker-compose.<user>.yml`    | Generated user-specific config       |
| `setup-user.sh`                | User setup script                    |
| `generate-hosts.sh`            | DNS helper for /etc/hosts            |
| `idle-shutdown.sh`             | Auto-shutdown idle containers        |
| `install-traefik-service.sh`   | Install Traefik as systemd service   |
| `uninstall-traefik-service.sh` | Remove Traefik systemd service       |
| `traefik.service`              | Systemd unit file                    |

## How It Works

### Traefik Labels

Each user container registers with Traefik using Docker labels:

```yaml
labels:
  - 'traefik.enable=true'
  - 'traefik.http.routers.alice-frontend.rule=Host(`alice.192-168-1-100.nip.io`)'
  - 'traefik.http.services.alice-frontend.loadbalancer.server.port=3000'
```

Traefik automatically discovers containers and routes traffic based on hostname.

### Network Isolation

Each user has their own internal network:

```yaml
networks:
  dev-proxy-network:  # Shared - for Traefik routing
    external: true
  alice-internal:     # Private - user's services only
    name: alice-internal
```

### Volume Isolation

Each user has isolated data volumes:

```yaml
volumes:
  alice-postgres-data:   # User's database
  alice-redis-data:      # User's cache
  alice-maven-cache:     # User's Maven dependencies
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs dev-<username>

# Check if proxy is running
docker ps | grep dev-proxy

# Restart proxy if needed
docker compose -f docker-compose.proxy.yml restart
```

### URL Not Accessible

```bash
# Check Traefik routing
curl http://localhost:8090/api/http/routers

# Check container labels
docker inspect dev-<username> | grep -A 20 "Labels"

# View proxy logs
docker logs dev-proxy
```

### Port 80 Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop nginx  # or apache2

# Or change Traefik port in docker-compose.proxy.yml
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

### Reset User Environment

```bash
# Stop and remove containers + volumes
docker compose -f docker-compose.<username>.yml down -v

# Remove compose file
rm docker-compose.<username>.yml

# Setup fresh
./setup-user.sh <username>
```

## Advanced Configuration

### Custom Environment Variables

Edit the generated `docker-compose.<username>.yml`:

```yaml
services:
  devcontainer:
    environment:
      - MY_CUSTOM_VAR=value
      - DEBUG=true
```

Then restart:

```bash
docker compose -f docker-compose.<username>.yml up -d
```

### Resource Limits

Add resource constraints:

```yaml
services:
  devcontainer:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### HTTPS (Self-Signed)

Traefik can be configured for HTTPS. Edit `docker-compose.proxy.yml`:

```yaml
command:
  - '--entrypoints.websecure.address=:443'
  - '--certificatesresolvers.myresolver.acme.tlschallenge=true'
```

## Auto-Shutdown (Idle Timeout)

To conserve server resources, containers are automatically stopped after 30 minutes of inactivity.

### What counts as activity?

- Running development processes (node, java, npm, mvn, vite, webpack, etc.)
- Recent file modifications in the workspace (within last 5 minutes)

### How it works

A cron job runs every 5 minutes and checks each container:

```bash
# Check runs every 5 minutes
*/5 * * * * /home/mohsin/idle-shutdown.sh 30
```

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

If your container was stopped due to inactivity, simply restart it:

```bash
cd .devcontainer/proxy
docker compose -f docker-compose.<username>.yml start
```

Or run the full setup again:

```bash
./setup-user.sh <username>
```

### Disable auto-shutdown for a user

To keep a container running indefinitely, add a marker file:

```bash
docker exec dev-<username> touch /tmp/.keep-alive
```

Then modify the idle-shutdown.sh script to check for this file.

## Comparison with DevPod Setup

| Aspect           | DevPod (Single-User)       | Traefik (Multi-User)          |
| ---------------- | -------------------------- | ----------------------------- |
| **Isolation**    | Shared volumes             | Isolated per user             |
| **URLs**         | `localhost:3000`           | `alice.192-168-1-100.nip.io`  |
| **Port Conflicts** | Yes, if multiple users   | No, Traefik handles routing   |
| **Shareable**    | No (localhost only)        | Yes, anyone can access        |
| **Setup**        | `devpod up ...`            | `./setup-user.sh <name>`      |
| **IDE Support**  | VS Code, Cursor, JetBrains | VS Code (attach to container) |
| **Best For**     | Local dev, solo work       | Team collaboration            |

**When to use which:**
- **DevPod**: You're working locally or need full IDE integration
- **Traefik Multi-User**: Multiple developers sharing a remote server, need shareable URLs

See [DevPod Setup Guide](../../docs/DEVPOD_SETUP.md) for single-user setup instructions.
