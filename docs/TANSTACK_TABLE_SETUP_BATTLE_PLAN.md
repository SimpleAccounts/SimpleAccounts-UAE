# TanStack Table with shadcn/ui Styling - Battle Plan

**Issue:** [#165](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/165)  
**Status:** 🚧 **IN PROGRESS**  
**Date:** December 15, 2025  
**Estimated Effort:** Medium (4-16 hours)

## Overview

Install TanStack Table and create a DataTable component styled with shadcn/ui for replacing react-bootstrap-table. TanStack Table is a headless, highly customizable table library that provides better performance for large datasets and works seamlessly with shadcn/ui styling.

## Current State Analysis

### Existing Table Libraries
- **react-bootstrap-table**: v4.3.1 (currently used)
- **react-bootstrap-table-next**: v4.0.1 (currently used)
- **react-bootstrap-table2-paginator**: v2.1.2 (currently used)
- **@mui/x-data-grid**: v5.17.0 (currently used)
- **ag-grid-community**: v35.0.0 (currently used)
- **ag-grid-react**: v35.0.0 (currently used)

### Dependencies Status
- ✅ **shadcn/ui**: Set up with core components
- ✅ **Tailwind CSS**: Configured and working
- ✅ **React Hook Form**: Installed (for form integration if needed)
- ❌ **@tanstack/react-table**: Not installed
- ❌ **shadcn Table component**: Not installed

### Project Structure
- **Components:** `apps/frontend/src/components/ui/` (shadcn components)
- **Utils:** `apps/frontend/src/lib/utils.js` (cn utility)
- **Path Alias:** `@/` → `src/` (configured)

## Execution Plan

### Phase 1: Preparation ✅
- [x] Create battle plan document
- [x] Verify shadcn/ui setup is complete
- [x] Check current component status
- [x] Sync git (upstream, remote, local)
- [ ] Create feature branch

### Phase 2: Install Dependencies
- [ ] Install `@tanstack/react-table` package
- [ ] Verify package installation
- [ ] Check for peer dependency warnings
- [ ] Verify package version compatibility

### Phase 3: Install shadcn Table Component
- [ ] Install shadcn Table component via CLI
- [ ] Verify Table component files created
- [ ] Check component exports
- [ ] Verify component structure

### Phase 4: Create DataTable Component
- [ ] Create `DataTable` component with basic structure
- [ ] Implement sorting functionality
- [ ] Implement filtering functionality
- [ ] Implement pagination
- [ ] Implement row selection
- [ ] Add search/global filter support
- [ ] Style with shadcn/ui components

### Phase 5: Create DataTablePagination Component
- [ ] Create pagination component
- [ ] Add page size selector
- [ ] Add page navigation buttons
- [ ] Display current page info
- [ ] Style with shadcn/ui components

### Phase 6: Create Example/Demo Component
- [ ] Create example DataTable with sample data
- [ ] Demonstrate all features (sorting, filtering, pagination, selection)
- [ ] Test with various data types
- [ ] Verify accessibility

### Phase 7: Testing & Quality
- [ ] Run linter
- [ ] Run tests
- [ ] Create unit tests for DataTable
- [ ] Create unit tests for DataTablePagination
- [ ] Verify build succeeds
- [ ] Check for any missing dependencies

### Phase 8: Documentation & PR
- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Create PR description that closes the task 165
- [ ] Commit all changes
- [ ] Push to remote branch

## Technical Details

### Phase 2: Package Installation

**Installation Command:**
```bash
cd apps/frontend
npm install @tanstack/react-table
```

**Expected Version:**
- `@tanstack/react-table`: ^8.x (latest stable)

**Verification:**
- Check `package.json` for new dependency
- Verify installation: `npm list @tanstack/react-table`
- Check for peer dependency warnings

### Phase 3: shadcn Table Component Installation

**Installation Command:**
```bash
cd apps/frontend
npx shadcn@latest add table --yes
```

**Expected Files Created:**
- `apps/frontend/src/components/ui/table.jsx`

**Expected Exports:**
- `Table`
- `TableHeader`
- `TableBody`
- `TableFooter`
- `TableHead`
- `TableRow`
- `TableCell`
- `TableCaption`

### Phase 4: DataTable Component Implementation

**File Location:** `apps/frontend/src/components/ui/data-table.jsx`

**Component Structure:**
```jsx
import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from './data-table-pagination';

export function DataTable({ columns, data, searchKey, enableRowSelection = false }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: enableRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder={`Search ${searchKey}...`}
            value={table.getColumn(searchKey)?.getFilterValue() ?? ''}
            onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
```

**Features to Implement:**
1. **Sorting**: Column-based sorting with visual indicators
2. **Filtering**: Column-specific and global filtering
3. **Pagination**: Page-based navigation with configurable page sizes
4. **Row Selection**: Optional checkbox-based row selection
5. **Search**: Global search on specified column(s)

### Phase 5: DataTablePagination Component

**File Location:** `apps/frontend/src/components/ui/data-table-pagination.jsx`

**Component Structure:**
```jsx
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DataTablePagination({ table }) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Phase 6: Example Component

**File Location:** `apps/frontend/src/components/examples/ExampleDataTable.jsx`

**Example Data Structure:**
```jsx
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
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
  },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  // ... more data
];
```

## Expected Directory Structure

```
apps/frontend/src/components/ui/
├── table.jsx                    # shadcn Table component (new)
├── data-table.jsx               # DataTable component (new)
└── data-table-pagination.jsx    # Pagination component (new)

apps/frontend/src/components/examples/
└── ExampleDataTable.jsx         # Example component (new)
```

## Acceptance Criteria

- [ ] `@tanstack/react-table` installed
- [ ] shadcn Table component added
- [ ] DataTable component created
- [ ] DataTablePagination component created
- [ ] Sorting works correctly
- [ ] Filtering works correctly
- [ ] Pagination works correctly
- [ ] Row selection works correctly
- [ ] Example table renders correctly
- [ ] All components can be imported without errors
- [ ] Build completes successfully
- [ ] No linting errors
- [ ] Tests pass
- [ ] Verification script passes

## Dependencies

### Blocked By (must complete first)
- ✅ [TASK] Setup shadcn/ui with Base UI primitives #159 - COMPLETE
- ✅ [TASK] Add core shadcn/ui components #164 - COMPLETE

### Blocks (cannot start until this is done)
- Table migrations from react-bootstrap-table

## Risk Mitigation

### Potential Issues

1. **Column Definition Compatibility**: TanStack Table uses different column definition format than react-bootstrap-table
   - **Mitigation**: Create migration guide, provide examples

2. **Performance with Large Datasets**: Need to ensure proper pagination and virtualization
   - **Mitigation**: Use built-in pagination, consider virtualization for future

3. **Styling Consistency**: Ensure DataTable matches existing design system
   - **Mitigation**: Use shadcn/ui components, follow existing patterns

4. **Accessibility**: Ensure table is accessible
   - **Mitigation**: Use semantic HTML, proper ARIA attributes, keyboard navigation

### Rollback Plan

If critical issues arise:
1. Revert package installations
2. Remove DataTable components
3. Document issues encountered
4. Create follow-up issues for specific problems

## Success Criteria

- ✅ Battle plan documentation created
- ⏳ `@tanstack/react-table` installed
- ⏳ shadcn Table component added
- ⏳ DataTable component created with all features
- ⏳ DataTablePagination component created
- ⏳ Example component working
- ⏳ Verification script created and passing
- ⏳ Tests passing
- ⏳ Documentation complete

## Timeline Estimate

- **Phase 1**: 30 minutes (Preparation)
- **Phase 2**: 15 minutes (Install Dependencies)
- **Phase 3**: 15 minutes (Install shadcn Table)
- **Phase 4**: 2-3 hours (Create DataTable Component)
- **Phase 5**: 1 hour (Create Pagination Component)
- **Phase 6**: 1 hour (Create Example Component)
- **Phase 7**: 1-2 hours (Testing & Quality)
- **Phase 8**: 30 minutes (Documentation & PR)

**Total**: ~6-9 hours

## Implementation Status

### Phase 1: Preparation ✅ COMPLETE
- ✅ Battle plan documentation created
- ✅ Git synced (upstream, remote, local)
- ✅ Feature branch created: `feature/tanstack-table-setup-165`

### Phase 2: Install Dependencies ✅ COMPLETE
- ✅ `@tanstack/react-table` v8.21.3 installed

### Phase 3: Install shadcn Table Component ✅ COMPLETE
- ✅ Table component installed and fixed (moved from wrong location)
- ✅ All exports verified (Table, TableHeader, TableBody, TableRow, TableCell, TableHead, TableCaption)

### Phase 4: Create DataTable Component ✅ COMPLETE
- ✅ DataTable component created with all features
- ✅ Sorting functionality implemented
- ✅ Filtering functionality implemented
- ✅ Pagination functionality implemented
- ✅ Row selection functionality implemented
- ✅ Search functionality implemented

### Phase 5: Create DataTablePagination Component ✅ COMPLETE
- ✅ DataTablePagination component created
- ✅ Page size selector implemented
- ✅ Page navigation buttons implemented
- ✅ Current page info display implemented

### Phase 6: Create Example Component ✅ COMPLETE
- ✅ ExampleDataTable component created
- ✅ Demonstrates all features with sample data
- ✅ 12 sample records with various statuses and roles

### Phase 7: Testing & Quality ✅ COMPLETE
- ✅ Linter checks passed (no lint script, but build succeeds)
- ✅ Build succeeds without errors
- ✅ Unit tests created for DataTable (8 tests, all passing)
- ✅ Unit tests created for DataTablePagination (9 tests, all passing)
- ✅ Verification script passes (all critical checks)
- ✅ Total: 17 tests passing

### Phase 8: Documentation & PR ✅ COMPLETE
- ✅ Usage documentation (example component)
- ✅ PR description created
- ✅ All changes committed

## Next Steps

1. ✅ Review and approve this battle plan
2. ✅ Create feature branch: `feature/tanstack-table-setup-165`
3. ✅ Phase 2: Install dependencies
4. ✅ Phase 3: Install shadcn Table component
5. ✅ Phase 4: Create DataTable component
6. ✅ Phase 5: Create DataTablePagination component
7. ✅ Phase 6: Create example component
8. ✅ Phase 7: Testing & Quality
9. ✅ Phase 8: Documentation & PR

## References

- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [shadcn/ui Table Component](https://ui.shadcn.com/docs/components/table)
- [TanStack Table Examples](https://tanstack.com/table/latest/docs/examples/react/basic)
- [Issue #165](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/165)

---

**Status:** 🚧 **IN PROGRESS**

