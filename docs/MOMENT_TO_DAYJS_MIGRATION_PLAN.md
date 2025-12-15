# Moment.js to Day.js Migration Plan

**Issue:** [#160](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/160)  
**Status:** 📋 **PLANNING**  
**Priority:** P1 - High  
**Type:** Migration Task  
**Estimated Effort:** Medium (4-16 hours)

## Overview

Replace Moment.js with Day.js for date/time handling to reduce bundle size from ~330KB to ~2KB (minified) while maintaining similar API compatibility.

## Current State Analysis

### Statistics
- **Files using Moment.js:** 195 files
- **Current Moment.js version:** `^2.30.1` (from package.json)
- **Bundle size impact:** ~330KB (minified)
- **Target bundle size:** ~2KB (minified) with Day.js

### Common Usage Patterns Found

1. **Basic Formatting:**
   - `moment().format('YYYY-MM-DD')`
   - `moment().format('DD/MM/YYYY')`
   - `moment(date).format('YYYY-MM-DD HH:mm:ss')`

2. **Relative Time:**
   - `moment(date).fromNow()`

3. **Date Arithmetic:**
   - `moment().add(1, 'day')`
   - `moment().subtract(10, 'days')`
   - `moment().add(1, 'month')`

4. **Date Comparisons:**
   - `moment(date1).diff(date2, 'days')`
   - `moment(date1).isBefore(date2)`
   - `moment(date1).isAfter(date2)`
   - `moment(date1).isSame(date2, 'day')`

5. **Start/End of Period:**
   - `moment().startOf('week')`
   - `moment().endOf('month')`
   - `moment().startOf('year')`

6. **Date Parsing:**
   - `moment('2024-01-15')`
   - `moment('15-01-2024', 'DD-MM-YYYY')`

### Key Files to Update

**Test Files:**
- `apps/frontend/src/utils/moment.test.js` - Needs complete rewrite for Day.js

**Component Files:**
- `apps/frontend/src/components/datepicker/index.js` - Uses moment for date ranges
- `apps/frontend/src/components/form_control/term_date_input.js` - Date input handling

**Utility Files:**
- `apps/frontend/src/utils/dropdown_lists.js` - Date formatting
- `apps/frontend/src/utils/reports_column_lists.js` - Date formatting in reports
- `apps/frontend/src/utils/input_validation.js` - Date validation

**Screen Files:** 190+ files across various screens

## Technical Approach

### Phase 1: Setup Day.js Infrastructure

**1.1 Install Day.js and Required Plugins**
```bash
cd apps/frontend
npm install dayjs --legacy-peer-deps
```

**1.2 Create Date Utility Wrapper**
File: `apps/frontend/src/utils/date.js`

This wrapper will:
- Import Day.js and all required plugins
- Configure plugins
- Export a configured Day.js instance
- Provide a consistent API for the codebase

**Required Plugins:**
- `customParseFormat` - For parsing dates with format strings
- `relativeTime` - For `.fromNow()` functionality
- `utc` - For UTC timezone handling
- `timezone` - For timezone conversions
- `isBetween` - For date range checks
- `isSameOrBefore` - For comparison operations
- `isSameOrAfter` - For comparison operations
- `weekOfYear` - For week calculations (if needed)
- `isoWeek` - For ISO week calculations (if needed)
- `duration` - For duration calculations (if needed)

### Phase 2: Update Import Statements

**2.1 Find and Replace Pattern**
- Find: `import moment from 'moment'`
- Replace: `import dayjs from '@/utils/date'`

**2.2 Update Require Statements**
- Find: `const moment = require('moment')`
- Replace: `const dayjs = require('@/utils/date').default`

### Phase 3: Update Function Calls

**3.1 Basic Function Replacements**

| Moment.js | Day.js | Notes |
|-----------|--------|-------|
| `moment()` | `dayjs()` | Same |
| `moment(date)` | `dayjs(date)` | Same |
| `moment(date, format)` | `dayjs(date, format)` | Requires `customParseFormat` plugin |
| `.format(pattern)` | `.format(pattern)` | Same API |
| `.fromNow()` | `.fromNow()` | Requires `relativeTime` plugin |
| `.add(value, unit)` | `.add(value, unit)` | Same API |
| `.subtract(value, unit)` | `.subtract(value, unit)` | Same API |
| `.diff(date, unit)` | `.diff(date, unit)` | Same API |
| `.isBefore(date)` | `.isBefore(date)` | Same API |
| `.isAfter(date)` | `.isAfter(date)` | Same API |
| `.isSame(date, unit)` | `.isSame(date, unit)` | Same API |
| `.startOf(unit)` | `.startOf(unit)` | Same API |
| `.endOf(unit)` | `.endOf(unit)` | Same API |
| `.clone()` | `.clone()` | Same API |
| `.isValid()` | `.isValid()` | Same API |
| `.year()` | `.year()` | Same API |
| `.month()` | `.month()` | Same API (0-indexed) |
| `.date()` | `.date()` | Same API |
| `.day()` | `.day()` | Same API |

**3.2 Special Cases**

**Date Picker Integration:**
- `react-bootstrap-daterangepicker` may require moment objects
- May need adapter or wrapper for compatibility
- Check if library supports Day.js or needs moment objects

**Format String Differences:**
- Most format strings are compatible
- Verify edge cases in tests

### Phase 4: Update Tests

**4.1 Rewrite moment.test.js**
- Rename to `date.test.js` or `dayjs.test.js`
- Update all test cases to use Day.js
- Ensure all tests pass

**4.2 Update Other Test Files**
- Find tests that use moment
- Update to use Day.js
- Verify test coverage

### Phase 5: Remove Moment.js

**5.1 Remove from package.json**
- Remove `moment` dependency
- Run `npm install` to update lock file

**5.2 Verify No Remaining Imports**
- Search for any remaining `moment` imports
- Ensure all files use Day.js

## Detailed Implementation Steps

### Step 1: Install Day.js

```bash
cd apps/frontend
npm install dayjs --legacy-peer-deps
```

### Step 2: Create Date Utility Wrapper

**File:** `apps/frontend/src/utils/date.js`

```javascript
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import duration from 'dayjs/plugin/duration';

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(duration);

// Export configured dayjs instance
export default dayjs;
```

### Step 3: Update Import Statements (Automated)

**Script to find and replace:**
```bash
# Find all files with moment imports
find apps/frontend/src -type f \( -name "*.js" -o -name "*.jsx" \) -exec grep -l "import.*moment\|require.*moment" {} \;

# Replace imports (use sed or similar tool)
# Note: This should be done carefully with backups
```

**Manual approach:**
- Use IDE find/replace across project
- Pattern: `import moment from 'moment'` → `import dayjs from '@/utils/date'`
- Pattern: `const moment = require('moment')` → `const dayjs = require('@/utils/date').default`

### Step 4: Update Function Calls

**Global find/replace:**
- `moment(` → `dayjs(`
- `.clone()` remains the same
- All other methods remain the same (API compatible)

**Special attention:**
- Date picker components may need special handling
- Verify date range picker compatibility

### Step 5: Update Tests

**File:** `apps/frontend/src/utils/date.test.js` (rename from moment.test.js)

Update all test cases:
- Replace `moment` with `dayjs`
- Verify all assertions still pass
- Add tests for plugin functionality

### Step 6: Verify Build and Runtime

**Build verification:**
```bash
cd apps/frontend
npm run build
```

**Runtime verification:**
- Start dev server
- Test date formatting in UI
- Test date pickers
- Test date calculations
- Test relative time displays

### Step 7: Remove Moment.js

```bash
cd apps/frontend
npm uninstall moment
npm install --legacy-peer-deps
```

## Migration Strategy

### Approach: Phased Migration

**Phase 1: Setup (1-2 hours)**
- Install Day.js
- Create utility wrapper
- Verify plugins work

**Phase 2: Core Utilities (2-3 hours)**
- Migrate utility files first
- Update test files
- Verify core functionality

**Phase 3: Components (2-3 hours)**
- Migrate date picker components
- Test date picker functionality
- Fix any compatibility issues

**Phase 4: Screens (4-8 hours)**
- Migrate screen files in batches
- Test each screen after migration
- Fix any issues

**Phase 5: Cleanup (1-2 hours)**
- Remove Moment.js
- Final verification
- Update documentation

### Alternative: Automated Migration Script

Create a script to automate the migration:
1. Find all moment imports
2. Replace with dayjs imports
3. Replace function calls
4. Generate report of changes

## Testing Strategy

### Unit Tests
- Update `moment.test.js` → `date.test.js`
- Ensure all date operations work correctly
- Test all plugins

### Integration Tests
- Test date pickers
- Test date formatting in forms
- Test date calculations in reports

### Manual Testing
- Test date inputs in forms
- Test date ranges in filters
- Test relative time displays
- Test date formatting in tables

### Test Checklist
- [ ] Date formatting works correctly
- [ ] Date parsing works correctly
- [ ] Date arithmetic works correctly
- [ ] Date comparisons work correctly
- [ ] Relative time displays correctly
- [ ] Date pickers work correctly
- [ ] Date ranges work correctly
- [ ] Timezone handling works (if applicable)
- [ ] All existing tests pass

## Potential Issues & Solutions

### Issue 1: Date Picker Compatibility
**Problem:** `react-bootstrap-daterangepicker` may require moment objects  
**Solution:** 
- Check library documentation
- May need to convert dayjs to moment for picker
- Or find Day.js-compatible date picker

### Issue 2: Format String Differences
**Problem:** Some format strings may differ  
**Solution:**
- Test all format strings
- Update if needed
- Document differences

### Issue 3: Timezone Handling
**Problem:** Day.js timezone handling may differ  
**Solution:**
- Test timezone conversions
- Use UTC plugin if needed
- Verify timezone behavior

### Issue 4: Week Calculations
**Problem:** Week start day may differ  
**Solution:**
- Configure week start day
- Test week calculations
- Update if needed

## Acceptance Criteria

- [ ] Day.js installed with all required plugins
- [ ] Date utility wrapper created (`src/utils/date.js`)
- [ ] All moment imports replaced with dayjs imports
- [ ] All moment() calls replaced with dayjs()
- [ ] Date formatting works correctly
- [ ] Date parsing works correctly
- [ ] Date arithmetic works correctly
- [ ] Date comparisons work correctly
- [ ] Relative time displays correctly
- [ ] Date pickers work correctly
- [ ] All date-related tests pass
- [ ] Build completes successfully
- [ ] No runtime errors
- [ ] Moment.js removed from dependencies
- [ ] Bundle size reduced (verify in build output)

## Files to Create/Modify

### New Files
- `apps/frontend/src/utils/date.js` - Day.js utility wrapper

### Modified Files
- `apps/frontend/package.json` - Add dayjs, remove moment
- `apps/frontend/src/utils/moment.test.js` - Rename and update to `date.test.js`
- 195 files with moment imports - Update to use dayjs

### Deleted Files
- None (moment will be removed from package.json only)

## Rollback Plan

If issues arise:
1. Revert commits
2. Restore moment dependency
3. Fix issues
4. Retry migration

## Related

- Issue: #160
- Documentation: Day.js docs (https://day.js.org/)
- Moment.js migration guide: https://day.js.org/docs/en/parse/string-format

---

**Estimated Time:** 4-16 hours  
**Difficulty:** Medium  
**Risk Level:** Medium (large number of files, but API is similar)
