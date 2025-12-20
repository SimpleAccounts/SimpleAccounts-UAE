import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, RefreshCw, Package, Edit, Eye, Send, Copy } from 'lucide-react';
import Select from 'react-select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader } from 'components';
import { selectOptionsFactory } from 'utils';

import * as GoodsReceivedNoteAction from './actions';
import { CommonActions } from 'services/global';

import EmailModal from '../customer_invoice/sections/email_template';
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
    case 'Posted':
      return { variant: 'success', label: status };
    default:
      return { variant: 'warning', label: status };
  }
}

/**
 * Modern Goods Received Note List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function GoodsReceivedNote() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const supplier_list = useSelector((state) => state.goods_received_note.supplier_list);
  const goods_received_note_list = useSelector(
    (state) => state.goods_received_note.goods_received_note_list
  );

  // Actions
  const goodsReceivedNoteAction = useMemo(
    () => bindActionCreators(GoodsReceivedNoteAction, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [openEmailModal, setOpenEmailModal] = useState(false);

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

    goodsReceivedNoteAction
      .getGRNList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [goodsReceivedNoteAction, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    goodsReceivedNoteAction.getStatusList();
    goodsReceivedNoteAction.getSupplierList(filterData.contactType);
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Change status handler
  const changeStatus = useCallback(
    (id, status) => {
      goodsReceivedNoteAction.changeStatus(id, status).then((res) => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', res.data?.message);
          initializeData();
        }
      });
    },
    [goodsReceivedNoteAction, commonActions, initializeData]
  );

  // Send mail handler
  const sendMail = useCallback(
    (id) => {
      goodsReceivedNoteAction
        .sendMail(id)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              res.data?.message || 'Send Successfully'
            );
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Send Unsuccessfully'
          );
        });
    },
    [goodsReceivedNoteAction, commonActions, initializeData]
  );

  // Post GRN handler
  const postGrn = useCallback(
    (id) => {
      goodsReceivedNoteAction
        .postGRN(id)
        .then((res) => {
          if (res.status === 200) {
            commonActions.tostifyAlert(
              'success',
              res.data?.message || 'Posted Successfully'
            );
            initializeData();
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err?.data?.message || 'Post Unsuccessfully'
          );
        });
    },
    [goodsReceivedNoteAction, commonActions, initializeData]
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
        accessorKey: 'grnNumber',
        header: strings.GRNNUMBER,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.grnNumber}</span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: strings.SUPPLIERNAME,
      },
      {
        accessorKey: 'grnReceiveDate',
        header: strings.GRNRECEIVEDATE,
        cell: ({ row }) => row.original.grnReceiveDate || '',
      },
      {
        accessorKey: 'grnRemarks',
        header: strings.GRNREMARKS,
        cell: ({ row }) => (
          <span className="line-clamp-2">{row.original.grnRemarks}</span>
        ),
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
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const grn = row.original;
          const actions = [];

          // Edit (not Posted and not Closed)
          if (grn.status !== 'Posted' && grn.status !== 'Closed') {
            actions.push({
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/expense/goods-received-note/detail', {
                  state: { id: grn.id },
                }),
            });
          }

          // Send (not Draft and not Closed)
          if (grn.status !== 'Draft' && grn.status !== 'Closed') {
            actions.push({
              label: strings.Send,
              icon: Send,
              onClick: () => sendMail(grn.id),
            });
          }

          // Mark As Sent (Draft only)
          if (grn.status === 'Draft') {
            actions.push({
              label: 'Mark As Sent',
              icon: Send,
              onClick: () => changeStatus(grn.id, 'Sent'),
            });
            actions.push({
              label: strings.Send,
              icon: Send,
              onClick: () => postGrn(grn.id),
            });
          }

          // Create Duplicate
          actions.push({
            label: strings.CreateADuplicate,
            icon: Copy,
            onClick: () =>
              navigate('/admin/expense/goods-received-note/create', {
                state: { parentId: grn.id },
              }),
          });

          // View
          actions.push({
            label: strings.View,
            icon: Eye,
            onClick: () =>
              navigate('/admin/expense/goods-received-note/view', {
                state: { id: grn.id, status: grn.status },
              }),
          });

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, sendMail, changeStatus, postGrn]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!goods_received_note_list?.data?.data) return [];
    return goods_received_note_list.data.data.map((item) => ({
      id: item.id,
      status: item.status || '',
      supplierName: item.supplierName || '',
      grnNumber: item.grnNumber || '',
      grnRemarks: item.grnRemarks || '',
      grnReceiveDate: item.grnReceiveDate || '',
      totalAmount: item.totalAmount || 0,
      totalVatAmount: item.totalVatAmount || 0,
    }));
  }, [goods_received_note_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="goods-received-note-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.GoodsReceivedNotes}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/expense/goods-received-note/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewGoodsReceivedNotes}
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
                (goods_received_note_list?.data?.count || 0) / pagination.pageSize
              )}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>

        <EmailModal
          openEmailModal={openEmailModal}
          closeEmailModal={() => setOpenEmailModal(false)}
        />
      </div>
    </div>
  );
}

export default GoodsReceivedNote;
