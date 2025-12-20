import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, RefreshCw, FileText, Edit, Eye, Send, CheckCircle, XCircle, FileCheck, Copy, Trash2 } from 'lucide-react';
import Select from 'react-select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal, SentInvoice, ActionDropdownButtons } from 'components';

import * as QuotationAction from './actions';
import * as CustomerInvoiceActions from './../customer_invoice/actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, StatusActionList } from 'utils';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
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
};

/**
 * Get status badge variant
 */
function getStatusBadge(status) {
  switch (status) {
    case 'Draft':
      return { variant: 'secondary', label: status };
    case 'Sent':
      return { variant: 'default', label: status };
    case 'Closed':
      return { variant: 'outline', label: status };
    case 'Posted':
      return { variant: 'default', label: status };
    case 'Approved':
      return { variant: 'success', label: status };
    case 'Rejected':
      return { variant: 'destructive', label: status };
    case 'Invoiced':
      return { variant: 'default', label: status };
    default:
      return { variant: 'warning', label: status };
  }
}

/**
 * Modern Quotation List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Quotation() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const customer_list = useSelector((state) => state.customer_invoice.customer_list);
  const status_list = useSelector((state) => state.supplier_invoice.status_list);
  const quotation_list = useSelector((state) => state.quotation.quotation_list);
  const universal_currency_list = useSelector((state) => state.common.universal_currency_list);

  // Actions
  const quotationActions = useMemo(
    () => bindActionCreators(QuotationAction, dispatch),
    [dispatch]
  );
  const customerInvoiceActions = useMemo(
    () => bindActionCreators(CustomerInvoiceActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
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

    quotationActions
      .getQuotationList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          // Check for preview modal from navigation state
          if (location.state?.id) {
            // Handle preview modal if needed
          }
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [quotationActions, commonActions, filterData, pagination, sorting, location.state]);

  useEffect(() => {
    quotationActions.getStatusList();
    customerInvoiceActions.getCustomerList(filterData.contactType);
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Send mail handler
  const sendMail = useCallback(
    (row, markAsSent, sendAgain) => {
      const { totalAmount, currencyIsoCode, totalVatAmount, id } = row;
      setDialog(
        <SentInvoice
          invoiceAmount={totalAmount || 0}
          id={id}
          currencyName={currencyIsoCode || 'SAR'}
          vatAmount={totalVatAmount || 0}
          markAsSent={markAsSent}
          postingRefType="QUOTATION"
          setState={() => setDialog(null)}
          initializeData={initializeData}
          documentTitle={strings.Quotation}
          unSent={false}
          sendAgain={sendAgain}
          mailPopupCard={!markAsSent || sendAgain}
          zatcaConfirmation={false}
        />
      );
    },
    [initializeData]
  );

  // Change status handler
  const changeStatus = useCallback(
    (id, status) => {
      quotationActions
        .changeStatus(id, status)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              res.data?.message || 'Status Changed Successfully'
            );
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Status Changed Unsuccessfully'
          );
        });
    },
    [quotationActions, commonActions, initializeData]
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
      statusEnum: '',
      contactType: 2,
      contactId: '',
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
        accessorKey: 'quatationNumber',
        header: strings.QUOTATIONNUMBER,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.quatationNumber}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: strings.CUSTOMERNAME,
      },
      {
        accessorKey: 'quotationCreatedDate',
        header: strings.CREATED_DATE,
        cell: ({ row }) => row.original.quotationCreatedDate || '',
      },
      {
        accessorKey: 'quotaionExpiration',
        header: strings.EXPIRATIONDATE,
        cell: ({ row }) => row.original.quotaionExpiration || '',
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
          const { totalAmount, totalVatAmount, currencyIsoCode } = row.original;
          return (
            <div className="text-right">
              <div>
                <span className="font-medium mr-1">{strings.QuotationAmount}:</span>
                <span>
                  {currencyIsoCode}{' '}
                  {(totalAmount || 0).toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {totalVatAmount > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium mr-1">{strings.VatAmount}:</span>
                  <span>
                    {currencyIsoCode}{' '}
                    {totalVatAmount.toLocaleString(navigator.language, {
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
          const quotation = row.original;
          const statuslist = StatusActionList.QuotationStatusActionList.find(
            (obj) => obj.status === quotation.status
          );
          const actionList = statuslist ? statuslist.list : [];

          return (
            <ActionDropdownButtons
              history={{ push: navigate }}
              URL="/admin/income/quotation"
              invoiceData={quotation}
              postingRefType="QUOTATION"
              initializeData={initializeData}
              actionList={actionList}
              invoiceStatus={quotation.status}
              documentTitle={strings.Quotation}
            />
          );
        },
      },
    ],
    [navigate, initializeData]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!quotation_list?.data?.data) return [];
    return quotation_list.data.data.map((quotation) => ({
      id: quotation.id,
      status: quotation.status,
      customerName: quotation.customerName || '',
      quatationNumber: quotation.quatationNumber || '',
      quotaionExpiration: quotation.quotaionExpiration || '',
      quotationCreatedDate: quotation.quotationCreatedDate || '',
      totalAmount: quotation.totalAmount || 0,
      totalVatAmount: quotation.totalVatAmount || 0,
      currencyIsoCode: quotation.currencyIsoCode || '',
    }));
  }, [quotation_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="quotation-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.Quotation}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/income/quotation/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewRequest}
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
              pageCount={Math.ceil((quotation_list?.data?.count || 0) / pagination.pageSize)}
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

export default Quotation;
