# Migration Guide - Database Setup Fixes

**Date**: 2026-01-02
**Affects**: Existing devcontainer users
**Changes**: Critical database configuration fixes

---

## What Changed?

We've fixed several critical issues with database setup to ensure consistent, reliable configuration for all users:

### 1. **init-db.sql → init-db.sh** (Shell Script)

- **Before**: SQL file with hardcoded passwords
- **After**: Shell script that uses environment variables
- **Benefit**: Password changes in `.env` now properly reflected in database

### 2. **Redis Configuration**

- **Before**: Only in `application-local.properties` with hardcoded values
- **After**: In main `application.properties` using environment variables
- **Benefit**: Works with default profile, no hardcoded values

### 3. **application-local.properties**

- **Before**: Auto-generated with hardcoded credentials
- **After**: Uses environment variables, not auto-generated
- **Benefit**: No accidental credential commits, uses centralized config

### 4. **Environment Variable Names**

- **Before**: `SPRING_REDIS_HOST/PORT`
- **After**: `SPRING_DATA_REDIS_HOST/PORT`
- **Benefit**: Aligns with Spring Boot conventions

---

## Do I Need to Migrate?

**✅ YES** if you:

- Have an existing devcontainer setup
- Created your devcontainer before 2026-01-02
- Are experiencing database connection issues
- Want to ensure you have the latest fixes

**❌ NO** if you:

- Haven't set up the devcontainer yet (you'll get the fixed version automatically)
- Are a new team member starting fresh

---

## Migration Steps

### Option A: Fresh Start (Recommended - 5 minutes)

**Best for**: Clean slate, no risk

```bash
# 1. Stop and remove all containers and volumes
cd /path/to/SimpleAccounts-UAE
docker compose -f .devcontainer/docker-compose.yml down -v

# 2. Remove old environment files (they'll be regenerated)
rm -f .devcontainer/.env
rm -f .devcontainer/.env.credentials

# 3. In VS Code: Rebuild Container
# Command Palette (Ctrl/Cmd+Shift+P) → "Dev Containers: Rebuild Container"

# 4. Wait for automatic setup to complete (~5-10 minutes)

# 5. Validate setup
bash .devcontainer/validate-database.sh
```

**What happens**:

- Fresh PostgreSQL database with correct user/password from `.env`
- New Redis container
- All environment files regenerated from templates
- Clean node_modules and Maven cache

---

### Option B: In-Place Update (Advanced - 10 minutes)

**Best for**: Preserving data, more complex

#### Step 1: Backup Important Data

```bash
# Backup database (if you have important data)
docker exec simpleaccounts-uae-db-1 pg_dump -U simpleaccounts simpleaccounts > backup.sql

# Or just note that you'll lose local data
```

#### Step 2: Update Files

```bash
cd /path/to/SimpleAccounts-UAE

# Pull latest changes
git pull origin develop

# Regenerate environment files
bash .devcontainer/setup-env.sh
```

#### Step 3: Update Database User Password

The database user password needs to be updated manually since it was created with the old hardcoded value:

```bash
# Connect to PostgreSQL as superuser
docker exec -it simpleaccounts-uae-db-1 psql -U postgres -d simpleaccounts

# In psql, run:
ALTER USER simpleaccounts WITH PASSWORD 'simpleaccounts_dev';
\q

# Or if you changed the password in .env:
ALTER USER simpleaccounts WITH PASSWORD 'your_new_password_from_env';
\q
```

#### Step 4: Update application-local.properties

```bash
# Edit the file
nano apps/backend/src/main/resources/application-local.properties

# Replace hardcoded values with environment variable references:
# OLD:
#   spring.datasource.password=simpleaccounts_dev
#   spring.data.redis.host=localhost
#
# NEW:
#   spring.datasource.password=${SIMPLEACCOUNTS_DB_PASSWORD}
#   spring.data.redis.host=${SPRING_DATA_REDIS_HOST}
```

Or just delete it and let it be created from the new template on next container rebuild.

#### Step 5: Restart Containers

```bash
# Restart devcontainer
docker compose -f .devcontainer/docker-compose.yml restart

# Or in VS Code:
# Command Palette → "Dev Containers: Rebuild Container"
```

#### Step 6: Validate

```bash
# Run validation
bash .devcontainer/validate-database.sh

# Expected output: All checks ✓ PASS
```

---

## Verification Checklist

After migration, verify everything works:

- [ ] Environment files exist:

  ```bash
  ls -la .devcontainer/.env
  ls -la .devcontainer/.env.example
  ls -la .devcontainer/.env.credentials
  ```

- [ ] Database validation passes:

  ```bash
  bash .devcontainer/validate-database.sh
  # All checks should show ✓
  ```

- [ ] PostgreSQL user exists with correct password:

  ```bash
  psql -h localhost -U simpleaccounts -d simpleaccounts -c "SELECT current_user;"
  # Should connect without error
  ```

- [ ] Backend starts successfully:

  ```bash
  cd apps/backend
  ./mvnw spring-boot:run
  # Should start without database connection errors
  ```

- [ ] Redis is accessible:

  ```bash
  redis-cli -h localhost ping
  # Should return: PONG
  ```

- [ ] Environment variables are loaded:
  ```bash
  env | grep SIMPLEACCOUNTS
  # Should show all SIMPLEACCOUNTS_* variables
  ```

---

## Troubleshooting Migration Issues

### Issue: "Role 'simpleaccounts' does not exist"

**Cause**: Database wasn't initialized with the new script

**Solution**:

```bash
# Rebuild with fresh database
docker compose -f .devcontainer/docker-compose.yml down -v
docker compose -f .devcontainer/docker-compose.yml up -d

# Or manually create user:
docker exec -it simpleaccounts-uae-db-1 psql -U postgres -c \
  "CREATE USER simpleaccounts WITH PASSWORD 'simpleaccounts_dev';"
```

---

### Issue: "Password authentication failed"

**Cause**: Database user password doesn't match `.env` file

**Solution**:

```bash
# Check current password in .env
cat .devcontainer/.env | grep SIMPLEACCOUNTS_DB_PASSWORD

# Update database user password to match
docker exec -it simpleaccounts-uae-db-1 psql -U postgres -c \
  "ALTER USER simpleaccounts WITH PASSWORD 'simpleaccounts_dev';"

# Or use the value from your .env file
```

---

### Issue: "Environment variables not set"

**Cause**: `.env` file is missing or not sourced

**Solution**:

```bash
# Regenerate .env
bash .devcontainer/setup-env.sh

# Restart container to load new environment
docker compose -f .devcontainer/docker-compose.yml restart

# Or rebuild in VS Code
```

---

### Issue: Backend can't connect to Redis

**Cause**: Old configuration with wrong variable names

**Solution**:

```bash
# Check if Redis is running
redis-cli -h localhost ping

# Update .env with correct variable names
# Change SPRING_REDIS_* to SPRING_DATA_REDIS_*
nano .devcontainer/.env

# Restart backend
```

---

### Issue: "init-db.sh: Permission denied"

**Cause**: Script not executable

**Solution**:

```bash
chmod +x .devcontainer/init-db.sh
docker compose -f .devcontainer/docker-compose.yml restart db
```

---

## What to Do If Migration Fails

If you're stuck or something goes wrong:

1. **Take the fresh start approach** (Option A above)
2. **Check logs**:
   ```bash
   docker compose -f .devcontainer/docker-compose.yml logs db
   docker compose -f .devcontainer/docker-compose.yml logs devcontainer
   ```
3. **Run diagnostics**:
   ```bash
   bash .devcontainer/validate-database.sh
   ```
4. **Ask for help**: Create an issue with:
   - Output of `validate-database.sh`
   - Container logs
   - Contents of `.env` (redact passwords!)

---

## For Team Leads

### Communicating Changes

**Email/Slack Template**:

```
Hi team,

We've made important fixes to the database setup in our devcontainer.
These changes ensure everyone has a consistent, working environment.

Action Required:
- Pull latest changes from 'develop' branch
- Rebuild your devcontainer (takes ~10 minutes)

Two options:
1. Fresh start (recommended): Follow "Option A" in MIGRATION_GUIDE.md
2. In-place update (advanced): Follow "Option B" in MIGRATION_GUIDE.md

Documentation:
- Migration Guide: .devcontainer/MIGRATION_GUIDE.md
- Review Findings: .devcontainer/REVIEW_FINDINGS.md

Questions? Reply to this message or check the docs.
```

### Monitoring Migration Success

Track team progress:

```bash
# Have each team member run this and share the output:
bash .devcontainer/validate-database.sh > my-validation-$(whoami).txt

# Review validation outputs to ensure everyone succeeded
```

---

## Post-Migration Benefits

After migration, you'll have:

✅ **Dynamic password management** - Change password in `.env`, it updates everywhere
✅ **No hardcoded credentials** - All secrets come from environment variables
✅ **Consistent setup** - Everyone gets the same, correct configuration
✅ **Automatic validation** - Every container start validates database setup
✅ **Better documentation** - Comprehensive guides for troubleshooting
✅ **Future-proof** - Easier to add new environment variables

---

## Still Using Old Setup?

**Security Risk**: Old setup has hardcoded passwords and may have connection issues.

**Please migrate ASAP** - it only takes 5-10 minutes with Option A!

---

**Questions?** See:

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed database documentation
- [REVIEW_FINDINGS.md](./REVIEW_FINDINGS.md) - Full review of changes
- [README.md](./README.md) - DevContainer overview

**Need help?** Create an issue or ask in team chat.

---

**Migration Complete?** ✅ Enjoy your improved development environment!
