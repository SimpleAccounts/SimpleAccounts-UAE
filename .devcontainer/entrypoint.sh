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
# Fix all vscode home directories that might be bind-mounted
for dir in /home/vscode/.claude /home/vscode/.gemini /home/vscode/.codex \
           /home/vscode/.config/gh /home/vscode/.bash_history_dir \
           /home/vscode/.gitconfig_dir /home/vscode/.ssh \
           /home/vscode/.docker /home/vscode/.kube \
           /home/vscode/.aws /home/vscode/.azure; do
    if [ -d "$dir" ]; then
        chown -R vscode:vscode "$dir" 2>/dev/null || true
    fi
done

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
