#!/bin/bash

# Verification script for Layout Components Migration (#166)
# This script verifies that all layout components have been successfully migrated

set -e

echo "🔍 Verifying Layout Components Migration (#166)..."
echo ""

FRONTEND_DIR="apps/frontend"
ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required shadcn components exist
echo "📦 Checking shadcn/ui components..."
for component in sheet scroll-area breadcrumb; do
  if [ ! -f "$FRONTEND_DIR/src/components/ui/$component.jsx" ]; then
    echo -e "${RED}❌ Missing: $component.jsx${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Found: $component.jsx${NC}"
  fi
done
echo ""

# Check if new layout components exist
echo "📁 Checking layout components..."
for component in header sidebar footer mobile-nav; do
  if [ ! -f "$FRONTEND_DIR/src/layouts/components/$component.jsx" ]; then
    echo -e "${RED}❌ Missing: $component.jsx${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Found: $component.jsx${NC}"
  fi
done
echo ""

# Check if AdminLayout is updated
echo "🔧 Checking AdminLayout..."
if [ -f "$FRONTEND_DIR/src/layouts/admin/index.jsx" ]; then
  if grep -q "from '../components/header'" "$FRONTEND_DIR/src/layouts/admin/index.jsx" 2>/dev/null || \
     grep -q "from '../components/sidebar'" "$FRONTEND_DIR/src/layouts/admin/index.jsx" 2>/dev/null || \
     grep -q "from '../components/footer'" "$FRONTEND_DIR/src/layouts/admin/index.jsx" 2>/dev/null; then
    echo -e "${GREEN}✅ AdminLayout uses new components${NC}"
  else
    echo -e "${YELLOW}⚠️  AdminLayout may not be using new components${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${RED}❌ AdminLayout file not found${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check if tests exist
echo "🧪 Checking tests..."
TEST_DIR="$FRONTEND_DIR/src/__tests__/layouts"
if [ ! -d "$TEST_DIR" ]; then
  echo -e "${YELLOW}⚠️  Test directory not found: $TEST_DIR${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  for test in header sidebar footer admin-layout; do
    if [ ! -f "$TEST_DIR/${test}.test.jsx" ]; then
      echo -e "${YELLOW}⚠️  Missing test: ${test}.test.jsx${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "${GREEN}✅ Found test: ${test}.test.jsx${NC}"
    fi
  done
fi
echo ""

# Check if components can be imported
echo "📥 Checking component imports..."
cd "$FRONTEND_DIR"

# Check if Sheet can be imported
if node -e "require('./src/components/ui/sheet.jsx')" 2>/dev/null; then
  echo -e "${GREEN}✅ Sheet component can be imported${NC}"
else
  echo -e "${YELLOW}⚠️  Could not verify Sheet import (this is normal for JSX)${NC}"
fi

# Check if ScrollArea can be imported
if node -e "require('./src/components/ui/scroll-area.jsx')" 2>/dev/null; then
  echo -e "${GREEN}✅ ScrollArea component can be imported${NC}"
else
  echo -e "${YELLOW}⚠️  Could not verify ScrollArea import (this is normal for JSX)${NC}"
fi

# Check if Breadcrumb can be imported
if node -e "require('./src/components/ui/breadcrumb.jsx')" 2>/dev/null; then
  echo -e "${GREEN}✅ Breadcrumb component can be imported${NC}"
else
  echo -e "${YELLOW}⚠️  Could not verify Breadcrumb import (this is normal for JSX)${NC}"
fi
echo ""

# Check build
echo "🔨 Checking build..."
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build succeeds${NC}"
else
  echo -e "${RED}❌ Build fails${NC}"
  echo "Run 'npm run build' in $FRONTEND_DIR for details"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check for reactstrap imports in new components (should not exist)
echo "🔍 Checking for reactstrap usage in new components..."
if grep -r "from 'reactstrap'" "$FRONTEND_DIR/src/layouts/components/" 2>/dev/null | grep -v ".test."; then
  echo -e "${YELLOW}⚠️  Found reactstrap imports in new layout components${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ No reactstrap imports in new components${NC}"
fi
echo ""

# Check for shadcn/ui imports in new components (should exist)
echo "🔍 Checking for shadcn/ui usage in new components..."
SHADCN_FOUND=0
for file in "$FRONTEND_DIR/src/layouts/components"/*.jsx; do
  if [ -f "$file" ] && grep -q "from '@/components/ui" "$file"; then
    SHADCN_FOUND=1
    break
  fi
done

if [ $SHADCN_FOUND -eq 1 ]; then
  echo -e "${GREEN}✅ Found shadcn/ui imports in new components${NC}"
else
  echo -e "${YELLOW}⚠️  No shadcn/ui imports found in new components${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Layout components migration verification complete."
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  All critical checks passed, but $WARNINGS warning(s) found${NC}"
  echo ""
  echo "Review warnings above and address if needed."
  exit 0
else
  echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo ""
  echo "Please fix the errors above before proceeding."
  exit 1
fi

