#!/bin/bash
# =============================================================================
# SimpleAccounts UAE - Database Initialization Script
# =============================================================================
# This script runs automatically when the PostgreSQL container starts for the first time
# It is IDEMPOTENT - safe to run multiple times without causing errors
#
# Environment Variables Required:
#   POSTGRES_USER - PostgreSQL superuser (set by container)
#   POSTGRES_DB - Default database (set by container)
#   SIMPLEACCOUNTS_DB_USER - Application user name
#   SIMPLEACCOUNTS_DB_PASSWORD - Application user password
# =============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}SimpleAccounts Database Initialization${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Validate required environment variables
REQUIRED_VARS=("POSTGRES_USER" "POSTGRES_DB" "SIMPLEACCOUNTS_DB_USER" "SIMPLEACCOUNTS_DB_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}WARNING: Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Using fallback defaults..."
    # Set fallback defaults
    SIMPLEACCOUNTS_DB_USER="${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}"
    SIMPLEACCOUNTS_DB_PASSWORD="${SIMPLEACCOUNTS_DB_PASSWORD:-simpleaccounts_dev}"
fi

echo "Configuration:"
echo "  POSTGRES_USER: $POSTGRES_USER"
echo "  POSTGRES_DB: $POSTGRES_DB"
echo "  SIMPLEACCOUNTS_DB_USER: $SIMPLEACCOUNTS_DB_USER"
echo "  SIMPLEACCOUNTS_DB_PASSWORD: (hidden)"
echo ""

# =============================================================================
# Create Application User and Databases
# =============================================================================

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- =============================================================================
    -- Create Application User (if it doesn't already exist)
    -- =============================================================================
    DO \$\$
    BEGIN
        -- Check if user already exists
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$SIMPLEACCOUNTS_DB_USER') THEN
            CREATE USER $SIMPLEACCOUNTS_DB_USER WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';
            RAISE NOTICE 'Created user: $SIMPLEACCOUNTS_DB_USER';
        ELSE
            RAISE NOTICE 'User already exists: $SIMPLEACCOUNTS_DB_USER';
            -- Update password in case it was changed in .env
            ALTER USER $SIMPLEACCOUNTS_DB_USER WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';
            RAISE NOTICE 'Updated password for user: $SIMPLEACCOUNTS_DB_USER';
        END IF;
    END
    \$\$;

    -- =============================================================================
    -- Grant Privileges on Main Database
    -- =============================================================================
    SELECT 'Granting privileges on main database: $POSTGRES_DB' AS message;
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $SIMPLEACCOUNTS_DB_USER;

    -- =============================================================================
    -- Create Test Database
    -- =============================================================================
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'simpleaccounts_test') THEN
            CREATE DATABASE simpleaccounts_test;
            RAISE NOTICE 'Created database: simpleaccounts_test';
        ELSE
            RAISE NOTICE 'Database already exists: simpleaccounts_test';
        END IF;
    END
    \$\$;

    GRANT ALL PRIVILEGES ON DATABASE simpleaccounts_test TO $SIMPLEACCOUNTS_DB_USER;
EOSQL

# =============================================================================
# Configure Main Database
# =============================================================================

echo ""
echo -e "${GREEN}Configuring main database: $POSTGRES_DB${NC}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable useful extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Grant schema privileges to application user
    GRANT ALL ON SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;

    -- Set default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $SIMPLEACCOUNTS_DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $SIMPLEACCOUNTS_DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $SIMPLEACCOUNTS_DB_USER;

    SELECT '  ✓ Extensions enabled: uuid-ossp, pgcrypto' AS status;
    SELECT '  ✓ Privileges granted to user: $SIMPLEACCOUNTS_DB_USER' AS status;
EOSQL

# =============================================================================
# Configure Test Database
# =============================================================================

echo ""
echo -e "${GREEN}Configuring test database: simpleaccounts_test${NC}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "simpleaccounts_test" <<-EOSQL
    -- Enable useful extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Grant schema privileges to application user
    GRANT ALL ON SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $SIMPLEACCOUNTS_DB_USER;

    -- Set default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $SIMPLEACCOUNTS_DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $SIMPLEACCOUNTS_DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $SIMPLEACCOUNTS_DB_USER;

    SELECT '  ✓ Extensions enabled: uuid-ossp, pgcrypto' AS status;
    SELECT '  ✓ Privileges granted to user: $SIMPLEACCOUNTS_DB_USER' AS status;
EOSQL

# =============================================================================
# Verification
# =============================================================================

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Database Initialization Complete${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "Summary:"

# List databases
echo "  Databases:"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -t -c \
    "SELECT '    - ' || datname FROM pg_database WHERE datname LIKE 'simpleaccounts%' ORDER BY datname;"

# List users
echo ""
echo "  Users:"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -t -c \
    "SELECT '    - ' || usename || CASE WHEN usesuper THEN ' (superuser)' ELSE '' END \
     FROM pg_catalog.pg_user \
     WHERE usename IN ('postgres', '$SIMPLEACCOUNTS_DB_USER') \
     ORDER BY usename;"

echo ""
echo "Connection String:"
echo "  jdbc:postgresql://localhost:5432/$POSTGRES_DB"
echo "  User: $SIMPLEACCOUNTS_DB_USER"
echo "  Password: (configured from environment)"
echo ""
echo -e "${BLUE}=========================================${NC}"
echo ""
