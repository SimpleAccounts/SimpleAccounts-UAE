#!/bin/bash
# Devcontainer entrypoint - runs as root to fix permissions, then switches to vscode user
set -e

echo "🔧 Initializing devcontainer as root..."

# Fix ownership of workspace and mounted directories
echo "  → Fixing workspace ownership..."
if [ -d "/workspaces/SimpleAccounts-UAE" ]; then
    chown -R vscode:vscode /workspaces/SimpleAccounts-UAE 2>/dev/null || true
fi

echo "  → Fixing config directories ownership..."
# First, fix ownership of parent directories (they might be bind-mounted or exist from previous runs)
# This must happen BEFORE we try to create subdirectories
for dir in /home/vscode/.claude /home/vscode/.gemini /home/vscode/.codex \
           /home/vscode/.config/gh /home/vscode/.bash_history_dir \
           /home/vscode/.gitconfig_dir /home/vscode/.ssh \
           /home/vscode/.docker /home/vscode/.kube \
           /home/vscode/.aws /home/vscode/.azure \
           /home/vscode/.local /home/vscode/.config \
           /home/vscode/.vscode-server; do
    if [ -d "$dir" ]; then
        chown -R vscode:vscode "$dir" 2>/dev/null || true
    fi
done

# NOW create subdirectories (after parent directories have correct ownership)
mkdir -p /home/vscode/.local/share/code-server \
         /home/vscode/.config/code-server \
         /home/vscode/.vscode-server/bin \
         /home/vscode/.vscode-server/extensions 2>/dev/null || true

# Fix ownership of newly created directories
chown -R vscode:vscode /home/vscode/.local \
                       /home/vscode/.config \
                       /home/vscode/.vscode-server 2>/dev/null || true

# Ensure SSH directory has correct permissions if it exists
if [ -d "/home/vscode/.ssh" ]; then
    echo "  → Setting SSH permissions..."
    chmod 700 /home/vscode/.ssh 2>/dev/null || true
    # Fix key permissions if any exist
    find /home/vscode/.ssh -type f -name "id_*" ! -name "*.pub" -exec chmod 600 {} \; 2>/dev/null || true
    find /home/vscode/.ssh -type f -name "*.pub" -exec chmod 644 {} \; 2>/dev/null || true
fi

echo "✅ Permissions fixed!"
echo "🔄 Switching to vscode user..."
echo ""

# Switch to vscode user and execute the command
# If running as root, switch to vscode. Otherwise, just exec.
if [ "$(id -u)" = "0" ]; then
    # Running as root - switch to vscode user and run the command
    # Use runuser which is designed for this purpose (better than su for scripts)
    exec runuser -u vscode -- "$@"
else
    # Already running as non-root - just exec
    exec "$@"
fi
