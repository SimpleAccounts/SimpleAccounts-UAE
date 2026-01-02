# Coder Workspace Update Instructions

## Problem

`/home/vscode/.claude.json` is a directory instead of a file, causing:

```
Error: EISDIR: illegal operation on a directory, open '/home/vscode/.claude.json'
```

## Solution

Your workspace needs to be rebuilt with the updated Coder template (PR #442).

---

## ✅ Permanent Fix - Option 1: Automated Script

### Step 1: Copy the script to dev-server

```bash
# On your Mac
scp update-coder-template.sh dev-server:~/
```

### Step 2: Run the script on dev-server

```bash
# SSH to dev-server
ssh dev-server

# Run the update script
bash ~/update-coder-template.sh
```

The script will:

- ✅ Pull latest changes from develop (includes PR #442)
- ✅ Update the Coder template
- ✅ Guide you through rebuilding your workspace
- ✅ Preserve all your code and settings

---

## ✅ Permanent Fix - Option 2: Manual Steps

### Step 1: SSH to dev-server

```bash
ssh dev-server
```

### Step 2: Update the repository

```bash
cd /home/coder/workspaces/$(whoami)/SimpleAccounts-UAE
git fetch origin develop
git checkout develop
git pull origin develop
```

### Step 3: Update Coder template

```bash
cd .coder
coder templates push
```

You should see output like:

```
✓ Template pushed successfully!
```

### Step 4: Find your workspace name

```bash
coder list
```

Example output:

```
NAME                          STATUS  LAST BUILT
MohsinHashmi-DataInn          Running 2h ago
```

### Step 5: Rebuild your workspace

```bash
# Replace with your actual workspace name from step 4
WORKSPACE_NAME="MohsinHashmi-DataInn"

# Stop workspace
coder stop $WORKSPACE_NAME

# Delete workspace (your code is safe in /home/coder/workspaces/)
coder delete $WORKSPACE_NAME --force

# Recreate with new template
coder create $WORKSPACE_NAME
```

### Step 6: Verify the fix

```bash
# Connect to your new workspace
coder ssh $WORKSPACE_NAME

# Check .claude.json is now a FILE (not directory)
ls -la /home/vscode/.claude.json
# Should show: -rw-r--r-- (file, not drwxr-xr-x)

# Verify contents
cat /home/vscode/.claude.json
# Should show: {}

# Check .claude directory exists
ls -la /home/vscode/.claude/
# Should be a directory

# Test Claude CLI
claude
# Should work without EISDIR error!
```

---

## 🔍 Verify Host-Side Files Were Created

```bash
# On dev-server, check host directories
ls -la /home/coder/.coder-mount/$(whoami)/claude/

# Should show:
# -rw-r--r-- .claude.json (file)
# drwxr-xr-x .claude/ (directory)
```

---

## 📋 What Got Fixed

The updated template (PR #442) includes:

1. **Host Directory Provisioner** (`null_resource.host_directories`)
   - Creates directories on host BEFORE container starts
   - Initializes `.claude.json` with `{}`
   - Sets proper ownership

2. **Correct Volume Mounts**

   ```terraform
   # File mount
   /home/coder/.coder-mount/<user>/claude/.claude.json
     → /home/vscode/.claude.json

   # Directory mount
   /home/coder/.coder-mount/<user>/claude/.claude
     → /home/vscode/.claude/
   ```

3. **Permission Fixing**
   - Startup script fixes ownership for both files and directories
   - Uses `-e` test instead of `-d` to handle both types

---

## ⚠️ Temporary Fix (Not Recommended)

If you can't rebuild now, you can temporarily fix it in the devcontainer:

```bash
# In devcontainer
sudo rm -rf /home/vscode/.claude.json
echo '{}' | sudo tee /home/vscode/.claude.json > /dev/null
sudo chown vscode:vscode /home/vscode/.claude.json

# Test
claude
```

**Note:** This will be lost when the container restarts!

---

## ❓ Troubleshooting

### "Template push failed"

```bash
cd /home/coder/workspaces/$(whoami)/SimpleAccounts-UAE/.coder
coder templates push --verbose
```

### "Workspace not found"

```bash
coder list
# Use exact name from output
```

### "Permission denied"

```bash
# Ensure you're on dev-server as your user
whoami
# Should match your Coder username
```

### Still getting EISDIR after rebuild

```bash
# Check mounts in container
mount | grep claude

# Check if file/directory types are correct
ls -ld /home/vscode/.claude.json  # Should be: -rw-r--r-- (file)
ls -ld /home/vscode/.claude        # Should be: drwxr-xr-x (dir)
```

---

## 📞 Need Help?

If you encounter issues:

1. Check the diagnostic output: `bash diagnose-mounts.sh`
2. Verify template was updated: `git log -1 /home/coder/workspaces/$(whoami)/SimpleAccounts-UAE/.coder/template.tf`
3. Check Coder logs: `coder logs <workspace-name>`
