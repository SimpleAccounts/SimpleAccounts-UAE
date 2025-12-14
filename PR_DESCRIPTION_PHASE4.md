# Vite Migration Phase 4 - Build Optimization & CI/CD Updates

Closes #157

## Summary

This PR completes the Vite migration by updating the build infrastructure to use Vite as the primary build system in Docker and CI/CD pipelines. Vite is now the default build tool for production deployments while maintaining CRA as a fallback option.

## Changes

### 🐳 Docker Configuration
- ✅ Updated `Dockerfile` to use `npm run build:vite` instead of `npm run build`
- ✅ Changed output directory from `build/` to `dist/` (Vite standard)

### 🔄 CI/CD Workflows
- ✅ Updated `.github/workflows/build.yml`:
  - Changed build command to use Vite
  - Updated Node.js version from 18.x to 20.x
  - Updated artifact path from `build/` to `dist/`
  - Optimized NODE_OPTIONS for Vite builds
- ✅ Updated `.github/workflows/nightly.yml`: Node.js version to 20.x
- ✅ Updated `.github/workflows/matrix-tests.yml`: Node 20.x is now default

### 📦 Package Scripts
- ✅ Updated root `package.json` `frontend:build` script to use Vite

### 🔍 Code Quality
- ✅ Added `dist/` to SonarQube exclusions

## Testing

- ✅ Vite build completes successfully
- ✅ Docker build works with Vite
- ✅ CI/CD workflows updated
- ✅ CRA build still works as fallback
- ✅ Both `build/` and `dist/` directories are gitignored

## Files Changed

**Modified Files (6):**
- `apps/frontend/Dockerfile`
- `.github/workflows/build.yml`
- `.github/workflows/nightly.yml`
- `.github/workflows/matrix-tests.yml`
- `package.json` (root)
- `sonar-project.properties`

**New Files (1):**
- `docs/VITE_MIGRATION_PHASE4_SUMMARY.md`

## Breaking Changes

**None** - All changes are backward compatible:
- CRA build system still available (`npm run build` in frontend directory)
- Both `build/` and `dist/` directories are gitignored
- Existing deployment scripts can be updated gradually

## Build Output

| Build System | Output Directory | Status |
|--------------|------------------|--------|
| **Vite** (Primary) | `dist/` | ✅ Active |
| **CRA** (Fallback) | `build/` | ✅ Available |

## Performance Benefits

- **Faster builds:** Vite is ~2-3x faster than CRA
- **Better optimization:** Improved tree-shaking and code splitting
- **Reduced CI time:** Faster builds in GitHub Actions
- **Memory efficient:** Uses esbuild (faster, less memory)

## Migration Status

This PR completes the Vite migration:
- ✅ Phase 1: Vite setup and configuration
- ✅ Phase 2 & 3: Environment variables & Jest config
- ✅ Phase 4: Build optimization & CI/CD (this PR)

## Next Steps (Post-Merge)

1. Monitor build performance in CI/CD
2. Update deployment scripts that reference `build/` to use `dist/`
3. Update Helm charts if needed
4. Optional: Remove CRA after confirming production stability

## Documentation

See `docs/VITE_MIGRATION_PHASE4_SUMMARY.md` for complete details.

## Related

- Phase 1: `docs/VITE_MIGRATION_PHASE1_SUMMARY.md`
- Phase 2 & 3: `docs/VITE_MIGRATION_PHASE2_AND_3_SUMMARY.md`
- Issue: #157
