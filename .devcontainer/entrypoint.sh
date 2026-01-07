#!/bin/bash
# Devcontainer entrypoint - runs as root to fix permissions, then switches to vscode user
# This ensures correct ownership of directories even when using bind-mounted volumes
set -e

echo "🔧 Initializing devcontainer as root..."

# Fix ownership of workspace and mounted directories
echo "  → Fixing workspace ownership..."
if [ -d "/workspaces/SimpleAccounts-UAE" ]; then
    chown -R vscode:vscode /workspaces/SimpleAccounts-UAE 2>/dev/null || true
fi

echo "  → Fixing config directories ownership..."
# First, create parent directories if they don't exist (with correct ownership from the start)
for dir in /home/vscode/.local /home/vscode/.config /home/vscode/.vscode-server; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        chown vscode:vscode "$dir" 2>/dev/null || true
    fi
done

# Fix ownership of vscode home directories (skip errors for bind-mounted volumes)
# Some directories (like .local) may be bind-mounted volumes that can't be chowned
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

# NOW create subdirectories (parent dirs exist)
# For bind-mounted volumes (like .local), we need to create subdirectories as root
# then chown them, since the parent directory is owned by root
mkdir -p /home/vscode/.local/share/code-server 2>/dev/null || true
mkdir -p /home/vscode/.config/code-server 2>/dev/null || true
mkdir -p /home/vscode/.vscode-server/bin 2>/dev/null || true
mkdir -p /home/vscode/.vscode-server/extensions 2>/dev/null || true

# Fix ownership of subdirectories we created (not the bind-mounted parents)
chown -R vscode:vscode /home/vscode/.local/share/code-server 2>/dev/null || true
chown -R vscode:vscode /home/vscode/.config/code-server 2>/dev/null || true
chown -R vscode:vscode /home/vscode/.vscode-server/bin 2>/dev/null || true
chown -R vscode:vscode /home/vscode/.vscode-server/extensions 2>/dev/null || true

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
