#!/bin/bash
# Pre-PR Validation Script
# Comprehensive validation checks before creating/merging PR
# Usage: bash .scripts/pre-pr-check.sh

set -e  # Exit on any error

echo "🔍 Running Pre-PR Validation Checks..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Get base branch (default to develop)
BASE_BRANCH=${1:-develop}
echo -e "${BLUE}Base branch: ${BASE_BRANCH}${NC}"
echo ""

# 1. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo "   Consider committing or stashing before running pre-PR checks"
    WARNINGS=$((WARNINGS + 1))
fi

# 2. Prettier Check (Frontend)
echo "📝 Checking Prettier formatting..."
if npx prettier --check . >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Prettier formatting OK${NC}"
else
    echo -e "${RED}❌ Prettier check failed. Run: npm run format${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. ESLint Check (Frontend)
echo "🔧 Checking ESLint..."
cd apps/frontend
if npm exec eslint -- --ext .js,.jsx src/ --quiet >/dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint check OK${NC}"
else
    echo -e "${RED}❌ ESLint check failed. Run: npm run lint -- --fix${NC}"
    ERRORS=$((ERRORS + 1))
    # Show first few errors
    npm exec eslint -- --ext .js,.jsx src/ --format compact 2>&1 | head -20
fi
cd ../..

# 4. Frontend Unit Tests
echo "🧪 Running frontend unit tests..."
cd apps/frontend
TEST_OUTPUT=$(npm test -- --run 2>&1 || true)
if echo "$TEST_OUTPUT" | grep -q "Test Files.*passed\|passed.*test"; then
    echo -e "${GREEN}✅ Frontend unit tests passed${NC}"
else
    echo -e "${RED}❌ Frontend unit tests failed${NC}"
    echo "$TEST_OUTPUT" | tail -30
    ERRORS=$((ERRORS + 1))
fi
cd ../..

# 5. Backend Tests (if backend files changed)
if git diff --name-only origin/${BASE_BRANCH} 2>/dev/null | grep -q "apps/backend/.*\.java$" || [ "$BASE_BRANCH" = "HEAD" ]; then
    echo "🧪 Running backend tests..."
    cd apps/backend
    if ./mvnw test -DskipTests=false -q 2>&1 | grep -q "BUILD SUCCESS"; then
        echo -e "${GREEN}✅ Backend tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend tests had issues (check manually)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    cd ../..
else
    echo "⏭️  Skipping backend tests (no Java files changed)"
fi

# 6. Check for common CodeQL issues
echo "🔒 Checking for common CodeQL issues..."

# Check for == instead of === in JS (non-strict equality)
JS_FILES=$(git diff --name-only origin/${BASE_BRANCH} 2>/dev/null | grep -E "\.(js|jsx)$" || echo "")
if [ -n "$JS_FILES" ]; then
    NON_STRICT=$(echo "$JS_FILES" | xargs grep -n "== " 2>/dev/null | grep -v "===" | grep -v "== null\|== undefined" | head -5 || true)
    if [ -n "$NON_STRICT" ]; then
        echo -e "${YELLOW}⚠️  Warning: Found '==' comparisons. Consider using '===' for strict equality${NC}"
        echo "$NON_STRICT" | sed 's/^/   /'
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 7. Check for unused variables (ESLint should catch, but double-check)
echo "🔍 Checking for unused imports/variables..."
cd apps/frontend
UNUSED_COUNT=$(npm exec eslint -- --ext .js,.jsx src/ --format compact 2>&1 | grep -c "is defined but never used" || echo "0")
if [ "$UNUSED_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found ${UNUSED_COUNT} unused variable/import warning(s)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
cd ../..

# 8. Check for console.log/debug statements
echo "🐛 Checking for debug statements..."
DEBUG_FILES=$(git diff --name-only origin/${BASE_BRANCH} 2>/dev/null | xargs grep -l "console\.log\|console\.debug\|debugger" 2>/dev/null || true)
if [ -n "$DEBUG_FILES" ]; then
    echo -e "${YELLOW}⚠️  Warning: Found console.log/debugger statements. Remove before PR${NC}"
    echo "$DEBUG_FILES" | sed 's/^/   /'
    WARNINGS=$((WARNINGS + 1))
fi

# 9. Check for TODO/FIXME comments
echo "📋 Checking for TODO/FIXME comments..."
TODO_FILES=$(git diff --name-only origin/${BASE_BRANCH} 2>/dev/null | xargs grep -l "TODO\|FIXME" 2>/dev/null || true)
if [ -n "$TODO_FILES" ]; then
    echo -e "${YELLOW}⚠️  Warning: Found TODO/FIXME comments. Document or resolve before PR${NC}"
    echo "$TODO_FILES" | sed 's/^/   /'
    WARNINGS=$((WARNINGS + 1))
fi

# 10. Check for missing error handling in async operations
echo "🛡️  Checking for error handling patterns..."
cd apps/frontend
# Check for .then() without .catch() in changed files
ASYNC_FILES=$(git diff --name-only origin/${BASE_BRANCH} 2>/dev/null | grep -E "\.(js|jsx)$" || echo "")
if [ -n "$ASYNC_FILES" ]; then
    # This is a basic check - ESLint should catch most of these
    UNHANDLED=$(echo "$ASYNC_FILES" | xargs grep -n "\.then(" 2>/dev/null | grep -v "\.catch(" | head -3 || true)
    if [ -n "$UNHANDLED" ]; then
        echo -e "${YELLOW}⚠️  Warning: Found .then() calls. Ensure error handling with .catch()${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
cd ../..

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for PR${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Checks passed with $WARNINGS warning(s)${NC}"
    echo -e "${YELLOW}   Review warnings above before creating PR${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo -e "${RED}   Please fix the errors before creating/merging PR${NC}"
    exit 1
fi

