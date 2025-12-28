#!/bin/bash
# Post-start script - runs every time the container starts

echo "🔄 Starting SimpleAccounts-UAE development environment..."

# Wait for PostgreSQL to be ready (with timeout)
echo "⏳ Waiting for PostgreSQL..."
TIMEOUT=60
ELAPSED=0
until pg_isready -h db -p 5432 -U simpleaccounts -q; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "⚠️  PostgreSQL not ready after ${TIMEOUT}s, continuing anyway..."
        break
    fi
done
if [ $ELAPSED -lt $TIMEOUT ]; then
    echo "✅ PostgreSQL is ready"
fi

# Wait for Redis to be ready (with timeout)
echo "⏳ Waiting for Redis..."
ELAPSED=0
until redis-cli -h redis ping > /dev/null 2>&1; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "⚠️  Redis not ready after ${TIMEOUT}s, continuing anyway..."
        break
    fi
done
if [ $ELAPSED -lt $TIMEOUT ]; then
    echo "✅ Redis is ready"
fi

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
    CODE_SERVER_CONFIG="$HOME/.config/code-server/config.yaml"
    CODE_SERVER_CONFIG_DIR="$(dirname "$CODE_SERVER_CONFIG")"

    # Create config directory if it doesn't exist
    mkdir -p "$CODE_SERVER_CONFIG_DIR"

    # Generate config with random password if it doesn't exist
    if [ ! -f "$CODE_SERVER_CONFIG" ]; then
        GENERATED_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 16)
        cat > "$CODE_SERVER_CONFIG" << CONFIGEOF
bind-addr: 0.0.0.0:8443
auth: password
password: ${GENERATED_PASSWORD}
cert: false
CONFIGEOF
        chmod 600 "$CODE_SERVER_CONFIG"
        echo "🔐 Generated new code-server password (see below)"
        export CODE_SERVER_NEW_PASSWORD="$GENERATED_PASSWORD"
    fi

    if ! pgrep -x "code-server" > /dev/null; then
        echo "🌐 Starting code-server (Web IDE)..."
        # Unset VSCODE_IPC_HOOK_CLI to prevent code-server from connecting to existing VS Code/Cursor instance
        (unset VSCODE_IPC_HOOK_CLI; nohup code-server /workspaces/SimpleAccounts-UAE > /tmp/code-server.log 2>&1 &)
        echo "✅ Code-server started on port 8443 (password protected)"
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

    # Check if dev-proxy-network exists (Traefik must be installed)
    if ! docker network inspect dev-proxy-network > /dev/null 2>&1; then
        return 1
    fi

    # Get the devcontainer name (DEV_USER is set from docker-compose environment)
    DEV_USER="${DEV_USER:-devuser}"
    DEV_CONTAINER_NAME="dev-${DEV_USER}"

    # Check if devcontainer exists
    if ! docker inspect "$DEV_CONTAINER_NAME" > /dev/null 2>&1; then
        echo "⚠️  Dev container $DEV_CONTAINER_NAME not found"
        return 1
    fi

    # Check if already connected
    if docker network inspect dev-proxy-network | grep -q "$DEV_CONTAINER_NAME"; then
        echo "✅ Already connected to Traefik network"
        return 0
    fi

    # Connect devcontainer to Traefik network for external routing
    echo "🔌 Connecting to Traefik network..."
    if docker network connect dev-proxy-network "$DEV_CONTAINER_NAME" 2>/dev/null; then
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
echo "  Host: db (internal network hostname)"
echo "  Port: 5432"
echo "  User: simpleaccounts"
echo "  Pass: simpleaccounts_dev"
echo "  DB:   simpleaccounts"
echo "  URL:  jdbc:postgresql://db:5432/simpleaccounts"
echo ""
echo "Redis connection:"
echo "  Host: redis (internal network hostname)"
echo "  Port: 6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$TRAEFIK_ENABLED" = true ]; then
    echo ""
    echo "🌐 Shareable URLs (via Traefik with HTTPS):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Frontend: https://${DEV_USER}.${NIP_IP}.nip.io"
    echo "  Backend:  https://${DEV_USER}-api.${NIP_IP}.nip.io"
    echo "  Web IDE:  https://${DEV_USER}-ide.${NIP_IP}.nip.io"
    echo "  Dashboard: http://proxy.${NIP_IP}.nip.io:8090"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔒 SSL certificates are automatically provisioned by Let's Encrypt"
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

# Show code-server password info
if [ -n "$CODE_SERVER_NEW_PASSWORD" ]; then
    echo ""
    echo "🔑 Web IDE Password (save this!):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Password: ${CODE_SERVER_NEW_PASSWORD}"
    echo ""
    echo "  To change your password later:"
    echo "    nano ~/.config/code-server/config.yaml"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
elif [ -f "$HOME/.config/code-server/config.yaml" ]; then
    echo ""
    echo "🔑 Web IDE: Password protected"
    echo "   View password: cat ~/.config/code-server/config.yaml"
    echo "   Change password: nano ~/.config/code-server/config.yaml"
fi

echo ""
echo "CLI Tools:"
echo "  claude    - Anthropic Claude Code CLI"
echo "  codex     - OpenAI Codex CLI"
echo "  gemini    - Google Gemini CLI"
echo "  gh        - GitHub CLI"
echo "  psql      - PostgreSQL Client"
echo ""
