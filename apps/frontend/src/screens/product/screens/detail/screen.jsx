import { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as ProductActions from '../../actions';
import * as DetailProductActions from './actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { CommonActions } from 'services/global';
import {
  getProductVatCategoryList,
  getProductCategoryList,
  getExciseTaxList,
  getUnitTypeList,
  getCompanyDetails as getCompanyDetailsApi,
  getTransactionCategoryListForSalesProduct,
  getTransactionCategoryListForPurchaseProduct,
  getTransactionCategoryListForInventory,
} from '../../productSlice';
import { WareHouseModal } from '../../sections';
import config from '../../../../constants/config';
import {
  Ban,
  CircleDot,
  HelpCircle,
  Package,
  Trash2,
  ChevronRight,
  Check,
  History,
} from 'lucide-react';

const mapStateToProps = state => {
  return {
    vat_list: state.product.vat_list,
    product_warehouse_list: state.product.product_warehouse_list,
    product_category_list: state.product.product_category_list,
    supplier_list: state.supplier_invoice.supplier_list,
    inventory_list: state.product.inventory_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    productActions: bindActionCreators(ProductActions, dispatch),
    detailProductActions: bindActionCreators(DetailProductActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  border: '#e5e7eb',
  danger: '#ef4444',
};

// Zod validation schema
const detailProductSchema = z
  .object({
    productName: z.string().min(1, 'Product name is required'),
    productCode: z.string().min(1, 'Product code is required'),
    vatCategoryId: z.string().min(1, 'VAT type is required'),
    unitTypeId: z.string().optional(),
    productCategoryId: z.string().optional(),
    vatIncluded: z.boolean().optional(),
    productType: z.enum(['GOODS', 'SERVICE']),
    salesUnitPrice: z.string().optional(),
    purchaseUnitPrice: z.string().optional(),
    productPriceType: z.array(z.string()).min(1, 'At least one selling type is required'),
    salesTransactionCategoryId: z.string().optional(),
    purchaseTransactionCategoryId: z.string().optional(),
    inventoryPurchasePrice: z.string().optional(),
    inventoryQty: z.string().optional(),
    inventoryReorderLevel: z.string().optional(),
    contactId: z.string().optional(),
    salesDescription: z.string().optional(),
    purchaseDescription: z.string().optional(),
    isInventoryEnabled: z.boolean().optional(),
    transactionCategoryId: z.string().optional(),
    exciseTaxId: z.string().optional(),
  })
  .refine(
    data => {
      if (data.productPriceType && data.productPriceType.includes('SALES')) {
        return data.salesUnitPrice && data.salesUnitPrice.length > 0;
      }
      return true;
    },
    {
      message: 'Selling price is required',
      path: ['salesUnitPrice'],
    }
  )
  .refine(
    data => {
      if (data.productPriceType && data.productPriceType.includes('SALES')) {
        return data.salesTransactionCategoryId && data.salesTransactionCategoryId.length !== 0;
      }
      return true;
    },
    {
      message: 'Sales account is required',
      path: ['salesTransactionCategoryId'],
    }
  )
  .refine(
    data => {
      if (data.productPriceType && data.productPriceType.includes('PURCHASE')) {
        return data.purchaseUnitPrice && data.purchaseUnitPrice.length > 0;
      }
      return true;
    },
    {
      message: 'Purchase price is required',
      path: ['purchaseUnitPrice'],
    }
  )
  .refine(
    data => {
      if (data.productPriceType && data.productPriceType.includes('PURCHASE')) {
        return (
          data.purchaseTransactionCategoryId && data.purchaseTransactionCategoryId.length !== 0
        );
      }
      return true;
    },
    {
      message: 'Purchase account is required',
      path: ['purchaseTransactionCategoryId'],
    }
  );

const DetailProduct = ({
  productActions,
  detailProductActions,
  commonActions,
  supplierInvoiceActions,
  vat_list,
  product_category_list,
  supplier_list,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [contactType] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [exciseTaxList, setExciseTaxList] = useState([]);
  const [unitTypeList, setUnitTypeList] = useState([]);
  const [exciseTaxCheck, setExciseTaxCheck] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [inventoryTableData, setInventoryTableData] = useState([]);
  const [childRecordsPresent, setChildRecordsPresent] = useState(false);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [inventoryAccount, setInventoryAccount] = useState([]);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [productActive, setProductActive] = useState(true);
  const [count, setCount] = useState(0);
  const [ProductExist, setProductExist] = useState(false);
  const [productNameExist, setProductNameExist] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [inventory_history_list, setInventoryHistoryList] = useState([]);
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);

  const regEx = /^[0-9]+$/;
  const regExBoth = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
  const regDecimal5 = /^\d{0,10}$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const form = useForm({
    resolver: zodResolver(detailProductSchema),
    defaultValues: {
      productName: '',
      productCode: '',
      vatCategoryId: '',
      unitTypeId: '',
      productCategoryId: '',
      vatIncluded: false,
      productType: 'GOODS',
      salesUnitPrice: '',
      purchaseUnitPrice: '',
      productPriceType: ['SALES'],
      salesTransactionCategoryId: '84',
      purchaseTransactionCategoryId: '49',
      inventoryPurchasePrice: '',
      inventoryQty: '',
      inventoryReorderLevel: '',
      contactId: '',
      salesDescription: '',
      purchaseDescription: '',
      isInventoryEnabled: false,
      transactionCategoryId: '150',
      exciseTaxId: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    trigger,
  } = form;

  const watchedValues = watch();

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    initializeData();
    getExciseTaxList().then(res => {
      if (res.status === 200) {
        setExciseTaxList(res.data);
      }
    });
    getUnitTypeList().then(res => {
      if (res.status === 200) {
        setUnitTypeList(res.data);
      }
    });
    getcompanyDetails();
    salesCategoryFn();
    purchaseCategoryFn();
    inventoryAccountFn();
  }, []);

  const getcompanyDetails = () => {
    getCompanyDetailsApi()
      .then(res => {
        if (res.status === 200) {
          setCompanyDetails(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const initializeData = () => {
    if (location.state && location.state.id) {
      let initCount = 0;
      productActions.getInvoicesCountProduct(location.state.id).then(res1 => {
        initCount = res1.data;
        setCount(initCount);
      });

      detailProductActions.getProductById(location.state.id).then(res => {
        if (res.status === 200) {
          let productPriceType;
          if (res.data.productPriceType === 'BOTH') {
            productPriceType = ['SALES', 'PURCHASE'];
          } else {
            productPriceType = [res.data.productPriceType];
          }

          const formData = {
            isInventoryEnabled: res.data.isInventoryEnabled ? res.data.isInventoryEnabled : false,
            productName: res.data.productName ? res.data.productName : '',
            productCode: res.data.productCode || '',
            vatCategoryId: res.data.vatCategoryId ? String(res.data.vatCategoryId) : '',
            productCategoryId: res.data.productCategoryId ? String(res.data.productCategoryId) : '',
            vatIncluded: res.data.vatIncluded || false,
            salesUnitPrice: res.data.salesUnitPrice ? String(res.data.salesUnitPrice) : '',
            salesTransactionCategoryId: res.data.salesTransactionCategoryId
              ? String(res.data.salesTransactionCategoryId)
              : '84',
            salesDescription: res.data.salesDescription ? res.data.salesDescription : '',
            purchaseUnitPrice: res.data.purchaseUnitPrice ? String(res.data.purchaseUnitPrice) : '',
            purchaseTransactionCategoryId: res.data.purchaseTransactionCategoryId
              ? String(res.data.purchaseTransactionCategoryId)
              : '49',
            purchaseDescription: res.data.purchaseDescription ? res.data.purchaseDescription : '',
            productType: res.data.productType ? res.data.productType : 'GOODS',
            productPriceType: productPriceType || ['SALES'],
            inventoryQty: res.data.inventoryQty ? String(res.data.inventoryQty) : '',
            inventoryReorderLevel: res.data.inventoryReorderLevel
              ? String(res.data.inventoryReorderLevel)
              : '',
            inventoryPurchasePrice: res.data.inventoryPurchasePrice
              ? String(res.data.inventoryPurchasePrice)
              : '',
            contactId: res.data.contactId ? String(res.data.contactId) : '',
            transactionCategoryId: res.data.transactionCategoryId
              ? String(res.data.transactionCategoryId)
              : '150',
            exciseTaxId: res.data.exciseTaxId ? String(res.data.exciseTaxId) : '',
            unitTypeId: res.data.unitTypeId ? String(res.data.unitTypeId) : '',
          };

          reset(formData);
          setExciseTaxCheck(res.data.exciseTaxId ? true : false);
          setSelectedStatus(res.data.isActive ? true : false);
          setProductActive(res.data.isActive ? true : false);
          setCurrentProductId(location.state.id);
          setLoading(false);

          checkChildActivitiesForProductId(location.state.id);
        } else {
          setLoading(false);
          navigate('/admin/master/product');
        }
      });

      supplierInvoiceActions.getSupplierList(contactType);
      dispatch(getProductCategoryList());
      dispatch(getProductVatCategoryList());

      productActions.getInventoryByProductId(location.state.id).then(res => {
        if (res.status === 200 && res.data !== null) {
          let tempTableData = res.data;
          tempTableData.map(obj => {
            obj.disableEditing = true;
          });
          setInventoryTableData(tempTableData);
        }
      });
    } else {
      navigate('/admin/master/product');
    }
  };

  const salesCategoryFn = () => {
    try {
      getTransactionCategoryListForSalesProduct('2').then(res => {
        if (res.status === 200) {
          setSalesCategory(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const purchaseCategoryFn = () => {
    try {
      getTransactionCategoryListForPurchaseProduct('10').then(res => {
        if (res.status === 200) {
          setPurchaseCategory(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const inventoryAccountFn = () => {
    try {
      getTransactionCategoryListForInventory().then(res => {
        if (res.status === 200) {
          setInventoryAccount(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        if (
          item === 'vatCategoryId' ||
          item === 'salesTransactionCategoryId' ||
          item === 'purchaseTransactionCategoryId' ||
          item === 'transactionCategoryId' ||
          item === 'productCategoryId' ||
          item === 'unitTypeId' ||
          item === 'exciseTaxId' ||
          item === 'contactId'
        ) {
          if (data[`${item}`] && data[`${item}`] !== '') {
            temp[`${item}`] = parseInt(data[`${item}`], 10);
          }
        } else {
          temp[`${item}`] = data[`${item}`];
        }
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = data => {
    if (exciseTaxCheck === true && data.exciseTaxId === '') {
      setError('exciseTaxId', { type: 'manual', message: 'Excise tax is required' });
      return;
    }
    if (ProductExist === true) {
      setError('productCode', { type: 'manual', message: 'Product code already exists' });
      return;
    }
    if (productNameExist) {
      setError('productName', { type: 'manual', message: 'Product Name Already Exists' });
      return;
    }

    if (count > 0 && selectedStatus === false) {
      commonActions.tostifyAlert(
        'error',
        'Deletion of this product is possible only after deleting all the invoices created with this product'
      );
      return;
    }

    setDisabled(true);
    const productID = currentProductId;
    const productCode = data['productCode'];
    const salesUnitPrice = data['salesUnitPrice'];
    const salesTransactionCategoryId = data['salesTransactionCategoryId'];
    const salesDescription = data['salesDescription'];
    const purchaseDescription = data['purchaseDescription'];
    const purchaseTransactionCategoryId = data['purchaseTransactionCategoryId'];
    const purchaseUnitPrice = data['purchaseUnitPrice'];
    const vatCategoryId = data['vatCategoryId'];
    const exciseTaxId = data['exciseTaxId'];
    const vatIncluded = data['vatIncluded'];
    const inventoryPurchasePrice = data['inventoryPurchasePrice'];
    const inventoryQty = data['inventoryQty'];
    const inventoryReorderLevel = data['inventoryReorderLevel'];
    const contactId = data['contactId'] || '';
    const isInventoryEnabled = data['isInventoryEnabled'];
    const transactionCategoryId = data['transactionCategoryId'];
    const productCategoryId = data['productCategoryId'];
    const isActive = productActive;
    const exciseTaxCheckVal = exciseTaxCheck;
    const unitTypeId = data['unitTypeId'];

    let productPriceType;
    if (data['productPriceType'].includes('SALES')) {
      productPriceType = 'SALES';
    }
    if (data['productPriceType'].includes('PURCHASE')) {
      productPriceType = 'PURCHASE';
    }
    if (
      data['productPriceType'].includes('SALES') &&
      data['productPriceType'].includes('PURCHASE')
    ) {
      productPriceType = 'BOTH';
    }
    const productName = data['productName'];
    const productType = data['productType'];

    const dataNew = {
      id: productID,
      productCode,
      productName,
      productType,
      productPriceType,
      vatCategoryId,
      exciseTaxId,
      vatIncluded,
      isInventoryEnabled,
      contactId,
      transactionCategoryId,
      productCategoryId,
      isActive,
      exciseTaxCheck: exciseTaxCheckVal,
      unitTypeId,
      ...(salesUnitPrice && salesUnitPrice.length !== 0 && { salesUnitPrice }),
      ...(salesTransactionCategoryId &&
        salesTransactionCategoryId.length !== 0 && { salesTransactionCategoryId }),
      ...(salesDescription && salesDescription.length !== 0 && { salesDescription }),
      ...(purchaseDescription && purchaseDescription.length !== 0 && { purchaseDescription }),
      ...(purchaseTransactionCategoryId &&
        purchaseTransactionCategoryId.length !== 0 && { purchaseTransactionCategoryId }),
      ...(purchaseUnitPrice && purchaseUnitPrice.length !== 0 && { purchaseUnitPrice }),
      ...(inventoryPurchasePrice &&
        inventoryPurchasePrice.length !== 0 && { inventoryPurchasePrice }),
      ...(inventoryQty && inventoryQty.length !== 0 && { inventoryQty }),
      ...(inventoryReorderLevel && inventoryReorderLevel.length !== 0 && { inventoryReorderLevel }),
    };

    const postData = getData(dataNew);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Product...');

    detailProductActions
      .updateProduct(postData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Updated Successfully'
          );
          navigate('/admin/master/product');
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Product Updated Unsuccessfully'
        );
      });
  };

  const validationCheck = value => {
    const data = {
      moduleType: 1,
      name: value,
    };
    productActions.checkValidation(data).then(response => {
      if (response.data === 'Product Name Already Exists') {
        setProductNameExist(true);
      } else {
        setProductNameExist(false);
      }
    });
  };

  const ProductvalidationCheck = value => {
    const data = {
      moduleType: 7,
      productCode: value,
    };
    productActions.checkProductNameValidation(data).then(response => {
      if (response.data === 'Product Code Already Exists') {
        setProductExist(true);
      } else {
        setProductExist(false);
      }
    });
  };

  const showWarehouseModal = () => {
    setOpenWarehouseModal(true);
  };

  const closeWarehouseModal = () => {
    setOpenWarehouseModal(false);
    productActions.getProductWareHouseList();
  };

  const checkChildActivitiesForProductId = id => {
    productActions.getInvoicesCountProduct(id).then(res => {
      if (res.data > 0) {
        setChildRecordsPresent(true);
      } else {
        setChildRecordsPresent(false);
      }
    });
  };

  const deleteProduct = () => {
    productActions.getInvoicesCountProduct(currentProductId).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert('error', 'You need to delete invoices to delete the Product');
      } else {
        const message1 = (
          <text>
            <b>Delete Product?</b>
          </text>
        );
        const message = 'This Product will be deleted permanently and cannot be recovered. ';
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeProduct}
            cancelHandler={() => setDialog(null)}
            message={message}
            message1={message1}
          />
        );
      }
    });
  };

  const removeProduct = () => {
    setDisabled1(true);
    setDialog(null);
    setLoading(true);
    setLoadingMsg('Deleting Product...');
    detailProductActions
      .deleteProduct(currentProductId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Deleted Successfully'
          );
          navigate('/admin/master/product');
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Product Deleted Unsuccessfully'
        );
      });
  };

  const openSummuryModal = data => {
    setOpenModal(true);
  };

  const closeModalFn = res => {
    setOpenModal(false);
  };

  const param = row => {
    const data = {
      p_id: row[0].p_id,
      s_id: row[1].s_id,
    };
    if (
      row[1].s_id !== null &&
      row[0].p_id !== null &&
      row[1].s_id !== undefined &&
      row[0].p_id !== undefined
    ) {
      productActions
        .getInventoryHistory(data)
        .then(res => {
          if (res.status === 200) {
            setInventoryHistoryList(res.data);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });

      openSummuryModal({});
    } else {
      commonActions.tostifyAlert(
        'success',
        'Sorry , No supplier Available to View Inventory History List'
      );
    }
  };

  const updateReorderLevel = data => {
    const inventoryIdVal = data['inventoryId'];
    const productCode = data['productCode'];
    const contactId = data['supplierId'];
    const isInventoryEnabledVal = data['isInventoryEnabled'];
    const transactionCategoryId = data['transactionCategoryId'];
    const productName = data['productName'];
    const productType = data['productType'];
    const inventoryQty = data['inventoryQty'];
    const inventoryReorderLevel = data['reOrderLevel'];
    const inventoryPurchasePrice = data['inventoryPurchasePrice'];

    const dataNew = {
      productCode,
      productName,
      productType,
      isInventoryEnabled: isInventoryEnabledVal,
      contactId,
      transactionCategoryId,
      inventoryId: inventoryIdVal,
      inventoryQty,
      inventoryReorderLevel,
      inventoryPurchasePrice,
    };
    const postData = getData(dataNew);
    productActions
      .updateInventory(postData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Re-Order Level Updated Successfully'
          );
          let tempTableData = [...inventoryTableData];
          tempTableData.map(obj => {
            if (obj.inventoryId === data.inventoryId) obj.disableEditing = true;
          });
          setInventoryTableData(tempTableData);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Updated Unsuccessfully'
        );
      });
  };

  const inventoryColumns = useMemo(
    () => [
      {
        accessorKey: 'supplierName',
        header: strings.SupplierName || 'Supplier Name',
        cell: ({ row }) => <span>{row.original.supplierName || '-'}</span>,
      },
      {
        accessorKey: 'stockInHand',
        header: strings.StockInHand || 'Stock In Hand',
      },
      {
        accessorKey: 'reOrderLevel',
        header: strings.ReOrderLevel || 'Reorder Level',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              min="0"
              max="2000"
              maxLength="10"
              value={row.original.reOrderLevel || ''}
              onChange={e => {
                if (regDecimal5.test(e.target.value)) {
                  let tempTableData = [...inventoryTableData];
                  const index = tempTableData.findIndex(
                    obj => obj.inventoryId === row.original.inventoryId
                  );
                  if (index !== -1) {
                    tempTableData[index].reOrderLevel = e.target.value !== '' ? e.target.value : 0;
                    tempTableData[index].disableEditing = false;
                    setInventoryTableData(tempTableData);
                  }
                }
              }}
              className="w-24 rounded-lg"
            />
            {row.original.disableEditing === false && (
              <Button
                size="sm"
                className="rounded-lg"
                style={{ background: theme.primary }}
                onClick={() => updateReorderLevel(row.original)}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'quantitySold',
        header: strings.QuantitySold || 'Quantity Sold',
      },
      {
        accessorKey: 'purchaseOrder',
        header: strings.PurchaseOrder || 'Purchase Order',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              param([{ p_id: row.original.productId }, { s_id: row.original.supplierId }])
            }
          >
            <History className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [inventoryTableData]
  );

  let tmpSupplier_list = [];
  supplier_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpSupplier_list.push(obj);
  });

  if (loading === true) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div
      className="detail-product-screen"
      style={{ background: theme.bg, minHeight: '100vh', padding: '24px' }}
    >
      <div className="animated fadeIn max-w-7xl mx-auto">
        {dialog}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-corp-text-muted mb-2">
          <a href="/admin" className="hover:text-corp-primary transition-colors">
            {strings.Home || 'Home'}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/admin/master/product" className="hover:text-corp-primary transition-colors">
            {strings.Products || 'Products'}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-corp-text-primary font-medium">
            {strings.UpdateProduct || 'Update Product'}
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-corp-text-primary flex items-center gap-2">
              <Package className="h-6 w-6" style={{ color: theme.primary }} />
              {strings.UpdateProduct || 'Update Product'}
            </h1>
            <p className="text-sm text-corp-text-muted mt-1">
              Update product information and details
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={deleteProduct}
            disabled={disabled1}
            className="rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
            {disabled1 ? 'Deleting...' : strings.Delete || 'Delete'}
          </Button>
        </div>

        {/* Main Form Card */}
        <Card
          className="rounded-xl overflow-hidden"
          style={{
            background: theme.bgWhite,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Type & Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Type */}
                  <div>
                    <FormLabel className="flex items-center gap-2 mb-3">
                      {strings.ProductType || 'Product Type'}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              The product type cannot be changed after any document has been created
                              using this product.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormField
                      name="productType"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={value => {
                                field.onChange(value);
                                if (value === 'SERVICE') {
                                  setExciseTaxCheck(false);
                                  setValue('exciseTaxId', '');
                                }
                              }}
                              disabled={childRecordsPresent}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="GOODS" id="producttypeone" />
                                <label
                                  htmlFor="producttypeone"
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {strings.Goods || 'Goods'}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="SERVICE" id="producttypetwo" />
                                <label
                                  htmlFor="producttypetwo"
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {strings.Service || 'Service'}
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <FormLabel className="mb-3 block">
                      <span className="text-red-500">* </span>
                      {strings.Status || 'Status'}
                    </FormLabel>
                    <RadioGroup
                      value={selectedStatus ? 'true' : 'false'}
                      onValueChange={value => {
                        const boolValue = value === 'true';
                        setSelectedStatus(boolValue);
                        setProductActive(boolValue);
                      }}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="status-active" />
                        <label
                          htmlFor="status-active"
                          className="text-sm font-medium cursor-pointer"
                        >
                          {strings.Active || 'Active'}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="status-inactive" />
                        <label
                          htmlFor="status-inactive"
                          className="text-sm font-medium cursor-pointer"
                        >
                          {strings.Inactive || 'Inactive'}
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <hr style={{ borderColor: theme.border }} />

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    {strings.BasicInformation || 'Basic Information'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Name */}
                    <FormField
                      name="productName"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-red-500">* </span>
                            {strings.ProductName || 'Product Name'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              maxLength={100}
                              autoComplete="off"
                              placeholder={`${strings.Enter || 'Enter'} ${strings.ProductName || 'Product Name'}`}
                              onChange={e => {
                                if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                  field.onChange(e);
                                }
                                validationCheck(e.target.value);
                              }}
                              className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                            />
                          </FormControl>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Product Code */}
                    <FormField
                      name="productCode"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <span className="text-red-500">* </span>
                            {strings.ProductCode || 'Product Code'}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Product Code - Unique identifier code for the product</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              maxLength={50}
                              disabled
                              placeholder={`${strings.Enter || 'Enter'} ${strings.ProductCode || 'Product Code'}`}
                              onChange={e => {
                                if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                  field.onChange(e);
                                }
                                ProductvalidationCheck(e.target.value);
                              }}
                              className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                            />
                          </FormControl>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Product Category */}
                    <FormField
                      name="productCategoryId"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{strings.ProductCategory || 'Product Category'}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue
                                  placeholder={`${strings.Select || 'Select'} ${strings.ProductCategory || 'Product Category'}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {product_category_list?.map((category, index) => (
                                <SelectItem
                                  key={`category-${category.value}-${index}`}
                                  value={String(category.value)}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* VAT Type */}
                    <FormField
                      name="vatCategoryId"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-red-500">* </span>
                            {strings.VATType || 'VAT Type'}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={companyDetails && !companyDetails.isRegisteredVat}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                              >
                                <SelectValue
                                  placeholder={`${strings.Select || 'Select'} VAT Type`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vat_list?.map((vat, index) => (
                                <SelectItem key={`vat-${vat.id}-${index}`} value={String(vat.id)}>
                                  {vat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Unit Type */}
                    <FormField
                      name="unitTypeId"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{strings.unit_type || 'Unit Type'}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue
                                  placeholder={`${strings.Select || 'Select'} ${strings.unit_type || 'Unit Type'}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {unitTypeList?.map((unit, index) => (
                                <SelectItem
                                  key={`unit-${unit.unitTypeId}-${index}`}
                                  value={String(unit.unitTypeId)}
                                >
                                  {unit.unitType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Excise Tax Checkbox - Only for GOODS */}
                  {watchedValues.productType !== 'SERVICE' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exciseTaxCheck"
                        checked={exciseTaxCheck}
                        disabled={childRecordsPresent}
                        onCheckedChange={checked => {
                          setExciseTaxCheck(checked === true);
                          if (!checked) {
                            setValue('exciseTaxId', '');
                          }
                        }}
                      />
                      <label
                        htmlFor="exciseTaxCheck"
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        {strings.excise_product || 'Excise Product'}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Note: It is not possible to switch from Excise Goods to Non-Excise
                                Goods or vice versa once any document is created using this product.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                    </div>
                  )}

                  {/* Excise Tax Dropdown */}
                  {exciseTaxCheck && watchedValues.productType !== 'SERVICE' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        name="exciseTaxId"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.excise_tax_type || 'Excise Tax Type'}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={childRecordsPresent}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'rounded-lg',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={`${strings.Select || 'Select'} ${strings.excise_tax_slab || 'Excise Tax Slab'}`}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {exciseTaxList?.map((tax, index) => (
                                  <SelectItem
                                    key={`excise-${tax.id}-${index}`}
                                    value={String(tax.id)}
                                  >
                                    {tax.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <hr style={{ borderColor: theme.border }} />

                {/* Sales Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      name="productPriceType"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="salesCheckbox"
                          checked={field.value.includes('SALES')}
                          disabled={childRecordsPresent}
                          onCheckedChange={checked => {
                            if (checked) {
                              field.onChange([...field.value, 'SALES']);
                            } else {
                              field.onChange(field.value.filter(v => v !== 'SALES'));
                            }
                          }}
                        />
                      )}
                    />
                    <label htmlFor="salesCheckbox" className="text-lg font-semibold cursor-pointer">
                      {strings.SalesInformation || 'Sales Information'}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Selling Price */}
                    <FormField
                      name="salesUnitPrice"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <span className="text-red-500">* </span>
                            {strings.SellingPrice || 'Selling Price'}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Selling price – Price at which your product is sold</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              maxLength={14}
                              autoComplete="off"
                              placeholder={`${strings.Enter || 'Enter'} ${strings.SellingPrice || 'Selling Price'}`}
                              readOnly={!watchedValues.productPriceType.includes('SALES')}
                              onChange={e => {
                                if (e.target.value === '' || regDecimal.test(e.target.value)) {
                                  field.onChange(e);
                                }
                              }}
                              className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                            />
                          </FormControl>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Sales Account */}
                    <FormField
                      name="salesTransactionCategoryId"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-red-500">* </span>
                            {strings.Account || 'Account'}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!watchedValues.productPriceType.includes('SALES')}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                              >
                                <SelectValue
                                  placeholder={`${strings.Select || 'Select'} ${strings.Account || 'Account'}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {salesCategory?.map((category, index) => (
                                <SelectItem
                                  key={`sales-cat-${category.value}-${index}`}
                                  value={String(category.value)}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sales Description */}
                  <FormField
                    name="salesDescription"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{strings.Description || 'Description'}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            maxLength={2000}
                            rows={3}
                            readOnly={!watchedValues.productPriceType.includes('SALES')}
                            placeholder={strings.Description || 'Description'}
                            className="rounded-lg"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Purchase Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      name="productPriceType"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="purchaseCheckbox"
                          checked={field.value.includes('PURCHASE')}
                          disabled={childRecordsPresent}
                          onCheckedChange={checked => {
                            if (checked) {
                              field.onChange([...field.value, 'PURCHASE']);
                            } else {
                              field.onChange(field.value.filter(v => v !== 'PURCHASE'));
                            }
                          }}
                        />
                      )}
                    />
                    <label
                      htmlFor="purchaseCheckbox"
                      className="text-lg font-semibold cursor-pointer"
                    >
                      {strings.PurchaseInformation || 'Purchase Information'}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Purchase Price */}
                    <FormField
                      name="purchaseUnitPrice"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <span className="text-red-500">* </span>
                            {strings.PurchasePrice || 'Purchase Price'}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Purchase price – Amount of money you paid for the product</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              maxLength={14}
                              autoComplete="off"
                              placeholder={`${strings.Enter || 'Enter'} ${strings.PurchasePrice || 'Purchase Price'}`}
                              readOnly={!watchedValues.productPriceType.includes('PURCHASE')}
                              onChange={e => {
                                if (e.target.value === '' || regDecimal.test(e.target.value)) {
                                  field.onChange(e);
                                }
                              }}
                              className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                            />
                          </FormControl>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Purchase Account */}
                    <FormField
                      name="purchaseTransactionCategoryId"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-red-500">* </span>
                            {strings.Account || 'Account'}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!watchedValues.productPriceType.includes('PURCHASE')}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                              >
                                <SelectValue
                                  placeholder={`${strings.Select || 'Select'} ${strings.Account || 'Account'}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {purchaseCategory?.map((category, index) => (
                                <SelectItem
                                  key={`purchase-cat-${category.value}-${index}`}
                                  value={String(category.value)}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState?.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Purchase Description */}
                  <FormField
                    name="purchaseDescription"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{strings.Description || 'Description'}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            maxLength={2000}
                            rows={3}
                            readOnly={!watchedValues.productPriceType.includes('PURCHASE')}
                            placeholder={strings.Description || 'Description'}
                            className="rounded-lg"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <hr style={{ borderColor: theme.border }} />

                {/* Inventory Section */}
                {watchedValues.productPriceType.includes('PURCHASE') &&
                  watchedValues.productType !== 'SERVICE' &&
                  config.INVENTORY_MODULE && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <FormField
                          name="isInventoryEnabled"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="inventoryCheckbox"
                              checked={field.value}
                              disabled={childRecordsPresent}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label
                          htmlFor="inventoryCheckbox"
                          className="text-lg font-semibold cursor-pointer flex items-center gap-2"
                        >
                          {strings.EnableInventory || 'Enable Inventory'}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Inventory cannot be enabled or disabled once a document has been
                                  created using this product.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </label>
                      </div>

                      {watchedValues.isInventoryEnabled && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Inventory Account */}
                            <FormField
                              name="transactionCategoryId"
                              control={control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    <span className="text-red-500">* </span>
                                    {strings.InventoryAccount || 'Inventory Account'}
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-lg">
                                        <SelectValue
                                          placeholder={`${strings.Select || 'Select'} ${strings.InventoryAccount || 'Inventory Account'}`}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {inventoryAccount?.map((account, index) => (
                                        <SelectItem
                                          key={`inv-acc-${account.value}-${index}`}
                                          value={String(account.value)}
                                        >
                                          {account.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            {/* Supplier */}
                            <FormField
                              name="contactId"
                              control={control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.SupplierName || 'Supplier Name'}</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-lg">
                                        <SelectValue
                                          placeholder={`${strings.Select || 'Select'} ${strings.SupplierName || 'Supplier Name'}`}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {tmpSupplier_list?.map((supplier, index) => (
                                        <SelectItem
                                          key={`supplier-${supplier.value}-${index}`}
                                          value={String(supplier.value)}
                                        >
                                          {supplier.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Inventory Table */}
                          {inventoryTableData && inventoryTableData.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-md font-semibold mb-3">
                                {strings.InventoryDetails || 'Inventory Details'}
                              </h5>
                              <DataTable
                                data={inventoryTableData || []}
                                columns={inventoryColumns}
                                manualPagination={false}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                {/* Action Buttons */}
                <div
                  className="flex justify-end gap-3 mt-8 pt-6 border-t"
                  style={{ borderColor: theme.border }}
                >
                  <Button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      trigger().then(isValid => {
                        if (!isValid || Object.keys(errors).length !== 0) {
                          commonActions.fillManDatoryDetails();
                        }
                      });
                      handleSubmit(onSubmit)();
                    }}
                    className="rounded-lg"
                    style={{
                      background: theme.primary,
                    }}
                  >
                    <CircleDot className="h-4 w-4" />
                    {disabled ? 'Updating...' : strings.Update || 'Update'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => navigate('/admin/master/product')}
                    style={{
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <Ban className="h-4 w-4" />
                    {strings.Cancel || 'Cancel'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <WareHouseModal openModal={openWarehouseModal} closeWarehouseModal={closeWarehouseModal} />
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailProduct);
