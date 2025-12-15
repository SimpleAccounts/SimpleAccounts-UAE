# Redux Toolkit Migration Battle Plan

**Issue**: [#162](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/162)  
**Branch**: `feature/redux-toolkit-migration`  
**Estimated Effort**: Large (> 16 hours)

## Executive Summary

This battle plan outlines the complete migration strategy from traditional Redux to Redux Toolkit (RTK) for the SimpleAccounts-UAE frontend application. The migration will modernize state management, reduce boilerplate, and improve maintainability while ensuring zero functional regressions.

## Current State Analysis

### Dependencies
- **Redux**: v5.0.1
- **Redux Thunk**: v2.3.0
- **React Redux**: v7.1.1
- **Redux Mock Store**: v1.5.5 (for testing)

### Architecture
- **Store**: `apps/frontend/src/services/store.js` - Uses `createStore` with manual DevTools setup
- **Root Reducer**: `apps/frontend/src/services/reducer.js` - Combines ~50+ reducers
- **Reducers**: Traditional switch-case pattern in `reducer.js` files
- **Actions**: Thunk functions returning `(dispatch) => { ... }` in `actions.js` files
- **State Updates**: Manual immutable updates with spread operators and `Object.assign`

### Reducer Inventory
**Global Reducers** (2):
- `auth` - Authentication state
- `common` - Common UI state (loading, notifications, currency lists)

**Screen Reducers** (~48):
- Dashboard, Journal, BankAccount, Employee, Contact, Expense
- GeneralSettings, CustomerInvoice, SupplierInvoice, Receipt
- Product, Project, Payment, TransactionCategory
- VatCode, Currency, CurrencyConvert, VatTransactions
- Help, Notification, Organization, UsersRoles, DataBackup
- TransactionsReport, ChartAccount, ProductCategory, Profile
- ImportTransaction, OpeningBalance, Inventory
- Quotation, RequestForQuotation, PurchaseOrder, GoodsReceivedNote
- FinancialReport, DebitNotes, CreditNotes
- SalaryRoles, SalaryStructure, SalaryTemplate, Designation
- PayrollEmployee, User, PayrollRun, Import
- InvoiceViewJournalReducer (component-level)

## Migration Strategy

### Phase 1: Foundation Setup (2-3 hours)
**Goal**: Install RTK and migrate store configuration with zero breaking changes

#### Tasks
1. ✅ Install `@reduxjs/toolkit` package
2. ✅ Update `apps/frontend/src/services/store.js` to use `configureStore`
3. ✅ Ensure Redux DevTools integration works automatically
4. ✅ Verify app runs with existing reducers (backward compatible)
5. ✅ Update `apps/frontend/src/services/redux.test.js` to test RTK store

#### Implementation Details

**Store Migration** (`apps/frontend/src/services/store.js`):

**Before**:
```javascript
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducer'

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(initialState={}) {
  return createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(thunk)
    )
  )
}
```

**After**:
```javascript
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'

export default function configureStore(initialState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
  })
}
```

#### Verification Tests
- [ ] App starts without errors
- [ ] Redux DevTools connects and shows state
- [ ] All existing functionality works
- [ ] Store tests pass
- [ ] No console errors/warnings

#### Rollback Plan
If issues arise, revert `store.js` to previous version. RTK is backward compatible with traditional reducers.

---

### Phase 2: Global Reducers Migration (3-4 hours)
**Goal**: Migrate auth and common reducers to RTK slices

#### Tasks
1. Create `apps/frontend/src/services/global/auth/authSlice.js`
2. Create `apps/frontend/src/services/global/common/commonSlice.js`
3. Migrate action types to slice actions
4. Convert async actions to `createAsyncThunk`
5. Update `apps/frontend/src/services/reducer.js` imports
6. Update components using these reducers
7. Update tests

#### Implementation Pattern

**Auth Reducer Migration**:

**Before** (`apps/frontend/src/services/global/auth/reducer.js`):
```javascript
const initState = {
  is_authed: true,
  profile: [],
  ccount: '',
}

const AuthReducer = (state = initState, action) => {
  const { type, payload } = action;
  switch (type) {
    case AUTH.SIGNED_IN:
      return { ...state, is_authed: true };
    case AUTH.SIGNED_OUT:
      return { ...state, is_authed: false };
    case AUTH.USER_PROFILE:
      return { ...state, profile: Object.assign({}, payload.data) };
    default:
      return state;
  }
}
```

**After** (`apps/frontend/src/services/global/auth/authSlice.js`):
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi, cryptoService } from 'utils'

// Async thunks
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = { method: 'get', url: '/rest/user/current' }
      const res = await authApi(data)
      if (res.status === 200) {
        cryptoService.encryptService('userId', res.data.userId)
        return res.data
      }
      return rejectWithValue('Auth Failed')
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    is_authed: true,
    profile: [],
    ccount: '',
    loading: false,
    error: null,
  },
  reducers: {
    signedIn: (state) => {
      state.is_authed = true
    },
    signedOut: (state) => {
      state.is_authed = false
    },
    setUserProfile: (state, action) => {
      state.profile = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false
        state.is_authed = true
        state.profile = action.payload
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { signedIn, signedOut, setUserProfile } = authSlice.actions
export default authSlice.reducer
```

**Action Migration**:

**Before** (`apps/frontend/src/services/global/auth/actions.js`):
```javascript
export const checkAuthStatus = () => {
  return (dispatch) => {
    let data = { method: 'get', url: '/rest/user/current' }
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({ type: AUTH.SIGNED_IN })
          dispatch({ type: AUTH.USER_PROFILE, payload: { data: res.data } })
          return res
        }
      })
      .catch((err) => { throw err })
  }
}
```

**After**: Use `createAsyncThunk` (see above)

#### Verification Tests
- [ ] Authentication flow works (login, logout, check status)
- [ ] User profile loads correctly
- [ ] Common state works (loading, notifications, currency lists)
- [ ] All tests pass
- [ ] No console errors
- [ ] Components using `useSelector` work correctly

#### Files to Modify
- `apps/frontend/src/services/global/auth/reducer.js` → `authSlice.js`
- `apps/frontend/src/services/global/auth/actions.js` → Update to export thunks
- `apps/frontend/src/services/global/common/reducer.js` → `commonSlice.js`
- `apps/frontend/src/services/global/common/actions.js` → Update to export thunks
- `apps/frontend/src/services/reducer.js` - Update imports
- All components using `auth` and `common` state

---

### Phase 3: High-Priority Screen Reducers (6-8 hours)
**Goal**: Migrate frequently used screen reducers

#### Priority Order
1. **Dashboard** - Most frequently accessed
2. **Customer Invoice** - Core business functionality
3. **Supplier Invoice** - Core business functionality
4. **Product** - Frequently used
5. **Payment** - Core business functionality
6. **Receipt** - Core business functionality

#### Tasks (per reducer)
1. Identify all action creators in `actions.js`
2. Convert sync actions to slice reducers
3. Convert async actions to `createAsyncThunk`
4. Update reducer file to use `createSlice`
5. Update components using the reducer
6. Update tests

#### Implementation Pattern

**Product Reducer Example**:

**Before** (`apps/frontend/src/screens/product/reducer.js`):
```javascript
const initState = {
  product_list: [],
  vat_list: [],
  // ...
}

const ProductReducer = (state = initState, action) => {
  const { type, payload } = action
  switch(type) {
    case PRODUCT.PRODUCT_LIST:
      return { ...state, product_list: Object.assign([], payload) }
    case PRODUCT.PRODUCT_VAT_CATEGORY:
      return { ...state, vat_list: Object.assign([], payload) }
    default:
      return state
  }
}
```

**After** (`apps/frontend/src/screens/product/productSlice.js`):
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from 'utils'

export const getProductList = createAsyncThunk(
  'product/getProductList',
  async (obj, { rejectWithValue }) => {
    try {
      const name = obj.name || ''
      const productCode = obj.productCode || ''
      // ... build URL params
      const data = {
        method: 'GET',
        url: `/rest/product/getList?name=${name}&productCode=${productCode}...`,
      }
      const res = await authApi(data)
      if (!obj.paginationDisable) {
        return res.data
      }
      return res
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

const productSlice = createSlice({
  name: 'product',
  initialState: {
    product_list: [],
    vat_list: [],
    product_warehouse_list: [],
    product_category_list: [],
    inventory_account_list: [],
    inventory_list: [],
    inventory_history_list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProductList: (state, action) => {
      state.product_list = action.payload
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload
    },
    // ... other sync reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProductList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.product_list = action.payload
        }
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setProductList, setVatList } = productSlice.actions
export default productSlice.reducer
```

#### Verification Tests (per reducer)
- [ ] List views work
- [ ] Create/Edit forms work
- [ ] Data fetching works
- [ ] State updates correctly
- [ ] Loading states work
- [ ] Error handling works
- [ ] Tests pass

---

### Phase 4: Remaining Screen Reducers (4-6 hours)
**Goal**: Migrate all remaining screen reducers

#### Remaining Reducers
- Journal, BankAccount, Employee, Contact, Expense
- GeneralSettings, VatTransactions, DebitNotes, CreditNotes
- RequestForQuotation, PurchaseOrder, GoodsReceivedNote, Quotation
- Project, TransactionCategory, Currency, CurrencyConvert
- Help, Notification, Organization, UsersRoles, DataBackup
- TransactionsReport, ChartAccount, ProductCategory, Profile
- ImportTransaction, OpeningBalance, Inventory
- SalaryRoles, SalaryStructure, SalaryTemplate, Designation
- PayrollEmployee, User, PayrollRun, Import
- InvoiceViewJournalReducer (component-level)

#### Tasks
Same as Phase 3, but batch process multiple reducers at once.

#### Verification Tests
- [ ] All screens functional
- [ ] All tests pass
- [ ] No regressions
- [ ] Performance acceptable

---

### Phase 5: Cleanup and Optimization (1-2 hours)
**Goal**: Remove old Redux code and optimize

#### Tasks
1. Remove unused action type constants (if any remain)
2. Remove `redux-thunk` dependency (RTK includes it)
3. Update documentation
4. Code review and refactoring
5. Performance testing
6. Bundle size analysis

#### Verification Tests
- [ ] No unused imports
- [ ] Bundle size check (should be similar or smaller)
- [ ] Performance benchmarks
- [ ] Documentation updated
- [ ] All tests pass

---

## Verification Test Suite

### Unit Tests
- Store configuration tests
- Slice reducer tests
- Async thunk tests
- Action creator tests

### Integration Tests
- Store integration tests
- Redux DevTools integration
- Component-redux connection tests

### E2E Tests
- Critical user flows (login, invoice creation, etc.)
- State persistence
- Navigation with state

### Test Files to Create/Update
1. `apps/frontend/src/services/redux-toolkit.test.js` - RTK-specific tests
2. `apps/frontend/src/services/global/auth/__tests__/authSlice.test.js`
3. `apps/frontend/src/services/global/common/__tests__/commonSlice.test.js`
4. Update existing reducer tests to work with slices

---

## Risk Mitigation

### Potential Issues

1. **Breaking Changes**: RTK uses Immer, which allows "mutating" state
   - **Mitigation**: RTK handles immutability automatically, test thoroughly

2. **Action Type Changes**: RTK generates action types automatically
   - **Mitigation**: Update all dispatch calls, use action creators from slices

3. **Test Failures**: Tests may need significant updates
   - **Mitigation**: Update tests incrementally, maintain test coverage

4. **Component Updates**: Components using `connect` or `useSelector` may need updates
   - **Mitigation**: React Redux v7+ works with RTK, minimal changes needed

5. **Third-party Middleware**: If any custom middleware exists
   - **Mitigation**: RTK's `configureStore` supports middleware, check compatibility

### Rollback Plan

If critical issues arise:
1. Revert to previous commit
2. Document issues encountered
3. Create follow-up issues for specific problems
4. Re-attempt migration with lessons learned

---

## Success Criteria

- ✅ All reducers migrated to RTK slices
- ✅ All async actions use `createAsyncThunk`
- ✅ Store configured with `configureStore`
- ✅ All tests pass
- ✅ No functional regressions
- ✅ Redux DevTools working
- ✅ Code is cleaner and more maintainable
- ✅ Bundle size acceptable
- ✅ Documentation updated

---

## Timeline Estimate

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 6-8 hours (high-priority reducers)
- **Phase 4**: 4-6 hours (remaining reducers)
- **Phase 5**: 1-2 hours (cleanup)

**Total**: 16-23 hours

---

## Next Steps

1. ✅ Review and approve this battle plan
2. ✅ Create feature branch
3. ⏳ Start Phase 1: Installation and Store Setup
4. ⏳ Test thoroughly after each phase
5. ⏳ Document any deviations or issues
6. ⏳ Create PR after all phases complete

---

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Toolkit Migration Guide](https://redux-toolkit.js.org/usage/migrating-to-modern-redux)
- [Issue #162](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/162)

