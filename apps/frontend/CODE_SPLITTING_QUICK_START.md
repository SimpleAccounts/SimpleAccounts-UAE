# Code Splitting - Quick Start Guide

## What Changed?

All route components now use **React.lazy()** for automatic code splitting. This means:

- ✅ Faster initial page load
- ✅ Smaller bundle sizes
- ✅ Better performance
- ✅ Improved user experience

## For Developers

### Adding a New Screen

When adding a new screen, use the lazy loading utility:

```javascript
// In src/screens/index.js

import lazyLoad from '../utils/lazyLoad';

// Add your new screen
const MyNewScreen = lazyLoad(() => import('./my_new_screen'));

// Export it
export {
  // ... other exports
  MyNewScreen,
};
```

### Adding a New Route

Routes work the same as before. Just use the lazy-loaded component:

```javascript
// In src/routes/admin.js

import { MyNewScreen } from 'screens';

{
  path: 'my-route',
  name: 'My New Screen',
  component: MyNewScreen.screen,
}
```

### Common Patterns

#### 1. Lazy Load a Screen

```javascript
const Dashboard = lazyLoad(() => import('./screens/dashboard'));
```

#### 2. Preload a Screen (for better UX)

```javascript
import { preloadComponent } from 'utils/lazyLoad';

// Preload on hover
onMouseEnter={() => preloadComponent(() => import('./screens/dashboard'))}
```

#### 3. Add Loading State

```javascript
import { Suspense } from 'react';
import { RouteLoading } from 'components';

<Suspense fallback={<RouteLoading />}>
  <MyComponent />
</Suspense>;
```

## Testing Your Changes

### 1. Build the App

```bash
npm run build
```

### 2. Check Bundle Sizes

Look for output showing chunk files in the build output.

### 3. Test Locally

```bash
npm run dev
```

### 4. Verify in Browser

1. Open DevTools → Network tab
2. Navigate to different routes
3. Look for JS chunks loading on demand
4. Verify loading states appear briefly

## Common Issues

### Issue: "Loading chunk failed"

**Cause**: Network issue or cached old chunk
**Solution**: Retry logic handles this automatically

### Issue: Component not loading

**Cause**: Incorrect import path
**Solution**: Double-check the import path matches the file location

### Issue: Blank screen

**Cause**: Error in lazy-loaded component
**Solution**: Check browser console for errors

## Best Practices

### ✅ DO:

- Use `lazyLoad()` for all route-level components
- Add `<Suspense>` boundaries with fallback UI
- Test network throttling in DevTools
- Monitor bundle sizes in CI/CD

### ❌ DON'T:

- Lazy load tiny components (<10KB)
- Lazy load frequently used shared components
- Lazy load components needed on initial render
- Forget to add error boundaries

## Performance Tips

1. **Measure First**: Use Lighthouse before/after
2. **Monitor Chunks**: Keep chunks under 1MB when possible
3. **Preload Critical Routes**: For better perceived performance
4. **Cache Headers**: Ensure proper caching in production

## Files to Know

| File                                                       | Purpose                               |
| ---------------------------------------------------------- | ------------------------------------- |
| `/src/utils/lazyLoad.js`                                   | Lazy loading utility with retry logic |
| `/src/screens/index.js`                                    | All screen exports (lazy-loaded)      |
| `/src/layouts/index.js`                                    | Layout exports (lazy-loaded)          |
| `/src/components/loading/RouteLoading.jsx`                 | Loading component for routes          |
| `/src/components/error-boundary/LazyLoadErrorBoundary.jsx` | Error handling for chunk failures     |

## Need Help?

1. Read the full guide: `CODE_SPLITTING_GUIDE.md`
2. Check implementation summary: `CODE_SPLITTING_IMPLEMENTATION_SUMMARY.md`
3. Review the code in `/src/utils/lazyLoad.js`

## Example: Adding a New Module

Let's say you're adding a "Customer Portal" module:

### Step 1: Create the Screen

```bash
mkdir src/screens/customer_portal
# Create your screen files...
```

### Step 2: Add to screens/index.js

```javascript
// Customer Portal Screens
const CustomerPortal = lazyLoad(() => import('./customer_portal'));
const CustomerPortalDashboard = lazyLoad(() => import('./customer_portal/screens/dashboard'));
const CustomerPortalSettings = lazyLoad(() => import('./customer_portal/screens/settings'));

export {
  // ... other exports
  CustomerPortal,
  CustomerPortalDashboard,
  CustomerPortalSettings,
};
```

### Step 3: Add Routes

```javascript
// In src/routes/admin.js
import { CustomerPortal, CustomerPortalDashboard } from 'screens';

{
  path: 'customer-portal',
  name: 'Customer Portal',
  component: CustomerPortal.screen,
},
{
  path: 'customer-portal/dashboard',
  name: 'Portal Dashboard',
  component: CustomerPortalDashboard.screen,
},
```

### Step 4: Test

```bash
npm run dev
# Navigate to /admin/customer-portal
# Check Network tab for chunk loading
```

That's it! Your new module is now code-split and lazy-loaded automatically.

## Troubleshooting Commands

```bash
# Build and check for errors
npm run build

# Start dev server with verbose logging
npm run dev -- --debug

# Check bundle composition (if analyzer is configured)
npm run analyze

# Clear node_modules and reinstall (nuclear option)
rm -rf node_modules package-lock.json
npm install
```

## Quick Checklist

Before committing code with lazy loading:

- [ ] Used `lazyLoad()` for route components
- [ ] Added proper Suspense boundaries
- [ ] Tested the route works in dev mode
- [ ] Tested the route works in production build
- [ ] Checked Network tab for chunk loading
- [ ] Verified loading states appear
- [ ] Tested with slow network (throttling)
- [ ] No console errors
- [ ] Build succeeds without warnings

## Additional Resources

- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [Code Splitting Guide](https://react.dev/learn/scaling-up-with-reducer-and-context#splitting-code)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#dynamic-import)

---

**Remember**: Code splitting is already set up and working. Just follow the patterns above for new code!
