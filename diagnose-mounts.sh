#!/bin/bash
# Diagnostic script to check Claude mount issue

echo "================================"
echo "🔍 Claude Mount Diagnostics"
echo "================================"
echo ""

echo "1️⃣ Checking /home/vscode/.claude.json"
echo "   Type: $(if [ -f /home/vscode/.claude.json ]; then echo 'FILE ✅'; elif [ -d /home/vscode/.claude.json ]; then echo 'DIRECTORY ❌ (WRONG!)'; else echo 'DOES NOT EXIST ❌'; fi)"
if [ -e /home/vscode/.claude.json ]; then
    echo "   Permissions: $(ls -ld /home/vscode/.claude.json)"
fi
echo ""

echo "2️⃣ Checking /home/vscode/.claude/"
echo "   Type: $(if [ -d /home/vscode/.claude ]; then echo 'DIRECTORY ✅'; elif [ -f /home/vscode/.claude ]; then echo 'FILE ❌ (WRONG!)'; else echo 'DOES NOT EXIST ❌'; fi)"
if [ -e /home/vscode/.claude ]; then
    echo "   Permissions: $(ls -ld /home/vscode/.claude)"
    if [ -d /home/vscode/.claude ]; then
        echo "   Contents: $(ls -la /home/vscode/.claude 2>/dev/null | wc -l) items"
    fi
fi
echo ""

echo "3️⃣ Checking mount points"
mount | grep -E "\.claude" || echo "   No claude mounts found"
echo ""

echo "4️⃣ Host paths (if accessible)"
if [ -d "/home/coder/.coder-mount" ]; then
    echo "   Host mount base exists: ✅"
    USER_DIR=$(ls -d /home/coder/.coder-mount/*/ 2>/dev/null | head -1)
    if [ -n "$USER_DIR" ]; then
        echo "   User directory: $USER_DIR"
        if [ -d "${USER_DIR}claude" ]; then
            echo "   Claude host dir: ✅"
            ls -la "${USER_DIR}claude/" 2>/dev/null
        else
            echo "   Claude host dir: ❌ MISSING"
        fi
    fi
else
    echo "   Host mount not accessible from container (expected)"
fi
echo ""

echo "5️⃣ Current user"
echo "   User: $(whoami)"
echo "   UID: $(id -u)"
echo "   GID: $(id -g)"
echo ""

echo "================================"
echo "🔧 Recommended Fix"
echo "================================"
if [ -d /home/vscode/.claude.json ]; then
    echo "❌ .claude.json is a DIRECTORY (should be FILE)"
    echo ""
    echo "This means the workspace is using the OLD template."
    echo ""
    echo "To fix:"
    echo "1. Stop the Coder workspace"
    echo "2. Update the Coder template: coder templates push"
    echo "3. Rebuild the workspace: coder start <workspace-name>"
    echo ""
    echo "OR manually fix (temporary):"
    echo "sudo rm -rf /home/vscode/.claude.json"
    echo "touch /home/vscode/.claude.json"
    echo "echo '{}' > /home/vscode/.claude.json"
    echo "sudo chown vscode:vscode /home/vscode/.claude.json"
fi
echo "================================"
