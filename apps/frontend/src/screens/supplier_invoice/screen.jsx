import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { upperCase } from 'lodash-es';
import { ToWords } from 'to-words';
import {
  Plus,
  Search,
  RefreshCw,
  FileText,
  Eye,
  Edit,
  Copy,
  FileCheck,
  Send,
  University,
  CreditCard,
  File,
  Truck,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal, Currency, SentInvoice } from 'components';
import { selectOptionsFactory } from 'utils';

import * as SupplierInvoiceActions from './actions';
import { CommonActions } from 'services/global';
import config from 'constants/config';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import 'react-datepicker/dist/react-datepicker.css';
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

/**
 * Modern Supplier Invoice List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function SupplierInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const supplier_invoice_list = useSelector(state => state.supplier_invoice.supplier_invoice_list);
  const supplier_list = useSelector(state => state.supplier_invoice.supplier_list);
  const status_list = useSelector(state => state.supplier_invoice.status_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);

  // Actions
  const supplierInvoiceActions = useMemo(
    () => bindActionCreators(SupplierInvoiceActions, dispatch),
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
    supplierId: '',
    referenceNumber: '',
    invoiceDate: '',
    invoiceDueDate: '',
    amount: '',
    status: '',
    contactType: 1,
  });

  // Overdue amounts
  const [overDueAmountDetails, setOverDueAmountDetails] = useState({
    overDueAmount: '',
    overDueAmountWeekly: '',
    overDueAmountMonthly: '',
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

    supplierInvoiceActions
      .getSupplierInvoiceList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [supplierInvoiceActions, commonActions, filterData, pagination, sorting]);

  const getOverdue = useCallback(() => {
    supplierInvoiceActions
      .getOverdueAmountDetails(filterData.contactType)
      .then(res => {
        if (res.status === 200) {
          setOverDueAmountDetails(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [supplierInvoiceActions, commonActions, filterData.contactType]);

  useEffect(() => {
    supplierInvoiceActions.getStatusList();
    supplierInvoiceActions.getSupplierList(filterData.contactType);
    initializeData();
    getOverdue();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Invoice actions
  const postInvoice = useCallback(
    (row, markAsSent) => {
      const postingRequestModel = {
        amount: row.invoiceAmount,
        postingRefId: row.id,
        postingRefType: 'SUPPLIER_INVOICE',
        amountInWords: upperCase(
          row.currencyName + ' ' + toWords.convert(row.invoiceAmount) + ' ONLY'
        ).replace('POINT', 'AND'),
        vatInWords: row.vatAmount
          ? upperCase(row.currencyName + ' ' + toWords.convert(row.vatAmount) + ' ONLY').replace(
              'POINT',
              'AND'
            )
          : '-',
        markAsSent: markAsSent,
      };
      setLoading(true);
      setLoadingMsg('Supplier Invoice Posting...');

      supplierInvoiceActions
        .postInvoice(postingRequestModel)
        .then(res => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              markAsSent
                ? strings.InvoiceStatusChangedSuccessfully
                : strings.InvoiceSentSuccessfully
            );
            setLoading(false);
            getOverdue();
            initializeData();
          }
        })
        .catch(() => {
          commonActions.tostifyAlert('error', 'Supplier Invoice Posted Unsuccessfully');
          setLoading(false);
        });
    },
    [supplierInvoiceActions, commonActions, getOverdue, initializeData]
  );

  const unPostInvoice = useCallback(
    row => {
      setLoading(true);
      const postingRequestModel = {
        amount: row.invoiceAmount,
        postingRefId: row.id,
        postingRefType: 'SUPPLIER_INVOICE',
      };

      supplierInvoiceActions
        .unPostInvoice(postingRequestModel)
        .then(res => {
          if (res.status === 200) {
            commonActions.tostifyAlert('success', strings.InvoiceMovedToDraftSuccessfully);
            setLoading(false);
            getOverdue();
            initializeData();
          }
        })
        .catch(() => {
          commonActions.tostifyAlert('error', 'Invoice Moved To Draft Unsuccessfully!');
          setLoading(false);
        });
    },
    [supplierInvoiceActions, commonActions, getOverdue, initializeData]
  );

  const closeInvoice = useCallback(
    (id, status) => {
      if (status === 'Paid') {
        commonActions.tostifyAlert(
          'error',
          'Please delete the payment first to delete the invoice'
        );
      } else {
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={() => {
              setDialog(null);
              supplierInvoiceActions.deleteInvoice(id).then(res => {
                commonActions.tostifyAlert(
                  'success',
                  res.data?.message || 'Supplier Invoice Deleted Successfully'
                );
                initializeData();
              });
            }}
            cancelHandler={() => setDialog(null)}
            message="This Supplier Invoice will be deleted permanently and cannot be recovered."
            message1={<b>{strings.DeleteSupplierInvoice}</b>}
          />
        );
      }
    },
    [supplierInvoiceActions, commonActions, initializeData]
  );

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilterData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const clearAll = () => {
    setFilterData({
      supplierId: '',
      referenceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      amount: '',
      status: '',
      contactType: 1,
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: strings.INVOICENUMBER,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.invoiceNumber}</span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: strings.SUPPLIERNAME,
        cell: ({ row }) => <span className="whitespace-normal">{row.original.supplierName}</span>,
      },
      {
        accessorKey: 'invoiceDate',
        header: strings.INVOICEDATE,
      },
      {
        accessorKey: 'invoiceDueDate',
        header: strings.DUEDATE,
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        cell: ({ row }) => {
          const status = row.original.status;
          let variant = 'secondary';
          if (status === 'Paid') variant = 'success';
          else if (status === 'Draft') variant = 'secondary';
          else if (status === 'Partially Paid') variant = 'warning';
          else if (status === 'Due Today') variant = 'destructive';
          else variant = 'destructive';

          return (
            <div>
              <Badge variant={variant}>{status}</Badge>
              {row.original.dnCreatedOnPaidInvoice &&
                (status === 'Paid' || status === 'Partially Paid') && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    {strings.Debit_Note_Created}
                  </span>
                )}
            </div>
          );
        },
      },
      {
        accessorKey: 'invoiceAmount',
        header: strings.INVOICEAMOUNT,
        cell: ({ row }) => {
          const { invoiceAmount, vatAmount, dueAmount, currencySymbol } = row.original;
          return (
            <div className="text-right text-sm">
              <div>
                <span className="font-semibold">{strings.InvoiceAmount}: </span>
                <span>
                  {currencySymbol}{' '}
                  {invoiceAmount.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {vatAmount > 0 && (
                <div className="text-muted-foreground">
                  <span className="font-semibold">{strings.VatAmount}: </span>
                  <span>
                    {currencySymbol}{' '}
                    {vatAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {dueAmount > 0 && (
                <div className="text-destructive">
                  <span className="font-semibold">{strings.DueAmount}: </span>
                  <span>
                    {currencySymbol}{' '}
                    {dueAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const invoice = row.original;
          const actions = [];

          // Edit action
          if (
            invoice.statusEnum !== 'Paid' &&
            invoice.statusEnum !== 'Sent' &&
            invoice.statusEnum !== 'Partially Paid'
          ) {
            actions.push({
              label: strings.Edit,
              icon: Edit,
              onClick: () => {
                if (invoice.editFlag) {
                  navigate('/admin/expense/supplier-invoice/detail', { state: { id: invoice.id } });
                } else {
                  commonActions.tostifyAlert(
                    'error',
                    'You cannot edit transactions for which VAT is recorded'
                  );
                }
              },
            });
          }

          // Mark as Posted
          if (
            invoice.statusEnum !== 'Sent' &&
            invoice.statusEnum !== 'Paid' &&
            invoice.statusEnum !== 'Partially Paid'
          ) {
            actions.push({
              label: strings.Mark_As_Posted || 'Mark as Posted',
              icon: FileCheck,
              onClick: () => postInvoice(invoice, true),
            });
          }

          // Draft (unpost)
          if (invoice.statusEnum === 'Sent') {
            actions.push({
              label: strings.Draft,
              icon: File,
              onClick: () => {
                if (invoice.editFlag) {
                  unPostInvoice(invoice);
                } else {
                  commonActions.tostifyAlert(
                    'error',
                    'You cannot edit transactions for which VAT is recorded'
                  );
                }
              },
            });
          }

          // Record Payment
          if (
            invoice.statusEnum !== 'Draft' &&
            invoice.statusEnum !== 'Paid' &&
            invoice.exchangeRate === 1
          ) {
            actions.push({
              label: strings.RecordPayment,
              icon: University,
              onClick: () =>
                navigate('/admin/expense/supplier-invoice/record-payment', {
                  state: { id: invoice },
                }),
            });
          }

          // Create Duplicate
          actions.push({
            label: strings.CreateADuplicate,
            icon: Copy,
            onClick: () =>
              navigate('/admin/expense/supplier-invoice/create', {
                state: { parentInvoiceId: invoice.id },
              }),
          });

          // Create Debit Note
          if (
            !invoice.dnCreatedOnPaidInvoice &&
            invoice.statusEnum === 'Paid' &&
            !invoice.remainingInvoiceAmount &&
            config.EXPENSE_TDN
          ) {
            actions.push({
              label: `${strings.Create} ${strings.DebitNote}`,
              icon: CreditCard,
              onClick: () =>
                navigate('/admin/expense/debit-notes/create', { state: { invoiceID: invoice.id } }),
            });
          }

          // View
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/expense/supplier-invoice/view', {
                state: { id: invoice.id, status: invoice.status, contactId: invoice.contactId },
              }),
          });

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, commonActions, postInvoice, unPostInvoice]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!supplier_invoice_list?.data) return [];
    return supplier_invoice_list.data.map(supplier => ({
      id: supplier.id,
      status: supplier.status,
      statusEnum: supplier.statusEnum,
      supplierName: supplier.name,
      dueAmount: supplier.dueAmount,
      contactId: supplier.contactId,
      invoiceNumber: supplier.referenceNumber,
      invoiceDate: supplier.invoiceDate || '',
      invoiceDueDate: supplier.invoiceDueDate || '',
      currencyName: supplier.currencyName || '',
      currencySymbol: supplier.currencySymbol || '',
      invoiceAmount: supplier.totalAmount,
      vatAmount: supplier.totalVatAmount,
      dnCreatedOnPaidInvoice: supplier.dnCreatedOnPaidInvoice,
      editFlag: supplier.editFlag,
      exchangeRate: supplier.exchangeRate,
      remainingInvoiceAmount: supplier.remainingInvoiceAmount,
    }));
  }, [supplier_invoice_list]);

  // Supplier options for filter
  const supplierOptions = useMemo(() => {
    return supplier_list.map(item => ({
      label: item.label?.contactName || item.label,
      value: item.value,
    }));
  }, [supplier_list]);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="supplier-invoice-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.SupplierInvoices}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/expense/supplier-invoice/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewInvoice}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder={`${strings.Select}${strings.Supplier}`}
                  options={selectOptionsFactory.renderOptions(
                    'label',
                    'value',
                    supplierOptions,
                    'Supplier'
                  )}
                  value={filterData.supplierId}
                  onChange={option => handleFilterChange('supplierId', option || '')}
                  isClearable
                />
                <DatePicker
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm input-transition"
                  placeholderText={`${strings.Select}${strings.InvoiceDate}`}
                  selected={filterData.invoiceDate}
                  autoComplete="off"
                  showMonthDropdown
                  showYearDropdown
                  dateFormat="dd-MM-yyyy"
                  dropdownMode="select"
                  onChange={value => handleFilterChange('invoiceDate', value)}
                />
                <DatePicker
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm input-transition"
                  placeholderText={`${strings.Select}${strings.InvoiceDueDate}`}
                  showMonthDropdown
                  minDate={filterData.invoiceDate}
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  autoComplete="off"
                  selected={filterData.invoiceDueDate}
                  onChange={value => handleFilterChange('invoiceDueDate', value)}
                />
                <Input
                  type="number"
                  min="0"
                  value={filterData.amount}
                  placeholder={`${strings.Enter}${strings.Amount}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('amount', e.target.value)}
                />
                <div className="flex gap-2">
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
              pageCount={Math.ceil((supplier_invoice_list?.count || 0) / pagination.pageSize)}
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

export default SupplierInvoice;
