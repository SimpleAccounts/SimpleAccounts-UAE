#!/bin/bash
# =============================================================================
# PostgreSQL Startup Hook
# =============================================================================
# This script runs INSIDE the PostgreSQL container AFTER the database is ready.
# It synchronizes user passwords from environment variables.
#
# Mount this script and call it from a custom entrypoint or use postgres's
# notify mechanism.
#
# Usage in docker-compose.yml:
#   command: >
#     bash -c "
#       docker-entrypoint.sh postgres &
#       sleep 5
#       /docker-entrypoint-initdb.d/postgres-startup-hook.sh
#       wait
#     "
# =============================================================================

set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -U "${POSTGRES_USER:-postgres}" -q; do
    sleep 1
done
echo "PostgreSQL is ready"

# Sync passwords from environment variables
DB_USER="${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}"
DB_PASSWORD="${SIMPLEACCOUNTS_DB_PASSWORD}"

if [ -n "$DB_PASSWORD" ]; then
    echo "Synchronizing password for user: $DB_USER"
    psql -U "${POSTGRES_USER:-postgres}" -d postgres -c "
        DO \$\$
        BEGIN
            -- Update the user password if user exists
            IF EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
                ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
                RAISE NOTICE 'Updated password for user: $DB_USER';
            ELSE
                RAISE NOTICE 'User does not exist: $DB_USER';
            END IF;
        END
        \$\$;
    " || echo "Warning: Could not update password"
fi

echo "Password sync complete"
