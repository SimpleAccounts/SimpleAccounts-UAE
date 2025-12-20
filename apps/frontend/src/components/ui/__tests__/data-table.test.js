import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../data-table';

// Mock the DataTablePagination component
jest.mock('../data-table-pagination', () => ({
  DataTablePagination: ({ table }) => (
    <div data-testid="pagination">
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
    </div>
  ),
}));

describe('DataTable', () => {
  const mockColumns = [
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
      enableSorting: false,
    },
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  it('renders table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders search input when searchKey is provided', () => {
    render(<DataTable columns={mockColumns} data={mockData} searchKey="name" />);

    const searchInput = screen.getByPlaceholderText('Search name...');
    expect(searchInput).toBeInTheDocument();
  });

  it('does not render search input when searchKey is not provided', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const searchInput = screen.queryByPlaceholderText(/Search/);
    expect(searchInput).not.toBeInTheDocument();
  });

  it('filters data when search input changes', () => {
    render(<DataTable columns={mockColumns} data={mockData} searchKey="name" />);

    const searchInput = screen.getByPlaceholderText('Search name...');
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('displays "No results" when filtered data is empty', () => {
    render(<DataTable columns={mockColumns} data={mockData} searchKey="name" />);

    const searchInput = screen.getByPlaceholderText('Search name...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('renders pagination component', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('handles sorting when column header is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);

    // After sorting, the data should still be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    render(<DataTable columns={mockColumns} data={[]} />);

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('renders checkbox column when row selection is enabled', () => {
    render(<DataTable columns={mockColumns} data={mockData} enableRowSelection={true} />);

    // Check for select all checkbox in header
    const selectAllCheckbox = screen.getByLabelText('Select all');
    expect(selectAllCheckbox).toBeInTheDocument();

    // Check for row checkboxes
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    expect(rowCheckboxes.length).toBe(mockData.length);
  });

  it('does not render checkbox column when row selection is disabled', () => {
    render(<DataTable columns={mockColumns} data={mockData} enableRowSelection={false} />);

    const selectAllCheckbox = screen.queryByLabelText('Select all');
    expect(selectAllCheckbox).not.toBeInTheDocument();

    const rowCheckboxes = screen.queryAllByLabelText('Select row');
    expect(rowCheckboxes.length).toBe(0);
  });

  it('toggles row selection when checkbox is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} enableRowSelection={true} />);

    const rowCheckboxes = screen.getAllByLabelText('Select row');
    const firstCheckbox = rowCheckboxes[0];

    // Initially unchecked
    expect(firstCheckbox).not.toBeChecked();

    // Click to select
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    // Click to deselect
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();
  });
});
