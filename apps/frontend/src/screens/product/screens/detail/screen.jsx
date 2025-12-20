import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import './style.scss';
import * as ProductActions from '../../actions';
import { WareHouseModal } from '../../sections';
import { selectOptionsFactory, selectStyles } from 'utils';
import * as DetailProductActions from './actions';
import { CommonActions } from 'services/global';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { InventoryHistoryModal } from './sections';
import config from 'constants/config';

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

// Zod validation schema
const detailProductSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productCode: z.string().min(1, 'Product code is required'),
  vatCategoryId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
  ]).nullable().refine((val) => val !== null, 'Tax category is required'),
  unitTypeId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
  ]).nullable().optional(),
  productCategoryId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
  ]).nullable().optional(),
  productWarehouseId: z.string().optional(),
  vatIncluded: z.boolean().optional(),
  productType: z.enum(['GOODS', 'SERVICE']),
  salesUnitPrice: z.string().optional(),
  purchaseUnitPrice: z.string().optional(),
  productPriceType: z.array(z.string()).min(1, 'At least one selling type is required'),
  salesTransactionCategoryId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
    z.string(),
  ]).optional(),
  purchaseTransactionCategoryId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
    z.string(),
  ]).optional(),
  inventoryPurchasePrice: z.string().optional(),
  inventoryQty: z.string().optional(),
  inventoryReorderLevel: z.string().optional(),
  contactId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
  ]).nullable().optional(),
  salesDescription: z.string().optional(),
  purchaseDescription: z.string().optional(),
  isInventoryEnabled: z.boolean().optional(),
  transactionCategoryId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
  ]).nullable().optional(),
  exciseTaxId: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number(),
    z.string(),
  ]).optional(),
  salesTransactionCategoryLabel: z.string().optional(),
  purchaseTransactionCategoryLabel: z.string().optional(),
  inventoryId: z.union([z.string(), z.number()]).optional(),
  isActive: z.union([z.boolean(), z.string()]).optional(),
}).refine((data) => {
  if (data.productPriceType && data.productPriceType.includes('SALES')) {
    return data.salesUnitPrice && data.salesUnitPrice.length > 0;
  }
  return true;
}, {
  message: 'Selling price is required',
  path: ['salesUnitPrice'],
}).refine((data) => {
  if (data.productPriceType && data.productPriceType.includes('SALES')) {
    return data.salesTransactionCategoryId && data.salesTransactionCategoryId.length !== 0;
  }
  return true;
}, {
  message: 'Selling category is required',
  path: ['salesTransactionCategoryId'],
}).refine((data) => {
  if (data.productPriceType && data.productPriceType.includes('PURCHASE')) {
    return data.purchaseUnitPrice && data.purchaseUnitPrice.length > 0;
  }
  return true;
}, {
  message: 'Purchase price is required',
  path: ['purchaseUnitPrice'],
}).refine((data) => {
  if (data.productPriceType && data.productPriceType.includes('PURCHASE')) {
    return data.purchaseTransactionCategoryId && data.purchaseTransactionCategoryId.length !== 0;
  }
  return true;
}, {
  message: 'Purchase category is required',
  path: ['purchaseTransactionCategoryId'],
});

const DetailProduct = ({
  productActions,
  detailProductActions,
  commonActions,
  supplierInvoiceActions,
  history,
  location,
  vat_list,
  product_category_list,
  supplier_list,
  inventory_list,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [contactType] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [current_product_id, setCurrentProductId] = useState(null);
  const [openInventoryModel, setOpenInventoryModel] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [inventoryId, setInventoryId] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [inventory_history_list, setInventoryHistoryList] = useState([]);
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
  const [isInventoryEnabled, setIsInventoryEnabled] = useState(false);
  const [count, setCount] = useState(0);
  const [ProductExist, setProductExist] = useState(false);
  const [productNameExist, setProductNameExist] = useState(false);

  const regEx = /^[0-9\d]+$/;
  const regExBoth = /[a-zA-Z0-9-./\\|]+$/;
  const regDecimal5 = /^\d{0,10}$/;
  const regExAlpha = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,6}$$/;

  const form = useForm({
    resolver: zodResolver(detailProductSchema),
    defaultValues: {},
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
    productActions.getUnitTypeList().then(res => {
      if (res.status === 200) {
        setUnitTypeList(res.data);
      }
    });
    productActions.getExciseTaxList().then(res => {
      if (res.status === 200) {
        setExciseTaxList(res.data);
      }
    });
    getcompanyDetails();
  }, []);

  const getcompanyDetails = () => {
    productActions
      .getCompanyDetails()
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
            isInventoryEnabled: res.data.isInventoryEnabled
              ? res.data.isInventoryEnabled
              : false,
            productName: res.data.productName ? res.data.productName : '',
            productCode: res.data.productCode,
            vatCategoryId: res.data.vatCategoryId ? res.data.vatCategoryId : '',
            productCategoryId: res.data.productCategoryId ? res.data.productCategoryId : '',
            productWarehouseId: res.data.productWarehouseId ? res.data.productWarehouseId : '',
            vatIncluded: res.data.vatIncluded,
            salesUnitPrice: res.data.salesUnitPrice ? res.data.salesUnitPrice : '',
            salesTransactionCategoryId: res.data.salesTransactionCategoryId
              ? res.data.salesTransactionCategoryId
              : 84,
            salesDescription: res.data.salesDescription ? res.data.salesDescription : '',
            purchaseUnitPrice: res.data.purchaseUnitPrice ? res.data.purchaseUnitPrice : '',
            purchaseTransactionCategoryId: res.data.purchaseTransactionCategoryId
              ? res.data.purchaseTransactionCategoryId
              : 49,
            purchaseDescription: res.data.purchaseDescription
              ? res.data.purchaseDescription
              : '',
            productType: res.data.productType ? res.data.productType : '',
            productPriceType: res.data.productPriceType ? productPriceType : '',
            salesTransactionCategoryLabel: res.data.salesTransactionCategoryLabel
              ? res.data.salesTransactionCategoryLabel
              : '',
            purchaseTransactionCategoryLabel: res.data.purchaseTransactionCategoryLabel
              ? res.data.purchaseTransactionCategoryLabel
              : '',
            isActive: res.data.isActive && res.data.isActive !== null ? res.data.isActive : '',
            inventoryQty: res.data.inventoryQty ? res.data.inventoryQty : '',
            inventoryReorderLevel: res.data.inventoryReorderLevel
              ? res.data.inventoryReorderLevel
              : '',
            inventoryPurchasePrice: res.data.inventoryPurchasePrice
              ? res.data.inventoryPurchasePrice
              : '',
            contactId: res.data.contactId ? res.data.contactId : '',
            transactionCategoryId: res.data.transactionCategoryId
              ? res.data.transactionCategoryId
              : '',
            inventoryId: res.data.inventoryId ? res.data.inventoryId : '',
            exciseTaxId: res.data.exciseTaxId ? res.data.exciseTaxId : '',
            unitTypeId: res.data.unitTypeId ? res.data.unitTypeId : '',
          };

          reset(formData);
          setExciseTaxCheck(res.data.exciseTaxId ? true : false);
          setIsInventoryEnabled(res.data.isInventoryEnabled ? res.data.isInventoryEnabled : false);
          setSelectedStatus(res.data.isActive ? true : false);
          setCurrentProductId(location.state.id);
          setLoading(false);

          checkChildActivitiesForProductId(location.state.id);
        } else {
          setLoading(false);
          history.push('/admin/master/product');
        }
      });

      supplierInvoiceActions.getSupplierList(contactType);
      productActions.getProductCategoryList();
      productActions.getProductVatCategoryList();

      salesCategoryFn();
      purchaseCategoryFn();
      inventoryAccountFn();

      productActions.getInventoryByProductId(location.state.id).then(res => {
        if (res.status === 200 && res.data !== null) {
          let tempTableData = res.data;
          tempTableData.map(obj => {
            obj.disableEditing = true;
          });

          setInventoryTableData(tempTableData);
        }
      });
    }
  };

  const salesCategoryFn = () => {
    try {
      productActions.getTransactionCategoryListForSalesProduct('2').then(res => {
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
      productActions.getTransactionCategoryListForPurchaseProduct('10').then(res => {
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
      productActions.getTransactionCategoryListForInventory().then(res => {
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
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = (data) => {
    // Custom validation
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
    const productID = current_product_id;
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
    const contactId = data['contactId'];
    const isInventoryEnabledVal = isInventoryEnabled
      ? isInventoryEnabled
      : false;
    const transactionCategoryId = inventoryAccount
      ? inventoryAccount[0].value
      : '';
    const inventoryIdVal = inventoryId;
    const isActive = selectedStatus;
    const productCategoryId = data['productCategoryId'] && data['productCategoryId'].value
      ? data['productCategoryId'].value
      : data['productCategoryId'];
    const unitTypeId = data['unitTypeId'];

    let productPriceType;
    if (data && data['productPriceType'] && data['productPriceType'].includes('SALES')) {
      productPriceType = 'SALES';
    }
    if (data && data['productPriceType'] && data['productPriceType'].includes('PURCHASE')) {
      productPriceType = 'PURCHASE';
    }
    if (
      data['productPriceType'] &&
      data['productPriceType'].includes('SALES') &&
      data['productPriceType'].includes('PURCHASE')
    ) {
      productPriceType = 'BOTH';
    }
    const productName = data['productName'];
    const productType = data['productType'];
    const dataNew = {
      productID,
      productCode,
      productName,
      productType,
      productPriceType,
      vatCategoryId,
      exciseTaxId,
      vatIncluded,
      isInventoryEnabled: isInventoryEnabledVal,
      contactId,
      transactionCategoryId,
      inventoryId: inventoryIdVal,
      isActive,
      unitTypeId,
      productCategoryId,
      ...(salesUnitPrice && salesUnitPrice.length !== 0 &&
        data['productPriceType'].includes('SALES') && {
        salesUnitPrice,
      }),
      ...(salesTransactionCategoryId && salesTransactionCategoryId.length !== 0 &&
        data['productPriceType'].includes('SALES') && {
        salesTransactionCategoryId,
      }),
      ...(salesDescription && salesDescription.length !== 0 &&
        data['productPriceType'].includes('SALES') && {
        salesDescription,
      }),
      ...(purchaseDescription && purchaseDescription.length !== 0 &&
        data['productPriceType'].includes('PURCHASE') && {
        purchaseDescription,
      }),
      ...(purchaseTransactionCategoryId && purchaseTransactionCategoryId.length !== 0 &&
        data['productPriceType'].includes('PURCHASE') && {
        purchaseTransactionCategoryId,
      }),
      ...(purchaseUnitPrice && purchaseUnitPrice.length !== 0 &&
        data['productPriceType'].includes('PURCHASE') && {
        purchaseUnitPrice,
      }),
      ...(inventoryPurchasePrice && inventoryPurchasePrice.length !== 0 && {
        inventoryPurchasePrice,
      }),
      ...(inventoryQty && inventoryQty.length !== 0 && {
        inventoryQty,
      }),
      ...(inventoryReorderLevel && inventoryReorderLevel.length !== 0 && {
        inventoryReorderLevel,
      }),
    };
    const postData = getData(dataNew);
    setLoading(true);
    setDisableLeavePage(false);
    setLoadingMsg('Updating Product...');
    detailProductActions
      .updateProduct(postData)
      .then(res => {
        setDisabled(false);
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Updated Successfully'
          );
          history.push('/admin/master/product');
          setLoading(false);
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
    productActions.getInvoicesCountProduct(current_product_id).then(res => {
      if (res.data > 0) {
        setChildRecordsPresent(true);
      } else {
        setChildRecordsPresent(false);
      }
    });
  };

  const deleteProduct = () => {
    productActions.getInvoicesCountProduct(current_product_id).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert(
          'error',
          'You need to delete invoices to delete the Product'
        );
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

  const openSummuryModal = data => {
    setOpenModal(true);
  };

  const closeModalFn = res => {
    setOpenModal(false);
  };

  const removeProduct = () => {
    setDisabled1(true);
    setDialog(null);
    setLoading(true);
    setLoadingMsg('Deleting Product...');
    detailProductActions
      .deleteProduct(current_product_id)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Deleted Successfully'
          );
          history.push('/admin/master/product');
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

  const renderActions = (cell, row) => {
    return (
      <Row>
        <div>
          <Button
            className="btn btn-sm pdf-btn ml-3"
            onClick={e => {
              param([{ p_id: row.productId }, { s_id: row.supplierId }]);
            }}
          >
            <i className="fa fa-history fa-lg"></i>
          </Button>
        </div>
      </Row>
    );
  };

  const renderName = (cell, row) => {
    return <span>{cell ? cell : '-'}</span>;
  };

  const renderReorderLevel = (cell, row) => {
    return (
      <Row>
        <Col>
          <Input
            type="text"
            min="0"
            max="2000"
            maxLength="10"
            name="inventoryReorderLevel"
            id="inventoryReorderLevel"
            value={cell}
            onChange={option => {
              if (regDecimal5.test(option.target.value)) {
                let tempTableData = [...inventoryTableData];
                tempTableData.map(obj => {
                  if (obj.inventoryId === row.inventoryId) {
                    obj.reOrderLevel = option.target.value !== '' ? option.target.value : 0;
                    obj.disableEditing = false;
                  }
                });
                setInventoryTableData(tempTableData);
              }
            }}
          />
        </Col>

        <Col>
          {' '}
          {row.disableEditing === false && (
            <div>
              <Button
                color="primary"
                className="btn btn-primary btn-sm pdf-btn  ml-1 mt-1 primary"
                onClick={e => {
                  updateReorderLevel(row);
                }}
              >
                <i className="fas fa-check"></i>
              </Button>
            </div>
          )}
        </Col>
      </Row>
    );
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
    const postData = getReorderData(dataNew);
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

  const getReorderData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const selectRowProp = {
    bgColor: 'rgba(0,0,0, 0.05)',
    clickToSelect: false,
    onSelect: (row, isSelected, e) => {
      let tempList = [];
      if (isSelected) {
        tempList = Object.assign([], selectedRows);
        tempList.push(row.id);
      } else {
        selectedRows.map(item => {
          if (item !== row.id) {
            tempList.push(item);
          }
          return item;
        });
      }
      setSelectedRows(tempList);
    },
    onSelectAll: () => { },
  };

  const options = {
    onRowClick: () => { },
    page: 1,
    sizePerPage: 10,
    onSizePerPageList: () => { },
    onPageChange: () => { },
    sortName: '',
    sortOrder: '',
    onSortChange: () => { },
  };

  let tmpSupplier_list = [];
  supplier_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpSupplier_list.push(obj);
  });

  var vat_list_data = [];
  for (let i = 0; i < vat_list.length; i++) {
    vat_list_data.push(vat_list[i]);
  }
  vat_list_data.push({ id: 10, name: 'N/A', vat: 0 });

  if (loading === true) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="detail-product-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fas fa-box" />
                        <span className="ml-2"> {strings.UpdateProduct} </span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup check inline className="mb-3">
                              <Label className="productlabel">
                                {' '}
                                {strings.ProductType}
                                <i
                                  id="ProductTypetip"
                                  className="fa fa-question-circle ml-1"
                                ></i>
                                <UncontrolledTooltip
                                  placement="right"
                                  target="ProductTypetip"
                                >
                                  The product type cannot be changed after any document
                                  has been created using this product.
                                </UncontrolledTooltip>
                              </Label>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <Controller
                                    name="productType"
                                    control={control}
                                    render={({ field }) => (
                                      <>
                                        <input
                                          className="custom-control-input"
                                          type="radio"
                                          id="producttypeone"
                                          name="producttypeone"
                                          value="GOODS"
                                          onChange={(e) => field.onChange(e.target.value)}
                                          checked={field.value === 'GOODS'}
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="producttypeone"
                                        >
                                          {strings.Goods}
                                        </label>
                                      </>
                                    )}
                                  />
                                </div>
                              </FormGroup>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <Controller
                                    name="productType"
                                    control={control}
                                    render={({ field }) => (
                                      <>
                                        <Input
                                          className="custom-control-input"
                                          type="radio"
                                          id="producttypetwo"
                                          name="producttypetwo"
                                          value="SERVICE"
                                          onChange={(e) => {
                                            field.onChange(e.target.value);
                                            setExciseTaxCheck(false);
                                            setValue('exciseTaxId', '');
                                          }}
                                          checked={field.value === 'SERVICE'}
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="producttypetwo"
                                        >
                                          {strings.Service}
                                        </label>
                                      </>
                                    )}
                                  />
                                </div>
                              </FormGroup>
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup check inline className="mb-3">
                              <Label className="productlabel">
                                <span className="text-danger">* </span>
                                {strings.Status}
                              </Label>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <Input
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio1"
                                    name="active"
                                    checked={selectedStatus}
                                    value={true}
                                    onChange={e => {
                                      if (e.target.value === 'true') {
                                        setSelectedStatus(true);
                                        setProductActive(true);
                                      }
                                    }}
                                  />
                                  <label
                                    className="custom-control-label"
                                    htmlFor="inline-radio1"
                                  >
                                    {strings.Active}
                                  </label>
                                </div>
                              </FormGroup>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio2"
                                    name="active"
                                    value={false}
                                    checked={!selectedStatus}
                                    onChange={e => {
                                      if (e.target.value === 'false') {
                                        setSelectedStatus(false);
                                        setProductActive(false);
                                      }
                                    }}
                                  />
                                  <label
                                    className="custom-control-label"
                                    htmlFor="inline-radio2"
                                  >
                                    {strings.Inactive}
                                  </label>
                                </div>
                              </FormGroup>
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr></hr>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="productName">
                                <span className="text-danger">* </span>{' '}
                                {strings.ProductName}
                              </Label>
                              <Controller
                                name="productName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    maxLength="100"
                                    id="productName"
                                    onChange={option => {
                                      if (
                                        option.target.value === '' ||
                                        regExAlpha.test(option.target.value)
                                      ) {
                                        field.onChange(option);
                                      }
                                      validationCheck(option.target.value);
                                    }}
                                    placeholder={strings.Enter + strings.ProductName}
                                    className={
                                      errors.productName && touchedFields.productName
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.productName && touchedFields.productName && (
                                <div className="invalid-feedback">
                                  {errors.productName.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>

                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="productCode">
                                <span className="text-danger">* </span>
                                {strings.ProductCode}
                              </Label>
                              <Controller
                                name="productCode"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    id="productCode"
                                    disabled
                                    placeholder={strings.Enter + strings.ProductCode}
                                    onChange={option => {
                                      if (
                                        option.target.value === '' ||
                                        regExBoth.test(option.target.value)
                                      ) {
                                        field.onChange(option);
                                      }
                                      ProductvalidationCheck(option.target.value);
                                    }}
                                    className={
                                      errors.productCode && touchedFields.productCode
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.productCode && touchedFields.productCode && (
                                <div className="invalid-feedback">
                                  {errors.productCode.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="productCategoryId">
                                {strings.ProductCategory}
                              </Label>
                              <Controller
                                name="productCategoryId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    className="select-default-width"
                                    options={
                                      product_category_list
                                        ? selectOptionsFactory.renderOptions(
                                          'label',
                                          'value',
                                          product_category_list,
                                          'Product Category'
                                        )
                                        : []
                                    }
                                    id="productCategoryId"
                                    placeholder={strings.Select + strings.ProductCategory}
                                    value={
                                      product_category_list &&
                                      selectOptionsFactory
                                        .renderOptions(
                                          'label',
                                          'value',
                                          product_category_list,
                                          'Product Category'
                                        )
                                        .find(
                                          option =>
                                            option.value === +field.value
                                        )
                                    }
                                    onChange={option => {
                                      field.onChange(option || '');
                                    }}
                                    isClearable
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>

                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="vatCategoryId">
                                <span className="text-danger">* </span>
                                {strings.VATType}
                              </Label>
                              <Controller
                                name="vatCategoryId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    isDisabled={
                                      companyDetails &&
                                      !companyDetails.isRegisteredVat
                                    }
                                    options={
                                      vat_list
                                        ? selectOptionsFactory.renderOptions(
                                          'name',
                                          'id',
                                          vat_list,
                                          'Tax'
                                        )
                                        : []
                                    }
                                    id="vatCategoryId"
                                    value={
                                      vat_list_data &&
                                      selectOptionsFactory
                                        .renderOptions('name', 'id', vat_list_data, 'Tax')
                                        .find(
                                          option =>
                                            option.value === +field.value
                                        )
                                    }
                                    onChange={option => {
                                      field.onChange(option || '');
                                    }}
                                    className={
                                      errors.vatCategoryId &&
                                        touchedFields.vatCategoryId
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.vatCategoryId &&
                                touchedFields.vatCategoryId && (
                                  <div className="invalid-feedback">
                                    {errors.vatCategoryId.message}
                                  </div>
                                )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="unitTypeId">{strings.unit_type}</Label>
                              <Controller
                                name="unitTypeId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    options={
                                      unitTypeList
                                        ? selectOptionsFactory.renderOptions(
                                          'unitType',
                                          'unitTypeId',
                                          unitTypeList,
                                          'Unit Type'
                                        )
                                        : []
                                    }
                                    id="unitTypeId"
                                    placeholder={strings.Select + 'Unit Type'}
                                    value={
                                      unitTypeList &&
                                      selectOptionsFactory
                                        .renderOptions(
                                          'unitType',
                                          'unitTypeId',
                                          unitTypeList,
                                          'Unit Type'
                                        )
                                        .find(
                                          option => option.value == field.value
                                        )
                                    }
                                    onChange={option => {
                                      field.onChange(option || '');
                                    }}
                                    isClearable
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row
                          style={{
                            display: watchedValues.productType !== 'SERVICE' ? '' : 'none',
                          }}
                        >
                          <Col lg={4}>
                            <FormGroup check inline className="mb-3">
                              <Label
                                className="form-check-label"
                                check
                                htmlFor="exciseTaxCheck"
                              >
                                <Input
                                  disabled={childRecordsPresent}
                                  type="checkbox"
                                  id="exciseTaxCheck"
                                  name="exciseTaxCheck"
                                  onChange={event => {
                                    if (exciseTaxCheck === true) {
                                      setExciseTaxCheck(false);
                                      setValue('exciseTaxId', '');
                                    } else {
                                      setExciseTaxCheck(true);
                                    }
                                  }}
                                  checked={exciseTaxCheck}
                                  style={{ display: 'inline-block' }}
                                />
                                {strings.excise_product}
                                <i
                                  id="ExciseTooltip"
                                  className="fa fa-question-circle ml-1"
                                ></i>
                                <UncontrolledTooltip
                                  placement="right"
                                  target="ExciseTooltip"
                                >
                                  Note: It is not possible to switch from Excise Goods to
                                  Non-Excise Goods or vice versa once any document is
                                  created using this product.
                                </UncontrolledTooltip>
                              </Label>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          {exciseTaxCheck === true && (
                            <Col
                              style={{
                                display:
                                  watchedValues.productType !== 'SERVICE' ? '' : 'none',
                              }}
                              lg={4}
                            >
                              <FormGroup className="mb-3">
                                <Label htmlFor="exciseTaxId">
                                  <span className="text-danger">* </span>
                                  {strings.excise_tax_type}
                                </Label>
                                <Controller
                                  name="exciseTaxId"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      styles={selectStyles}
                                      options={
                                        exciseTaxList
                                          ? selectOptionsFactory.renderOptions(
                                            'name',
                                            'id',
                                            exciseTaxList,
                                            'Excise Tax Slab'
                                          )
                                          : []
                                      }
                                      id="exciseTaxId"
                                      placeholder={strings.Select + strings.excise_tax_slab}
                                      value={
                                        exciseTaxList &&
                                        selectOptionsFactory
                                          .renderOptions(
                                            'name',
                                            'id',
                                            exciseTaxList,
                                            'Excise Tax Slab'
                                          )
                                          .find(
                                            option =>
                                              option.value === +field.value
                                          )
                                      }
                                      onChange={option => {
                                        field.onChange(option || '');
                                      }}
                                      className={
                                        errors.exciseTaxId && touchedFields.exciseTaxId
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.exciseTaxId &&
                                  touchedFields.exciseTaxId && (
                                    <div className="invalid-feedback">
                                      {errors.exciseTaxId.message}
                                    </div>
                                  )}
                              </FormGroup>
                            </Col>
                          )}
                        </Row>
                        <Row className="secondary-info">
                          <Col lg={8}>
                            <FormGroup check inline className="mb-3">
                              <Label
                                className="form-check-label"
                                check
                                htmlFor="productPriceTypeOne"
                              >
                                <Controller
                                  name="productPriceType"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="checkbox"
                                      maxLength="14,2"
                                      id="productPriceTypeOne"
                                      name="productPriceTypeOne"
                                      onChange={event => {
                                        if (
                                          field.value &&
                                          field.value.includes('SALES')
                                        ) {
                                          const nextValue =
                                            field.value.filter(
                                              value => value !== 'SALES'
                                            );
                                          field.onChange(nextValue);
                                        } else {
                                          const nextValue =
                                            field.value &&
                                            field.value.concat('SALES');
                                          field.onChange(nextValue);
                                        }
                                      }}
                                      checked={
                                        field.value &&
                                        field.value.includes('SALES')
                                      }
                                      className={
                                        errors.productPriceType &&
                                          touchedFields.productPriceType
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {strings.SalesInformation}
                                {errors.productPriceType &&
                                  touchedFields.productPriceType && (
                                    <div className="invalid-feedback">
                                      {errors.productPriceType.message}
                                    </div>
                                  )}
                              </Label>
                            </FormGroup>
                            <Row>
                              <Col>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="salesUnitPrice">
                                    <span className="text-danger">* </span>{' '}
                                    {strings.SellingPrice}
                                    <i
                                      id="SalesTooltip"
                                      className="fa fa-question-circle ml-1"
                                    ></i>
                                    <UncontrolledTooltip
                                      placement="right"
                                      target="SalesTooltip"
                                    >
                                      Selling price – Price at which your product is sold
                                    </UncontrolledTooltip>
                                  </Label>
                                  <Controller
                                    name="salesUnitPrice"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="14,2"
                                        id="salesUnitPrice"
                                        placeholder={strings.Enter + strings.SellingPrice}
                                        readOnly={
                                          watchedValues.productPriceType &&
                                          watchedValues.productPriceType.includes('SALES')
                                            ? false
                                            : true
                                        }
                                        onChange={option => {
                                          if (
                                            option.target.value === '' ||
                                            regDecimal.test(option.target.value)
                                          ) {
                                            field.onChange(option);
                                          }
                                        }}
                                        className={
                                          errors.salesUnitPrice &&
                                            touchedFields.salesUnitPrice
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.salesUnitPrice &&
                                    touchedFields.salesUnitPrice && (
                                      <div className="invalid-feedback">
                                        {errors.salesUnitPrice.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="transactionCategoryId">
                                    <span className="text-danger">* </span>{' '}
                                    {strings.Account}
                                  </Label>
                                  <Controller
                                    name="salesTransactionCategoryId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        styles={selectStyles}
                                        isDisabled={
                                          watchedValues.productPriceType &&
                                          watchedValues.productPriceType.includes('SALES')
                                            ? false
                                            : true
                                        }
                                        options={salesCategory ? salesCategory : []}
                                        value={
                                          salesCategory &&
                                          watchedValues.salesTransactionCategoryLabel
                                            ? salesCategory
                                              .find(
                                                item =>
                                                  item.label ===
                                                  watchedValues.salesTransactionCategoryLabel
                                              )
                                              ?.options.find(
                                                item =>
                                                  item.value ===
                                                  +field.value
                                              )
                                            : field.value
                                        }
                                        id="salesTransactionCategoryId"
                                        onChange={option => {
                                          field.onChange(option || '');
                                        }}
                                        className={
                                          errors.salesTransactionCategoryId &&
                                            touchedFields.salesTransactionCategoryId
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.salesTransactionCategoryId &&
                                    touchedFields.salesTransactionCategoryId && (
                                      <div className="invalid-feedback">
                                        {errors.salesTransactionCategoryId.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <FormGroup className="">
                              <Label htmlFor="salesDescription">
                                {strings.Description}
                              </Label>
                              <Controller
                                name="salesDescription"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    readOnly={
                                      watchedValues.productPriceType &&
                                      watchedValues.productPriceType.includes('SALES')
                                        ? false
                                        : true
                                    }
                                    type="textarea"
                                    maxLength="2000"
                                    id="salesDescription"
                                    rows="3"
                                    placeholder={strings.Description}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <FormGroup check inline className="mb-3">
                              <Label
                                className="form-check-label"
                                check
                                htmlFor="productPriceTypetwo"
                              >
                                <Controller
                                  name="productPriceType"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="checkbox"
                                      maxLength="14,2"
                                      id="productPriceTypetwo"
                                      name="productPriceTypetwo"
                                      onChange={event => {
                                        if (
                                          field.value &&
                                          field.value.includes('PURCHASE')
                                        ) {
                                          const nextValue =
                                            field.value.filter(
                                              value => value !== 'PURCHASE'
                                            );
                                          field.onChange(nextValue);
                                        } else {
                                          const nextValue =
                                            field.value &&
                                            field.value.concat('PURCHASE');
                                          field.onChange(nextValue);
                                        }
                                      }}
                                      checked={
                                        field.value &&
                                        field.value.includes('PURCHASE')
                                      }
                                      className={
                                        errors.productPriceType &&
                                          touchedFields.productPriceType
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {strings.PurchaseInformation}
                                {errors.productPriceType &&
                                  touchedFields.productPriceType && (
                                    <div className="invalid-feedback">
                                      {errors.productPriceType.message}
                                    </div>
                                  )}
                              </Label>
                            </FormGroup>
                            <Row>
                              <Col>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="salesUnitPrice">
                                    <span className="text-danger">* </span>{' '}
                                    {strings.PurchasePrice}
                                    <i
                                      id="PurchaseTooltip"
                                      className="fa fa-question-circle ml-1"
                                    ></i>
                                    <UncontrolledTooltip
                                      placement="right"
                                      target="PurchaseTooltip"
                                    >
                                      Purchase price – Amount of money you paid for the
                                      product
                                    </UncontrolledTooltip>
                                  </Label>
                                  <Controller
                                    name="purchaseUnitPrice"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="14,2"
                                        id="purchaseUnitPrice"
                                        placeholder={strings.Enter + strings.PurchasePrice}
                                        onChange={option => {
                                          if (
                                            option.target.value === '' ||
                                            regDecimal.test(option.target.value)
                                          ) {
                                            field.onChange(option);
                                          }
                                        }}
                                        readOnly={
                                          watchedValues.productPriceType &&
                                          watchedValues.productPriceType.includes('PURCHASE')
                                            ? false
                                            : true
                                        }
                                        className={
                                          errors.purchaseUnitPrice &&
                                            touchedFields.purchaseUnitPrice
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.purchaseUnitPrice &&
                                    touchedFields.purchaseUnitPrice && (
                                      <div className="invalid-feedback">
                                        {errors.purchaseUnitPrice.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="transactionCategoryId">
                                    <span className="text-danger">* </span>{' '}
                                    {strings.Account}
                                  </Label>
                                  <Controller
                                    name="purchaseTransactionCategoryId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        styles={selectStyles}
                                        isDisabled={
                                          watchedValues.productPriceType &&
                                          watchedValues.productPriceType.includes('PURCHASE')
                                            ? false
                                            : true
                                        }
                                        options={purchaseCategory ? purchaseCategory : []}
                                        placeholder={strings.CostofGoodsSold}
                                        value={
                                          purchaseCategory &&
                                          watchedValues.purchaseTransactionCategoryLabel
                                            ? purchaseCategory
                                              .find(
                                                item =>
                                                  item.label ===
                                                  watchedValues
                                                    .purchaseTransactionCategoryLabel
                                              )
                                              ?.options.find(
                                                item =>
                                                  item.value ===
                                                  +field.value
                                              )
                                            : field.value
                                        }
                                        id="purchaseTransactionCategoryId"
                                        onChange={option => {
                                          field.onChange(option || '');
                                        }}
                                        className={
                                          errors.purchaseTransactionCategoryId &&
                                            touchedFields.purchaseTransactionCategoryId
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.purchaseTransactionCategoryId &&
                                    touchedFields.purchaseTransactionCategoryId && (
                                      <div className="invalid-feedback">
                                        {errors.purchaseTransactionCategoryId.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <FormGroup className="">
                              <Label htmlFor="purchaseDescription">
                                {strings.Description}
                              </Label>
                              <Controller
                                name="purchaseDescription"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    readOnly={
                                      watchedValues.productPriceType &&
                                      watchedValues.productPriceType.includes('PURCHASE')
                                        ? false
                                        : true
                                    }
                                    type="textarea"
                                    id="purchaseDescription"
                                    maxLength="2000"
                                    rows="3"
                                    placeholder={strings.Description}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr></hr>

                        <Row
                          style={{
                            display:
                              watchedValues.productPriceType &&
                                watchedValues.productPriceType.includes('PURCHASE') &&
                                watchedValues.productType !== 'SERVICE'
                                ? ''
                                : 'none',
                          }}
                        >
                          {config.INVENTORY_MODULE && (
                            <Col
                              lg={8}
                              style={{
                                display:
                                  watchedValues.isInventoryEnabled !== true ? 'none' : '',
                              }}
                            >
                              <FormGroup check inline className="mb-3">
                                <Label
                                  className="form-check-label"
                                  check
                                  htmlFor="isInventoryEnabled"
                                >
                                  <Controller
                                    name="isInventoryEnabled"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        disabled={childRecordsPresent}
                                        readonly
                                        type="checkbox"
                                        id="isInventoryEnabled"
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        checked={field.value}
                                        className={
                                          errors.productPriceType &&
                                            touchedFields.productPriceType
                                            ? 'is-invalid form-check-label'
                                            : 'form-check-label'
                                        }
                                      />
                                    )}
                                  />
                                  {strings.EnableInventory}
                                  {errors.productPriceType &&
                                    touchedFields.productPriceType && (
                                      <div className="invalid-feedback">
                                        {errors.productPriceType.message}
                                      </div>
                                    )}
                                  <i
                                    id="EnventoryTooltip"
                                    className="fa fa-question-circle ml-1"
                                  ></i>
                                  <UncontrolledTooltip
                                    placement="right"
                                    target="EnventoryTooltip"
                                  >
                                    Inventory cannot be enabled or disabled once a
                                    document has been created using this product.
                                  </UncontrolledTooltip>
                                </Label>
                              </FormGroup>

                              <Row
                                style={{
                                  display:
                                    watchedValues.isInventoryEnabled !== true
                                      ? 'none'
                                      : '',
                                  width: '140%',
                                }}
                              >
                                <div className={'ml-4 mt-2'}>
                                  <BootstrapTable
                                    selectRow={selectRowProp}
                                    search={false}
                                    options={options}
                                    data={inventoryTableData ? inventoryTableData : []}
                                    version="4"
                                    hover
                                    responsive
                                    currencyList
                                    keyField="inventoryId"
                                    remote
                                    className="customer-invoice-table"
                                  >
                                    <TableHeaderColumn
                                      dataField="supplierName"
                                      dataSort
                                      className="table-header-bg"
                                      dataFormat={renderName}
                                    >
                                      {strings.SupplierName}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="stockInHand"
                                      className="table-header-bg"
                                    >
                                      {strings.StockInHand}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="reOrderLevel"
                                      className="table-header-bg"
                                      dataFormat={renderReorderLevel}
                                    >
                                      {strings.ReOrderLevel}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="quantitySold"
                                      className="table-header-bg"
                                    >
                                      {strings.QuantitySold}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="purchaseOrder"
                                      className="table-header-bg"
                                    >
                                      {strings.PurchaseOrder}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      columnClassName="text-right"
                                      width="5%"
                                      dataFormat={renderActions}
                                      className="text-right table-header-bg"
                                    ></TableHeaderColumn>
                                  </BootstrapTable>
                                </div>
                              </Row>
                            </Col>
                          )}
                        </Row>

                        <Row>
                          <Col
                            lg={12}
                            className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                          >
                            {isInventoryEnabled !== true && (
                              <FormGroup>
                                <Button
                                  type="button"
                                  name="button"
                                  color="danger"
                                  className="btn-square"
                                  disabled1={disabled1}
                                  onClick={deleteProduct}
                                >
                                  <i className="fa fa-trash"></i>{' '}
                                  {disabled1 ? 'Deleting...' : strings.Delete}
                                </Button>
                              </FormGroup>
                            )}
                            <FormGroup></FormGroup>
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                name="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => {
                                  trigger();
                                  if (
                                    errors &&
                                    Object.keys(errors).length !== 0
                                  ) {
                                    commonActions.fillManDatoryDetails();
                                  }
                                }}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/master/product');
                                }}
                              >
                                <i className="fa fa-ban"></i>{' '}
                                {disabled1 ? 'Deleting...' : strings.Cancel}
                              </Button>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        <WareHouseModal
          openModal={openWarehouseModal}
          closeWarehouseModal={closeWarehouseModal}
        />

        <InventoryHistoryModal
          openModal={openModal}
          closeModal={e => {
            closeModalFn(e);
          }}
          inventory_history_list={inventory_history_list}
        />
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailProduct);
