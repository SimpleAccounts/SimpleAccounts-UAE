# Dashboard Not Fully Displaying

## Issue Type
- [x] Bug
- [ ] Technical Debt
- [ ] Feature Request

## Description

The dashboard at `/admin/dashboard` is not displaying properly after successful login. While the API calls are succeeding, the dashboard components are not rendering correctly.

## Current Status

### ✅ Working
- Login flow - users can successfully log in
- API endpoints responding correctly:
  - `/rest/bank/list` - Returns bank accounts
  - `/rest/transaction/getCashFlow?monthNo=12` - Returns cash flow data
  - `/rest/invoice/getChartData?monthCount=12` - Returns invoice chart data
  - `/rest/company/getCompanyCurrency` - Returns company currency
  - `/rest/company/getCompanyDetails` - Returns company details

### ❌ Issues
- Dashboard components not rendering properly
- Data may not be displaying even though APIs return successfully
- Possible issues with:
  - Chart rendering (Chart.js/react-chartjs-2)
  - Component state management
  - Data transformation between API response and chart props

## Investigation Needed

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check React component errors
   - Verify chart library initialization

2. **Check Component Props**
   - Verify data is being passed correctly to chart components
   - Check if data format matches chart library expectations
   - Verify state updates are triggering re-renders

3. **Check Dashboard Sections**
   - `BankAccount` component - bank account graph
   - `CashFlow` component - cash flow bar chart
   - `PaidInvoices` component - invoice line chart
   - `ProfitAndLossReport` component - profit/loss chart

4. **Data Format Issues**
   - API returns data in specific format
   - Components may expect different format
   - Check data transformation logic

## Files to Review

- `apps/frontend/src/screens/dashboard/screen.js`
- `apps/frontend/src/screens/dashboard/sections/bank_account/index.js`
- `apps/frontend/src/screens/dashboard/sections/cash_flow/index.js`
- `apps/frontend/src/screens/dashboard/sections/paid_invoices/index.js`
- `apps/frontend/src/screens/dashboard/sections/profit_loss_report/index.js`
- `apps/frontend/src/screens/dashboard/dashboardSlice.js`

## Related Issues

- Related to registration/login fixes (PR #235)
- May be related to Redux Toolkit thunk pattern issues (see thunk pattern refactoring issue)

## Environment

- Frontend: React, running on localhost:3000
- Backend: Spring Boot, running on localhost:8080
- Test account: `test1765915752@example.com` / `Test123!@#`

## Labels
- `frontend`
- `dashboard`
- `bug`

