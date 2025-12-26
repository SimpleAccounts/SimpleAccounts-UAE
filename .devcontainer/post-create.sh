#!/bin/bash
# Post-create script - runs once when the container is created
# Note: Directories are pre-created in the Docker image for faster startup
# This script handles volume mounts which may override image directories

set -e

# Temporarily unset NODE_OPTIONS to avoid issues during setup
unset NODE_OPTIONS

echo "🚀 Setting up SimpleAccounts-UAE development environment..."

TARGET_HOME="/home/vscode"

# ============================================
# Install npm dependencies
# ============================================
echo "📦 Installing root npm dependencies..."
# Try npm ci first (faster, uses lock file exactly)
# Fall back to npm install if lock file is out of sync
if ! npm ci --prefer-offline 2>/dev/null; then
    echo "  ⚠️  npm ci failed, falling back to npm install..."
    npm install
fi

echo "📦 Installing frontend dependencies..."
cd apps/frontend
if ! npm ci --legacy-peer-deps --prefer-offline 2>/dev/null; then
    echo "  ⚠️  npm ci failed, falling back to npm install..."
    npm install --legacy-peer-deps
fi
cd ../..

# ============================================
# Download Maven dependencies
# ============================================
echo "☕ Downloading Maven dependencies..."
cd apps/backend

if [ -f "./mvnw" ]; then
    chmod +x ./mvnw

    # Set MAVEN_USER_HOME explicitly to ensure wrapper uses correct location
    export MAVEN_USER_HOME="$TARGET_HOME"

    # Use 'compile' instead of 'dependency:go-offline' because go-offline
    # tries to resolve ALL transitive dependencies including deprecated ones
    # from HTTP repositories that Maven 3.8.1+ blocks by default.
    # Compile resolves only the dependencies actually needed for the build.
    if ! ./mvnw compile -B -q \
        -Dmaven.repo.local="$TARGET_HOME/.m2/repository" \
        -DskipTests 2>/dev/null; then
        echo "  ⚠️  Maven compile had issues (non-fatal)"
    else
        echo "  ✅ Maven dependencies downloaded successfully"
    fi
else
    echo "  ⚠️  Maven wrapper not found, skipping dependency download"
fi
cd ../..

# ============================================
# Setup git hooks
# ============================================
echo "🪝 Setting up git hooks..."
npm run prepare 2>/dev/null || true

# ============================================
# Create local environment files
# ============================================
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
echo "  Frontend: cd apps/frontend && npm run dev"
echo "  Backend:  cd apps/backend && ./mvnw spring-boot:run"
