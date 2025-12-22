#!/bin/bash
# Post-create script - runs once when the container is created

set -e

echo "🚀 Setting up SimpleAccounts-UAE development environment..."

# --- Use cached npm dependencies if available ---
if [ -d "/home/vscode/.npm-cache/root-node_modules" ]; then
    echo "📦 Restoring cached root npm dependencies..."
    cp -r /home/vscode/.npm-cache/root-node_modules ./node_modules
    # Quick install to sync any new packages
    npm install --prefer-offline 2>/dev/null || npm install
else
    echo "📦 Installing root npm dependencies..."
    npm install
fi

if [ -d "/home/vscode/.npm-cache/frontend-node_modules" ]; then
    echo "📦 Restoring cached frontend npm dependencies..."
    cp -r /home/vscode/.npm-cache/frontend-node_modules ./apps/frontend/node_modules
    # Quick install to sync any new packages
    cd apps/frontend
    npm install --legacy-peer-deps --prefer-offline 2>/dev/null || npm install --legacy-peer-deps
    cd ../..
else
    echo "📦 Installing frontend dependencies..."
    cd apps/frontend
    npm install --legacy-peer-deps
    cd ../..
fi

# Install Playwright browsers (using system Chromium)
echo "🎭 Setting up Playwright..."
cd apps/frontend
npx playwright install-deps 2>/dev/null || true
cd ../..

# Maven dependencies are cached in ~/.m2 which is a named volume
# Just ensure any new dependencies are downloaded
echo "☕ Syncing Maven dependencies..."
cd apps/backend
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw dependency:go-offline -B -q || true
else
    mvn dependency:go-offline -B -q || true
fi
cd ../..

# Setup git hooks
echo "🪝 Setting up git hooks..."
npm run prepare 2>/dev/null || true

# Create local environment files if they don't exist
if [ ! -f "apps/frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local..."
    cat > apps/frontend/.env.local << 'EOF'
VITE_API_URL=http://localhost:8080
VITE_APP_ENV=development
EOF
fi

if [ ! -f "apps/backend/src/main/resources/application-local.properties" ]; then
    echo "📝 Creating backend application-local.properties..."
    cat > apps/backend/src/main/resources/application-local.properties << 'EOF'
# Local development configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/simpleaccounts
spring.datasource.username=simpleaccounts
spring.datasource.password=simpleaccounts_dev
spring.jpa.hibernate.ddl-auto=update
spring.redis.host=localhost
spring.redis.port=6379
EOF
fi

echo "✅ Development environment setup complete!"
echo ""
echo "Quick start commands:"
echo "  Frontend: npm run frontend"
echo "  Backend:  npm run backend:run"
echo "  Tests:    npm test"
