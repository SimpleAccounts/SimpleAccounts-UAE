#!/bin/bash
#
# Admin script to add a new DevPod user
# Run this on the server as root/sudo
#
# Usage: sudo ./admin-add-user.sh <username> "<public-ssh-key>"
#
# Example:
#   sudo ./admin-add-user.sh john "ssh-ed25519 AAAAC3Nza... john@example.com"
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: sudo $0 <username> \"<public-ssh-key>\""
    echo ""
    echo "Example:"
    echo "  sudo $0 john \"ssh-ed25519 AAAAC3Nza... john@example.com\""
    exit 1
fi

USERNAME="$1"
PUBLIC_KEY="$2"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           Adding New DevPod User: $USERNAME"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Create user if not exists
echo -e "${BLUE}[1/5] Creating user account...${NC}"
if id "$USERNAME" &>/dev/null; then
    echo -e "${GREEN}✓ User already exists${NC}"
else
    adduser --disabled-password --gecos "" "$USERNAME"
    echo -e "${GREEN}✓ User created${NC}"
fi

# Step 2: Add SSH key
echo -e "${BLUE}[2/5] Adding SSH key...${NC}"
USER_HOME=$(eval echo "~$USERNAME")
SSH_DIR="$USER_HOME/.ssh"
AUTH_KEYS="$SSH_DIR/authorized_keys"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# Add key if not already present
if grep -q "$PUBLIC_KEY" "$AUTH_KEYS" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH key already exists${NC}"
else
    echo "$PUBLIC_KEY" >> "$AUTH_KEYS"
    chmod 600 "$AUTH_KEYS"
    echo -e "${GREEN}✓ SSH key added${NC}"
fi

chown -R "$USERNAME:$USERNAME" "$SSH_DIR"

# Step 3: Setup DevPod directories
echo -e "${BLUE}[3/5] Setting up DevPod directories...${NC}"
DEVPOD_MOUNT="$USER_HOME/.devpod-mount"

mkdir -p "$DEVPOD_MOUNT"/{.claude,.config/gh,.m2,.npm,.bash_history_dir,.gitconfig_dir}

# Create placeholder files
touch "$DEVPOD_MOUNT/.bash_history_dir/bash_history"
touch "$DEVPOD_MOUNT/.gitconfig_dir/gitconfig"

# Set ownership to UID 1000 (vscode user in container)
chown -R 1000:1000 "$DEVPOD_MOUNT"

echo -e "${GREEN}✓ DevPod directories created${NC}"

# Step 4: Add to docker group
echo -e "${BLUE}[4/5] Adding to docker group...${NC}"
if groups "$USERNAME" | grep -q docker; then
    echo -e "${GREEN}✓ Already in docker group${NC}"
else
    usermod -aG docker "$USERNAME"
    echo -e "${GREEN}✓ Added to docker group${NC}"
fi

# Step 5: Configure passwordless sudo for docker
echo -e "${BLUE}[5/5] Configuring sudo access...${NC}"
SUDOERS_FILE="/etc/sudoers.d/$USERNAME-docker"
if [ -f "$SUDOERS_FILE" ]; then
    echo -e "${GREEN}✓ Sudo already configured${NC}"
else
    echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose" > "$SUDOERS_FILE"
    chmod 440 "$SUDOERS_FILE"
    echo -e "${GREEN}✓ Sudo configured${NC}"
fi

# Generate one-liner for user
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    User Setup Complete!                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}Send this one-liner to the user:${NC}"
echo ""
echo "─────────────────────────────────────────────────────────────"
cat << EOF
curl -sSL https://raw.githubusercontent.com/SimpleAccounts/SimpleAccounts-UAE/develop/scripts/user-quick-setup.sh | bash -s -- $USERNAME $SERVER_IP
EOF
echo "─────────────────────────────────────────────────────────────"
echo ""
echo -e "${BLUE}Or for manual setup, share these details:${NC}"
echo ""
echo "  Server: $SERVER_IP"
echo "  Username: $USERNAME"
echo "  SSH Key: Already configured"
echo ""
echo -e "${BLUE}The user just needs to:${NC}"
echo "  1. Run the one-liner above"
echo "  2. Open VS Code: devpod up simpleaccounts-uae --ide vscode"
echo ""
