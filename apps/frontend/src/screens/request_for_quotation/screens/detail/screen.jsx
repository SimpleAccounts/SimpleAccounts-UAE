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
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as RequestForQuotationDetailsAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { Loader, ConfirmDeleteModal, LeavePage } from 'components';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import { TextareaAutosize } from '@material-ui/core';
import './style.scss';
import dayjs from '@/utils/date';
import Switch from 'react-switch';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

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

// File validation constants
const FILE_SIZE = 1024000;
const SUPPORTED_FORMAT = [
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Zod validation schema
const lineItemSchema = z.object({
  quantity: z.union([z.string(), z.number()])
    .refine((val) => Number(val) > 0, 'Quantity should be greater than 0'),
  unitPrice: z.union([z.string(), z.number()])
    .refine((val) => Number(val) > 0, 'Unit price should be greater than 1'),
  vatCategoryId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, 'VAT is required'),
  productId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, 'Product is required'),
  description: z.string().optional(),
  exciseTaxId: z.any().optional(),
  discountType: z.string().optional(),
  discount: z.any().optional(),
  subTotal: z.number().optional(),
  vatAmount: z.number().optional(),
  exciseAmount: z.any().optional(),
  isExciseTaxExclusive: z.any().optional(),
  unitType: z.any().optional(),
  unitTypeId: z.any().optional(),
  id: z.number().optional(),
});

const updateRequestForQuotationSchema = z.object({
  supplierId: z.union([
    z.object({
      label: z.string(),
      value: z.any(),
    }),
    z.string(),
    z.number(),
  ]).refine((val) => val !== null && val !== '', 'Supplier is required'),
  rfqReceiveDate: z.union([z.date(), z.string()]).refine((val) => val !== null && val !== '', 'Issue date is required'),
  rfqExpiryDate: z.union([z.date(), z.string()]).refine((val) => val !== null && val !== '', 'Expiry due date is required'),
  placeOfSupplyId: z.any().optional(),
  currency: z.any().optional(),
  rfqNumber: z.string().optional(),
  notes: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptAttachmentDescription: z.string().optional(),
  attachmentFile: z.any().optional(),
  lineItemsString: z.array(lineItemSchema).min(1, 'Atleast one invoice sub detail is mandatory'),
  taxType: z.boolean().optional(),
  total_net: z.number().optional(),
  totalVatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  total_excise: z.number().optional(),
  discount: z.number().optional(),
});

const mapStateToProps = (state) => {
  return {
    project_list: state.request_for_quotation.project_list,
    contact_list: state.request_for_quotation.contact_list,
    currency_list: state.request_for_quotation.currency_list,
    product_list: state.customer_invoice.product_list,
    excise_list: state.request_for_quotation.excise_list,
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
    requestForQuotationDetailsAction: bindActionCreators(RequestForQuotationDetailsAction, dispatch),
    requestForQuotationAction: bindActionCreators(RequestForQuotationAction, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
  };
};

const DetailRequestForQuotation = ({
  requestForQuotationDetailsAction,
  requestForQuotationAction,
  ProductActions,
  currencyConvertActions,
  commonActions,
  history,
  location,
  product_list,
  supplier_list,
  excise_list,
  currency_convert_list,
  universal_currency_list,
  product_category_list,
  country_list,
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [data, setData] = useState([]);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [supplier_currency, setSupplierCurrency] = useState('');
  const [supplier_currency_symbol, setSupplierCurrencySymbol] = useState('');
  const [supplier_currency_des, setSupplierCurrencyDes] = useState('');
  const [customer_taxTreatment, setCustomerTaxTreatment] = useState('');
  const [customer_taxTreatment_des, setCustomerTaxTreatmentDes] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [contactType] = useState(1);
  const [vat_list, setVatList] = useState([
    { id: 1, vat: 5, name: 'STANDARD RATED TAX (5%) ' },
    { id: 2, vat: 0, name: 'ZERO RATED TAX (0%)' },
    { id: 3, vat: 0, name: 'EXEMPT' },
    { id: 4, vat: 0, name: 'OUT OF SCOPE' },
    { id: 10, vat: 0, name: 'N/A' },
  ]);
  const [current_rfq_id, setCurrentRfqId] = useState(null);
  const [dateChanged, setDateChanged] = useState(false);
  const [dateChanged1, setDateChanged1] = useState(false);
  const [rfqReceiveDate, setRfqReceiveDate] = useState(null);
  const [rfqExpiryDate, setRfqExpiryDate] = useState(null);

  const uploadFile = useRef(null);

  const regEx = /^[0-9\b]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;

  const placelist = [
    { label: 'Abu Dhabi', value: '1' },
    { label: 'Dubai', value: '2' },
    { label: 'Sharjah', value: '3' },
    { label: 'Ajman', value: '4' },
    { label: 'Umm Al Quwain', value: '5' },
    { label: 'Ras al-Khaimah', value: '6' },
    { label: 'Fujairah', value: '7' },
  ];

  const language = window['localStorage'].getItem('language');
  strings.setLanguage(language || 'en');

  // React Hook Form
  const form = useForm({
    resolver: zodResolver(updateRequestForQuotationSchema),
    defaultValues: {
      rfqNumber: '',
      supplierId: '',
      rfqReceiveDate: '',
      rfqExpiryDate: '',
      placeOfSupplyId: '',
      currency: '',
      notes: '',
      receiptNumber: '',
      receiptAttachmentDescription: '',
      lineItemsString: [],
      total_net: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      total_excise: 0,
      taxType: false,
      discount: 0,
      fileName: '',
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors }, setValue, watch, setError, clearErrors } = form;

  // Initialize data
  useEffect(() => {
    requestForQuotationAction.getVatList().then((res) => {
      if (res.status === 200) {
        setVatList(res.data);
      }
    });
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    if (location.state && location.state.id) {
      requestForQuotationDetailsAction.getRFQeById(location.state.id).then((res) => {
        if (res.status === 200) {
          currencyConvertActions.getCurrencyConversionList().then((response) => {
            if (response.data && response.data[0]) {
              setValue('currencyCode', parseInt(response.data[0].currencyCode));
            }
          });

          getCompanyCurrency();
          requestForQuotationAction.getExciseList();
          requestForQuotationAction.getSupplierList(contactType);
          requestForQuotationAction.getCountryList();
          requestForQuotationAction.getProductList();
          fetchPurchaseCategory();

          const rfqData = res.data;

          setValue('rfqReceiveDate', rfqData.rfqReceiveDate ? dayjs(rfqData.rfqReceiveDate).format('DD-MM-YYYY') : '');
          setValue('rfqReceiveDate1', rfqData.rfqReceiveDate || '');
          setValue('receiptNumber', rfqData.receiptNumber || '');
          setValue('rfqExpiryDate', rfqData.rfqExpiryDate ? dayjs(rfqData.rfqExpiryDate).format('DD-MM-YYYY') : '');
          setValue('rfqExpiryDate1', rfqData.rfqExpiryDate || '');
          setValue('supplierId', rfqData.supplierId || '');
          setValue('rfqNumber', rfqData.rfqNumber || '');
          setValue('totalVatAmount', rfqData.totalVatAmount || 0);
          setValue('totalAmount', rfqData.totalAmount || 0);
          setValue('total_net', 0);
          setValue('notes', rfqData.notes || '');
          setValue('lineItemsString', rfqData.poQuatationLineItemRequestModelList || []);
          setValue('fileName', rfqData.fileName || '');
          setValue('placeOfSupplyId', rfqData.placeOfSupplyId || '');
          setValue('total_excise', rfqData.totalExciseAmount || 0);
          setValue('taxType', rfqData.taxType || false);

          setCurrentRfqId(location.state.id);
          setTaxType(rfqData.taxType || false);
          setCustomerTaxTreatmentDes(rfqData.taxtreatment || '');
          setData(rfqData.poQuatationLineItemRequestModelList || []);

          if (rfqData.poQuatationLineItemRequestModelList && rfqData.poQuatationLineItemRequestModelList.length > 0) {
            updateAmount(rfqData.poQuatationLineItemRequestModelList);
            const maxId = Math.max(...rfqData.poQuatationLineItemRequestModelList.map(item => item.id));
            setIdCount(maxId);
            addRow();
          } else {
            setIdCount(0);
          }

          getCurrency(rfqData.supplierId);
          setLoading(false);
        }
      });
    } else {
      history.push('/admin/expense/request-for-quotation');
    }
  }, [location, requestForQuotationDetailsAction, setValue, history]);

  const fetchPurchaseCategory = useCallback(() => {
    ProductActions.getTransactionCategoryListForPurchaseProduct('10').then((res) => {
      if (res.status === 200) {
        setPurchaseCategory(res.data);
      }
    });
  }, [ProductActions]);

  const getCompanyCurrency = useCallback(() => {
    currencyConvertActions.getCompanyCurrency().then((res) => {
      if (res.status === 200) {
        // Handle company currency if needed
      }
    }).catch((err) => {
      commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong');
      setLoading(false);
    });
  }, [currencyConvertActions, commonActions]);

  const getCurrency = useCallback((supplierId) => {
    const supplierData = supplier_list.find(item => item.label.contactId === supplierId);
    if (supplierData && supplierData.label.currency) {
      setSupplierCurrency(supplierData.label.currency.currencyCode);
      setSupplierCurrencyDes(supplierData.label.currency.currencyName);
      setSupplierCurrencySymbol(supplierData.label.currency.currencyIsoCode);
      return supplierData.label.currency.currencyCode;
    }
    return 0;
  }, [supplier_list]);

  const getTaxTreatment = useCallback((supplierId) => {
    const supplierData = supplier_list.find(item => item.label.contactId === supplierId);
    if (supplierData && supplierData.label.taxTreatment) {
      setCustomerTaxTreatment(supplierData.label.taxTreatment.id);
      setCustomerTaxTreatmentDes(supplierData.label.taxTreatment.taxTreatment);
      return supplierData.label.taxTreatment.id;
    }
    return 0;
  }, [supplier_list]);

  // Line item functions
  const addRow = useCallback(() => {
    const newRow = {
      id: idCount + 1,
      description: '',
      quantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      subTotal: 0,
      exciseTaxId: '',
      exciseAmount: 0,
      discountType: 'FIXED',
      vatAmount: 0,
      discount: 0,
      productId: '',
      unitType: '',
      unitTypeId: '',
    };

    const newData = [...data, newRow];
    setData(newData);
    setIdCount(idCount + 1);
    setValue('lineItemsString', newData);
  }, [data, idCount, setValue]);

  const deleteRow = useCallback((e, row) => {
    e.preventDefault();
    const newData = data.filter((obj) => obj.id !== row.id);
    setData(newData);
    setValue('lineItemsString', newData);
    updateAmount(newData);
  }, [data, setValue]);

  const selectItem = useCallback((value, row, fieldName) => {
    const newData = data.map((obj) => {
      if (obj.id === row.id) {
        return { ...obj, [fieldName]: value };
      }
      return obj;
    });

    setData(newData);

    if (['unitPrice', 'vatCategoryId', 'quantity', 'exciseTaxId'].includes(fieldName)) {
      updateAmount(newData);
    }

    const index = newData.findIndex(obj => obj.id === row.id);
    if (index !== -1) {
      setValue(`lineItemsString.${index}.${fieldName}`, value);
    }
  }, [data, setValue]);

  const productValue = useCallback((productId, row) => {
    const product = product_list.find((item) => item.id === parseInt(productId));
    if (!product) return;

    const newData = data.map((obj) => {
      if (obj.id === row.id) {
        return {
          ...obj,
          unitPrice: parseInt(product.unitPrice),
          vatCategoryId: parseInt(product.vatCategoryId),
          exciseTaxId: product.exciseTaxId,
          description: product.description,
          discountType: product.discountType,
          isExciseTaxExclusive: product.isExciseTaxExclusive,
          unitType: product.unitType,
          unitTypeId: product.unitTypeId,
        };
      }
      return obj;
    });

    setData(newData);
    updateAmount(newData);

    const index = newData.findIndex(obj => obj.id === row.id);
    if (index !== -1) {
      setValue(`lineItemsString.${index}.vatCategoryId`, parseInt(product.vatCategoryId));
      setValue(`lineItemsString.${index}.unitPrice`, parseInt(product.unitPrice));
      setValue(`lineItemsString.${index}.exciseTaxId`, product.exciseTaxId);
      setValue(`lineItemsString.${index}.description`, product.description);
    }
  }, [product_list, data, setValue]);

  const updateAmount = useCallback((lineItems) => {
    let total_net = 0;
    let total_excise = 0;
    let total = 0;
    let total_vat = 0;
    let discount_total = 0;

    const updatedItems = lineItems.map((obj) => {
      const vatIndex = obj.vatCategoryId !== '' ? vat_list.findIndex((item) => item.id === +obj.vatCategoryId) : -1;
      const vat = vatIndex !== -1 ? vat_list[vatIndex].vat : 0;

      let net_value = 0;
      let vat_amount = 0;
      let discount = 0;

      // Exclusive case
      if (!taxType) {
        if (obj.discountType === 'PERCENTAGE') {
          net_value = ((+obj.unitPrice - (+((obj.unitPrice * (obj.discount || 0)) / 100))) * obj.quantity);
          discount = (obj.unitPrice * obj.quantity) - net_value;

          if (obj.exciseTaxId && obj.exciseTaxId !== 0) {
            if (obj.exciseTaxId === 1) {
              const value = +(net_value) / 2;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            }
          } else {
            obj.exciseAmount = 0;
          }
          vat_amount = ((+net_value * vat) / 100);
        } else {
          net_value = ((obj.unitPrice * obj.quantity) - (obj.discount || 0));
          discount = (obj.unitPrice * obj.quantity) - net_value;

          if (obj.exciseTaxId && obj.exciseTaxId !== 0) {
            if (obj.exciseTaxId === 1) {
              const value = +(net_value) / 2;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            }
          } else {
            obj.exciseAmount = 0;
          }
          vat_amount = ((+net_value * vat) / 100);
        }
      } else {
        // Inclusive case
        if (obj.discountType === 'PERCENTAGE') {
          net_value = ((+obj.unitPrice - (+((obj.unitPrice * (obj.discount || 0)) / 100))) * obj.quantity);
          discount = (obj.unitPrice * obj.quantity) - net_value;
          vat_amount = (+net_value * (vat / (100 + vat) * 100)) / 100;
          net_value = net_value - vat_amount;

          if (obj.exciseTaxId && obj.exciseTaxId !== 0) {
            if (obj.exciseTaxId === 1) {
              const value = net_value / 3;
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value / 2;
              obj.exciseAmount = parseFloat(value);
            }
          } else {
            obj.exciseAmount = 0;
          }
        } else {
          net_value = ((obj.unitPrice * obj.quantity) - (obj.discount || 0));
          discount = (obj.unitPrice * obj.quantity) - net_value;
          vat_amount = (+net_value * (vat / (100 + vat) * 100)) / 100;
          net_value = net_value - vat_amount;

          if (obj.exciseTaxId && obj.exciseTaxId !== 0) {
            if (obj.exciseTaxId === 1) {
              const value = net_value / 3;
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value / 2;
              obj.exciseAmount = parseFloat(value);
            }
          } else {
            obj.exciseAmount = 0;
          }
        }
      }

      obj.vatAmount = vat_amount;
      obj.subTotal = net_value && obj.vatCategoryId ? parseFloat(net_value) + parseFloat(vat_amount) : 0;

      discount_total += discount;
      total_net += parseFloat(net_value);
      total_vat += vat_amount;
      total_excise += obj.exciseAmount || 0;
      total = total_vat + total_net;

      return obj;
    });

    setData(updatedItems);
    setValue('total_net', total_net - total_excise);
    setValue('totalVatAmount', total_vat);
    setValue('discount', discount_total);
    setValue('totalAmount', total);
    setValue('total_excise', total_excise);
  }, [vat_list, taxType, setValue]);

  // Date change handlers
  const setDateHandler = useCallback((value) => {
    setDateChanged(true);
    if (value) {
      setRfqReceiveDate(dayjs(value));
      setValue('rfqReceiveDate1', value);
    }
  }, [setValue]);

  const setDate1Handler = useCallback((value) => {
    setDateChanged1(true);
    if (value) {
      setRfqExpiryDate(dayjs(value));
      setValue('rfqExpiryDate1', value);
    }
  }, [setValue]);

  // Modal functions
  const openSupplierModalHandler = useCallback((e) => {
    e.preventDefault();
    setOpenSupplierModal(true);
  }, []);

  const closeSupplierModal = useCallback((res) => {
    if (res) {
      requestForQuotationAction.getSupplierList(contactType);
    }
    setOpenSupplierModal(false);
  }, [requestForQuotationAction, contactType]);

  const openProductModalHandler = useCallback(() => {
    setOpenProductModal(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setOpenProductModal(false);
  }, []);

  const handleFileChange = useCallback((e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setValue('attachmentFile', file);
    }
  }, [setValue]);

  // Delete function
  const deleterfq = useCallback(() => {
    const message1 = <text><b>Delete Request For Quotation?</b></text>;
    const message = 'This Request For Quotation will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removerfq}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  }, []);

  const removerfq = useCallback(() => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Request For Quotation...');

    requestForQuotationDetailsAction.deleterfq(current_rfq_id).then((res) => {
      if (res.status === 200) {
        commonActions.tostifyAlert('success', res.data ? res.data.message : 'Request For Quotation Deleted Successfully');
        history.push('/admin/expense/request-for-quotation');
        setLoading(false);
      }
    }).catch((err) => {
      commonActions.tostifyAlert('error', err.data ? err.data.message : 'Request For Quotation Deleted Unsuccessfully');
      setLoading(false);
      setDisabled1(false);
    });
  }, [current_rfq_id, requestForQuotationDetailsAction, commonActions, history]);

  const removeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  // Form submission
  const onSubmit = useCallback((formData) => {
    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Request For Quotation...');

    const postData = new FormData();
    postData.append('taxType', taxType);
    postData.append('type', 3);
    postData.append('id', current_rfq_id);
    postData.append('rfqNumber', formData.rfqNumber || '');

    if (dateChanged) {
      postData.append('rfqReceiveDate', rfqReceiveDate || formData.rfqReceiveDate1);
    } else {
      postData.append('rfqReceiveDate', formData.rfqReceiveDate1 || '');
    }

    if (dateChanged1) {
      postData.append('rfqExpiryDate', rfqExpiryDate || formData.rfqExpiryDate1);
    } else {
      postData.append('rfqExpiryDate', formData.rfqExpiryDate1 || '');
    }

    postData.append('receiptNumber', formData.receiptNumber || '');
    postData.append('notes', formData.notes || '');
    postData.append('lineItemsString', JSON.stringify(data));
    postData.append('totalVatAmount', formData.totalVatAmount || 0);
    postData.append('totalAmount', formData.totalAmount || 0);
    postData.append('totalExciseAmount', formData.total_excise || 0);

    if (formData.placeOfSupplyId) {
      postData.append('placeOfSupplyId', formData.placeOfSupplyId.value || formData.placeOfSupplyId);
    }

    if (formData.supplierId) {
      postData.append('supplierId', formData.supplierId.value || formData.supplierId);
    }

    if (formData.currency !== null && formData.currency) {
      postData.append('currencyCode', supplier_currency);
    }

    requestForQuotationDetailsAction
      .updateRFQ(postData)
      .then((res) => {
        commonActions.tostifyAlert('success', res.data ? res.data.message : 'Request For Quotation Updated Successfully');
        history.push('/admin/expense/request-for-quotation');
        setLoading(false);
      })
      .catch((err) => {
        setDisabled(false);
        setLoading(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert('error', err.data ? err.data.message : 'Request For Quotation Updated Unsuccessfully');
      });
  }, [taxType, current_rfq_id, dateChanged, dateChanged1, rfqReceiveDate, rfqExpiryDate, data, supplier_currency, requestForQuotationDetailsAction, commonActions, history]);

  // Render functions for table columns (similar to create screen)
  const renderProduct = useCallback((cell, row) => {
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
              productValue(e.value, row);
            }
          }}
          value={product_list && row.productId
            ? selectOptionsFactory.renderOptions('name', 'id', product_list, 'Product').find((option) => option.value === +row.productId)
            : null
          }
          className={errors.lineItemsString?.[idx]?.productId ? 'is-invalid' : ''}
        />
        {errors.lineItemsString?.[idx]?.productId && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].productId.message}</div>
        )}
        {row.productId !== '' && (
          <div className="mt-1">
            <Input
              type="text"
              maxLength="250"
              value={row.description || ''}
              onChange={(e) => selectItem(e.target.value, row, 'description')}
              placeholder={strings.Description}
              className="form-control"
            />
          </div>
        )}
      </>
    );
  }, [data, product_list, errors, selectItem, productValue]);

  const renderQuantity = useCallback((cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <div>
        <div className="input-group">
          <Input
            type="text"
            min="0"
            maxLength="10"
            value={row.quantity || 0}
            onChange={(e) => {
              if (e.target.value === '' || regEx.test(e.target.value)) {
                selectItem(e.target.value, row, 'quantity');
              }
            }}
            placeholder={strings.Quantity}
            className={`form-control w-50 ${errors.lineItemsString?.[idx]?.quantity ? 'is-invalid' : ''}`}
          />
          {row.productId !== '' && <Input value={row.unitType || ''} disabled />}
        </div>
        {errors.lineItemsString?.[idx]?.quantity && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].quantity.message}</div>
        )}
      </div>
    );
  }, [data, errors, selectItem]);

  const renderUnitPrice = useCallback((cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <>
        <Input
          type="text"
          maxLength="14,2"
          value={row.unitPrice || 0}
          onChange={(e) => {
            if (e.target.value === '' || regDecimal.test(e.target.value)) {
              selectItem(e.target.value, row, 'unitPrice');
            }
          }}
          placeholder={strings.UnitPrice}
          className={`form-control ${errors.lineItemsString?.[idx]?.unitPrice ? 'is-invalid' : ''}`}
        />
        {errors.lineItemsString?.[idx]?.unitPrice && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].unitPrice.message}</div>
        )}
      </>
    );
  }, [data, errors, regDecimal, selectItem]);

  const renderVat = useCallback((cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <>
        <Select
          options={vat_list ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'VAT') : []}
          value={vat_list ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'VAT').find((option) => option.value === +row.vatCategoryId) : null}
          id="vatCategoryId"
          placeholder={strings.Select + strings.VAT}
          onChange={(e) => {
            if (e && e.value !== '') {
              selectItem(e.value, row, 'vatCategoryId');
            }
          }}
          className={errors.lineItemsString?.[idx]?.vatCategoryId ? 'is-invalid' : ''}
        />
        {errors.lineItemsString?.[idx]?.vatCategoryId && (
          <div className="invalid-feedback">{errors.lineItemsString[idx].vatCategoryId.message}</div>
        )}
      </>
    );
  }, [data, vat_list, errors, selectItem]);

  const renderExcise = useCallback((cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <Select
        styles={customStyles}
        isDisabled={row.exciseTaxId === 0 || row.exciseTaxId === null}
        options={excise_list ? selectOptionsFactory.renderOptions('name', 'id', excise_list, 'Excise') : []}
        value={excise_list ? selectOptionsFactory.renderOptions('name', 'id', excise_list, 'Excise').find((option) => row.exciseTaxId ? option.value === +row.exciseTaxId : false) : null}
        id="exciseTaxId"
        placeholder="Select Excise"
        onChange={(e) => {
          if (e && e.value !== '') {
            selectItem(e.value, row, 'exciseTaxId');
          }
        }}
      />
    );
  }, [data, excise_list, selectItem]);

  const renderVatAmount = useCallback((cell, row) => {
    return row.vatAmount === 0
      ? supplier_currency_symbol + ' ' + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : supplier_currency_symbol + ' ' + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [supplier_currency_symbol]);

  const renderSubTotal = useCallback((cell, row) => {
    return row.subTotal === 0
      ? supplier_currency_symbol + ' ' + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : supplier_currency_symbol + ' ' + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [supplier_currency_symbol]);

  const renderActions = useCallback((cell, row) => {
    return row.productId !== '' ? (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon"
        onClick={(e) => deleteRow(e, row)}
      >
        <i className="fas fa-trash"></i>
      </Button>
    ) : null;
  }, [deleteRow]);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  const tmpSupplier_list = supplier_list.map(item => ({
    label: item.label.contactName,
    value: item.value,
  }));

  const totalNet = watch('total_net') || 0;
  const totalVatAmount = watch('totalVatAmount') || 0;
  const totalAmount = watch('totalAmount') || 0;
  const totalExcise = watch('total_excise') || 0;

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
                        <span className="ml-2">{strings.Update + ' ' + strings.RequestForQuotation}</span>
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
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="rfqNumber">
                                <span className="text-danger">* </span>
                                {strings.RFQNumber}
                              </Label>
                              <Controller
                                name="rfqNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    id="rfqNumber"
                                    disabled
                                    className={errors.rfqNumber ? 'is-invalid' : ''}
                                  />
                                )}
                              />
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
                                render={({ field }) => {
                                  const currentValue = tmpSupplier_list.find(option => option.value === +field.value);
                                  return (
                                    <Select
                                      {...field}
                                      id="supplierId"
                                      options={selectOptionsFactory.renderOptions('label', 'value', tmpSupplier_list, 'Supplier Name')}
                                      styles={selectStyles}
                                      value={currentValue || null}
                                      onChange={(option) => {
                                        field.onChange(option);
                                        if (option && option.value) {
                                          setValue('currency', getCurrency(option.value));
                                          setValue('taxTreatmentid', getTaxTreatment(option.value));
                                        }
                                      }}
                                      className={errors.supplierId ? 'is-invalid' : ''}
                                    />
                                  );
                                }}
                              />
                              {errors.supplierId && (
                                <div className="invalid-feedback d-block">{errors.supplierId.message}</div>
                              )}
                            </FormGroup>
                          </Col>

                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="taxTreatmentid">{strings.TaxTreatment}</Label>
                              <Input
                                disabled
                                id="taxTreatmentid"
                                name="taxTreatmentid"
                                value={customer_taxTreatment_des}
                              />
                            </FormGroup>
                          </Col>

                          {customer_taxTreatment_des !== 'NON GCC' && (
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="placeOfSupplyId">
                                  <span className="text-danger">* </span>
                                  {strings.PlaceofSupply}
                                </Label>
                                <Controller
                                  name="placeOfSupplyId"
                                  control={control}
                                  render={({ field }) => {
                                    const currentValue = placelist && selectOptionsFactory.renderOptions('label', 'value', placelist, 'Place of Supply').find(option => option.value === field.value?.toString());
                                    return (
                                      <Select
                                        {...field}
                                        id="placeOfSupplyId"
                                        options={selectOptionsFactory.renderOptions('label', 'value', placelist, 'Place of Supply')}
                                        styles={selectStyles}
                                        value={currentValue || null}
                                        onChange={(option) => field.onChange(option?.value || '')}
                                        className={errors.placeOfSupplyId ? 'is-invalid' : ''}
                                      />
                                    );
                                  }}
                                />
                                {errors.placeOfSupplyId && (
                                  <div className="invalid-feedback d-block">{errors.placeOfSupplyId.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                          )}
                        </Row>

                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="rfqReceiveDate">
                                <span className="text-danger">* </span>
                                {strings.IssueDate}
                              </Label>
                              <Controller
                                name="rfqReceiveDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="rfqReceiveDate"
                                    placeholderText={strings.IssueDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={field.value ? new Date(watch('rfqReceiveDate1')) : null}
                                    onChange={(date) => {
                                      field.onChange(date ? dayjs(date).format('DD-MM-YYYY') : '');
                                      setDateHandler(date);
                                    }}
                                    className={`form-control ${errors.rfqReceiveDate ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.rfqReceiveDate && (
                                <div className="invalid-feedback d-block">{errors.rfqReceiveDate.message}</div>
                              )}
                            </FormGroup>
                          </Col>

                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="rfqExpiryDate">{strings.ExpiryDate}</Label>
                              <Controller
                                name="rfqExpiryDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="rfqExpiryDate"
                                    placeholderText={strings.ExpiryDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    minDate={new Date()}
                                    dropdownMode="select"
                                    selected={field.value ? new Date(watch('rfqExpiryDate1')) : null}
                                    onChange={(date) => {
                                      field.onChange(date ? dayjs(date).format('DD-MM-YYYY') : '');
                                      setDate1Handler(date);
                                    }}
                                    className={`form-control ${errors.rfqExpiryDate ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.rfqExpiryDate && (
                                <div className="invalid-feedback d-block">{errors.rfqExpiryDate.message}</div>
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
                                    {...field}
                                    isDisabled
                                    id="currency"
                                    placeholder={strings.Select + strings.Currency}
                                    styles={customStyles}
                                    options={selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', currency_convert_list, 'Currency')}
                                    value={currency_convert_list ? selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', currency_convert_list, 'Currency').find(option => option.value === supplier_currency) : null}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>

                        <hr />

                        <Row>
                          <Col lg={8} className="mb-3"></Col>
                          <Col>
                            {!taxType ? (
                              <span style={{ color: '#0069d9' }} className="mr-4">
                                <b>{strings.Exclusive}</b>
                              </span>
                            ) : (
                              <span className="mr-4">{strings.Exclusive}</span>
                            )}
                            <Switch
                              checked={taxType}
                              onChange={(checked) => {
                                setTaxType(checked);
                                setValue('taxType', checked);
                                updateAmount(data);
                              }}
                              onColor="#2064d8"
                              onHandleColor="#2693e6"
                              handleDiameter={25}
                              uncheckedIcon={false}
                              checkedIcon={false}
                              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                              height={20}
                              width={48}
                              className="react-switch"
                            />
                            {taxType ? (
                              <span style={{ color: '#0069d9' }} className="ml-4">
                                <b>{strings.Inclusive}</b>
                              </span>
                            ) : (
                              <span className="ml-4">{strings.Inclusive}</span>
                            )}
                          </Col>
                        </Row>

                        <Row>
                          <Col lg={12}>
                            {errors.lineItemsString && typeof errors.lineItemsString === 'string' && (
                              <div className="invalid-feedback d-block">{errors.lineItemsString.message}</div>
                            )}
                            <BootstrapTable data={data} version="4" hover keyField="id" className="invoice-create-table">
                              <TableHeaderColumn width="3%" dataAlign="center" dataFormat={renderActions}></TableHeaderColumn>
                              <TableHeaderColumn width="15%" dataField="product" dataFormat={renderProduct}>
                                {strings.PRODUCT}
                              </TableHeaderColumn>
                              <TableHeaderColumn width="12%" dataField="quantity" dataFormat={renderQuantity}>
                                {strings.QUANTITY}
                              </TableHeaderColumn>
                              <TableHeaderColumn dataField="unitPrice" dataFormat={renderUnitPrice}>
                                {strings.UNITPRICE}
                              </TableHeaderColumn>
                              {totalExcise !== 0 && (
                                <TableHeaderColumn width="10%" dataField="exciseTaxId" dataFormat={renderExcise}>
                                  Excise
                                  <i id="ExiseTooltip" className="fa fa-question-circle ml-1"></i>
                                  <UncontrolledTooltip placement="right" target="ExiseTooltip">
                                    Excise dropdown will be enabled only for the excise products
                                  </UncontrolledTooltip>
                                </TableHeaderColumn>
                              )}
                              <TableHeaderColumn dataField="vat" dataFormat={renderVat}>
                                {strings.VAT}
                              </TableHeaderColumn>
                              <TableHeaderColumn
                                width="10%"
                                dataField="sub_total"
                                dataFormat={renderVatAmount}
                                className="text-right"
                                columnClassName="text-right"
                              >
                                {strings.VATAMOUNT}
                              </TableHeaderColumn>
                              <TableHeaderColumn
                                dataField="sub_total"
                                dataFormat={renderSubTotal}
                                className="text-right"
                                columnClassName="text-right"
                              >
                                {strings.SUBTOTAL}
                              </TableHeaderColumn>
                            </BootstrapTable>
                          </Col>
                        </Row>

                        {data.length > 0 && (
                          <Row>
                            <Col lg={8}>
                              <FormGroup className="py-2">
                                <Label htmlFor="notes">{strings.TermsAndConditions}</Label>
                                <br />
                                <Controller
                                  name="notes"
                                  control={control}
                                  render={({ field }) => (
                                    <TextareaAutosize
                                      {...field}
                                      type="textarea"
                                      className="textarea form-control"
                                      maxLength="255"
                                      style={{ width: '700px' }}
                                      id="notes"
                                      rows="2"
                                      placeholder={strings.DeliveryNotes}
                                    />
                                  )}
                                />
                              </FormGroup>

                              <Row>
                                <Col lg={6}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="receiptNumber">{strings.ReferenceNumber}</Label>
                                    <Controller
                                      name="receiptNumber"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="text"
                                          maxLength="20"
                                          id="receiptNumber"
                                          placeholder={strings.ReceiptNumber}
                                        />
                                      )}
                                    />
                                  </FormGroup>
                                </Col>

                                <Col lg={6}>
                                  <FormGroup className="mb-3 hideAttachment">
                                    <Label>{strings.ReceiptAttachment}</Label>
                                    <br />
                                    <Button
                                      color="primary"
                                      onClick={() => document.getElementById('fileInput').click()}
                                      className="btn-square mr-3"
                                    >
                                      <i className="fa fa-upload"></i> {strings.upload}
                                    </Button>
                                    <input
                                      id="fileInput"
                                      ref={uploadFile}
                                      type="file"
                                      style={{ display: 'none' }}
                                      onChange={handleFileChange}
                                    />
                                    {fileName && (
                                      <div>
                                        <i className="fa fa-close" onClick={() => setFileName('')}></i> {fileName}
                                      </div>
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
                                      {...field}
                                      type="textarea"
                                      className="textarea form-control"
                                      maxLength="255"
                                      style={{ width: '700px' }}
                                      id="receiptAttachmentDescription"
                                      rows="2"
                                      placeholder={strings.ReceiptAttachmentDescription}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>

                            <Col lg={4}>
                              <div className="">
                                {totalExcise > 0 && (
                                  <div className="total-item p-2">
                                    <Row>
                                      <Col lg={6}>
                                        <h5 className="mb-0 text-right">Total Excise</h5>
                                      </Col>
                                      <Col lg={6} className="text-right">
                                        <label className="mb-0">
                                          {supplier_currency_symbol} &nbsp;
                                          {totalExcise.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </label>
                                      </Col>
                                    </Row>
                                  </div>
                                )}
                                <div className="total-item p-2">
                                  <Row>
                                    <Col lg={6}>
                                      <h5 className="mb-0 text-right">{strings.TotalNet}</h5>
                                    </Col>
                                    <Col lg={6} className="text-right">
                                      <label className="mb-0">
                                        {supplier_currency_symbol} &nbsp;
                                        {totalNet.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </label>
                                    </Col>
                                  </Row>
                                </div>
                                <div className="total-item p-2">
                                  <Row>
                                    <Col lg={6}>
                                      <h5 className="mb-0 text-right">{strings.TotalVat}</h5>
                                    </Col>
                                    <Col lg={6} className="text-right">
                                      <label className="mb-0">
                                        {supplier_currency_symbol} &nbsp;
                                        {totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </label>
                                    </Col>
                                  </Row>
                                </div>
                                <div className="total-item p-2">
                                  <Row>
                                    <Col lg={6}>
                                      <h5 className="mb-0 text-right">{strings.Total}</h5>
                                    </Col>
                                    <Col lg={6} className="text-right">
                                      <label className="mb-0">
                                        {supplier_currency_symbol} &nbsp;
                                        {totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </label>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        )}

                        <Row>
                          <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
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
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                <i className="fa fa-dot-circle-o"></i> {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => history.push('/admin/expense/request-for-quotation')}
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
          closeSupplierModal={closeSupplierModal}
          getCurrentUser={(e) => setValue('supplierId', { label: e.fullName, value: e.id })}
          createSupplier={requestForQuotationAction.createSupplier}
          currency_list={currency_convert_list}
          country_list={country_list}
          getStateList={requestForQuotationAction.getStateList}
        />

        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={closeProductModal}
          getCurrentProduct={() => {}}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailRequestForQuotation);
