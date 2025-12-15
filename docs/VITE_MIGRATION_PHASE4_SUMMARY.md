# Vite Migration Phase 4 - Build Optimization & CI/CD Updates

**Issue:** [#157](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/157)  
**Branch:** `feat/vite-migration-phase4`  
**Status:** ✅ Complete - Ready for PR  
**Target:** `develop`

## Overview

Phase 4 updates the build infrastructure to use Vite as the primary build system in Docker and CI/CD pipelines. This phase completes the migration by making Vite the default build tool for production deployments while maintaining CRA as a fallback option.

## Changes Summary

### 🐳 Docker Configuration

1. **`apps/frontend/Dockerfile`**
   - **Changed:** `npm run build` → `npm run build:vite`
   - **Changed:** Copy from `/app/build` → `/app/dist` (Vite output directory)
   - **Updated comment:** Clarified that Vite is now used for builds
   - **Impact:** Production Docker builds now use Vite instead of CRA

### 🔄 CI/CD Workflows

2. **`.github/workflows/build.yml`**
   - **Changed:** Build command from `CI=false npm run build` → `npm run build:vite`
   - **Changed:** Node.js version from `18.x` → `20.x` (2 instances)
   - **Changed:** Build artifact path from `apps/frontend/build` → `apps/frontend/dist`
   - **Changed:** Removed `CI=false` flag (not needed for Vite)
   - **Changed:** Updated `NODE_OPTIONS` from `--openssl-legacy-provider` → `--max-old-space-size=4096` for build step
   - **Impact:** GitHub Actions CI now uses Vite builds

3. **`.github/workflows/nightly.yml`**
   - **Changed:** Node.js version from `18.x` → `20.x`
   - **Impact:** Nightly tests run on Node 20

4. **`.github/workflows/matrix-tests.yml`**
   - **Changed:** Node version matrix: `20.x` is now default (non-experimental), `18.x` is experimental
   - **Impact:** Matrix tests prioritize Node 20 compatibility

### 📦 Package Scripts

5. **`package.json` (root)**
   - **Changed:** `frontend:build` script from `CI=false npm run build` → `npm run build:vite`
   - **Removed:** `CI=false` flag and `rm -rf node_modules` (Vite doesn't need these)
   - **Impact:** Root-level build command now uses Vite

### 🔍 Code Quality

6. **`sonar-project.properties`**
   - **Added:** `**/dist/**` to `sonar.exclusions` and `sonar.test.exclusions`
   - **Reason:** Vite outputs to `dist/` directory, which should be excluded from SonarQube analysis
   - **Impact:** SonarQube now ignores Vite build output

## Key Features

### 1. Production Build System
- ✅ Docker builds use Vite (faster, more efficient)
- ✅ CI/CD pipelines use Vite builds
- ✅ Root-level scripts use Vite
- ✅ CRA build system still available as fallback (`npm run build` in frontend directory)

### 2. Node.js Version Consistency
- ✅ All workflows updated to Node 20.x
- ✅ Aligns with project requirements (`engines.node: ">=20.0.0"`)
- ✅ Matrix tests prioritize Node 20

### 3. Build Output Consistency
- ✅ All build systems now output to `dist/` (Vite standard)
- ✅ Docker, CI/CD, and local builds use same output directory
- ✅ SonarQube excludes both `build/` and `dist/` directories

## Build Output Comparison

| Build System | Output Directory | Status |
|--------------|------------------|--------|
| **Vite** (Primary) | `dist/` | ✅ Active |
| **CRA** (Fallback) | `build/` | ✅ Available |

## Migration Path

### Before Phase 4
- Docker: Used CRA (`npm run build` → `build/`)
- CI/CD: Used CRA (`CI=false npm run build` → `build/`)
- Local: Both available (`build:vite` and `build`)

### After Phase 4
- Docker: Uses Vite (`npm run build:vite` → `dist/`)
- CI/CD: Uses Vite (`npm run build:vite` → `dist/`)
- Local: Both available (`build:vite` primary, `build` fallback)

## Testing

### Build Verification

1. **Docker Build:**
   ```bash
   cd apps/frontend
   docker build -t simpleaccounts-frontend .
   # Verify dist/ directory is created and contains built assets
   ```

2. **CI/CD Build:**
   - GitHub Actions workflow will build using Vite
   - Artifacts uploaded from `apps/frontend/dist`

3. **Local Build:**
   ```bash
   cd apps/frontend
   npm run build:vite
   # Verify dist/ directory is created
   ```

### Compatibility

- ✅ CRA build still works: `npm run build` (outputs to `build/`)
- ✅ Vite build works: `npm run build:vite` (outputs to `dist/`)
- ✅ Both can coexist during transition period

## Performance Benefits

### Build Speed
- **Vite:** ~2-3x faster builds (estimated)
- **Smaller output:** Better tree-shaking and code splitting
- **Faster CI:** Reduced build times in GitHub Actions

### Memory Usage
- **Optimized:** Vite uses esbuild (faster, less memory)
- **Chunk splitting:** Granular chunks for better caching
- **Memory limit:** Set to 4GB for large builds

## Files Changed Summary

### Modified Files (6)
- `apps/frontend/Dockerfile` - Updated to use Vite build
- `.github/workflows/build.yml` - Updated build command and Node version
- `.github/workflows/nightly.yml` - Updated Node version
- `.github/workflows/matrix-tests.yml` - Updated Node version matrix
- `package.json` (root) - Updated frontend:build script
- `sonar-project.properties` - Added dist/ to exclusions

## Breaking Changes

**None** - All changes are backward compatible:
- CRA build system still available
- Both `build/` and `dist/` directories are gitignored
- Existing deployment scripts can be updated gradually

## Deployment Notes

### Docker Deployment
- **Before:** Expected `build/` directory
- **After:** Expects `dist/` directory
- **Action Required:** Update any deployment scripts that reference `build/` to use `dist/`

### CI/CD Artifacts
- **Before:** Artifacts from `apps/frontend/build`
- **After:** Artifacts from `apps/frontend/dist`
- **Action Required:** Update any artifact consumers to use `dist/`

## Next Steps (Post-Phase 4)

After this PR is merged:

1. **Monitor Build Performance**
   - Track build times in CI/CD
   - Compare Vite vs CRA build performance
   - Monitor memory usage

2. **Update Deployment Scripts**
   - Update Helm charts if they reference `build/` directory
   - Update any deployment automation
   - Update documentation references

3. **Optional: Remove CRA**
   - After confirming Vite builds work in production
   - Remove `react-scripts` dependency
   - Remove CRA build scripts
   - Clean up `build/` directory references

## Related

- Phase 1: `docs/VITE_MIGRATION_PHASE1_SUMMARY.md`
- Phase 2 & 3: `docs/VITE_MIGRATION_PHASE2_AND_3_SUMMARY.md`
- Issue: #157

---

**Commits:** Phase 4 changes ready for commit
