import React, { useState, useMemo } from 'react';
import { FileText, Briefcase, Download } from 'lucide-react';
import Select from 'react-select';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';

import { DateRangePicker2, Loader } from 'components';
import dayjs from '@/utils/date';
import { selectStyles } from 'utils';

import './style.scss';

const vatOptions = [
  { value: 'input', label: 'Input' },
  { value: 'output', label: 'Output' },
  { value: 'all', label: 'All' },
];

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
 * Modern Tax Report Screen
 * Uses functional components and shadcn/ui
 */
function TaxReport() {
  const [loading] = useState(false);
  const [selectedVat, setSelectedVat] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // VAT Transactions columns
  const vatTransactionColumns = useMemo(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Party Name',
      },
      {
        accessorKey: 'transactionCategoryDescription',
        header: 'Source',
      },
      {
        accessorKey: 'transactionType',
        header: 'Document',
      },
      {
        accessorKey: 'parentTransactionCategory',
        header: 'Amount',
      },
      {
        id: 'vatCode',
        header: 'VAT Code',
        cell: () => '-',
      },
      {
        id: 'vatAmount',
        header: 'VAT Amount',
        cell: () => '-',
      },
      {
        id: 'status',
        header: 'Status',
        cell: () => '-',
      },
    ],
    []
  );

  // VAT Report columns
  const vatReportColumns = useMemo(
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="tax-report-screen">
      <div className="space-y-6">
        {/* VAT Transactions Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">VAT Transactions</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  <i>Last updated at 28 October 2019</i>
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>VAT:</Label>
                  <div className="w-40">
                    <Select
                      styles={selectStyles}
                      options={vatOptions}
                      value={selectedVat}
                      onChange={setSelectedVat}
                      placeholder="Select VAT"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Period:</Label>
                  <div className="date-range">
                    <DateRangePicker2 ranges={ranges} opens="left" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={vatTransactionColumns} data={tempdata} />
          </CardContent>
        </Card>

        {/* VAT Report Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">VAT Report</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  <i>Last updated at 28 October 2019</i>
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Status:</Label>
                  <div className="w-40">
                    <Select
                      styles={selectStyles}
                      options={statusOptions}
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      placeholder="Select Status"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Period:</Label>
                  <div className="date-range">
                    <DateRangePicker2 ranges={ranges} opens="left" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={vatReportColumns} data={tempdata} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TaxReport;
