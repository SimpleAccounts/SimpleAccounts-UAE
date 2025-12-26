# Multi-User Development Environment

This setup allows multiple developers to work on the same dev-server with isolated environments and shareable URLs.

## Architecture

```
                              Dev Server
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────┐                                         │
│  │  Traefik Proxy  │ ← Port 80/443                           │
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

## Quick Start

### 1. Start the Proxy (Admin - One Time)

```bash
cd .devcontainer/proxy
docker compose -f docker-compose.proxy.yml up -d
```

### 2. Setup Your User Environment

```bash
cd .devcontainer/proxy
./setup-user.sh <your-username>

# Example:
./setup-user.sh alice
```

### 3. Configure DNS

Add to your `/etc/hosts` (or use local DNS):

```
# Dev Server IP (replace with actual IP)
192.168.1.100  alice.dev.simpleaccounts.local
192.168.1.100  alice-api.dev.simpleaccounts.local
192.168.1.100  proxy.dev.simpleaccounts.local
```

Or use a wildcard DNS service like:
- **dnsmasq** (local)
- **nip.io** (internet-based): `alice.192.168.1.100.nip.io`

### 4. Access Your Environment

| URL | Service |
|-----|---------|
| `http://alice.dev.simpleaccounts.local` | Frontend (Vite) |
| `http://alice-api.dev.simpleaccounts.local` | Backend (Spring Boot) |
| `http://proxy.dev.simpleaccounts.local` | Traefik Dashboard |

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

## Sharing URLs

Users can share their development URLs with others:

1. **Same Network**: Just share the URL
   ```
   http://alice.dev.simpleaccounts.local
   ```

2. **Different Network**: Use ngrok or similar
   ```bash
   ngrok http alice.dev.simpleaccounts.local:80
   ```

## DNS Options

### Option 1: /etc/hosts (Manual)

Edit `/etc/hosts` on each client machine:
```
192.168.1.100  alice.dev.simpleaccounts.local
192.168.1.100  alice-api.dev.simpleaccounts.local
```

### Option 2: dnsmasq (Automatic Wildcard)

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

### Option 3: nip.io (No Config Needed)

Use IP-based domains:
```
http://alice.192-168-1-100.nip.io
http://alice-api.192-168-1-100.nip.io
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs dev-<username>

# Check if proxy is running
docker ps | grep dev-proxy
```

### URL not accessible
```bash
# Check Traefik routing
curl http://proxy.dev.simpleaccounts.local/api/http/routers

# Check container labels
docker inspect dev-<username> | grep traefik
```

### Port conflicts
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service or change Traefik port
```

## Files

| File | Purpose |
|------|---------|
| `docker-compose.proxy.yml` | Traefik reverse proxy |
| `docker-compose.user.yml` | Template for user environments |
| `docker-compose.<user>.yml` | Generated user-specific config |
| `setup-user.sh` | User setup script |
