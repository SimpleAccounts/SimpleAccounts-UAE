#!/bin/bash
set -e

echo "🧪 Testing Phase 4 - Vite Migration"
echo "===================================="

cd apps/frontend

echo "1. Cleaning previous builds..."
rm -rf dist build

echo "2. Running Vite build..."
npm run build:vite

echo "3. Verifying dist/ directory..."
if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist/ directory not found!"
  exit 1
fi

echo "4. Checking for index.html..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ ERROR: index.html not found in dist/"
  exit 1
fi

echo "5. Checking for assets..."
if [ ! -d "dist/assets" ]; then
  echo "❌ ERROR: assets/ directory not found in dist/"
  exit 1
fi

echo "6. Verifying CRA build still works..."
rm -rf dist
npm run build

if [ ! -d "build" ]; then
  echo "❌ ERROR: build/ directory not found (CRA build failed)"
  exit 1
fi

echo "✅ All tests passed!"
echo "📦 Build output:"
if [ -d "dist" ]; then
  echo "   - Vite: dist/ ($(du -sh dist 2>/dev/null | cut -f1 || echo 'N/A'))"
fi
if [ -d "build" ]; then
  echo "   - CRA:  build/ ($(du -sh build 2>/dev/null | cut -f1 || echo 'N/A'))"
fi
