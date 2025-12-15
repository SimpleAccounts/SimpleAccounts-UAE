# Redux Toolkit Migration Plan

## Overview

This document outlines the migration strategy from traditional Redux to Redux Toolkit (RTK) for the SimpleAccounts-UAE frontend application.

**Issue**: [#162](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/162)  
**Branch**: `feature/redux-toolkit-migration`  
**Estimated Effort**: Large (> 16 hours)

## Current State Analysis

### Current Redux Setup
- **Redux**: v5.0.1 (actually Redux v4.x)
- **Redux Thunk**: v2.3.0
- **React Redux**: v7.1.1
- **Store Configuration**: `createStore` with `applyMiddleware` and `compose`
- **Redux DevTools**: Manual setup via `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`
- **Reducers**: ~50+ reducers using traditional switch-case pattern
- **Actions**: Thunk functions returning `(dispatch) => { ... }`
- **State Updates**: Manual immutable updates with spread operators and `Object.assign`

### Key Files
- `apps/frontend/src/services/store.js` - Store configuration
- `apps/frontend/src/services/reducer.js` - Root reducer combining all reducers
- `apps/frontend/src/services/global/` - Global reducers (auth, common)
- `apps/frontend/src/screens/*/reducer.js` - Screen-specific reducers
- `apps/frontend/src/screens/*/actions.js` - Action creators

## Migration Goals

1. **Simplify Store Setup**: Use `configureStore` from RTK
2. **Modernize Reducers**: Migrate to `createSlice` for cleaner, more maintainable code
3. **Standardize Async Actions**: Use `createAsyncThunk` instead of manual thunks
4. **Improve Developer Experience**: Better TypeScript support, built-in Immer, Redux DevTools
5. **Maintain Backward Compatibility**: Ensure all existing functionality works

## Migration Strategy

### Phase 1: Installation and Store Setup (Foundation)
**Goal**: Install RTK and migrate store configuration with minimal changes

**Tasks**:
1. Install `@reduxjs/toolkit`
2. Update `apps/frontend/src/services/store.js` to use `configureStore`
3. Ensure Redux DevTools integration works
4. Verify app still runs with existing reducers
5. Update tests that mock the store

**Verification**:
- [ ] App starts without errors
- [ ] Redux DevTools connects
- [ ] All existing functionality works
- [ ] Store tests pass

**Files to Modify**:
- `apps/frontend/package.json` - Add dependency
- `apps/frontend/src/services/store.js` - Migrate to `configureStore`
- `apps/frontend/src/services/redux.test.js` - Update tests

### Phase 2: Migrate Global Reducers (Core Functionality)
**Goal**: Migrate auth and common reducers to RTK slices

**Tasks**:
1. Create `apps/frontend/src/services/global/auth/authSlice.js`
2. Create `apps/frontend/src/services/global/common/commonSlice.js`
3. Migrate action types to slice actions
4. Update components using these reducers
5. Update tests

**Verification**:
- [ ] Authentication flow works
- [ ] Common state (loading, notifications) works
- [ ] All tests pass
- [ ] No console errors

**Files to Modify**:
- `apps/frontend/src/services/global/auth/reducer.js` → `authSlice.js`
- `apps/frontend/src/services/global/common/reducer.js` → `commonSlice.js`
- `apps/frontend/src/services/reducer.js` - Update imports
- Components using `auth` and `common` state

### Phase 3: Migrate High-Priority Screen Reducers (Critical Features)
**Goal**: Migrate frequently used screen reducers

**Priority Order**:
1. Dashboard
2. Customer Invoice
3. Supplier Invoice
4. Product
5. Payment
6. Receipt

**Tasks** (per reducer):
1. Identify all action creators
2. Convert sync actions to slice reducers
3. Convert async actions to `createAsyncThunk`
4. Update reducer file to use `createSlice`
5. Update components using the reducer
6. Update tests

**Verification** (per reducer):
- [ ] List views work
- [ ] Create/Edit forms work
- [ ] Data fetching works
- [ ] State updates correctly
- [ ] Tests pass

### Phase 4: Migrate Remaining Screen Reducers (Complete Migration)
**Goal**: Migrate all remaining screen reducers

**Remaining Reducers**:
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

**Tasks**: Same as Phase 3, but batch process

**Verification**:
- [ ] All screens functional
- [ ] All tests pass
- [ ] No regressions

### Phase 5: Cleanup and Optimization
**Goal**: Remove old Redux code and optimize

**Tasks**:
1. Remove unused action type constants (if any)
2. Remove `redux-thunk` dependency (RTK includes it)
3. Update documentation
4. Code review and refactoring
5. Performance testing

**Verification**:
- [ ] No unused imports
- [ ] Bundle size check
- [ ] Performance benchmarks
- [ ] Documentation updated

## Technical Implementation Details

### Store Configuration Pattern

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

### Reducer Migration Pattern

**Before** (switch-case):
```javascript
const initState = {
  product_list: [],
  loading: false,
}

const ProductReducer = (state = initState, action) => {
  const { type, payload } = action
  
  switch(type) {
    case PRODUCT.PRODUCT_LIST:
      return {
        ...state,
        product_list: Object.assign([], payload)
      }
    case PRODUCT.START_LOADING:
      return {
        ...state,
        loading: true
      }
    default:
      return state
  }
}
```

**After** (createSlice):
```javascript
import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'product',
  initialState: {
    product_list: [],
    loading: false,
  },
  reducers: {
    setProductList: (state, action) => {
      state.product_list = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setProductList, setLoading } = productSlice.actions
export default productSlice.reducer
```

### Async Action Migration Pattern

**Before** (thunk):
```javascript
export const getProductList = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/product/getList?...`,
    }
    return authApi(data)
      .then((res) => {
        dispatch({
          type: PRODUCT.PRODUCT_LIST,
          payload: res.data,
        })
        return res
      })
      .catch((err) => {
        throw err
      })
  }
}
```

**After** (createAsyncThunk):
```javascript
import { createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from 'utils'

export const getProductList = createAsyncThunk(
  'product/getProductList',
  async (obj, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/product/getList?...`,
      }
      const res = await authApi(data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

// In slice:
const productSlice = createSlice({
  name: 'product',
  initialState: {
    product_list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false
        state.product_list = action.payload
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})
```

## Testing Strategy

### Unit Tests
- Update existing reducer tests to work with slices
- Test async thunks with proper mocking
- Test slice reducers with action creators

### Integration Tests
- Verify store configuration
- Test Redux DevTools integration
- Test component-redux connections

### E2E Tests
- Critical user flows (login, invoice creation, etc.)
- State persistence
- Navigation with state

### Test Migration Pattern

**Before**:
```javascript
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const store = mockStore({})
await store.dispatch(actions.getProductList({}))
```

**After**:
```javascript
import { configureStore } from '@reduxjs/toolkit'
import productReducer, { getProductList } from './productSlice'

const store = configureStore({
  reducer: {
    product: productReducer,
  },
})

await store.dispatch(getProductList({}))
```

## Verification Checklist

### Functional Verification
- [ ] App starts without errors
- [ ] Redux DevTools connects and shows state
- [ ] Authentication flow works
- [ ] All CRUD operations work
- [ ] Loading states work correctly
- [ ] Error handling works
- [ ] Notifications/toasts work
- [ ] Navigation preserves state
- [ ] Form submissions work

### Code Quality
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] ESLint passes
- [ ] Code coverage maintained
- [ ] No unused imports
- [ ] TypeScript types (if applicable) correct

### Performance
- [ ] Bundle size check (should be similar or smaller)
- [ ] Initial load time
- [ ] State update performance
- [ ] Memory usage

### Documentation
- [ ] Migration plan documented
- [ ] Code comments updated
- [ ] README updated (if needed)
- [ ] PR description complete

## Risk Mitigation

### Potential Issues
1. **Breaking Changes**: RTK uses Immer, which allows "mutating" state
   - **Mitigation**: Test thoroughly, RTK handles immutability automatically

2. **Action Type Changes**: RTK generates action types automatically
   - **Mitigation**: Update all dispatch calls, use action creators

3. **Test Failures**: Tests may need significant updates
   - **Mitigation**: Update tests incrementally, maintain test coverage

4. **Component Updates**: Components using `connect` or `useSelector` may need updates
   - **Mitigation**: React Redux v7+ works with RTK, minimal changes needed

5. **Third-party Middleware**: If any custom middleware exists
   - **Mitigation**: RTK's `configureStore` supports middleware, check compatibility

## Rollback Plan

If critical issues arise:
1. Revert to previous commit
2. Document issues encountered
3. Create follow-up issues for specific problems
4. Re-attempt migration with lessons learned

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

## Timeline Estimate

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 6-8 hours (high-priority reducers)
- **Phase 4**: 4-6 hours (remaining reducers)
- **Phase 5**: 1-2 hours (cleanup)

**Total**: 16-23 hours

## Next Steps

1. Review and approve this plan
2. Start Phase 1: Installation and Store Setup
3. Test thoroughly after each phase
4. Document any deviations or issues
5. Create PR after all phases complete

