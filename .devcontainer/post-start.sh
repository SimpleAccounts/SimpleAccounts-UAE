#!/bin/bash
# Post-start script - runs every time the container starts

echo "🔄 Starting SimpleAccounts-UAE development environment..."

# =============================================================================
# Ensure direnv is installed (handles containers built before direnv was added)
# =============================================================================
if ! command -v direnv &> /dev/null; then
    echo "📦 Installing direnv..."
    sudo apt-get update -qq && sudo apt-get install -y -qq direnv > /dev/null 2>&1
    if command -v direnv &> /dev/null; then
        echo "✅ direnv installed"
        # Allow .envrc if it exists
        if [ -f "/workspaces/SimpleAccounts-UAE/.envrc" ]; then
            direnv allow /workspaces/SimpleAccounts-UAE 2>/dev/null || true
        fi
    else
        echo "⚠️  Failed to install direnv"
    fi
fi

# =============================================================================
# Detect environment and set hostnames
# - Coder: Uses separate containers with 'db' and 'redis' hostnames
# - Local DevContainer: Uses network_mode: service:db (shared localhost)
# =============================================================================
if [ -n "$CODER_AGENT_TOKEN" ]; then
    # Running in Coder - use container hostnames
    POSTGRES_HOST="${POSTGRES_HOST:-db}"
    REDIS_HOST="redis"
    echo "📦 Detected Coder environment (using db/redis hostnames)"
else
    # Running in local devcontainer - use localhost (network_mode: service:db)
    POSTGRES_HOST="localhost"
    REDIS_HOST="localhost"
    echo "📦 Detected local devcontainer (using localhost)"
fi

# Wait for PostgreSQL to be ready (with timeout)
echo "⏳ Waiting for PostgreSQL at ${POSTGRES_HOST}:5432..."
TIMEOUT=60
ELAPSED=0
until pg_isready -h "$POSTGRES_HOST" -p 5432 -U simpleaccounts -q; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "⚠️  PostgreSQL not ready after ${TIMEOUT}s, continuing anyway..."
        break
    fi
done
if [ $ELAPSED -lt $TIMEOUT ]; then
    echo "✅ PostgreSQL is ready"

    # Synchronize database password (fixes mismatch after workspace rebuild)
    echo ""
    echo "🔄 Synchronizing database password..."
    if bash /workspaces/SimpleAccounts-UAE/.devcontainer/sync-db-password.sh; then
        echo "✅ Database password synchronized"
    else
        echo "⚠️  Database password sync failed - may need manual intervention"
    fi

    # Validate database configuration
    echo ""
    echo "🔍 Validating database setup..."
    if bash /workspaces/SimpleAccounts-UAE/.devcontainer/validate-database.sh; then
        echo "✅ Database validation passed"
    else
        echo "⚠️  Database validation failed - some checks did not pass"
        echo "   See above for details. You may need to rebuild containers."
    fi
    echo ""
fi

# Wait for Redis to be ready (with timeout)
echo "⏳ Waiting for Redis at ${REDIS_HOST}:6379..."
ELAPSED=0
until redis-cli -h "$REDIS_HOST" ping > /dev/null 2>&1; do
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

# Update CLI tools to latest versions (runs in background to not block startup)
echo "🔧 Updating CLI tools in background..."
if [ -f /usr/local/bin/install-cli-tools ]; then
    nohup /usr/local/bin/install-cli-tools > /tmp/cli-tools-update.log 2>&1 &
    echo "   (Check /tmp/cli-tools-update.log for details)"
fi

# Check for MCP server updates in background
echo "🔧 Checking MCP servers for updates..."
(
    MCP_DIR="/home/vscode/.local/share/mcp-servers"
    VERSION_FILE="$MCP_DIR/sonarqube-mcp-server.version"

    # Ensure directory exists
    mkdir -p "$MCP_DIR/storage"

    # Get current installed version
    CURRENT_VERSION=""
    if [ -f "$VERSION_FILE" ]; then
        CURRENT_VERSION=$(cat "$VERSION_FILE")
    fi

    # Get latest version from GitHub API
    LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/SonarSource/sonarqube-mcp-server/releases/latest" 2>/dev/null | grep -o '"tag_name": "[^"]*"' | cut -d'"' -f4)

    if [ -n "$LATEST_VERSION" ] && [ "$LATEST_VERSION" != "$CURRENT_VERSION" ]; then
        echo "Updating SonarQube MCP Server: $CURRENT_VERSION -> $LATEST_VERSION"
        if curl -fsSL -o "$MCP_DIR/sonarqube-mcp-server.jar.new" \
           "https://github.com/SonarSource/sonarqube-mcp-server/releases/download/${LATEST_VERSION}/sonarqube-mcp-server-${LATEST_VERSION}.jar" 2>/dev/null; then
            mv "$MCP_DIR/sonarqube-mcp-server.jar.new" "$MCP_DIR/sonarqube-mcp-server.jar"
            echo "$LATEST_VERSION" > "$VERSION_FILE"
            echo "✅ SonarQube MCP Server updated to $LATEST_VERSION"
        else
            rm -f "$MCP_DIR/sonarqube-mcp-server.jar.new"
            echo "⚠️ Failed to download SonarQube MCP Server update"
        fi
    elif [ -n "$CURRENT_VERSION" ]; then
        echo "✅ SonarQube MCP Server is up to date ($CURRENT_VERSION)"
    fi
) > /tmp/mcp-update.log 2>&1 &
echo "   (Check /tmp/mcp-update.log for details)"

# Start code-server if installed and not running
if command -v code-server &> /dev/null; then
    CODE_SERVER_CONFIG="$HOME/.config/code-server/config.yaml"
    CODE_SERVER_CONFIG_DIR="$(dirname "$CODE_SERVER_CONFIG")"

    # Create required directories if they don't exist
    mkdir -p "$HOME/.local/share/code-server"
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
        nohup code-server /workspaces/SimpleAccounts-UAE > /tmp/code-server.log 2>&1 &
        echo "✅ Code-server started on port 8443 (password protected)"
    else
        echo "✅ Code-server already running"
    fi
fi

# Start VNC server for browser testing and UI preview
if command -v Xvfb &> /dev/null && command -v x11vnc &> /dev/null; then
    if ! pgrep -f "Xvfb" > /dev/null; then
        echo "🖥️  Starting VNC server..."
        # Start Xvfb (Virtual Framebuffer)
        Xvfb :99 -screen 0 1400x900x24 > /tmp/xvfb.log 2>&1 &
        sleep 2
        export DISPLAY=:99
        # Start x11vnc
        x11vnc -display :99 -forever -nopw -shared -rfbport 5900 > /tmp/x11vnc.log 2>&1 &
        sleep 1
        # Start noVNC (web-based VNC client)
        if command -v websockify &> /dev/null; then
            # Use websockify directly with correct web root path
            websockify --web=/usr/share/novnc 6080 localhost:5900 > /tmp/novnc.log 2>&1 &
        elif [ -f /usr/share/novnc/utils/novnc_proxy ]; then
            /usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 > /tmp/novnc.log 2>&1 &
        fi
        echo "✅ VNC server started on port 6080"
    else
        echo "✅ VNC server already running"
    fi
else
    echo "⚠️  VNC packages not installed, skipping VNC auto-start"
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

# Try to connect to Traefik (skip in Coder - uses its own networking)
TRAEFIK_ENABLED=false
if [ -z "$CODER_AGENT_TOKEN" ]; then
    # Only try Traefik connection in local devcontainer (not Coder)
    if connect_to_traefik; then
        TRAEFIK_ENABLED=true
        SERVER_IP=$(get_server_ip)
        NIP_IP=$(echo "$SERVER_IP" | tr '.' '-')
        DEV_USER="${DEV_USER:-devuser}"
    fi
fi

# =============================================================================
# Print Environment Info
# =============================================================================
echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Database connection:"
echo "  Host: $POSTGRES_HOST"
echo "  Port: 5432"
echo "  User: simpleaccounts"
if [ -n "$CODER_AGENT_TOKEN" ]; then
    echo "  Pass: (auto-generated for this workspace)"
else
    echo "  Pass: simpleaccounts_dev"
fi
echo "  DB:   simpleaccounts"
echo "  URL:  jdbc:postgresql://$POSTGRES_HOST:5432/simpleaccounts"
echo ""
echo "Redis connection:"
echo "  Host: $REDIS_HOST"
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
echo "  cursor    - Cursor CLI"
echo "  cursor-agent - Cursor agent CLI shim"
echo "  gh        - GitHub CLI"
echo "  psql      - PostgreSQL Client"
echo ""
echo "MCP Servers (pre-installed):"
echo "  SonarQube - Code quality analysis (~/.local/share/mcp-servers/)"
echo ""

# =============================================================================
# Auto-start Frontend and Backend Development Servers
# =============================================================================
echo "🚀 Starting development servers..."

# Start Backend (Spring Boot)
if [ -f "apps/backend/mvnw" ]; then
    if ! pgrep -f "spring-boot:run" > /dev/null; then
        echo "☕ Starting Backend API (Spring Boot) on port 8080..."
        cd apps/backend
        nohup ./mvnw spring-boot:run > /tmp/backend.log 2>&1 &
        echo "✅ Backend started (logs: /tmp/backend.log)"
        cd ../..
    else
        echo "✅ Backend already running"
    fi
else
    echo "⚠️  Backend mvnw not found, skipping auto-start"
fi

# Start Frontend (Vite)
if [ -f "apps/frontend/package.json" ]; then
    if ! pgrep -f "vite" > /dev/null; then
        echo "⚛️  Starting Frontend (React + Vite) on port 3000..."
        cd apps/frontend
        nohup npm start > /tmp/frontend.log 2>&1 &
        echo "✅ Frontend started (logs: /tmp/frontend.log)"
        cd ../..
    else
        echo "✅ Frontend already running"
    fi
else
    echo "⚠️  Frontend package.json not found, skipping auto-start"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Development Servers:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend: http://localhost:3000 (React + Vite)"
echo "  Backend:  http://localhost:8080 (Spring Boot)"
echo "  Swagger:  http://localhost:8080/swagger-ui.html"
echo "  VNC:      http://localhost:6080/vnc.html (Browser Testing)"
echo ""
echo "📋 View logs:"
echo "  Frontend: tail -f /tmp/frontend.log"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  VNC:      tail -f /tmp/novnc.log"
echo ""
echo "🛑 Stop servers:"
echo "  pkill -f vite      (stop frontend)"
echo "  pkill -f spring-boot:run  (stop backend)"
echo "  pkill -f Xvfb      (stop VNC)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
