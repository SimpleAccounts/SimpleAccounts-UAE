# [TASK] Setup TanStack Table with shadcn/ui styling

**Issue:** [#165](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/165)  
**Type:** `feat(frontend):`  
**Status:** ✅ Ready for Review  
**Closes:** #165

## Summary

This PR installs TanStack Table and creates a DataTable component styled with shadcn/ui for replacing react-bootstrap-table. TanStack Table is a headless, highly customizable table library that provides better performance for large datasets and works seamlessly with shadcn/ui styling.

## What Changed

### Dependencies Added

- `@tanstack/react-table@^8.21.3` - Headless table library for React

### Components Added

1. **Table Component** (`src/components/ui/table.jsx`)
   - shadcn/ui Table component with all sub-components
   - Includes: Table, TableHeader, TableBody, TableRow, TableCell, TableHead, TableFooter, TableCaption
   - Properly styled with Tailwind CSS

2. **DataTable Component** (`src/components/ui/data-table.jsx`)
   - Full-featured data table with TanStack Table integration
   - Features:
     - ✅ Column-based sorting with visual indicators
     - ✅ Column-specific and global filtering
     - ✅ Pagination (integrated with DataTablePagination)
     - ✅ Row selection (optional, configurable)
     - ✅ Global search on specified column(s)
   - Styled with shadcn/ui components

3. **DataTablePagination Component** (`src/components/ui/data-table-pagination.jsx`)
   - Complete pagination controls
   - Features:
     - Page size selector (10, 20, 30, 40, 50)
     - Navigation buttons (first, previous, next, last)
     - Current page display
     - Selected row count display
   - Styled with shadcn/ui Button and Select components

4. **ExampleDataTable Component** (`src/components/examples/ExampleDataTable.jsx`)
   - Comprehensive example demonstrating all features
   - 12 sample records with various statuses and roles
   - Shows proper column definitions and cell rendering
   - Demonstrates sorting, filtering, and pagination

### Testing

- ✅ Unit tests for DataTable (8 tests, all passing)
- ✅ Unit tests for DataTablePagination (9 tests, all passing)
- ✅ Total: 17 tests passing
- ✅ Verification script created and passing
- ✅ Build succeeds without errors

### Documentation

- ✅ Battle plan documentation (`docs/TANSTACK_TABLE_SETUP_BATTLE_PLAN.md`)
- ✅ Verification script (`verify-tanstack-table-setup.sh`)
- ✅ Example component with comprehensive usage

## Technical Details

### Component Usage

```jsx
import { DataTable } from '@/components/ui/data-table';

const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
    enableSorting: true,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  // ... more columns
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  // ... more data
];

function MyTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      enableRowSelection={false}
    />
  );
}
```

### Features

- **Sorting**: Click column headers to sort (ascending/descending)
- **Filtering**: Global search on specified column(s)
- **Pagination**: Configurable page sizes with navigation
- **Row Selection**: Optional checkbox-based selection
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Styling**: Fully styled with shadcn/ui components and Tailwind CSS

## Acceptance Criteria

- [x] TanStack Table installed
- [x] shadcn Table component added
- [x] DataTable component created
- [x] DataTablePagination component created
- [x] Sorting works correctly
- [x] Filtering works correctly
- [x] Pagination works correctly
- [x] Row selection works correctly
- [x] Example table renders correctly
- [x] All components can be imported without errors
- [x] Build completes successfully
- [x] No linting errors
- [x] Tests pass (17 tests)
- [x] Verification script passes

## Dependencies

### Blocked By (completed)
- ✅ [TASK] Setup shadcn/ui with Base UI primitives #159 - COMPLETE
- ✅ [TASK] Add core shadcn/ui components #164 - COMPLETE

### Blocks
- Table migrations from react-bootstrap-table (future work)

## Testing Instructions

1. **Run Tests:**
   ```bash
   cd apps/frontend
   npm test -- --testPathPattern="data-table"
   ```

2. **Run Verification Script:**
   ```bash
   bash verify-tanstack-table-setup.sh
   ```

3. **Test Example Component:**
   - Import and render `ExampleDataTable` component
   - Verify sorting, filtering, and pagination work
   - Check that all features function correctly

## Files Changed

### New Files (8)
- `apps/frontend/src/components/ui/table.jsx`
- `apps/frontend/src/components/ui/data-table.jsx`
- `apps/frontend/src/components/ui/data-table-pagination.jsx`
- `apps/frontend/src/components/examples/ExampleDataTable.jsx`
- `apps/frontend/src/components/ui/__tests__/data-table.test.js`
- `apps/frontend/src/components/ui/__tests__/data-table-pagination.test.js`
- `docs/TANSTACK_TABLE_SETUP_BATTLE_PLAN.md`
- `verify-tanstack-table-setup.sh`

### Modified Files (2)
- `apps/frontend/package.json` - Added @tanstack/react-table dependency
- `apps/frontend/package-lock.json` - Updated lock file

## Migration Notes

This PR sets up the foundation for migrating from react-bootstrap-table to TanStack Table. The actual migration of existing tables will be done in separate PRs.

## References

- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [shadcn/ui Table Component](https://ui.shadcn.com/docs/components/table)
- [TanStack Table Examples](https://tanstack.com/table/latest/docs/examples/react/basic)
- [Issue #165](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/165)

---

**Ready for Review** ✅

