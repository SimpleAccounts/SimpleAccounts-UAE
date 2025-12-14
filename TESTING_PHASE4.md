# Testing Guide for Phase 4 - Vite Migration

This guide helps you test Phase 4 changes before pushing the branch.

## Prerequisites

1. **Node.js 20+** installed (check with `node --version`)
2. **Docker** installed (for Docker build test)
3. **Clean working directory** (no uncommitted changes)

## Test 1: Local Vite Build

### Steps:
```bash
cd apps/frontend

# Clean any previous builds
rm -rf dist build

# Run Vite build
npm run build:vite
```

### Expected Results:
- ✅ Build completes without errors
- ✅ `dist/` directory is created (not `build/`)
- ✅ `dist/` contains:
  - `index.html`
  - `assets/` directory with JS, CSS files
  - Other static assets

### Verify Output:
```bash
# Check dist directory exists
ls -la dist/

# Check for main files
ls -la dist/index.html
ls -la dist/assets/
```

## Test 2: Verify Build Artifacts

### Steps:
```bash
cd apps/frontend

# Check dist directory structure
tree dist/ -L 2  # or use: find dist/ -type f | head -20

# Verify index.html references assets correctly
cat dist/index.html | grep -E "(assets|\.js|\.css)"
```

### Expected Results:
- ✅ `index.html` exists and references assets correctly
- ✅ JavaScript bundles are created (likely with hashes in filenames)
- ✅ CSS files are created
- ✅ No broken references

## Test 3: Preview Production Build

### Steps:
```bash
cd apps/frontend

# Build first (if not already done)
npm run build:vite

# Preview the production build
npm run preview:vite
```

### Expected Results:
- ✅ Preview server starts (usually on port 4173)
- ✅ Application loads in browser
- ✅ No console errors
- ✅ Application functions correctly

### Manual Checks:
- Open browser to `http://localhost:4173`
- Navigate through the app
- Check browser console for errors
- Verify all assets load correctly

## Test 4: Docker Build

### Steps:
```bash
cd apps/frontend

# Build Docker image
docker build -t simpleaccounts-frontend-test .

# Check if build succeeded
docker images | grep simpleaccounts-frontend-test
```

### Expected Results:
- ✅ Docker build completes successfully
- ✅ Image is created
- ✅ No errors during build process

### Verify Docker Image:
```bash
# Create a temporary container to check dist/ exists
docker run --rm simpleaccounts-frontend-test ls -la /usr/share/nginx/html/

# Or run the container and check
docker run -d -p 8080:80 --name test-frontend simpleaccounts-frontend-test
docker exec test-frontend ls -la /usr/share/nginx/html/
docker stop test-frontend && docker rm test-frontend
```

### Expected Results:
- ✅ `dist/` contents are copied to `/usr/share/nginx/html/`
- ✅ `index.html` exists
- ✅ Assets directory exists

## Test 5: CRA Build Still Works (Fallback)

### Steps:
```bash
cd apps/frontend

# Clean dist directory
rm -rf dist

# Run CRA build
npm run build
```

### Expected Results:
- ✅ CRA build completes successfully
- ✅ `build/` directory is created (not `dist/`)
- ✅ Both build systems can coexist

## Test 6: Root Package.json Script

### Steps:
```bash
# From repository root
cd /Users/zecs/workspaces/SimpleAccounts-UAE

# Clean previous builds
rm -rf apps/frontend/dist apps/frontend/build

# Run root-level build script
npm run frontend:build
```

### Expected Results:
- ✅ Script executes successfully
- ✅ Uses Vite build (`build:vite`)
- ✅ Creates `apps/frontend/dist/` directory

## Test 7: Build Performance Comparison (Optional)

### Steps:
```bash
cd apps/frontend

# Time Vite build
time npm run build:vite

# Clean and time CRA build
rm -rf dist
time npm run build
```

### Expected Results:
- ✅ Vite build should be faster (typically 2-3x)
- ✅ Both builds complete successfully

## Test 8: Check File Sizes

### Steps:
```bash
cd apps/frontend

# Build with Vite
npm run build:vite

# Check dist size
du -sh dist/

# Compare with CRA build (if needed)
rm -rf dist
npm run build
du -sh build/
```

### Expected Results:
- ✅ Both builds produce similar output sizes
- ✅ Vite may produce slightly smaller bundles due to better tree-shaking

## Test 9: Verify Environment Variables

### Steps:
```bash
cd apps/frontend

# Build with Vite
npm run build:vite

# Check if env-config.js is in dist
ls -la dist/env-config.js

# Preview and check browser console
npm run preview:vite
# Open browser console and check:
# - window._env_ is defined
# - No errors related to environment variables
```

### Expected Results:
- ✅ `env-config.js` is present in dist
- ✅ Environment variables are accessible in browser
- ✅ No errors in console

## Test 10: Check for Common Issues

### Steps:
```bash
cd apps/frontend

# Build with Vite
npm run build:vite

# Check for common issues:
# 1. Missing assets
find dist/ -name "*.js" -o -name "*.css" | wc -l

# 2. Check index.html
cat dist/index.html | grep -E "(script|link)" | head -10

# 3. Check for source maps (should be disabled)
find dist/ -name "*.map" | wc -l  # Should be 0
```

### Expected Results:
- ✅ JavaScript and CSS files are present
- ✅ `index.html` has correct script/link tags
- ✅ No source maps (as configured in vite.config.js)

## Troubleshooting

### Issue: Build fails with memory error
**Solution:** Increase Node memory limit
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build:vite
```

### Issue: Docker build fails
**Solution:** Check Dockerfile syntax and Node version
```bash
docker build --no-cache -t simpleaccounts-frontend-test .
```

### Issue: Assets not loading in preview
**Solution:** Check vite.config.js `base` setting and asset paths

### Issue: Environment variables not working
**Solution:** Verify `env-config.js` is in `public/` and copied to `dist/`

## Quick Test Script

Save this as `test-phase4.sh`:

```bash
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
echo "   - Vite: dist/ ($(du -sh dist | cut -f1))"
echo "   - CRA:  build/ ($(du -sh build | cut -f1))"
```

Make it executable and run:
```bash
chmod +x test-phase4.sh
./test-phase4.sh
```

## Success Criteria

Before pushing, ensure:
- ✅ Vite build completes successfully
- ✅ `dist/` directory is created with correct structure
- ✅ Docker build works
- ✅ Preview works and app loads correctly
- ✅ CRA build still works as fallback
- ✅ No console errors in preview
- ✅ Environment variables work correctly

## Next Steps After Testing

Once all tests pass:
1. Commit any fixes if needed
2. Push branch: `git push origin feat/vite-migration-phase4`
3. Create PR targeting `develop`
4. Monitor CI/CD pipeline for automated tests
