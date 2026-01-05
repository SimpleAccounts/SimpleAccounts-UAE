# Coder Server Deployment Guide

This document describes how to deploy and configure the Coder server for SimpleAccounts-UAE.

## Prerequisites

- Docker and Docker Compose installed
- Domain: `coder.dev.simpleaccounts.io`
- Wildcard DNS: `*.apps.coder.dev.simpleaccounts.io` → server IP
- GitHub OAuth App credentials

## Server Configuration

### 1. Docker Compose Setup

Create `/home/mohsin/coder/docker-compose.yaml`:

```yaml
services:
  database:
    image: postgres:17
    container_name: coder-database-1
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - coder_coder_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - coder_network

  coder:
    image: ghcr.io/coder/coder:latest
    container_name: coder-coder-1
    depends_on:
      database:
        condition: service_healthy
    environment:
      CODER_PG_CONNECTION_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database/${POSTGRES_DB}?sslmode=disable
      CODER_HTTP_ADDRESS: 0.0.0.0:7080
      CODER_ACCESS_URL: ${CODER_ACCESS_URL}
      CODER_WILDCARD_ACCESS_URL: ${CODER_WILDCARD_ACCESS_URL}
      CODER_OAUTH2_GITHUB_CLIENT_ID: ${CODER_OAUTH2_GITHUB_CLIENT_ID}
      CODER_OAUTH2_GITHUB_CLIENT_SECRET: ${CODER_OAUTH2_GITHUB_CLIENT_SECRET}
      CODER_OAUTH2_GITHUB_ALLOWED_ORGS: SimpleAccounts
      CODER_OAUTH2_GITHUB_ALLOW_SIGNUPS: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    # CRITICAL: Add docker group (988) so Terraform can provision workspaces
    group_add:
      - '988'
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.coder.rule=Host(`coder.dev.simpleaccounts.io`)'
      - 'traefik.http.routers.coder.entrypoints=websecure'
      - 'traefik.http.routers.coder.tls.certresolver=letsencrypt'
      - 'traefik.http.services.coder.loadbalancer.server.port=7080'
      # Wildcard apps routing
      - 'traefik.http.routers.coder-apps.rule=HostRegexp(`{subdomain:[a-z0-9-]+}.apps.coder.dev.simpleaccounts.io`)'
      - 'traefik.http.routers.coder-apps.entrypoints=websecure'
      - 'traefik.http.routers.coder-apps.tls.certresolver=letsencrypt'
      - 'traefik.http.routers.coder-apps.tls.domains[0].main=apps.coder.dev.simpleaccounts.io'
      - 'traefik.http.routers.coder-apps.tls.domains[0].sans=*.apps.coder.dev.simpleaccounts.io'
    restart: unless-stopped
    networks:
      - coder_network
      - dev-proxy-network

networks:
  coder_network:
    name: coder_network
  dev-proxy-network:
    external: true

volumes:
  coder_coder_data:
    external: true
```

### 2. Environment Variables

Create `/home/mohsin/coder/.env`:

```env
CODER_ACCESS_URL=https://coder.dev.simpleaccounts.io
CODER_WILDCARD_ACCESS_URL=*.apps.coder.dev.simpleaccounts.io
POSTGRES_USER=coder
POSTGRES_PASSWORD=coder_secure_password_123
POSTGRES_DB=coder
CODER_OAUTH2_GITHUB_CLIENT_ID=<your-github-oauth-client-id>
CODER_OAUTH2_GITHUB_CLIENT_SECRET=<your-github-oauth-client-secret>
```

### 3. Important Configuration Notes

#### Docker Socket Access

The `group_add: ["988"]` setting is **CRITICAL**. It adds the docker group to the Coder container so Terraform's Docker provider can provision workspaces. Without this, workspace creation will fail with:

```
Error: permission denied while trying to connect to the Docker daemon socket
```

#### Wildcard Access URL

The `CODER_WILDCARD_ACCESS_URL` enables subdomain-based workspace applications. Without this, apps with `subdomain = true` will show a warning and won't be accessible.

## Deployment Steps

1. **Create directory structure**:

   ```bash
   mkdir -p /home/mohsin/coder
   cd /home/mohsin/coder
   ```

2. **Copy configuration files** (docker-compose.yaml and .env)

3. **Create database volume** (if first time):

   ```bash
   docker volume create coder_coder_data
   ```

4. **Start Coder**:

   ```bash
   docker compose up -d
   ```

5. **Verify**:
   ```bash
   docker compose logs -f coder
   ```

## Updating Coder

To update to the latest Coder version:

```bash
cd /home/mohsin/coder
docker compose pull
docker compose up -d
```

## Troubleshooting

### Workspace Creation Fails with Docker Permission Error

**Symptom**: `Error: permission denied while trying to connect to the Docker daemon socket`

**Solution**: Ensure `group_add: ["988"]` is in docker-compose.yaml

**Verify**:

```bash
docker exec coder-coder-1 id
# Should show: groups=988,1000(coder)
```

### Subdomain Apps Show Warning

**Symptom**: "One or more apps in this workspace have subdomain = true, but subdomain applications are not configured"

**Solution**: Ensure `CODER_WILDCARD_ACCESS_URL` is set in .env and DNS wildcard is configured

**Verify**:

```bash
docker exec coder-coder-1 env | grep WILDCARD
# Should show: CODER_WILDCARD_ACCESS_URL=*.apps.coder.dev.simpleaccounts.io

dig +short test.apps.coder.dev.simpleaccounts.io
# Should return server IP
```

## Template Deployment

The workspace template is automatically deployed via GitHub Actions when changes are pushed to `develop` or `main` branches. See `.github/workflows/coder-template-push.yml`.

## Backup

The Coder database is stored in the `coder_coder_data` Docker volume. To backup:

```bash
docker run --rm \
  -v coder_coder_data:/source \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/coder-backup-$(date +%Y%m%d).tar.gz -C /source .
```

## Restore

To restore from backup:

```bash
docker volume create coder_coder_data
docker run --rm \
  -v coder_coder_data:/target \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/coder-backup-YYYYMMDD.tar.gz -C /target
```
