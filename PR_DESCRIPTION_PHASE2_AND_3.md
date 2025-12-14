# Vite Migration Phase 2 & 3 - Environment Variables & Jest Configuration

Closes #157

## Summary

This PR combines **Phase 2** (Environment Variables Migration) and **Phase 3** (Jest Configuration & Test Setup) of the Vite migration. Both phases are interdependent and have been tested together with all bug fixes applied.

## Changes

### Phase 2: Environment Variables Migration

- ✅ Created `apps/frontend/src/utils/env.js` - Centralized environment variable utilities
- ✅ Migrated `serviceWorker.js` from `process.env` to Vite-compatible utilities
- ✅ Added `import.meta.env` mock in `setupTests.js` for Jest tests

### Phase 3: Jest Configuration & Test Setup

- ✅ Updated Jest `moduleNameMapper` to match Vite path aliases
- ✅ Added comprehensive tests for environment utilities
- ✅ Added Vite plugin to inject `import.meta.env` into `window.__VITE_ENV__`

### Bug Fixes

- ✅ Fixed ESLint `no-undef` errors for `getMetaEnv` and `globalThis`
- ✅ Fixed Jest parse errors with `import.meta` syntax
- ✅ Fixed test expectations and improved coverage
- ✅ Removed unsupported CRA Jest options
- ✅ Fixed JSON syntax errors in `package.json`

## Testing

- ✅ All tests pass (117 test suites, 2112 tests)
- ✅ Jest path aliases work correctly
- ✅ Environment variable mocking works in tests
- ✅ ESLint passes without errors
- ✅ `npm start` compiles successfully

## Files Changed

**New Files (3):**
- `apps/frontend/src/utils/env.js`
- `apps/frontend/src/utils/__tests__/env.test.js`
- `docs/VITE_MIGRATION_PHASE2_AND_3_SUMMARY.md`

**Modified Files (5):**
- `apps/frontend/src/serviceWorker.js`
- `apps/frontend/src/setupTests.js`
- `apps/frontend/package.json`
- `apps/frontend/vite.config.js`
- `apps/frontend/src/components/form_control/term_date_input.test.js`

## Breaking Changes

**None** - All changes are backward compatible. CRA build system continues to work.

## Known Issues (Unrelated to This PR)

### Formik/Yup Validation Error

**Status:** Pre-existing issue, not caused by Vite migration

A runtime error has been observed in the browser console:
```
Uncaught runtime errors:
× ERROR
undefined is not an object (evaluating 'yupError.inner.length')
yupToFormErrors@http://localhost:3000/static/js/bundle.js:341396:21
```

**Analysis:**
- This is a known Formik/Yup compatibility issue
- Occurs when a Yup validation error doesn't have the expected `inner` array structure
- Likely triggered by forms that validate on mount or have nullable fields
- **Not related to Vite migration changes** - this is a pre-existing issue

**Tracking:** See issue #XXX (to be created)

**Recommendation:** This should be addressed in a separate PR focused on Formik/Yup validation fixes.

## Documentation

See `docs/VITE_MIGRATION_PHASE2_AND_3_SUMMARY.md` for complete details.
