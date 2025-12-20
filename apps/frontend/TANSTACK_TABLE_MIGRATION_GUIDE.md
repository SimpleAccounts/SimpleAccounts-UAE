# TanStack Table Migration Guide

This guide documents the migration from `react-bootstrap-table-next` to `@tanstack/react-table` v8.

## Overview

The codebase is being migrated from `react-bootstrap-table-next` to TanStack Table for better performance, modern React patterns, and improved type safety. TanStack Table is headless, meaning it provides the logic without imposing UI constraints.

## New Components Created

### 1. ServerDataTable Component

Location: `/apps/frontend/src/components/ui/server-data-table.jsx`

A server-side data table component that handles:

- Server-side pagination
- Server-side sorting
- Row selection (optional)
- Loading states
- Empty states

**Props:**

- `columns` - Column definitions (TanStack format)
- `data` - Current page data array
- `pageCount` - Total number of pages
- `totalCount` - Total number of records
- `pagination` - `{ pageIndex, pageSize }`
- `onPaginationChange` - Callback when pagination changes
- `sorting` - Sorting state array
- `onSortingChange` - Callback when sorting changes
- `enableRowSelection` - Boolean to enable row selection
- `rowSelection` - Row selection state object
- `onRowSelectionChange` - Callback when selection changes
- `loading` - Boolean for loading state
- `emptyMessage` - Message when no data

### 2. ServerDataTablePagination Component

Location: `/apps/frontend/src/components/ui/server-data-table-pagination.jsx`

Provides pagination UI with:

- First/Previous/Next/Last page navigation
- Page size selector (10, 20, 30, 40, 50)
- Current page indicator
- Total count display
- Selected rows count

## Migration Pattern

### Before (react-bootstrap-table)

```jsx
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

// In component state
this.options = {
  page: 1,
  sizePerPage: 10,
  onSizePerPageList: this.onSizePerPageList,
  onPageChange: this.onPageChange,
  sortName: '',
  sortOrder: '',
  onSortChange: this.sortColumn,
};

// In render
<BootstrapTable
  data={invoice_data}
  remote
  pagination
  fetchInfo={{ dataTotalSize: invoice_list.count }}
  options={this.options}
>
  <TableHeaderColumn dataField="id" isKey hidden>
    ID
  </TableHeaderColumn>
  <TableHeaderColumn dataField="invoiceNumber" dataSort>
    Invoice Number
  </TableHeaderColumn>
  <TableHeaderColumn dataField="status" dataFormat={this.renderStatus}>
    Status
  </TableHeaderColumn>
  <TableHeaderColumn dataFormat={this.renderActions}>Actions</TableHeaderColumn>
</BootstrapTable>;
```

### After (TanStack Table)

```jsx
import { ServerDataTable } from '@/components/ui/server-data-table';

// In component state
this.state = {
  pagination: {
    pageIndex: 0, // Note: 0-based index
    pageSize: 10,
  },
  sorting: [],
  rowSelection: {},
};

// Define columns method
getColumns = () => {
  return [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      cell: ({ row }) => row.original.invoiceNumber,
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => this.renderStatus(row.original),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => this.renderActions(row.original),
      enableSorting: false,
      size: 50,
    },
  ];
};

// In render
const pageCount = Math.ceil(invoice_list.count / pagination.pageSize);

<ServerDataTable
  columns={this.getColumns()}
  data={invoice_data}
  pageCount={pageCount}
  totalCount={invoice_list.count || 0}
  pagination={pagination}
  onPaginationChange={updater => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    this.setState({ pagination: newPagination }, () => {
      this.initializeData();
    });
  }}
  sorting={sorting}
  onSortingChange={newSorting => {
    this.setState({ sorting: newSorting }, () => {
      this.initializeData();
    });
  }}
  enableRowSelection={false}
  loading={false}
  emptyMessage="No invoices found."
/>;
```

## Key Changes in initializeData()

### Before

```jsx
initializeData = () => {
  const paginationData = {
    pageNo: this.options.page - 1, // Convert 1-based to 0-based
    pageSize: this.options.sizePerPage,
  };
  const sortingData = {
    order: this.options.sortOrder || '',
    sortingCol: this.options.sortName || '',
  };
  // ... fetch data
};
```

### After

```jsx
initializeData = () => {
  let { filterData, pagination, sorting } = this.state;
  const paginationData = {
    pageNo: pagination.pageIndex, // Already 0-based
    pageSize: pagination.pageSize,
  };
  const sortingData = {
    order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
    sortingCol: sorting.length > 0 ? sorting[0].id : '',
  };
  const postData = { ...filterData, ...paginationData, ...sortingData };
  // ... fetch data
};
```

## Column Definition Patterns

### Simple Text Column

```jsx
{
  accessorKey: 'invoiceNumber',
  header: 'Invoice Number',
  cell: ({ row }) => row.original.invoiceNumber,
  enableSorting: true,
}
```

### Formatted Column

```jsx
{
  accessorKey: 'invoiceDate',
  header: 'Invoice Date',
  cell: ({ row }) => row.original.invoiceDate || '',
  enableSorting: true,
}
```

### Custom Rendered Column (with JSX)

```jsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const { status } = row.original;
    return (
      <span className={`badge badge-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  },
  enableSorting: true,
}
```

### Complex Column with Multiple Fields

```jsx
{
  accessorKey: 'totalAmount',
  header: 'Invoice Amount',
  cell: ({ row }) => {
    const { invoiceAmount, vatAmount, dueAmount, currencySymbol } = row.original;
    return (
      <div style={{ textAlign: 'right' }}>
        <div>
          <label className="font-weight-bold mr-2">Invoice Amount: </label>
          <label>
            {currencySymbol} {invoiceAmount.toLocaleString(navigator.language,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </label>
        </div>
        {vatAmount !== 0 && (
          <div>
            <label className="font-weight-bold mr-2">VAT Amount: </label>
            <label>
              {currencySymbol} {vatAmount.toLocaleString(navigator.language,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </label>
          </div>
        )}
      </div>
    );
  },
  enableSorting: true,
}
```

### Actions Column

```jsx
{
  id: 'actions',
  header: '',
  cell: ({ row }) => {
    const rowData = row.original;
    // Render your action buttons/dropdown here
    return (
      <ButtonDropdown>
        {/* Your action items */}
      </ButtonDropdown>
    );
  },
  enableSorting: false,
  size: 50,
}
```

## Important Notes

### Page Index

- **BootstrapTable**: Uses 1-based page indexing
- **TanStack Table**: Uses 0-based page indexing
- **Backend API**: Expects 0-based page indexing

When migrating, ensure you:

1. Initialize pagination with `pageIndex: 0` (not `page: 1`)
2. Don't subtract 1 when sending to backend (it's already 0-based)
3. Update any search/filter reset logic to use `pageIndex: 0`

### Sorting Format

BootstrapTable provides `sortName` and `sortOrder` as separate values.
TanStack Table uses an array of sorting objects:

```jsx
// TanStack sorting format
sorting = [{ id: 'invoiceNumber', desc: false }]; // Ascending
sorting = [{ id: 'invoiceNumber', desc: true }]; // Descending
sorting = []; // No sorting
```

Convert to backend format:

```jsx
const sortingData = {
  order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
  sortingCol: sorting.length > 0 ? sorting[0].id : '',
};
```

### State Management

Keep pagination, sorting, and rowSelection in component state:

```jsx
this.state = {
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [],
  rowSelection: {},
  // ... other state
};
```

### Imports

Remove old imports:

```jsx
// REMOVE
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
```

Add new imports:

```jsx
// ADD
import { ServerDataTable } from '@/components/ui/server-data-table';
```

## Migration Checklist

For each screen file:

- [ ] Remove BootstrapTable imports
- [ ] Add ServerDataTable import
- [ ] Update state to include `pagination`, `sorting`, `rowSelection`
- [ ] Remove `this.options` object
- [ ] Create `getColumns()` method with column definitions
- [ ] Update `initializeData()` to use new pagination/sorting format
- [ ] Update search/filter handlers to reset `pageIndex` to 0
- [ ] Replace `<BootstrapTable>` with `<ServerDataTable>`
- [ ] Calculate `pageCount` for pagination
- [ ] Remove pagination option handlers (`onPageChange`, `onSizePerPageList`, `sortColumn`)
- [ ] Test pagination, sorting, and filtering

## Examples Migrated

1. **Customer Invoice** - `/apps/frontend/src/screens/customer_invoice/screen.js`
   - Complex actions dropdown
   - Multiple filter fields
   - Status badges
   - Currency formatting

2. **Supplier Invoice** - `/apps/frontend/src/screens/supplier_invoice/screen.js`
   - Similar to customer invoice
   - Different action items
   - Debit note creation

## Remaining Files to Migrate

High Priority (Main listing screens):

- [ ] creditNotes/screen.js
- [ ] debitNotes/screen.js
- [ ] quotation/screen.js
- [ ] purchase_order/screen.js
- [ ] receipt/screen.js
- [ ] payment/screen.js
- [ ] expense/screen.js
- [ ] journal/screen.js
- [ ] contact/screen.js
- [ ] product/screen.js
- [ ] chart_account/screen.js
- [ ] bank_account/screen.js

## Benefits of Migration

1. **Better Performance**: Headless architecture with optimized rendering
2. **Type Safety**: Full TypeScript support (if migrated to TS later)
3. **Modern React**: Uses hooks and modern patterns
4. **Flexibility**: Complete control over table UI
5. **Maintainability**: Active development and community support
6. **Bundle Size**: Smaller than react-bootstrap-table-next
7. **Server-Side Support**: Built-in support for server-side operations

## Troubleshooting

### Issue: Table not updating after data fetch

**Solution**: Ensure you're calling `this.initializeData()` after state changes

### Issue: Sorting not working

**Solution**: Verify `onSortingChange` callback updates state and calls `initializeData()`

### Issue: Page index mismatch

**Solution**: Remember TanStack uses 0-based indexing, not 1-based

### Issue: Actions dropdown state not working

**Solution**: Keep `actionButtons` state separate from table state, indexed by row ID

## Testing Recommendations

After migration, test:

1. Initial page load
2. Pagination (next, previous, first, last, page size change)
3. Sorting (ascending, descending, clear)
4. Filtering with pagination reset
5. Actions dropdown for each row
6. Row selection (if enabled)
7. Empty state display
8. Loading state display

## References

- [TanStack Table Documentation](https://tanstack.com/table/v8/docs/introduction)
- [TanStack Table Examples](https://tanstack.com/table/v8/docs/examples/react/basic)
- [Server-Side Pagination Guide](https://tanstack.com/table/v8/docs/guide/pagination#manual-server-side-pagination)
