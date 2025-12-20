# react-bootstrap-table to shadcn DataTable Migration Guide

This document outlines the migration of 10 files from react-bootstrap-table to shadcn DataTable component.

## Files Migrated

1. `/apps/frontend/src/screens/product/screen.js`
2. `/apps/frontend/src/screens/product/screens/inventory_history/screen.js`
3. `/apps/frontend/src/screens/product/screens/inventory_edit/screen.js` - NO TABLE FOUND
4. `/apps/frontend/src/screens/product/screens/detail/sections/invetoryHistorymodal.js`
5. `/apps/frontend/src/screens/inventory/sections/inventory_summary/sections/invetoryHistorymodal.js`
6. `/apps/frontend/src/screens/inventory/sections/inventory_dashboard/index.js` - NO TABLE FOUND
7. `/apps/frontend/src/screens/product_category/screen.js`
8. `/apps/frontend/src/screens/currency/screen.js`
9. `/apps/frontend/src/screens/vat_code/screen.js`
10. `/apps/frontend/src/screens/chart_account/screen.js`

## Migration Pattern

### 1. Import Changes

**Before:**

```javascript
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
```

**After:**

```javascript
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge'; // For status badges
```

### 2. State Changes

**Before:**

```javascript
this.state = {
  // ... other state
};

this.options = {
  onRowClick: this.goToDetail,
  page: 1,
  sizePerPage: 10,
  onSizePerPageList: this.onSizePerPageList,
  onPageChange: this.onPageChange,
  sortName: '',
  sortOrder: '',
  onSortChange: this.sortColumn,
};

this.selectRowProp = {
  bgColor: 'rgba(0,0,0, 0.05)',
  clickToSelect: false,
  onSelect: this.onRowSelect,
  onSelectAll: this.onSelectAll,
};
```

**After:**

```javascript
this.state = {
  // ... other state
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [],
};
```

### 3. Method Changes

**Remove these methods:**

- `onSizePerPageList`
- `onPageChange`
- `sortColumn`

**Add these methods:**

```javascript
handlePaginationChange = newPagination => {
  this.setState({ pagination: newPagination }, () => {
    this.initializeData();
  });
};

handleSortingChange = newSorting => {
  this.setState({ sorting: newSorting }, () => {
    this.initializeData();
  });
};
```

### 4. initializeData Method

**Before:**

```javascript
initializeData = () => {
  const { filterData } = this.state;
  const paginationData = {
    pageNo: this.options.page ? this.options.page - 1 : 0,
    pageSize: this.options.sizePerPage,
  };
  const sortingData = {
    order: this.options.sortOrder ? this.options.sortOrder : '',
    sortingCol: this.options.sortName ? this.options.sortName : '',
  };
  // ... rest of method
};
```

**After:**

```javascript
initializeData = () => {
  const { filterData, pagination, sorting } = this.state;
  const paginationData = {
    pageNo: pagination.pageIndex,
    pageSize: pagination.pageSize,
  };
  const sortingData = {
    order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
    sortingCol: sorting.length > 0 ? sorting[0].id : '',
  };
  // ... rest of method
};
```

### 5. Column Definitions

Convert `TableHeaderColumn` elements to column definition arrays:

**Before:**

```jsx
<BootstrapTable data={data} options={this.options}>
  <TableHeaderColumn dataField="productCode" dataSort>
    Product Code
  </TableHeaderColumn>
  <TableHeaderColumn dataField="isActive" dataSort dataFormat={this.renderStatus}>
    Status
  </TableHeaderColumn>
  <TableHeaderColumn
    dataField="unitPrice"
    dataFormat={this.unitPrice}
    formatExtraData={universal_currency_list}
  >
    Unit Price
  </TableHeaderColumn>
</BootstrapTable>
```

**After:**

```javascript
const columns = [
  {
    accessorKey: 'productCode',
    header: 'Product Code',
    enableSorting: true,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    enableSorting: true,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge className={isActive ? 'bg-green-500' : 'bg-red-500'}>
          {isActive ? 'Active' : 'InActive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    enableSorting: true,
    cell: ({ row }) => (
      <Currency
        value={row.original.unitPrice}
        currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
      />
    ),
  },
];
```

### 6. DataTable Usage

**Before:**

```jsx
<BootstrapTable
  selectRow={this.selectRowProp}
  search={false}
  options={this.options}
  data={product_list && product_list.data ? product_list.data : []}
  version="4"
  hover
  pagination={true}
  remote
  fetchInfo={{
    dataTotalSize: product_list.count ? product_list.count : 0,
  }}
  className="product-table"
  trClassName="cursor-pointer"
>
  {/* TableHeaderColumn elements */}
</BootstrapTable>
```

**After:**

```jsx
<DataTable
  columns={columns}
  data={product_list && product_list.data ? product_list.data : []}
  manualPagination
  pageCount={Math.ceil((product_list.count || 0) / pagination.pageSize)}
  totalRows={product_list.count || 0}
  pagination={pagination}
  onPaginationChange={this.handlePaginationChange}
  manualSorting
  sorting={this.state.sorting}
  onSortingChange={this.handleSortingChange}
  onRowClick={this.goToDetail}
  loading={loading}
  emptyMessage="No products found"
/>
```

## File-Specific Notes

### 1. product/screen.js

- Has server-side pagination and sorting
- Multiple custom formatters (renderType, renderInventory, unitPrice, exciseSlabFormatter, renderStatus)
- All formatters should be converted to cell renderers in column definitions

### 2. inventory_history/screen.js

- Has server-side pagination
- Custom date formatter
- Product information displayed above table

### 3. invetoryHistorymodal.js (both locations)

- Displayed in a modal (Dialog component)
- Has CSV export functionality via ButtonGroup
- Custom renderDate, renderUnitCost, renderunitSellingPrice formatters
- Product code and name displayed in table header rows

### 4. product_category/screen.js

- Simple table with code and name columns
- Server-side pagination
- Bulk delete functionality (commented out)

### 5. currency/screen.js

- Simple table with name and symbol columns
- Client-side pagination (no remote flag)
- Currency modal for create/edit

### 6. vat_code/screen.js

- Server-side pagination
- Custom vatPercentageFormat formatter (adds % symbol)
- Filters data to exclude specific IDs (3, 4, 10)
- Conditional "Add New VAT" button based on isRegisteredVat

### 7. chart_account/screen.js

- Server-side pagination
- Custom typeFormatter and editFormatter
- Unselectable rows based on editableFlag
- Print functionality that temporarily changes pagination size
- Filter functionality (commented out)

## Common Patterns

### Date Formatting

```javascript
// Before (dataFormat)
renderDate = (cell, rows) => dayjs(rows.date).format('DD-MM-YYYY');

// After (cell renderer)
{
  accessorKey: 'date',
  header: 'Date',
  cell: ({ row }) => dayjs(row.original.date).format('DD-MM-YYYY'),
}
```

### Currency Formatting

```javascript
// Before (dataFormat with formatExtraData)
unitPrice(cell, row, extraData) {
  return (
    <Currency
      value={row.unitPrice}
      currencySymbol={extraData[0]?.currencyIsoCode || 'USD'}
    />
  );
}

// After (cell renderer with closure)
{
  accessorKey: 'unitPrice',
  header: 'Unit Price',
  cell: ({ row }) => (
    <Currency
      value={row.original.unitPrice}
      currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
    />
  ),
}
```

### Status Badges

```javascript
// Before (dataFormat)
renderStatus = (cell, row) => {
  const classname = row.isActive ? 'label-success' : 'label-due';
  return (
    <span className={`badge ${classname}`}>
      {row.isActive ? 'Active' : 'InActive'}
    </span>
  );
};

// After (cell renderer with shadcn Badge)
{
  accessorKey: 'isActive',
  header: 'Status',
  cell: ({ row }) => (
    <Badge className={row.original.isActive ? 'bg-green-500' : 'bg-red-500'}>
      {row.original.isActive ? 'Active' : 'InActive'}
    </Badge>
  ),
}
```

## Testing Checklist

For each migrated file, verify:

- [ ] Table renders correctly with data
- [ ] Pagination works (page changes, page size changes)
- [ ] Sorting works (ascending/descending)
- [ ] Row clicks navigate to detail pages
- [ ] Custom formatters display correctly
- [ ] Loading states show properly
- [ ] Empty states show when no data
- [ ] All custom cell renderers work (badges, currency, dates, etc.)
- [ ] Server-side pagination sends correct page numbers (0-indexed)
- [ ] Filtering functionality still works
- [ ] Export/print functionality still works (if applicable)

## Migration Status

- [x] product/screen.js - Partially migrated (imports and state updated)
- [ ] inventory_history/screen.js - Pending
- [ ] inventory_edit/screen.js - No table found
- [ ] invetoryHistorymodal.js (product detail) - Pending
- [ ] invetoryHistorymodal.js (inventory summary) - Pending
- [ ] inventory_dashboard/index.js - No table found
- [ ] product_category/screen.js - Pending
- [ ] currency/screen.js - Pending
- [ ] vat_code/screen.js - Pending
- [ ] chart_account/screen.js - Pending

## Notes

- Files 3 and 6 (inventory_edit/screen.js and inventory_dashboard/index.js) do not contain BootstrapTable components
- The DataTable component supports all features needed: server-side pagination, sorting, row selection, custom cell renderers
- All custom formatters can be converted to cell renderers using the `cell` property in column definitions
- The `onRowClick` prop handles row click events uniformly
