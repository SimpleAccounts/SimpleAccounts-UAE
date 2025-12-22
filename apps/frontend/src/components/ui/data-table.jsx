import { useState, useMemo, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DataTablePagination } from './data-table-pagination';
import { NeumorphicPagination } from './neumorphic-pagination';

export function DataTable({
  columns,
  data,
  searchKey,
  enableRowSelection = false,
  pageCount,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  initialState = {},
  isLoading = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: setControlledRowSelection,
  getRowId,
  onRowClick,
  neumorphicPagination = false,
  totalCount,
  showPaginationTop = false,
  showPaginationBottom = true,
}) {
  const [sorting, setSorting] = useState(initialState.sorting || []);
  const [columnFilters, setColumnFilters] = useState([]);
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState(
    initialState.pagination || {
      pageIndex: 0,
      pageSize: 10,
    }
  );

  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const setRowSelection = setControlledRowSelection ?? setInternalRowSelection;

  // Handle external sorting change
  useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  // Handle external pagination change
  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pagination);
    }
  }, [pagination, onPaginationChange]);

  // Handle external search change
  useEffect(() => {
    if (onSearchChange) {
      // Debounce could be handled here or by parent
      onSearchChange(globalFilter);
    }
  }, [globalFilter, onSearchChange]);

  // Add selection column if row selection is enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) {
      return columns;
    }

    return [
      {
        id: 'select',
        header: ({ table }) => {
          const isAllSelected = table.getIsAllPageRowsSelected();
          const isSomeSelected = table.getIsSomePageRowsSelected();
          return (
            <Checkbox
              checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount: manualPagination ? pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    enableRowSelection: enableRowSelection,
    manualPagination: manualPagination,
    manualSorting: manualSorting,
    manualFiltering: manualFiltering,
    getRowId: getRowId,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination,
    },
  });

  const PaginationComponent = neumorphicPagination ? NeumorphicPagination : DataTablePagination;

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder={`Search ${searchKey}...`}
            value={
              manualFiltering ? globalFilter : (table.getColumn(searchKey)?.getFilterValue() ?? '')
            }
            onChange={e => {
              if (manualFiltering) {
                setGlobalFilter(e.target.value);
              } else {
                table.getColumn(searchKey)?.setFilterValue(e.target.value);
              }
            }}
            className="max-w-sm"
          />
        </div>
      )}
      {showPaginationTop && <PaginationComponent table={table} totalCount={totalCount} />}
      <div className="rounded-xl overflow-hidden" style={{ border: 'none' }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                style={{
                  background:
                    'linear-gradient(145deg, rgba(30, 110, 255, 0.08), rgba(30, 110, 255, 0.04))',
                  borderBottom: '1px solid rgba(30, 110, 255, 0.1)',
                }}
              >
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{
                      color: '#1e3a5f',
                      fontWeight: 600,
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      padding: '14px 16px',
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-1'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <span style={{ color: '#1e6eff' }}>↑</span>,
                          desc: <span style={{ color: '#1e6eff' }}>↓</span>,
                        }[header.column.getIsSorted()] ??
                          (header.column.getCanSort() ? (
                            <span style={{ color: '#98afc2', fontSize: '10px' }}>⇅</span>
                          ) : null)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPaginationBottom && <PaginationComponent table={table} totalCount={totalCount} />}
    </div>
  );
}
