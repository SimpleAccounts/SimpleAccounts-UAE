#!/bin/bash
# =============================================================================
# Database Password Synchronization Script
# =============================================================================
# This script ensures the PostgreSQL password matches the environment variable
# by updating it on each startup. This fixes the password mismatch issue that
# occurs when:
# - Coder workspace is rebuilt (new random password generated)
# - Local devcontainer is recreated but postgres volume persists
#
# The script uses pg_isready to detect if PostgreSQL is available, then
# attempts to connect and update the application user's password.
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect environment and set hostname
if [ -n "$CODER_AGENT_TOKEN" ]; then
    DB_HOST="${POSTGRES_HOST:-db}"
    echo -e "${BLUE}ℹ${NC} Detected Coder environment (using '$DB_HOST' hostname)"
else
    DB_HOST="${SIMPLEACCOUNTS_DB_HOST:-localhost}"
    echo -e "${BLUE}ℹ${NC} Detected local devcontainer (using '$DB_HOST' hostname)"
fi

DB_PORT="${SIMPLEACCOUNTS_DB_PORT:-5432}"
DB_USER="${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}"
DB_PASSWORD="${SIMPLEACCOUNTS_DB_PASSWORD:-simpleaccounts_dev}"
DB_NAME="${SIMPLEACCOUNTS_DB:-simpleaccounts}"
POSTGRES_USER_ENV="${POSTGRES_USER:-simpleaccounts}"
POSTGRES_PASSWORD_ENV="${POSTGRES_PASSWORD:-$DB_PASSWORD}"

echo -e "${BLUE}🔄 Synchronizing database password...${NC}"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Function to try connecting with a password
try_connection() {
    local password="$1"
    local user="$2"
    PGPASSWORD="$password" psql -h "$DB_HOST" -p "$DB_PORT" -U "$user" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1
    return $?
}

# Function to update user password
update_password() {
    local admin_password="$1"
    local admin_user="$2"
    local target_user="$3"
    local new_password="$4"

    PGPASSWORD="$admin_password" psql -h "$DB_HOST" -p "$DB_PORT" -U "$admin_user" -d "$DB_NAME" -c "ALTER USER $target_user WITH PASSWORD '$new_password';" > /dev/null 2>&1
    return $?
}

# Wait for PostgreSQL to be ready
echo -e "${BLUE}⏳ Waiting for PostgreSQL...${NC}"
TIMEOUT=30
ELAPSED=0
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo -e "${YELLOW}⚠${NC} PostgreSQL not ready after ${TIMEOUT}s"
        exit 0  # Don't fail, let other scripts continue
    fi
done
echo -e "${GREEN}✓${NC} PostgreSQL is accepting connections"

# Test connection with current environment password
if try_connection "$DB_PASSWORD" "$DB_USER"; then
    echo -e "${GREEN}✓${NC} Password is already synchronized"
    exit 0
fi

echo -e "${YELLOW}⚠${NC} Password mismatch detected, attempting to synchronize..."

# List of passwords to try for admin access
# Order matters: try most likely passwords first
ADMIN_PASSWORDS=(
    "$POSTGRES_PASSWORD_ENV"
    "$DB_PASSWORD"
    "simpleaccounts_dev"
    "postgres"
    ""
)

# List of admin users to try
ADMIN_USERS=(
    "$POSTGRES_USER_ENV"
    "postgres"
    "simpleaccounts"
)

PASSWORD_SYNCED=false

for admin_user in "${ADMIN_USERS[@]}"; do
    for admin_password in "${ADMIN_PASSWORDS[@]}"; do
        # Try connecting as admin
        if try_connection "$admin_password" "$admin_user"; then
            echo -e "${BLUE}ℹ${NC} Connected as '$admin_user'"

            # Update the application user password
            if update_password "$admin_password" "$admin_user" "$DB_USER" "$DB_PASSWORD"; then
                echo -e "${GREEN}✓${NC} Updated password for user '$DB_USER'"

                # Also update postgres user if different
                if [ "$admin_user" != "postgres" ] && [ "$DB_USER" != "postgres" ]; then
                    update_password "$admin_password" "$admin_user" "postgres" "$POSTGRES_PASSWORD_ENV" 2>/dev/null || true
                fi

                PASSWORD_SYNCED=true
                break 2
            else
                echo -e "${YELLOW}⚠${NC} Failed to update password (may lack permissions)"
            fi
        fi
    done
done

if [ "$PASSWORD_SYNCED" = true ]; then
    # Verify the new password works
    if try_connection "$DB_PASSWORD" "$DB_USER"; then
        echo -e "${GREEN}✓${NC} Password synchronization complete"
        exit 0
    else
        echo -e "${RED}✗${NC} Password update succeeded but verification failed"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Could not synchronize password"
    echo ""
    echo "This usually means the PostgreSQL volume was initialized with a different password."
    echo "To fix this, you need to:"
    echo ""
    echo "  Option 1: Delete the PostgreSQL volume and let it reinitialize"
    echo "    - Coder: coder restart --build"
    echo "    - Local: docker compose down -v && docker compose up -d"
    echo ""
    echo "  Option 2: Manually reset the password"
    echo "    - Connect to PostgreSQL as superuser"
    echo "    - Run: ALTER USER $DB_USER WITH PASSWORD 'your-password';"
    echo ""
    exit 1
fi
