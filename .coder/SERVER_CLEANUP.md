# Dev Server Cleanup: DevPod → Coder Migration

Complete cleanup guide to remove all DevPod-related resources from your dev server.

## ⚠️ Important: Backup First!

Before running cleanup commands, ensure:

- ✅ All users have pushed their code to GitHub
- ✅ Any important database data is backed up
- ✅ All users are aware of the migration
- ✅ No active development sessions running

## Quick Cleanup Script

```bash
#!/bin/bash
# Run this on the dev server to clean up all DevPod resources

echo "🧹 Cleaning up DevPod resources..."

# Stop all DevPod containers
echo "Stopping DevPod containers..."
docker stop $(docker ps -q --filter "label=devpod=true") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=dev-") 2>/dev/null || true

# Remove all DevPod containers
echo "Removing DevPod containers..."
docker rm $(docker ps -aq --filter "label=devpod=true") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=dev-") 2>/dev/null || true

# Remove DevPod volumes
echo "Removing DevPod volumes..."
docker volume rm $(docker volume ls -q --filter "name=devpod-") 2>/dev/null || true
for user in $(ls -d /home/*/.devpod 2>/dev/null | cut -d/ -f3); do
  docker volume rm ${user}-postgres-data 2>/dev/null || true
  docker volume rm ${user}-redis-data 2>/dev/null || true
  docker volume rm ${user}-vscode-extensions 2>/dev/null || true
  docker volume rm ${user}-maven-cache 2>/dev/null || true
  docker volume rm ${user}-npm-cache 2>/dev/null || true
done

# Remove DevPod networks
echo "Removing DevPod networks..."
docker network rm $(docker network ls -q --filter "name=-internal") 2>/dev/null || true

# Clean up DevPod mount directories (preserve credentials)
echo "Cleaning up DevPod directories..."
for user in $(ls -d /home/*/.devpod 2>/dev/null | cut -d/ -f3); do
  # Remove DevPod config but keep credentials
  rm -rf /home/${user}/.devpod 2>/dev/null || true

  # Optionally, migrate credentials to Coder mount
  if [ -d "/home/${user}/.devpod-mount" ]; then
    echo "Migrating ${user} credentials to Coder..."
    mkdir -p /home/coder/.coder-mount/${user}
    cp -r /home/${user}/.devpod-mount/* /home/coder/.coder-mount/${user}/ 2>/dev/null || true
    # Keep .devpod-mount for now as backup
    # rm -rf /home/${user}/.devpod-mount
  fi
done

# Remove DevPod-specific systemd services (if any)
echo "Checking for DevPod systemd services..."
systemctl list-units --type=service | grep devpod | awk '{print $1}' | while read service; do
  sudo systemctl stop $service
  sudo systemctl disable $service
  sudo rm /etc/systemd/system/$service 2>/dev/null || true
done
sudo systemctl daemon-reload

# Clean up dangling images
echo "Cleaning up unused Docker images..."
docker image prune -f

echo "✅ DevPod cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Verify no DevPod containers: docker ps -a | grep dev-"
echo "2. Verify no DevPod volumes: docker volume ls | grep devpod"
echo "3. Deploy Coder template: cd .coder && ./deploy.sh"
```

## Step-by-Step Cleanup

### 1. Stop All DevPod Workspaces

```bash
# List all running DevPod containers
docker ps --filter "name=dev-"

# Stop all DevPod containers
docker stop $(docker ps -q --filter "name=dev-") || true

# Verify all stopped
docker ps | grep dev-
```

### 2. Backup User Data (Optional)

```bash
# For each user, backup their workspace
for user in alice bob carol; do
  # Backup Git repository
  tar -czf /backup/${user}-workspace-$(date +%Y%m%d).tar.gz \
    /home/${user}/workspaces/SimpleAccounts-UAE 2>/dev/null || true

  # Backup database
  docker exec dev-${user}-db pg_dump -U simpleaccounts -d simpleaccounts \
    > /backup/${user}-database-$(date +%Y%m%d).sql 2>/dev/null || true
done
```

### 3. Remove DevPod Containers

```bash
# Remove all dev-* containers
docker rm -f $(docker ps -aq --filter "name=dev-") 2>/dev/null || true

# Remove database containers
docker rm -f $(docker ps -aq --filter "name=db-") 2>/dev/null || true
docker rm -f $(docker ps -aq --filter "name=redis-") 2>/dev/null || true

# Verify removal
docker ps -a | grep -E "dev-|db-|redis-"
```

### 4. Remove DevPod Volumes

```bash
# List all DevPod volumes
docker volume ls | grep -E "devpod|postgres|redis|vscode|maven|npm"

# Remove user-specific volumes
docker volume rm $(docker volume ls -q | grep -E "alice-|bob-|carol-") 2>/dev/null || true

# Remove devpod volumes
docker volume rm $(docker volume ls -q | grep devpod) 2>/dev/null || true

# Verify removal
docker volume ls | grep -E "devpod|alice|bob|carol"
```

### 5. Remove DevPod Networks

```bash
# List DevPod networks
docker network ls | grep -E "internal|devpod"

# Remove user-specific networks
docker network rm $(docker network ls -q --filter "name=-internal") 2>/dev/null || true

# Verify removal
docker network ls | grep internal
```

### 6. Clean Up File System

```bash
# Remove DevPod configuration directories
rm -rf /home/*/.devpod 2>/dev/null || true

# Migrate credentials to Coder (optional but recommended)
for user in $(ls /home); do
  if [ -d "/home/${user}/.devpod-mount" ]; then
    echo "Migrating ${user} credentials..."
    mkdir -p /home/coder/.coder-mount/${user}

    # Copy credentials to Coder mount location
    cp -r /home/${user}/.devpod-mount/* /home/coder/.coder-mount/${user}/ || true
    chown -R coder:coder /home/coder/.coder-mount/${user}

    # Backup old mount (don't delete yet)
    mv /home/${user}/.devpod-mount /home/${user}/.devpod-mount.backup
  fi
done
```

### 7. Remove Traefik DevPod Routes (If Not Using for Coder)

If you're NOT reusing Traefik for Coder:

```bash
# Stop Traefik
sudo systemctl stop traefik-proxy

# Remove Traefik service
cd /path/to/SimpleAccounts-UAE/.devcontainer/proxy
sudo ./uninstall-traefik-service.sh

# Remove Traefik network
docker network rm dev-proxy-network 2>/dev/null || true
```

If you ARE reusing Traefik for Coder (recommended):

- **Keep Traefik running** - no action needed!
- Coder template already includes Traefik labels
- Routes will automatically update

### 8. Clean Up User Accounts (Optional)

If you want to remove Linux user accounts created for DevPod:

```bash
# List users
ls /home

# For each DevPod-only user:
sudo userdel -r <username>  # Removes user and home directory

# Or just disable:
sudo usermod -L <username>  # Locks account
```

⚠️ **Be careful**: Only remove users who were created specifically for DevPod!

### 9. Verify Cleanup

```bash
# Check for remaining DevPod containers
docker ps -a | grep -E "dev-|devpod"

# Check for remaining volumes
docker volume ls | grep -E "devpod|alice|bob|carol"

# Check for remaining networks
docker network ls | grep -E "internal|devpod"

# Check disk usage improvement
docker system df
```

### 10. Optional: Full Docker Cleanup

```bash
# Remove all stopped containers
docker container prune -f

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Remove all unused images
docker image prune -a -f

# Check freed space
docker system df
```

## Automated Cleanup Script

Save this as `cleanup-devpod.sh` and run on the server:

```bash
#!/bin/bash
set -e

echo "========================================"
echo "DevPod to Coder Migration Cleanup"
echo "========================================"
echo ""

# Confirmation
read -p "⚠️  This will remove all DevPod containers, volumes, and networks. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Cleanup cancelled."
  exit 0
fi

echo ""
echo "🧹 Starting cleanup..."

# Stop containers
echo "→ Stopping DevPod containers..."
docker stop $(docker ps -q --filter "name=dev-") 2>/dev/null || echo "  No running containers found"

# Remove containers
echo "→ Removing DevPod containers..."
docker rm $(docker ps -aq --filter "name=dev-") 2>/dev/null || echo "  No containers to remove"
docker rm $(docker ps -aq --filter "name=db-") 2>/dev/null || echo "  No db containers to remove"
docker rm $(docker ps -aq --filter "name=redis-") 2>/dev/null || echo "  No redis containers to remove"

# Remove volumes
echo "→ Removing DevPod volumes..."
docker volume rm $(docker volume ls -q | grep -E "devpod|alice-|bob-|carol-") 2>/dev/null || echo "  No volumes to remove"

# Remove networks
echo "→ Removing DevPod networks..."
docker network rm $(docker network ls -q --filter "name=-internal") 2>/dev/null || echo "  No networks to remove"

# Migrate credentials
echo "→ Migrating user credentials to Coder..."
for user_home in /home/*; do
  user=$(basename "$user_home")
  if [ -d "$user_home/.devpod-mount" ]; then
    echo "  Migrating $user..."
    mkdir -p /home/coder/.coder-mount/$user
    cp -r $user_home/.devpod-mount/* /home/coder/.coder-mount/$user/ 2>/dev/null || true
    chown -R coder:coder /home/coder/.coder-mount/$user 2>/dev/null || true
    mv $user_home/.devpod-mount $user_home/.devpod-mount.backup
  fi
done

# Clean up dangling resources
echo "→ Cleaning up unused Docker resources..."
docker system prune -f > /dev/null 2>&1

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Summary:"
docker ps -a | grep -E "dev-|devpod" | wc -l | xargs echo "  Remaining DevPod containers:"
docker volume ls | grep -E "devpod|alice|bob|carol" | wc -l | xargs echo "  Remaining DevPod volumes:"
docker network ls | grep -E "internal|devpod" | wc -l | xargs echo "  Remaining DevPod networks:"
echo ""
echo "Next steps:"
echo "  1. Deploy Coder template: cd /path/to/repo/.coder && ./deploy.sh"
echo "  2. Create test workspace in Coder"
echo "  3. Notify users to migrate"
echo ""
```

Make it executable and run:

```bash
chmod +x cleanup-devpod.sh
sudo ./cleanup-devpod.sh
```

## Post-Cleanup Verification

### Check Docker Resources

```bash
# Should return empty or minimal results:
docker ps -a | grep dev-
docker volume ls | grep devpod
docker network ls | grep internal

# Check freed disk space
docker system df
df -h /var/lib/docker
```

### Verify Traefik (If Keeping)

```bash
# Traefik should still be running
docker ps | grep traefik
systemctl status traefik-proxy

# Check Traefik dashboard
curl http://localhost:8090/api/http/routers
```

### Test Coder Deployment

```bash
# Deploy Coder template
cd /path/to/SimpleAccounts-UAE/.coder
./deploy.sh

# Create test workspace
# Go to https://coder.dev.simpleaccounts.io
# Create workspace → Select "SimpleAccounts UAE"
```

## Troubleshooting

### "Device or resource busy" when removing volumes

```bash
# Force remove
docker volume rm -f <volume-name>

# Or restart Docker
sudo systemctl restart docker
```

### "Network has active endpoints"

```bash
# Disconnect all containers from network first
docker network inspect <network-name> | grep -A 10 Containers

# Disconnect each container
docker network disconnect <network-name> <container-name>

# Then remove network
docker network rm <network-name>
```

### Credentials Not Migrated

```bash
# Manually copy for specific user
cp -r /home/alice/.devpod-mount/* /home/coder/.coder-mount/alice/
chown -R coder:coder /home/coder/.coder-mount/alice
```

## Summary

✅ **DevPod removed**: All containers, volumes, networks cleaned up
✅ **Credentials migrated**: User credentials moved to Coder mount location
✅ **Traefik preserved**: Reverse proxy ready for Coder (if keeping it)
✅ **Disk space freed**: Unused Docker resources removed
✅ **Ready for Coder**: Deploy template and migrate users!

---

**Next**: Deploy Coder template with `cd .coder && ./deploy.sh`
