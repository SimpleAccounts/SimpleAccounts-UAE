#!/bin/bash
#
# SimpleAccounts DevPod One-Click Setup
#
# Usage: curl -sSL https://raw.githubusercontent.com/SimpleAccounts/SimpleAccounts-UAE/develop/scripts/devpod-setup.sh | bash
#
# Or download and run:
#   ./devpod-setup.sh [username] [server]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_SERVER="65.108.51.136"
REPO_URL="git@github.com:SimpleAccounts/SimpleAccounts-UAE.git"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       SimpleAccounts DevPod One-Click Setup               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get username
if [ -n "$1" ]; then
    USERNAME="$1"
else
    echo -e "${YELLOW}Enter your username (e.g., john):${NC}"
    read -r USERNAME
fi

# Get server
if [ -n "$2" ]; then
    SERVER="$2"
else
    echo -e "${YELLOW}Enter server address [${DEFAULT_SERVER}]:${NC}"
    read -r SERVER
    SERVER="${SERVER:-$DEFAULT_SERVER}"
fi

SSH_KEY_PATH="$HOME/.ssh/id_ed25519_${USERNAME}_devpod"
SSH_HOST="${USERNAME}-devpod"
PROVIDER_NAME="${USERNAME}-ssh"
WORKSPACE_NAME="simpleaccounts-uae"

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Username:  $USERNAME"
echo "  Server:    $SERVER"
echo "  SSH Key:   $SSH_KEY_PATH"
echo "  Provider:  $PROVIDER_NAME"
echo ""

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"

# Check for DevPod
if ! command -v devpod &> /dev/null; then
    echo -e "${YELLOW}DevPod not found. Installing...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install devpod
        else
            curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-arm64"
            sudo install -c -m 0755 devpod /usr/local/bin
            rm -f devpod
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64"
        sudo install -c -m 0755 devpod /usr/local/bin
        rm -f devpod
    else
        echo -e "${RED}Unsupported OS. Please install DevPod manually: https://devpod.sh${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ DevPod installed${NC}"
else
    echo -e "${GREEN}✓ DevPod found: $(devpod version 2>/dev/null || echo 'installed')${NC}"
fi

# Step 2: Generate SSH key if not exists
echo -e "${BLUE}[2/7] Setting up SSH key...${NC}"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${GREEN}✓ SSH key already exists${NC}"
else
    echo "Generating new SSH key..."
    ssh-keygen -t ed25519 -C "${USERNAME}@simpleaccounts.io" -f "$SSH_KEY_PATH" -N ""
    echo -e "${GREEN}✓ SSH key generated${NC}"
fi

# Step 3: Copy SSH key to server
echo -e "${BLUE}[3/7] Copying SSH key to server...${NC}"
echo -e "${YELLOW}You may be prompted for your server password:${NC}"

if ssh-copy-id -i "${SSH_KEY_PATH}.pub" "${USERNAME}@${SERVER}" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH key copied to server${NC}"
else
    echo -e "${YELLOW}Could not auto-copy. Please manually add this key to the server:${NC}"
    echo ""
    cat "${SSH_KEY_PATH}.pub"
    echo ""
    echo -e "${YELLOW}Press Enter once the key is added to the server...${NC}"
    read -r
fi

# Step 4: Configure SSH
echo -e "${BLUE}[4/7] Configuring SSH...${NC}"

SSH_CONFIG="$HOME/.ssh/config"
touch "$SSH_CONFIG"
chmod 600 "$SSH_CONFIG"

if grep -q "Host ${SSH_HOST}" "$SSH_CONFIG" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH config already exists${NC}"
else
    cat >> "$SSH_CONFIG" << EOF

# SimpleAccounts DevPod - Added by setup script
Host ${SSH_HOST}
    HostName ${SERVER}
    User ${USERNAME}
    IdentityFile ${SSH_KEY_PATH}
    IdentitiesOnly yes
    ServerAliveInterval 30
    ServerAliveCountMax 3
EOF
    echo -e "${GREEN}✓ SSH config added${NC}"
fi

# Step 5: Test SSH connection
echo -e "${BLUE}[5/7] Testing SSH connection...${NC}"

if ssh -o ConnectTimeout=10 -o BatchMode=yes "${SSH_HOST}" 'echo "SSH OK"' &>/dev/null; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ SSH connection failed. Please check:${NC}"
    echo "  1. Your username and server are correct"
    echo "  2. Your SSH key is added to the server"
    echo "  3. The server is accessible"
    exit 1
fi

# Step 6: Add DevPod provider
echo -e "${BLUE}[6/7] Setting up DevPod provider...${NC}"

# Check if provider exists
if devpod provider list 2>/dev/null | grep -q "$PROVIDER_NAME"; then
    echo -e "${GREEN}✓ Provider already exists${NC}"
else
    devpod provider add ssh \
        --name "$PROVIDER_NAME" \
        -o HOST="${SSH_HOST}" \
        -o USE_BUILTIN_SSH=true
    echo -e "${GREEN}✓ Provider added${NC}"
fi

# Step 7: Create workspace
echo -e "${BLUE}[7/7] Creating DevPod workspace...${NC}"

# Check if workspace exists
if devpod list 2>/dev/null | grep -q "$WORKSPACE_NAME"; then
    echo -e "${YELLOW}Workspace already exists. Starting it...${NC}"
    devpod up "$WORKSPACE_NAME" --ide none
else
    echo "Creating new workspace (this may take 5-10 minutes on first run)..."
    devpod up "$REPO_URL" \
        --provider "$PROVIDER_NAME" \
        --id "$WORKSPACE_NAME" \
        --ide none
fi

echo -e "${GREEN}✓ Workspace created${NC}"

# Done!
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo ""
echo "  # SSH into workspace"
echo "  ssh ${WORKSPACE_NAME}.devpod"
echo ""
echo "  # Open in VS Code"
echo "  devpod up ${WORKSPACE_NAME} --ide vscode"
echo ""
echo "  # Open in browser (code-server)"
echo "  # After SSH: http://localhost:8443"
echo ""
echo "  # Stop workspace"
echo "  devpod stop ${WORKSPACE_NAME}"
echo ""
echo "  # Delete workspace"
echo "  devpod delete ${WORKSPACE_NAME}"
echo ""
echo -e "${BLUE}First-time setup (run inside workspace):${NC}"
echo ""
echo "  # Authenticate GitHub"
echo "  gh auth login"
echo ""
echo "  # Authenticate Claude (if needed)"
echo "  claude"
echo ""
echo -e "${YELLOW}Tip: Bookmark this command for future use:${NC}"
echo "  devpod up ${WORKSPACE_NAME} --ide vscode"
echo ""
