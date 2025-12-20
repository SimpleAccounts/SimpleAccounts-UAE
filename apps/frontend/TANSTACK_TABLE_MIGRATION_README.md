# TanStack Table Migration - README

## What is This?

This is a comprehensive migration from `react-bootstrap-table-next` to `@tanstack/react-table` v8 for the SimpleAccounts UAE application.

## Why Migrate?

1. **Modern Architecture**: TanStack Table uses modern React patterns and is actively maintained
2. **Better Performance**: Headless architecture with optimized rendering
3. **Smaller Bundle Size**: Reduces application bundle size
4. **Type Safety**: Full TypeScript support for future migrations
5. **Flexibility**: Complete control over table UI and behavior
6. **Active Development**: Regular updates and community support

## Current Status

**Completed**: 2 of 118 files (1.7%)
- ✅ Customer Invoice listing screen
- ✅ Supplier Invoice listing screen

**Remaining**: 116 files across the application

## Quick Start

### For Developers Migrating Screens

1. **Read the Quick Reference** (5 minutes)
   - File: `TANSTACK_TABLE_QUICK_REFERENCE.md`
   - Contains step-by-step migration pattern

2. **Check Examples** (10 minutes)
   - Customer Invoice: `/apps/frontend/src/screens/customer_invoice/screen.js`
   - Supplier Invoice: `/apps/frontend/src/screens/supplier_invoice/screen.js`

3. **Follow the Pattern** (15-30 minutes per screen)
   - Use the Quick Reference as a guide
   - Copy column definitions pattern from examples
   - Test thoroughly

### For Project Managers

1. **Review the Inventory** (10 minutes)
   - File: `TANSTACK_TABLE_COMPLETE_INVENTORY.md`
   - Shows all files needing migration
   - Includes time estimates

2. **Check the Checklist** (5 minutes)
   - File: `TANSTACK_TABLE_MIGRATION_CHECKLIST.md`
   - Track progress across the team
   - Assign screens to developers

## Documentation Files

### Primary Documents

1. **TANSTACK_TABLE_MIGRATION_README.md** (this file)
   - Overview and quick start guide
   - Links to all resources

2. **TANSTACK_TABLE_MIGRATION_GUIDE.md**
   - Comprehensive migration guide
   - Detailed patterns and examples
   - Troubleshooting tips

3. **TANSTACK_TABLE_QUICK_REFERENCE.md**
   - Fast migration steps
   - Common patterns
   - Copy-paste examples

### Reference Documents

4. **TANSTACK_TABLE_MIGRATION_SUMMARY.md**
   - Migration status and progress
   - Files created/modified
   - Testing recommendations

5. **TANSTACK_TABLE_COMPLETE_INVENTORY.md**
   - Complete list of all 118 files
   - Organized by priority
   - Time estimates per phase

6. **TANSTACK_TABLE_MIGRATION_CHECKLIST.md**
   - Detailed progress tracker
   - Testing checklist
   - Team assignments

## Component Architecture

### New Components Created

#### ServerDataTable
**Location**: `/apps/frontend/src/components/ui/server-data-table.jsx`

Main table component supporting:
- Server-side pagination
- Server-side sorting
- Row selection
- Loading states
- Empty states

**Usage**:
```jsx
<ServerDataTable
  columns={this.getColumns()}
  data={invoices}
  pageCount={Math.ceil(totalCount / pageSize)}
  totalCount={totalCount}
  pagination={{ pageIndex: 0, pageSize: 10 }}
  onPaginationChange={(newPagination) => {
    this.setState({ pagination: newPagination }, () => {
      this.initializeData();
    });
  }}
  sorting={sorting}
  onSortingChange={(newSorting) => {
    this.setState({ sorting: newSorting }, () => {
      this.initializeData();
    });
  }}
/>
```

#### ServerDataTablePagination
**Location**: `/apps/frontend/src/components/ui/server-data-table-pagination.jsx`

Pagination UI component with:
- First/Previous/Next/Last navigation
- Page size selector
- Page indicator
- Row count display

### Existing UI Components (Used Internally)

- Table components: `/apps/frontend/src/components/ui/table.jsx`
- Checkbox: `/apps/frontend/src/components/ui/checkbox.jsx`
- Select: `/apps/frontend/src/components/ui/select.jsx`
- Button: `/apps/frontend/src/components/ui/button.jsx`

## Migration Pattern Overview

### Before (BootstrapTable)
```jsx
<BootstrapTable
  data={data}
  options={this.options}
  remote
  pagination
>
  <TableHeaderColumn dataField="id" isKey>ID</TableHeaderColumn>
  <TableHeaderColumn dataField="name">Name</TableHeaderColumn>
</BootstrapTable>
```

### After (TanStack Table)
```jsx
<ServerDataTable
  columns={[
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
  ]}
  data={data}
  pageCount={pageCount}
  totalCount={totalCount}
  pagination={pagination}
  onPaginationChange={handlePaginationChange}
/>
```

## Key Differences

| Feature | BootstrapTable | TanStack Table |
|---------|----------------|----------------|
| Page Index | 1-based | 0-based |
| Sorting | Separate props | Array of objects |
| Columns | JSX children | Array of objects |
| Pagination | Built-in UI | Custom component |
| Architecture | Monolithic | Headless |
| Bundle Size | Larger | Smaller |

## Migration Workflow

1. **Choose a screen** from the checklist
2. **Backup the file**: `mv screen.js screen-bootstrap-table.js.bak`
3. **Follow Quick Reference** for migration steps
4. **Test thoroughly** using the testing checklist
5. **Update the checklist** to mark completion
6. **Commit with clear message**: `git commit -m "migrate: [screen-name] to TanStack Table"`

## Testing Requirements

For each migrated screen, verify:
- [ ] Initial data load
- [ ] Pagination (all buttons and page size)
- [ ] Sorting (ascending/descending/clear)
- [ ] Filtering with pagination reset
- [ ] Action buttons/dropdowns
- [ ] Row selection (if applicable)
- [ ] Empty state
- [ ] Loading state

See `TANSTACK_TABLE_MIGRATION_CHECKLIST.md` for detailed testing checklist.

## Priority Order

### Phase 1: Core Screens (Completed ✅)
- Customer Invoice
- Supplier Invoice

### Phase 2: High Priority (4-6 hours)
Main listing screens users interact with daily:
1. Credit Notes & Debit Notes
2. Quotations & Purchase Orders
3. Receipts & Payments
4. Expenses & Journal Entries
5. Contacts & Products
6. Bank Accounts & Goods Received Notes

### Phase 3+: See Complete Inventory
Refer to `TANSTACK_TABLE_COMPLETE_INVENTORY.md` for full migration plan.

## Team Collaboration

### Assigning Work
Use `TANSTACK_TABLE_MIGRATION_CHECKLIST.md` to:
- Assign screens to team members
- Track individual progress
- Coordinate testing efforts

### Parallel Development
Multiple developers can work simultaneously on:
- Different main screens
- Different sections (invoices vs. payroll vs. reports)
- Detail screens vs. listing screens

### Code Review Focus
When reviewing migrated screens, verify:
1. Column definitions match original functionality
2. Pagination state is 0-based (not 1-based)
3. Sorting properly converts to backend format
4. Filter/search resets pagination to page 0
5. All action buttons preserved and working
6. Original file is backed up

## Rollback Procedure

If issues are discovered:

### Single Screen Rollback
```bash
cd /apps/frontend/src/screens/[screen-name]
mv screen.js screen-tanstack.js.failed
mv screen-bootstrap-table.js.bak screen.js
```

### Git Rollback
```bash
git log --oneline  # Find commit
git revert <commit-hash>
```

## Dependencies

### Already Installed ✅
- `@tanstack/react-table` v8.21.3

### Can Be Removed Later
Once all migrations complete:
- `react-bootstrap-table`
- `react-bootstrap-table-next`
- `react-bootstrap-table2-paginator`

Don't remove until all 118 files are migrated!

## Getting Help

### Documentation Order
1. Start with: `TANSTACK_TABLE_QUICK_REFERENCE.md`
2. For details: `TANSTACK_TABLE_MIGRATION_GUIDE.md`
3. Check examples: Customer/Supplier Invoice screen files
4. TanStack Docs: https://tanstack.com/table/v8

### Common Issues

**Issue**: Page not updating after pagination change
**Solution**: Ensure `onPaginationChange` calls `this.initializeData()`

**Issue**: Sorting not working
**Solution**: Check `onSortingChange` updates state and calls `initializeData()`

**Issue**: Page numbers off by one
**Solution**: Remember TanStack uses 0-based indexing

**Issue**: Actions dropdown not opening
**Solution**: Keep `actionButtons` state separate, indexed by row ID

## Success Metrics

Track these metrics before/after complete migration:
- Bundle size reduction (expected: 50-100KB)
- Initial load time
- Time to interactive
- Developer satisfaction
- Code maintainability

## Timeline

Based on completed work:
- **Phase 1** (2 screens): 1 hour ✅
- **Phase 2** (12 screens): 4-6 hours
- **Phase 3** (30 screens): 6-8 hours
- **Phase 4** (20 screens): 4-6 hours
- **Phase 5** (30 screens): 6-8 hours
- **Phase 6** (24 screens): 4-6 hours

**Total**: 25-35 hours development time

With 2-3 developers working in parallel: 1-2 weeks

## Next Steps

1. **Immediate**: Test the 2 completed screens
2. **This Week**: Migrate Phase 2 (12 high-priority screens)
3. **Next Week**: Continue with Phases 3-4
4. **Following Weeks**: Complete remaining phases
5. **Final**: Remove old dependencies, update documentation

## Questions?

Contact the development team or refer to the comprehensive guide in `TANSTACK_TABLE_MIGRATION_GUIDE.md`.

---

**Migration Started**: December 19, 2025
**Last Updated**: December 19, 2025
**Status**: In Progress (1.7% complete)
**Branch**: feature/vite-test-config-180
