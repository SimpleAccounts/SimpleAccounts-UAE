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

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Database connection:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: simpleaccounts"
echo "  Pass: simpleaccounts_dev"
echo "  DB:   simpleaccounts"
echo ""
echo "Redis connection:"
echo "  Host: localhost"
echo "  Port: 6379"
echo ""
echo "Web IDE (Code Server):"
echo "  URL:  http://localhost:8443"
echo "  Auth: None (local access only)"
echo "  Log:  /tmp/code-server.log"
echo ""
echo "CLI Tools:"
echo "  claude    - Anthropic Claude Code CLI"
echo "  codex     - OpenAI Codex CLI"
echo "  openai    - OpenAI CLI"
echo "  gemini    - Google Gemini CLI"
echo "  cursor    - Cursor CLI"
echo "  cursor-agent - Cursor agent CLI shim"
echo "  gh        - GitHub CLI"
echo "  gcloud    - Google Cloud CLI"
echo "  kubectl   - Kubernetes CLI"
echo "  psql      - PostgreSQL Client"
