# Code Splitting Implementation Guide

This document describes the code splitting implementation using React.lazy() in the SimpleAccounts UAE frontend application.

## Overview

Code splitting has been implemented to improve the application's initial load time and overall performance by loading route components on-demand rather than bundling everything upfront.

## Implementation Details

### 1. Lazy Loading Utility (`src/utils/lazyLoad.js`)

A centralized utility function that wraps React.lazy() with retry logic for better error handling in production:

```javascript
import { lazyLoad } from 'utils/lazyLoad';

const Dashboard = lazyLoad(() => import('./screens/dashboard'));
```

**Features:**

- Automatic retry on chunk loading failure (3 retries by default)
- Configurable retry interval
- Better error handling for network issues
- Preload function for eagerly loading components

### 2. Screen Components (`src/screens/index.js`)

All screen components are now lazy-loaded and organized by category:

- **Authentication Screens**: LogIn, Register, ResetPassword, etc.
- **Dashboard Screens**: Dashboard, DashboardTwo
- **Financial Screens**: Invoices, Receipts, Payments, etc.
- **Inventory Screens**: Products, Purchase Orders, etc.
- **Payroll Screens**: Employee management, Payroll runs, etc.
- **Reports Screens**: Financial reports, VAT reports, etc.
- **Master Data Screens**: Chart of Accounts, Contacts, etc.
- **Settings Screens**: Users, Roles, Organization, etc.

### 3. Layout Components (`src/layouts/index.js`)

Layout components (AdminLayout and InitialLayout) are also lazy-loaded to reduce the initial bundle size:

```javascript
const AdminLayout = lazyLoad(() => import('./admin'));
const InitialLayout = lazyLoad(() => import('./initial'));
```

### 4. Loading Component (`src/components/loading/RouteLoading.jsx`)

A dedicated loading component provides visual feedback while chunks are being loaded:

```jsx
<React.Suspense fallback={<RouteLoading />}>
  <Routes>{/* routes */}</Routes>
</React.Suspense>
```

## Bundle Optimization Benefits

### Before Code Splitting

- Single large bundle containing all components
- Long initial load time
- Unnecessary code loaded for unauthenticated users
- Poor cache invalidation (entire bundle invalidated on any change)

### After Code Splitting

- Multiple smaller chunks loaded on-demand
- Faster initial load time
- Only authentication code loaded initially
- Better cache utilization (unchanged chunks remain cached)
- Parallel chunk loading for better performance

## How It Works

1. **Initial Load**: Only the main app shell and authentication screens are loaded
2. **On Navigation**: When a user navigates to a route, the corresponding chunk is loaded
3. **Caching**: Once loaded, chunks are cached by the browser
4. **Retry Logic**: If chunk loading fails (e.g., network issue), automatic retry occurs
5. **Error Handling**: If all retries fail, an error is shown

## Code Organization

### Logical Grouping

Components are grouped logically in the codebase to enable potential future optimizations:

```javascript
// Invoice-related screens (potential for chunk grouping)
const CustomerInvoice = lazyLoad(() => import('./customer_invoice'));
const CreateCustomerInvoice = lazyLoad(() => import('./customer_invoice/screens/create'));
const DetailCustomerInvoice = lazyLoad(() => import('./customer_invoice/screens/detail'));

// Payroll screens (potential for chunk grouping)
const PayrollRun = lazyLoad(() => import('./payroll_run'));
const CreatePayroll = lazyLoad(() => import('./payroll_run/screens/createPayrollList'));
const UpdatePayroll = lazyLoad(() => import('./payroll_run/screens/updatePayroll'));
```

## Best Practices

### When to Lazy Load

✅ **DO lazy load:**

- Route-level components (screens/pages)
- Large admin sections
- Components not needed on initial render
- Feature-specific modules
- Heavy third-party libraries

❌ **DON'T lazy load:**

- Small, frequently used components
- Components needed on initial render
- Shared UI components (buttons, inputs, etc.)
- Components smaller than ~10KB

### Usage Examples

#### Lazy Loading a Screen

```javascript
import lazyLoad from 'utils/lazyLoad';

const Dashboard = lazyLoad(() => import('./screens/dashboard'));
```

#### Preloading a Component

```javascript
import { preloadComponent } from 'utils/lazyLoad';

// Preload on hover or on route change
preloadComponent(() => import('./screens/dashboard'));
```

#### Using with Suspense

```javascript
import { Suspense } from 'react';
import { RouteLoading } from 'components';

<Suspense fallback={<RouteLoading />}>
  <Dashboard />
</Suspense>;
```

## Performance Monitoring

### Metrics to Track

1. **Initial Bundle Size**: Should be significantly reduced
2. **Time to Interactive (TTI)**: Should improve
3. **First Contentful Paint (FCP)**: Should improve
4. **Chunk Loading Time**: Monitor individual chunk load times
5. **Cache Hit Rate**: Track how often chunks are served from cache

### Recommended Tools

- **Webpack Bundle Analyzer**: Visualize bundle composition
- **Chrome DevTools**: Network tab to see chunk loading
- **Lighthouse**: Overall performance metrics
- **Web Vitals**: Core Web Vitals monitoring

## Build Configuration

The implementation works with Vite's built-in code splitting. No additional configuration is required, as Vite automatically:

- Splits dynamic imports into separate chunks
- Optimizes chunk sizes
- Generates proper chunk names
- Handles chunk preloading

## Future Optimizations

### Potential Improvements

1. **Route-based Prefetching**: Preload likely next routes based on user behavior
2. **Component Grouping**: Group related screens into named chunks
3. **Critical CSS Extraction**: Extract above-the-fold CSS
4. **Service Worker Caching**: Cache chunks with service workers
5. **Predictive Prefetching**: Use ML to predict and preload routes

### Advanced Chunk Grouping

For further optimization, related screens can be grouped into named chunks:

```javascript
// webpack magic comments (if switching to webpack)
const Dashboard = lazyLoad(() =>
  import(/* webpackChunkName: "dashboard" */ './screens/dashboard')
);

// Vite manual chunks (in vite.config.js)
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'invoice-screens': [
          './src/screens/customer_invoice',
          './src/screens/supplier_invoice',
        ],
        'payroll-screens': [
          './src/screens/payroll_run',
          './src/screens/payrollemp',
        ],
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Chunk Loading Failed**
   - Usually caused by network issues or outdated deployments
   - Retry logic handles transient failures
   - For persistent issues, clear browser cache

2. **Flash of Loading State**
   - Expected behavior for lazy-loaded components
   - Can be reduced with prefetching
   - RouteLoading component provides smooth transition

3. **Build Size Concerns**
   - Use bundle analyzer to identify large chunks
   - Consider splitting large dependencies
   - Review and optimize heavy components

## Migration Checklist

- [x] Create lazy loading utility with retry logic
- [x] Update all screen imports to use lazy loading
- [x] Update layout imports to use lazy loading
- [x] Create dedicated loading component
- [x] Update Suspense boundaries with proper fallbacks
- [x] Document implementation and best practices
- [ ] Run production build and analyze bundle sizes
- [ ] Test all routes for proper loading
- [ ] Monitor performance metrics
- [ ] Set up bundle size monitoring in CI/CD

## Testing

### Manual Testing

1. Clear browser cache
2. Navigate through all major routes
3. Check Network tab for chunk loading
4. Verify loading states appear correctly
5. Test with slow network conditions
6. Test with network failures (offline)

### Automated Testing

Existing tests should continue to work without modification, as lazy loading is transparent to component behavior.

## Conclusion

This implementation provides a solid foundation for code splitting in the application. The lazy loading utility with retry logic ensures robust chunk loading, while the organized structure allows for future optimizations as the application grows.

For questions or improvements, please refer to the React documentation on code splitting: https://react.dev/reference/react/lazy
