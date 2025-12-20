import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Receipt as ReceiptIcon } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import { Loader } from 'components';
import { selectOptionsFactory } from 'utils';
import dayjs from '@/utils/date';

import * as ReceiptActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

const strings = new LocalizedStrings(data);

// Custom styles for react-select to match shadcn/ui
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
    '&:hover': {
      borderColor: 'hsl(var(--ring))',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
      ? 'hsl(var(--accent))'
      : 'transparent',
    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
  input: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
};

/**
 * Modern Receipt Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Receipt() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const receipt_list = useSelector((state) => state.receipt.receipt_list);
  const contact_list = useSelector((state) => state.receipt.contact_list);

  // Actions
  const receiptActions = useMemo(
    () => bindActionCreators(ReceiptActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  // Filter state
  const [filterData, setFilterData] = useState({
    contactId: '',
    invoiceId: '',
    receiptReferenceCode: '',
    receiptDate: '',
    contactType: 2,
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    receiptActions
      .getReceiptList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [receiptActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    receiptActions.getContactList(filterData.contactType);
    receiptActions.getInvoiceList();
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const clearAll = () => {
    setFilterData({
      contactId: '',
      invoiceId: '',
      receiptReferenceCode: '',
      receiptDate: '',
      contactType: 2,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Transform contact list for select
  const customerOptions = useMemo(() => {
    if (!contact_list) return [];
    return contact_list.map((item) => ({
      label: item.label?.contactName || item.label,
      value: item.value,
    }));
  }, [contact_list]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'receiptDate',
        header: strings.ReceivedDate,
        cell: ({ row }) =>
          row.original.receiptDate
            ? dayjs(row.original.receiptDate).format('DD-MM-YYYY')
            : '',
      },
      {
        accessorKey: 'invoiceNumber',
        header: strings.InvoiceNumber,
      },
      {
        accessorKey: 'customerName',
        header: strings.CustomerName,
      },
      {
        accessorKey: 'receiptId',
        header: strings.RECEIPTNUMBER,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.receiptId}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: strings.AMOUNT,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="text-right">
              {item.currencyIsoCode}{' '}
              {item.amount?.toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              }) || '0.00'}
            </span>
          );
        },
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!receipt_list?.data) return [];
    return receipt_list.data.map((item) => ({
      receiptId: item.receiptId,
      invoiceNumber: item.invoiceNumber || '',
      customerName: item.customerName || '',
      receiptDate: item.receiptDate || '',
      amount: item.amount || 0,
      currencyIsoCode: item.currencyIsoCode || '',
      unusedAmount: item.unusedAmount || 0,
    }));
  }, [receipt_list]);

  // Row click handler
  const handleRowClick = (row) => {
    navigate('/admin/income/viewCustomerInvoice/detail', {
      state: { id: row.receiptId },
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="receipt-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ReceiptIcon className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.Receipts}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  styles={selectStyles}
                  className="input-transition"
                  placeholder={`${strings.Select} ${strings.Customer}`}
                  isClearable
                  options={
                    customerOptions
                      ? selectOptionsFactory.renderOptions(
                          'label',
                          'value',
                          customerOptions,
                          'Customer'
                        )
                      : []
                  }
                  value={filterData.contactId}
                  onChange={(option) => {
                    handleFilterChange('contactId', option || '');
                  }}
                />
                <DatePicker
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-transition"
                  id="date"
                  name="receiptDate"
                  placeholderText={`${strings.Select} ${strings.ReceiptDate}`}
                  selected={filterData.receiptDate}
                  showMonthDropdown
                  showYearDropdown
                  autoComplete="off"
                  dateFormat="dd-MM-yyyy"
                  dropdownMode="select"
                  onChange={(value) => {
                    handleFilterChange('receiptDate', value);
                  }}
                />
                <div className="flex gap-2 lg:col-start-4">
                  <Button onClick={handleSearch} variant="default" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={tableData}
              manualPagination
              pageCount={Math.ceil((receipt_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
              onRowClick={handleRowClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Receipt;
