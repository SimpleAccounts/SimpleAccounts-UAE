# Technical Debt: Redux Toolkit Thunk Pattern Refactoring

## Issue Type
- [ ] Bug
- [x] Technical Debt / Refactoring
- [ ] Feature Request

## Description

The frontend codebase contains ~356 files using the legacy `.then((res) => res.status === 200)` pattern with Redux Toolkit async thunks. This pattern is incorrect because:

1. **Redux Toolkit thunks always resolve** - they return an action object, not the API response directly
2. **The correct pattern** is to check `action.type.includes('fulfilled')` and access `action.payload`

## Current (Incorrect) Pattern

```javascript
this.props.someActions.someThunk()
  .then((res) => {
    if (res.status === 200) {  // ❌ res is an action object, not API response
      this.setState({ data: res.data });
    }
  })
  .catch((err) => {
    // ❌ This never executes because thunks always resolve
    toast.error('Error');
  });
```

## Correct Pattern

```javascript
this.props.someActions.someThunk()
  .then((action) => {
    // ✅ Redux Toolkit thunks return action objects
    if (action && action.type && action.type.includes('fulfilled')) {
      this.setState({ data: action.payload });
    } else {
      // Handle rejected case
      const errorMessage = action?.payload || 'Something went wrong';
      toast.error(errorMessage);
    }
  })
  .catch((err) => {
    // This handles unexpected JavaScript errors, not API failures
    console.error('Unexpected error:', err);
  });
```

## Files Requiring Updates

Found in 356 files across `apps/frontend/src/screens/`. Priority areas:

### Already Fixed (Critical Paths)
- [x] `screens/log_in/screen.js` - Login form
- [x] `screens/register/screen.js` - Registration form
- [x] `layouts/admin/index.jsx` - Admin layout initialization
- [x] `layouts/admin/index.js` - Admin layout initialization
- [x] `screens/dashboard/sections/bank_account/index.js`
- [x] `screens/dashboard/sections/paid_invoices/index.js`
- [x] `screens/dashboard/sections/profit_loss_report/index.js`

### High Priority (User-facing critical flows)
- [ ] `screens/reset_password/screen.js`
- [ ] `screens/profile/screen.js`
- [ ] `screens/customer_invoice/` (all files)
- [ ] `screens/supplier_invoice/` (all files)
- [ ] `screens/payment/` (all files)
- [ ] `screens/receipt/` (all files)

### Medium Priority (CRUD operations)
- [ ] `screens/contact/` (all files)
- [ ] `screens/product/` (all files)
- [ ] `screens/bank_account/` (all files)
- [ ] `screens/expense/` (all files)
- [ ] `screens/chart_account/` (all files)

### Lower Priority (Reports and admin screens)
- [ ] `screens/financial_report/` (all files)
- [ ] `screens/user/` (all files)
- [ ] `screens/users_roles/` (all files)

## Acceptance Criteria

1. All thunk calls properly check `action.type.includes('fulfilled')`
2. Error cases are handled in the `.then()` block by checking for rejected actions
3. Loading states are properly managed (set false regardless of success/failure)
4. Error messages are shown to users via toast notifications
5. All existing tests pass
6. No regressions in existing functionality

## Estimated Effort

- **Files to update**: ~356
- **Estimated time**: 3-5 days for comprehensive update
- **Recommended approach**: Update module-by-module with testing

## Related Issues

- Related to frontend registration fixes (PR #235)
- Related to login flow fixes
- Related to dashboard data loading

## Labels
- `technical-debt`
- `frontend`
- `redux`
- `refactoring`

