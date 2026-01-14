import { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { LeavePage, Loader } from 'components';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as ProductActions from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { CommonActions } from 'services/global';
import {
  getProductVatCategoryList,
  getProductCategoryList,
  getExciseTaxList,
  getUnitTypeList,
  getCompanyDetails as getCompanyDetailsApi,
  getProductCode as getProductCodeApi,
  getTransactionCategoryListForSalesProduct,
  getTransactionCategoryListForPurchaseProduct,
  getTransactionCategoryListForInventory,
} from '../../productSlice';
import { WareHouseModal } from '../../sections';
import config from '../../../../constants/config';
import { Ban, CircleDot, HelpCircle, Package, RefreshCw } from 'lucide-react';

const mapStateToProps = state => {
  return {
    vat_list: state.product.vat_list,
    product_warehouse_list: state.product.product_warehouse_list,
    product_category_list: state.product.product_category_list,
    supplier_list: state.supplier_invoice.supplier_list,
    inventory_account_list: state.product.inventory_account_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    productActions: bindActionCreators(ProductActions, dispatch),
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
};

// Zod validation schema
const createProductSchema = z
  .object({
    productName: z.string().min(1, 'Product name is required'),
    productCode: z.string().min(1, 'Product code is required'),
    productDescription: z.string().optional(),
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
      if (data.productPriceType.includes('SALES')) {
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
      if (data.productPriceType.includes('SALES')) {
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
      if (data.productPriceType.includes('PURCHASE')) {
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
      if (data.productPriceType.includes('PURCHASE')) {
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

const CreateProduct = ({
  productActions,
  commonActions,
  supplierInvoiceActions,
  history,
  vat_list,
  product_category_list,
  supplier_list,
  inventory_account_list,
  expense,
  income,
  isParentComponentPresent,
  getCurrentProductData,
  closeModal,
}) => {
  const dispatch = useDispatch();
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [contactType] = useState(1);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [createMore, setCreateMore] = useState(false);
  const [exist, setExist] = useState(false);
  const [ProductExist, setProductExist] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [productActive, setProductActive] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [exciseTaxList, setExciseTaxList] = useState([]);
  const [unitTypeList, setUnitTypeList] = useState([]);
  const [exciseTaxCheck, setExciseTaxCheck] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [inventoryAccount, setInventoryAccount] = useState([]);
  const [companyDetails, setCompanyDetails] = useState(null);

  const regEx = /^[0-9]+$/;
  const regExBoth = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  const regDecimal5 = /^\d{1,10}$/;

  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      productCode: '',
      vatCategoryId: '',
      unitTypeId: '',
      productCategoryId: '',
      vatIncluded: false,
      productType: 'GOODS',
      salesUnitPrice: '',
      purchaseUnitPrice: '',
      productPriceType: [expense === true ? 'PURCHASE' : 'SALES'],
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
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    trigger,
  } = form;

  const watchedValues = watch();

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    initializeData();
    salesCategoryFn();
    purchaseCategoryFn();
    inventoryAccountFn();
    getProductCode();
    getcompanyDetails();
  }, []);

  const getcompanyDetails = () => {
    getCompanyDetailsApi()
      .then(res => {
        if (res.status === 200) {
          setCompanyDetails(res.data);
          if (res.data && res.data.isRegisteredVat === false) {
            setValue('vatCategoryId', '10');
          }
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
    dispatch(getProductVatCategoryList());
    dispatch(getProductCategoryList());

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

    supplierInvoiceActions.getSupplierList(contactType);
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

  const showWarehouseModal = () => {
    setOpenWarehouseModal(true);
  };

  const closeWarehouseModal = () => {
    setOpenWarehouseModal(false);
    productActions.getProductWareHouseList();
  };

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        // Convert string IDs to numbers
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
    // Custom validation
    if (exist === true) {
      setError('productName', { type: 'manual', message: 'Product name already exists' });
      return;
    }
    if (ProductExist === true) {
      setError('productCode', { type: 'manual', message: 'Product code already exists' });
      return;
    }
    if (data.isInventoryEnabled === true) {
      if (data.inventoryPurchasePrice === '') {
        setError('inventoryPurchasePrice', {
          type: 'manual',
          message: 'Inventory purchase price is required',
        });
        return;
      }
      if (data.inventoryQty === '') {
        setError('inventoryQty', { type: 'manual', message: 'Inventory quantity is required' });
        return;
      }
    }
    if (exciseTaxCheck === true && data.exciseTaxId === '') {
      setError('exciseTaxId', { type: 'manual', message: 'Excise tax is required' });
      return;
    }

    setDisabled(true);
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
      ...(salesUnitPrice.length !== 0 && {
        salesUnitPrice,
      }),
      ...(salesTransactionCategoryId.length !== 0 && {
        salesTransactionCategoryId,
      }),
      ...(salesDescription.length !== 0 && {
        salesDescription,
      }),
      ...(purchaseDescription.length !== 0 && {
        purchaseDescription,
      }),
      ...(purchaseTransactionCategoryId.length !== 0 && {
        purchaseTransactionCategoryId,
      }),
      ...(purchaseUnitPrice.length !== 0 && {
        purchaseUnitPrice,
      }),
      ...(inventoryPurchasePrice.length !== 0 && {
        inventoryPurchasePrice,
      }),
      ...(inventoryQty.length !== 0 && {
        inventoryQty,
      }),
      ...(inventoryReorderLevel.length !== 0 && {
        inventoryReorderLevel,
      }),
    };
    const postData = getData(dataNew);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Product...');
    productActions
      .createAndSaveProduct(postData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            setDisableLeavePage(false);
            reset({
              productName: '',
              productDescription: '',
              productCode: '',
              vatCategoryId: '',
              unitTypeId: '',
              productCategoryId: '',
              vatIncluded: false,
              productType: 'GOODS',
              salesUnitPrice: '',
              purchaseUnitPrice: '',
              productPriceType: [expense === true ? 'PURCHASE' : 'SALES'],
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
            });
            getProductCode();
            getcompanyDetails();
          } else {
            if (isParentComponentPresent && isParentComponentPresent === true) {
              getCurrentProductData(res.data);
              closeModal(true);
            } else {
              history.push('/admin/master/product');
            }
            setLoading(false);
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Product Created Unsuccessfully'
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
        setExist(true);
      } else {
        setExist(false);
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

  const getProductCode = () => {
    getProductCodeApi().then(res => {
      if (res.status === 200) {
        setValue('productCode', res.data);
      }
    });
  };

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
      className="create-product-screen"
      style={{ background: theme.bg, minHeight: '100vh', padding: '24px' }}
    >
      <div className="animated fadeIn max-w-7xl mx-auto">
        <Card
          className="rounded-xl overflow-hidden"
          style={{
            background: theme.bgWhite,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: theme.primary }} />
              <span>{strings.CreateProduct}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Type & Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Type */}
                  <div>
                    <FormLabel className="flex items-center gap-2 mb-3">
                      {strings.ProductType}
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
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="GOODS" id="producttypeone" />
                                <label
                                  htmlFor="producttypeone"
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {strings.Goods}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="SERVICE" id="producttypetwo" />
                                <label
                                  htmlFor="producttypetwo"
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {strings.Service}
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Status */}
                  {!(isParentComponentPresent && isParentComponentPresent === true) && (
                    <div>
                      <FormLabel className="mb-3 block">
                        <span className="text-red-500">* </span>
                        {strings.Status}
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
                            {strings.Active}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="status-inactive" />
                          <label
                            htmlFor="status-inactive"
                            className="text-sm font-medium cursor-pointer"
                          >
                            {strings.Inactive}
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
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
                            {strings.ProductName}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              maxLength={100}
                              autoComplete="off"
                              placeholder={`${strings.Enter} ${strings.ProductName}`}
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
                            {strings.ProductCode}
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
                              placeholder={`${strings.Enter} ${strings.ProductCode}`}
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
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>{strings.ProductCategory}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue
                                  placeholder={`${strings.Select} ${strings.ProductCategory}`}
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
                            {strings.VATType}
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
                                <SelectValue placeholder={`${strings.Select} VAT Type`} />
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
                          <FormLabel>{strings.unit_type}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue
                                  placeholder={`${strings.Select} ${strings.unit_type}`}
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
                        {strings.excise_product}
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
                              {strings.excise_tax_type}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'rounded-lg',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={`${strings.Select} ${strings.excise_tax_slab}`}
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
                          onCheckedChange={checked => {
                            if (income !== true) {
                              if (checked) {
                                field.onChange([...field.value, 'SALES']);
                              } else {
                                field.onChange(field.value.filter(v => v !== 'SALES'));
                              }
                            }
                          }}
                        />
                      )}
                    />
                    <label htmlFor="salesCheckbox" className="text-lg font-semibold cursor-pointer">
                      {strings.SalesInformation}
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
                            {strings.SellingPrice}
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
                              placeholder={`${strings.Enter} ${strings.SellingPrice}`}
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
                            {strings.Account}
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
                                <SelectValue placeholder={`${strings.Select} ${strings.Account}`} />
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
                        <FormLabel>{strings.Description}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            maxLength={2000}
                            rows={3}
                            readOnly={!watchedValues.productPriceType.includes('SALES')}
                            placeholder={strings.Description}
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
                          onCheckedChange={checked => {
                            if (income !== false) {
                              if (checked) {
                                field.onChange([...field.value, 'PURCHASE']);
                              } else {
                                field.onChange(field.value.filter(v => v !== 'PURCHASE'));
                              }
                            }
                          }}
                        />
                      )}
                    />
                    <label
                      htmlFor="purchaseCheckbox"
                      className="text-lg font-semibold cursor-pointer"
                    >
                      {strings.PurchaseInformation}
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
                            {strings.PurchasePrice}
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
                              placeholder={`${strings.Enter} ${strings.PurchasePrice}`}
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
                            {strings.Account}
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
                                <SelectValue placeholder={`${strings.Select} ${strings.Account}`} />
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
                        <FormLabel>{strings.Description}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            maxLength={2000}
                            rows={3}
                            readOnly={!watchedValues.productPriceType.includes('PURCHASE')}
                            placeholder={strings.Description}
                            className="rounded-lg"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <hr style={{ borderColor: theme.border }} />

                {/* Inventory Section - Only show if PURCHASE is selected and product type is GOODS */}
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
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label
                          htmlFor="inventoryCheckbox"
                          className="text-lg font-semibold cursor-pointer flex items-center gap-2"
                        >
                          {strings.EnableInventory}
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
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel>
                                    <span className="text-red-500">* </span>
                                    {strings.InventoryAccount}
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-lg">
                                        <SelectValue
                                          placeholder={`${strings.Select} ${strings.InventoryAccount}`}
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
                                  <FormLabel>{strings.SupplierName}</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-lg">
                                        <SelectValue
                                          placeholder={`${strings.Select} ${strings.SupplierName}`}
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Inventory Purchase Price */}
                            <FormField
                              name="inventoryPurchasePrice"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel>
                                    <span className="text-red-500">* </span>
                                    {strings.PurchasePrice}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="text"
                                      maxLength={14}
                                      autoComplete="off"
                                      placeholder={`${strings.Enter} ${strings.PurchasePrice}`}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regDecimal.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={cn(
                                        'rounded-lg',
                                        fieldState?.error && 'border-red-500'
                                      )}
                                    />
                                  </FormControl>
                                  {fieldState?.error && (
                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                  )}
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {strings.inventory_note}
                                  </p>
                                </FormItem>
                              )}
                            />

                            {/* Opening Balance Quantity */}
                            <FormField
                              name="inventoryQty"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel>
                                    <span className="text-red-500">* </span>
                                    {strings.OpeningBalanceQuantity}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="text"
                                      maxLength={10}
                                      autoComplete="off"
                                      placeholder={`${strings.Enter} ${strings.OpeningBalanceQuantity}`}
                                      onChange={e => {
                                        if (e.target.value === '' || regEx.test(e.target.value)) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={cn(
                                        'rounded-lg',
                                        fieldState?.error && 'border-red-500'
                                      )}
                                    />
                                  </FormControl>
                                  {fieldState?.error && (
                                    <FormMessage>{fieldState.error.message}</FormMessage>
                                  )}
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Reorder Level */}
                            <FormField
                              name="inventoryReorderLevel"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel>{strings.ReOrderLevel}</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="text"
                                      maxLength={10}
                                      autoComplete="off"
                                      placeholder={`${strings.Enter} ${strings.InventoryReorderLevel}`}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regDecimal5.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className="rounded-lg"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
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
                      setCreateMore(false);
                      handleSubmit(onSubmit)();
                    }}
                    className="rounded-lg"
                    style={{
                      background: theme.primary,
                    }}
                  >
                    <CircleDot className="h-4 w-4" />
                    {disabled ? 'Creating...' : strings.Create}
                  </Button>
                  {!(isParentComponentPresent && isParentComponentPresent === true) && (
                    <Button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        trigger().then(isValid => {
                          if (!isValid || Object.keys(errors).length !== 0) {
                            commonActions.fillManDatoryDetails();
                          }
                        });
                        setCreateMore(true);
                        handleSubmit(onSubmit)();
                      }}
                      className="rounded-lg"
                      style={{
                        background: theme.primary,
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {disabled ? 'Creating...' : strings.CreateandMore}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => {
                      if (isParentComponentPresent && isParentComponentPresent === true) {
                        closeModal(true);
                      } else {
                        history.push('/admin/master/product');
                      }
                    }}
                    style={{
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <Ban className="h-4 w-4" />
                    {strings.Cancel}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);
