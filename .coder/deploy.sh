#!/bin/bash
# Deploy SimpleAccounts-UAE template to Coder
#
# Usage:
#   ./deploy.sh                    # Deploy to default Coder instance
#   ./deploy.sh --update           # Update existing template
#   ./deploy.sh --dry-run          # Test without deploying

set -e

# Configuration
CODER_URL="${CODER_URL:-https://coder.dev.simpleaccounts.io}"
CODER_SESSION_TOKEN="${CODER_SESSION_TOKEN:-cGmYiyiZV1-qE8akRLOW8cx8fIywwnKGv}"
TEMPLATE_NAME="simpleaccounts-uae"
TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Parse arguments
DRY_RUN=false
UPDATE_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --update)
            UPDATE_MODE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Test without deploying"
            echo "  --update     Update existing template"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v coder &> /dev/null; then
    log_error "Coder CLI not found. Install it first:"
    echo "  curl -fsSL https://coder.com/install.sh | sh"
    exit 1
fi

if ! command -v terraform &> /dev/null; then
    log_warning "Terraform not found. Install for better validation:"
    echo "  https://www.terraform.io/downloads"
fi

log_success "Prerequisites OK"

# Validate template files
log_info "Validating template files..."

if [ ! -f "$TEMPLATE_DIR/template.tf" ]; then
    log_error "template.tf not found in $TEMPLATE_DIR"
    exit 1
fi

log_success "Template files OK"

# Login to Coder
log_info "Logging into Coder at $CODER_URL..."

if [ "$DRY_RUN" = false ]; then
    export CODER_URL="$CODER_URL"
    export CODER_SESSION_TOKEN="$CODER_SESSION_TOKEN"

    if ! coder version &> /dev/null; then
        log_error "Failed to connect to Coder"
        exit 1
    fi

    log_success "Connected to Coder"
fi

# Check if template exists
TEMPLATE_EXISTS=false
if [ "$DRY_RUN" = false ]; then
    if coder templates list 2>/dev/null | grep -q "$TEMPLATE_NAME"; then
        TEMPLATE_EXISTS=true
        log_info "Template '$TEMPLATE_NAME' already exists"
    fi
fi

# Create or update template
if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would deploy template from: $TEMPLATE_DIR"
    log_info "[DRY RUN] Template name: $TEMPLATE_NAME"
    log_info "[DRY RUN] Coder URL: $CODER_URL"

    if [ "$TEMPLATE_EXISTS" = true ]; then
        log_info "[DRY RUN] Would update existing template"
    else
        log_info "[DRY RUN] Would create new template"
    fi

    log_success "Dry run complete (no changes made)"
    exit 0
fi

# Deploy template
log_info "Deploying template..."

cd "$TEMPLATE_DIR"

if [ "$TEMPLATE_EXISTS" = true ] || [ "$UPDATE_MODE" = true ]; then
    # Update existing template
    log_info "Updating template '$TEMPLATE_NAME'..."

    coder templates push "$TEMPLATE_NAME" \
        --directory "." \
        --message "Updated from deploy.sh at $(date)" \
        --yes

    log_success "Template updated successfully!"
else
    # Create new template
    log_info "Creating new template '$TEMPLATE_NAME'..."

    coder templates create "$TEMPLATE_NAME" \
        --directory "." \
        --message "Initial deployment" \
        --yes

    log_success "Template created successfully!"
fi

# Print summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Template Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Template Name: ${GREEN}$TEMPLATE_NAME${NC}"
echo "Template URL:  ${BLUE}$CODER_URL/templates/$TEMPLATE_NAME${NC}"
echo ""
echo "Next Steps:"
echo "  1. Go to: $CODER_URL"
echo "  2. Click 'Create Workspace'"
echo "  3. Select 'SimpleAccounts UAE' template"
echo "  4. Start coding!"
echo ""
echo "For users:"
echo "  • Frontend: https://\$USER-\$WORKSPACE.dev.simpleaccounts.io"
echo "  • Backend:  https://\$USER-\$WORKSPACE-api.dev.simpleaccounts.io"
echo ""
