#!/bin/bash
# =============================================================================
# Environment Setup Script
# =============================================================================
# Automatically generates .env files if they don't exist
# This ensures all new users have correct database configuration
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print functions
print_header() {
    echo ""
    echo -e "${CYAN}=========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}=========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# =============================================================================
# Main Setup
# =============================================================================

print_header "SimpleAccounts UAE - Environment Setup"

# =============================================================================
# 1. Generate .env file (database configuration)
# =============================================================================

ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

if [ -f "$ENV_FILE" ]; then
    print_info "Found existing .env file"

    # Check if it has database configuration
    if grep -q "SIMPLEACCOUNTS_DB_HOST" "$ENV_FILE"; then
        print_success ".env file is properly configured"
    else
        print_warning ".env file exists but missing database config"
        print_info "Backing up old .env to .env.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Regenerating .env from template..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        print_success "Created new .env file with database configuration"
    fi
else
    print_info ".env file not found, creating from template..."
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        print_success "Created .env file from .env.example"
    else
        print_error ".env.example not found!"
        exit 1
    fi
fi

# =============================================================================
# 2. Generate .env.credentials file (optional credential mounts)
# =============================================================================

CREDS_FILE="$SCRIPT_DIR/.env.credentials"

if [ -f "$CREDS_FILE" ]; then
    print_success ".env.credentials already exists"
else
    print_info "Creating .env.credentials for credential mounts..."

    cat > "$CREDS_FILE" << 'EOF'
# =============================================================================
# DevContainer Credential Mounts
# =============================================================================
# This file configures credential and config directory mounts from host to container
# These allow you to use your local git, ssh, Claude, etc. configs inside the devcontainer
# =============================================================================

# AI/LLM CLI tools
DEVPOD_CREDS_CLAUDE=${HOME}/.claude
DEVPOD_CREDS_GEMINI=${HOME}/.gemini
DEVPOD_CREDS_CODEX=${HOME}/.codex

# Development tools
DEVPOD_CREDS_GH=${HOME}/.config/gh
DEVPOD_CREDS_SSH=${HOME}/.ssh
DEVPOD_CREDS_DOCKER=${HOME}/.docker
DEVPOD_CREDS_GIT=${HOME}/.gitconfig_wrapper

# IDE settings
DEVPOD_CREDS_CODESERVER=${HOME}/.config/code-server

# Cloud credentials (uncomment as needed)
# DEVPOD_CREDS_KUBE=${HOME}/.kube
# DEVPOD_CREDS_AWS=${HOME}/.aws
# DEVPOD_CREDS_AZURE=${HOME}/.azure

# Shell history
DEVPOD_CREDS_BASH=${HOME}/.bash_history_wrapper
EOF

    print_success "Created .env.credentials file"
fi

# =============================================================================
# 3. Validate environment variables
# =============================================================================

print_header "Validating Configuration"

# Source the .env file to check variables
set -a
source "$ENV_FILE"
set +a

REQUIRED_VARS=(
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "POSTGRES_DB"
    "SIMPLEACCOUNTS_DB_HOST"
    "SIMPLEACCOUNTS_DB_PORT"
    "SIMPLEACCOUNTS_DB"
    "SIMPLEACCOUNTS_DB_USER"
    "SIMPLEACCOUNTS_DB_PASSWORD"
)

ALL_VALID=true

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "$var is not set in .env file"
        ALL_VALID=false
    else
        print_success "$var is configured"
    fi
done

# =============================================================================
# 4. Display Configuration Summary
# =============================================================================

if [ "$ALL_VALID" = true ]; then
    print_header "Configuration Summary"

    echo ""
    echo "Database Configuration:"
    echo "  Host:     ${SIMPLEACCOUNTS_DB_HOST}"
    echo "  Port:     ${SIMPLEACCOUNTS_DB_PORT}"
    echo "  Database: ${SIMPLEACCOUNTS_DB}"
    echo "  User:     ${SIMPLEACCOUNTS_DB_USER}"
    echo ""

    echo "PostgreSQL Superuser:"
    echo "  User:     ${POSTGRES_USER}"
    echo "  Database: ${POSTGRES_DB}"
    echo ""

    echo "JDBC Connection String:"
    echo "  jdbc:postgresql://${SIMPLEACCOUNTS_DB_HOST}:${SIMPLEACCOUNTS_DB_PORT}/${SIMPLEACCOUNTS_DB}"
    echo ""

    print_header "Setup Complete"
    print_success "All environment files are configured correctly"
    echo ""
    echo "Next Steps:"
    echo "  1. If this is a fresh setup, restart containers: docker compose down && docker compose up -d"
    echo "  2. Validate database setup: bash .devcontainer/validate-database.sh"
    echo "  3. Start development: npm run frontend (Terminal 1) && npm run backend:run (Terminal 2)"
    echo ""

    exit 0
else
    print_header "Setup Failed"
    print_error "Some required environment variables are missing"
    echo ""
    echo "Please check .devcontainer/.env file and ensure all variables are set."
    echo ""
    exit 1
fi
