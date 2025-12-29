#!/bin/bash
# CLI Tools Installation and Update Script
# This script installs/updates various CLI tools to their latest versions
# Run during container start to ensure tools are up-to-date

set -e

echo "🔧 Installing/Updating CLI Tools..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_info() { echo -e "${YELLOW}📦 $1${NC}"; }

# ============================================
# NPM-based CLI Tools
# ============================================

log_info "Updating npm-based CLI tools..."

# Source nvm to ensure npm is available
export NVM_DIR="${HOME}/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "/usr/local/share/nvm/nvm.sh" ] && \. "/usr/local/share/nvm/nvm.sh"

# Use a clean npm config to avoid stale auth tokens blocking public installs
npm_global() {
    NPM_CONFIG_USERCONFIG=/dev/null npm "$@"
}

# Claude Code CLI (Anthropic)
log_info "Checking Claude Code CLI..."
if npm list -g @anthropic-ai/claude-code &>/dev/null; then
    npm_global update -g @anthropic-ai/claude-code 2>/dev/null || true
else
    npm_global install -g @anthropic-ai/claude-code 2>/dev/null || true
fi
CLAUDE_VERSION=$(claude --version 2>/dev/null || echo 'installed')
log_success "Claude Code CLI: $CLAUDE_VERSION"

# Codex CLI (OpenAI)
log_info "Checking Codex CLI..."
if npm list -g @openai/codex &>/dev/null; then
    npm_global update -g @openai/codex 2>/dev/null || true
else
    npm_global install -g @openai/codex 2>/dev/null || true
fi
CODEX_VERSION=$(codex --version 2>/dev/null || echo 'installed')
log_success "Codex CLI: $CODEX_VERSION"

# Gemini CLI (Google)
log_info "Checking Gemini CLI..."
if npm list -g @google/gemini-cli &>/dev/null; then
    npm_global update -g @google/gemini-cli 2>/dev/null || true
else
    npm_global install -g @google/gemini-cli 2>/dev/null || true
fi
GEMINI_VERSION=$(gemini --version 2>/dev/null || echo 'installed')
log_success "Gemini CLI: $GEMINI_VERSION"
<<<<<<< HEAD
=======

# ============================================
# Create/Update Symlinks in /usr/local/bin
# ============================================

log_info "Updating symlinks in /usr/local/bin..."
NVM_BIN="$(npm prefix -g 2>/dev/null)/bin"
if [ -n "$NVM_BIN" ] && [ -d "$NVM_BIN" ]; then
    for tool in claude codex gemini openai; do
        if [ -x "$NVM_BIN/$tool" ]; then
            if command -v sudo &>/dev/null; then
                sudo ln -sf "$NVM_BIN/$tool" /usr/local/bin/$tool 2>/dev/null || true
            fi
        fi
    done
    log_success "Symlinks updated"
else
    log_info "Could not determine npm bin location, skipping symlinks"
fi
>>>>>>> origin/develop

# OpenAI CLI (Python-based, npm package is just the SDK)
log_info "Checking OpenAI CLI..."
if command -v pip3 &>/dev/null; then
    pip3 install --user --upgrade openai 2>/dev/null || true
fi
if npm list -g openai &>/dev/null; then
    npm_global update -g openai 2>/dev/null || true
else
    npm_global install -g openai 2>/dev/null || true
fi
log_success "OpenAI SDK: installed (use 'openai migrate' for SDK commands)"

# ============================================
# GitHub CLI (gh) - Check only, installed via apt
# ============================================

log_info "Checking GitHub CLI..."
if command -v gh &>/dev/null; then
    log_success "GitHub CLI: $(gh --version | head -1)"
else
    log_info "GitHub CLI not found"
fi

# ============================================
# Google Cloud CLI (gcloud)
# ============================================

log_info "Checking Google Cloud CLI..."
if command -v gcloud &>/dev/null; then
    # Update components silently (may fail in some environments)
    gcloud components update --quiet 2>/dev/null || true
    log_success "Google Cloud CLI: $(gcloud --version 2>/dev/null | head -1)"
else
    log_info "Google Cloud CLI not found in PATH"
fi

# ============================================
# Kubernetes CLI (kubectl)
# ============================================

log_info "Checking Kubernetes CLI..."
if command -v kubectl &>/dev/null; then
    KUBECTL_VER=$(kubectl version --client -o json 2>/dev/null | grep -o '"gitVersion": "[^"]*"' | head -1 || kubectl version --client 2>/dev/null | head -1)
    log_success "Kubernetes CLI: $KUBECTL_VER"
else
    log_info "Kubernetes CLI not found"
fi

# ============================================
# PostgreSQL Client (psql) - Check only
# ============================================

log_info "Checking PostgreSQL Client..."
if command -v psql &>/dev/null; then
    log_success "PostgreSQL Client: $(psql --version)"
else
    log_info "PostgreSQL Client not found"
fi

# ============================================
# Cursor CLI - Note: Cursor is an IDE, not a CLI tool
# ============================================

log_info "Checking Cursor..."
# Cursor is primarily an IDE. The 'cursor' command is for opening files in the IDE
# It's typically installed as part of the Cursor IDE installation
if command -v cursor &>/dev/null; then
    log_success "Cursor: available"
else
    if [ -d "/home/vscode/.cursor-server" ] && command -v sudo &>/dev/null; then
        log_info "Installing Cursor CLI shim..."
        sudo tee /usr/local/bin/cursor >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cursor_bin=""
for candidate in /home/vscode/.cursor-server/bin/*/bin/remote-cli/cursor; do
  if [ -x "${candidate}" ]; then
    cursor_bin="${candidate}"
    break
  fi
done
if [ -z "${cursor_bin}" ]; then
  echo "cursor CLI not found. Start Cursor IDE to install the server." >&2
  exit 1
fi
exec "${cursor_bin}" "$@"
EOF
        sudo chmod +x /usr/local/bin/cursor
        sudo ln -sf /usr/local/bin/cursor /usr/local/bin/cursor-agent
        log_success "Cursor: available"
    else
        echo "   Cursor IDE CLI: not installed (install Cursor IDE for 'cursor' command)"
    fi
fi

# ============================================
# Summary
# ============================================

echo ""
echo "🎉 CLI Tools Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  %-14s %s\n" "claude:" "$(claude --version 2>/dev/null || echo 'not configured')"
printf "  %-14s %s\n" "codex:" "$(codex --version 2>/dev/null || echo 'not available')"
printf "  %-14s %s\n" "gemini:" "$(gemini --version 2>/dev/null || echo 'not available')"
printf "  %-14s %s\n" "gh:" "$(gh --version 2>/dev/null | head -1 | sed 's/gh version //' || echo 'not available')"
printf "  %-14s %s\n" "gcloud:" "$(gcloud --version 2>/dev/null | head -1 | sed 's/Google Cloud SDK //' || echo 'not available')"
printf "  %-14s %s\n" "kubectl:" "$(kubectl version --client -o json 2>/dev/null | grep -o '"gitVersion": "[^"]*"' | sed 's/"gitVersion": "//' | sed 's/"//' || echo 'not available')"
printf "  %-14s %s\n" "psql:" "$(psql --version 2>/dev/null | sed 's/psql (PostgreSQL) //' || echo 'not available')"
printf "  %-14s %s\n" "openai:" "$(which openai &>/dev/null && echo 'installed' || echo 'not available')"
printf "  %-14s %s\n" "cursor:" "$(command -v cursor &>/dev/null && echo 'available' || echo 'not available')"
printf "  %-14s %s\n" "cursor-agent:" "$(command -v cursor-agent &>/dev/null && echo 'available' || echo 'not available')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Note: Run 'install-cli-tools' manually to update tools at any time."
