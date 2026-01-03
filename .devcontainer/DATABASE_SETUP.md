# Database Setup Guide

## Overview

This guide explains how the PostgreSQL database is configured in the SimpleAccounts UAE devcontainer and how to troubleshoot common issues.

## Architecture

### Network Configuration

All services (devcontainer, PostgreSQL, Redis) share the same network namespace using `network_mode: service:db`. This means:

- **All services share the same hostname**: `simpleaccounts-dev`
- **All services share the same IP address**
- **Services communicate via `localhost`**: PostgreSQL on `localhost:5432`, Redis on `localhost:6379`

This design simplifies configuration and matches local development patterns.

### Database Structure

The setup creates the following:

| Database              | Owner            | Purpose                   |
| --------------------- | ---------------- | ------------------------- |
| `simpleaccounts`      | `simpleaccounts` | Main application database |
| `simpleaccounts_test` | `simpleaccounts` | Testing database          |

| User             | Type         | Purpose                                           |
| ---------------- | ------------ | ------------------------------------------------- |
| `postgres`       | Superuser    | Container admin (created by PostgreSQL container) |
| `simpleaccounts` | Regular user | Application user (created by init-db.sql)         |

## Automatic Setup

### What Happens on First Start

1. **Environment File Generation** (`setup-env.sh`):
   - Checks if `.devcontainer/.env` exists
   - If missing, creates it from `.env.example`
   - Validates all required environment variables are set

2. **Database Initialization** (`init-db.sql`):
   - Creates `simpleaccounts` user with password
   - Grants privileges on databases
   - Enables PostgreSQL extensions (`uuid-ossp`, `pgcrypto`)
   - Sets up default privileges for future objects

3. **Validation** (`validate-database.sh`):
   - Verifies PostgreSQL is accepting connections
   - Checks databases exist
   - Confirms user can connect
   - Validates extensions are installed

## Environment Files

### `.devcontainer/.env` (REQUIRED - Git-ignored)

Contains database configuration and application settings:

```bash
# Database credentials (PostgreSQL container)
POSTGRES_USER=simpleaccounts
POSTGRES_PASSWORD=simpleaccounts_dev
POSTGRES_DB=simpleaccounts

# Application database configuration
SIMPLEACCOUNTS_DB_HOST=localhost
SIMPLEACCOUNTS_DB_PORT=5432
SIMPLEACCOUNTS_DB=simpleaccounts
SIMPLEACCOUNTS_DB_USER=simpleaccounts
SIMPLEACCOUNTS_DB_PASSWORD=simpleaccounts_dev
SIMPLEACCOUNTS_DB_SSL=false
SIMPLEACCOUNTS_DB_SSLMODE=disable
```

**This file is auto-generated** from `.env.example` if it doesn't exist.

### `.devcontainer/.env.example` (Committed to Git)

Template for `.env` file. Contains default development settings.

### `.devcontainer/.env.credentials` (OPTIONAL - Git-ignored)

Contains credential mount configurations for local development tools (Claude, SSH, Git, etc.).

### `.devcontainer/.env.local` (OPTIONAL - Git-ignored)

User-specific overrides for `.env` settings. This file is never auto-generated and is for manual customization only.

## Connection Details

### JDBC Connection String

```
jdbc:postgresql://localhost:5432/simpleaccounts
```

### Spring Boot Configuration

The application reads from environment variables (set in `.devcontainer/.env`):

```properties
spring.datasource.url=jdbc:postgresql://${SIMPLEACCOUNTS_DB_HOST}:${SIMPLEACCOUNTS_DB_PORT}/${SIMPLEACCOUNTS_DB}
spring.datasource.username=${SIMPLEACCOUNTS_DB_USER}
spring.datasource.password=${SIMPLEACCOUNTS_DB_PASSWORD}
```

### Direct psql Connection

```bash
# As application user
psql -h localhost -U simpleaccounts -d simpleaccounts

# As superuser
psql -h localhost -U postgres -d simpleaccounts
```

## Manual Setup (if needed)

### Regenerate .env Files

```bash
cd /workspaces/SimpleAccounts-UAE
bash .devcontainer/setup-env.sh
```

### Validate Database Setup

```bash
bash .devcontainer/validate-database.sh
```

### Rebuild Database from Scratch

```bash
# Stop containers
docker compose -f .devcontainer/docker-compose.yml down -v

# Remove volume (CAUTION: destroys all data!)
docker volume rm simpleaccounts-uae_postgres-data

# Start fresh
docker compose -f .devcontainer/docker-compose.yml up -d
```

## Troubleshooting

### Issue: "Role 'simpleaccounts' does not exist"

**Cause**: The database was initialized before `.env` file was properly configured.

**Solution**:

```bash
# 1. Ensure .env has correct configuration
bash .devcontainer/setup-env.sh

# 2. Rebuild containers
docker compose -f .devcontainer/docker-compose.yml down -v
docker compose -f .devcontainer/docker-compose.yml up -d

# 3. Wait for initialization (check logs)
docker compose -f .devcontainer/docker-compose.yml logs -f db
```

### Issue: "Environment variables not set"

**Cause**: `.env` file is missing or empty.

**Solution**:

```bash
# Regenerate .env from template
bash .devcontainer/setup-env.sh

# Restart devcontainer to load new environment
# In VS Code: Ctrl+Shift+P → "Dev Containers: Rebuild Container"
```

### Issue: "Database exists but owned by wrong user"

**Cause**: Previous initialization with different credentials.

**Solution**:

```bash
# Option 1: Fix ownership manually
psql -h localhost -U postgres -d simpleaccounts -c "REASSIGN OWNED BY moshinhashmi TO simpleaccounts;"

# Option 2: Rebuild from scratch (see "Rebuild Database" above)
```

### Issue: "PostgreSQL is running but can't connect"

**Diagnosis**:

```bash
# Check if PostgreSQL is listening
pg_isready -h localhost -p 5432

# Check environment variables
env | grep SIMPLEACCOUNTS

# Try connecting as postgres superuser
psql -h localhost -U postgres -d postgres
```

**Common Causes**:

1. Wrong password in `.env`
2. User doesn't exist yet (run init-db.sql)
3. Network configuration issue

### Issue: "Application can't connect to database"

**Diagnosis**:

```bash
# Validate full setup
bash .devcontainer/validate-database.sh

# Check Spring Boot is using correct env vars
cd apps/backend
./mvnw spring-boot:run --debug | grep datasource
```

**Solution**:

1. Ensure `.devcontainer/.env` is sourced in your shell
2. Restart the backend application
3. Check for typos in environment variable names

## Database Migrations

### Liquibase

The application uses Liquibase for database schema management:

```properties
spring.liquibase.change-log=classpath:liquibase/liquibase-changelog.xml
```

Migration files are located in:

```
apps/backend/src/main/resources/liquibase/
```

### Running Migrations Manually

```bash
cd apps/backend

# Run pending migrations
./mvnw liquibase:update

# Rollback last migration
./mvnw liquibase:rollback -Dliquibase.rollbackCount=1

# Generate SQL for review (without executing)
./mvnw liquibase:updateSQL
```

## Best Practices

### For Developers

1. **Never commit `.env` files** - They contain credentials and are git-ignored
2. **Use `.env.example` as the source of truth** - Document any new variables here
3. **Test database changes locally first** - Use `simpleaccounts_test` database
4. **Write idempotent migrations** - They may run multiple times

### For New Team Members

1. **Clone the repository**
2. **Open in VS Code** → It will prompt to "Reopen in Container"
3. **Wait for setup** - `setup-env.sh` runs automatically on first start
4. **Validate setup**: `bash .devcontainer/validate-database.sh`
5. **Start developing!**

### For CI/CD

Environment variables should be set in your CI/CD platform (GitHub Actions, GitLab CI, etc.):

```yaml
env:
  SIMPLEACCOUNTS_DB_HOST: localhost
  SIMPLEACCOUNTS_DB_PORT: 5432
  SIMPLEACCOUNTS_DB: simpleaccounts_test
  SIMPLEACCOUNTS_DB_USER: postgres
  SIMPLEACCOUNTS_DB_PASSWORD: test_password
```

## Security Notes

### Development Environment

- Default credentials are `simpleaccounts` / `simpleaccounts_dev`
- These are **ONLY for local development**
- SSL is disabled by default

### Production Environment

**CRITICAL**: Never use development credentials in production!

Production settings should use:

- Strong, randomly generated passwords
- SSL/TLS encryption (`SIMPLEACCOUNTS_DB_SSL=true`)
- Separate database user with minimal privileges
- Connection pooling with appropriate limits
- Regular security updates

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Spring Boot Data JPA](https://spring.io/guides/gs/accessing-data-jpa/)
- [Liquibase Documentation](https://docs.liquibase.com/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)

## Support

If you encounter issues not covered in this guide:

1. Run the validation script: `bash .devcontainer/validate-database.sh`
2. Check container logs: `docker compose -f .devcontainer/docker-compose.yml logs db`
3. Verify `.env` configuration: `cat .devcontainer/.env`
4. Create an issue on GitHub with validation output and logs
