#!/bin/bash
# Fix permission issues on dev-server for devcontainer
# This script must be run ON THE DEV-SERVER with sudo access

set -e

echo "🔧 Fixing devcontainer permissions on dev-server..."
echo ""

# Check if running on dev-server (not locally)
if [ ! -d "/workspaces/SimpleAccounts-UAE" ]; then
    echo "❌ ERROR: This script must be run ON THE DEV-SERVER"
    echo "   /workspaces/SimpleAccounts-UAE directory not found"
    echo ""
    echo "To run on dev-server:"
    echo "  ssh dev-server"
    echo "  cd /workspaces/SimpleAccounts-UAE"
    echo "  sudo bash .devcontainer/fix-dev-server-permissions.sh"
    exit 1
fi

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ ERROR: This script must be run with sudo"
    echo ""
    echo "Usage:"
    echo "  sudo bash .devcontainer/fix-dev-server-permissions.sh"
    exit 1
fi

echo "📋 Current ownership:"
echo ""
echo "Workspace:"
ls -ld /workspaces/SimpleAccounts-UAE
echo ""
echo "Config directories:"
ls -ld /root/.devcontainer-mount/

echo ""
echo "🔄 Changing ownership to UID 1000 (vscode/mohsin)..."
echo ""

# Fix workspace ownership
echo "  → Fixing /workspaces/SimpleAccounts-UAE..."
chown -R 1000:1000 /workspaces/SimpleAccounts-UAE

# Fix config directories
echo "  → Fixing /root/.devcontainer-mount/..."
chown -R 1000:1000 /root/.devcontainer-mount/

# Ensure .ssh has correct permissions (SSH requires this)
if [ -d "/root/.devcontainer-mount/ssh" ]; then
    echo "  → Setting SSH directory permissions..."
    chmod 700 /root/.devcontainer-mount/ssh
    # If there are any key files, make them restrictive
    find /root/.devcontainer-mount/ssh -type f -name "id_*" ! -name "*.pub" -exec chmod 600 {} \; 2>/dev/null || true
    find /root/.devcontainer-mount/ssh -type f -name "*.pub" -exec chmod 644 {} \; 2>/dev/null || true
fi

echo ""
echo "✅ Ownership fixed!"
echo ""
echo "📋 New ownership:"
echo ""
echo "Workspace:"
ls -ld /workspaces/SimpleAccounts-UAE
echo ""
echo "Config directories:"
ls -la /root/.devcontainer-mount/
echo ""
echo "🎯 Next steps:"
echo "  1. Rebuild the devcontainer:"
echo "     cd /workspaces/SimpleAccounts-UAE"
echo "     docker compose -f .devcontainer/docker-compose.yml down"
echo "     docker compose -f .devcontainer/docker-compose.yml build --no-cache"
echo "     docker compose -f .devcontainer/docker-compose.yml up -d"
echo ""
echo "  2. Verify it works:"
echo "     docker exec -it -u vscode simpleaccounts-uae_devcontainer-devcontainer-1 bash"
echo "     whoami  # Should show 'vscode'"
echo "     touch /workspaces/SimpleAccounts-UAE/test && rm /workspaces/SimpleAccounts-UAE/test"
echo "     touch /home/vscode/.claude/test && rm /home/vscode/.claude/test"
echo ""
