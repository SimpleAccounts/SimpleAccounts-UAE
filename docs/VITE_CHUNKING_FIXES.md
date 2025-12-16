# Vite Chunking Strategy Fixes

**Date:** December 15, 2025  
**Issue:** Circular dependency and module initialization errors in production builds

## Problem

Production Docker builds were experiencing JavaScript errors due to circular dependencies and module initialization order issues when multiple related libraries were bundled into single vendor chunks:

1. `date-vendor` - Error: `can't access lexical declaration 'p' before initialization`
2. `document-vendor` - Error: `undefined has no properties`
3. `bootstrap-vendor` - Error: `can't access lexical declaration 'd' before initialization`

## Root Cause

When Vite bundles multiple related libraries (e.g., moment + dayjs, jspdf + exceljs, reactstrap + bootstrap) into a single chunk, it can create:
- Circular dependencies between modules
- Module initialization order conflicts
- Hoisting issues with ES6 modules

## Solution

### 1. Granular Chunk Splitting

Split potentially conflicting libraries into separate chunks:

#### Date Libraries
- **Before:** Single `date-vendor` chunk
- **After:** 
  - `moment-vendor` - moment.js and related
  - `dayjs-vendor` - dayjs
  - `datepicker-vendor` - react-datepicker and daterangepicker

#### Document Libraries
- **Before:** Single `document-vendor` chunk
- **After:**
  - `jspdf-vendor` - jspdf
  - `react-pdf-vendor` - @react-pdf/renderer
  - `exceljs-vendor` - exceljs
  - `kendo-vendor` - @progress/kendo libraries

#### Bootstrap Libraries
- **Before:** Single `bootstrap-vendor` chunk
- **After:**
  - `reactstrap-vendor` - reactstrap
  - `bootstrap-vendor` - bootstrap (excluding reactstrap and daterangepicker)

#### Chart Libraries
- **Before:** Single `charts` chunk
- **After:**
  - `chartjs-vendor` - chart.js and react-chartjs
  - `apexcharts` - Excluded from optimization and manual chunking (has internal circular dependencies)

#### Form Libraries
- **Before:** Single `forms` chunk
- **After:**
  - `formik-vendor` - formik
  - `yup-vendor` - yup

#### Utility Libraries
- **Before:** Single `utils-vendor` chunk
- **After:**
  - `lodash-vendor` - lodash
  - `axios-vendor` - axios

### 2. Build Configuration Improvements

Added configuration to better handle circular dependencies:

```javascript
commonjsOptions: {
  transformMixedEsModules: true,
  include: [/node_modules/],
  strictRequires: false, // Handle circular dependencies better
},
rollupOptions: {
  preserveEntrySignatures: 'strict', // Preserve module boundaries
  // ... chunk splitting config
}
```

### 3. Special Handling for Problematic Libraries

Some libraries have internal circular dependencies that break with Vite's optimization:

#### ApexCharts
- **Issue:** Internal circular dependencies cause initialization errors
- **Solution:** 
  - Excluded from `optimizeDeps.exclude`
  - Return `undefined` from `manualChunks` to use default chunking
  - Allows library to be bundled without pre-optimization

### 4. OptimizeDeps Configuration

Added esbuildOptions and exclusions to handle circular dependencies:

```javascript
optimizeDeps: {
  esbuildOptions: {
    legalComments: 'none',
  },
  exclude: [
    // ... other exclusions
    'apexcharts',      // Has internal circular dependencies
    'react-apexcharts', // Related to apexcharts
  ],
}
```

## Files Modified

- `apps/frontend/vite.config.js` - Updated chunking strategy and build config

## Testing

1. **Local Build Test:**
   ```bash
   cd apps/frontend
   npm run build
   ```

2. **Docker Build Test:**
   ```bash
   cd apps/frontend
   docker build --no-cache -t simpleaccounts-frontend:latest .
   ```

3. **Production Test:**
   - Access http://localhost:80
   - Check browser console for errors
   - Verify all functionality works

## Prevention Strategy

### Best Practices

1. **Separate Conflicting Libraries:** Don't bundle libraries that might have circular dependencies together
2. **Test Production Builds:** Always test Docker/production builds, not just dev server
3. **Monitor Chunk Sizes:** Large chunks (>500KB) may indicate bundling issues
4. **Check for Circular Dependencies:** Use tools like `madge` to detect circular dependencies

### Future Considerations

1. **Consider Default Chunking:** For very complex dependency trees, consider using Vite's default chunking strategy
2. **Library Updates:** Some circular dependency issues may be resolved by updating libraries
3. **Code Splitting:** Consider lazy loading routes/components to reduce initial bundle size

## Related Issues

- Similar issues may occur with other vendor chunks if libraries are updated or new dependencies are added
- Monitor for errors in: `mui-vendor`, `coreui-vendor`, `redux-vendor`, etc.
- **ApexCharts Pattern:** If a library has internal circular dependencies, exclude it from optimization and let it use default chunking

## Known Problematic Libraries

| Library | Issue | Solution |
|---------|-------|----------|
| `apexcharts` | Internal circular dependencies | Exclude from optimization, use default chunking |
| `react-apexcharts` | Related to apexcharts | Exclude from optimization |
| `codemirror` | Complex exports | Already excluded |
| `react-router-navigation-prompt` | Incompatible with React Router v6 | Already excluded |

## Verification Checklist

- [x] Date libraries split into separate chunks
- [x] Document libraries split into separate chunks
- [x] Bootstrap libraries split into separate chunks
- [x] Chart libraries handled (chartjs chunked, apexcharts excluded)
- [x] Form libraries split into separate chunks
- [x] Utility libraries split into separate chunks
- [x] ApexCharts excluded from optimization
- [x] Build configuration updated for circular dependencies
- [x] Docker build tested
- [x] Production build verified

---

**Status:** ✅ Complete  
**Impact:** Production builds now work without circular dependency errors

