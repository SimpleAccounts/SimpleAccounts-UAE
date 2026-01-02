# Devcontainer User Configuration: Permission Fix Summary

## Problem Identified

The devcontainer was running as `root` user instead of `vscode` user. While the configuration files were set to use `vscode`, there was a critical **UID/GID mismatch** that would cause permission issues.

### UID Mismatch Explained

- **Host (macOS) user**: `moshinhashmi` with UID **503**
- **Container vscode user**: UID **1000** (default)
- **Result**: Files created in container have different ownership than host files

This mismatch causes:

- ❌ Workspace files have wrong permissions
- ❌ Git operations fail or show ownership warnings
- ❌ Bind-mounted config directories are not writable
- ❌ SSH keys have wrong permissions (SSH refuses to work)
- ❌ Bash history and git config not persisted

## Fixes Applied

### 1. ✅ Added `updateRemoteUserUID: true`

**File**: `.devcontainer/devcontainer.json`

This setting tells VS Code to automatically update the container's vscode user UID to match your host UID (503). This is the **recommended solution** for UID mismatches.

```json
"updateRemoteUserUID": true
```

### 2. ✅ Created Host Directory Setup Script

**File**: `.devcontainer/setup-host-dirs.sh`

This script pre-creates all required directories on your host machine with correct permissions.

**Run this ONCE before starting the devcontainer:**

```bash
bash .devcontainer/setup-host-dirs.sh
```

Creates:

- `~/.devcontainer-mount/claude` - Claude CLI config
- `~/.devcontainer-mount/gemini` - Gemini CLI config
- `~/.devcontainer-mount/codex` - Codex CLI config
- `~/.devcontainer-mount/gh` - GitHub CLI config
- `~/.devcontainer-mount/bash-history` - Bash history persistence
- `~/.devcontainer-mount/gitconfig` - Git config persistence
- `~/.devcontainer-mount/ssh` - SSH keys (with mode 700)
- `~/.devcontainer-mount/docker` - Docker config
- `~/.devcontainer-mount/kube` - Kubernetes config
- `~/.devcontainer-mount/aws` - AWS CLI config
- `~/.devcontainer-mount/azure` - Azure CLI config

### 3. ✅ Added Permission Validation

**File**: `.devcontainer/post-create.sh`

Added validation at the end of post-create script to test write access to all critical directories. This will warn you if there are permission issues.

### 4. ✅ Switched to Local Build

**File**: `.devcontainer/docker-compose.yml`

Changed from using prebuilt image to building locally:

```yaml
# image: ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
build:
  context: ..
  dockerfile: .devcontainer/Dockerfile
```

## What Will Work Now

### ✅ Named Volumes (No Issues)

- Maven cache (`/home/vscode/.m2`)
- NPM cache (`/home/vscode/.npm`)
- VS Code extensions (`/home/vscode/.vscode-server/extensions`)

These are container-managed volumes and will work correctly regardless of UID.

### ✅ Bind Mounts (Fixed with updateRemoteUserUID)

- Workspace directory (`/workspaces/SimpleAccounts-UAE`)
- All config directories under `~/.devcontainer-mount/`

With `updateRemoteUserUID: true`, the container's vscode user will have the same UID as your host user, so all bind mounts will have correct permissions.

### ✅ File Operations

- Git commits and operations
- Creating/editing files in workspace
- Installing npm packages
- Running Maven builds
- SSH operations (with correct key permissions)
- Bash history persistence
- Git config persistence

## Step-by-Step Instructions

### First Time Setup

1. **Run the host directory setup script** (only needed once):

   ```bash
   bash .devcontainer/setup-host-dirs.sh
   ```

2. **Rebuild the devcontainer**:
   - In VS Code: `Cmd+Shift+P` → "Dev Containers: Rebuild Container"
   - OR from terminal:
     ```bash
     docker compose -f .devcontainer/docker-compose.yml down
     docker compose -f .devcontainer/docker-compose.yml build --no-cache
     ```

3. **Verify the fix**:
   - Open a terminal in the devcontainer
   - You should see: `vscode ➜ /workspaces/SimpleAccounts-UAE (branch) $`
   - NOT: `root ➜ /workspaces/SimpleAccounts-UAE (branch) $`

4. **Check the permission validation output**:
   - The post-create script will validate all directories
   - Look for ✓ checkmarks for all directories
   - If you see ❌ warnings, there may still be permission issues

### Verifying Everything Works

```bash
# Check your user
whoami
# Expected: vscode

# Check your UID (should match host UID: 503)
id -u
# Expected: 503

# Test workspace write
touch /workspaces/SimpleAccounts-UAE/test-file && rm /workspaces/SimpleAccounts-UAE/test-file
# Should succeed without errors

# Test Maven
cd apps/backend && ./mvnw --version
# Should show Maven version

# Test npm
cd apps/frontend && npm --version
# Should show npm version

# Test git
git config --global user.name "Your Name"
git status
# Should work without permission errors
```

## Confidence Level: 8/10

With `updateRemoteUserUID: true` added, the confidence level increases from **4/10 to 8/10**.

### Why Not 10/10?

- **Docker Desktop behavior**: macOS Docker Desktop has its own file sharing layer that may behave differently
- **First-time vs rebuild**: Some edge cases with existing volumes
- **SSH key permissions**: Need to verify SSH works with mounted keys

### What Could Still Go Wrong?

1. **Docker Desktop not configured correctly**: Ensure file sharing is enabled for your home directory
2. **Existing volumes with wrong ownership**: May need to delete and recreate volumes
3. **SSH key permissions**: SSH is very strict about permissions (mode 600 for keys, 700 for .ssh directory)

## Troubleshooting

### Issue: Still running as root

**Check**: Is `updateRemoteUserUID: true` in devcontainer.json?

**Fix**: Ensure the setting is present and rebuild the container completely:

```bash
docker compose -f .devcontainer/docker-compose.yml down -v  # -v removes volumes
docker compose -f .devcontainer/docker-compose.yml build --no-cache
```

### Issue: Permission denied errors

**Check**: Did you run `setup-host-dirs.sh`?

**Fix**:

```bash
bash .devcontainer/setup-host-dirs.sh
# Then rebuild container
```

### Issue: UID is still 1000 instead of 503

**Check**: Is Docker Desktop file sharing enabled?

**Fix**:

1. Docker Desktop → Settings → Resources → File Sharing
2. Ensure `/Users` is in the list
3. Restart Docker Desktop

### Issue: SSH doesn't work

**Check**: SSH key permissions

**Fix**:

```bash
# On host
chmod 700 ~/.devcontainer-mount/ssh
chmod 600 ~/.devcontainer-mount/ssh/id_*
chmod 644 ~/.devcontainer-mount/ssh/id_*.pub
```

### Issue: Git operations fail

**Check**: Git config file exists and is writable

**Fix**:

```bash
# In container
touch ~/.gitconfig_dir/gitconfig
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Additional Resources

- [VS Code updateRemoteUserUID documentation](https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user#_specifying-a-user-for-vs-code)
- [Docker file permissions documentation](https://docs.docker.com/desktop/mac/#file-sharing)
- [Understanding Linux file permissions](https://www.redhat.com/sysadmin/linux-file-permissions-explained)

## Summary

The configuration is now **much more robust** with:

- ✅ Automatic UID synchronization (`updateRemoteUserUID: true`)
- ✅ Host directory pre-creation script
- ✅ Permission validation in post-create
- ✅ Local build instead of potentially outdated prebuilt image

The main fix (`updateRemoteUserUID: true`) solves the core UID mismatch problem and should make everything work smoothly on macOS with Docker Desktop.
