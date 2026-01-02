# Dev-Server Permission Analysis & Verification

## Current State (Confirmed Issues)

### Container Status

```
Container: simpleaccounts-uae_devcontainer-devcontainer-1
Current User: root (UID 0, GID 0)
vscode user exists: UID 1000, GID 1000
```

### Host Environment

```
Host User: mohsin (UID 1000, GID 1000)
Host OS: Linux (dev-server)
```

### ✅ What Works Now (Running as root)

- Maven cache (.m2) - owned by vscode
- NPM cache (.npm) - owned by vscode
- Container can access everything as root

### ❌ Confirmed Permission Issues (When switching to vscode user)

#### 1. Workspace Directory

```bash
# Host
/workspaces/SimpleAccounts-UAE: root:root (UID 0, GID 0)

# Container as vscode
$ touch /workspaces/SimpleAccounts-UAE/test-write
touch: cannot touch '/workspaces/SimpleAccounts-UAE/test-write': Permission denied
```

#### 2. Config Directories (All bind-mounted from /root/.devcontainer-mount/)

```
Host Location: /root/.devcontainer-mount/
Ownership: root:root (UID 0, GID 0)

Affected directories:
- /home/vscode/.claude         → FAILED
- /home/vscode/.bash_history_dir → FAILED
- /home/vscode/.gitconfig_dir  → FAILED
- /home/vscode/.ssh            → FAILED
- /home/vscode/.aws            → FAILED
- /home/vscode/.azure          → FAILED
- /home/vscode/.docker         → FAILED
- /home/vscode/.kube           → FAILED
- /home/vscode/.gemini         → FAILED
- /home/vscode/.codex          → FAILED
```

**Test Results:**

```bash
# As vscode user
$ touch /home/vscode/.claude/test-write
touch: cannot touch '/home/vscode/.claude/test-write': Permission denied

$ touch /home/vscode/.bash_history_dir/test-write
touch: cannot touch '/home/vscode/.bash_history_dir/test-write': Permission denied
```

## Why This Happens

### Bind Mount Ownership

When Docker bind-mounts a directory:

1. The UID/GID from the HOST is preserved in the container
2. Host directories owned by root (UID 0) appear as owned by root in container
3. Container vscode user (UID 1000) ≠ root (UID 0) → Permission denied

### UID Matching

On this Linux dev-server:

- Host user: mohsin (UID 1000) ✓
- Container vscode: (UID 1000) ✓
- **UIDs match!** This is GOOD

The problem: Directories are owned by root (UID 0), not by UID 1000.

## Solution Strategy

### Option 1: Fix Host Directory Ownership (Recommended for dev-server)

Change ownership of host directories to match the host user (UID 1000).

```bash
# On dev-server host
sudo chown -R 1000:1000 /root/.devcontainer-mount/
sudo chown -R 1000:1000 /workspaces/SimpleAccounts-UAE/
```

This works because:

- Host user mohsin: UID 1000
- Container vscode: UID 1000
- Directories owned by UID 1000 → accessible by both!

### Option 2: Use updateRemoteUserUID (Already added)

The `updateRemoteUserUID: true` setting won't help here because:

- It syncs container UID to match HOST UID
- Host UID is already 1000 (mohsin)
- Container vscode is already 1000
- **UIDs already match!**
- The problem is directory OWNERSHIP, not UID mismatch

### Option 3: Make Directories World-Writable (Not recommended)

```bash
sudo chmod -R 777 /root/.devcontainer-mount/
```

This is insecure and not recommended for production.

### Option 4: Run Container as Root (Current state - Not recommended)

Keep running as root. This works but:

- ❌ Security risk
- ❌ Files created in container are owned by root
- ❌ Not following best practices

## Recommended Fix for Dev-Server

### Step 1: Fix Ownership on Host

```bash
# SSH to dev-server
ssh dev-server

# Fix workspace ownership
sudo chown -R 1000:1000 /workspaces/SimpleAccounts-UAE

# Fix config directories ownership
sudo chown -R 1000:1000 /root/.devcontainer-mount

# Verify
sudo ls -la /root/.devcontainer-mount/
sudo ls -ld /workspaces/SimpleAccounts-UAE
```

### Step 2: Update Docker Compose (Already done)

The docker-compose.yml already builds locally (change applied).

### Step 3: Update devcontainer.json (Already done)

The `updateRemoteUserUID: true` is set, which is still good practice.

### Step 4: Rebuild Container

```bash
# On dev-server
cd /workspaces/SimpleAccounts-UAE
docker compose -f .devcontainer/docker-compose.yml down
docker compose -f .devcontainer/docker-compose.yml build --no-cache
docker compose -f .devcontainer/docker-compose.yml up -d
```

### Step 5: Verify

```bash
# Enter container as vscode user
docker exec -it -u vscode simpleaccounts-uae_devcontainer-devcontainer-1 bash

# Should show vscode, not root
whoami

# Should show UID 1000
id -u

# Test workspace write
touch /workspaces/SimpleAccounts-UAE/test && rm /workspaces/SimpleAccounts-UAE/test

# Test config directory write
touch /home/vscode/.claude/test && rm /home/vscode/.claude/test

# Test bash history
echo "test" >> /home/vscode/.bash_history_dir/bash_history

# All should succeed!
```

## Testing Checklist

After applying fixes:

### Basic Tests

- [ ] Container runs as vscode user (not root)
- [ ] Can write to workspace directory
- [ ] Can write to .claude directory
- [ ] Can write to .bash_history_dir
- [ ] Can write to .gitconfig_dir
- [ ] Can write to .ssh directory (and verify mode 700)
- [ ] Can write to all other config directories

### Functional Tests

- [ ] npm install works in apps/frontend
- [ ] mvnw commands work in apps/backend
- [ ] Git operations work (commit, push, pull)
- [ ] SSH keys work (if configured)
- [ ] Claude CLI config persists
- [ ] Bash history persists between sessions
- [ ] Git config persists

### Integration Tests

- [ ] Can start frontend dev server
- [ ] Can start backend Spring Boot app
- [ ] Can connect to PostgreSQL
- [ ] Can connect to Redis
- [ ] VS Code extensions install correctly

## Key Differences: Dev-Server vs macOS

### Dev-Server (Linux)

- Host user UID: 1000 (mohsin)
- Container vscode UID: 1000
- **UIDs already match!** ✓
- Problem: Directory ownership (owned by root UID 0)
- Solution: `chown` directories to UID 1000

### macOS (Local)

- Host user UID: 503 (moshinhashmi)
- Container vscode UID: 1000
- **UID mismatch!** ✗
- Problem: UID mismatch + directory ownership
- Solution: `updateRemoteUserUID: true` + proper mount setup

## Why Our Fixes Work

### For Dev-Server

1. ✅ `updateRemoteUserUID: true` - No effect (UIDs already match), but harmless
2. ✅ `chown` host directories - **This is the actual fix!**
3. ✅ Local build - Ensures Dockerfile USER vscode is used
4. ✅ Permission validation - Detects issues early

### For macOS

1. ✅ `updateRemoteUserUID: true` - **Critical fix for UID mismatch**
2. ✅ Host directory setup script - Pre-creates with correct permissions
3. ✅ Local build - Ensures Dockerfile USER vscode is used
4. ✅ Permission validation - Detects issues early

## Confidence Score: 9/10

**Why high confidence now:**

- ✅ Confirmed exact UIDs on dev-server (1000 = 1000, they match!)
- ✅ Identified root cause (directory ownership, not UID mismatch)
- ✅ Solution is simple: chown to UID 1000
- ✅ Tested and confirmed permission failures
- ✅ Solution aligns with Docker best practices

**Remaining 1% uncertainty:**

- Need to verify no other processes expect root ownership
- Need to verify VS Code remote doesn't override user setting

## Next Steps

1. **Apply ownership fix on dev-server** (see Step 1 above)
2. **Rebuild container** (see Step 4 above)
3. **Run verification tests** (see Step 5 above)
4. **Report results** - confirm all tests pass
