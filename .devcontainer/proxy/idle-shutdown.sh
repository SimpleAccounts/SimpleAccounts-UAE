#!/bin/bash
# =============================================================================
# Idle Container Shutdown Script
# =============================================================================
# Stops devcontainers that have been idle for a specified duration.
#
# Usage:
#   ./idle-shutdown.sh              # Use default 30 minute timeout
#   ./idle-shutdown.sh 60           # Use 60 minute timeout
#   ./idle-shutdown.sh --dry-run    # Show what would be stopped without stopping
#
# Install as cron job:
#   */5 * * * * /path/to/idle-shutdown.sh >> /var/log/idle-shutdown.log 2>&1
# =============================================================================

set -e

# Configuration
IDLE_TIMEOUT_MINUTES="${1:-30}"
DRY_RUN=false
ACTIVITY_DIR="/tmp/devcontainer-activity"
LOG_PREFIX="[idle-shutdown]"

# Check for dry-run flag
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    IDLE_TIMEOUT_MINUTES="${2:-30}"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') ${BLUE}INFO${NC} $1"
}

log_warn() {
    echo -e "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') ${YELLOW}WARN${NC} $1"
}

log_success() {
    echo -e "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') ${GREEN}OK${NC} $1"
}

log_error() {
    echo -e "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') ${RED}ERROR${NC} $1"
}

# Create activity tracking directory
mkdir -p "$ACTIVITY_DIR"

# Processes that indicate activity (development work in progress)
ACTIVE_PROCESSES="node|java|npm|mvn|spring|vite|webpack|esbuild|tsc|python|gradle|code-server"

# Get all running devcontainers (exclude proxy and system containers)
get_devcontainers() {
    docker ps --format '{{.Names}}' | grep -E '^dev-' | grep -v 'dev-proxy' || true
}

# Check if a container has active development processes
is_container_active() {
    local container="$1"

    # Check for active development processes
    local active_procs
    active_procs=$(docker exec "$container" ps aux 2>/dev/null | grep -E "$ACTIVE_PROCESSES" | grep -v grep | wc -l || echo "0")

    if [[ "$active_procs" -gt 0 ]]; then
        return 0  # Active
    fi

    # Check for recent file modifications in workspace (last 5 minutes)
    local recent_changes
    recent_changes=$(docker exec "$container" find /workspaces -type f \( -name "*.java" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -mmin -5 2>/dev/null | head -1 || true)

    if [[ -n "$recent_changes" ]]; then
        return 0  # Active
    fi

    return 1  # Idle
}

# Get the username from container name (dev-username -> username)
get_username() {
    local container="$1"
    echo "$container" | sed 's/^dev-//'
}

# Update last activity timestamp
update_activity() {
    local container="$1"
    local activity_file="$ACTIVITY_DIR/$container"
    date +%s > "$activity_file"
}

# Get last activity timestamp
get_last_activity() {
    local container="$1"
    local activity_file="$ACTIVITY_DIR/$container"

    if [[ -f "$activity_file" ]]; then
        cat "$activity_file"
    else
        # First time seeing this container, record now
        update_activity "$container"
        date +%s
    fi
}

# Calculate idle time in minutes
get_idle_minutes() {
    local container="$1"
    local last_activity
    last_activity=$(get_last_activity "$container")
    local now
    now=$(date +%s)
    local idle_seconds=$((now - last_activity))
    echo $((idle_seconds / 60))
}

# Stop a container and its associated services
stop_container_stack() {
    local container="$1"
    local username
    username=$(get_username "$container")

    log_warn "Stopping idle container stack for: $username"

    # Find the DevPod workspace compose file
    local compose_file=""
    local workspace_dir=""

    # Search for DevPod workspace directory
    for dir in /home/*/; do
        local devpod_workspace="${dir}.devpod/agent/contexts/default/workspaces/simpleaccounts-uae/content"
        if [[ -d "$devpod_workspace" && -f "$devpod_workspace/.devcontainer/docker-compose.yml" ]]; then
            workspace_dir="$devpod_workspace"
            compose_file="$devpod_workspace/.devcontainer/docker-compose.yml"
            break
        fi
    done

    if [[ -n "$compose_file" && -f "$compose_file" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            log_info "[DRY-RUN] Would run: docker compose -f $compose_file stop (from $workspace_dir)"
        else
            # Run docker compose from the workspace directory to ensure correct context
            (cd "$workspace_dir" && docker compose -f .devcontainer/docker-compose.yml stop 2>/dev/null) || true
            log_success "Stopped container stack for: $username"
        fi
    else
        # Fallback: stop individual containers directly
        if [[ "$DRY_RUN" == "true" ]]; then
            log_info "[DRY-RUN] Would stop: $container, db-$username, redis-$username"
        else
            docker stop "$container" "db-$username" "redis-$username" 2>/dev/null || true
            log_success "Stopped containers for: $username"
        fi
    fi

    # Clean up activity file
    rm -f "$ACTIVITY_DIR/$container"
}

# Main logic
main() {
    log_info "Starting idle container check (timeout: ${IDLE_TIMEOUT_MINUTES} minutes)"

    local containers
    containers=$(get_devcontainers)

    if [[ -z "$containers" ]]; then
        log_info "No devcontainers running"
        exit 0
    fi

    local stopped_count=0
    local active_count=0

    for container in $containers; do
        local username
        username=$(get_username "$container")

        if is_container_active "$container"; then
            update_activity "$container"
            log_info "Container $container is ACTIVE (user: $username)"
            ((active_count++))
        else
            local idle_minutes
            idle_minutes=$(get_idle_minutes "$container")

            if [[ "$idle_minutes" -ge "$IDLE_TIMEOUT_MINUTES" ]]; then
                log_warn "Container $container is IDLE for $idle_minutes minutes (user: $username)"
                stop_container_stack "$container"
                ((stopped_count++))
            else
                local remaining=$((IDLE_TIMEOUT_MINUTES - idle_minutes))
                log_info "Container $container idle for $idle_minutes min, will stop in $remaining min (user: $username)"
            fi
        fi
    done

    log_info "Summary: $active_count active, $stopped_count stopped"
}

# Run main function
main "$@"
