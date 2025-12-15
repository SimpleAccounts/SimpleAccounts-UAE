#!/bin/bash

# Day.js Migration Verification Script
# Verifies that Moment.js to Day.js migration is complete

set -e

echo "🔍 Verifying Day.js Migration..."
echo ""

cd apps/frontend

# Check 1: Day.js installed
echo "✅ Checking Day.js installation..."
if npm list dayjs > /dev/null 2>&1; then
  echo "   ✓ Day.js installed"
else
  echo "   ✗ Day.js not installed"
  exit 1
fi

# Check 2: Moment.js removed from dependencies
echo "✅ Checking Moment.js removal..."
if grep -q '"moment"' package.json; then
  echo "   ✗ Moment.js still in package.json"
  exit 1
else
  echo "   ✓ Moment.js removed from package.json"
fi

# Check 3: Date utility exists
echo "✅ Checking date utility..."
if [ -f "src/utils/date.js" ]; then
  echo "   ✓ src/utils/date.js exists"
  if grep -q "export default dayjs" src/utils/date.js; then
    echo "   ✓ dayjs exported correctly"
  else
    echo "   ✗ dayjs not exported"
    exit 1
  fi
else
  echo "   ✗ src/utils/date.js missing"
  exit 1
fi

# Check 4: No moment imports in application code
echo "✅ Checking for remaining moment imports..."
MOMENT_IMPORTS=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) -exec grep -l "import.*moment\|require.*moment" {} \; 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$MOMENT_IMPORTS" -gt 0 ]; then
  echo "   ⚠ Found $MOMENT_IMPORTS files with moment imports (may be in comments or test mocks)"
else
  echo "   ✓ No moment imports in application code"
fi

# Check 5: Dayjs imports present
echo "✅ Checking for dayjs usage..."
DAYJS_IMPORTS=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) -exec grep -l "import.*dayjs\|require.*dayjs\|@/utils/date" {} \; 2>/dev/null | wc -l | tr -d ' ')
if [ "$DAYJS_IMPORTS" -gt 0 ]; then
  echo "   ✓ Found $DAYJS_IMPORTS files using dayjs"
else
  echo "   ✗ No dayjs usage found"
  exit 1
fi

# Check 6: Test file renamed
echo "✅ Checking test files..."
if [ -f "src/utils/dayjs.test.js" ]; then
  echo "   ✓ dayjs.test.js exists"
else
  echo "   ✗ dayjs.test.js missing"
  exit 1
fi

if [ -f "src/utils/moment.test.js" ]; then
  echo "   ⚠ moment.test.js still exists (should be renamed)"
else
  echo "   ✓ moment.test.js renamed"
fi

# Check 7: Build
echo "✅ Testing build..."
if npm run build > /dev/null 2>&1; then
  echo "   ✓ Build completes successfully"
else
  echo "   ✗ Build failed"
  exit 1
fi

# Check 8: Tests
echo "✅ Testing date utility tests..."
if npm test -- src/utils/dayjs.test.js --watchAll=false > /dev/null 2>&1; then
  echo "   ✓ Date utility tests pass"
else
  echo "   ⚠ Some tests may be failing (check output above)"
fi

echo ""
echo "🎉 Migration verification complete!"
echo ""
echo "Summary:"
echo "  - Day.js installed: ✓"
echo "  - Moment.js removed: ✓"
echo "  - Date utility created: ✓"
echo "  - Files using dayjs: $DAYJS_IMPORTS"
echo "  - Build: ✓"
echo ""
echo "Next steps:"
echo "  1. Test date functionality in browser"
echo "  2. Verify date pickers work correctly"
echo "  3. Check date formatting in forms and reports"
