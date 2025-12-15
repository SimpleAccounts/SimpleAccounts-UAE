# React Router v5 to v6 Migration Plan

## Overview

This document outlines the comprehensive migration plan for upgrading React Router from v5.0.1 to v6.x in the SimpleAccounts-UAE frontend application.

**Issue**: [#161](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/161)  
**Current Version**: react-router-dom@5.0.1  
**Target Version**: react-router-dom@6.x  
**Estimated Effort**: Medium (4-16 hours)

## Current State Analysis

### Dependencies
- `react-router-dom`: ^5.0.1
- `react-router-config`: ^5.0.1
- `history`: ^4.10.1

### Key Files Identified

#### Core Routing Files
1. **`apps/frontend/src/app.js`**
   - Uses `Router` with `history` prop
   - Uses `Switch` component
   - Uses `Route` with `component` prop

2. **`apps/frontend/src/layouts/admin/index.js`**
   - Uses `Switch`, `Redirect`, `Route`
   - Uses `PrivateRoute` component

3. **`apps/frontend/src/layouts/initial/index.js`**
   - Uses `Switch`, `Redirect`, `Route` with `component` prop
   - Uses `this.props.history.push()`

4. **`apps/frontend/src/layouts/private.js`**
   - Custom `PrivateRoute` component using `render` prop pattern

### Usage Statistics
- **203 files** use `this.props.history` (mostly class components)
- **2 files** use `withRouter` HOC:
  - `apps/frontend/src/screens/financial_report/sections/vat_return/screen.js`
  - `apps/frontend/src/components/react-image-upload/index.js`
- **Multiple files** use `Redirect` component
- **All route definitions** use `component` prop instead of `element`

## Migration Strategy

### Phase 1: Preparation & Setup

#### 1.1 Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/react-router-v6-migration
```

#### 1.2 Update Dependencies
- Update `react-router-dom` to v6
- Remove `react-router-config` (not needed in v6)
- Keep `history` package (may still be used for programmatic navigation in class components)

#### 1.3 Create Verification Tests
- Test suite to verify routing functionality
- Tests for protected routes
- Tests for navigation flows
- Tests for route parameters

### Phase 2: Core Routing Migration

#### 2.1 Update `app.js`
**Changes:**
- Replace `Router` with `history` prop → `BrowserRouter`
- Replace `Switch` → `Routes`
- Replace `Route component={...}` → `Route element={<... />}`
- Remove `createBrowserHistory` import (not needed with BrowserRouter)

**Before:**
```javascript
import { Router, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'

const hist = createBrowserHistory()

<Router history={hist}>
  <Switch>
    {mainRoutes.map((prop, key) => {
      return <Route path={prop.path} key={key} component={prop.component} />
    })}
  </Switch>
</Router>
```

**After:**
```javascript
import { BrowserRouter, Route, Routes } from 'react-router-dom'

<BrowserRouter>
  <Routes>
    {mainRoutes.map((prop, key) => {
      return <Route path={prop.path} key={key} element={<prop.component />} />
    })}
  </Routes>
</BrowserRouter>
```

#### 2.2 Update Route Definitions
**Files to update:**
- `apps/frontend/src/routes/main.js` - Convert component references to elements
- `apps/frontend/src/routes/admin.js` - Update route structure if needed
- `apps/frontend/src/routes/initial.js` - Update redirect handling

### Phase 3: Layout Components Migration

#### 3.1 Update `layouts/initial/index.js`
**Changes:**
- Replace `Switch` → `Routes`
- Replace `Route component={...}` → `Route element={<... />}`
- Replace `Redirect` → `Navigate`
- Update `this.props.history.push()` → Use `useNavigate()` hook (requires converting to functional component or creating wrapper)

**Before:**
```javascript
<Switch>
  {initialRoutes.map((prop, key) => {
    if (prop.redirect) {
      return <Redirect from={prop.path} to={prop.pathTo} key={key} />;
    }
    return <Route path={prop.path} component={prop.component} key={key} />;
  })}
</Switch>
```

**After:**
```javascript
<Routes>
  {initialRoutes.map((prop, key) => {
    if (prop.redirect) {
      return <Route path={prop.path} key={key} element={<Navigate to={prop.pathTo} replace />} />;
    }
    return <Route path={prop.path} element={<prop.component />} key={key} />;
  })}
</Routes>
```

**Note:** For `this.props.history.push()` in `componentDidMount`, we have three options:
1. ✅ **Use `withNavigation` HOC** (RECOMMENDED - already implemented)
   - Minimal code changes
   - Backward compatible with v5 API
   - No refactoring required
   - See `apps/frontend/src/utils/withNavigation.js`
2. Convert class component to functional component
   - Massive refactor (203 files)
   - High risk and time consuming
3. Create a wrapper component that uses `useNavigate` and passes navigate function as prop
   - More complex than HOC approach

**See `docs/REACT_ROUTER_V6_PHASE3_RECOMMENDATION.md` for detailed analysis and warnings.**

#### 3.2 Update `layouts/admin/index.js`
**Changes:**
- Replace `Switch` → `Routes`
- Replace `Redirect` → `Navigate`
- Update `PrivateRoute` usage (see Phase 4)

### Phase 4: PrivateRoute Component Migration

#### 4.1 Update `layouts/private.js`
**Current Pattern (v5):**
```javascript
const PrivateRoute = ({ component: Component, name, node, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        node && found ? (
          <Component {...props} />
        ) : (
          <center>...</center>
        )
      }
    />
  );
};
```

**New Pattern (v6):**
```javascript
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, name, node, ...rest }) => {
  if (node.length === 0) {
    return null;
  }
  
  const found = node.some((ele) => ele.moduleName === name);
  
  return found ? (
    element
  ) : (
    <center>
      <div>
        <i className="fas fa-exclamation-triangle fa-8x"></i>
        <br></br><br></br>
        <b>You Are Not Allowed to view this page</b>
      </div>
    </center>
  );
};
```

**Usage in admin layout:**
```javascript
<Routes>
  {adminRoutes?.map((prop, key) => {
    if (prop?.redirect) {
      return <Route path={prop.path} key={key} element={<Navigate to={prop.pathTo} replace />} />;
    }
    return (
      <Route
        path={prop.path}
        key={key}
        element={
          <PrivateRoute
            element={<prop.component />}
            name={prop.name}
            node={user_role_list}
          />
        }
      />
    );
  })}
</Routes>
```

### Phase 5: Class Component Navigation Migration

#### 5.1 Challenge
203 files use `this.props.history.push()` in class components. Converting all to functional components would be a massive refactor.

#### 5.2 Solution: Create Navigation HOC
Create a Higher-Order Component that injects navigation capabilities:

**File: `apps/frontend/src/utils/withNavigation.js`**
```javascript
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React from 'react';

export function withNavigation(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    
    const navigation = {
      push: (path, state) => navigate(path, { state }),
      replace: (path, state) => navigate(path, { replace: true, state }),
      go: (n) => navigate(n),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
    };
    
    return (
      <Component
        {...props}
        history={navigation}
        match={{ params }}
        location={location}
      />
    );
  };
}
```

**Usage:**
```javascript
import { withNavigation } from 'utils/withNavigation';

class MyComponent extends React.Component {
  handleClick = () => {
    this.props.history.push('/dashboard');
  }
}

export default withNavigation(MyComponent);
```

#### 5.3 Alternative: Create Navigation Context
For components that can't use HOC, create a navigation context provider.

### Phase 6: withRouter Migration

#### 6.1 Files Using withRouter
1. `apps/frontend/src/screens/financial_report/sections/vat_return/screen.js`
2. `apps/frontend/src/components/react-image-upload/index.js`

#### 6.2 Migration Strategy
**Option 1:** Convert to functional component and use hooks
**Option 2:** Use the `withNavigation` HOC created in Phase 5

**Before:**
```javascript
import { withRouter } from 'react-router-dom';
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Component));
```

**After (with HOC):**
```javascript
import { withNavigation } from 'utils/withNavigation';
export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Component));
```

### Phase 7: Route Parameters Migration

#### 7.1 Update Components Using Route Params
In v5, params were accessed via `match.params`. In v6, use `useParams()` hook.

**For class components:** Use the `withNavigation` HOC which provides `match.params`.

**For functional components:**
```javascript
// Before (v5)
const { id } = this.props.match.params;

// After (v6)
import { useParams } from 'react-router-dom';
const { id } = useParams();
```

### Phase 8: Redirect Migration

#### 8.1 Replace All Redirect Components
**Before:**
```javascript
<Redirect from="/old" to="/new" />
```

**After:**
```javascript
<Route path="/old" element={<Navigate to="/new" replace />} />
```

**Note:** In v6, `Redirect` with `from` prop is replaced with `Route` + `Navigate`.

### Phase 9: Testing & Verification

#### 9.1 Update Existing Tests
- Update `apps/frontend/src/routes/routing.test.js` for v6 patterns
- Update all component tests using `BrowserRouter` or `MemoryRouter`

#### 9.2 Create Verification Test Suite
Create comprehensive tests for:
1. Basic routing (home, about, etc.)
2. Protected routes (PrivateRoute)
3. Navigation flows (login → dashboard)
4. Route parameters
5. Redirects
6. Nested routes

#### 9.3 Manual Testing Checklist
- [ ] Login flow works
- [ ] Dashboard loads correctly
- [ ] Protected routes redirect when unauthorized
- [ ] All navigation links work
- [ ] Route parameters are accessible
- [ ] Browser back/forward buttons work
- [ ] Deep linking works (direct URL access)
- [ ] Logout redirects correctly

### Phase 10: Cleanup

#### 10.1 Remove Unused Dependencies
- Check if `react-router-config` is still needed
- Check if `history` package is still needed (may be used elsewhere)

#### 10.2 Update Documentation
- Update any routing documentation
- Update developer guidelines

## Migration Patterns Reference

### Pattern 1: Switch → Routes
```javascript
// v5
<Switch>
  <Route path="/" component={Home} />
</Switch>

// v6
<Routes>
  <Route path="/" element={<Home />} />
</Routes>
```

### Pattern 2: Route component → element
```javascript
// v5
<Route path="/dashboard" component={Dashboard} />

// v6
<Route path="/dashboard" element={<Dashboard />} />
```

### Pattern 3: Redirect → Navigate
```javascript
// v5
<Redirect from="/old" to="/new" />

// v6
<Route path="/old" element={<Navigate to="/new" replace />} />
```

### Pattern 4: useHistory → useNavigate
```javascript
// v5
const history = useHistory();
history.push('/dashboard');

// v6
const navigate = useNavigate();
navigate('/dashboard');
```

### Pattern 5: match.params → useParams
```javascript
// v5 (class component)
const { id } = this.props.match.params;

// v6 (functional component)
const { id } = useParams();
```

### Pattern 6: Router with history → BrowserRouter
```javascript
// v5
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
const hist = createBrowserHistory();
<Router history={hist}>...</Router>

// v6
import { BrowserRouter } from 'react-router-dom';
<BrowserRouter>...</BrowserRouter>
```

## Risk Assessment

### High Risk Areas
1. **Class Components with history**: 203 files need navigation wrapper
2. **PrivateRoute**: Custom component needs refactoring
3. **Nested Routes**: May need restructuring
4. **Route Parameters**: Many components rely on match.params

### Mitigation Strategies
1. Create comprehensive test suite before migration
2. Use HOC pattern for class components (minimal changes)
3. Test protected routes thoroughly
4. Incremental migration: migrate one layout at a time

## Rollback Plan

If issues arise:
1. Revert package.json to v5.0.1
2. Restore original routing files from git
3. Run test suite to verify functionality restored

## Success Criteria

- [ ] All tests pass
- [ ] No console errors related to routing
- [ ] All navigation flows work correctly
- [ ] Protected routes function properly
- [ ] Route parameters accessible in all components
- [ ] Browser back/forward buttons work
- [ ] Bundle size reduced (v6 is smaller)
- [ ] TypeScript support improved (if applicable)

## Timeline Estimate

- **Phase 1-2**: 2-3 hours (Setup + Core routing)
- **Phase 3-4**: 2-3 hours (Layouts + PrivateRoute)
- **Phase 5-6**: 3-4 hours (Class components + withRouter)
- **Phase 7-8**: 1-2 hours (Params + Redirects)
- **Phase 9**: 2-3 hours (Testing)
- **Phase 10**: 1 hour (Cleanup)

**Total**: 11-16 hours

## Dependencies

### Blocked By
- ✅ [TASK] Migrate from Create React App to Vite #157 - Completed

### Blocks
- None identified

## Notes

- React Router v6 requires React 16.8+ (we have React 18.2.0 ✅)
- v6 has better TypeScript support
- v6 has smaller bundle size
- v6 uses hooks-based API (more modern)
- Some breaking changes require careful migration

## References

- [React Router v6 Migration Guide](https://reactrouter.com/en/main/upgrading/v5)
- [React Router v6 Documentation](https://reactrouter.com/en/main)
- [Issue #161](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/161)

