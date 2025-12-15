#!/bin/bash

# Verification script for React Router v6 migration
# This script runs tests and checks for common migration issues

set -e

echo "🔍 React Router v6 Migration Verification"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the frontend directory
if [ ! -f "apps/frontend/package.json" ]; then
    echo -e "${RED}Error: Must run from repository root${NC}"
    exit 1
fi

cd apps/frontend

echo "📦 Checking dependencies..."
if grep -q '"react-router-dom": "^6' package.json; then
    echo -e "${GREEN}✓ react-router-dom v6 found${NC}"
else
    echo -e "${YELLOW}⚠ react-router-dom v6 not found in package.json${NC}"
fi

echo ""
echo "🔍 Checking for v5 patterns that need migration..."

# Check for Switch usage
SWITCH_COUNT=$(grep -r "<Switch" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$SWITCH_COUNT" -gt 0 ]; then
    echo -e "${RED}✗ Found $SWITCH_COUNT instances of <Switch (should be <Routes)${NC}"
else
    echo -e "${GREEN}✓ No <Switch found${NC}"
fi

# Check for Route with component prop
COMPONENT_PROP_COUNT=$(grep -r "component={" src --include="*.js" --include="*.jsx" | grep -i "Route" | wc -l | tr -d ' ')
if [ "$COMPONENT_PROP_COUNT" -gt 0 ]; then
    echo -e "${RED}✗ Found $COMPONENT_PROP_COUNT instances of Route with component prop (should use element prop)${NC}"
else
    echo -e "${GREEN}✓ No Route component prop found${NC}"
fi

# Check for Redirect component
REDIRECT_COUNT=$(grep -r "<Redirect" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$REDIRECT_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $REDIRECT_COUNT instances of <Redirect (should be <Navigate)${NC}"
else
    echo -e "${GREEN}✓ No <Redirect found${NC}"
fi

# Check for Router with history prop
ROUTER_HISTORY_COUNT=$(grep -r "Router.*history=" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$ROUTER_HISTORY_COUNT" -gt 0 ]; then
    echo -e "${RED}✗ Found $ROUTER_HISTORY_COUNT instances of Router with history prop (should use BrowserRouter)${NC}"
else
    echo -e "${GREEN}✓ No Router with history prop found${NC}"
fi

# Check for useHistory hook
USE_HISTORY_COUNT=$(grep -r "useHistory" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$USE_HISTORY_COUNT" -gt 0 ]; then
    echo -e "${RED}✗ Found $USE_HISTORY_COUNT instances of useHistory (should use useNavigate)${NC}"
else
    echo -e "${GREEN}✓ No useHistory found${NC}"
fi

# Check for withRouter
WITH_ROUTER_COUNT=$(grep -r "withRouter" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$WITH_ROUTER_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $WITH_ROUTER_COUNT instances of withRouter (should use hooks or withNavigation HOC)${NC}"
else
    echo -e "${GREEN}✓ No withRouter found${NC}"
fi

# Check for Routes usage (v6 pattern)
ROUTES_COUNT=$(grep -r "<Routes" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$ROUTES_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $ROUTES_COUNT instances of <Routes (v6 pattern)${NC}"
else
    echo -e "${YELLOW}⚠ No <Routes found (may not have started migration)${NC}"
fi

# Check for Navigate usage (v6 pattern)
NAVIGATE_COUNT=$(grep -r "<Navigate" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$NAVIGATE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $NAVIGATE_COUNT instances of <Navigate (v6 pattern)${NC}"
fi

# Check for useNavigate usage (v6 pattern)
USE_NAVIGATE_COUNT=$(grep -r "useNavigate" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$USE_NAVIGATE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $USE_NAVIGATE_COUNT instances of useNavigate (v6 pattern)${NC}"
fi

# Check for useParams usage (v6 pattern)
USE_PARAMS_COUNT=$(grep -r "useParams" src --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
if [ "$USE_PARAMS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $USE_PARAMS_COUNT instances of useParams (v6 pattern)${NC}"
fi

echo ""
echo "🧪 Running routing tests..."

# Run the routing tests if they exist
if [ -f "src/routes/routing.v6.test.js" ]; then
    npm test -- routing.v6.test.js --watchAll=false 2>&1 | tail -20
    echo ""
    echo -e "${GREEN}✓ Routing tests completed${NC}"
else
    echo -e "${YELLOW}⚠ routing.v6.test.js not found${NC}"
fi

echo ""
echo "📊 Summary"
echo "=========="
echo "Run 'npm test' for full test suite"
echo "Run 'npm run lint' to check for linting issues"
echo ""
echo "For detailed migration guide, see: docs/REACT_ROUTER_V6_MIGRATION_PLAN.md"

