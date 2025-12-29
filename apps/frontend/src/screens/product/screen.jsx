import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Package, Edit } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, Currency } from 'components';

import * as ProductActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

// Neumorphic theme constants
const theme = {
  bg: '#e8eef5',
  primary: '#2064d8',
  primaryDark: '#1a4fa8',
  secondary: '#21d8aa',
  warning: '#f59e0b',
  danger: '#ff4d6a',
  textPrimary: '#1e3a5f',
  textSecondary: '#3d5a80',
  textMuted: '#98afc2',
  shadowDark: '#c4c9cf',
  shadowLight: '#ffffff',
};

const shadows = {
  raised: {
    sm: `3px 3px 6px ${theme.shadowDark}, -3px -3px 6px ${theme.shadowLight}`,
    md: `4px 4px 8px ${theme.shadowDark}, -4px -4px 8px ${theme.shadowLight}`,
    lg: `6px 6px 12px ${theme.shadowDark}, -6px -6px 12px ${theme.shadowLight}`,
    xs: `2px 2px 4px ${theme.shadowDark}, -2px -2px 4px ${theme.shadowLight}`,
  },
  pressed: {
    sm: `inset 2px 2px 4px ${theme.shadowDark}, inset -2px -2px 4px ${theme.shadowLight}`,
    md: `inset 3px 3px 6px ${theme.shadowDark}, inset -3px -3px 6px ${theme.shadowLight}`,
  },
};

/**
 * Modern Product List Screen
 * Uses functional components with Neumorphic design
 */
function Product() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const product_list = useSelector(state => state.product.product_list);
  const vat_list = useSelector(state => state.product.vat_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);

  // Actions
  const productActions = useMemo(() => bindActionCreators(ProductActions, dispatch), [dispatch]);
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
    name: '',
    productCode: '',
    vatPercentage: '',
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

    productActions
      .getProductList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [productActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    productActions.getProductVatCategoryList();
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Navigate to detail
  const goToDetail = useCallback(
    row => {
      navigate('/admin/master/product/detail', { state: { id: row.id } });
    },
    [navigate]
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
      name: '',
      productCode: '',
      vatPercentage: '',
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Get currency symbol
  const getCurrencySymbol = useMemo(() => {
    return universal_currency_list?.[0]?.currencyIsoCode || 'USD';
  }, [universal_currency_list]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'productCode',
        header: strings.PRODUCTCODE,
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {row.original.productCode}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: strings.PRODUCTNAME,
        cell: ({ row }) => (
          <span className="font-medium" style={{ color: theme.primary }}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'productType',
        header: strings.ProductType,
        cell: ({ row }) => {
          const { productType, exciseTaxId } = row.original;
          const displayType = exciseTaxId ? `EXCISE ${productType}` : productType || '';
          return <span style={{ color: theme.textSecondary }}>{displayType}</span>;
        },
      },
      {
        accessorKey: 'isInventoryEnabled',
        header: strings.Inventory,
        cell: ({ row }) => {
          const isEnabled = row.original.isInventoryEnabled;
          return (
            <span
              className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: isEnabled ? `${theme.secondary}15` : `${theme.danger}15`,
                color: isEnabled ? theme.secondary : theme.danger,
              }}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          );
        },
      },
      {
        accessorKey: 'unitPrice',
        header: strings.UNITPRICE,
        cell: ({ row }) => (
          <div className="text-right" style={{ color: theme.textPrimary }}>
            <Currency value={row.original.unitPrice || 0} currencySymbol={getCurrencySymbol} />
          </div>
        ),
      },
      {
        accessorKey: 'vatPercentage',
        header: `${strings.VAT} ${strings.Type}`,
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.vatPercentage}</span>
        ),
      },
      {
        accessorKey: 'exciseTax',
        header: 'Excise Slab',
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.exciseTax || '-'}</span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <span
              className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: isActive ? `${theme.secondary}15` : `${theme.danger}15`,
                color: isActive ? theme.secondary : theme.danger,
              }}
            >
              {isActive ? 'Active' : 'InActive'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const product = row.original;
          const actions = [
            {
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/master/product/detail', {
                  state: { id: product.id },
                }),
            },
          ];

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, getCurrencySymbol]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!product_list?.data) return [];
    return product_list.data.map(product => ({
      id: product.id,
      productCode: product.productCode || '',
      name: product.name || '',
      productType: product.productType || '',
      isInventoryEnabled: product.isInventoryEnabled,
      unitPrice: product.unitPrice || 0,
      vatPercentage: product.vatPercentage || '',
      exciseTax: product.exciseTax || '',
      exciseTaxId: product.exciseTaxId,
      isActive: product.isActive,
    }));
  }, [product_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="product-screen" style={{ background: theme.bg, minHeight: '100%' }}>
      {dialog}

      {/* Page Header Card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: theme.bg,
                boxShadow: shadows.raised.sm,
              }}
            >
              <Package className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0" style={{ color: theme.textPrimary }}>
                {strings.Products}
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage your products
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <button
            onClick={() => navigate('/admin/master/product/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
              boxShadow: shadows.raised.sm,
            }}
          >
            <Plus className="w-4 h-4" />
            {strings.AddnewProduct}
          </button>
        </div>
      </div>

      {/* Filters & Table Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        {/* Filters Section */}
        <div className="p-6 border-b" style={{ borderColor: `${theme.shadowDark}40` }}>
          <h5 className="text-sm font-semibold mb-4" style={{ color: theme.textPrimary }}>
            {strings.Filter}:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={filterData.productCode}
              placeholder={`${strings.Enter} ${strings.PRODUCTCODE}`}
              className="px-4 py-2 rounded-xl border-0 outline-none w-full"
              style={{
                background: theme.bg,
                boxShadow: shadows.pressed.sm,
                color: theme.textPrimary,
              }}
              onChange={e => handleFilterChange('productCode', e.target.value)}
            />
            <input
              value={filterData.name}
              placeholder={`${strings.Enter} ${strings.Name}`}
              className="px-4 py-2 rounded-xl border-0 outline-none w-full"
              style={{
                background: theme.bg,
                boxShadow: shadows.pressed.sm,
                color: theme.textPrimary,
              }}
              onChange={e => handleFilterChange('name', e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
                  boxShadow: shadows.raised.sm,
                }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={clearAll}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.sm,
                }}
              >
                <RefreshCw className="w-4 h-4" style={{ color: theme.textSecondary }} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          <DataTable
            columns={columns}
            data={tableData}
            manualPagination
            pageCount={Math.ceil((product_list?.count || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={goToDetail}
            neumorphicPagination
            totalCount={product_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default Product;
