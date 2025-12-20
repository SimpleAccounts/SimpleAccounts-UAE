import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Package, Edit } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal, Currency } from 'components';

import * as ProductActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Product List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Product() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const product_list = useSelector((state) => state.product.product_list);
  const vat_list = useSelector((state) => state.product.vat_list);
  const universal_currency_list = useSelector((state) => state.common.universal_currency_list);

  // Actions
  const productActions = useMemo(
    () => bindActionCreators(ProductActions, dispatch),
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
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
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
    (row) => {
      navigate('/admin/master/product/detail', { state: { id: row.id } });
    },
    [navigate]
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
      name: '',
      productCode: '',
      vatPercentage: '',
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
          <span className="font-medium">{row.original.productCode}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: strings.PRODUCTNAME,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'productType',
        header: strings.ProductType,
        cell: ({ row }) => {
          const { productType, exciseTaxId } = row.original;
          if (exciseTaxId) {
            return `EXCISE ${productType}`;
          }
          return productType || '';
        },
      },
      {
        accessorKey: 'isInventoryEnabled',
        header: strings.Inventory,
        cell: ({ row }) => {
          const isEnabled = row.original.isInventoryEnabled;
          return (
            <Badge variant={isEnabled ? 'success' : 'destructive'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'unitPrice',
        header: strings.UNITPRICE,
        cell: ({ row }) => (
          <div className="text-right">
            <Currency
              value={row.original.unitPrice || 0}
              currencySymbol={getCurrencySymbol}
            />
          </div>
        ),
      },
      {
        accessorKey: 'vatPercentage',
        header: `${strings.VAT} ${strings.Type}`,
      },
      {
        accessorKey: 'exciseTax',
        header: 'Excise Slab',
        cell: ({ row }) => row.original.exciseTax || '-',
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge variant={isActive ? 'success' : 'destructive'}>
              {isActive ? 'Active' : 'InActive'}
            </Badge>
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
    return product_list.data.map((product) => ({
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
    <div className="product-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.Products}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/master/product/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddnewProduct}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  value={filterData.productCode}
                  placeholder={`${strings.Enter} ${strings.PRODUCTCODE}`}
                  className="input-transition"
                  onChange={(e) => handleFilterChange('productCode', e.target.value)}
                />
                <Input
                  value={filterData.name}
                  placeholder={`${strings.Enter} ${strings.Name}`}
                  className="input-transition"
                  onChange={(e) => handleFilterChange('name', e.target.value)}
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
              pageCount={Math.ceil((product_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
              onRowClick={goToDetail}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Product;
