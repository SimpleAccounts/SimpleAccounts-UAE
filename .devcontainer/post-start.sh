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

# Update CLI tools to latest versions (runs in background to not block startup)
echo "🔧 Updating CLI tools in background..."
if [ -f /usr/local/bin/install-cli-tools ]; then
    nohup /usr/local/bin/install-cli-tools > /tmp/cli-tools-update.log 2>&1 &
    echo "   (Check /tmp/cli-tools-update.log for details)"
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
echo "CLI Tools:"
echo "  claude    - Anthropic Claude Code CLI"
echo "  openai    - OpenAI CLI"
echo "  gemini    - Google Gemini CLI"
echo "  gh        - GitHub CLI"
echo "  gcloud    - Google Cloud CLI"
echo "  kubectl   - Kubernetes CLI"
echo "  psql      - PostgreSQL Client"
