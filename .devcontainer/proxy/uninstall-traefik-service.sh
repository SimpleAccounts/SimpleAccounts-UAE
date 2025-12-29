#!/bin/bash
# =============================================================================
# Uninstall Traefik systemd service
# =============================================================================
# Usage: sudo ./uninstall-traefik-service.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root: sudo $0${NC}"
    exit 1
fi

INSTALL_DIR="/opt/simpleaccounts-proxy"

echo -e "${YELLOW}Uninstalling Traefik Proxy Service...${NC}"

# Stop and disable service
if systemctl is-active --quiet traefik-proxy.service 2>/dev/null; then
    echo "Stopping Traefik..."
    systemctl stop traefik-proxy.service
fi

if systemctl is-enabled --quiet traefik-proxy.service 2>/dev/null; then
    echo "Disabling service..."
    systemctl disable traefik-proxy.service
fi

# Remove systemd service file
if [ -f /etc/systemd/system/traefik-proxy.service ]; then
    rm /etc/systemd/system/traefik-proxy.service
    echo -e "${GREEN}✓ Removed systemd service${NC}"
fi

# Reload systemd
systemctl daemon-reload

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo -e "${GREEN}✓ Removed $INSTALL_DIR${NC}"
fi

# Remove Docker network (if no containers using it)
if docker network ls | grep -q "dev-proxy-network"; then
    if docker network inspect dev-proxy-network --format '{{len .Containers}}' | grep -q "^0$"; then
        docker network rm dev-proxy-network 2>/dev/null || true
        echo -e "${GREEN}✓ Removed dev-proxy-network${NC}"
    else
        echo -e "${YELLOW}⚠ dev-proxy-network still has containers attached, keeping it${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Traefik proxy service has been uninstalled.${NC}"
