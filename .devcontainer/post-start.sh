#!/bin/bash
# Post-start script - runs every time the container starts

echo "🔄 Starting SimpleAccounts-UAE development environment..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h localhost -p 5432 -U simpleaccounts -q; do
    sleep 1
done
echo "✅ PostgreSQL is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until redis-cli -h localhost ping > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Redis is ready"

# Symlink Claude settings from persistent mount
if [ -f /home/vscode/.claude/claude.json ] && [ ! -L /home/vscode/.claude.json ]; then
    ln -sf /home/vscode/.claude/claude.json /home/vscode/.claude.json
    echo "✅ Claude settings symlinked"
fi

# Update CLI tools to latest versions (runs in background to not block startup)
echo "🔧 Updating CLI tools in background..."
if [ -f /usr/local/bin/install-cli-tools ]; then
    nohup /usr/local/bin/install-cli-tools > /tmp/cli-tools-update.log 2>&1 &
    echo "   (Check /tmp/cli-tools-update.log for details)"
fi

# Start code-server if installed and not running
if command -v code-server &> /dev/null; then
    if ! pgrep -x "code-server" > /dev/null; then
        echo "🌐 Starting code-server (Web IDE)..."
        nohup code-server --bind-addr 0.0.0.0:8443 --auth none /workspaces/SimpleAccounts-UAE > /tmp/code-server.log 2>&1 &
        echo "✅ Code-server started on port 8443"
    else
        echo "✅ Code-server already running"
    fi
fi

# =============================================================================
# Traefik Integration (Dev-Server only)
# =============================================================================
connect_to_traefik() {
    # Check if Docker socket is available
    if [ ! -S /var/run/docker.sock ]; then
        return 1
    fi

    # Check if docker CLI is available
    if ! command -v docker &> /dev/null; then
        return 1
    fi

    # Check if dev-proxy-network exists
    if ! docker network inspect dev-proxy-network > /dev/null 2>&1; then
        return 1
    fi

    # Get container name
    CONTAINER_NAME=$(hostname)
    DEV_USER="${DEV_USER:-$(whoami)}"

    # Check if already connected
    if docker network inspect dev-proxy-network | grep -q "$CONTAINER_NAME"; then
        echo "✅ Already connected to Traefik network"
        return 0
    fi

    # Connect container to Traefik network
    echo "🔌 Connecting to Traefik network..."
    if docker network connect dev-proxy-network "$CONTAINER_NAME" 2>/dev/null; then
        echo "✅ Connected to Traefik network"
        return 0
    else
        echo "⚠️  Could not connect to Traefik network (may need permissions)"
        return 1
    fi
}

# Get server IP for nip.io URLs
get_server_ip() {
    # Try to get IP from hostname
    if command -v hostname &> /dev/null; then
        IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    # Fallback: get from default route
    if [ -z "$IP" ] && command -v ip &> /dev/null; then
        IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
    fi

    echo "${IP:-localhost}"
}

# Try to connect to Traefik
TRAEFIK_ENABLED=false
if connect_to_traefik; then
    TRAEFIK_ENABLED=true
    SERVER_IP=$(get_server_ip)
    NIP_IP=$(echo "$SERVER_IP" | tr '.' '-')
    DEV_USER="${DEV_USER:-devuser}"
fi

# =============================================================================
# Print Environment Info
# =============================================================================
echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Database connection:"
echo "  Host: localhost (or 'db' from other containers)"
echo "  Port: 5432"
echo "  User: simpleaccounts"
echo "  Pass: simpleaccounts_dev"
echo "  DB:   simpleaccounts"
echo ""
echo "Redis connection:"
echo "  Host: localhost (or 'redis' from other containers)"
echo "  Port: 6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$TRAEFIK_ENABLED" = true ]; then
    echo ""
    echo "🌐 Shareable URLs (via Traefik):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Frontend: http://${DEV_USER}.${NIP_IP}.nip.io"
    echo "  Backend:  http://${DEV_USER}-api.${NIP_IP}.nip.io"
    echo "  Web IDE:  http://${DEV_USER}-ide.${NIP_IP}.nip.io"
    echo "  Dashboard: http://proxy.${NIP_IP}.nip.io:8090"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "📡 Local Development (use port forwarding):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8080"
    echo "  Web IDE:  http://localhost:8443"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "💡 To enable shareable URLs, install Traefik on the server:"
    echo "   cd .devcontainer/proxy && sudo ./install-traefik-service.sh"
fi

echo ""
echo "CLI Tools:"
echo "  claude    - Anthropic Claude Code CLI"
echo "  codex     - OpenAI Codex CLI"
echo "  gemini    - Google Gemini CLI"
echo "  gh        - GitHub CLI"
echo "  psql      - PostgreSQL Client"
echo ""
