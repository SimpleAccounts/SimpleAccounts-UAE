# Coder Workspace Setup

## ✅ Fully Automated - Zero Manual Steps Required

This devcontainer is now **fully automated**. When you create a Coder workspace:

1. Container starts as root
2. Entrypoint script automatically fixes all permissions
3. Container switches to vscode user
4. Everything works immediately

**No manual commands needed!**

## Verify Permissions (Optional)

To verify everything is working correctly:

```bash
bash .devcontainer/verify-permissions.sh
```

All tests should pass with ✅ marks.

## CI/CD: Building the Prebuilt Image

Ensure your CI/CD pipeline builds and pushes to:

```
ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
```

Example:

```bash
docker build -f .devcontainer/Dockerfile \
  -t ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest .
docker push ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
```

## How It Works

1. **Container starts as root** (Dockerfile)
2. **Entrypoint runs** (`/usr/local/bin/entrypoint.sh`)
   - Fixes workspace ownership → `vscode:vscode`
   - Fixes config directory ownership → `vscode:vscode`
   - Sets SSH permissions → `700` for `.ssh`, `600` for keys
3. **Switches to vscode user** and executes command
4. **VS Code connects as vscode** (`remoteUser: vscode`)

## Key Configuration

- **Container startup**: `root` (for permission fixing)
- **Runtime user**: `vscode` (UID 1000) - switched by entrypoint
- **VS Code user**: `vscode` - specified in devcontainer.json
- **updateRemoteUserUID**: `true` (syncs container UID with host)
- **ENTRYPOINT**: Automated permission fixer

## What Gets Fixed Automatically

✅ Workspace directory (`/workspaces/SimpleAccounts-UAE`)
✅ Claude CLI config (`~/.claude`)
✅ Gemini CLI config (`~/.gemini`)
✅ Codex CLI config (`~/.codex`)
✅ GitHub CLI config (`~/.config/gh`)
✅ Bash history (`~/.bash_history_dir`)
✅ Git config (`~/.gitconfig_dir`)
✅ SSH directory (`~/.ssh`) with proper mode 700
✅ Docker config (`~/.docker`)
✅ Kubernetes config (`~/.kube`)
✅ AWS config (`~/.aws`)
✅ Azure config (`~/.azure`)

All automatically owned by `vscode:vscode` (UID 1000) on every container start.
