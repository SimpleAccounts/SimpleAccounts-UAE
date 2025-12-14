# Vite Migration Phase 3 - Jest Configuration & Test Setup

**Issue:** [#157](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/157)  
**Branch:** `feat/vite-migration-phase3`  
**Status:** ✅ Complete - Ready for PR

## Overview

Phase 3 configures Jest to work seamlessly with Vite by aligning path aliases and ensuring environment variable mocking works correctly. This phase builds on Phase 2's environment variable migration.

## Changes Summary

### 🆕 New Files Created

1. **`apps/frontend/src/utils/__tests__/env.test.js`** (80 lines)
   - Comprehensive tests for environment utilities
   - Verifies `import.meta.env` mocking works in Jest
   - Tests all utility functions and the `env` object
   - Ensures environment utilities are well-tested

2. **`docs/VITE_MIGRATION_PHASE3_SUMMARY.md`** (This file)
   - Complete documentation of Phase 3 changes

### 📝 Files Modified

1. **`apps/frontend/package.json`**
   - Updated Jest `moduleNameMapper` to match Vite path aliases exactly
   - Added path mappings for:
     - `@/` → `src/`
     - `assets/`, `components/`, `constants/`, `layouts/`, `routes/`, `screens/`, `services/`, `utils/`
     - `app`, `serviceWorker`, `polyfill`
   - Added explicit `testEnvironment: "jsdom"` for clarity
   - Added `roots` configuration for better test discovery

## Key Features

### 1. Path Alias Consistency
Jest now uses the same path aliases as Vite, ensuring:
- ✅ Tests can import using the same paths as application code
- ✅ No need to change imports when switching between CRA and Vite
- ✅ Consistent developer experience

**Example:**
```javascript
// Works in both Vite and Jest
import { getBaseUrl } from 'utils/env';
import App from 'app';
import { Loading } from 'components';
```

### 2. Import.meta.env Mocking
- ✅ Already set up in Phase 2 via `setupTests.js`
- ✅ Mocked via `globalThis.import.meta.env`
- ✅ Automatically syncs with `process.env` for `VITE_*` variables
- ✅ Provides all standard Vite env vars (`MODE`, `DEV`, `PROD`, etc.)

### 3. Test Coverage
- ✅ Added tests for `env.js` utility module
- ✅ Verifies mocking works correctly
- ✅ Ensures environment utilities are well-tested

## Jest Configuration Updates

### Before
```json
{
  "moduleNameMapper": {
    "^lodash-es$": "lodash",
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
    // ... file mocks only
  }
}
```

### After
```json
{
  "testEnvironment": "jsdom",
  "roots": ["<rootDir>/src"],
  "moduleNameMapper": {
    // Path aliases matching Vite
    "^@/(.*)$": "<rootDir>/src/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    // ... all Vite aliases
    "^app$": "<rootDir>/src/app",
    "^serviceWorker$": "<rootDir>/src/serviceWorker",
    "^polyfill$": "<rootDir>/src/polyfill",
    // Legacy mappings
    "^lodash-es$": "lodash",
    // ... file mocks
  }
}
```

## Testing

### Jest Test Environment
- ✅ Path aliases work correctly
- ✅ `import.meta.env` is properly mocked (from Phase 2)
- ✅ Environment utilities work in tests
- ✅ All existing tests should continue to pass

### Test Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests without watch mode
npm run test:frontend:unit
```

## Migration Notes

### What Changed
- ✅ Jest path resolution now matches Vite
- ✅ Added explicit test environment configuration
- ✅ Added environment utility tests

### What Stayed the Same
- ✅ Test framework: Still using Jest (via react-scripts)
- ✅ Test structure: No changes to existing tests
- ✅ Coverage thresholds: Maintained at 70%
- ✅ All existing test mocks: Still work
- ✅ `import.meta.env` mocking: Already set up in Phase 2

## Files Changed Summary

- **New files:** 2
  - `src/utils/__tests__/env.test.js` - Environment utility tests
  - `docs/VITE_MIGRATION_PHASE3_SUMMARY.md` - Documentation
- **Modified files:** 1
  - `package.json` - Updated Jest configuration

**Note:** This branch includes Phase 2 changes (env.js, serviceWorker.js, setupTests.js) as dependencies.

## Benefits

1. **Consistency**: Same import paths work in code and tests
2. **Compatibility**: Tests work with both CRA and Vite
3. **Maintainability**: Single source of truth for path aliases
4. **Testability**: Environment utilities are fully tested

## Next Steps (Phase 4)

After this PR is merged:
1. Build optimization and Docker updates
2. Update CI/CD to use Vite builds
3. Performance testing and optimization

## Related

- Phase 1: `docs/VITE_MIGRATION_PHASE1_SUMMARY.md`
- Phase 2: `docs/VITE_MIGRATION_PHASE2_SUMMARY.md`
- Issue: #157

---

**Commit:** `2fc3406` - feat(frontend): configure Jest for Vite compatibility (Phase 3) - #157
