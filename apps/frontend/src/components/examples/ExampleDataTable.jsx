import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Example DataTable component demonstrating TanStack Table + shadcn/ui integration
 * This example shows:
 * - Column definitions
 * - Sorting functionality
 * - Filtering functionality
 * - Pagination
 * - Row selection (optional)
 * - Search functionality
 */

// Sample data
const sampleData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'Active',
    role: 'Admin',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'Active',
    role: 'User',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    status: 'Inactive',
    role: 'User',
    createdAt: '2024-03-10',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    status: 'Active',
    role: 'Manager',
    createdAt: '2024-01-05',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'Pending',
    role: 'User',
    createdAt: '2024-04-01',
  },
  {
    id: 6,
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    status: 'Active',
    role: 'Admin',
    createdAt: '2024-02-14',
  },
  {
    id: 7,
    name: 'Edward Norton',
    email: 'edward.norton@example.com',
    status: 'Inactive',
    role: 'User',
    createdAt: '2024-03-25',
  },
  {
    id: 8,
    name: 'Fiona Apple',
    email: 'fiona.apple@example.com',
    status: 'Active',
    role: 'Manager',
    createdAt: '2024-01-30',
  },
  {
    id: 9,
    name: 'George Clooney',
    email: 'george.clooney@example.com',
    status: 'Active',
    role: 'User',
    createdAt: '2024-02-28',
  },
  {
    id: 10,
    name: 'Helen Mirren',
    email: 'helen.mirren@example.com',
    status: 'Pending',
    role: 'User',
    createdAt: '2024-04-05',
  },
  {
    id: 11,
    name: 'Ian McKellen',
    email: 'ian.mckellen@example.com',
    status: 'Active',
    role: 'Admin',
    createdAt: '2024-01-12',
  },
  {
    id: 12,
    name: 'Julia Roberts',
    email: 'julia.roberts@example.com',
    status: 'Active',
    role: 'Manager',
    createdAt: '2024-03-15',
  },
];

export function ExampleDataTable() {
  const columns = useMemo(
    () => [
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
        cell: ({ row }) => {
          const status = row.getValue('status');
          const statusColors = {
            Active: 'text-green-600',
            Inactive: 'text-red-600',
            Pending: 'text-yellow-600',
          };
          return <span className={statusColors[status] || ''}>{status}</span>;
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Example DataTable</CardTitle>
          <CardDescription>
            Demonstrating TanStack Table with shadcn/ui styling. Features include sorting,
            filtering, pagination, and search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={sampleData}
            searchKey="name"
            enableRowSelection={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
