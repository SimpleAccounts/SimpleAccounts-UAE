import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { LeavePage, Loader } from 'components';
import * as SupplierInvoiceCreateActions from './actions';
import * as GoodsReceivedNoteCreateAction from './actions';
import * as GoodsReceivedNoteAction from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';
import * as PurchaseOrderDetailsAction from '../../../purchase_order/screens/detail/actions';
import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { TextareaAutosize } from '@material-ui/core';
import * as PurchaseOrderAction from '../../../purchase_order/actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import invoiceimage from 'assets/images/invoice/invoice.png';

const mapStateToProps = (state) => {
  return {
    contact_list: state.goods_received_note.contact_list,
    currency_list: state.goods_received_note.currency_list,
    vat_list: state.goods_received_note.vat_list,
    product_list: state.goods_received_note.product_list,
    supplier_list: state.goods_received_note.supplier_list,
    country_list: state.goods_received_note.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
    po_list: state.goods_received_note.po_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    goodsReceivedNoteAction: bindActionCreators(GoodsReceivedNoteAction, dispatch),
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    supplierInvoiceCreateActions: bindActionCreators(SupplierInvoiceCreateActions, dispatch),
    goodsReceivedNoteCreateAction: bindActionCreators(GoodsReceivedNoteCreateAction, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    purchaseOrderDetailsAction: bindActionCreators(PurchaseOrderDetailsAction, dispatch),
    purchaseOrderAction: bindActionCreators(PurchaseOrderAction, dispatch),
  };
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const createGoodsReceivedNoteSchema = z.object({
  grn_Number: z.string().min(1, 'GRN number is required'),
  supplierId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null && val !== undefined, 'Supplier is required'),
  grnReceiveDate: z.union([z.string(), z.date()]).refine((val) => val !== null && val !== '', 'Order date is required'),
  rfqExpiryDate: z.union([z.string(), z.date()]).refine((val) => val !== null && val !== '', 'Order due date is required'),
  attachmentFile: z
    .custom((value) => value instanceof File || value === undefined || value === null, {
      message: 'Invalid file',
    })
    .refine(
      (value) => {
        if (!value) return true;
        const supported_format = [
          'image/png',
          'image/jpeg',
          'text/plain',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        return supported_format.includes(value.type);
      },
      { message: '*Unsupported File Format' }
    )
    .refine(
      (value) => {
        if (!value) return true;
        const file_size = 1024000;
        return value.size <= file_size;
      },
      { message: '*File Size is too large' }
    )
    .optional(),
  lineItemsString: z
    .array(
      z.object({
        grnReceivedQuantity: z
          .union([z.string(), z.number()])
          .refine((val) => Number(val) > 0, {
            message: 'Quantity should be greater than 0',
          }),
        unitPrice: z
          .union([z.string(), z.number()])
          .refine((val) => Number(val) > 0, {
            message: 'Unit price should be greater than 1',
          }),
        vatCategoryId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, {
          message: 'Value is required',
        }),
        productId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, {
          message: 'Product is required',
        }),
        description: z.string().optional(),
        quantity: z.union([z.string(), z.number()]).optional(),
        subTotal: z.union([z.string(), z.number()]).optional(),
        vatAmount: z.union([z.string(), z.number()]).optional(),
        exciseAmount: z.union([z.string(), z.number()]).optional(),
        exciseTaxId: z.union([z.string(), z.number()]).optional(),
        unitType: z.string().optional(),
        unitTypeId: z.union([z.string(), z.number()]).optional(),
        isExciseTaxExclusive: z.boolean().optional(),
      })
    )
    .min(1, 'Atleast one invoice sub detail is mandatory'),
  poNumber: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .optional(),
  grnRemarks: z.string().optional(),
  supplierReferenceNumber: z.string().optional(),
  currency: z.union([z.string(), z.number()]).optional(),
  receiptAttachmentDescription: z.string().optional(),
});

const CreateGoodsReceivedNote = ({
  goodsReceivedNoteAction,
  supplierInvoiceActions,
  customerInvoiceActions,
  ProductActions,
  goodsReceivedNoteCreateAction,
  currencyConvertActions,
  commonActions,
  purchaseOrderDetailsAction,
  history,
  location,
  vat_list,
  product_list,
  supplier_list,
  currency_convert_list,
  universal_currency_list,
  po_list,
  country_list,
  product_category_list,
}) => {
  const [supplierCurrencySymbol, setSupplierCurrencySymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [data, setData] = useState([
    {
      id: 0,
      description: '',
      quantity: 1,
      unitPrice: '',
      grnReceivedQuantity: '',
      vatCategoryId: '',
      exciseTaxId: '',
      exciseAmount: '',
      subTotal: 0,
      vatAmount: 0,
      productId: '',
      isExciseTaxExclusive: '',
      unitType: '',
      unitTypeId: '',
    },
  ]);
  const [idCount, setIdCount] = useState(0);
  const [contactType] = useState(1);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [fileName, setFileName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [exist, setExist] = useState(false);
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [supplierCurrency, setSupplierCurrency] = useState('');
  const [supplierCurrencyDes, setSupplierCurrencyDes] = useState('');
  const [basecurrency, setBasecurrency] = useState([]);

  const uploadFileRef = useRef(null);
  const regEx = /^[0-9\b]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  const regExInvNum = /[a-zA-Z0-9-/]+$/;

  const form = useForm({
    resolver: zodResolver(createGoodsReceivedNoteSchema),
    defaultValues: {
      contact_po_number: '',
      currencyCode: '',
      grnReceiveDate: new Date(),
      rfqExpiryDate: new Date(),
      supplierId: null,
      placeOfSupplyId: '',
      project: '',
      exchangeRate: '',
      poNumber: null,
      lineItemsString: [
        {
          id: 0,
          description: '',
          quantity: '',
          poQuantity: '',
          productId: '',
          subTotal: 0,
        },
      ],
      grn_Number: '',
      total_net: 0,
      totalAmount: 0,
      invoiceVATAmount: 0,
      term: '',
      grnRemarks: '',
      discount: 0,
      discountPercentage: 0,
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors, touchedFields }, watch, setValue, getValues, setError, clearErrors } = form;

  strings.setLanguage(language);

  const getCurrency = useCallback((opt) => {
    let supplier_currencyCode = 0;

    supplier_list.forEach(item => {
      if (item.label.contactId == opt) {
        setSupplierCurrency(item.label.currency.currencyCode);
        setSupplierCurrencyDes(item.label.currency.currencyName);
        setSupplierCurrencySymbol(item.label.currency.currencyIsoCode);
        supplier_currencyCode = item.label.currency.currencyCode;
      }
    });

    return supplier_currencyCode;
  }, [supplier_list]);

  const setExchange = useCallback((value) => {
    const result = currency_convert_list.filter((obj) => obj.currencyCode === value);
    if (result && result[0] && result[0].exchangeRate) {
      setValue('exchangeRate', result[0].exchangeRate);
    }
  }, [currency_convert_list, setValue]);

  const setCurrency = useCallback((value) => {
    const result = currency_convert_list.filter((obj) => obj.currencyCode === value);
    if (result && result[0]) {
      setValue('curreancyname', result[0].currencyName);
    }
  }, [currency_convert_list, setValue]);

  const salesCategoryFetch = useCallback(() => {
    try {
      ProductActions.getTransactionCategoryListForSalesProduct('2').then((res) => {
        if (res.status === 200) {
          setSalesCategory(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, [ProductActions]);

  const purchaseCategoryFetch = useCallback(() => {
    try {
      ProductActions.getTransactionCategoryListForPurchaseProduct('10').then((res) => {
        if (res.status === 200) {
          setPurchaseCategory(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, [ProductActions]);

  const getInvoiceNo = useCallback(() => {
    goodsReceivedNoteCreateAction.getInvoiceNo().then((res) => {
      if (res.status === 200) {
        setValue('grn_Number', res.data);
        validationCheck(res.data);
      }
    });
  }, [goodsReceivedNoteCreateAction, setValue]);

  const validationCheck = useCallback((value) => {
    const data = {
      moduleType: 13,
      name: value,
    };
    goodsReceivedNoteCreateAction.checkValidation(data).then((response) => {
      if (response.data === 'GRN Number Already Exists') {
        setExist(true);
        setError('grn_Number', {
          type: 'manual',
          message: 'GRN number already exists',
        });
      } else {
        setExist(false);
        clearErrors('grn_Number');
      }
    });
  }, [goodsReceivedNoteCreateAction, setError, clearErrors]);

  const getCompanyCurrency = useCallback(() => {
    currencyConvertActions.getCompanyCurrency().then((res) => {
      if (res.status === 200) {
        setBasecurrency(res.data);
      }
    }).catch((err) => {
      commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong');
      setLoading(false);
    });
  }, [currencyConvertActions, commonActions]);

  const getParentGrnDetails = useCallback((parentId) => {
    goodsReceivedNoteCreateAction.getGRNById(parentId).then((res) => {
      if (res.status === 200) {
        getCompanyCurrency();
        purchaseCategoryFetch();

        const lineItems = res.data.poQuatationLineItemRequestModelList || [];

        setValue('grnReceiveDate', res.data.grnReceiveDate ? dayjs(res.data.grnReceiveDate).format('DD-MM-YYYY') : '');
        setValue('grnReceiveDate1', res.data.grnReceiveDate || '');
        setValue('supplierId', res.data.supplierId || '');
        setValue('grnNumber', res.data.grnNumber || '');
        setValue('totalVatAmount', res.data.totalVatAmount || 0);
        setValue('total_excise', res.data.totalExciseAmount || 0);
        setValue('totalAmount', res.data.totalAmount || 0);
        setValue('total_net', 0);
        setValue('grnRemarks', res.data.grnRemarks || '');
        setValue('lineItemsString', lineItems);
        setValue('supplierReferenceNumber', res.data.supplierReferenceNumber || '');
        setValue('poNumber', res.data.poNumber || '');

        setData(lineItems);
        setLoading(false);

        if (lineItems.length > 0) {
          const maxId = Math.max(...lineItems.map((item) => item.id), 0);
          setIdCount(maxId);

          let tmpSupplier_list = [];
          supplier_list.forEach(item => {
            let obj = { label: item.label.contactName, value: item.value };
            tmpSupplier_list.push(obj);
          });

          const supplier = tmpSupplier_list &&
            selectOptionsFactory
              .renderOptions('label', 'value', tmpSupplier_list, strings.CustomerName)
              .find(option => option.value == res.data.supplierId);

          setValue('supplierId', supplier);
          setValue('currency', getCurrency(res.data.supplierId));
          setValue('grnRemarks', res.data.grnRemarks);

          const po = selectOptionsFactory
            .renderOptions('label', 'value', po_list, 'PO Number')
            .find(option => option.label == res.data.poNumber);

          setValue('poNumber', po);
          addRow();
        } else {
          setIdCount(0);
        }

        getCurrency(res.data.supplierId);
      }
    });
  }, [goodsReceivedNoteCreateAction, getCompanyCurrency, purchaseCategoryFetch, supplier_list, po_list, getCurrency, setValue]);

  const getInitialData = useCallback(() => {
    getInvoiceNo();
    goodsReceivedNoteAction.getSupplierList(contactType);
    goodsReceivedNoteAction.getPurchaseOrderListForDropdown();
    currencyConvertActions.getCurrencyConversionList().then((response) => {
      setValue('currencyCode', response.data ? parseInt(response.data[0].currencyCode) : '');
    });
    goodsReceivedNoteAction.getInvoicePrefix().then((response) => {
      setPrefix(response.data);
    });
    goodsReceivedNoteAction.getVatList();
    goodsReceivedNoteAction.getCountryList();
    goodsReceivedNoteAction.getProductList();
    ProductActions.getProductCategoryList();
    purchaseCategoryFetch();
    salesCategoryFetch();
    getCompanyCurrency();
  }, [goodsReceivedNoteAction, currencyConvertActions, ProductActions, getInvoiceNo, purchaseCategoryFetch, salesCategoryFetch, getCompanyCurrency, contactType, setValue]);

  useEffect(() => {
    goodsReceivedNoteAction.getVatList();

    // PO to GRN Shortcut
    if (location.state && location.state.poId) {
      goodsReceivedNoteAction.getPurchaseOrderListForDropdown();
      const option = {
        value: location.state.poId,
        label: location.state.poNumber,
      };
      getPoDetails(option, option.value);
    }

    getInitialData();

    if (location.state && location.state.contactData) {
      getCurrentUser(location.state.contactData);
    }

    // make a duplicate
    if (location.state && location.state.parentId) {
      getParentGrnDetails(location.state.parentId);
    }
  }, []);

  const addRow = () => {
    const currentData = [...data];
    const newRow = {
      id: idCount + 1,
      description: '',
      quantity: 1,
      grnReceivedQuantity: '',
      poQuantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      subTotal: 0,
      productId: '',
      unitType: '',
      unitTypeId: '',
    };

    setData([...currentData, newRow]);
    setIdCount(idCount + 1);
    setValue('lineItemsString', [...currentData, newRow]);
  };

  const selectItem = (e, row, name) => {
    const newData = [...data];
    const idx = newData.findIndex((obj) => obj.id === row.id);

    if (idx !== -1) {
      newData[idx][name] = e;
      setData(newData);

      if (name === 'unitPrice' || name === 'vatCategoryId' || name === 'quantity' || name === 'poQuantity' || name === 'grnReceivedQuantity') {
        updateAmount(newData);
      }

      setValue(`lineItemsString.${idx}.${name}`, e);
    }
  };

  const updateAmount = (dataItems) => {
    let total_net = 0;
    let total_excise = 0;
    let total_vat = 0;
    let discount = 0;

    dataItems.forEach((obj) => {
      const index = obj.vatCategoryId !== '' ? vat_list.findIndex((item) => item.id === +obj.vatCategoryId) : '';
      const vat = index !== '' && index !== -1 ? vat_list[index].vat : 0;

      let net_value = 0;

      // Excise calculation
      if (obj.exciseTaxId != 0) {
        if (obj.isExciseTaxExclusive === true) {
          if (obj.exciseTaxId === 1) {
            const value = +obj.unitPrice / 2;
            net_value = parseFloat(obj.unitPrice) + parseFloat(value);
            obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
          } else if (obj.exciseTaxId === 2) {
            const value = obj.unitPrice;
            net_value = parseFloat(obj.unitPrice) + parseFloat(value);
            obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
          } else {
            net_value = obj.unitPrice;
          }
        } else {
          if (obj.exciseTaxId === 1) {
            const value = obj.unitPrice / 3;
            obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
            net_value = obj.unitPrice;
          } else if (obj.exciseTaxId === 2) {
            const value = obj.unitPrice / 2;
            obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
            net_value = obj.unitPrice;
          } else {
            net_value = obj.unitPrice;
          }
        }
      } else {
        net_value = obj.unitPrice;
        obj.exciseAmount = 0;
      }

      // VAT calculation
      let val = 0;
      let val1 = 0;

      if (obj.discountType === 'PERCENTAGE') {
        val = ((+net_value - +(net_value * obj.discount) / 100) * vat * obj.grnReceivedQuantity) / 100;
        val1 = (+net_value - +(net_value * obj.discount) / 100) * obj.grnReceivedQuantity;
      } else if (obj.discountType === 'FIXED') {
        val = (net_value * obj.grnReceivedQuantity - obj.discount) * (vat / 100);
        val1 = net_value * obj.grnReceivedQuantity - obj.discount;
      } else {
        val = (+net_value * vat * obj.grnReceivedQuantity) / 100;
        val1 = net_value * obj.grnReceivedQuantity;
      }

      discount = +(discount + net_value * obj.grnReceivedQuantity) - parseFloat(val1);
      total_net = +(total_net + net_value * obj.grnReceivedQuantity);
      total_vat = +(total_vat + val);
      obj.vatAmount = val;
      obj.subTotal = net_value && obj.vatCategoryId ? parseFloat(val1) + parseFloat(val) : 0;
      total_excise = +(total_excise + obj.exciseAmount);
    });

    const total = total_vat + total_net;

    setData(dataItems);
    setValue('total_net', discount ? total_net - discount : total_net);
    setValue('totalVatAmount', total_vat);
    setValue('discount', discount || 0);
    setValue('totalAmount', total_net > discount ? total - discount : total - discount);
    setValue('total_excise', total_excise);
  };

  const prductValue = (e, row) => {
    const result = product_list.find((item) => item.id === parseInt(e));
    const newData = [...data];
    const idx = newData.findIndex((obj) => obj.id === row.id);

    if (idx !== -1 && result) {
      newData[idx]['unitPrice'] = result.unitPrice;
      newData[idx]['vatCategoryId'] = result.vatCategoryId;
      newData[idx]['description'] = result.description;
      newData[idx]['exciseTaxId'] = result.exciseTaxId;
      newData[idx]['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
      newData[idx]['unitType'] = result.unitType;
      newData[idx]['unitTypeId'] = result.unitTypeId;
      newData[idx]['grnReceivedQuantity'] = 1;

      setValue(`lineItemsString.${idx}.vatCategoryId`, result.vatCategoryId);
      setValue(`lineItemsString.${idx}.unitPrice`, result.unitPrice);
      setValue(`lineItemsString.${idx}.exciseTaxId`, result.exciseTaxId);
      setValue(`lineItemsString.${idx}.description`, result.description);

      updateAmount(newData);
    }
  };

  const deleteRow = (e, row) => {
    e.preventDefault();
    const newData = data.filter((obj) => obj.id !== row.id);
    setValue('lineItemsString', newData);
    setData(newData);
    updateAmount(newData);
  };

  const checkedRow = () => {
    if (data.length > 0) {
      let length = data.length - 1;
      let temp = Object.values(data[length]).indexOf('');
      if (temp > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const renderGRNQuantity = (cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <div>
        <div className="input-group">
          <Input
            type="text"
            min="0"
            maxLength="10"
            value={row['grnReceivedQuantity'] || 0}
            onChange={(e) => {
              if (e.target.value === '' || regEx.test(e.target.value)) {
                selectItem(e.target.value, row, 'grnReceivedQuantity');
              }
            }}
            placeholder={strings.ReceivedQuantity}
            className={`form-control w-50 ${
              errors.lineItemsString?.[idx]?.grnReceivedQuantity && touchedFields.lineItemsString?.[idx]?.grnReceivedQuantity
                ? 'is-invalid'
                : ''
            }`}
          />
          {row['productId'] != '' ? <Input value={row['unitType']} disabled /> : ''}
        </div>
        {row['grnReceivedQuantity'] <= 0 && <div className="invalid-feedback">Please Enter Quantity</div>}
      </div>
    );
  };

  const renderPoQuantity = (cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <div>
        <div className="input-group">
          <Input
            disabled
            type="number"
            min="0"
            maxLength="100"
            value={row['quantity'] || 0}
            onChange={(e) => {
              if (e.target.value === '' || regEx.test(e.target.value)) {
                selectItem(e.target.value, row, 'quantity');
              }
            }}
            placeholder={strings.Quantity}
            className={`form-control w-50 ${
              errors.lineItemsString?.[idx]?.quantity && touchedFields.lineItemsString?.[idx]?.quantity
                ? 'is-invalid'
                : ''
            }`}
          />
          {row['productId'] != '' ? <Input value={row['unitType']} disabled /> : ''}
        </div>
        {errors.lineItemsString?.[idx]?.quantity && touchedFields.lineItemsString?.[idx]?.quantity && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].quantity.message}</div>
        )}
      </div>
    );
  };

  const renderProduct = (cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <>
        <Select
          options={product_list ? optionFactory.renderOptions('name', 'id', product_list, 'Product') : []}
          id="productId"
          placeholder={strings.Select + strings.Product}
          onChange={(e) => {
            if (e && e.label !== 'Select Product') {
              selectItem(e.value, row, 'productId');
              prductValue(e.value, row);
              if (checkedRow() === false) addRow();
            } else {
              setValue(`lineItemsString.${idx}.productId`, e.value);
              setData([
                {
                  id: 0,
                  description: '',
                  quantity: '',
                  grnReceivedQuantity: 1,
                  poQuantity: '',
                  unitPrice: '',
                  vatCategoryId: '',
                  subTotal: 0,
                  productId: '',
                },
              ]);
            }
          }}
          value={
            product_list && row.productId
              ? selectOptionsFactory
                  .renderOptions('name', 'id', product_list, 'Product')
                  .find((option) => option.value === +row.productId)
              : []
          }
          className={`${
            errors.lineItemsString?.[idx]?.productId && touchedFields.lineItemsString?.[idx]?.productId
              ? 'is-invalid'
              : ''
          }`}
        />
        {errors.lineItemsString?.[idx]?.productId && touchedFields.lineItemsString?.[idx]?.productId && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].productId.message}</div>
        )}
        {row['productId'] != '' ? (
          <div className="mt-1">
            <Input
              type="text"
              maxLength="250"
              value={row['description'] !== '' && row['description'] !== null ? row['description'] : ''}
              onChange={(e) => {
                selectItem(e.target.value, row, 'description');
              }}
              placeholder={strings.Description}
              className={`form-control ${
                errors.lineItemsString?.[idx]?.description && touchedFields.lineItemsString?.[idx]?.description
                  ? 'is-invalid'
                  : ''
              }`}
            />
          </div>
        ) : ''}
      </>
    );
  };

  const renderActions = (cell, rows) => {
    return rows['productId'] != '' ? (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon mt-1"
        onClick={(e) => {
          deleteRow(e, rows);
        }}
      >
        <i className="fas fa-trash"></i>
      </Button>
    ) : '';
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    if (file) {
      setValue('attachmentFile', file);
      setFileName(file.name);
    }
  };

  const getCurrentUser = (contactData) => {
    let option;
    if (contactData.label || contactData.value) {
      option = contactData;
    } else {
      option = {
        label: `${contactData.fullName}`,
        value: contactData.id,
      };
    }

    const result = currency_convert_list.filter((obj) => obj.currencyCode === contactData.currencyCode);

    setSupplierCurrency(contactData.currencyCode);
    setSupplierCurrencyDes(result[0] && result[0].currencyName ? result[0].currencyName : 'AED');
    setSupplierCurrencySymbol(contactData.currencyIso ? contactData.currencyIso : 'AED');

    setValue('contactId', option);
    setValue('supplierId', option);

    if (result[0] && result[0].currencyCode) {
      setValue('currency', result[0].currencyCode);
    }

    setValue('taxTreatmentid', contactData.taxTreatmentId);

    if (result[0] && result[0].exchangeRate) {
      setValue('exchangeRate', result[0].exchangeRate);
    }
  };

  const closeSupplierModal = (res) => {
    if (res) {
      goodsReceivedNoteAction.getSupplierList(contactType);
      getInvoiceNo();
    }
    setOpenSupplierModal(false);
  };

  const closeProductModal = () => {
    setOpenProductModal(false);
  };

  const getCurrentProduct = () => {
    goodsReceivedNoteAction.getProductList().then((res) => {
      let newData = data.filter((obj) => obj.productId !== '');

      setData([
        ...newData,
        {
          id: idCount + 1,
          description: res.data[0].description,
          quantity: 1,
          grnReceivedQuantity: 1,
          poQuantity: 1,
          unitPrice: res.data[0].unitPrice,
          vatCategoryId: res.data[0].vatCategoryId,
          exciseTaxId: res.data[0].exciseTaxId,
          subTotal: res.data[0].unitPrice,
          productId: res.data[0].id,
          discount: 0,
          vatAmount: res.data[0].vatAmount ? res.data[0].vatAmount : 0,
          discountType: res.data[0].discountType,
          unitType: res.data[0].unitType,
          unitTypeId: res.data[0].unitTypeId,
        },
      ]);
      setIdCount(idCount + 1);

      setValue(`lineItemsString.${0}.unitPrice`, res.data[0].unitPrice);
      setValue(`lineItemsString.${0}.unitType`, res.data[0].unitType);
      setValue(`lineItemsString.${0}.quantity`, 1);
      setValue(`lineItemsString.${0}.grnReceivedQuantity`, 1);
      setValue(`lineItemsString.${0}.vatCategoryId`, res.data[0].vatCategoryId);
      setValue(`lineItemsString.${0}.productId`, res.data[0].id);
    });
  };

  const getPoDetails = (e, rowValue) => {
    if (e && e.label !== 'Select RFQ') {
      purchaseOrderDetailsAction.getPOById(e.value).then((response) => {
        const poData = response.data;

        setValue('supplierId', {
          label: poData.supplierName,
          value: poData.supplierId,
        });
        setValue('lineItemsString', poData.poQuatationLineItemRequestModelList);
        setValue('currencyCode', poData.currencyCode);
        setValue('supplierReferenceNumber', poData.supplierReferenceNumber);
        setValue('grnRemarks', poData.poNumber);

        setData(poData.poQuatationLineItemRequestModelList);
        setSupplierCurrency(poData.currencyCode);
        setSupplierCurrencySymbol(poData.currencySymbol);
      });
    }
  };

  const onSubmit = (formData) => {
    if (exist) {
      setError('grn_Number', {
        type: 'manual',
        message: 'GRN number already exists',
      });
      return;
    }

    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Goods Received Note...');

    let submitData = new FormData();
    submitData.append('grnNumber', formData.grn_Number !== null ? prefix + formData.grn_Number : '');
    submitData.append('grnReceiveDate', formData.grnReceiveDate || '');
    submitData.append('grnRemarks', formData.grnRemarks || '');
    submitData.append('type', 5);
    submitData.append('lineItemsString', JSON.stringify(data));
    submitData.append('totalExciseAmount', watch('total_excise'));
    submitData.append('totalVatAmount', watch('totalVatAmount'));
    submitData.append('totalAmount', watch('totalAmount'));

    if (formData.supplierId && formData.supplierId.value) {
      submitData.append('supplierId', formData.supplierId.value);
    }

    if (uploadFileRef.current && uploadFileRef.current.files && uploadFileRef.current.files[0]) {
      submitData.append('attachmentFile', uploadFileRef.current.files[0]);
    }

    if (formData.poNumber && formData.poNumber.value) {
      submitData.append('poId', formData.poNumber.value);
    }

    submitData.append('currencyCode', supplierCurrency);
    submitData.append('supplierReferenceNumber', formData.supplierReferenceNumber || '');

    goodsReceivedNoteCreateAction.createGNR(submitData).then((res) => {
      setDisabled(false);
      commonActions.tostifyAlert('success', res.data ? res.data.message : 'Goods Received Note Created Successfully');

      if (createMore) {
        setCreateMore(false);
        setSupplierCurrency('');
        setData([
          {
            id: 0,
            description: '',
            quantity: 1,
            unitPrice: '',
            grnReceivedQuantity: 1,
            vatCategoryId: '',
            exciseTaxId: '',
            exciseAmount: '',
            subTotal: 0,
            vatAmount: 0,
            productId: '',
            isExciseTaxExclusive: '',
            unitType: '',
            unitTypeId: '',
          },
        ]);
        setLoading(false);
        getInvoiceNo();
        setValue('lineItemsString', data);
      } else {
        history.push('/admin/expense/goods-received-note');
        setLoading(false);
      }
    }).catch((err) => {
      setDisabled(false);
      setLoading(false);
      commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Goods Received Note Created Unsuccessfully');
    });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  let tmpSupplier_list = [];
  supplier_list.forEach(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpSupplier_list.push(obj);
  });

  return (
    <div>
      <div className="create-supplier-invoice-screen">
        <div className="fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <img alt="invoiceimage" src={invoiceimage} style={{ width: '40px' }} />
                        <span className="ml-2">{strings.CreateGoodsReceivedNote}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="poNumber">{strings.PONumber}</Label>
                              <Controller
                                name="poNumber"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    isDisabled={location.state && location.state.poId ? true : false}
                                    styles={selectStyles}
                                    id="poNumber"
                                    placeholder={strings.Select + strings.PONumber}
                                    options={po_list ? selectOptionsFactory.renderOptions('label', 'value', po_list, 'PO Number') : []}
                                    value={
                                      po_list && location.state && location.state.poId
                                        ? selectOptionsFactory
                                            .renderOptions('label', 'value', po_list, 'PO Number')
                                            .find((option) => option.value == location.state.poId)
                                        : field.value
                                    }
                                    onChange={(option) => {
                                      if (option && option.value) {
                                        getPoDetails(option, option.value);
                                        field.onChange(option);
                                      } else {
                                        field.onChange('');
                                      }
                                    }}
                                    className={errors.poNumber ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.poNumber && <div className="invalid-feedback">{errors.poNumber.message}</div>}
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="grn_Number">
                                <span className="text-danger">* </span>
                                {strings.GRNNUMBER}
                              </Label>
                              <Controller
                                name="grn_Number"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="50"
                                    id="grn_Number"
                                    placeholder={strings.InvoiceNumber}
                                    {...field}
                                    onChange={(e) => {
                                      if (e.target.value === '' || regExInvNum.test(e.target.value)) {
                                        field.onChange(e);
                                      }
                                      validationCheck(e.target.value);
                                    }}
                                    className={errors.grn_Number ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.grn_Number && <div className="invalid-feedback">{errors.grn_Number.message}</div>}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="supplierId">
                                <span className="text-danger">* </span>
                                {strings.SupplierName}
                              </Label>
                              <Controller
                                name="supplierId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    id="supplierId"
                                    placeholder={strings.Select + strings.SupplierName}
                                    options={tmpSupplier_list ? selectOptionsFactory.renderOptions('label', 'value', tmpSupplier_list, 'Supplier Name') : []}
                                    value={field.value}
                                    isDisabled={location.state && location.state.poId ? true : false}
                                    onChange={(option) => {
                                      if (option && option.value) {
                                        setValue('currency', getCurrency(option.value));
                                        setExchange(getCurrency(option.value));
                                        field.onChange(option);
                                      } else {
                                        field.onChange('');
                                      }
                                    }}
                                    className={errors.supplierId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.supplierId && <div className="invalid-feedback">{errors.supplierId.message}</div>}
                            </FormGroup>
                          </Col>
                          {!(location.state && location.state.poId) && (
                            <Col lg={3}>
                              <Label htmlFor="contactId" style={{ display: 'block' }}>
                                {strings.AddNewSupplier}
                              </Label>
                              <Button color="primary" className="btn-square" onClick={() => setOpenSupplierModal(true)}>
                                <i className="fas fa-plus mr-1" />
                                {strings.AddASupplier}
                              </Button>
                            </Col>
                          )}
                        </Row>
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="currency">
                                <span className="text-danger">* </span>
                                {strings.Currency}
                              </Label>
                              <Controller
                                name="currency"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    isDisabled={true}
                                    placeholder={strings.Select + strings.Currency}
                                    styles={selectStyles}
                                    options={
                                      currency_convert_list
                                        ? selectCurrencyFactory.renderOptions(
                                            'currencyName',
                                            'currencyCode',
                                            currency_convert_list,
                                            'Currency'
                                          )
                                        : []
                                    }
                                    id="currency"
                                    value={
                                      currency_convert_list &&
                                      selectCurrencyFactory
                                        .renderOptions('currencyName', 'currencyCode', currency_convert_list, 'Currency')
                                        .find((option) => option.value === supplierCurrency)
                                    }
                                    onChange={(option) => {
                                      field.onChange(option);
                                      setExchange(option.value);
                                      setCurrency(option.value);
                                    }}
                                    className={`${errors.currency ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.currency && <div className="invalid-feedback">{errors.currency.message}</div>}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="date">
                                <span className="text-danger">* </span>
                                {strings.ReceivedDate}
                              </Label>
                              <Controller
                                name="grnReceiveDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="date"
                                    className={`form-control ${errors.grnReceiveDate ? 'is-invalid' : ''}`}
                                    placeholderText={strings.OrderDate}
                                    selected={field.value ? field.value : new Date()}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    dateFormat="dd-MM-yyyy"
                                    minDate={new Date()}
                                    onChange={(value) => {
                                      field.onChange(value);
                                    }}
                                  />
                                )}
                              />
                              {errors.grnReceiveDate && (
                                <div className="invalid-feedback">
                                  {errors.grnReceiveDate.message.includes('nullable()') ? 'Order date is required' : errors.grnReceiveDate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          {watch('supplierReferenceNumber') && (
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="supplierReferenceNumber">{strings.SupplierReferenceNumber}</Label>
                                <Controller
                                  name="supplierReferenceNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="20"
                                      disabled={true}
                                      id="supplierReferenceNumber"
                                      placeholder={strings.Select + strings.ReferenceNumber}
                                      {...field}
                                      className={errors.supplierReferenceNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.supplierReferenceNumber && (
                                  <div className="invalid-feedback">{errors.supplierReferenceNumber.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                          )}
                        </Row>
                        <Row>
                          <Col lg={12} className="mb-3">
                            {!(location.state && location.state.poId) && (
                              <Button
                                color="primary"
                                className="btn-square mr-3"
                                onClick={() => {
                                  setOpenProductModal(true);
                                }}
                                disabled={watch('poNumber') ? true : false}
                              >
                                <i className="fa fa-plus"></i>&nbsp;{strings.Addproduct}
                              </Button>
                            )}
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            {typeof errors.lineItemsString === 'string' && (
                              <div className={errors.lineItemsString ? 'is-invalid' : ''}>
                                <div className="invalid-feedback">{errors.lineItemsString}</div>
                              </div>
                            )}
                            <BootstrapTable data={data} version="4" hover keyField="id" className="invoice-create-table">
                              <TableHeaderColumn
                                width="4%"
                                dataAlign="center"
                                dataFormat={(cell, rows) => renderActions(cell, rows)}
                              ></TableHeaderColumn>
                              <TableHeaderColumn
                                width="17%"
                                dataField="product"
                                dataFormat={(cell, rows) => renderProduct(cell, rows)}
                              >
                                {strings.PRODUCT}
                              </TableHeaderColumn>
                              <TableHeaderColumn
                                dataField="poQuantity"
                                width="13%"
                                dataFormat={(cell, rows) => renderGRNQuantity(cell, rows)}
                              >
                                {strings.RECEIVEDQUANTITY}
                              </TableHeaderColumn>
                              <TableHeaderColumn
                                dataField="quantity"
                                width="10%"
                                dataFormat={(cell, rows) => renderPoQuantity(cell, rows)}
                              >
                                {strings.POQUANTITY}
                              </TableHeaderColumn>
                            </BootstrapTable>
                          </Col>
                        </Row>
                        <hr />
                        {data.length > 0 && (
                          <Row>
                            <Col lg={8}>
                              <Row>
                                <Col lg={6}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="grnRemarks">{strings.GRNREMARKS}</Label>
                                    <Controller
                                      name="grnRemarks"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          type="text"
                                          maxLength="100"
                                          id="grnRemarks"
                                          placeholder={strings.GRNREMARKS}
                                          {...field}
                                          className={errors.grnRemarks ? 'is-invalid' : ''}
                                        />
                                      )}
                                    />
                                    {errors.grnRemarks && (
                                      <div className="invalid-feedback">{errors.grnRemarks.message}</div>
                                    )}
                                  </FormGroup>
                                </Col>
                                <Col lg={6}>
                                  <FormGroup className="mb-3 hideAttachment">
                                    <Controller
                                      name="attachmentFile"
                                      control={control}
                                      render={({ field }) => (
                                        <div>
                                          <Label>{strings.ReceiptAttachment}</Label> <br />
                                          <Button
                                            color="primary"
                                            onClick={() => {
                                              document.getElementById('fileInput').click();
                                            }}
                                            className="btn-square mr-3"
                                          >
                                            <i className="fa fa-upload"></i> {strings.upload}
                                          </Button>
                                          <input
                                            id="fileInput"
                                            ref={uploadFileRef}
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                          />
                                          {fileName && (
                                            <div>
                                              <i className="fa fa-close" onClick={() => setFileName('')}></i> {fileName}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    />
                                    {errors.attachmentFile && (
                                      <div className="invalid-file">{errors.attachmentFile.message}</div>
                                    )}
                                  </FormGroup>
                                </Col>
                              </Row>
                              <FormGroup className="mb-3 hideAttachment">
                                <Label htmlFor="receiptAttachmentDescription">{strings.AttachmentDescription}</Label>
                                <br />
                                <Controller
                                  name="receiptAttachmentDescription"
                                  control={control}
                                  render={({ field }) => (
                                    <TextareaAutosize
                                      type="textarea"
                                      className="textarea form-control"
                                      maxLength="250"
                                      style={{ width: '700px' }}
                                      id="receiptAttachmentDescription"
                                      rows="2"
                                      placeholder={strings.ReceiptAttachmentDescription}
                                      {...field}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        )}
                        <Row>
                          <Col lg={8} className="mt-5">
                            <FormGroup className="text-right">
                              <Button
                                type="button"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => {
                                  if (data.length === 1) {
                                    if (errors && Object.keys(errors).length != 0) {
                                      commonActions.fillManDatoryDetails();
                                    }
                                  } else {
                                    let newData = data.filter((obj) => obj.productId !== '');
                                    setValue('lineItemsString', newData);
                                    updateAmount(newData);
                                  }
                                  setCreateMore(false);
                                  handleSubmit(onSubmit)();
                                }}
                              >
                                <i className="fa fa-dot-circle-o"></i> {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              {!(location.state && location.state.parentId) && (
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={disabled}
                                  onClick={() => {
                                    if (data.length === 1) {
                                      if (errors && Object.keys(errors).length != 0) {
                                        commonActions.fillManDatoryDetails();
                                      }
                                    } else {
                                      let newData = data.filter((obj) => obj.productId !== '');
                                      setValue('lineItemsString', newData);
                                      updateAmount(newData);
                                    }
                                    setCreateMore(true);
                                    handleSubmit(onSubmit)();
                                  }}
                                >
                                  <i className="fa fa-repeat mr-1"></i>
                                  {disabled ? 'Creating...' : strings.CreateandMore}
                                </Button>
                              )}
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/expense/goods-received-note');
                                }}
                              >
                                <i className="fa fa-ban"></i> {strings.Cancel}
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
        <SupplierModal
          openSupplierModal={openSupplierModal}
          closeSupplierModal={(e) => {
            closeSupplierModal(e);
          }}
          getCurrentUser={(e) => {
            goodsReceivedNoteAction.getSupplierList(contactType);
            getCurrentUser(e);
          }}
          createSupplier={goodsReceivedNoteAction.createSupplier}
          getStateList={goodsReceivedNoteAction.getStateList}
          currency_list={currency_convert_list}
          country_list={country_list}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={(e) => {
            closeProductModal(e);
          }}
          getCurrentProduct={(e) => {
            supplierInvoiceActions.getProductList();
            getCurrentProduct(e);
          }}
          createProduct={ProductActions.createAndSaveProduct}
          vat_list={vat_list}
          product_category_list={product_category_list}
          salesCategory={salesCategory}
          purchaseCategory={purchaseCategory}
        />
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateGoodsReceivedNote);
