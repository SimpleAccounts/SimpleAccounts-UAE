# Traefik Integration with Coder

This guide explains how to integrate your existing Traefik reverse proxy with Coder workspaces for custom domain routing (`*.dev.simpleaccounts.io`).

## Architecture

```
Internet
    │
    ├─ coder.dev.simpleaccounts.io      → Coder Server (port 3000)
    │
    ├─ alice-dev.dev.simpleaccounts.io  → Alice's workspace frontend (port 3000)
    ├─ alice-dev-api.dev.simpleaccounts.io → Alice's workspace backend (port 8080)
    │
    ├─ bob-prod.dev.simpleaccounts.io   → Bob's workspace frontend (port 3000)
    └─ bob-prod-api.dev.simpleaccounts.io → Bob's workspace backend (port 8080)
```

## Current Setup (DevPod)

Your existing Traefik setup uses:

- Traefik as a systemd service (`traefik-proxy`)
- Docker network: `dev-proxy-network`
- nip.io DNS for automatic resolution
- Container labels for routing

## Coder Integration

The Coder template (`.coder/template.tf`) already includes Traefik labels:

```hcl
# Frontend routing (port 3000)
labels {
  label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.rule"
  value = "Host(`${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}.dev.simpleaccounts.io`)"
}

# Backend routing (port 8080)
labels {
  label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.rule"
  value = "Host(`${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-api.dev.simpleaccounts.io`)"
}
```

## Traefik Configuration

### Option 1: Keep Existing Traefik Setup (Recommended)

Your existing Traefik is already configured! No changes needed.

**Ensure Traefik is connected to Coder's Docker network:**

```bash
# Check if Traefik can see Coder containers
docker network inspect dev-proxy-network | grep coder

# If not connected, update Traefik config to watch Coder containers
# (Usually automatic if using Docker provider)
```

### Option 2: Add Coder-Specific Configuration

If you want explicit configuration, add to Traefik config:

**.devcontainer/proxy/docker-compose.proxy.yml:**

```yaml
services:
  traefik:
    # ... existing config ...
    command:
      # ... existing commands ...
      - --providers.docker=true
      - --providers.docker.network=dev-proxy-network
      - --providers.docker.exposedByDefault=false
      # Watch containers with 'traefik.enable=true' label
```

## DNS Configuration

### Option 1: Wildcard DNS (Production)

Add DNS records for `*.dev.simpleaccounts.io`:

```
Type: A
Name: *.dev.simpleaccounts.io
Value: <your-server-ip>
TTL: 300
```

### Option 2: nip.io (Development)

Use nip.io for automatic DNS (no configuration needed):

**Update template to use nip.io:**

```hcl
# In template.tf, replace domain:
value = "Host(`${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}.65-108-51-136.nip.io`)"
```

Replace `65-108-51-136` with your server IP (dots replaced with dashes).

## SSL/HTTPS Support

### Let's Encrypt (Recommended)

Update Traefik to use Let's Encrypt for automatic HTTPS:

**docker-compose.proxy.yml:**

```yaml
services:
  traefik:
    command:
      # ... existing config ...
      - --certificatesresolvers.letsencrypt.acme.email=admin@simpleaccounts.io
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    volumes:
      - ./letsencrypt:/letsencrypt
```

**Update template labels:**

```hcl
labels {
  label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.tls"
  value = "true"
}

labels {
  label = "traefik.http.routers.${data.coder_workspace_owner.me.name}-${data.coder_workspace.me.name}-frontend.tls.certresolver"
  value = "letsencrypt"
}
```

## Verification

### Test Traefik Routing

```bash
# List Traefik routers
curl http://localhost:8090/api/http/routers | jq .

# Check specific workspace router
curl http://localhost:8090/api/http/routers | jq '.[] | select(.name | contains("alice-dev"))'

# Test frontend access
curl -H "Host: alice-dev.dev.simpleaccounts.io" http://localhost:3000

# Test backend access
curl -H "Host: alice-dev-api.dev.simpleaccounts.io" http://localhost:8080
```

### Debug Traefik

```bash
# Check Traefik logs
journalctl -u traefik-proxy -f

# Or if running via Docker
docker logs dev-proxy -f

# Check Docker network
docker network inspect dev-proxy-network

# Ensure workspace container is connected
docker inspect coder-alice-dev | grep -A 10 Networks
```

## Troubleshooting

### Workspace Not Accessible via Domain

**1. Check Traefik sees the container:**

```bash
# List all routers
curl http://localhost:8090/api/http/routers | jq 'keys'

# Should see entries like:
# "alice-dev-frontend@docker"
# "alice-dev-api@docker"
```

**2. Check container labels:**

```bash
# Inspect workspace container
docker inspect coder-alice-dev | grep -A 20 Labels

# Should see traefik.enable=true and router rules
```

**3. Check network connectivity:**

```bash
# Ensure container is on dev-proxy-network
docker network inspect dev-proxy-network | grep coder-alice-dev
```

**4. Test direct container access:**

```bash
# Get container IP
CONTAINER_IP=$(docker inspect coder-alice-dev | jq -r '.[0].NetworkSettings.Networks["dev-proxy-network"].IPAddress')

# Test frontend
curl http://$CONTAINER_IP:3000

# Test backend
curl http://$CONTAINER_IP:8080
```

### DNS Not Resolving

**For wildcard DNS:**

```bash
# Test DNS resolution
nslookup alice-dev.dev.simpleaccounts.io

# Should return your server IP
```

**For nip.io:**

```bash
# Test nip.io resolution
nslookup alice-dev.65-108-51-136.nip.io

# Should return 65.108.51.136
```

### HTTPS Certificate Errors

```bash
# Check Let's Encrypt status
cat /path/to/letsencrypt/acme.json | jq .

# Force certificate renewal
traefik... --certificatesresolvers.letsencrypt.acme.force-renew=true
```

## Migration from DevPod Traefik

Your existing Traefik setup is 100% compatible! Just:

1. ✅ **Keep Traefik running** (no changes needed)
2. ✅ **Deploy Coder template** (includes Traefik labels)
3. ✅ **Create workspaces** (auto-register with Traefik)
4. ✅ **Access via domains** (works immediately)

No configuration changes required! 🎉

## Custom Domains (Advanced)

If you want different domain patterns:

### Pattern 1: Subdomain per User

```
alice.dev.simpleaccounts.io → All Alice's workspaces
bob.dev.simpleaccounts.io   → All Bob's workspaces
```

**Update template:**

```hcl
value = "Host(`${data.coder_workspace_owner.me.name}.dev.simpleaccounts.io`) && PathPrefix(`/${data.coder_workspace.me.name}`)"
```

### Pattern 2: Environment-Based

```
dev.simpleaccounts.io  → Development workspaces
test.simpleaccounts.io → Testing workspaces
prod.simpleaccounts.io → Production workspaces
```

**Update template with parameter:**

```hcl
data "coder_parameter" "environment" {
  name    = "environment"
  type    = "string"
  options = ["dev", "test", "prod"]
  default = "dev"
}

# Use in routing
value = "Host(`${data.coder_workspace_owner.me.name}.${data.coder_parameter.environment.value}.simpleaccounts.io`)"
```

## Monitoring

### Traefik Dashboard

Access: `http://proxy.dev.simpleaccounts.io:8090`

**Features:**

- See all active routers
- Monitor request rates
- Check backend health
- View SSL certificates

### Metrics (Prometheus)

If using Prometheus, add Traefik metrics:

```yaml
services:
  traefik:
    command:
      - --metrics.prometheus=true
      - --metrics.prometheus.entrypoint=metrics
    ports:
      - '9090:9090' # Metrics endpoint
```

**Scrape config:**

```yaml
scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['localhost:9090']
```

## Summary

✅ **No changes needed** to your existing Traefik setup
✅ **Coder template includes** all necessary labels
✅ **Automatic routing** for all workspaces
✅ **Wildcard DNS** or nip.io supported
✅ **HTTPS** via Let's Encrypt (optional)

Your Traefik will automatically route traffic to Coder workspaces! 🚀
