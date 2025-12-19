#!/bin/bash

# Script to clear database automatically (non-interactive) for testing
# This script will delete all users and companies from the database
# Usage: ./clear-database-auto.sh [--force]

set -e

# Get the repository root directory (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for --force flag
FORCE_FLAG=false
if [ "$1" == "--force" ]; then
    FORCE_FLAG=true
fi

if [ "$FORCE_FLAG" != "true" ]; then
    echo -e "${YELLOW}⚠️  WARNING: This will delete ALL users and companies from the database!${NC}"
    echo -e "${YELLOW}Make sure you have a backup if needed.${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo -e "${RED}Operation cancelled.${NC}"
        exit 1
    fi
fi

# Try to read database config from deploy/docker/.env file first, then apps/backend/.env
ENV_FILE_DOCKER="$REPO_ROOT/deploy/docker/.env"
ENV_FILE_BACKEND="$REPO_ROOT/apps/backend/.env"

if [ -f "$ENV_FILE_DOCKER" ]; then
    echo -e "${GREEN}Reading database configuration from $ENV_FILE_DOCKER${NC}"
    # Source the file, handling comments and empty lines
    set -a
    source "$ENV_FILE_DOCKER"
    set +a
elif [ -f "$ENV_FILE_BACKEND" ]; then
    echo -e "${GREEN}Reading database configuration from $ENV_FILE_BACKEND${NC}"
    set -a
    source "$ENV_FILE_BACKEND"
    set +a
else
    echo -e "${RED}Error: Environment file not found. Please ensure deploy/docker/.env or apps/backend/.env exists.${NC}"
    exit 1
fi

# Set defaults if not set
# If DB_HOST is "db" (Docker service name), use localhost for external connection
DB_HOST=${SIMPLEACCOUNTS_DB_HOST:-localhost}
if [ "$DB_HOST" = "db" ]; then
    DB_HOST="localhost"
fi
DB_PORT=${SIMPLEACCOUNTS_DB_PORT:-5432}
DB_NAME=${SIMPLEACCOUNTS_DB:-simpleaccounts_db}
DB_USER=${SIMPLEACCOUNTS_DB_USER:-simpleaccounts_db_user}
DB_PASSWORD=${SIMPLEACCOUNTS_DB_PASSWORD}

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Database password is required${NC}"
    exit 1
fi

echo -e "${GREEN}Connecting to database: $DB_NAME@$DB_HOST:$DB_PORT as $DB_USER${NC}"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Check if we should use docker exec instead
SQL_SCRIPT="$SCRIPT_DIR/clear-database-for-registration-test.sql"

if docker ps | grep -q "simpleaccounts-db"; then
    echo -e "${GREEN}Detected Docker container. Using docker exec...${NC}"
    docker exec -i simpleaccounts-db psql -U "$DB_USER" -d "$DB_NAME" < "$SQL_SCRIPT"
else
    # Run the SQL script directly
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_SCRIPT"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database cleared successfully!${NC}"
    echo -e "${GREEN}You can now test the registration workflow.${NC}"
    echo -e "${GREEN}Visiting /login should redirect to /register${NC}"
else
    echo -e "${RED}❌ Error clearing database${NC}"
    exit 1
fi

# Unset password
unset PGPASSWORD
