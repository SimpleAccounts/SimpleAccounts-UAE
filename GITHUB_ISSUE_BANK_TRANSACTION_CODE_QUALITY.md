# Code quality: Fix CodeQL warnings in bank account transaction screens

## Description
Address CodeQL code quality warnings identified in the bank account transaction screens to improve code safety, maintainability, and reduce potential bugs.

## CodeQL Warnings to Fix

### High/Medium Priority
- **Potentially inconsistent state updates** (5 instances)
  - State updates using values from async operations that may be stale
  - Risk of race conditions and inconsistent UI state

### Low Priority
- **Useless conditionals** (6 instances)
  - Redundant ternary checks inside conditionals
  - Redundant duplicate condition checks
  
- **Overly permissive regex patterns** (2 instances)
  - Regex with overlapping character classes (`[0-9\d]`)
  
- **Useless assignments** (2 instances)
  - Assignment in return statement
  - Unused variable assignments

## Files Affected
- `apps/frontend/src/screens/bank_account/screens/transactions/screens/create/screen.js`
- `apps/frontend/src/screens/bank_account/screens/transactions/screen.js`
- `apps/frontend/src/screens/bank_account/screens/detail/screen.js`
- `apps/frontend/src/screens/bank_account/screens/transactions/screens/create/helpers/customvalidation.js`

## Expected Outcome
- All CodeQL warnings addressed
- Code quality improved without changing functionality
- All existing tests pass
- No breaking changes

## Acceptance Criteria
- [ ] All high/medium priority warnings fixed
- [ ] All low priority warnings fixed
- [ ] All existing tests pass
- [ ] No new test failures
- [ ] Code review approved
- [ ] PR merged

## Related
- Code scanning results
- CodeQL analysis

