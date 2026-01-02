#!/bin/bash
# Setup script to create required host directories for devcontainer bind mounts
# Run this ONCE on your host machine before starting the devcontainer

set -e

MOUNT_BASE="${HOME}/.devcontainer-mount"

echo "Creating devcontainer mount directories in ${MOUNT_BASE}..."

# Create all required directories
mkdir -p "${MOUNT_BASE}"/{claude,gemini,codex,gh,bash-history,gitconfig,ssh,docker,kube,aws,azure}

# SSH requires restrictive permissions
if [ -d "${MOUNT_BASE}/ssh" ]; then
    chmod 700 "${MOUNT_BASE}/ssh"
    echo "✓ Set SSH directory permissions to 700"
fi

# Create empty files for bash history and gitconfig if they don't exist
touch "${MOUNT_BASE}/bash-history/bash_history"
touch "${MOUNT_BASE}/gitconfig/gitconfig"

echo "✓ All directories created successfully!"
echo ""
echo "Directories created:"
ls -la "${MOUNT_BASE}"
echo ""
echo "You can now start your devcontainer."
