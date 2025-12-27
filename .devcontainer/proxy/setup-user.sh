#!/bin/bash
# =============================================================================
# Setup script for multi-user development environment
# =============================================================================
# Usage: ./setup-user.sh <username>
# Example: ./setup-user.sh alice
# =============================================================================

set -e

USERNAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Detect server IP (for nip.io URLs)
get_server_ip() {
    # Try to get the main IP address
    if command -v hostname &> /dev/null; then
        IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    if [ -z "$IP" ]; then
        # Fallback: get IP from default route interface
        IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
    fi

    if [ -z "$IP" ]; then
        # Fallback for Mac
        IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
    fi

    echo "${IP:-127.0.0.1}"
}

# Validate username
if [ -z "$USERNAME" ]; then
    print_error "Usage: $0 <username>"
    echo "Example: $0 alice"
    exit 1
fi

# Validate username format (lowercase, alphanumeric, hyphens)
if [[ ! "$USERNAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    print_error "Username must be lowercase, start with a letter, and contain only letters, numbers, and hyphens"
    exit 1
fi

print_header "Setting up dev environment for: $USERNAME"

# Get server IP for nip.io
SERVER_IP=$(get_server_ip)
NIP_IP=$(echo "$SERVER_IP" | tr '.' '-')

print_success "Detected server IP: $SERVER_IP"

# Check if proxy network exists
if ! docker network ls | grep -q "dev-proxy-network"; then
    print_warning "Proxy network not found. Starting proxy first..."
    docker compose -f "$SCRIPT_DIR/docker-compose.proxy.yml" up -d
    sleep 3
    print_success "Proxy started"
else
    print_success "Proxy network exists"
fi

# Create user-specific compose file
USER_COMPOSE="$SCRIPT_DIR/docker-compose.$USERNAME.yml"

if [ -f "$USER_COMPOSE" ]; then
    print_warning "Compose file already exists: $USER_COMPOSE"
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing file. Starting containers..."
        docker compose -f "$USER_COMPOSE" up -d
        exit 0
    fi
fi

# Generate user-specific compose file with BOTH domain options
cat > "$USER_COMPOSE" << EOF
# =============================================================================
# Development Container for: $USERNAME
# Generated: $(date)
# =============================================================================
#
# Access URLs (no DNS config needed - use nip.io):
#   Frontend: http://$USERNAME.$NIP_IP.nip.io
#   Backend:  http://$USERNAME-api.$NIP_IP.nip.io
#
# Alternative URLs (requires /etc/hosts entry):
#   Frontend: http://$USERNAME.dev.simpleaccounts.local
#   Backend:  http://$USERNAME-api.dev.simpleaccounts.local
#
# =============================================================================

services:
  devcontainer:
    image: ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
    container_name: dev-$USERNAME
    init: true  # Use tini as PID 1 to properly reap zombie processes

    volumes:
      - ../../:/workspaces/SimpleAccounts-UAE:cached
      - $USERNAME-vscode-extensions:/home/vscode/.vscode-server/extensions
      - $USERNAME-maven-cache:/home/vscode/.m2
      - $USERNAME-npm-cache:/home/vscode/.npm
      - \${HOME}/.devpod-mount/claude:/home/vscode/.claude
      - \${HOME}/.devpod-mount/gh:/home/vscode/.config/gh
      - \${HOME}/.devpod-mount/gitconfig:/home/vscode/.gitconfig_dir
      - \${HOME}/.devpod-mount/ssh:/home/vscode/.ssh

    environment:
      - USER_NAME=$USERNAME
      - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
      - PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
      - MAVEN_OPTS=-Xmx2g -XX:+UseG1GC -XX:+UseStringDeduplication
      - JAVA_TOOL_OPTIONS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0
      - NODE_OPTIONS=--max-old-space-size=4096
      - HISTFILE=/home/vscode/.bash_history_dir/bash_history
      - GIT_CONFIG_GLOBAL=/home/vscode/.gitconfig_dir/gitconfig

    command: sleep infinity

    networks:
      - dev-proxy-network
      - $USERNAME-internal

    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

    labels:
      - "traefik.enable=true"

      # Frontend - nip.io (no DNS needed)
      - "traefik.http.routers.$USERNAME-frontend-nip.rule=Host(\`$USERNAME.$NIP_IP.nip.io\`)"
      - "traefik.http.routers.$USERNAME-frontend-nip.entrypoints=web"
      - "traefik.http.routers.$USERNAME-frontend-nip.service=$USERNAME-frontend"

      # Frontend - local domain (requires /etc/hosts)
      - "traefik.http.routers.$USERNAME-frontend-local.rule=Host(\`$USERNAME.dev.simpleaccounts.local\`)"
      - "traefik.http.routers.$USERNAME-frontend-local.entrypoints=web"
      - "traefik.http.routers.$USERNAME-frontend-local.service=$USERNAME-frontend"

      # Frontend service
      - "traefik.http.services.$USERNAME-frontend.loadbalancer.server.port=3000"

      # Backend API - nip.io (no DNS needed)
      - "traefik.http.routers.$USERNAME-api-nip.rule=Host(\`$USERNAME-api.$NIP_IP.nip.io\`)"
      - "traefik.http.routers.$USERNAME-api-nip.entrypoints=web"
      - "traefik.http.routers.$USERNAME-api-nip.service=$USERNAME-api"

      # Backend API - local domain (requires /etc/hosts)
      - "traefik.http.routers.$USERNAME-api-local.rule=Host(\`$USERNAME-api.dev.simpleaccounts.local\`)"
      - "traefik.http.routers.$USERNAME-api-local.entrypoints=web"
      - "traefik.http.routers.$USERNAME-api-local.service=$USERNAME-api"

      # Backend service
      - "traefik.http.services.$USERNAME-api.loadbalancer.server.port=8080"

  db:
    image: postgres:18-alpine
    container_name: db-$USERNAME
    restart: unless-stopped
    volumes:
      - $USERNAME-postgres-data:/var/lib/postgresql/data
      - ../init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_USER: simpleaccounts
      POSTGRES_PASSWORD: simpleaccounts_dev
      POSTGRES_DB: simpleaccounts
    networks:
      - $USERNAME-internal
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U simpleaccounts']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis-$USERNAME
    restart: unless-stopped
    volumes:
      - $USERNAME-redis-data:/data
    command: redis-server --appendonly yes
    networks:
      - $USERNAME-internal

networks:
  dev-proxy-network:
    external: true
  $USERNAME-internal:
    name: $USERNAME-internal

volumes:
  $USERNAME-postgres-data:
  $USERNAME-redis-data:
  $USERNAME-vscode-extensions:
  $USERNAME-maven-cache:
  $USERNAME-npm-cache:
EOF

print_success "Created compose file: $USER_COMPOSE"

# Start the user's containers
print_header "Starting containers for $USERNAME"
docker compose -f "$USER_COMPOSE" up -d

print_success "Containers started!"

# Print summary
print_header "Setup Complete!"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Option 1: nip.io URLs (No DNS config needed!)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Frontend: ${GREEN}http://$USERNAME.$NIP_IP.nip.io${NC}"
echo -e "  Backend:  ${GREEN}http://$USERNAME-api.$NIP_IP.nip.io${NC}"
echo -e "  Dashboard: ${GREEN}http://proxy.$NIP_IP.nip.io:8090${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Option 2: Local domain (requires /etc/hosts)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Frontend: http://$USERNAME.dev.simpleaccounts.local"
echo -e "  Backend:  http://$USERNAME-api.dev.simpleaccounts.local"
echo ""
echo -e "  Add to /etc/hosts:"
echo -e "  ${YELLOW}$SERVER_IP  $USERNAME.dev.simpleaccounts.local${NC}"
echo -e "  ${YELLOW}$SERVER_IP  $USERNAME-api.dev.simpleaccounts.local${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "To attach VS Code:"
echo -e "  1. Cmd+Shift+P > 'Dev Containers: Attach to Running Container'"
echo -e "  2. Select '${GREEN}dev-$USERNAME${NC}'"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
