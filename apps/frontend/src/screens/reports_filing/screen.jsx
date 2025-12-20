import React, { useState, useMemo, useRef } from 'react';
import { Briefcase, Download, Search } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';

import { DateRangePicker2 } from 'components';
import dayjs from '@/utils/date';
import { selectStyles } from 'utils';

import './style.scss';

const statusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'generated', label: 'Generated' },
  { value: 'cancelled', label: 'Cancelled' },
];

const tempdata = [
  {
    id: 1,
    transactionDate: '10/15/2019',
    transactionCategoryDescription: 'temp',
    transactionType: 'TEMP',
    parentTransactionCategory: 'Loream Ipsume',
  },
  {
    id: 2,
    transactionDate: '10/15/2019',
    transactionCategoryDescription: 'temp',
    transactionType: 'TEMP',
    parentTransactionCategory: 'Loream Ipsume',
  },
  {
    id: 3,
    transactionDate: '10/15/2019',
    transactionCategoryDescription: 'temp',
    transactionType: 'TEMP',
    parentTransactionCategory: 'Loream Ipsume',
  },
];

const ranges = {
  'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
  'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last Month': [
    dayjs().subtract(1, 'month').startOf('month'),
    dayjs().subtract(1, 'month').endOf('month'),
  ],
};

/**
 * Modern Reports Filing Screen
 * Uses functional components and shadcn/ui
 */
function ReportsFiling() {
  const tableRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Report No.',
      },
      {
        accessorKey: 'transactionCategoryDescription',
        header: 'Status',
      },
      {
        accessorKey: 'transactionType',
        header: 'Status Date',
      },
      {
        accessorKey: 'parentTransactionCategory',
        header: 'TRN',
      },
      {
        id: 'action',
        header: 'Action',
        cell: () => (
          <Button variant="outline" size="sm">
            Detail
          </Button>
        ),
      },
    ],
    []
  );

  const handleSearch = () => {
    // Search logic
  };

  const handleExport = () => {
    // Export logic
  };

  return (
    <div className="report-filing-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">VAT Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Actions and Date Range */}
            <div className="flex flex-wrap justify-end gap-4 mb-6">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
              <div className="date-range">
                <DateRangePicker2 ranges={ranges} opens="left" />
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">Filter:</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    styles={selectStyles}
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Select Status"
                    isClearable
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker
                    className="input-transition w-full border rounded px-3 py-2"
                    selected={filterDate}
                    onChange={setFilterDate}
                    placeholderText="Select Date"
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="dd-MM-yyyy"
                    dropdownMode="select"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable columns={columns} data={tempdata} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsFiling;
