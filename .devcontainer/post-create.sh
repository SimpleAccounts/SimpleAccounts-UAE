#!/bin/bash
# Post-create script - runs once when the container is created

set -e

# Temporarily unset NODE_OPTIONS to avoid issues during setup
unset NODE_OPTIONS


echo "🚀 Setting up SimpleAccounts-UAE development environment..."

# Determine the target user home directory
# In devcontainer, we typically run as vscode user, but post-create may run as root
TARGET_USER="vscode"
TARGET_HOME="/home/vscode"

# Function to fix ownership of a directory (uses sudo if needed)
fix_ownership() {
    local dir="$1"
    if [ -d "$dir" ]; then
        # Check if directory is owned by someone other than target user
        local owner
        owner=$(stat -c '%U' "$dir" 2>/dev/null || stat -f '%Su' "$dir" 2>/dev/null)
        if [ "$owner" != "$TARGET_USER" ]; then
            if [ "$(id -u)" = "0" ]; then
                chown -R "$TARGET_USER:$TARGET_USER" "$dir" 2>/dev/null || true
            else
                sudo chown -R "$TARGET_USER:$TARGET_USER" "$dir" 2>/dev/null || true
            fi
        fi
    fi
}

# Function to ensure directory exists with correct permissions
ensure_dir() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir" 2>/dev/null || sudo mkdir -p "$dir" 2>/dev/null || true
    fi
    fix_ownership "$dir"
}

# ============================================
# Setup Maven directories BEFORE any maven commands
# ============================================
echo "📁 Setting up Maven directories..."

# The .m2 directory is mounted as a volume - ensure it's writable
ensure_dir "$TARGET_HOME/.m2"
ensure_dir "$TARGET_HOME/.m2/repository"
ensure_dir "$TARGET_HOME/.m2/wrapper"
ensure_dir "$TARGET_HOME/.m2/wrapper/dists"

# Also ensure npm cache directory is writable
ensure_dir "$TARGET_HOME/.npm"

# Copy Maven settings.xml if it doesn't exist (fixes 403 Forbidden errors)
if [ ! -f "$TARGET_HOME/.m2/settings.xml" ] && [ -f ".devcontainer/maven-settings.xml" ]; then
    echo "📝 Installing Maven settings.xml..."
    cp .devcontainer/maven-settings.xml "$TARGET_HOME/.m2/settings.xml"
    fix_ownership "$TARGET_HOME/.m2/settings.xml"
    echo "  ✅ Maven settings installed"
fi

# ============================================
# Fix volume permissions (run early to ensure tools work)
# ============================================
echo "🔧 Fixing volume permissions..."
for dir in "$TARGET_HOME/.claude" "$TARGET_HOME/.gemini" "$TARGET_HOME/.codex" "$TARGET_HOME/.config/gh" "$TARGET_HOME/.bash_history_dir" "$TARGET_HOME/.gitconfig_dir" "$TARGET_HOME/.ssh" "$TARGET_HOME/.docker" "$TARGET_HOME/.kube" "$TARGET_HOME/.aws" "$TARGET_HOME/.azure" "$TARGET_HOME/.vscode-server"; do
    [ -d "$dir" ] && fix_ownership "$dir"
done

# Ensure VS Code server directories exist with correct permissions
ensure_dir "$TARGET_HOME/.vscode-server"
ensure_dir "$TARGET_HOME/.vscode-server/bin"
ensure_dir "$TARGET_HOME/.vscode-server/extensions"

# ============================================
# Install npm dependencies
# ============================================
echo "📦 Installing root npm dependencies..."
# Try npm ci first (faster, uses lock file exactly)
# Fall back to npm install if lock file is out of sync
# Clean node_modules first to ensure npm ci succeeds
rm -rf node_modules
if ! npm ci --prefer-offline 2>/dev/null; then
    echo "  ⚠️  npm ci failed, falling back to npm install..."
    npm install
fi

echo "📦 Installing frontend dependencies..."
cd apps/frontend
# Clean node_modules first to ensure npm ci succeeds
rm -rf node_modules
if ! npm ci --legacy-peer-deps --prefer-offline 2>/dev/null; then
    echo "  ⚠️  npm ci failed, falling back to npm install..."
    npm install --legacy-peer-deps
fi
cd ../..

# ============================================
# Setup Playwright
# ============================================
echo "🎭 Setting up Playwright..."
# Playwright browser deps are installed in Dockerfile
# Just ensure the cache directory exists
ensure_dir "$TARGET_HOME/.cache/ms-playwright"

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
# Only run husky if we're in a git repository
if [ -d ".git" ]; then
    npm run prepare 2>/dev/null || true
    echo "  ✅ Git hooks installed"
else
    echo "  ⚠️  Not in a git repository, skipping git hooks"
fi

# ============================================
# Setup direnv for automatic .env loading
# ============================================
echo "🔧 Setting up direnv..."

# Add direnv hook to bashrc if not already present
if ! grep -q "direnv hook bash" "$TARGET_HOME/.bashrc" 2>/dev/null; then
    echo '' >> "$TARGET_HOME/.bashrc"
    echo '# direnv hook for automatic .env loading' >> "$TARGET_HOME/.bashrc"
    echo 'eval "$(direnv hook bash)"' >> "$TARGET_HOME/.bashrc"
    echo "  ✅ Added direnv hook to .bashrc"
fi

# Create .envrc file if it doesn't exist
if [ ! -f ".envrc" ]; then
    cat > .envrc << 'ENVRCEOF'
# direnv configuration for SimpleAccounts-UAE
# This file loads environment variables from .env files

# Load main devcontainer environment variables
if [ -f .devcontainer/.env ]; then
  dotenv .devcontainer/.env
fi

# Load local overrides (not committed to git)
if [ -f .devcontainer/.env.local ]; then
  dotenv .devcontainer/.env.local
fi

# Load root .env if it exists (not committed to git)
if [ -f .env ]; then
  dotenv .env
fi

# Load root .env.local if it exists (not committed to git)
if [ -f .env.local ]; then
  dotenv .env.local
fi
ENVRCEOF
    echo "  ✅ Created .envrc file"
fi

# Allow direnv for this directory
direnv allow . 2>/dev/null || true
echo "  ✅ direnv configured"

# ============================================
# Create local environment files
# ============================================
# Create .devcontainer/.env if it doesn't exist
if [ ! -f ".devcontainer/.env" ]; then
    echo "📝 Creating .devcontainer/.env from example..."
    cp .devcontainer/.env.example .devcontainer/.env
    echo "  ✅ Created .devcontainer/.env"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local..."
    cat > apps/frontend/.env.local << 'EOF'
VITE_API_URL=http://localhost:8080
VITE_APP_ENV=development
EOF
fi

if [ ! -f "apps/backend/src/main/resources/application-local.properties" ]; then
    echo "📝 Creating backend application-local.properties..."
    cat > apps/backend/src/main/resources/application-local.properties << 'BACKENDEOF'
# Local development configuration
# Uses localhost because all services share network via network_mode: service:db
spring.datasource.url=jdbc:postgresql://localhost:5432/simpleaccounts
spring.datasource.username=simpleaccounts
spring.datasource.password=simpleaccounts_dev
spring.jpa.hibernate.ddl-auto=update

# Redis configuration
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Disable Liquibase in local dev (use ddl-auto=update instead)
# Uncomment if you want to use Liquibase migrations
# spring.liquibase.enabled=true
BACKENDEOF
fi

# ============================================
# Validate permissions on critical directories
# ============================================
echo "🔍 Validating permissions..."

PERMISSION_ERRORS=0

# Function to test write access
test_write_access() {
    local dir="$1"
    local name="$2"

    if [ -d "$dir" ]; then
        if touch "$dir/.write-test" 2>/dev/null; then
            rm "$dir/.write-test"
            echo "  ✓ $name is writable"
        else
            echo "  ❌ WARNING: Cannot write to $name - permission issue detected!"
            PERMISSION_ERRORS=$((PERMISSION_ERRORS + 1))
        fi
    else
        echo "  ⚠ $name does not exist (will be created on first use)"
    fi
}

# Test critical directories
test_write_access "$TARGET_HOME/.m2" "Maven cache"
test_write_access "$TARGET_HOME/.npm" "NPM cache"
test_write_access "$TARGET_HOME/.bash_history_dir" "Bash history"
test_write_access "$TARGET_HOME/.gitconfig_dir" "Git config"
test_write_access "$TARGET_HOME/.claude" "Claude CLI config"
test_write_access "$TARGET_HOME/.ssh" "SSH directory"
test_write_access "/workspaces/SimpleAccounts-UAE" "Workspace"

if [ $PERMISSION_ERRORS -gt 0 ]; then
    echo ""
    echo "⚠️  $PERMISSION_ERRORS permission issue(s) detected!"
    echo "   This may cause problems. Run: bash .devcontainer/setup-host-dirs.sh"
    echo ""
fi

echo "✅ Development environment setup complete!"
echo ""
echo "Quick start commands:"
echo "  Frontend: cd apps/frontend && npm start"
echo "  Backend:  cd apps/backend && ./mvnw spring-boot:run"
echo ""
echo "Or from repo root:"
echo "  Frontend: npm run frontend"
echo "  Backend:  npm run backend:run"
