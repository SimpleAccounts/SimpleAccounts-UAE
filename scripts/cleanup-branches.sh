#!/bin/bash

# Branch cleanup script for SimpleAccounts-UAE
# This script helps clean up merged branches from local and remote repositories

set -e

echo "=========================================="
echo "Branch Cleanup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if branch is merged
is_merged() {
    local branch=$1
    git branch --merged develop | grep -q "^  $branch$" || \
    git branch -r --merged develop | grep -q "origin/$branch$"
}

# Function to safely delete local branch
delete_local_branch() {
    local branch=$1
    if git show-ref --verify --quiet refs/heads/$branch; then
        if is_merged "$branch"; then
            echo -e "${GREEN}✓${NC} Deleting local branch: $branch"
            git branch -d "$branch" || echo -e "${YELLOW}⚠${NC} Could not delete $branch (may have unmerged changes)"
        else
            echo -e "${YELLOW}⚠${NC} Skipping $branch (not merged into develop)"
        fi
    else
        echo -e "${BLUE}ℹ${NC} Local branch $branch does not exist"
    fi
}

# Function to safely delete remote branch
delete_remote_branch() {
    local branch=$1
    if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
        if git branch -r --merged develop | grep -q "origin/$branch"; then
            echo -e "${GREEN}✓${NC} Deleting remote branch: origin/$branch"
            git push origin --delete "$branch" || echo -e "${YELLOW}⚠${NC} Could not delete origin/$branch"
        else
            echo -e "${YELLOW}⚠${NC} Skipping origin/$branch (not merged into develop)"
        fi
    else
        echo -e "${BLUE}ℹ${NC} Remote branch origin/$branch does not exist"
    fi
}

# Ensure we're on develop branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${YELLOW}⚠${NC} Not on develop branch. Switching to develop..."
    git checkout develop
fi

# Update develop branch
echo -e "${BLUE}ℹ${NC} Updating develop branch..."
git pull upstream develop
git push origin develop

# List of branches to check
BRANCHES=(
    "feature/react-router-v6-migration"
    "feature/redux-toolkit-migration"
    "feature/react-hook-form-zod-setup"
)

echo ""
echo "Checking branches for cleanup..."
echo "--------------------------------"

for branch in "${BRANCHES[@]}"; do
    echo ""
    echo -e "${BLUE}Checking: $branch${NC}"
    
    # Check local branch
    if git show-ref --verify --quiet refs/heads/$branch; then
        if is_merged "$branch"; then
            echo -e "${GREEN}✓${NC} $branch is merged into develop"
            read -p "Delete local branch $branch? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                delete_local_branch "$branch"
            fi
        else
            echo -e "${YELLOW}⚠${NC} $branch is NOT merged into develop"
        fi
    fi
    
    # Check remote branch
    if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
        if git branch -r --merged develop | grep -q "origin/$branch"; then
            echo -e "${GREEN}✓${NC} origin/$branch is merged into develop"
            read -p "Delete remote branch origin/$branch? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                delete_remote_branch "$branch"
            fi
        else
            echo -e "${YELLOW}⚠${NC} origin/$branch is NOT merged into develop"
        fi
    fi
done

echo ""
echo "=========================================="
echo "Cleanup Summary"
echo "=========================================="
echo ""
echo "Remaining local branches:"
git branch | grep -v "develop\|master" || echo "None"
echo ""
echo "Remaining remote branches:"
git branch -r | grep -E "feature|fix|chore" | grep -v "HEAD\|develop\|master" || echo "None"
echo ""
echo -e "${GREEN}✓${NC} Cleanup complete!"

