#!/bin/bash
# =============================================================================
# Install Traefik as a systemd service
# =============================================================================
# This script installs Traefik as a system service that starts automatically
# on boot and runs continuously to route traffic to dev containers.
#
# Usage: sudo ./install-traefik-service.sh
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root: sudo $0"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/opt/simpleaccounts-proxy"

print_header "Installing Traefik Proxy Service"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
print_success "Docker Compose is installed"

# Create installation directory
echo ""
echo "Setting up installation directory..."
mkdir -p "$INSTALL_DIR"
print_success "Created $INSTALL_DIR"

# Copy docker-compose file
cp "$SCRIPT_DIR/docker-compose.proxy.yml" "$INSTALL_DIR/"
print_success "Copied docker-compose.proxy.yml"

# Install systemd service
echo ""
echo "Installing systemd service..."
cp "$SCRIPT_DIR/traefik.service" /etc/systemd/system/traefik-proxy.service
print_success "Installed traefik-proxy.service"

# Reload systemd
systemctl daemon-reload
print_success "Reloaded systemd daemon"

# Enable service to start on boot
systemctl enable traefik-proxy.service
print_success "Enabled traefik-proxy service (starts on boot)"

# Start the service
echo ""
echo "Starting Traefik..."
systemctl start traefik-proxy.service

# Wait for container to be ready
sleep 3

# Check status
if systemctl is-active --quiet traefik-proxy.service; then
    print_success "Traefik proxy is running!"
else
    print_error "Failed to start Traefik. Check logs with: journalctl -u traefik-proxy.service"
    exit 1
fi

# Detect server IP
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
fi
NIP_IP=$(echo "$SERVER_IP" | tr '.' '-')

# Print summary
print_header "Installation Complete!"
echo ""
echo -e "Traefik is now running as a system service."
echo ""
echo -e "${YELLOW}Service Management:${NC}"
echo -e "  Status:  ${GREEN}sudo systemctl status traefik-proxy${NC}"
echo -e "  Stop:    ${GREEN}sudo systemctl stop traefik-proxy${NC}"
echo -e "  Start:   ${GREEN}sudo systemctl start traefik-proxy${NC}"
echo -e "  Restart: ${GREEN}sudo systemctl restart traefik-proxy${NC}"
echo -e "  Logs:    ${GREEN}journalctl -u traefik-proxy -f${NC}"
echo ""
echo -e "${YELLOW}Dashboard:${NC}"
echo -e "  http://proxy.${NIP_IP}.nip.io:8090"
echo -e "  http://localhost:8090"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  Each developer runs: ${GREEN}./setup-user.sh <username>${NC}"
echo ""
