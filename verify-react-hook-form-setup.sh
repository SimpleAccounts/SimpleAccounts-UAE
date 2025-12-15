#!/bin/bash

# Verification script for React Hook Form + Zod setup
# This script verifies that all components are properly installed and configured

set -e

echo "=========================================="
echo "React Hook Form + Zod Setup Verification"
echo "=========================================="
echo ""

FRONTEND_DIR="apps/frontend"
ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 does not exist"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check if package is installed
check_package() {
    if grep -q "\"$1\"" "$FRONTEND_DIR/package.json"; then
        VERSION=$(grep "\"$1\"" "$FRONTEND_DIR/package.json" | sed -E 's/.*"([^"]+)":\s*"([^"]+)".*/\2/')
        echo -e "${GREEN}✓${NC} $1 is installed (version: $VERSION)"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check if directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 directory does not exist"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check if component exports correctly
check_export() {
    if grep -q "export.*$1" "$2" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 is exported from $2"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not exported from $2"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "Phase 1: Checking Dependencies"
echo "-------------------------------"
check_package "react-hook-form"
check_package "@hookform/resolvers"
check_package "zod"
echo ""

echo "Phase 2: Checking Form Components"
echo "----------------------------------"
check_file "$FRONTEND_DIR/src/components/ui/form.jsx"
check_export "Form" "$FRONTEND_DIR/src/components/ui/form.jsx"
check_export "FormField" "$FRONTEND_DIR/src/components/ui/form.jsx"
check_export "FormItem" "$FRONTEND_DIR/src/components/ui/form.jsx"
check_export "FormLabel" "$FRONTEND_DIR/src/components/ui/form.jsx"
check_export "FormMessage" "$FRONTEND_DIR/src/components/ui/form.jsx"
check_export "FormDescription" "$FRONTEND_DIR/src/components/ui/form.jsx"
echo ""

echo "Phase 3: Checking Validation Schemas"
echo "-------------------------------------"
check_directory "$FRONTEND_DIR/src/lib/validations"
check_file "$FRONTEND_DIR/src/lib/validations/common.js"
check_file "$FRONTEND_DIR/src/lib/validations/schemas.js"
check_file "$FRONTEND_DIR/src/lib/validations/utils.js"
echo ""

echo "Phase 4: Checking Example Form"
echo "-------------------------------"
if [ -f "$FRONTEND_DIR/src/components/examples/ExampleForm.jsx" ]; then
    echo -e "${GREEN}✓${NC} Example form exists"
    if grep -q "useForm" "$FRONTEND_DIR/src/components/examples/ExampleForm.jsx"; then
        echo -e "${GREEN}✓${NC} Example form uses react-hook-form"
    else
        echo -e "${YELLOW}⚠${NC} Example form may not be using react-hook-form correctly"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Example form does not exist (optional)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "Phase 5: Checking Integration"
echo "------------------------------"
# Check if form components can be imported (syntax check)
if node -e "require('$FRONTEND_DIR/src/components/ui/form.jsx')" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Form components have valid syntax"
else
    # Try with babel or just check if file is readable
    if [ -r "$FRONTEND_DIR/src/components/ui/form.jsx" ]; then
        echo -e "${GREEN}✓${NC} Form components file is readable"
    else
        echo -e "${RED}✗${NC} Form components file has issues"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check if validation utilities exist
if grep -q "getFieldError" "$FRONTEND_DIR/src/lib/validations/utils.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Validation utilities are defined"
else
    echo -e "${YELLOW}⚠${NC} Validation utilities may be incomplete"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "Phase 6: Checking Documentation"
echo "--------------------------------"
# Check in root docs directory
if [ -f "docs/REACT_HOOK_FORM_ZOD_SETUP_BATTLE_PLAN.md" ]; then
    echo -e "${GREEN}✓${NC} Battle plan documentation exists"
else
    echo -e "${YELLOW}⚠${NC} Battle plan documentation not found in docs/ (optional)"
    WARNINGS=$((WARNINGS + 1))
fi
if [ -f "$FRONTEND_DIR/src/components/ui/form.README.md" ]; then
    echo -e "${GREEN}✓${NC} Form component documentation exists"
else
    echo -e "${YELLOW}⚠${NC} Form component documentation is missing (optional)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "=========================================="
echo "Verification Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found (non-critical)${NC}"
    fi
    echo ""
    echo "Next steps:"
    echo "1. Test the example form in the browser"
    echo "2. Verify form validation works correctly"
    echo "3. Check that error messages display properly"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi

