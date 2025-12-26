#!/bin/bash
#
# SimpleAccounts DevPod Quick Setup (User Version)
#
# This script is for users whose SSH key has already been added by an admin.
# Usage: curl -sSL https://raw.githubusercontent.com/SimpleAccounts/SimpleAccounts-UAE/develop/scripts/user-quick-setup.sh | bash -s -- <username> <server>
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

USERNAME="${1:-}"
SERVER="${2:-65.108.51.136}"
REPO_URL="git@github.com:SimpleAccounts/SimpleAccounts-UAE.git"
WORKSPACE_NAME="simpleaccounts-uae"

if [ -z "$USERNAME" ]; then
    echo -e "${RED}Error: Username required${NC}"
    echo "Usage: $0 <username> [server]"
    exit 1
fi

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       SimpleAccounts DevPod Quick Setup                   ║"
echo "║       User: $USERNAME"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

SSH_HOST="${USERNAME}-devpod"
PROVIDER_NAME="${USERNAME}-ssh"

# Step 1: Install DevPod if needed
echo -e "${BLUE}[1/4] Checking DevPod...${NC}"
if ! command -v devpod &> /dev/null; then
    echo "Installing DevPod..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install devpod
        else
            ARCH=$(uname -m)
            if [ "$ARCH" = "arm64" ]; then
                curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-arm64"
            else
                curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-amd64"
            fi
            sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod
        fi
    else
        curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64"
        sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod
    fi
fi
echo -e "${GREEN}✓ DevPod ready${NC}"

# Step 2: Configure SSH (use existing key or find one)
echo -e "${BLUE}[2/4] Configuring SSH...${NC}"

# Find existing SSH key
SSH_KEY=""
for key in ~/.ssh/id_ed25519 ~/.ssh/id_rsa ~/.ssh/id_ecdsa; do
    if [ -f "$key" ]; then
        SSH_KEY="$key"
        break
    fi
done

if [ -z "$SSH_KEY" ]; then
    echo -e "${RED}No SSH key found. Please create one first:${NC}"
    echo "  ssh-keygen -t ed25519"
    exit 1
fi

# Add SSH config if not exists
SSH_CONFIG="$HOME/.ssh/config"
touch "$SSH_CONFIG" && chmod 600 "$SSH_CONFIG"

if ! grep -q "Host ${SSH_HOST}" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# SimpleAccounts DevPod
Host ${SSH_HOST}
    HostName ${SERVER}
    User ${USERNAME}
    IdentityFile ${SSH_KEY}
    IdentitiesOnly yes
    ServerAliveInterval 30
EOF
fi
echo -e "${GREEN}✓ SSH configured${NC}"

# Step 3: Test connection
echo -e "${BLUE}[3/4] Testing connection...${NC}"
if ssh -o ConnectTimeout=10 -o BatchMode=yes "${SSH_HOST}" 'echo ok' &>/dev/null; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect. Please check:${NC}"
    echo "  1. Your SSH key is added to the server"
    echo "  2. Server $SERVER is accessible"
    echo ""
    echo "Your public key (share with admin if needed):"
    cat "${SSH_KEY}.pub"
    exit 1
fi

# Step 4: Setup DevPod provider and workspace
echo -e "${BLUE}[4/4] Creating workspace...${NC}"

# Add provider
if ! devpod provider list 2>/dev/null | grep -q "$PROVIDER_NAME"; then
    devpod provider add ssh --name "$PROVIDER_NAME" -o HOST="${SSH_HOST}" -o USE_BUILTIN_SSH=true
fi

# Create or start workspace
if devpod list 2>/dev/null | grep -q "$WORKSPACE_NAME"; then
    devpod up "$WORKSPACE_NAME" --ide none
else
    echo "Creating workspace (this takes 5-10 minutes first time)..."
    devpod up "$REPO_URL" --provider "$PROVIDER_NAME" --id "$WORKSPACE_NAME" --ide none
fi

echo -e "${GREEN}✓ Workspace ready${NC}"

# Done!
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                      Ready to Code!                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Open in VS Code:${NC}"
echo "  devpod up $WORKSPACE_NAME --ide vscode"
echo ""
echo -e "${BLUE}Or SSH directly:${NC}"
echo "  ssh ${WORKSPACE_NAME}.devpod"
echo ""
echo -e "${BLUE}Web IDE (after SSH):${NC}"
echo "  http://localhost:8443"
echo ""
