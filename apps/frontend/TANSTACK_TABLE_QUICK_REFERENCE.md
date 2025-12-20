# TanStack Table Migration - Quick Reference

## Quick Migration Steps

### 1. Update Imports

```diff
- import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
- import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
+ import { ServerDataTable } from '@/components/ui/server-data-table';
```

### 2. Update State

```diff
  this.state = {
+   pagination: { pageIndex: 0, pageSize: 10 },
+   sorting: [],
+   rowSelection: {},
-   currentPage: 1,
    // ... other state
  };
```

### 3. Remove Old Options Object

```diff
- this.options = {
-   page: 1,
-   sizePerPage: 10,
-   onSizePerPageList: this.onSizePerPageList,
-   onPageChange: this.onPageChange,
-   sortName: '',
-   sortOrder: '',
-   onSortChange: this.sortColumn,
- };
```

### 4. Create Column Definitions

```javascript
getColumns = () => {
  return [
    {
      accessorKey: 'fieldName',
      header: 'Column Header',
      cell: ({ row }) => row.original.fieldName,
      enableSorting: true,
    },
    // Add more columns...
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => this.renderActions(row.original),
      enableSorting: false,
      size: 50,
    },
  ];
};
```

### 5. Update initializeData()

```diff
  initializeData = () => {
-   let { filterData, currentPage } = this.state;
+   let { filterData, pagination, sorting } = this.state;
    const paginationData = {
-     pageNo: currentPage - 1,
-     pageSize: this.options.sizePerPage,
+     pageNo: pagination.pageIndex,
+     pageSize: pagination.pageSize,
    };
    const sortingData = {
-     order: this.options.sortOrder ? this.options.sortOrder : '',
-     sortingCol: this.options.sortName ? this.options.sortName : '',
+     order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
+     sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    // ... rest of method
  };
```

### 6. Update Search/Filter Reset

```diff
  handleSearch = () => {
-   this.setState({ currentPage: 1 }, () => {
+   this.setState({ pagination: { ...this.state.pagination, pageIndex: 0 } }, () => {
      this.initializeData();
    });
  };

  clearAll = () => {
    this.setState({
      filterData: { /* reset filters */ },
-     currentPage: 1,
+     pagination: { pageIndex: 0, pageSize: 10 },
    }, () => {
      this.initializeData();
    });
  };
```

### 7. Replace Table Component

```diff
+ const { pagination, sorting } = this.state;
+ const pageCount = Math.ceil(list.count / pagination.pageSize);

- <BootstrapTable
-   data={data}
-   remote
-   pagination
-   fetchInfo={{ dataTotalSize: list.count }}
-   options={this.options}
- >
-   <TableHeaderColumn dataField="id" isKey>ID</TableHeaderColumn>
-   <TableHeaderColumn dataField="name" dataSort>Name</TableHeaderColumn>
- </BootstrapTable>

+ <ServerDataTable
+   columns={this.getColumns()}
+   data={data}
+   pageCount={pageCount}
+   totalCount={list.count || 0}
+   pagination={pagination}
+   onPaginationChange={(updater) => {
+     const newPagination = typeof updater === 'function'
+       ? updater(pagination)
+       : updater;
+     this.setState({ pagination: newPagination }, () => {
+       this.initializeData();
+     });
+   }}
+   sorting={sorting}
+   onSortingChange={(newSorting) => {
+     this.setState({ sorting: newSorting }, () => {
+       this.initializeData();
+     });
+   }}
+   enableRowSelection={false}
+   loading={false}
+   emptyMessage="No data found."
+ />
```

### 8. Remove Old Pagination Handlers

```diff
- onSizePerPageList = (sizePerPage) => {
-   if (this.options.sizePerPage !== sizePerPage) {
-     this.options.sizePerPage = sizePerPage;
-     this.initializeData();
-   }
- };

- onPageChange = (page, sizePerPage) => {
-   if (this.options.page !== page) {
-     this.options.page = page;
-     this.initializeData();
-   }
- };

- sortColumn = (sortName, sortOrder) => {
-   this.options.sortName = sortName;
-   this.options.sortOrder = sortOrder;
-   this.initializeData();
- };
```

## Column Types Cheat Sheet

### Text Column

```javascript
{
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => row.original.name,
  enableSorting: true,
}
```

### Date Column

```javascript
{
  accessorKey: 'createdDate',
  header: 'Created Date',
  cell: ({ row }) => row.original.createdDate || '',
  enableSorting: true,
}
```

### Badge/Status Column

```javascript
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => (
    <span className={`badge badge-${row.original.status.toLowerCase()}`}>
      {row.original.status}
    </span>
  ),
  enableSorting: true,
}
```

### Currency Column

```javascript
{
  accessorKey: 'amount',
  header: 'Amount',
  cell: ({ row }) => {
    const { amount, currencySymbol } = row.original;
    return `${currencySymbol} ${amount.toLocaleString(navigator.language,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  enableSorting: true,
}
```

### Actions Column

```javascript
{
  id: 'actions',
  header: '',
  cell: ({ row }) => {
    const rowData = row.original;
    return (
      <ButtonDropdown
        isOpen={this.state.actionButtons[rowData.id]}
        toggle={() => this.toggleActionButton(rowData.id)}
      >
        {/* Your dropdown items */}
      </ButtonDropdown>
    );
  },
  enableSorting: false,
  size: 50,
}
```

## Common Patterns

### Keep Action Button State

```javascript
// State remains the same
this.state = {
  actionButtons: {},
  // ...
};

// Toggle method stays the same
toggleActionButton = index => {
  let temp = Object.assign({}, this.state.actionButtons);
  temp[parseInt(index, 10)] = !temp[parseInt(index, 10)];
  this.setState({ actionButtons: temp });
};
```

### Multiple Row Selection

```javascript
// Enable in ServerDataTable
<ServerDataTable
  enableRowSelection={true}
  rowSelection={rowSelection}
  onRowSelectionChange={newSelection => {
    this.setState({ rowSelection: newSelection });
  }}
  // ... other props
/>;

// Access selected rows
const selectedRowIds = Object.keys(this.state.rowSelection).filter(
  key => this.state.rowSelection[key]
);
```

## Testing Checklist

After migration, test these features:

- [ ] Table loads with initial data
- [ ] Pagination: Next page
- [ ] Pagination: Previous page
- [ ] Pagination: First page
- [ ] Pagination: Last page
- [ ] Pagination: Change page size (10, 20, 30, 40, 50)
- [ ] Sorting: Click header to sort ascending
- [ ] Sorting: Click again to sort descending
- [ ] Sorting: Click third time to clear sort
- [ ] Filter: Apply filter and verify data updates
- [ ] Filter: Verify pagination resets to page 1
- [ ] Clear filters: Verify all filters clear
- [ ] Actions: Open dropdown for each row
- [ ] Actions: Each action button works correctly
- [ ] Empty state: Display when no data
- [ ] Loading state: Display during fetch (if implemented)

## Pro Tips

1. **Always backup original file**: `mv screen.js screen-bootstrap-table.js.bak`
2. **Page index is 0-based**: Don't subtract 1 when sending to backend
3. **Sorting is an array**: `sorting[0]` contains current sort, empty array = no sort
4. **Keep existing CSS**: Table classes work with tailwind defaults
5. **Test thoroughly**: All business logic should work identically

## Example Files

Reference these migrated files:

- `/apps/frontend/src/screens/customer_invoice/screen.js`
- `/apps/frontend/src/screens/supplier_invoice/screen.js`

## Need Help?

See the full migration guide: `/apps/frontend/TANSTACK_TABLE_MIGRATION_GUIDE.md`

---

**Last Updated**: December 19, 2025
