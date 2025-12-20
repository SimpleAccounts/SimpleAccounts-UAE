import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Boxes, Download, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';

import * as ProductCategoryActions from './actions';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Product Category Screen
 * Uses functional components, shadcn/ui, and TanStack Table
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
        cell: ({ row }) => <span className="font-medium">{row.original.productCategoryCode}</span>,
      },
      {
        accessorKey: 'productCategoryName',
        header: strings.ProductCategoryName || 'Product Category Name',
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
    <div className="product-category-screen">
      <div className="space-y-6">
        {dialog}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Boxes className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">
                  {strings.ProductCategory || 'Product Category'}
                </CardTitle>
              </div>
              <Button onClick={() => navigate('/admin/master/product-category/create')}>
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewProductCategory || 'Add New Product Category'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProductCategory;
