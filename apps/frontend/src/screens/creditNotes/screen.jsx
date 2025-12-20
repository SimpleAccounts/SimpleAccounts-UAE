import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, RefreshCw, CreditCard, Edit, Eye, Send, FileText, Banknote, Receipt } from 'lucide-react';
import Select from 'react-select';
import { upperCase } from 'lodash';
import { ToWords } from 'to-words';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, SentInvoice } from 'components';
import { selectOptionsFactory } from 'utils';

import * as CreditNotesActions from './actions';
import { CommonActions } from 'services/global';

import dayjs from '@/utils/date';
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
};

/**
 * Get status badge variant
 */
function getStatusBadge(status) {
  switch (status) {
    case 'Closed':
      return { variant: 'outline', label: status };
    case 'Draft':
      return { variant: 'secondary', label: status };
    case 'Partially Paid':
      return { variant: 'warning', label: 'Partially Credited' };
    case 'Open':
      return { variant: 'success', label: status };
    default:
      return { variant: 'destructive', label: status };
  }
}

/**
 * Modern Credit Notes List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function CreditNotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const customer_list = useSelector((state) => state.customer_invoice.customer_list);
  const customer_invoice_list = useSelector((state) => state.customer_invoice.customer_invoice_list);
  const universal_currency_list = useSelector((state) => state.common.universal_currency_list);

  // Actions
  const creditNotesActions = useMemo(
    () => bindActionCreators(CreditNotesActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);

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

    creditNotesActions
      .getCreditNoteList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [creditNotesActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    creditNotesActions.getStatusList();
    creditNotesActions.getCustomerList(filterData.contactType);
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Send mail handler
  const sendMail = useCallback(
    (row, markAsSent, sendAgain) => {
      const { invoiceAmount, currencyName, isCNWithoutProduct, totalVatAmount, id } = row;
      setDialog(
        <SentInvoice
          invoiceAmount={invoiceAmount || 0}
          id={id}
          currencyName={currencyName || 'UAE'}
          vatAmount={totalVatAmount || 0}
          markAsSent={markAsSent}
          postingRefType="CREDIT_NOTE"
          setState={() => setDialog(null)}
          initializeData={initializeData}
          documentTitle={strings.TaxCreditNote}
          unSent={false}
          sendAgain={sendAgain}
          mailPopupCard={!markAsSent || sendAgain}
          zatcaConfirmation={true}
          isCNWithoutProduct={isCNWithoutProduct}
        />
      );
    },
    [initializeData]
  );

  // Unpost credit note
  const unPostInvoice = useCallback(
    (row) => {
      setLoading(true);
      const postingRequestModel = {
        amount: row.invoiceAmount,
        postingRefId: row.id,
        postingRefType: 'CREDIT_NOTE',
        isCNWithoutProduct: row.isCNWithoutProduct === true,
        amountInWords: upperCase(
          row.currencyName + ' ' + toWords.convert(row.invoiceAmount) + ' ONLY'
        ).replace('POINT', 'AND'),
        vatInWords: row.totalVatAmount
          ? upperCase(
              row.currencyName + ' ' + toWords.convert(row.totalVatAmount) + ' ONLY'
            ).replace('POINT', 'AND')
          : '-',
        markAsSent: false,
      };

      creditNotesActions
        .unPostInvoice(postingRequestModel)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              'Credit Note Moved To Draft Successfully'
            );
            setLoading(false);
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Invoice Unposted Unsuccessfully'
          );
          setLoading(false);
        });
    },
    [creditNotesActions, commonActions, initializeData]
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
      contactType: 2,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Transform customer list for select
  const customerOptions = useMemo(() => {
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
        header: strings.CREDITNOTE,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.creditNoteNumber}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: strings.CUSTOMERNAME,
      },
      {
        accessorKey: 'invoiceNumber',
        header: strings.INVOICENUMBER,
      },
      {
        accessorKey: 'invoiceDate',
        header: strings.DATE,
        cell: ({ row }) =>
          row.original.invoiceDate
            ? dayjs(row.original.invoiceDate).format('DD-MM-YYYY')
            : '',
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
        accessorKey: 'invoiceAmount',
        header: strings.AMOUNT,
        cell: ({ row }) => {
          const { invoiceAmount, dueAmount, currencyName } = row.original;
          return (
            <div className="text-right">
              <div>
                <span className="font-medium mr-1">{strings.Amount}:</span>
                <span>
                  {currencyName}{' '}
                  {(invoiceAmount || 0).toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium mr-1">{strings.RemainingBalance}:</span>
                <span>
                  {currencyName}{' '}
                  {(dueAmount || 0).toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
          const cn = row.original;
          const actions = [];

          // Draft (Open status only)
          if (cn.statusEnum === 'Open') {
            actions.push({
              label: strings.Draft,
              icon: FileText,
              onClick: () => unPostInvoice(cn),
            });
          }

          // Edit (not Closed, Open, or Partially Paid)
          if (!['Closed', 'Open', 'Partially Paid'].includes(cn.statusEnum)) {
            actions.push({
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/income/credit-notes/detail', {
                  state: { id: cn.id, isCNWithoutProduct: cn.isCNWithoutProduct },
                }),
            });
          }

          // Mark As Sent (Draft only)
          if (cn.statusEnum === 'Draft') {
            actions.push({
              label: 'Mark As Sent',
              icon: Send,
              onClick: () => sendMail(cn, true, false),
            });
          }

          // Send (not Closed, Open, or Partially Paid)
          if (!['Closed', 'Open', 'Partially Paid'].includes(cn.statusEnum)) {
            actions.push({
              label: strings.Send,
              icon: Send,
              onClick: () => sendMail(cn, false, false),
            });
          }

          // Refund Payment (not Closed or Draft)
          if (!['Closed', 'Draft'].includes(cn.statusEnum)) {
            actions.push({
              label: strings.RefundPayment,
              icon: Banknote,
              onClick: () =>
                navigate('/admin/income/credit-notes/refund', {
                  state: { id: cn },
                }),
            });
          }

          // Apply To Invoice (not Closed, Draft, and not created on paid invoice)
          if (
            !['Closed', 'Draft'].includes(cn.statusEnum) &&
            cn.cnCreatedOnPaidInvoice !== true
          ) {
            actions.push({
              label: strings.ApplyToInvoice,
              icon: Receipt,
              onClick: () =>
                navigate('/admin/income/credit-notes/applyToInvoice', {
                  state: {
                    contactId: cn.contactId,
                    creditNoteId: cn.id,
                    creditNoteNumber: cn.creditNoteNumber,
                    referenceNumber: cn.invoiceNumber,
                    creditAmount: cn.dueAmount,
                    currency: cn.currencyName,
                  },
                }),
            });
          }

          // View
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/income/credit-notes/view', {
                state: {
                  id: cn.id,
                  status: cn.status,
                  isCNWithoutProduct: cn.isCNWithoutProduct,
                },
              }),
          });

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, sendMail, unPostInvoice]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!customer_invoice_list?.data) return [];
    return customer_invoice_list.data.map((customer) => ({
      id: customer.id,
      status: customer.status || '',
      statusEnum: customer.statusEnum || '',
      customerName: customer.customerName || '',
      dueAmount: customer.dueAmount || 0,
      contactId: customer.contactId,
      invoiceNumber: customer.invNumber || '',
      creditNoteNumber: customer.creditNoteNumber || '',
      invoiceDate: customer.creditNoteDate || '',
      currencyName: customer.currencyName || '',
      invoiceAmount: customer.totalAmount || 0,
      totalVatAmount: customer.totalVatAmount || 0,
      cnCreatedOnPaidInvoice: customer.cnCreatedOnPaidInvoice,
      isCNWithoutProduct: customer.isCNWithoutProduct,
    }));
  }, [customer_invoice_list]);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="credit-notes-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.CreditNotes}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/income/credit-notes/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddCreditNote}
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
                  value={filterData.customerId}
                  onChange={(option) => {
                    handleFilterChange('customerId', option || '');
                  }}
                />
                <Input
                  type="number"
                  min="0"
                  value={filterData.amount}
                  placeholder={`${strings.Enter} ${strings.Amount}`}
                  className="input-transition"
                  onChange={(e) => handleFilterChange('amount', e.target.value)}
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
              pageCount={Math.ceil(
                (customer_invoice_list?.count || 0) / pagination.pageSize
              )}
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

export default CreditNotes;
