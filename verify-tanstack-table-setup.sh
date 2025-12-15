#!/bin/bash

# Verification script for TanStack Table + shadcn/ui setup
# This script verifies that all components are properly installed and configured

set -e

echo "=========================================="
echo "TanStack Table + shadcn/ui Setup Verification"
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
    if grep -q "export.*$1\|$1," "$2" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 is exported from $2"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not exported from $2"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check if import exists in file
check_import() {
    if grep -q "$1" "$2" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 import found in $2"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 import not found in $2 (may be optional)"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo "Phase 1: Checking Dependencies"
echo "-------------------------------"
check_package "@tanstack/react-table"
echo ""

echo "Phase 2: Checking shadcn Table Component"
echo "-----------------------------------------"
check_file "$FRONTEND_DIR/src/components/ui/table.jsx"
check_export "Table" "$FRONTEND_DIR/src/components/ui/table.jsx"
check_export "TableHeader" "$FRONTEND_DIR/src/components/ui/table.jsx"
check_export "TableBody" "$FRONTEND_DIR/src/components/ui/table.jsx"
check_export "TableRow" "$FRONTEND_DIR/src/components/ui/table.jsx"
check_export "TableCell" "$FRONTEND_DIR/src/components/ui/table.jsx"
check_export "TableHead" "$FRONTEND_DIR/src/components/ui/table.jsx"
echo ""

echo "Phase 3: Checking DataTable Component"
echo "--------------------------------------"
check_file "$FRONTEND_DIR/src/components/ui/data-table.jsx"
check_export "DataTable" "$FRONTEND_DIR/src/components/ui/data-table.jsx"
check_import "useReactTable" "$FRONTEND_DIR/src/components/ui/data-table.jsx"
check_import "getCoreRowModel" "$FRONTEND_DIR/src/components/ui/data-table.jsx"
check_import "getSortedRowModel" "$FRONTEND_DIR/src/components/ui/data-table.jsx"
check_import "getFilteredRowModel" "$FRONTEND_DIR/src/components/ui/data-table.jsx"
check_import "getPaginationRowModel" "$FRONTEND_DIR/src/components/ui/data-table.jsx"
echo ""

echo "Phase 4: Checking DataTablePagination Component"
echo "-----------------------------------------------"
check_file "$FRONTEND_DIR/src/components/ui/data-table-pagination.jsx"
check_export "DataTablePagination" "$FRONTEND_DIR/src/components/ui/data-table-pagination.jsx"
echo ""

echo "Phase 5: Checking Example Component"
echo "-------------------------------------"
if [ -f "$FRONTEND_DIR/src/components/examples/ExampleDataTable.jsx" ]; then
    echo -e "${GREEN}✓${NC} Example DataTable exists"
    if grep -q "DataTable" "$FRONTEND_DIR/src/components/examples/ExampleDataTable.jsx"; then
        echo -e "${GREEN}✓${NC} Example uses DataTable component"
    else
        echo -e "${YELLOW}⚠${NC} Example may not be using DataTable correctly"
        WARNINGS=$((WARNINGS + 1))
    fi
    if grep -q "useReactTable" "$FRONTEND_DIR/src/components/examples/ExampleDataTable.jsx"; then
        echo -e "${GREEN}✓${NC} Example uses TanStack Table hooks"
    else
        echo -e "${YELLOW}⚠${NC} Example may not be using TanStack Table correctly"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Example DataTable does not exist (optional)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "Phase 6: Checking Integration"
echo "------------------------------"
# Check if DataTable uses shadcn Table components
if grep -q "from '@/components/ui/table'" "$FRONTEND_DIR/src/components/ui/data-table.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} DataTable imports shadcn Table components"
else
    echo -e "${YELLOW}⚠${NC} DataTable may not be using shadcn Table components"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if DataTable uses Input component for search
if grep -q "from '@/components/ui/input'" "$FRONTEND_DIR/src/components/ui/data-table.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} DataTable uses Input component for search"
else
    echo -e "${YELLOW}⚠${NC} DataTable may not have search functionality"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if DataTablePagination uses shadcn components
if grep -q "from '@/components/ui/button'" "$FRONTEND_DIR/src/components/ui/data-table-pagination.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} DataTablePagination uses Button component"
else
    echo -e "${YELLOW}⚠${NC} DataTablePagination may not be using shadcn Button"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "from '@/components/ui/select'" "$FRONTEND_DIR/src/components/ui/data-table-pagination.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} DataTablePagination uses Select component"
else
    echo -e "${YELLOW}⚠${NC} DataTablePagination may not be using shadcn Select"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "Phase 7: Checking Features"
echo "---------------------------"
# Check for sorting functionality
if grep -q "getSortedRowModel\|onSortingChange\|sorting" "$FRONTEND_DIR/src/components/ui/data-table.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Sorting functionality detected"
else
    echo -e "${YELLOW}⚠${NC} Sorting functionality may be missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for filtering functionality
if grep -q "getFilteredRowModel\|onColumnFiltersChange\|columnFilters" "$FRONTEND_DIR/src/components/ui/data-table.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Filtering functionality detected"
else
    echo -e "${YELLOW}⚠${NC} Filtering functionality may be missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for pagination functionality
if grep -q "getPaginationRowModel\|pagination" "$FRONTEND_DIR/src/components/ui/data-table.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Pagination functionality detected"
else
    echo -e "${YELLOW}⚠${NC} Pagination functionality may be missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for row selection functionality
if grep -q "onRowSelectionChange\|rowSelection\|enableRowSelection" "$FRONTEND_DIR/src/components/ui/data-table.jsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Row selection functionality detected"
else
    echo -e "${YELLOW}⚠${NC} Row selection functionality may be missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "Phase 8: Checking Documentation"
echo "--------------------------------"
# Check in root docs directory
if [ -f "docs/TANSTACK_TABLE_SETUP_BATTLE_PLAN.md" ]; then
    echo -e "${GREEN}✓${NC} Battle plan documentation exists"
else
    echo -e "${YELLOW}⚠${NC} Battle plan documentation not found in docs/ (optional)"
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
    echo "1. Test the example DataTable in the browser"
    echo "2. Verify sorting, filtering, and pagination work correctly"
    echo "3. Check that row selection works properly"
    echo "4. Verify accessibility features"
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

