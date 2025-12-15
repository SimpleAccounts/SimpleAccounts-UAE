# Phase 3 Implementation: Applying withNavigation HOC

## Strategy

Since we have **203 files** using `this.props.history`, we're using an **incremental, on-demand migration strategy**:

1. ✅ **Critical components first** - Components that are immediately accessed
2. 🔄 **On-demand migration** - Apply HOC when components are accessed and throw errors
3. 📝 **Document pattern** - Make it easy to apply when needed

## Components Already Migrated

✅ **Core Infrastructure:**
- `apps/frontend/src/layouts/initial/index.js`
- `apps/frontend/src/components/react-image-upload/index.js`
- `apps/frontend/src/screens/financial_report/sections/vat_return/screen.js`

✅ **Critical Screens:**
- `apps/frontend/src/screens/profile/screen.js`

## Migration Pattern

### Pattern 1: Component with Redux Connect

**Before:**
```javascript
import React from 'react';
import { connect } from 'react-redux';
// ... other imports

class MyComponent extends React.Component {
  componentDidMount() {
    this.props.history.push('/dashboard');
  }
  
  handleClick = () => {
    this.props.history.push('/admin/settings');
  }
  
  render() {
    // ... component code
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```

**After:**
```javascript
import React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'utils/withNavigation';
// ... other imports

class MyComponent extends React.Component {
  // Component code stays exactly the same!
  componentDidMount() {
    this.props.history.push('/dashboard'); // Still works!
  }
  
  handleClick = () => {
    this.props.history.push('/admin/settings'); // Still works!
  }
  
  render() {
    // ... component code
  }
}

// ✅ Correct: connect wraps withNavigation (withNavigation is inner HOC)
export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(MyComponent));
```

### Pattern 2: Component without Redux Connect

**Before:**
```javascript
import React from 'react';
// ... other imports

class MyComponent extends React.Component {
  handleClick = () => {
    this.props.history.push('/dashboard');
  }
  
  render() {
    // ... component code
  }
}

export default MyComponent;
```

**After:**
```javascript
import React from 'react';
import { withNavigation } from 'utils/withNavigation';
// ... other imports

class MyComponent extends React.Component {
  handleClick = () => {
    this.props.history.push('/dashboard');
  }
  
  render() {
    // ... component code
  }
}

export default withNavigation(MyComponent);
```

### Pattern 3: Component with Multiple HOCs

**Before:**
```javascript
export default connect(mapStateToProps, mapDispatchToProps)(
  someOtherHOC(MyComponent)
);
```

**After:**
```javascript
// ✅ Correct: withNavigation should be the innermost HOC
export default connect(mapStateToProps, mapDispatchToProps)(
  someOtherHOC(withNavigation(MyComponent))
);
```

## Step-by-Step Migration

### Step 1: Identify Component Needs Migration

A component needs migration if it:
- Uses `this.props.history.push()`
- Uses `this.props.history.replace()`
- Uses `this.props.history.go()`
- Uses `this.props.history.goBack()`
- Uses `this.props.history.goForward()`
- Uses `this.props.match.params`
- Uses `this.props.location`

### Step 2: Add Import

Add this import near the top of the file (after React imports, before component code):

```javascript
import { withNavigation } from 'utils/withNavigation';
```

### Step 3: Update Export

**If using connect():**
```javascript
// Find the export statement
export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);

// Update to:
export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(MyComponent));
```

**If NOT using connect():**
```javascript
// Find the export statement
export default MyComponent;

// Update to:
export default withNavigation(MyComponent);
```

### Step 4: Verify

1. Check that the import is correct
2. Check that HOC order is correct (withNavigation is inner when using connect)
3. Build the app: `npm run build`
4. Test the component in the browser

## Finding Components That Need Migration

### Using the Helper Script

```bash
./scripts/apply-with-navigation.sh
```

This script will:
- List all files using `this.props.history`
- Show which ones don't have `withNavigation` yet
- Provide migration instructions

### Manual Search

```bash
# Find all files using history.push
grep -r "this\.props\.history\.push" apps/frontend/src/screens --include="*.js"

# Find files that need migration (use history but don't have withNavigation)
grep -r "this\.props\.history" apps/frontend/src/screens --include="*.js" | \
  cut -d: -f1 | \
  sort -u | \
  while read file; do
    if ! grep -q "withNavigation" "$file"; then
      echo "$file"
    fi
  done
```

## Priority List

### High Priority (Apply First)
These components are most likely to be accessed immediately:

1. ✅ Profile (`screens/profile/screen.js`) - DONE
2. Dashboard screens (if they use history)
3. Login/Register screens (already done in layouts)
4. Settings screens
5. Common CRUD screens (Create, Detail, View)

### Medium Priority
- Report screens
- Master data screens
- Configuration screens

### Low Priority (On-Demand)
- Rarely used screens
- Legacy screens
- Screens that may be deprecated

## Common Issues & Solutions

### Issue 1: "Cannot read property 'push' of undefined"

**Cause:** Component uses `this.props.history.push()` but doesn't have `withNavigation` HOC.

**Solution:** Apply the HOC following the pattern above.

### Issue 2: Redux state not accessible

**Cause:** HOC order is wrong - `withNavigation` is wrapping `connect`.

**Solution:** Ensure `connect` wraps `withNavigation`:
```javascript
// ❌ Wrong
export default withNavigation(connect(...)(Component));

// ✅ Correct
export default connect(...)(withNavigation(Component));
```

### Issue 3: Route parameters not accessible

**Cause:** Component uses `this.props.match.params` but doesn't have HOC.

**Solution:** Apply `withNavigation` HOC - it provides `match.params`.

### Issue 4: Location state not accessible

**Cause:** Component uses `this.props.location.state` but doesn't have HOC.

**Solution:** Apply `withNavigation` HOC - it provides `location` with state.

## Testing After Migration

1. **Build Test:**
   ```bash
   cd apps/frontend && npm run build
   ```

2. **Runtime Test:**
   - Navigate to the component
   - Test navigation actions (buttons, links)
   - Test route parameters (if applicable)
   - Test location state (if applicable)

3. **Verify:**
   - No console errors
   - Navigation works correctly
   - Component renders properly

## Migration Progress Tracking

### Completed
- ✅ Core routing infrastructure
- ✅ Layout components
- ✅ withRouter replacements
- ✅ Profile screen

### Remaining
- 🔄 ~200 screen components (on-demand migration)

## Notes

- **No rush**: Components will work when accessed if they have the HOC
- **Incremental**: Apply HOC as you encounter issues or touch files
- **Low risk**: HOC is backward compatible, minimal code changes
- **Tested**: HOC has been tested and works correctly

## Summary

Phase 3 is about applying `withNavigation` HOC to class components. Since we have 203 files, we're using an **incremental, on-demand strategy**:

1. ✅ Critical components first (Profile done)
2. 🔄 Apply to components as they're accessed
3. 📝 Document pattern for easy application

The HOC is simple to apply (2 lines of code) and maintains backward compatibility with v5 API.

