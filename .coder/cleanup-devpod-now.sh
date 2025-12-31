#!/bin/bash
# Quick DevPod Cleanup Script - No Backup
# Run this on dev-server to remove all DevPod resources immediately

set -e

echo "========================================"
echo "DevPod Cleanup (No Backup)"
echo "========================================"
echo ""

# Stop containers
echo "→ Stopping all DevPod containers..."
docker stop $(docker ps -q --filter "name=dev-") 2>/dev/null || echo "  No running containers"
docker stop $(docker ps -q --filter "name=db-") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=redis-") 2>/dev/null || true

# Remove containers
echo "→ Removing all DevPod containers..."
docker rm -f $(docker ps -aq --filter "name=dev-") 2>/dev/null || echo "  No containers to remove"
docker rm -f $(docker ps -aq --filter "name=db-") 2>/dev/null || true
docker rm -f $(docker ps -aq --filter "name=redis-") 2>/dev/null || true

# Remove volumes
echo "→ Removing all DevPod volumes..."
docker volume rm $(docker volume ls -q | grep -E "devpod") 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep -E "postgres-data") 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep -E "redis-data") 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep -E "vscode-extensions") 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep -E "maven-cache") 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep -E "npm-cache") 2>/dev/null || true

# Remove networks
echo "→ Removing all DevPod networks..."
docker network rm $(docker network ls -q --filter "name=-internal") 2>/dev/null || echo "  No networks to remove"

# Migrate credentials to Coder mount
echo "→ Migrating credentials to Coder..."
mkdir -p /home/coder/.coder-mount

for user_home in /home/*; do
  user=$(basename "$user_home")
  if [ -d "$user_home/.devpod-mount" ]; then
    echo "  Migrating $user..."
    mkdir -p /home/coder/.coder-mount/$user
    cp -r $user_home/.devpod-mount/* /home/coder/.coder-mount/$user/ 2>/dev/null || true
    chown -R coder:coder /home/coder/.coder-mount/$user 2>/dev/null || true
  fi
done

# Remove DevPod directories
echo "→ Removing DevPod directories..."
rm -rf /home/*/.devpod 2>/dev/null || true
rm -rf /home/*/.devpod-mount 2>/dev/null || true

# Clean up unused Docker resources
echo "→ Cleaning up unused Docker resources..."
docker system prune -af --volumes > /dev/null 2>&1 || true

echo ""
echo "✅ DevPod cleanup complete!"
echo ""
echo "Verification:"
echo "  Remaining DevPod containers: $(docker ps -a | grep -c 'dev-' || echo 0)"
echo "  Remaining DevPod volumes: $(docker volume ls | grep -c 'devpod' || echo 0)"
echo "  Remaining DevPod networks: $(docker network ls | grep -c 'internal' || echo 0)"
echo ""
echo "Freed disk space:"
docker system df
echo ""
echo "Next steps:"
echo "  1. Deploy Coder template: cd /path/to/repo/.coder && ./deploy.sh"
echo "  2. Create test workspace at https://coder.dev.simpleaccounts.io"
echo ""
