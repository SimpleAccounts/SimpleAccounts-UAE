import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Boxes } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';

import * as ProductCategoryActions from './actions';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  primaryHover: '#1a56b8',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderHover: '#d1d5db',
};

/**
 * Modern Product Category Screen
 * Uses functional components with Corporate design
 */
function ProductCategory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const product_category_list = useSelector(state => state.product_category.product_category_list);

  // Actions
  const productCategoryActions = useMemo(
    () => bindActionCreators(ProductCategoryActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dialog, setDialog] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

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
    const postData = { ...paginationData, ...sortingData };

    productCategoryActions
      .getProductCategoryList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [productCategoryActions, commonActions, pagination, sorting]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Bulk delete
  const bulkDelete = () => {
    if (selectedRows.length === 0) {
      commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.');
      return;
    }

    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeBulk}
        cancelHandler={() => setDialog(null)}
        message="This Product Category will be deleted permanently and cannot be recovered."
        message1={<b>Delete Product Category?</b>}
      />
    );
  };

  const removeBulk = () => {
    setDialog(null);
    const obj = { ids: selectedRows };

    productCategoryActions
      .deleteProductCategory(obj)
      .then(res => {
        initializeData();
        commonActions.tostifyAlert(
          'success',
          res.data?.message || 'Product Category Deleted Successfully'
        );
        setSelectedRows([]);
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'Product Category Deleted Unsuccessfully'
        );
      });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'productCategoryCode',
        header: strings.ProductCategoryCode || 'Product Category Code',
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {row.original.productCategoryCode}
          </span>
        ),
      },
      {
        accessorKey: 'productCategoryName',
        header: strings.ProductCategoryName || 'Product Category Name',
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.productCategoryName}</span>
        ),
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!product_category_list?.data) return [];
    return product_category_list.data.map(item => ({
      id: item.id,
      productCategoryCode: item.productCategoryCode || '',
      productCategoryName: item.productCategoryName || '',
    }));
  }, [product_category_list]);

  // Row click handler
  const handleRowClick = row => {
    navigate('/admin/master/product-category/detail', { state: { id: row.id } });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="product-category-screen" style={{ background: theme.bg, minHeight: '100%' }}>
      {dialog}

      {/* Page Header Card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: '#eff6ff',
              }}
            >
              <Boxes className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0" style={{ color: theme.textPrimary }}>
                {strings.ProductCategory || 'Product Category'}
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage product categories
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <button
            onClick={() => navigate('/admin/master/product-category/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: theme.primary,
            }}
          >
            <Plus className="w-4 h-4" />
            {strings.AddNewProductCategory || 'Add New Product Category'}
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="p-6">
          <DataTable
            columns={columns}
            data={tableData}
            manualPagination
            pageCount={Math.ceil((product_category_list?.count || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={handleRowClick}
            totalCount={product_category_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCategory;
