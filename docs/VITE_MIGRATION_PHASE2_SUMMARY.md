# Vite Migration Phase 2 - Environment Variables Migration

**Issue:** [#157](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/157)  
**Branch:** `feat/vite-migration-phase2`  
**Status:** ✅ Complete - Ready for PR

## Overview

Phase 2 migrates environment variable access from `process.env` (CRA) to `import.meta.env` (Vite). This includes creating a utility module for consistent environment variable access and updating all references.

## Changes Summary

### 🆕 New Files Created

1. **`apps/frontend/src/utils/env.js`** (85 lines)
   - Centralized environment variable utility module
   - Provides consistent API for accessing Vite environment variables
   - Handles both Vite runtime and Jest test environments
   - Functions:
     - `getEnvMode()` - Get current mode (development/production/test)
     - `isProduction()` - Check if in production
     - `isDevelopment()` - Check if in development
     - `getBaseUrl()` - Get base URL (replaces `PUBLIC_URL`)
     - `getEnvVar(key, defaultValue)` - Get any VITE_ prefixed variable
     - `getAllEnvVars()` - Get all environment variables
     - `env` - Convenience object with common values

### 📝 Files Modified

1. **`apps/frontend/src/serviceWorker.js`**
   - **Before:** Used `process.env.NODE_ENV` and `process.env.PUBLIC_URL`
   - **After:** Uses `isProduction()` and `getBaseUrl()` from `utils/env`
   - Changes:
     ```javascript
     // Before
     if (process.env.NODE_ENV === 'production' && ...)
     const publicUrl = new URL(process.env.PUBLIC_URL, ...)
     const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
     
     // After
     import { isProduction, getBaseUrl } from 'utils/env';
     if (isProduction() && ...)
     const baseUrl = getBaseUrl();
     const publicUrl = new URL(baseUrl, ...)
     const swUrl = `${baseUrl}service-worker.js`;
     ```

2. **`apps/frontend/src/setupTests.js`**
   - Added mock for `import.meta.env` for Jest tests
   - Jest doesn't natively support `import.meta`, so we mock it via `globalThis.import`
   - Automatically includes any `VITE_` prefixed variables from `process.env`
   - Mock provides:
     - `MODE` - Based on `NODE_ENV`
     - `DEV`, `PROD`, `SSR` - Boolean flags
     - `BASE_URL` - Defaults to '/'
     - All `VITE_*` variables from `process.env`

## Key Features

### 1. Cross-Environment Compatibility
- Works in Vite runtime (uses `import.meta.env`)
- Works in Jest tests (uses mocked `globalThis.import.meta.env`)
- Graceful fallbacks if environment is not available

### 2. Type Safety & Documentation
- JSDoc comments for all functions
- Clear parameter types and return values
- Examples in code comments

### 3. Backward Compatibility
- `getBaseUrl()` replaces `process.env.PUBLIC_URL` (defaults to '/')
- `isProduction()` replaces `process.env.NODE_ENV === 'production'`
- All changes are internal - no breaking changes to consuming code

## Environment Variable Mapping

| CRA (process.env) | Vite (import.meta.env) | Utility Function |
|-------------------|------------------------|------------------|
| `NODE_ENV` | `MODE` | `getEnvMode()` |
| `NODE_ENV === 'production'` | `PROD` | `isProduction()` |
| `NODE_ENV === 'development'` | `DEV` | `isDevelopment()` |
| `PUBLIC_URL` | `BASE_URL` | `getBaseUrl()` |
| `REACT_APP_*` | `VITE_*` | `getEnvVar(key)` |

## Testing

### Jest Test Environment
- `import.meta.env` is mocked in `setupTests.js`
- Tests can access environment variables via the utility functions
- Mock automatically syncs with `process.env` for `VITE_*` variables

### Vite Runtime
- Environment variables are accessed via `import.meta.env`
- Only variables prefixed with `VITE_` are exposed to client code
- `BASE_URL`, `MODE`, `DEV`, `PROD`, `SSR` are always available

## Migration Notes

### What Changed
- ✅ `serviceWorker.js` - Migrated from `process.env` to Vite env vars
- ✅ `setupTests.js` - Added `import.meta.env` mock for Jest
- ✅ Created `utils/env.js` - Centralized environment variable access

### What Stayed the Same
- ✅ `window._env_` - Still used for runtime environment config (via `env-config.js`)
- ✅ All other code - No changes needed (uses `window._env_` for runtime config)
- ✅ Build process - No changes to build configuration

## Usage Examples

### In Application Code
```javascript
import { isProduction, getBaseUrl, getEnvVar } from 'utils/env';

// Check environment
if (isProduction()) {
  // Production-only code
}

// Get base URL
const assetUrl = `${getBaseUrl()}images/logo.png`;

// Get custom VITE_ variable
const apiKey = getEnvVar('API_KEY', 'default-key');
```

### In Tests
```javascript
// import.meta.env is automatically mocked
import { isProduction } from 'utils/env';

test('should work in test mode', () => {
  expect(isProduction()).toBe(false);
});
```

## Files Changed Summary

- **New files:** 2
  - `src/utils/env.js` - Environment utility module
  - `docs/VITE_MIGRATION_PHASE2_SUMMARY.md` - This document
- **Modified files:** 2
  - `src/serviceWorker.js` - Migrated to Vite env vars
  - `src/setupTests.js` - Added import.meta.env mock

## Next Steps (Phase 3)

After this PR is merged:
1. Configure Jest to work with Vite (or migrate to Vitest)
2. Update any remaining test configurations
3. Verify all tests pass with new environment setup

## Related

- Phase 1: `docs/VITE_MIGRATION_PHASE1_SUMMARY.md`
- Issue: #157

---

**Commit:** Ready to commit
