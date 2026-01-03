-- =============================================================================
-- SimpleAccounts UAE - Database Initialization Script
-- =============================================================================
-- This script runs automatically when the PostgreSQL container starts for the first time
-- It is IDEMPOTENT - safe to run multiple times without causing errors
-- =============================================================================

-- Enable better error reporting
\set ON_ERROR_STOP on
\set VERBOSITY verbose

-- Print initialization start
\echo '========================================='
\echo 'SimpleAccounts Database Initialization'
\echo '========================================='
\echo ''

-- =============================================================================
-- Create Application User (if it doesn't already exist)
-- =============================================================================
-- Note: POSTGRES_USER from environment is the superuser created by the container
-- We create a separate application user for the Spring Boot app to use

DO $$
BEGIN
    -- Check if user already exists
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'simpleaccounts') THEN
        CREATE USER simpleaccounts WITH PASSWORD 'simpleaccounts_dev';
        RAISE NOTICE 'Created user: simpleaccounts';
    ELSE
        RAISE NOTICE 'User already exists: simpleaccounts';
        -- Update password in case it was changed in .env
        ALTER USER simpleaccounts WITH PASSWORD 'simpleaccounts_dev';
    END IF;
END
$$;

-- =============================================================================
-- Create Databases
-- =============================================================================

-- Main application database
SELECT 'Creating main database: simpleaccounts' AS message;
-- Database is already created by POSTGRES_DB environment variable
-- Just grant privileges to our application user
GRANT ALL PRIVILEGES ON DATABASE simpleaccounts TO simpleaccounts;

-- Test database
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'simpleaccounts_test') THEN
        CREATE DATABASE simpleaccounts_test;
        RAISE NOTICE 'Created database: simpleaccounts_test';
    ELSE
        RAISE NOTICE 'Database already exists: simpleaccounts_test';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE simpleaccounts_test TO simpleaccounts;

-- =============================================================================
-- Configure Main Database
-- =============================================================================

\echo ''
\echo 'Configuring main database: simpleaccounts'
\c simpleaccounts;

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant schema privileges to application user
GRANT ALL ON SCHEMA public TO simpleaccounts;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO simpleaccounts;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO simpleaccounts;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO simpleaccounts;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO simpleaccounts;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO simpleaccounts;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO simpleaccounts;

\echo '  ✓ Extensions enabled: uuid-ossp, pgcrypto'
\echo '  ✓ Privileges granted to user: simpleaccounts'

-- =============================================================================
-- Configure Test Database
-- =============================================================================

\echo ''
\echo 'Configuring test database: simpleaccounts_test'
\c simpleaccounts_test;

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant schema privileges to application user
GRANT ALL ON SCHEMA public TO simpleaccounts;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO simpleaccounts;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO simpleaccounts;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO simpleaccounts;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO simpleaccounts;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO simpleaccounts;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO simpleaccounts;

\echo '  ✓ Extensions enabled: uuid-ossp, pgcrypto'
\echo '  ✓ Privileges granted to user: simpleaccounts'

-- =============================================================================
-- Verification
-- =============================================================================

\echo ''
\echo '========================================='
\echo 'Database Initialization Complete'
\echo '========================================='
\echo ''
\echo 'Summary:'

-- List databases
\echo '  Databases:'
SELECT '    - ' || datname AS database FROM pg_database WHERE datname LIKE 'simpleaccounts%' ORDER BY datname;

-- List users
\echo ''
\echo '  Users:'
SELECT '    - ' || usename || CASE WHEN usesuper THEN ' (superuser)' ELSE '' END AS user
FROM pg_catalog.pg_user
WHERE usename IN ('postgres', 'simpleaccounts')
ORDER BY usename;

\echo ''
\echo 'Connection String:'
\echo '  jdbc:postgresql://localhost:5432/simpleaccounts'
\echo '  User: simpleaccounts'
\echo '  Password: simpleaccounts_dev'
\echo ''
\echo '========================================='
