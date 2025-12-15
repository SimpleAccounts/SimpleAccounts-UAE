# Manual Testing Guide for React Router v6 Migration

## Quick Start

### 1. Start the Development Server

```bash
cd apps/frontend
npm start
```

Or if using Vite:
```bash
npm run frontend
```

The application should start on `http://localhost:3000` (or the configured port).

### 2. Open Browser Developer Tools

Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux) to open DevTools.

**Check Console for Errors:**
- ✅ No errors related to routing
- ✅ No "withRouter is not a function" errors
- ✅ No "Switch is not exported" errors

## Testing Checklist

### ✅ Basic Navigation

1. **Login Flow**
   - [ ] Navigate to `/login`
   - [ ] Enter credentials and login
   - [ ] Should redirect to dashboard
   - [ ] URL should update correctly

2. **Dashboard Access**
   - [ ] After login, dashboard should load
   - [ ] URL should be `/admin/dashboard` (or configured route)
   - [ ] No console errors

3. **Navigation Links**
   - [ ] Click on sidebar menu items
   - [ ] Each link should navigate correctly
   - [ ] URL should update in address bar
   - [ ] Page content should change

### ✅ Protected Routes

1. **Unauthorized Access**
   - [ ] Logout or clear session
   - [ ] Try to access protected route directly (e.g., `/admin/dashboard`)
   - [ ] Should redirect to login page
   - [ ] Should show "You Are Not Allowed" message if accessing without permission

2. **Authorized Access**
   - [ ] Login with valid credentials
   - [ ] Access protected routes
   - [ ] Should load correctly without redirect

### ✅ Route Parameters

1. **Dynamic Routes**
   - [ ] Navigate to a route with parameters (e.g., `/admin/user/123`)
   - [ ] Component should receive and use the parameter
   - [ ] URL should reflect the parameter

2. **Query Parameters**
   - [ ] Navigate with query string (e.g., `/admin/invoice?id=123`)
   - [ ] Component should access query parameters
   - [ ] URL should maintain query string

### ✅ Browser Navigation

1. **Back Button**
   - [ ] Navigate to multiple pages
   - [ ] Click browser back button
   - [ ] Should navigate to previous page
   - [ ] Component state should be preserved (if applicable)

2. **Forward Button**
   - [ ] After going back, click forward button
   - [ ] Should navigate forward correctly

3. **Refresh**
   - [ ] Navigate to a route
   - [ ] Refresh the page (F5 or Cmd+R)
   - [ ] Should stay on the same route
   - [ ] Should not redirect to login (if authenticated)

### ✅ Deep Linking

1. **Direct URL Access**
   - [ ] Copy a route URL (e.g., `/admin/invoice/123`)
   - [ ] Open in new tab or paste in address bar
   - [ ] Should load the correct page
   - [ ] Should handle authentication correctly

2. **Bookmarks**
   - [ ] Bookmark a page
   - [ ] Open bookmark later
   - [ ] Should load correctly

### ✅ Redirects

1. **Initial Redirect**
   - [ ] Navigate to `/` (root)
   - [ ] Should redirect to `/login` (if not authenticated)
   - [ ] Should redirect to dashboard (if authenticated)

2. **Route Redirects**
   - [ ] Navigate to old/redirected routes
   - [ ] Should redirect to new routes correctly

### ✅ Error Handling

1. **404 Not Found**
   - [ ] Navigate to non-existent route (e.g., `/admin/nonexistent`)
   - [ ] Should show 404 page or appropriate error
   - [ ] Should not crash the application

## Browser Console Checks

### ✅ No Routing Errors

Open browser console and check for:

**Good (No Errors):**
```
✅ No errors
✅ No warnings about routing
```

**Bad (Errors to Fix):**
```
❌ TypeError: (0 , _reactRouterDom.withRouter) is not a function
❌ TypeError: Switch is not exported from 'react-router-dom'
❌ TypeError: Cannot read property 'push' of undefined
❌ Warning: <Route> component prop is deprecated
```

### ✅ Network Tab

1. Open DevTools → Network tab
2. Navigate between pages
3. Check:
   - [ ] No failed requests related to routing
   - [ ] API calls work correctly
   - [ ] No 404 errors for routes

## React DevTools Checks

### ✅ Component Tree

1. Install React DevTools browser extension
2. Open React DevTools
3. Check component tree:
   - [ ] `BrowserRouter` should be at the root
   - [ ] `Routes` should be used (not `Switch`)
   - [ ] `Route` components should use `element` prop

## Common Issues to Watch For

### ⚠️ Issue 1: Navigation Not Working
**Symptom**: Clicking links doesn't navigate
**Check**: 
- Console for errors
- Network tab for failed requests
- Verify `BrowserRouter` is wrapping the app

### ⚠️ Issue 2: Redirect Loop
**Symptom**: Page keeps redirecting
**Check**:
- Authentication state
- Redirect logic in layouts
- Route configuration

### ⚠️ Issue 3: Route Parameters Not Working
**Symptom**: `this.props.match.params` is undefined
**Check**:
- Component wrapped with `withNavigation` HOC
- Route path includes parameter (e.g., `/user/:id`)

### ⚠️ Issue 4: Protected Routes Not Working
**Symptom**: Can access protected routes without auth
**Check**:
- `PrivateRoute` component logic
- Permission checking
- Route configuration

## Quick Verification Commands

### Check React Router Version
```bash
cd apps/frontend
npm list react-router-dom
```

Should show: `react-router-dom@6.30.2` (or similar v6.x)

### Run Tests
```bash
cd apps/frontend
npm test -- --watchAll=false
```

Should show: All tests passing

### Check for v5 Patterns (Should Find None)
```bash
cd apps/frontend
grep -r "from 'react-router-dom'" src/ | grep -E "(Switch|Redirect|withRouter)" | grep -v test
```

Should return: No results (or only in test files)

## Success Criteria

✅ **All checks pass**
- No console errors
- All navigation works
- Protected routes function correctly
- Browser navigation works
- Deep linking works
- Route parameters accessible
- Tests passing

## If Issues Found

1. **Check Console**: Look for specific error messages
2. **Check Network Tab**: Look for failed requests
3. **Check React DevTools**: Verify component structure
4. **Review Known Issues**: See `docs/REACT_ROUTER_V6_KNOWN_ISSUES.md`
5. **Check Documentation**: See `docs/REACT_ROUTER_V6_QUICK_REFERENCE.md`

## Reporting Issues

If you find issues:
1. Note the exact error message from console
2. Note the route/action that caused it
3. Check if it's documented in `REACT_ROUTER_V6_KNOWN_ISSUES.md`
4. Report with steps to reproduce

