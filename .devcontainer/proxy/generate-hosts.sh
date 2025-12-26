#!/bin/bash
# =============================================================================
# Generate /etc/hosts entries for all active dev users
# =============================================================================
# Usage: ./generate-hosts.sh [server-ip]
# Example: ./generate-hosts.sh 192.168.1.100
# =============================================================================

SERVER_IP="${1:-127.0.0.1}"
DOMAIN="dev.simpleaccounts.local"

echo "# ============================================="
echo "# SimpleAccounts Dev Environment"
echo "# Generated: $(date)"
echo "# Add these lines to /etc/hosts"
echo "# ============================================="
echo ""

# Proxy dashboard
echo "$SERVER_IP  proxy.$DOMAIN"

# Find all active dev containers
for container in $(docker ps --filter "name=dev-" --format "{{.Names}}" | grep -v "dev-proxy"); do
    username="${container#dev-}"
    echo "$SERVER_IP  $username.$DOMAIN"
    echo "$SERVER_IP  $username-api.$DOMAIN"
done

echo ""
echo "# ============================================="
