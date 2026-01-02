#!/bin/bash
# Verify permissions are working correctly in devcontainer
# Run this INSIDE the devcontainer after rebuild

set -e

echo "🔍 Verifying devcontainer permissions..."
echo ""

# Check current user
CURRENT_USER=$(whoami)
CURRENT_UID=$(id -u)
CURRENT_GID=$(id -g)

echo "📋 User Information:"
echo "  Current user: $CURRENT_USER"
echo "  UID: $CURRENT_UID"
echo "  GID: $CURRENT_GID"
echo ""

if [ "$CURRENT_USER" != "vscode" ]; then
    echo "❌ WARNING: Running as '$CURRENT_USER', expected 'vscode'"
    echo "   This may indicate the container is still running as root"
    echo ""
fi

# Test write access to critical directories
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

test_write() {
    local dir="$1"
    local name="$2"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ ! -d "$dir" ]; then
        echo "  ⚠️  $name: Directory does not exist"
        return
    fi

    if touch "$dir/.write-test" 2>/dev/null; then
        rm "$dir/.write-test"
        echo "  ✅ $name: Writable"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "  ❌ $name: NOT writable (Permission denied)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "🧪 Testing Write Access:"
echo ""

# Workspace
test_write "/workspaces/SimpleAccounts-UAE" "Workspace"

# Config directories
test_write "$HOME/.claude" "Claude CLI config"
test_write "$HOME/.gemini" "Gemini CLI config"
test_write "$HOME/.codex" "Codex CLI config"
test_write "$HOME/.config/gh" "GitHub CLI config"
test_write "$HOME/.bash_history_dir" "Bash history"
test_write "$HOME/.gitconfig_dir" "Git config"
test_write "$HOME/.ssh" "SSH directory"
test_write "$HOME/.docker" "Docker config"
test_write "$HOME/.kube" "Kubernetes config"
test_write "$HOME/.aws" "AWS config"
test_write "$HOME/.azure" "Azure config"

# Cache directories (named volumes)
test_write "$HOME/.m2" "Maven cache"
test_write "$HOME/.npm" "NPM cache"

echo ""
echo "📊 Results:"
echo "  Total tests: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS"
echo "  Failed: $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "✅ All permission tests passed!"
    echo ""
    echo "🎉 Your devcontainer is properly configured!"
    echo ""
    echo "You can now:"
    echo "  - Edit files in the workspace"
    echo "  - Run npm install and Maven builds"
    echo "  - Use git operations"
    echo "  - Use CLI tools (claude, gh, etc.)"
    echo "  - Persist bash history and git config"
    echo ""
    exit 0
else
    echo "❌ Some permission tests failed!"
    echo ""
    echo "This usually means:"
    echo "  1. Host directories have wrong ownership"
    echo "  2. Container is still running as root"
    echo "  3. Container needs to be rebuilt"
    echo ""
    echo "To fix:"
    echo "  1. On dev-server host: sudo bash .devcontainer/fix-dev-server-permissions.sh"
    echo "  2. Rebuild container: docker compose -f .devcontainer/docker-compose.yml down && docker compose -f .devcontainer/docker-compose.yml build --no-cache"
    echo ""
    exit 1
fi
