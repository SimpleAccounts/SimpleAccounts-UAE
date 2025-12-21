-- Initialize SimpleAccounts development database
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create additional databases for testing
CREATE DATABASE simpleaccounts_test;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE simpleaccounts TO simpleaccounts;
GRANT ALL PRIVILEGES ON DATABASE simpleaccounts_test TO simpleaccounts;

-- Enable useful extensions
\c simpleaccounts;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c simpleaccounts_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
