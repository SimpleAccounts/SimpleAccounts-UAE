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
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as GoodsReceivedNoteDetailsAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { Loader, ConfirmDeleteModal, LeavePage } from 'components';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectCurrencyFactory } from 'utils';
import { TextareaAutosize } from '@material-ui/core';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { selectStyles } from 'utils';

const mapStateToProps = (state) => {
  return {
    project_list: state.request_for_quotation.project_list,
    contact_list: state.request_for_quotation.contact_list,
    currency_list: state.request_for_quotation.currency_list,
    vat_list: state.request_for_quotation.vat_list,
    product_list: state.customer_invoice.product_list,
    supplier_list: state.request_for_quotation.supplier_list,
    country_list: state.request_for_quotation.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
    goodsReceivedNoteDetailsAction: bindActionCreators(GoodsReceivedNoteDetailsAction, dispatch),
    requestForQuotationAction: bindActionCreators(RequestForQuotationAction, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
  };
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    },
  }),
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const detailGoodsReceivedNoteSchema = z.object({
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
});

const DetailGoodsReceivedNote = ({
  goodsReceivedNoteDetailsAction,
  requestForQuotationAction,
  ProductActions,
  currencyConvertActions,
  commonActions,
  history,
  location,
  vat_list,
  product_list,
  supplier_list,
  currency_convert_list,
  universal_currency_list,
  country_list,
  product_category_list,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(false);
  const [data, setData] = useState([]);
  const [idCount, setIdCount] = useState(0);
  const [contactType] = useState(1);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [currentGrnId, setCurrentGrnId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [basecurrency, setBasecurrency] = useState([]);
  const [supplierCurrency, setSupplierCurrency] = useState('');
  const [supplierCurrencyDes, setSupplierCurrencyDes] = useState('');
  const [supplierCurrencySymbol, setSupplierCurrencySymbol] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [dateChanged, setDateChanged] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [grnReceiveDate, setGrnReceiveDate] = useState('');
  const [grnReceiveDateNotChanged, setGrnReceiveDateNotChanged] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [language] = useState(window['localStorage'].getItem('language'));

  const uploadFileRef = useRef(null);
  const regEx = /^[0-9\b]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const form = useForm({
    resolver: zodResolver(detailGoodsReceivedNoteSchema),
    defaultValues: {
      grnReceiveDate: '',
      grnReceiveDate1: '',
      supplierId: '',
      grnNumber: '',
      totalVatAmount: 0,
      total_excise: 0,
      totalAmount: 0,
      total_net: 0,
      grnRemarks: '',
      lineItemsString: [],
      fileName: '',
      supplierReferenceNumber: '',
      poNumber: '',
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors, touchedFields }, watch, setValue, getValues } = form;

  strings.setLanguage(language);

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

  const calTotalNet = useCallback((dataItems) => {
    let total_net = 0;
    dataItems.forEach((obj) => {
      total_net = +(total_net + (+obj.unitPrice + +obj.exciseAmount) * obj.grnReceivedQuantity);
    });
    setValue('total_net', total_net);
  }, [setValue]);

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

  const initializeData = useCallback(() => {
    if (location.state && location.state.id) {
      goodsReceivedNoteDetailsAction.getGRNById(location.state.id).then((res) => {
        if (res.status === 200) {
          getCompanyCurrency();
          requestForQuotationAction.getVatList();
          requestForQuotationAction.getSupplierList(contactType);
          currencyConvertActions.getCurrencyConversionList();
          requestForQuotationAction.getCountryList();
          requestForQuotationAction.getProductList();
          purchaseCategoryFetch();

          const lineItems = res.data.poQuatationLineItemRequestModelList || [];

          setCurrentGrnId(location.state.id);
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
          setValue('fileName', res.data.fileName || '');
          setValue('supplierReferenceNumber', res.data.supplierReferenceNumber || '');
          setValue('poNumber', res.data.poNumber || '');

          setPoNumber(res.data.poNumber || '');
          setGrnReceiveDateNotChanged(res.data.grnReceiveDate ? dayjs(res.data.grnReceiveDate) : '');
          setGrnReceiveDate(res.data.grnReceiveDate || '');
          setData(lineItems);
          setSelectedContact(res.data.supplierId || '');

          if (lineItems.length > 0) {
            calTotalNet(lineItems);
            const maxId = Math.max(...lineItems.map((item) => item.id), 0);
            setIdCount(maxId);
            addRow();
          } else {
            setIdCount(0);
          }

          setLoading(false);
          getCurrency(res.data.supplierId);
        }
      });
    } else {
      history.push('/admin/expense/goods-received-note');
    }
  }, [location.state, goodsReceivedNoteDetailsAction, requestForQuotationAction, currencyConvertActions, purchaseCategoryFetch, calTotalNet, getCurrency, setValue, contactType, history]);

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

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const addRow = () => {
    const currentData = [...data];
    const newRow = {
      id: idCount + 1,
      description: '',
      quantity: 1,
      grnReceivedQuantity: '',
      unitPrice: '',
      vatCategoryId: '',
      subTotal: 0,
      productId: '',
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

      if (name === 'unitPrice' || name === 'vatCategoryId' || name === 'quantity' || name === 'grnReceivedQuantity') {
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
      newData[idx]['unitPrice'] = parseInt(result.unitPrice);
      newData[idx]['vatCategoryId'] = parseInt(result.vatCategoryId);
      newData[idx]['description'] = result.description;
      newData[idx]['exciseTaxId'] = result.exciseTaxId;
      newData[idx]['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
      newData[idx]['unitType'] = result.unitType;
      newData[idx]['unitTypeId'] = result.unitTypeId;

      setValue(`lineItemsString.${idx}.vatCategoryId`, parseInt(result.vatCategoryId));
      setValue(`lineItemsString.${idx}.unitPrice`, parseInt(result.unitPrice));
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

  const renderDescription = (cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <Input
        type="text"
        maxLength="250"
        value={row['description'] || ''}
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
    );
  };

  const renderGRNQuantity = (cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <div>
        <div className="input-group">
          <Input
            type="text"
            maxLength="10"
            min="0"
            value={row['grnReceivedQuantity'] || 0}
            onChange={(e) => {
              if (e.target.value === '' || regEx.test(e.target.value)) {
                selectItem(e.target.value, row, 'grnReceivedQuantity');
              }
            }}
            placeholder={strings.Quantity}
            className={`form-control w-50 ${
              errors.lineItemsString?.[idx]?.grnReceivedQuantity && touchedFields.lineItemsString?.[idx]?.grnReceivedQuantity
                ? 'is-invalid'
                : ''
            }`}
          />
          {row['productId'] != '' ? <Input value={row['unitType']} disabled /> : ''}
        </div>
        {errors.lineItemsString?.[idx]?.grnReceivedQuantity && touchedFields.lineItemsString?.[idx]?.grnReceivedQuantity && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].grnReceivedQuantity.message}</div>
        )}
      </div>
    );
  };

  const renderQuantity = (cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <div>
        <div className="input-group">
          <Input
            disabled
            type="number"
            min="0"
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
          options={product_list ? selectOptionsFactory.renderOptions('name', 'id', product_list, 'Product') : []}
          value={
            product_list &&
            selectOptionsFactory
              .renderOptions('name', 'id', product_list, 'Product')
              .find((option) => option.value === +row.productId)
          }
          id="productId"
          onChange={(e) => {
            if (e && e.label !== 'Select Product') {
              selectItem(e.value, row, 'productId');
              prductValue(e.value, row);
              addRow();
            }
          }}
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
              value={row['description'] || ''}
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
        className="btn-twitter btn-brand icon"
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

  const setDate = (value) => {
    setDateChanged(true);
    const values1 = value || watch('grnReceiveDate1');
    if (values1) {
      setGrnReceiveDate(dayjs(values1));
      setValue('grnReceiveDate1', values1);
    }
  };

  const onSubmit = (formData) => {
    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Goods Received Note...');

    let submitData = new FormData();
    submitData.append('type', 5);
    submitData.append('id', currentGrnId);
    submitData.append('grnNumber', formData.grnNumber || '');

    if (dateChanged === true) {
      submitData.append('grnReceiveDate', typeof formData.grnReceiveDate === 'string' ? grnReceiveDate : formData.grnReceiveDate);
    } else {
      submitData.append('grnReceiveDate', typeof formData.grnReceiveDate === 'string' ? grnReceiveDateNotChanged : '');
    }

    submitData.append('grnRemarks', formData.grnRemarks || '');
    submitData.append('lineItemsString', JSON.stringify(data));
    submitData.append('totalVatAmount', watch('totalVatAmount'));
    submitData.append('totalAmount', watch('totalAmount'));
    submitData.append('supplierReferenceNumber', formData.supplierReferenceNumber || '');
    submitData.append('poNumber', formData.poNumber || '');

    if (formData.supplierId) {
      submitData.append('supplierId', formData.supplierId);
    }
    if (formData.currency) {
      submitData.append('currencyCode', supplierCurrency);
    }

    goodsReceivedNoteDetailsAction.updateGRN(submitData).then((res) => {
      commonActions.tostifyAlert('success', res.data ? res.data.message : 'Goods Received Note Updated Successfully');
      history.push('/admin/expense/goods-received-note');
      setLoading(false);
    }).catch((err) => {
      commonActions.tostifyAlert('error', err.data ? err.data.message : 'Goods Received Note Updated Unsuccessfully');
      setDisabled(false);
      setLoading(false);
    });
  };

  const deleterfq = () => {
    const message1 = (
      <text>
        <b>Delete Goods Received Note?</b>
      </text>
    );
    const message = 'This Good Received Note will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removerfq}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removerfq = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Goods Received Note...');

    goodsReceivedNoteDetailsAction.deletegrn(currentGrnId).then((res) => {
      if (res.status === 200) {
        commonActions.tostifyAlert('success', res.data ? res.data.message : 'Goods Received Note Deleted Successfully');
        history.push('/admin/expense/goods-received-note');
        setLoading(false);
      }
    }).catch((err) => {
      commonActions.tostifyAlert('error', err.data ? err.data.message : 'Goods Received Note Deleted Unsuccessfully');
      setDisabled1(false);
      setLoading(false);
    });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const closeProductModal = () => {
    setOpenProductModal(false);
  };

  const closeSupplierModal = (res) => {
    if (res) {
      requestForQuotationAction.getSupplierList(contactType);
    }
    setOpenSupplierModal(false);
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
      <div className="detail-supplier-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fas fa-address-book" />
                        <span className="ml-2">{strings.UpdateGoodsReceivedNote}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          {poNumber && (
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="poNumber">{strings.PONumber}</Label>
                                <Controller
                                  name="poNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="poNumber"
                                      placeholder=""
                                      disabled
                                      {...field}
                                      className={errors.poNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.poNumber && <div className="invalid-feedback">{errors.poNumber.message}</div>}
                              </FormGroup>
                            </Col>
                          )}
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="grnNumber">
                                <span className="text-danger">* </span>
                                {strings.GRNNumber}
                              </Label>
                              <Controller
                                name="grnNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="grnNumber"
                                    placeholder=""
                                    disabled
                                    {...field}
                                    className={errors.grnNumber ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.grnNumber && <div className="invalid-feedback">{errors.grnNumber.message}</div>}
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
                                    isDisabled={true}
                                    styles={selectStyles}
                                    id="supplierId"
                                    options={tmpSupplier_list ? selectOptionsFactory.renderOptions('label', 'value', tmpSupplier_list, 'Supplier Name') : []}
                                    value={tmpSupplier_list && tmpSupplier_list.find((option) => option.value === +field.value)}
                                    onChange={(option) => field.onChange(option ? option.value : '')}
                                    className={errors.supplierId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.supplierId && <div className="invalid-feedback">{errors.supplierId.message}</div>}
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="supplierReferenceNumber">{strings.SupplierReferenceNumber}</Label>
                              <Controller
                                name="supplierReferenceNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    disabled={true}
                                    id="supplierReferenceNumber"
                                    placeholder={strings.SupplierReferenceNumber}
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
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="date">
                                <span className="text-danger">* </span>
                                {strings.ReceiveDate}
                              </Label>
                              <Controller
                                name="grnReceiveDate1"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="grnReceiveDate"
                                    placeholderText={strings.InvoiceDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    minDate={new Date()}
                                    dropdownMode="select"
                                    selected={field.value ? new Date(field.value) : null}
                                    onChange={(value) => {
                                      field.onChange(value);
                                      setDate(value);
                                    }}
                                    className={`form-control ${errors.grnReceiveDate ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.grnReceiveDate && (
                                <div className="invalid-feedback">{errors.grnReceiveDate.message}</div>
                              )}
                            </FormGroup>
                          </Col>
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
                                    onChange={(option) => field.onChange(option)}
                                    className={`${errors.currency ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.currency && <div className="invalid-feedback">{errors.currency.message}</div>}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <BootstrapTable data={data} version="4" hover keyField="id" className="invoice-create-table">
                              <TableHeaderColumn
                                width="5%"
                                dataAlign="center"
                                dataFormat={(cell, rows) => renderActions(cell, rows)}
                              ></TableHeaderColumn>
                              <TableHeaderColumn
                                width="12%"
                                dataField="product"
                                dataFormat={(cell, rows) => renderProduct(cell, rows)}
                              >
                                {strings.PRODUCT}
                              </TableHeaderColumn>
                              <TableHeaderColumn
                                dataField="grnReceivedQuantity"
                                width="10%"
                                dataFormat={(cell, rows) => renderGRNQuantity(cell, rows)}
                              >
                                {strings.RECEIVEDQUANTITY}
                              </TableHeaderColumn>
                              <TableHeaderColumn
                                dataField="quantity"
                                width="10%"
                                dataFormat={(cell, rows) => renderQuantity(cell, rows)}
                              >
                                {strings.POQUANTITY}
                              </TableHeaderColumn>
                            </BootstrapTable>
                          </Col>
                        </Row>
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
                          <Col lg={8} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                            <FormGroup>
                              <Button
                                type="button"
                                color="danger"
                                className="btn-square"
                                disabled={disabled1}
                                onClick={deleterfq}
                              >
                                <i className="fa fa-trash"></i> {disabled1 ? 'Deleting...' : strings.Delete}
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button type="submit" color="primary" className="btn-square mr-3" disabled={disabled}>
                                <i className="fa fa-dot-circle-o"></i> {disabled ? 'Updating...' : strings.Update}
                              </Button>
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
          getCurrentUser={(e) => {}}
          createSupplier={requestForQuotationAction.createSupplier}
          currency_list={currency_convert_list}
          country_list={country_list}
          getStateList={requestForQuotationAction.getStateList}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={(e) => {
            closeProductModal(e);
          }}
          getCurrentProduct={(e) => {}}
          createProduct={ProductActions.createAndSaveProduct}
          vat_list={vat_list}
          product_category_list={product_category_list}
          salesCategory={[]}
          purchaseCategory={purchaseCategory}
        />
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailGoodsReceivedNote);
