import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { upperCase } from 'lodash-es';
import { ToWords } from 'to-words';
import { Plus, Search, RefreshCw, FileText, Eye, Edit, Copy, FileCheck, Send, University, CreditCard, File } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions, commonActions as tableActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal, SentInvoice } from 'components';
import { selectOptionsFactory } from 'utils';

import EmailModal from './sections/email_template';
import * as CustomerInvoiceDetailActions from './screens/detail/actions';
import * as CustomerInvoiceActions from './actions';
import * as CreditNotesActions from '../creditNotes/screens/create/actions';
import { CommonActions } from 'services/global';
import { CreateCreditNoteModal } from './sections';
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
 * Modern Customer Invoice List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function CustomerInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const customer_invoice_list = useSelector((state) => state.customer_invoice.customer_invoice_list);
  const customer_list = useSelector((state) => state.customer_invoice.customer_list);
  const status_list = useSelector((state) => state.customer_invoice.status_list);
  const universal_currency_list = useSelector((state) => state.common.universal_currency_list);

  // Actions
  const customerInvoiceActions = useMemo(
    () => bindActionCreators(CustomerInvoiceActions, dispatch),
    [dispatch]
  );
  const customerInvoiceDetailActions = useMemo(
    () => bindActionCreators(CustomerInvoiceDetailActions, dispatch),
    [dispatch]
  );
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
    referenceNumber: '',
    invoiceDate: '',
    invoiceDueDate: '',
    amount: '',
    status: '',
    contactType: 2,
  });

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [rowId, setRowId] = useState('');
  const [selectedData, setSelectedData] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalVatAmount, setTotalVatAmount] = useState(0);
  const [totalExciseAmount, setTotalExciseAmount] = useState(0);
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

    customerInvoiceActions
      .getCustomerInvoiceList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          if (location.state?.id) {
            // Handle preview modal if needed
          }
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [customerInvoiceActions, commonActions, filterData, pagination, sorting, location.state?.id]);

  const getOverdue = useCallback(() => {
    customerInvoiceActions
      .getOverdueAmountDetails(filterData.contactType)
      .then((res) => {
        if (res.status === 200) {
          setOverDueAmountDetails(res.data);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [customerInvoiceActions, commonActions, filterData.contactType]);

  useEffect(() => {
    customerInvoiceActions.getStatusList();
    customerInvoiceActions.getCustomerList(filterData.contactType);
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
        postingRefType: 'INVOICE',
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
      setLoadingMsg('Customer Invoice Posting...');

      customerInvoiceActions
        .postInvoice(postingRequestModel)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              markAsSent ? strings.InvoiceStatusChangedSuccessfully : strings.InvoiceSentSuccessfully
            );
            setLoading(false);
            getOverdue();
            initializeData();
          }
        })
        .catch(() => {
          commonActions.tostifyAlert('error', 'Customer Invoice Posted Unsuccessfully');
          setLoading(false);
        });
    },
    [customerInvoiceActions, commonActions, getOverdue, initializeData]
  );

  const unPostInvoice = useCallback(
    (row) => {
      setLoading(true);
      const postingRequestModel = {
        amount: row.invoiceAmount,
        postingRefId: row.id,
        postingRefType: 'INVOICE',
      };

      customerInvoiceActions
        .unPostInvoice(postingRequestModel)
        .then((res) => {
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
    [customerInvoiceActions, commonActions, getOverdue, initializeData]
  );

  const sendMail = useCallback(
    (row, markAsSent, sendAgain) => {
      const { invoiceAmount, currencySymbol, vatAmount, id } = row;
      setDialog(
        <SentInvoice
          invoiceAmount={invoiceAmount || 0}
          id={id}
          currencyName={currencySymbol || 'SAR'}
          vatAmount={vatAmount || 0}
          markAsSent={markAsSent}
          postingRefType="INVOICE"
          setState={() => {
            setDialog(null);
          }}
          initializeData={initializeData}
          documentTitle={strings.CustomerInvoice}
          unSent={false}
          sendAgain={sendAgain}
          mailPopupCard={!markAsSent || sendAgain}
          zatcaConfirmation={false}
        />
      );
    },
    [initializeData]
  );

  const closeInvoice = useCallback(
    (id, status) => {
      if (status === 'Paid') {
        commonActions.tostifyAlert('error', 'Please delete the receipt first to delete the invoice');
      } else {
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={() => {
              setDialog(null);
              customerInvoiceActions.deleteInvoice(id).then((res) => {
                commonActions.tostifyAlert(
                  'success',
                  res.data?.message || 'Customer Invoice Deleted Successfully'
                );
                initializeData();
              });
            }}
            cancelHandler={() => setDialog(null)}
            message="This Customer Invoice will be deleted permanently and cannot be recovered."
            message1={<b>{strings.DeleteCustomerInvoice}</b>}
          />
        );
      }
    },
    [customerInvoiceActions, commonActions, initializeData]
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
      referenceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      amount: '',
      status: '',
      contactType: 2,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
        accessorKey: 'customerName',
        header: strings.CUSTOMERNAME,
        cell: ({ row }) => <span className="whitespace-normal">{row.original.customerName}</span>,
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
              {row.original.cnCreatedOnPaidInvoice &&
                (status === 'Paid' || status === 'Partially Paid') && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    {strings.Credit_Note_Created}
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
                  navigate('/admin/income/customer-invoice/detail', { state: { id: invoice.id } });
                } else {
                  commonActions.tostifyAlert(
                    'error',
                    'You cannot edit transactions for which VAT is recorded'
                  );
                }
              },
            });
          }

          // Mark as Sent
          if (
            invoice.statusEnum !== 'Sent' &&
            invoice.statusEnum !== 'Paid' &&
            invoice.statusEnum !== 'Partially Paid'
          ) {
            actions.push({
              label: strings.Mark_As_Sent,
              icon: FileCheck,
              onClick: () => postInvoice(invoice, true),
            });
          }

          // Send
          if (
            invoice.statusEnum !== 'Sent' &&
            invoice.statusEnum !== 'Paid' &&
            invoice.statusEnum !== 'Partially Paid'
          ) {
            actions.push({
              label: strings.Send,
              icon: Send,
              onClick: () => sendMail(invoice, false, false),
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
                navigate('/admin/income/customer-invoice/record-payment', { state: { id: invoice } }),
            });
          }

          // Create Duplicate
          actions.push({
            label: strings.CreateADuplicate,
            icon: Copy,
            onClick: () =>
              navigate('/admin/income/customer-invoice/create', {
                state: { parentInvoiceId: invoice.id },
              }),
          });

          // Create Credit Note
          if (
            !invoice.cnCreatedOnPaidInvoice &&
            invoice.statusEnum === 'Paid' &&
            !invoice.remainingInvoiceAmount &&
            config.INCOME_TCN
          ) {
            actions.push({
              label: `${strings.Create} ${strings.CreditNote}`,
              icon: CreditCard,
              onClick: () =>
                navigate('/admin/income/credit-notes/create', { state: { invoiceID: invoice.id } }),
            });
          }

          // View
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/income/customer-invoice/view', {
                state: { id: invoice.id, status: invoice.status, contactId: invoice.contactId },
              }),
          });

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, commonActions, postInvoice, unPostInvoice, sendMail]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!customer_invoice_list?.data) return [];
    return customer_invoice_list.data.map((customer) => ({
      id: customer.id,
      status: customer.status,
      statusEnum: customer.statusEnum,
      customerName: customer.name,
      dueAmount: customer.dueAmount,
      contactId: customer.contactId,
      invoiceNumber: customer.referenceNumber,
      invoiceDate: customer.invoiceDate || '',
      invoiceDueDate: customer.invoiceDueDate || '',
      currencyName: customer.currencyName || '',
      currencySymbol: customer.currencySymbol || '',
      invoiceAmount: customer.totalAmount,
      vatAmount: customer.totalVatAmount,
      cnCreatedOnPaidInvoice: customer.cnCreatedOnPaidInvoice,
      editFlag: customer.editFlag,
      exchangeRate: customer.exchangeRate,
      remainingInvoiceAmount: customer.remainingInvoiceAmount,
    }));
  }, [customer_invoice_list]);

  // Customer options for filter
  const customerOptions = useMemo(() => {
    return customer_list.map((item) => ({
      label: item.label?.contactName || item.label,
      value: item.value,
    }));
  }, [customer_list]);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="customer-invoice-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.CustomerInvoices}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/income/customer-invoice/create')}
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
                  placeholder={`${strings.Select}${strings.Customer}`}
                  options={selectOptionsFactory.renderOptions('label', 'value', customerOptions, 'Customer')}
                  value={filterData.customerId}
                  onChange={(option) => handleFilterChange('customerId', option || '')}
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
                  onChange={(value) => handleFilterChange('invoiceDate', value)}
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
                  onChange={(value) => handleFilterChange('invoiceDueDate', value)}
                />
                <Input
                  type="number"
                  min="0"
                  value={filterData.amount}
                  placeholder={`${strings.Enter}${strings.Amount}`}
                  className="input-transition"
                  onChange={(e) => handleFilterChange('amount', e.target.value)}
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
              pageCount={Math.ceil((customer_invoice_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>

        {/* Credit Note Modal */}
        <CreateCreditNoteModal
          openModal={openModal}
          closeModal={() => {
            setOpenModal(false);
            initializeData();
          }}
          updateParentAmount={(amount, vat, excise) => {
            setTotalAmount(amount);
            setTotalVatAmount(vat);
            setTotalExciseAmount(excise);
          }}
          updateParentSelelectedData={setSelectedData}
          id={rowId}
          selectedData={selectedData}
          createCreditNote={creditNotesActions.createCreditNote}
          totalAmount={totalAmount}
          totalVatAmount={totalVatAmount}
          totalExciseAmount={totalExciseAmount}
        />
      </div>
    </div>
  );
}

export default CustomerInvoice;
