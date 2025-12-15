# Fix for ForwardRef Import Error

## Issue
Application shows error:
- `SyntaxError: Importing binding name 'ForwardRef' is not found.`

## Root Cause
This error occurs when Vite's dependency optimization tries to tree-shake React incorrectly, or when React is imported using namespace imports (`import * as React`) which can cause module resolution issues.

## Fixes Applied

### 1. Fixed React Imports in UI Components
Changed from namespace imports to default imports:

**Before:**
```javascript
import * as React from 'react';
```

**After:**
```javascript
import React from 'react';
```

**Files Fixed:**
- `apps/frontend/src/components/ui/button.jsx`
- `apps/frontend/src/components/ui/input.jsx`
- `apps/frontend/src/components/ui/dialog.jsx`
- `apps/frontend/src/components/ui/card.jsx`

### 2. Updated Vite Config
Added React to `optimizeDeps.include` to ensure proper module resolution:

```javascript
optimizeDeps: {
  include: ['react', 'react-dom', 'react/jsx-runtime'],
  // ... other config
}
```

### 3. Cleared Vite Cache
Cleared `node_modules/.vite` to force re-optimization.

## Verification Steps

1. **Stop the dev server** (if running):
   ```bash
   # Press Ctrl+C in the terminal running npm start
   ```

2. **Clear Vite cache**:
   ```bash
   cd apps/frontend
   rm -rf node_modules/.vite
   ```

3. **Restart the dev server**:
   ```bash
   npm start
   ```

4. **Clear browser cache**:
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
   - Or open DevTools → Application → Clear Storage → Clear site data

5. **Check the application**:
   - Should load at `http://localhost:3000`
   - No console errors about `ForwardRef`
   - Application should render correctly

## If Issue Persists

1. **Clear node_modules and reinstall**:
   ```bash
   cd apps/frontend
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

2. **Check browser console** for the exact error message and stack trace

3. **Verify React version**:
   ```bash
   npm list react react-dom
   ```
   Should show React 18.2.0 or higher

## Technical Details

The error "Importing binding name 'ForwardRef' is not found" suggests that:
- Something is trying to import `ForwardRef` as a named export from React
- React doesn't export `ForwardRef` - it only has `forwardRef` as a method on the React object
- This is likely a Vite optimization issue where React's exports are being incorrectly analyzed

The fix ensures:
- React is properly included in Vite's dependency optimization
- React imports use the standard default import pattern
- Vite cache is cleared to force re-optimization

