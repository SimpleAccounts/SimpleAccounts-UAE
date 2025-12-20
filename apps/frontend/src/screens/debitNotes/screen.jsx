import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, CreditCard, Edit, Eye, FileText, University, Receipt } from 'lucide-react';
import Select from 'react-select';
import { upperCase } from 'lodash-es';
import { ToWords } from 'to-words';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader } from 'components';
import { selectOptionsFactory } from 'utils';

import * as DebitNotesActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

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
 * Get status badge variant
 */
function getStatusBadge(status) {
  switch (status) {
    case 'Open':
      return { variant: 'success', label: status };
    case 'Draft':
      return { variant: 'secondary', label: status };
    case 'Closed':
      return { variant: 'outline', label: status };
    case 'Partially Paid':
      return { variant: 'warning', label: 'Partially Debited' };
    default:
      return { variant: 'default', label: status };
  }
}

/**
 * Modern Debit Notes Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function DebitNotes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const debit_note_list = useSelector((state) => state.debit_notes.debit_note_list);
  const customer_list = useSelector((state) => state.common.customer_list);

  // Actions
  const debitNotesActions = useMemo(
    () => bindActionCreators(DebitNotesActions, dispatch),
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
    customerId: '',
    amount: '',
    contactType: 1,
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

    debitNotesActions
      .getdebitNotesList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || strings.SomethingWentWrong);
        setLoading(false);
      });
  }, [debitNotesActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    debitNotesActions.getStatusList();
    commonActions.getCustomerList(filterData.contactType);
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Debit note posting (Mark as Open)
  const debitNoteposting = useCallback(
    (row, markAsSent) => {
      const postingRequestModel = {
        amount: row.invoiceAmount,
        postingRefId: row.id,
        postingRefType: 'DEBIT_NOTE',
        isCNWithoutProduct: row.isCNWithoutProduct === true,
        amountInWords: upperCase(
          row.currencyName + ' ' + toWords.convert(row.totalAmount) + ' ONLY'
        ).replace('POINT', 'AND'),
        vatInWords:
          row.totalVatAmount && parseFloat(row.totalVatAmount) > 0
            ? upperCase(
                row.currencyName + ' ' + toWords.convert(row.totalVatAmount) + ' ONLY'
              ).replace('POINT', 'AND')
            : '-',
        markAsSent: markAsSent,
      };

      setLoading(true);
      debitNotesActions
        .debitNoteposting(postingRequestModel)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert('success', strings.DebitNoteStatusChangedSuccessfully);
            setLoading(false);
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert('error', strings.DebitNoteStatusChangedUnsuccessfully);
          setLoading(false);
        });
    },
    [debitNotesActions, commonActions, initializeData]
  );

  // Unpost debit note (Move to Draft)
  const unPostDebitNote = useCallback(
    (row) => {
      const postingRequestModel = {
        amount: row.invoiceAmount,
        postingRefId: row.id,
        postingRefType: 'DEBIT_NOTE',
        isCNWithoutProduct: row.isCNWithoutProduct === true,
        amountInWords: upperCase(
          row.currencyName + ' ' + toWords.convert(row.totalAmount) + ' ONLY'
        ).replace('POINT', 'AND'),
        vatInWords:
          row.totalVatAmount && parseFloat(row.totalVatAmount) > 0
            ? upperCase(
                row.currencyName + ' ' + toWords.convert(row.totalVatAmount) + ' ONLY'
              ).replace('POINT', 'AND')
            : '-',
        markAsSent: false,
      };

      setLoading(true);
      debitNotesActions
        .unPostDebitNote(postingRequestModel)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert('success', strings.DebitNoteMovedToDraftSuccessfully);
            setLoading(false);
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert('error', strings.DebitNoteMovedToDraftUnsuccessfully);
          setLoading(false);
        });
    },
    [debitNotesActions, commonActions, initializeData]
  );

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
      customerId: '',
      amount: '',
      contactType: 1,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Transform customer list for select
  const supplierOptions = useMemo(() => {
    if (!customer_list) return [];
    return customer_list.map((item) => ({
      label: item.label?.contactName || item.label,
      value: item.value,
    }));
  }, [customer_list]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'creditNoteNumber',
        header: 'Debit Note Number',
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.creditNoteNumber}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: strings.SUPPLIERNAME,
      },
      {
        accessorKey: 'invoiceNumber',
        header: strings.InvoiceNumber,
        cell: ({ row }) => row.original.invNumber || row.original.invoiceNumber || '',
      },
      {
        accessorKey: 'invoiceDate',
        header: strings.DATE,
        cell: ({ row }) => row.original.creditNoteDate || '',
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        cell: ({ row }) => {
          const { variant, label } = getStatusBadge(row.original.status);
          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        accessorKey: 'totalAmount',
        header: strings.AMOUNT,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right">
              <div>
                <span className="font-medium mr-2">{strings.Amount}:</span>
                <span>
                  {item.currencyName}{' '}
                  {item.totalAmount?.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                  }) || '0.00'}
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                <span className="mr-2">Remaining:</span>
                <span>
                  {item.currencyName}{' '}
                  {item.dueAmount?.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                  }) || '0.00'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const note = row.original;
          const actions = [];

          // Draft (only when Open)
          if (note.statusEnum === 'Open') {
            actions.push({
              label: strings.Draft,
              icon: FileText,
              onClick: () => unPostDebitNote(note),
            });
          }

          // Edit (not Closed, not Open, not Partially Paid)
          if (
            note.statusEnum !== 'Closed' &&
            note.statusEnum !== 'Open' &&
            note.statusEnum !== 'Partially Paid'
          ) {
            actions.push({
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/expense/debit-notes/update', {
                  state: { id: note.id, isCNWithoutProduct: note.isCNWithoutProduct },
                }),
            });
          }

          // Mark As Open (Draft only)
          if (note.statusEnum === 'Draft') {
            actions.push({
              label: strings.MarkAsOpen,
              icon: FileText,
              onClick: () => debitNoteposting(note, true),
            });
          }

          // Refund Payment (not Closed, not Draft)
          if (note.statusEnum !== 'Closed' && note.statusEnum !== 'Draft') {
            actions.push({
              label: strings.RefundPayment,
              icon: University,
              onClick: () =>
                navigate('/admin/expense/debit-notes/refund', {
                  state: { id: note },
                }),
            });
          }

          // Apply To Invoice (not Closed, not Draft, and not created on paid invoice)
          if (
            note.statusEnum !== 'Closed' &&
            note.statusEnum !== 'Draft' &&
            note.cnCreatedOnPaidInvoice !== true
          ) {
            actions.push({
              label: strings.ApplyToInvoice,
              icon: Receipt,
              onClick: () =>
                navigate('/admin/expense/debit-notes/applyToInvoice', {
                  state: {
                    contactId: note.contactId,
                    creditNoteId: note.id,
                    debitNoteNumber: note.creditNoteNumber,
                    referenceNumber: note.invoiceNumber,
                    debitAmount: note.dueAmount,
                    currency: note.currencyName,
                  },
                }),
            });
          }

          // View (always available)
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/expense/debit-notes/view', {
                state: {
                  id: note.id,
                  status: note.status,
                  isCNWithoutProduct: note.isCNWithoutProduct,
                },
              }),
          });

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, unPostDebitNote, debitNoteposting]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!debit_note_list?.data) return [];
    return debit_note_list.data.map((item) => ({
      id: item.id,
      creditNoteNumber: item.creditNoteNumber || '',
      customerName: item.customerName || '',
      invoiceNumber: item.invoiceNumber || '',
      invNumber: item.invNumber || '',
      creditNoteDate: item.creditNoteDate || '',
      invoiceDate: item.invoiceDate || '',
      status: item.status || '',
      statusEnum: item.statusEnum || item.status || '',
      totalAmount: item.totalAmount || 0,
      dueAmount: item.dueAmount || 0,
      invoiceAmount: item.invoiceAmount || 0,
      totalVatAmount: item.totalVatAmount || 0,
      currencyName: item.currencyName || '',
      currencyCode: item.currencyCode || '',
      isCNWithoutProduct: item.isCNWithoutProduct,
      contactId: item.contactId,
      cnCreatedOnPaidInvoice: item.cnCreatedOnPaidInvoice,
    }));
  }, [debit_note_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="debit-notes-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Debit Notes</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/expense/debit-notes/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewDebitNote}
              </Button>
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
                  placeholder={`${strings.Select} ${strings.Supplier}`}
                  isClearable
                  options={
                    supplierOptions
                      ? selectOptionsFactory.renderOptions(
                          'label',
                          'value',
                          supplierOptions,
                          'Supplier'
                        )
                      : []
                  }
                  value={filterData.customerId}
                  onChange={(option) => {
                    handleFilterChange('customerId', option || '');
                  }}
                />
                <Input
                  type="number"
                  min="0"
                  placeholder={`${strings.Enter} ${strings.Amount}`}
                  value={filterData.amount}
                  onChange={(e) => handleFilterChange('amount', e.target.value)}
                  className="input-transition"
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
              pageCount={Math.ceil((debit_note_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DebitNotes;
