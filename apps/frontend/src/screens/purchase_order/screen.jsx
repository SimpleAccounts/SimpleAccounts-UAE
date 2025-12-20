import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  ShoppingCart,
  Edit,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  FileText,
  Package,
} from 'lucide-react';
import Select from 'react-select';
import { ToWords } from 'to-words';
import { upperCase } from 'lodash';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal } from 'components';
import { selectOptionsFactory } from 'utils';

import * as PurchaseOrderAction from '../purchase_order/actions';
import * as PurchaseOrderDetailsAction from './screens/detail/actions';
import * as GoodsReceivedNoteCreateAction from '../goods_received_note/screens/create/actions';
import { CommonActions } from 'services/global';

import CreateGoodsReceivedNote from './sections/createGRN';
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
 * Modern Purchase Order List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function PurchaseOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const supplier_list = useSelector((state) => state.purchase_order.supplier_list);
  const status_list = useSelector((state) => state.supplier_invoice.status_list);
  const purchase_order_list = useSelector((state) => state.purchase_order.purchase_order_list);
  const universal_currency_list = useSelector((state) => state.common.universal_currency_list);

  // Actions
  const purchaseOrderAction = useMemo(
    () => bindActionCreators(PurchaseOrderAction, dispatch),
    [dispatch]
  );
  const purchaseOrderDetailsAction = useMemo(
    () => bindActionCreators(PurchaseOrderDetailsAction, dispatch),
    [dispatch]
  );
  const goodsReceivedNoteCreateAction = useMemo(
    () => bindActionCreators(GoodsReceivedNoteCreateAction, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [openGoodsReceivedNotes, setOpenGoodsReceivedNotes] = useState(false);
  const [selectedData, setSelectedData] = useState({});
  const [rowId, setRowId] = useState(null);
  const [prefixData, setPrefixData] = useState(null);

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

    purchaseOrderAction
      .getpoList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [purchaseOrderAction, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    purchaseOrderAction.getStatusList();
    goodsReceivedNoteCreateAction.getInvoiceNo().then((response) => {
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
      purchaseOrderAction
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
    [purchaseOrderAction, commonActions, initializeData]
  );

  // Send mail handler
  const sendMail = useCallback(
    (row) => {
      setLoading(true);
      const postingRequestModel = {
        postingRefId: row.id,
        amountInWords: upperCase(
          row.currencyName + ' ' + toWords.convert(row.totalAmount)
        ).replace('POINT', 'AND'),
        vatInWords: row.totalVatAmount
          ? upperCase(row.currencyName + ' ' + toWords.convert(row.totalVatAmount)).replace(
              'POINT',
              'AND'
            )
          : '-',
      };
      purchaseOrderAction
        .sendMail(postingRequestModel)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              res.data?.message || 'Purchase Order Sent Successfully'
            );
            setLoading(false);
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Purchase Order Sent Unsuccessfully'
          );
          setLoading(false);
        });
    },
    [purchaseOrderAction, commonActions, initializeData]
  );

  // Open GRN modal
  const renderActionForState = useCallback(
    (id) => {
      purchaseOrderDetailsAction.getPOById(id).then((res) => {
        setSelectedData(res.data);
        setRowId(id);
        setOpenGoodsReceivedNotes(true);
      });
    },
    [purchaseOrderDetailsAction]
  );

  // Get next GRN number
  const getNextGrnNo = useCallback(() => {
    goodsReceivedNoteCreateAction.getInvoiceNo().then((response) => {
      setPrefixData(response.data);
    });
  }, [goodsReceivedNoteCreateAction]);

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
      supplierId: '',
      contactType: 1,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Transform supplier list for select
  const supplierOptions = useMemo(() => {
    if (!supplier_list) return [];
    return supplier_list.map((item) => ({
      label: item.label?.contactName || item.label,
      value: item.value,
    }));
  }, [supplier_list]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'poNumber',
        header: strings.PONUMBER,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.poNumber}</span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: strings.SUPPLIERNAME,
      },
      {
        accessorKey: 'poApproveDate',
        header: strings.PODATE,
        cell: ({ row }) => row.original.poApproveDate || '',
      },
      {
        accessorKey: 'poReceiveDate',
        header: strings.POEXPIRYDATE,
        cell: ({ row }) => row.original.poReceiveDate || '',
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
                <span className="font-medium mr-1">{strings.PurchaseOrder} {strings.Amount}:</span>
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
          const po = row.original;
          const actions = [];

          // Edit (Draft only)
          if (po.status === 'Draft') {
            actions.push({
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/expense/purchase-order/detail', {
                  state: { id: po.id },
                }),
            });
          }

          // Create GRN (Approved only)
          if (po.status === 'Approved') {
            actions.push({
              label: strings.CreateGRN,
              icon: Package,
              onClick: () =>
                navigate('/admin/expense/goods-received-note/create', {
                  state: { poId: po.id, poNumber: po.poNumber },
                }),
            });
          }

          // Create Supplier Invoice (Approved only)
          if (po.status === 'Approved') {
            actions.push({
              label: strings.CreateSupplierInvoice,
              icon: FileText,
              onClick: () =>
                navigate('/admin/expense/supplier-invoice/create', {
                  state: { poId: po.id },
                }),
            });
          }

          // Send (Draft only)
          if (po.status === 'Draft') {
            actions.push({
              label: strings.Send,
              icon: Send,
              onClick: () => sendMail(po),
            });
            actions.push({
              label: 'Mark As Sent',
              icon: Send,
              onClick: () => changeStatus(po.id, 'Sent'),
            });
          }

          // Send Again (Sent only)
          if (po.status === 'Sent') {
            actions.push({
              label: strings.SendAgain,
              icon: Send,
              onClick: () => sendMail(po),
            });
          }

          // Mark As Approved
          if (!['Draft', 'Approved', 'Closed', 'Invoiced'].includes(po.status)) {
            actions.push({
              label: strings.MarkAsApproved,
              icon: CheckCircle,
              onClick: () => changeStatus(po.id, 'Approved'),
            });
          }

          // Mark As Rejected
          if (!['Draft', 'Rejected', 'Closed', 'Invoiced'].includes(po.status)) {
            actions.push({
              label: strings.MarkAsRejected,
              icon: XCircle,
              onClick: () => changeStatus(po.id, 'Rejected'),
            });
          }

          // Create Duplicate
          actions.push({
            label: strings.CreateADuplicate,
            icon: Copy,
            onClick: () =>
              navigate('/admin/expense/purchase-order/create', {
                state: { parentId: po.id },
              }),
          });

          // View
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/expense/purchase-order/view', {
                state: { id: po.id, status: po.status },
              }),
          });

          // Close
          if (['Approved', 'Sent', 'Rejected', 'Invoiced'].includes(po.status)) {
            actions.push({ type: 'separator' });
            actions.push({
              label: strings.Close,
              icon: XCircle,
              onClick: () => changeStatus(po.id, 'Closed'),
              variant: 'destructive',
            });
          }

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, sendMail, changeStatus]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!purchase_order_list?.data?.data) return [];
    return purchase_order_list.data.data.map((supplier) => ({
      id: supplier.id,
      status: supplier.status,
      supplierName: supplier.supplierName || '',
      poNumber: supplier.poNumber || '',
      poApproveDate: supplier.poApproveDate || '',
      poReceiveDate: supplier.poReceiveDate || '',
      totalAmount: supplier.totalAmount || 0,
      totalVatAmount: supplier.totalVatAmount || 0,
      currencyCode: supplier.currencyCode || '',
      currencyName: supplier.currencyName || '',
    }));
  }, [purchase_order_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="purchase-order-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.PurchaseOrder}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/expense/purchase-order/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewPurchaseOrder}
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
                  onChange={(option) => {
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
                (purchase_order_list?.data?.count || 0) / pagination.pageSize
              )}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>

        <CreateGoodsReceivedNote
          openGoodsReceivedNotes={openGoodsReceivedNotes}
          closeGoodsReceivedNotes={() => setOpenGoodsReceivedNotes(false)}
          id={rowId}
          selectedData={selectedData}
          prefixData={prefixData}
          getVat={purchaseOrderAction.getVatList()}
          getProductList={purchaseOrderAction.getProductList()}
          getNextGrnNo={getNextGrnNo}
          createGRN={goodsReceivedNoteCreateAction.createGNR}
        />
      </div>
    </div>
  );
}

export default PurchaseOrder;
