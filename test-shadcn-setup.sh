#!/bin/bash

# shadcn/ui Setup Verification Script
# This script verifies that shadcn/ui is properly installed and configured

set -e

echo "🔍 Verifying shadcn/ui Setup..."
echo ""

cd apps/frontend

# Check 1: Dependencies
echo "✅ Checking dependencies..."
npm list clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-dialog lucide-react > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✓ All dependencies installed"
else
  echo "   ✗ Missing dependencies"
  exit 1
fi

# Check 2: Configuration file
echo "✅ Checking configuration..."
if [ -f "components.json" ]; then
  echo "   ✓ components.json exists"
else
  echo "   ✗ components.json missing"
  exit 1
fi

# Check 3: Utility function
echo "✅ Checking utility function..."
if [ -f "src/lib/utils.js" ]; then
  echo "   ✓ src/lib/utils.js exists"
  if grep -q "export function cn" src/lib/utils.js; then
    echo "   ✓ cn() function found"
  else
    echo "   ✗ cn() function not found"
    exit 1
  fi
else
  echo "   ✗ src/lib/utils.js missing"
  exit 1
fi

# Check 4: Components
echo "✅ Checking components..."
COMPONENTS=("button.jsx" "input.jsx" "card.jsx" "dialog.jsx")
for component in "${COMPONENTS[@]}"; do
  if [ -f "src/components/ui/$component" ]; then
    echo "   ✓ $component exists"
  else
    echo "   ✗ $component missing"
    exit 1
  fi
done

# Check 5: Test component
echo "✅ Checking test component..."
if [ -f "src/components/ShadcnTest.js" ]; then
  echo "   ✓ ShadcnTest.js exists"
else
  echo "   ✗ ShadcnTest.js missing"
  exit 1
fi

# Check 6: Build
echo "✅ Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✓ Build completes successfully"
else
  echo "   ✗ Build failed"
  exit 1
fi

echo ""
echo "🎉 All checks passed! shadcn/ui is properly set up."
echo ""
echo "Next steps:"
echo "  1. Import and use components: import { Button } from '@/components/ui/button'"
echo "  2. Test in browser: Add <ShadcnTest /> to any route"
echo "  3. Add more components: npx shadcn@latest add [component-name]"
