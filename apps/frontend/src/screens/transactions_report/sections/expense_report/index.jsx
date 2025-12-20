import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { DateRangePicker2 } from 'components';
import dayjs from '@/utils/date';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import './style.scss';

const tempdata = [
  {
    transactionCategoryId: 2,
    transactionCategoryCode: 2,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
];

const ranges = {
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
  'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
  'Last Month': [
    dayjs().subtract(1, 'month').startOf('month'),
    dayjs().subtract(1, 'month').endOf('month'),
  ],
};

function ExpenseReport() {
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const getSelectedData = () => {
    // Implement search functionality
  };

  // Column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionCategoryCode',
        header: 'Receipt Number',
        enableSorting: true,
      },
      {
        accessorKey: 'transactionCategoryName',
        header: 'Expense Date',
        enableSorting: true,
      },
      {
        accessorKey: 'transactionCategoryDescription',
        header: 'Description',
        enableSorting: true,
      },
      {
        accessorKey: 'parentTransactionCategory',
        header: 'Amount',
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <div className="expense-report-section">
      <div className="animated fadeIn">
        <div className="grid grid-cols-12 gap-4">
          <div lg={12}>
            <div className="flex-wrap d-flex align-items-start justify-content-between">
              <div className="info-block">
                <h4>
                  Company Name -{' '}
                  <small>
                    <i>Expenses</i>
                  </small>
                </h4>
              </div>
              <form onSubmit={(e) => e.preventDefault()} name="simpleForm">
                <div className="flex-wrap d-flex align-items-center">
                  <div>
                    <div className="inline-flex rounded-md mr-3" role="group">
                      <Button variant="default" className="btn-square" onClick={() => {}}>
                        <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                        Export to CSV
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="date-range">
                      <DateRangePicker2 ranges={ranges} opens={'left'} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="py-3">
              <h5>Filter : </h5>
              <div className="grid grid-cols-12 gap-4">
                <div lg={2} className="mb-1">
                  <Input type="text" placeholder="Receipt Number" />
                </div>
                <div lg={2} className="mb-1">
                  <DateRangePicker>
                    <Input type="text" placeholder="Expense Date" />
                  </DateRangePicker>
                </div>
                <div lg={2} className="mb-1">
                  <Button
                    variant="secondary"
                    className="btn-square"
                    type="submit"
                    name="submit"
                    onClick={getSelectedData}
                  >
                    <i className="fa glyphicon glyphicon-export fa-search mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <DataTable
                columns={columns}
                data={tempdata}
                enableExport={true}
                exportFileName="tempdata"
                emptyMessage="No expenses found"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseReport;
