# Database Password Generation and Synchronization

**Date**: 2026-01-02
**Status**: ✅ Implemented
**Affects**: All Coder workspaces

---

## Overview

Coder workspaces use a **secure random password generation** system for PostgreSQL databases. This document explains how passwords are generated, synchronized across services, and why the previous hardcoded approach was replaced.

---

## Previous Architecture (BEFORE 2026-01-02)

### Problems

1. **Hardcoded passwords in SQL**: `init-db.sql` contained `CREATE USER simpleaccounts WITH PASSWORD 'simpleaccounts_dev';`
2. **Password mismatch**: Coder generated random password, but init-db.sql ignored it
3. **Environment variable ignored**: `SIMPLEACCOUNTS_DB_PASSWORD` was passed but not used
4. **Security risk**: Same password for all workspaces
5. **Wrong Redis variable names**: `SPRING_REDIS_*` instead of `SPRING_DATA_REDIS_*`

### Impact

- Users experienced "password authentication failed" errors
- Database user password didn't match application configuration
- Manual intervention required to fix each workspace

---

## Current Architecture (AFTER 2026-01-02)

### Password Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Terraform generates random password                      │
│    random_password.postgres.result = "abc123xyz..."          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Password passed to BOTH containers as env vars           │
│                                                              │
│    PostgreSQL Container:                                     │
│    - POSTGRES_PASSWORD=${random_password.postgres.result}   │
│    - SIMPLEACCOUNTS_DB_PASSWORD=${random_password...}       │
│    - SIMPLEACCOUNTS_DB_USER=simpleaccounts                  │
│                                                              │
│    Workspace Container:                                      │
│    - SIMPLEACCOUNTS_DB_PASSWORD=${random_password...}       │
│    - SIMPLEACCOUNTS_DB_USER=simpleaccounts                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. init-db.sh reads password from environment                │
│    CREATE USER $SIMPLEACCOUNTS_DB_USER                       │
│      WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';           │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend connects using same env var                      │
│    spring.datasource.password=${SIMPLEACCOUNTS_DB_PASSWORD} │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### File: `.coder/template.tf`

#### 1. Random Password Generation (Lines 116-119)

```hcl
resource "random_password" "postgres" {
  length  = 32
  special = false  # Alphanumeric only (avoid shell escaping issues)
}
```

**Why 32 characters?**

- Strong security for development environments
- No special characters to avoid shell escaping issues

#### 2. PostgreSQL Container Configuration (Lines 158-165)

```hcl
env = [
  "POSTGRES_USER=simpleaccounts",
  "POSTGRES_PASSWORD=${random_password.postgres.result}",
  "POSTGRES_DB=simpleaccounts",
  # Application database user credentials (used by init-db.sh)
  "SIMPLEACCOUNTS_DB_USER=simpleaccounts",
  "SIMPLEACCOUNTS_DB_PASSWORD=${random_password.postgres.result}"
]
```

**Key Points:**

- `POSTGRES_PASSWORD`: Used by PostgreSQL container for superuser
- `SIMPLEACCOUNTS_DB_PASSWORD`: Used by `init-db.sh` to create application user
- Both use the **same random password** for consistency

#### 3. Database Initialization Script Mount (Lines 170-174)

```hcl
volumes {
  host_path      = "/workspaces/SimpleAccounts-UAE/.devcontainer/init-db.sh"
  container_path = "/docker-entrypoint-initdb.d/init-db.sh"
  read_only      = true
}
```

**Changed from:**

- ❌ `init-db.sql` (hardcoded password)

**Changed to:**

- ✅ `init-db.sh` (reads from environment variables)

#### 4. Workspace Container Environment (Lines 389-392)

```hcl
"SIMPLEACCOUNTS_DB_USER=simpleaccounts",
"SIMPLEACCOUNTS_DB_PASSWORD=${random_password.postgres.result}",
"SIMPLEACCOUNTS_DB_HOST=db",
"SIMPLEACCOUNTS_DB_PORT=5432",
```

**Purpose:** Backend application uses these to connect to PostgreSQL

#### 5. Redis Configuration (Lines 397-398)

```hcl
# Redis configuration (Spring Boot 3.x naming convention)
"SPRING_DATA_REDIS_HOST=redis",
"SPRING_DATA_REDIS_PORT=6379",
```

**Changed from:**

- ❌ `SPRING_REDIS_HOST` (wrong naming convention)

**Changed to:**

- ✅ `SPRING_DATA_REDIS_HOST` (Spring Boot 3.x standard)

---

### File: `.devcontainer/init-db.sh`

This shell script replaces the old `init-db.sql` file.

#### Key Features

```bash
#!/bin/bash
set -e

# 1. Validate required environment variables
REQUIRED_VARS=("POSTGRES_USER" "POSTGRES_DB" "SIMPLEACCOUNTS_DB_USER" "SIMPLEACCOUNTS_DB_PASSWORD")

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required environment variable $var is not set!"
        exit 1
    fi
done

# 2. Create application user with password from environment
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create user with dynamic password from environment
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$SIMPLEACCOUNTS_DB_USER') THEN
            CREATE USER $SIMPLEACCOUNTS_DB_USER WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';
        ELSE
            ALTER USER $SIMPLEACCOUNTS_DB_USER WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';
        END IF;
    END
    \$\$;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $SIMPLEACCOUNTS_DB_USER;
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB}_test TO $SIMPLEACCOUNTS_DB_USER;
EOSQL
```

**Why Shell Script Instead of SQL?**

| Feature                     | init-db.sql | init-db.sh |
| --------------------------- | ----------- | ---------- |
| Read environment variables  | ❌          | ✅         |
| Dynamic password            | ❌          | ✅         |
| Validation checks           | ❌          | ✅         |
| Error handling              | Limited     | Full       |
| Idempotent (safe to re-run) | Partial     | Full       |
| Shell command execution     | ❌          | ✅         |

---

## Backend Configuration

### File: `apps/backend/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://${SIMPLEACCOUNTS_DB_HOST}:${SIMPLEACCOUNTS_DB_PORT}/${SIMPLEACCOUNTS_DB}
spring.datasource.username=${SIMPLEACCOUNTS_DB_USER}
spring.datasource.password=${SIMPLEACCOUNTS_DB_PASSWORD}

# Redis Configuration
spring.data.redis.host=${SPRING_DATA_REDIS_HOST:localhost}
spring.data.redis.port=${SPRING_DATA_REDIS_PORT:6379}
```

**Key Points:**

- Uses environment variables with `${VAR_NAME}` syntax
- Provides defaults with `:` syntax (e.g., `:localhost`)
- No hardcoded credentials anywhere

---

## Security Benefits

### Before (Hardcoded)

- ❌ Same password for all workspaces: `simpleaccounts_dev`
- ❌ Password visible in git history (init-db.sql)
- ❌ Easy to guess/brute-force
- ❌ No rotation mechanism

### After (Random Generation)

- ✅ Unique 32-character password per workspace
- ✅ No passwords in git (all in Terraform state)
- ✅ Difficult to brute-force
- ✅ Easy rotation (just recreate workspace)
- ✅ Isolated per developer

---

## Troubleshooting

### Issue: "Password authentication failed"

**Cause:** Old workspace created before 2026-01-02 fix

**Solution:**

```bash
# Option 1: Recreate workspace (recommended)
# 1. Backup your work (git commit/push)
# 2. Delete workspace in Coder
# 3. Create new workspace (gets new random password)

# Option 2: Manual password sync (advanced)
# 1. Get current password from environment
echo $SIMPLEACCOUNTS_DB_PASSWORD

# 2. Update database user password
docker exec -it $(docker ps -qf "name=coder-.*-db") \
  psql -U postgres -d simpleaccounts -c \
  "ALTER USER simpleaccounts WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';"
```

### Issue: "Environment variable not set"

**Cause:** Template not passing variables correctly

**Check:**

```bash
# 1. Verify environment variables in workspace
env | grep SIMPLEACCOUNTS

# 2. Check postgres container environment
docker exec $(docker ps -qf "name=coder-.*-db") env | grep SIMPLEACCOUNTS

# 3. Verify password matches
docker exec $(docker ps -qf "name=coder-.*-db") env | grep POSTGRES_PASSWORD
```

### Issue: "Redis connection failed"

**Cause:** Using old `SPRING_REDIS_HOST` variable name

**Solution:**

```bash
# Check if correct variable is set
env | grep SPRING_DATA_REDIS_HOST

# If missing, template needs update (see template.tf lines 397-398)
```

---

## Testing Checklist

After template changes, verify:

- [ ] **Random password generated**: Check Terraform state

  ```bash
  terraform show | grep random_password
  ```

- [ ] **Password passed to containers**: Check docker inspect

  ```bash
  docker inspect $(docker ps -qf "name=coder-.*-db") | grep SIMPLEACCOUNTS_DB_PASSWORD
  ```

- [ ] **Database user created**: Connect and verify

  ```bash
  psql -h db -U simpleaccounts -d simpleaccounts -c "SELECT current_user;"
  ```

- [ ] **Backend connects**: Check Spring Boot startup logs

  ```bash
  cd apps/backend && ./mvnw spring-boot:run
  # Should NOT show "password authentication failed"
  ```

- [ ] **Redis connects**: Check connection
  ```bash
  redis-cli -h redis ping
  # Should return: PONG
  ```

---

## Migration from Old Workspaces

### For Users with Existing Workspaces

**Recommended: Fresh Start (5 minutes)**

1. **Backup your work**:

   ```bash
   git add -A
   git commit -m "WIP: before workspace recreation"
   git push
   ```

2. **Delete old workspace** in Coder dashboard

3. **Create new workspace** (gets new template with fixes)

4. **Continue working** (git pull restores your code)

**Alternative: Manual Fix (Advanced)**

1. **Get current password**:

   ```bash
   echo $SIMPLEACCOUNTS_DB_PASSWORD
   ```

2. **Update database user**:

   ```bash
   docker exec -it $(docker ps -qf "name=coder-.*-db") \
     psql -U postgres -c \
     "ALTER USER simpleaccounts WITH PASSWORD '$SIMPLEACCOUNTS_DB_PASSWORD';"
   ```

3. **Restart backend**:
   ```bash
   cd apps/backend && ./mvnw spring-boot:run
   ```

---

## For Template Administrators

### Pushing Template Updates

```bash
# 1. Test changes locally
cd .coder
terraform init
terraform plan

# 2. Push to Coder
coder templates push simpleaccounts-uae \
  --directory . \
  --name "SimpleAccounts UAE" \
  --message "Fix: Sync random password to init-db.sh and update Redis vars"

# 3. Verify in Coder dashboard
# Check that template version updated

# 4. Notify users
# Post in team chat about available update
```

### Monitoring Rollout

```bash
# Check which workspaces are on old version
coder list --output json | jq '.[] | select(.template_version_name != "latest")'

# View user feedback
# Monitor support channels for password issues
```

---

## Technical Reference

### Environment Variables Used

| Variable                     | Set In          | Used By              | Purpose                        |
| ---------------------------- | --------------- | -------------------- | ------------------------------ |
| `POSTGRES_USER`              | template.tf:159 | PostgreSQL container | Superuser name                 |
| `POSTGRES_PASSWORD`          | template.tf:160 | PostgreSQL container | Superuser password             |
| `POSTGRES_DB`                | template.tf:161 | PostgreSQL container | Default database name          |
| `SIMPLEACCOUNTS_DB_USER`     | template.tf:163 | init-db.sh, Backend  | Application user name          |
| `SIMPLEACCOUNTS_DB_PASSWORD` | template.tf:164 | init-db.sh, Backend  | Application user password      |
| `SIMPLEACCOUNTS_DB_HOST`     | template.tf:390 | Backend              | PostgreSQL hostname            |
| `SIMPLEACCOUNTS_DB_PORT`     | template.tf:391 | Backend              | PostgreSQL port                |
| `SPRING_DATA_REDIS_HOST`     | template.tf:397 | Backend              | Redis hostname (Spring Boot 3) |
| `SPRING_DATA_REDIS_PORT`     | template.tf:398 | Backend              | Redis port (Spring Boot 3)     |

### Files Modified

| File                               | Changes                                  |
| ---------------------------------- | ---------------------------------------- |
| `.coder/template.tf`               | Mount init-db.sh, pass password env vars |
| `.devcontainer/init-db.sh`         | NEW - Shell script with dynamic password |
| `.devcontainer/init-db.sql`        | DEPRECATED - No longer used in Coder     |
| `.coder/README.md`                 | Updated password documentation           |
| `.coder/DATABASE_PASSWORD_SYNC.md` | NEW - This file                          |

---

## Future Improvements

### Potential Enhancements

1. **Password Rotation**:
   - Implement periodic password rotation
   - Use Terraform triggers for automatic rotation
   - Add webhook notifications

2. **Secrets Management**:
   - Integrate with HashiCorp Vault
   - Use Kubernetes secrets
   - Implement secret scanning

3. **Monitoring**:
   - Add health checks for password sync
   - Log password mismatch events
   - Alert on authentication failures

4. **Documentation**:
   - Add video walkthrough
   - Create troubleshooting flowchart
   - Build automated validation script

---

## References

- [PostgreSQL Environment Variables](https://www.postgresql.org/docs/current/libpq-envars.html)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Terraform random_password](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/password)
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Coder Templates](https://coder.com/docs/templates)

---

**Last Updated**: 2026-01-02
**Status**: ✅ Production Ready
**Next Review**: 2026-04-02
