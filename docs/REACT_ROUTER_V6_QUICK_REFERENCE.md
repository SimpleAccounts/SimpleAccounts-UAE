# React Router v6 Migration Quick Reference

## Quick Migration Checklist

### ✅ Step 1: Update Dependencies
```bash
cd apps/frontend
npm install react-router-dom@6
npm uninstall react-router-config  # Not needed in v6
```

### ✅ Step 2: Core Files to Migrate (Priority Order)

1. **`src/app.js`** - Main routing entry point
2. **`src/layouts/private.js`** - PrivateRoute component
3. **`src/layouts/initial/index.js`** - Initial layout routes
4. **`src/layouts/admin/index.js`** - Admin layout routes
5. **`src/utils/withNavigation.js`** - Already created ✅

### ✅ Step 3: Common Patterns

#### Pattern 1: Switch → Routes
```javascript
// ❌ v5
<Switch>
  <Route path="/" component={Home} />
</Switch>

// ✅ v6
<Routes>
  <Route path="/" element={<Home />} />
</Routes>
```

#### Pattern 2: Route component → element
```javascript
// ❌ v5
<Route path="/dashboard" component={Dashboard} />

// ✅ v6
<Route path="/dashboard" element={<Dashboard />} />
```

#### Pattern 3: Redirect → Navigate
```javascript
// ❌ v5
<Redirect from="/old" to="/new" />

// ✅ v6
<Route path="/old" element={<Navigate to="/new" replace />} />
```

#### Pattern 4: Router with history → BrowserRouter
```javascript
// ❌ v5
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
const hist = createBrowserHistory();
<Router history={hist}>...</Router>

// ✅ v6
import { BrowserRouter } from 'react-router-dom';
<BrowserRouter>...</BrowserRouter>
```

#### Pattern 5: useHistory → useNavigate
```javascript
// ❌ v5
const history = useHistory();
history.push('/dashboard');

// ✅ v6
const navigate = useNavigate();
navigate('/dashboard');
```

#### Pattern 6: match.params → useParams
```javascript
// ❌ v5 (class component)
const { id } = this.props.match.params;

// ✅ v6 (functional component)
const { id } = useParams();
```

#### Pattern 7: Class Component Navigation
```javascript
// ❌ v5
class MyComponent extends React.Component {
  handleClick = () => {
    this.props.history.push('/dashboard');
  }
}
export default MyComponent;

// ✅ v6 (Option 1: Use HOC)
import { withNavigation } from 'utils/withNavigation';
class MyComponent extends React.Component {
  handleClick = () => {
    this.props.history.push('/dashboard');
  }
}
export default withNavigation(MyComponent);

// ✅ v6 (Option 2: Convert to functional)
import { useNavigate } from 'react-router-dom';
function MyComponent() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/dashboard');
  }
}
```

#### Pattern 8: withRouter → withNavigation
```javascript
// ❌ v5
import { withRouter } from 'react-router-dom';
export default withRouter(MyComponent);

// ✅ v6
import { withNavigation } from 'utils/withNavigation';
export default withNavigation(MyComponent);
```

### ✅ Step 4: PrivateRoute Migration

**Before (v5):**
```javascript
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);
```

**After (v6):**
```javascript
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Usage
<Route
  path="/dashboard"
  element={<PrivateRoute element={<Dashboard />} isAuthenticated={true} />}
/>
```

### ✅ Step 5: Verification

```bash
# Run verification script
./scripts/verify-router-migration.sh

# Run tests
cd apps/frontend
npm test -- routing.v6.test.js

# Check for linting issues
npm run lint
```

## Common Issues & Solutions

### Issue 1: "Cannot read property 'push' of undefined"
**Solution:** Wrap class component with `withNavigation` HOC

### Issue 2: "Route component prop is deprecated"
**Solution:** Change `component={...}` to `element={<... />}`

### Issue 3: "Redirect is not exported from react-router-dom"
**Solution:** Use `Navigate` component instead

### Issue 4: "Switch is not exported from react-router-dom"
**Solution:** Use `Routes` component instead

### Issue 5: "match.params is undefined"
**Solution:** Use `useParams()` hook or `withNavigation` HOC

## Testing Checklist

- [ ] All routes render correctly
- [ ] Navigation works (push, replace, goBack, goForward)
- [ ] Route parameters are accessible
- [ ] Protected routes redirect when unauthorized
- [ ] Redirects work correctly
- [ ] Browser back/forward buttons work
- [ ] Deep linking works (direct URL access)
- [ ] No console errors

## Files Created for Migration

1. ✅ `docs/REACT_ROUTER_V6_MIGRATION_PLAN.md` - Full migration plan
2. ✅ `docs/REACT_ROUTER_V6_QUICK_REFERENCE.md` - This file
3. ✅ `apps/frontend/src/routes/routing.v6.test.js` - Verification tests
4. ✅ `apps/frontend/src/utils/withNavigation.js` - Navigation HOC
5. ✅ `scripts/verify-router-migration.sh` - Verification script

## Next Steps

1. Review the full migration plan: `docs/REACT_ROUTER_V6_MIGRATION_PLAN.md`
2. Start with core routing files (app.js)
3. Test after each major change
4. Use verification script to check progress
5. Update all class components gradually

