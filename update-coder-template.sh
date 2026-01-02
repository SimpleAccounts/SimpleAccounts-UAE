#!/bin/bash
# Script to update Coder template and rebuild workspace with the fix
set -e

echo "================================"
echo "🚀 Coder Workspace Update Script"
echo "================================"
echo ""
echo "This script will:"
echo "  1. Update the Coder template with the latest changes"
echo "  2. Guide you through rebuilding your workspace"
echo ""

# Check if we're running on the Coder host
if [ ! -f "/etc/coder/coder.env" ] && [ ! -d "/home/coder" ]; then
    echo "⚠️  This script should be run on the Coder host (dev-server)"
    echo ""
    echo "Please SSH to dev-server first:"
    echo "  ssh dev-server"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Running on Coder host"
echo ""

# Get workspace information
echo "📋 Current workspaces:"
coder list 2>/dev/null || {
    echo "❌ Could not list workspaces. Are you logged in to Coder?"
    echo "Run: coder login"
    exit 1
}
echo ""

# Prompt for workspace name
read -p "Enter your workspace name to rebuild: " WORKSPACE_NAME

if [ -z "$WORKSPACE_NAME" ]; then
    echo "❌ Workspace name cannot be empty"
    exit 1
fi

echo ""
echo "🔍 Checking workspace status..."
WORKSPACE_STATUS=$(coder show "$WORKSPACE_NAME" 2>/dev/null || echo "NOT_FOUND")

if [ "$WORKSPACE_STATUS" = "NOT_FOUND" ]; then
    echo "❌ Workspace '$WORKSPACE_NAME' not found"
    exit 1
fi

echo "✅ Workspace found: $WORKSPACE_NAME"
echo ""

# Navigate to template directory
TEMPLATE_DIR="/workspaces/SimpleAccounts-UAE/.coder"
if [ ! -d "$TEMPLATE_DIR" ]; then
    TEMPLATE_DIR="/home/coder/workspaces/$(whoami)/SimpleAccounts-UAE/.coder"
fi

if [ ! -d "$TEMPLATE_DIR" ]; then
    echo "❌ Could not find Coder template directory"
    echo "Please specify the path manually:"
    read -p "Template directory path: " TEMPLATE_DIR
fi

echo "📁 Template directory: $TEMPLATE_DIR"
cd "$TEMPLATE_DIR/.." || exit 1

# Pull latest changes
echo ""
echo "📥 Pulling latest changes from develop..."
git fetch origin develop
git checkout develop
git pull origin develop

echo ""
echo "✅ Latest code pulled (including PR #442 fix)"
echo ""

# Update Coder template
echo "🔄 Updating Coder template..."
cd .coder
coder templates push || {
    echo ""
    echo "❌ Failed to push template"
    echo ""
    echo "Try manually:"
    echo "  cd $TEMPLATE_DIR"
    echo "  coder templates push"
    exit 1
}

echo ""
echo "✅ Template updated successfully!"
echo ""

# Confirm rebuild
echo "================================"
echo "⚠️  IMPORTANT: Workspace Rebuild"
echo "================================"
echo ""
echo "To apply the fix, you need to rebuild your workspace."
echo "This will:"
echo "  1. Stop the current workspace"
echo "  2. Delete the workspace container"
echo "  3. Recreate it with the new template"
echo ""
echo "✅ Your code is safe - it's stored in: /home/coder/workspaces/"
echo "✅ Your settings will be persisted in: /home/coder/.coder-mount/"
echo ""
read -p "Proceed with rebuild? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo "ℹ️  Rebuild cancelled. You can rebuild manually later:"
    echo "  coder stop $WORKSPACE_NAME"
    echo "  coder delete $WORKSPACE_NAME --force"
    echo "  coder create $WORKSPACE_NAME"
    exit 0
fi

echo ""
echo "🛑 Stopping workspace..."
coder stop "$WORKSPACE_NAME" || echo "⚠️  Workspace may already be stopped"

echo ""
echo "🗑️  Deleting old workspace container..."
coder delete "$WORKSPACE_NAME" --force || {
    echo "❌ Failed to delete workspace"
    exit 1
}

echo ""
echo "🚀 Creating new workspace with updated template..."
coder create "$WORKSPACE_NAME" || {
    echo "❌ Failed to create workspace"
    echo ""
    echo "You can try manually:"
    echo "  coder create $WORKSPACE_NAME"
    exit 1
}

echo ""
echo "================================"
echo "✅ Workspace Rebuild Complete!"
echo "================================"
echo ""
echo "Your workspace has been rebuilt with the fix for Claude mounting."
echo ""
echo "Next steps:"
echo "  1. Connect to your workspace: coder ssh $WORKSPACE_NAME"
echo "  2. Verify the fix: ls -la /home/vscode/.claude.json"
echo "  3. Test Claude CLI: claude"
echo ""
echo "Expected:"
echo "  - /home/vscode/.claude.json should be a FILE (not directory)"
echo "  - /home/vscode/.claude/ should be a DIRECTORY"
echo "  - claude command should work without EISDIR error"
echo ""
