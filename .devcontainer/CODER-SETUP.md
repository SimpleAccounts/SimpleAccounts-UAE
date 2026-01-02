# Coder Workspace Setup

## One-Time Permission Fix

When creating a new Coder workspace, run this once to fix directory permissions:

```bash
# Fix ownership of workspace and config directories
sudo chown -R 1000:1000 /workspaces/SimpleAccounts-UAE
sudo chown -R 1000:1000 $HOME/.devcontainer-mount

# Set SSH directory permissions
sudo chmod 700 $HOME/.ssh 2>/dev/null || true
```

Or use the automated script:

```bash
sudo bash .devcontainer/fix-dev-server-permissions.sh
```

## Verify Permissions

After starting the devcontainer:

```bash
bash .devcontainer/verify-permissions.sh
```

All tests should pass with ✅ marks.

## CI/CD: Building the Prebuilt Image

The Dockerfile already sets `USER vscode` as the final user (line 165).
Ensure your CI/CD pipeline builds and pushes to:

```
ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
```

## Key Configuration

- **remoteUser**: `vscode` (UID 1000)
- **updateRemoteUserUID**: `true` (syncs container UID with host)
- **Dockerfile**: Sets `USER vscode` as default

This ensures the container runs as non-root with proper permissions.
