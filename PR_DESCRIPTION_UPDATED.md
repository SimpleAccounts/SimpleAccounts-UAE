# Fix: Registration, Login, and Dashboard Issues

## Description
This PR fixes critical registration, login, and dashboard data loading issues. It resolves backend 500 errors, frontend Redux Toolkit thunk handling, and improves error messaging throughout the application.

## Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] Documentation update

## Backend Fixes

### 1. Registration 500 Error - Fixed ✅
- **Root Cause**: Hibernate `@Lob` annotation on `byte[]` fields defaulted to PostgreSQL `oid` type, but database columns were `bytea`
- **Solution**: Removed `@Lob` annotation from all `byte[]` fields and added `columnDefinition = "bytea"` to `@Column` annotations
- **Files Fixed**:
  - `User.java` - `profileImageBinary`
  - `Employee.java` - `profileImageBinary`
  - `Company.java` - `companyLogo`
  - `Transaction.java` - `explainedTransactionAttachement`
  - `Purchase.java` - `receiptAttachmentBinary`
  - `FileAttachment.java` - `fileData`
  - `DocumentTemplate.java` - `template`

### 2. getCompanyCurrency Query Fix
- **Issue**: Hibernate type mismatch comparing `Integer` with `Currency` entity
- **Fix**: Simplified query to directly select `Currency` from `Company` entity
- **File**: `CompanyDaoImpl.java`

### 3. Security Configuration
- Added `/rest/config/getReleaseNumber` and `/rest/config/getreleasenumber` to public endpoints
- **File**: `WebSecurityConfig.java`

### 4. Code Cleanup
- Removed debug logging utilities (`DebugFileLogger`, `RequestLoggingFilter`, `RegistrationBindingControllerAdvice`)
- Cleaned up `System.out.println` statements from AOP aspects
- Reduced logback logging from DEBUG to INFO level for production
- **Files**: `LogRequestAspect.java`, `LogExecutionTimeAspect.java`, `SimpleCorsFilter.java`, `logback.xml`

### 5. SMTP Configuration Support
- Merged upstream changes for SMTP configuration checking
- Added password reset link generation when SMTP is not configured
- **File**: `CompanyController.java`

## Frontend Fixes

### 1. Redux Toolkit Thunk Response Handling - Fixed ✅
- **Issue**: Code was using `.then((res) => res.status === 200)` but Redux Toolkit thunks return action objects, not API responses
- **Correct Pattern**: Check `action.type.includes('fulfilled')` and access `action.payload`
- **Files Fixed**:
  - `screens/log_in/screen.js` - Login form
  - `layouts/admin/index.js` & `index.jsx` - Admin layout initialization
  - `screens/dashboard/sections/bank_account/index.js` - Bank account data loading
  - `screens/dashboard/sections/paid_invoices/index.js` - Invoice graph data
  - `screens/dashboard/sections/profit_loss_report/index.js` - Profit/loss data

### 2. Toast Position API - Fixed ✅
- Replaced all 53 instances of deprecated `toast.POSITION.TOP_RIGHT` with `'top-right'` string literal
- **Files**: 51 files across `apps/frontend/src/screens/`

### 3. Auth API Interceptors
- Fixed 401 error handling to properly reject promises
- Added user-friendly error messages
- **Files**: `utils/auth_api.js`, `utils/auth_fileupload_api.js`

### 4. Registration Form (Previous PR)
- Fixed form validation issues
- Fixed redirect logic (moved from render to event handler)
- Fixed FormData Content-Type handling

## Testing

### Manual Testing Completed ✅
- [x] Company registration works end-to-end
- [x] Login with correct credentials works
- [x] Login with incorrect credentials shows proper error message
- [x] Dashboard APIs return data correctly
- [x] No infinite redirect loops
- [x] Error messages display properly

### API Endpoints Verified ✅
- `/rest/company/register` - Returns 200 OK
- `/auth/token` - Returns JWT token
- `/rest/user/current` - Returns user data
- `/rest/bank/list` - Returns bank accounts
- `/rest/transaction/getCashFlow?monthNo=12` - Returns cash flow data
- `/rest/invoice/getChartData?monthCount=12` - Returns invoice chart data
- `/rest/company/getCompanyCurrency` - Returns currency data

## Related Issues

- **Closes #234** - Backend Registration 500 Error
- Related to frontend registration fixes (previous commits)
- See `GITHUB_ISSUE_THUNK_PATTERN_REFACTORING.md` for remaining thunk pattern refactoring work
- See `GITHUB_ISSUE_DASHBOARD_ACTIVATION.md` for dashboard display issues

## Documentation

- `GITHUB_ISSUE_THUNK_PATTERN_REFACTORING.md` - Technical debt tracking for ~356 files
- `GITHUB_ISSUE_DASHBOARD_ACTIVATION.md` - Dashboard display issues
- `PR_DESCRIPTION_REGISTRATION_FIXES.md` - Previous PR description (for reference)

## Breaking Changes

None - all changes are backward compatible.

## Checklist

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
- [x] Debug code has been removed
- [x] Logging levels appropriate for production

## Commits

1. `d82dad4` - fix: cleanup debug code and fix registration/login issues
2. `017b2e8` - merge: resolve conflicts with upstream bank-transaction-code-quality branch

## Next Steps

1. ✅ Create GitHub issue for thunk pattern refactoring (tracking ~356 files)
2. ✅ Create GitHub issue for dashboard activation
3. ⏳ Review and merge PR
4. ⏳ Address remaining thunk pattern issues module-by-module
5. ⏳ Investigate dashboard rendering issues

