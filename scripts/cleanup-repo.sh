#!/bin/bash
#
# Repository Cleanup Script
# Removes temporary files, debug artifacts, and consolidates documentation
#

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           SimpleAccounts Repository Cleanup                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DRY_RUN=true
if [ "$1" == "--execute" ]; then
    DRY_RUN=false
    echo -e "${RED}EXECUTING CLEANUP (files will be deleted)${NC}"
else
    echo -e "${YELLOW}DRY RUN MODE (use --execute to actually delete)${NC}"
fi
echo ""

# ============================================
# 1. ROOT LEVEL TEMPORARY FILES
# ============================================
echo -e "${YELLOW}[1/6] Root level temporary files:${NC}"

ROOT_TEMP_FILES=(
    ".test-action-plan.md"
    ".test-pending-items.md"
    ".test-task-123.md"
    ".final-summary.md"
    ".git-branch-status.md"
    ".github-actions.md"
    ".github-content.txt"
    ".github-issue-backend-password-history.md"
    ".github-setup-instructions.md"
    ".issue-backend-password-history.md"
    ".next-steps-167.md"
    ".quick-start-github.md"
    ".remaining-tasks-summary.md"
    ".task-167-completion-summary.md"
    ".create-github-issue-pr.sh"
    "dashboard-screenshot.png"
)

for file in "${ROOT_TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        if [ "$DRY_RUN" == false ]; then
            rm -f "$file"
        fi
    fi
done

# ============================================
# 2. FRONTEND DEBUG SCREENSHOTS
# ============================================
echo ""
echo -e "${YELLOW}[2/6] Frontend debug screenshots:${NC}"

DEBUG_IMAGES=(
    "apps/frontend/debug-before-select.png"
    "apps/frontend/debug-after-next.png"
    "apps/frontend/debug-after-arrow.png"
    "apps/frontend/debug-step1-filled.png"
    "apps/frontend/debug-after-select.png"
    "apps/frontend/debug-after-click.png"
    "apps/frontend/debug-error-details.png"
    "apps/frontend/debug-register.png"
    "apps/frontend/quick-test.png"
    "apps/frontend/step1-filled.png"
    "apps/frontend/step2-filled.png"
    "apps/frontend/step2-with-phone.png"
    "apps/frontend/step3-filled.png"
    "apps/frontend/step3-before-fill.png"
    "apps/frontend/after-register.png"
    "apps/frontend/after-step1-next.png"
    "apps/frontend/after-step2-next.png"
)

for file in "${DEBUG_IMAGES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        if [ "$DRY_RUN" == false ]; then
            rm -f "$file"
        fi
    fi
done

# ============================================
# 3. DEBUG E2E TEST FILES
# ============================================
echo ""
echo -e "${YELLOW}[3/6] Debug E2E test files:${NC}"

DEBUG_TESTS=(
    "apps/frontend/e2e/debug-error.spec.ts"
    "apps/frontend/e2e/debug-frontend-render.spec.ts"
    "apps/frontend/e2e/debug-full-register.spec.ts"
    "apps/frontend/e2e/debug-quick.spec.ts"
    "apps/frontend/e2e/debug-register-submit.spec.ts"
    "apps/frontend/e2e/debug-register.spec.ts"
    "apps/frontend/e2e/debug-register2.spec.ts"
    "apps/frontend/e2e/debug-select-option.spec.ts"
    "apps/frontend/e2e/debug-step1.spec.ts"
    "apps/frontend/e2e/create-minimal-contact.spec.ts"
    "apps/frontend/e2e/test-complete-flow.spec.ts"
)

for file in "${DEBUG_TESTS[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        if [ "$DRY_RUN" == false ]; then
            rm -f "$file"
        fi
    fi
done

# ============================================
# 4. FRONTEND MIGRATION DOCS (55 files!)
# ============================================
echo ""
echo -e "${YELLOW}[4/6] Frontend migration documentation (to archive):${NC}"

MIGRATION_DOCS=(
    "apps/frontend/TANSTACK_TABLE_COMPLETE_INVENTORY.md"
    "apps/frontend/BANK_ACCOUNT_MIGRATION_SUMMARY.md"
    "apps/frontend/FORMIK_TO_REACT_HOOK_FORM_MIGRATION_COMPLETE.md"
    "apps/frontend/CREDITNOTES_MIGRATION_COMPLETE.md"
    "apps/frontend/ADDITIONAL_MATERIAL_UI_MIGRATION.md"
    "apps/frontend/TANSTACK_TABLE_MIGRATION_README.md"
    "apps/frontend/TANSTACK_TABLE_MIGRATION_GUIDE.md"
    "apps/frontend/MIGRATION_VERIFICATION.md"
    "apps/frontend/MIGRATION_SUMMARY.md"
    "apps/frontend/SUPPLIER_INVOICE_MIGRATION_GUIDE.md"
    "apps/frontend/PAYROLL_MIGRATION_STATUS.md"
    "apps/frontend/CHART_MIGRATION_IMPLEMENTATION_GUIDE.md"
    "apps/frontend/SALARY_SCREENS_MIGRATION_SUMMARY.md"
    "apps/frontend/PAYROLL_MIGRATION_COMPLETE_SUMMARY.md"
    "apps/frontend/DEBITNOTES_MIGRATION_SUMMARY.md"
    "apps/frontend/TANSTACK_TABLE_QUICK_REFERENCE.md"
    "apps/frontend/CODE_SPLITTING_IMPLEMENTATION_SUMMARY.md"
    "apps/frontend/PAYROLL_MIGRATION_INDEX.md"
    "apps/frontend/MIGRATION_QUICK_REFERENCE.md"
    "apps/frontend/CODE_SPLITTING_GUIDE.md"
    "apps/frontend/REMAINING_FILES_MIGRATION_SUMMARY.md"
    "apps/frontend/MIGRATION_RECOMMENDATIONS.md"
    "apps/frontend/PAYROLL_RUN_MIGRATION_SUMMARY.md"
    "apps/frontend/PAYROLLEMP_MIGRATION_SUMMARY.md"
    "apps/frontend/CURRENCY_MIGRATION_STATUS.md"
    "apps/frontend/CREDITNOTES_MIGRATION_SUMMARY.md"
    "apps/frontend/CUSTOMER_INVOICE_MIGRATION_SUMMARY.md"
    "apps/frontend/PAYROLL_RUN_VALIDATION_SCHEMAS.md"
    "apps/frontend/CHART_CONSOLIDATION_COMPLETE.md"
    "apps/frontend/DEPRECATED_FILES_LIST.md"
    "apps/frontend/PRODUCT_MIGRATION_CHECKLIST.md"
    "apps/frontend/PURCHASE_ORDER_MIGRATION_SUMMARY.md"
    "apps/frontend/MODAL_MIGRATION_SUMMARY.md"
    "apps/frontend/BANK_TRANSACTION_MIGRATION_SUMMARY.md"
    "apps/frontend/PRODUCT_MIGRATION_SUMMARY.md"
    "apps/frontend/FINAL_MIGRATION_STATUS.md"
    "apps/frontend/MATERIAL_UI_TO_SHADCN_MIGRATION.md"
    "apps/frontend/CODE_SPLITTING_QUICK_START.md"
    "apps/frontend/TANSTACK_TABLE_MIGRATION_SUMMARY.md"
    "apps/frontend/STANDALONE_SCREENS_MIGRATION_SUMMARY.md"
    "apps/frontend/FINAL_MIGRATION_REPORT.md"
    "apps/frontend/REMAINING_SCREENS_MIGRATION_SUMMARY.md"
    "apps/frontend/TABLE_MIGRATION_GUIDE.md"
    "apps/frontend/TANSTACK_TABLE_MIGRATION_CHECKLIST.md"
    "apps/frontend/FINANCIAL_REPORT_MIGRATION_SUMMARY.md"
    "apps/frontend/SECTION_MODALS_MIGRATION_SUMMARY.md"
    "apps/frontend/MIGRATION_COMPARISON.md"
    "apps/frontend/REMAINING_PAYROLL_MIGRATIONS_GUIDE.md"
    "apps/frontend/FINAL_MIGRATION_SUMMARY.md"
    "apps/frontend/CHARTS_README.md"
    "apps/frontend/MATERIAL_UI_MIGRATION_SUMMARY.md"
    "apps/frontend/CURRENCY_CONVERT_MIGRATION_SUMMARY.md"
    "apps/frontend/CHART_LIBRARY_CONSOLIDATION_SUMMARY.md"
    "apps/frontend/CHARTJS_QUICK_REFERENCE.md"
)

for file in "${MIGRATION_DOCS[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        if [ "$DRY_RUN" == false ]; then
            rm -f "$file"
        fi
    fi
done

# ============================================
# 5. DUPLICATE/REDUNDANT DOCS
# ============================================
echo ""
echo -e "${YELLOW}[5/6] Duplicate/redundant documentation:${NC}"

# docs/templates duplicates .github templates
REDUNDANT_DOCS=(
    "docs/templates/github-pr-template.md"
    "docs/templates/github-issue-template.md"
    "docs/templates/pr-checklist.md"
)

for file in "${REDUNDANT_DOCS[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        if [ "$DRY_RUN" == false ]; then
            rm -f "$file"
        fi
    fi
done

# ============================================
# 6. TEST API SCRIPT
# ============================================
echo ""
echo -e "${YELLOW}[6/6] Temporary scripts:${NC}"

TEMP_SCRIPTS=(
    "scripts/test-contact-api.sh"
)

for file in "${TEMP_SCRIPTS[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        if [ "$DRY_RUN" == false ]; then
            rm -f "$file"
        fi
    fi
done

# ============================================
# SUMMARY
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$DRY_RUN" == true ]; then
    echo -e "${YELLOW}This was a DRY RUN. No files were deleted.${NC}"
    echo ""
    echo "To execute cleanup, run:"
    echo "  ./scripts/cleanup-repo.sh --execute"
else
    echo -e "${GREEN}Cleanup complete!${NC}"
fi

echo ""
echo "Files to keep (important documentation):"
echo "  - README.md"
echo "  - CLAUDE.md"
echo "  - CONTRIBUTING.md"
echo "  - CODE_OF_CONDUCT.md"
echo "  - SETUP.md"
echo "  - AGENTS.md"
echo "  - .devcontainer/*.md"
echo "  - docs/DEVPOD_SETUP.md"
echo "  - docs/TESTING_STRATEGY.md"
echo "  - docs/THEME.md"
echo "  - docs/LESSONS_LEARNED.md"
echo "  - docs/templates/dev-environment-setup.md"
echo "  - docs/templates/code-review-checklist.md"
echo "  - apps/backend/README.md"
echo "  - apps/frontend/README.md"
echo ""
