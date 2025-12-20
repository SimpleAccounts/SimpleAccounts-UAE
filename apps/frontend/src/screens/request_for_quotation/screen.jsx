import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  FileText,
  Edit,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  ShoppingCart,
} from 'lucide-react';
import Select from 'react-select';
import { ToWords } from 'to-words';
import { upperCase } from 'lodash-es';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal } from 'components';
import { selectOptionsFactory } from 'utils';

import * as RequestForQuotationDetailsAction from './screens/detail/actions';
import * as RequestForQuotationCreateAction from './screens/create/actions';
import * as RequestForQuotationAction from '../request_for_quotation/actions';
import * as PurchaseOrderCreateAction from '../purchase_order/screens/create/actions';
import * as PurchaseOrderAction from '../purchase_order/actions';
import { CommonActions } from 'services/global';

import CreatePurchaseOrder from './sections/createPo';
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
  menu: base => ({
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
  singleValue: base => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: base => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
};

/**
 * Get status badge variant
 */
function getStatusBadge(status) {
  switch (status) {
    case 'Approved':
      return { variant: 'success', label: status };
    case 'Draft':
      return { variant: 'secondary', label: status };
    case 'Closed':
      return { variant: 'outline', label: status };
    case 'Sent':
      return { variant: 'default', label: status };
    case 'Rejected':
      return { variant: 'destructive', label: status };
    case 'Invoiced':
      return { variant: 'default', label: status };
    default:
      return { variant: 'warning', label: status };
  }
}

/**
 * Modern Request For Quotation List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function RequestForQuotation() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const supplier_list = useSelector(state => state.request_for_quotation.supplier_list);
  const request_for_quotation_list = useSelector(
    state => state.request_for_quotation.request_for_quotation_list
  );
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);

  // Actions
  const requestForQuotationAction = useMemo(
    () => bindActionCreators(RequestForQuotationAction, dispatch),
    [dispatch]
  );
  const requestForQuotationDetailsAction = useMemo(
    () => bindActionCreators(RequestForQuotationDetailsAction, dispatch),
    [dispatch]
  );
  const purchaseOrderCreateAction = useMemo(
    () => bindActionCreators(PurchaseOrderCreateAction, dispatch),
    [dispatch]
  );
  const purchaseOrderAction = useMemo(
    () => bindActionCreators(PurchaseOrderAction, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [openPurchaseOrder, setOpenPurchaseOrder] = useState(false);
  const [selectedData, setSelectedData] = useState({});
  const [rowId, setRowId] = useState(null);
  const [prefixData, setPrefixData] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalVatAmount, setTotalVatAmount] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  // Filter state
  const [filterData, setFilterData] = useState({
    supplierId: '',
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

    requestForQuotationAction
      .getRFQList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [requestForQuotationAction, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    requestForQuotationAction.getStatusList();
    requestForQuotationAction.getSupplierList(filterData.contactType);
    purchaseOrderCreateAction.getPoNo().then(response => {
      setPrefixData(response.data);
    });
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Change status handler
  const changeStatus = useCallback(
    (id, status) => {
      requestForQuotationAction
        .changeStatus(id, status)
        .then(res => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              res.data?.message || 'Status Changed Successfully'
            );
            initializeData();
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Status Changed Unsuccessfully'
          );
        });
    },
    [requestForQuotationAction, commonActions, initializeData]
  );

  // Send mail handler
  const sendMail = useCallback(
    row => {
      setLoading(true);
      setLoadingMsg('Sending Request For Quotation...');
      const postingRequestModel = {
        postingRefId: row.id,
        amountInWords: upperCase(row.currencyName + ' ' + toWords.convert(row.totalAmount)).replace(
          'POINT',
          'AND'
        ),
        vatInWords: row.totalVatAmount
          ? upperCase(row.currencyName + ' ' + toWords.convert(row.totalVatAmount)).replace(
              'POINT',
              'AND'
            )
          : '-',
      };
      requestForQuotationAction
        .sendMail(postingRequestModel)
        .then(res => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              res.data?.message || 'Request For Quotation Sent Successfully'
            );
            setLoading(false);
            initializeData();
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Request For Quotation Sent Unsuccessfully'
          );
          setLoading(false);
        });
    },
    [requestForQuotationAction, commonActions, initializeData]
  );

  // Open PO modal
  const renderActionForState = useCallback(
    id => {
      purchaseOrderAction.getVatList();
      purchaseOrderAction.getProductList();
      requestForQuotationDetailsAction.getRFQeById(id).then(res => {
        setSelectedData(res.data);
        setRowId(id);
        setOpenPurchaseOrder(true);
        setTotalAmount(res.data.totalAmount || 0);
        setTotalVatAmount(res.data.totalVatAmount || 0);
      });
    },
    [purchaseOrderAction, requestForQuotationDetailsAction]
  );

  // Get next PO number
  const getNextTemplateNo = useCallback(() => {
    purchaseOrderCreateAction.getPoNo().then(response => {
      setPrefixData(response.data);
    });
  }, [purchaseOrderCreateAction]);

  // Update parent amount
  const updateParentAmount = useCallback((total, vat) => {
    setTotalAmount(total);
    setTotalVatAmount(vat);
  }, []);

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
      contactType: 1,
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Transform supplier list for select
  const supplierOptions = useMemo(() => {
    if (!supplier_list) return [];
    return supplier_list.map(item => ({
      label: item.label?.contactName || item.label,
      value: item.value,
    }));
  }, [supplier_list]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'rfqNumber',
        header: strings.RFQNUMBER,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.rfqNumber}</span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: strings.SUPPLIERNAME,
      },
      {
        accessorKey: 'rfqReceiveDate',
        header: strings.RFQDATE,
        cell: ({ row }) => row.original.rfqReceiveDate || '',
      },
      {
        accessorKey: 'rfqExpiryDate',
        header: strings.RFQDUEDATE,
        cell: ({ row }) => row.original.rfqExpiryDate || '',
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
          const { totalAmount, totalVatAmount, currencyCode } = row.original;
          return (
            <div className="text-right">
              <div>
                <span className="font-medium mr-1">{strings.RFQAmount}:</span>
                <span>
                  {currencyCode}{' '}
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
                    {currencyCode}{' '}
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
          const rfq = row.original;
          const actions = [];

          // Edit (Draft only)
          if (!['Sent', 'Closed', 'Approved', 'Rejected', 'Invoiced'].includes(rfq.status)) {
            actions.push({
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/expense/request-for-quotation/detail', {
                  state: { id: rfq.id },
                }),
            });
          }

          // Create PO (not Draft, Sent, Rejected, Closed, Invoiced)
          if (!['Draft', 'Sent', 'Rejected', 'Closed', 'Invoiced'].includes(rfq.status)) {
            actions.push({
              label: strings.CreatePO,
              icon: ShoppingCart,
              onClick: () =>
                navigate('/admin/expense/purchase-order/create', {
                  state: { rfqId: rfq.id, rfqNumber: rfq.rfqNumber },
                }),
            });
          }

          // Create Supplier Invoice (Approved only)
          if (rfq.status === 'Approved') {
            actions.push({
              label: strings.CreateSupplierInvoice,
              icon: FileText,
              onClick: () =>
                navigate('/admin/expense/supplier-invoice/create', {
                  state: { rfqId: rfq.id },
                }),
            });
          }

          // Send (not Closed, Approved, Rejected, Invoiced)
          if (!['Closed', 'Approved', 'Rejected', 'Invoiced'].includes(rfq.status)) {
            actions.push({
              label: strings.Send,
              icon: Send,
              onClick: () => sendMail(rfq),
            });
          }

          // Mark As Sent (Draft only)
          if (rfq.status === 'Draft') {
            actions.push({
              label: 'Mark As Sent',
              icon: Send,
              onClick: () => changeStatus(rfq.id, 'Sent'),
            });
          }

          // Mark As Approved
          if (!['Draft', 'Approved', 'Closed', 'Invoiced'].includes(rfq.status)) {
            actions.push({
              label: strings.MarkAsApproved,
              icon: CheckCircle,
              onClick: () => changeStatus(rfq.id, 'Approved'),
            });
          }

          // Mark As Rejected
          if (!['Draft', 'Rejected', 'Closed', 'Invoiced'].includes(rfq.status)) {
            actions.push({
              label: strings.MarkAsRejected,
              icon: XCircle,
              onClick: () => changeStatus(rfq.id, 'Rejected'),
            });
          }

          // Close
          if (['Sent', 'Approved', 'Rejected', 'Invoiced'].includes(rfq.status)) {
            actions.push({
              label: strings.Close,
              icon: XCircle,
              onClick: () => changeStatus(rfq.id, rfq.statusEnum),
            });
          }

          // Create Duplicate
          actions.push({
            label: strings.CreateADuplicate,
            icon: Copy,
            onClick: () =>
              navigate('/admin/expense/request-for-quotation/create', {
                state: { parentId: rfq.id },
              }),
          });

          // View
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/expense/request-for-quotation/view', {
                state: { id: rfq.id, status: rfq.status },
              }),
          });

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, sendMail, changeStatus]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!request_for_quotation_list?.data?.data) return [];
    return request_for_quotation_list.data.data.map(supplier => ({
      id: supplier.id,
      status: supplier.status || '',
      supplierName: supplier.supplierName || '',
      rfqNumber: supplier.rfqNumber || '',
      rfqReceiveDate: supplier.rfqReceiveDate || '',
      rfqExpiryDate: supplier.rfqExpiryDate || '',
      totalAmount: supplier.totalAmount || 0,
      totalVatAmount: supplier.totalVatAmount || 0,
      currencyCode: supplier.currencyCode || '',
      currencyName: supplier.currencyName || '',
      statusEnum: supplier.statusEnum || '',
    }));
  }, [request_for_quotation_list]);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="request-for-quotation-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.RequestForQuotation}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/expense/request-for-quotation/create')}
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
                  placeholder={`${strings.Select} ${strings.Supplier}`}
                  isClearable
                  options={
                    supplierOptions
                      ? selectOptionsFactory.renderOptions(
                          'label',
                          'value',
                          supplierOptions,
                          'Supplier Name'
                        )
                      : []
                  }
                  value={filterData.supplierId}
                  onChange={option => {
                    handleFilterChange('supplierId', option || '');
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
              pageCount={Math.ceil(
                (request_for_quotation_list?.data?.count || 0) / pagination.pageSize
              )}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>

        <CreatePurchaseOrder
          openPurchaseOrder={openPurchaseOrder}
          closePurchaseOrder={() => setOpenPurchaseOrder(false)}
          updateParentAmount={updateParentAmount}
          id={rowId}
          selectedData={selectedData}
          prefixData={prefixData}
          createPO={purchaseOrderCreateAction.createPO}
          totalAmount={totalAmount}
          getNextTemplateNo={getNextTemplateNo}
          totalVatAmount={totalVatAmount}
        />
      </div>
    </div>
  );
}

export default RequestForQuotation;
