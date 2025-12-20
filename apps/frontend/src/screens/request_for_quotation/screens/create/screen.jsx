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
import * as RequestForQuotationCreateAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { TextareaAutosize } from '@material-ui/core';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';
import Switch from 'react-switch';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import { LeavePage, Loader } from 'components';
import invoiceimage from 'assets/images/invoice/invoice.png';

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
    .refine((val) => Number(val) > 0, 'Unit Price Should be Greater than 1'),
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

const createRequestForQuotationSchema = z.object({
  rfq_number: z.string().min(1, 'Invoice number is required'),
  supplierId: z.object({
    label: z.string(),
    value: z.any(),
  }).nullable().refine((val) => val !== null, 'Supplier is required'),
  rfqReceiveDate: z.date({
    required_error: 'Issue date is required',
    invalid_type_error: 'Issue date is required',
  }),
  rfqExpiryDate: z.date({
    required_error: 'Expiry date is required',
    invalid_type_error: 'Expiry date is required',
  }),
  placeOfSupplyId: z.any().optional(),
  currency: z.any().optional(),
  exchangeRate: z.any().optional(),
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
})
.refine((data) => {
  if (data.rfqReceiveDate && data.rfqExpiryDate) {
    return new Date(data.rfqReceiveDate) <= new Date(data.rfqExpiryDate);
  }
  return true;
}, {
  message: 'Expiry date should be later than the issue date',
  path: ['rfqExpiryDate'],
});

const mapStateToProps = (state) => {
  return {
    contact_list: state.request_for_quotation.contact_list,
    currency_list: state.request_for_quotation.currency_list,
    vat_list: state.request_for_quotation.vat_list,
    product_list: state.request_for_quotation.product_list,
    supplier_list: state.request_for_quotation.supplier_list,
    excise_list: state.request_for_quotation.excise_list,
    country_list: state.request_for_quotation.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    requestForQuotationAction: bindActionCreators(RequestForQuotationAction, dispatch),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    requestForQuotationCreateAction: bindActionCreators(RequestForQuotationCreateAction, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const CreateRequestForQuotation = ({
  requestForQuotationAction,
  ProductActions,
  requestForQuotationCreateAction,
  currencyConvertActions,
  commonActions,
  history,
  location,
  product_list,
  supplier_list,
  excise_list,
  vat_list: propVatList,
  currency_convert_list,
  universal_currency_list,
  product_category_list,
  country_list,
}) => {
  // State
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [data, setData] = useState([{
    id: 0,
    description: '',
    quantity: 1,
    unitPrice: '',
    vatCategoryId: '',
    exciseTaxId: '',
    exciseAmount: '',
    subTotal: 0,
    vatAmount: 0,
    productId: '',
  }]);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [supplier_currency, setSupplierCurrency] = useState('');
  const [supplier_currency_symbol, setSupplierCurrencySymbol] = useState('');
  const [supplier_currency_des, setSupplierCurrencyDes] = useState('');
  const [customer_taxTreatment, setCustomerTaxTreatment] = useState('');
  const [customer_taxTreatment_des, setCustomerTaxTreatmentDes] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [contactType] = useState(1);
  const [vat_list, setVatList] = useState([
    { id: 1, vat: 5, name: 'STANDARD RATED TAX (5%) ' },
    { id: 2, vat: 0, name: 'ZERO RATED TAX (0%)' },
    { id: 3, vat: 0, name: 'EXEMPT' },
    { id: 4, vat: 0, name: 'OUT OF SCOPE' },
    { id: 10, vat: 0, name: 'N/A' },
  ]);
  const [createMore, setCreateMore] = useState(false);

  const uploadFile = useRef(null);

  const regEx = /^[0-9\b]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regExInvNum = /[a-zA-Z0-9-/]+$/;

  const termList = [
    { label: 'Net 7 Days', value: 'NET_7' },
    { label: 'Net 10 Days', value: 'NET_10' },
    { label: 'Net 30 Days', value: 'NET_30' },
    { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
  ];

  const placelist = [
    { label: 'Abu Dhabi', value: '1' },
    { label: 'Dubai', value: '2' },
    { label: 'Sharjah', value: '3' },
    { label: 'Ajman', value: '4' },
    { label: 'Umm Al Quwain', value: '5' },
    { label: 'Ras al-Khaimah', value: '6' },
    { label: 'Fujairah', value: '7' },
  ];

  const discountOptions = [
    { value: 'FIXED', label: 'Fixed' },
    { value: 'PERCENTAGE', label: 'Percentage' },
  ];

  const language = window['localStorage'].getItem('language');
  strings.setLanguage(language || 'en');

  // React Hook Form
  const form = useForm({
    resolver: zodResolver(createRequestForQuotationSchema),
    defaultValues: {
      rfq_number: '',
      supplierId: null,
      rfqReceiveDate: new Date(),
      rfqExpiryDate: new Date(),
      placeOfSupplyId: '',
      currency: '',
      exchangeRate: '',
      notes: '',
      receiptNumber: '',
      receiptAttachmentDescription: '',
      lineItemsString: [{
        id: 0,
        description: '',
        quantity: 1,
        unitPrice: '',
        vatCategoryId: '',
        subTotal: 0,
        productId: '',
        exciseTaxId: '',
        isExciseTaxExclusive: '',
        unitType: '',
        unitTypeId: '',
        discountType: 'FIXED',
        discount: 0,
      }],
      total_net: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      total_excise: 0,
      taxType: false,
      discount: 0,
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors }, setValue, watch, setError, clearErrors, reset } = form;

  // Initialize data
  useEffect(() => {
    getDefaultNotes();
    requestForQuotationAction.getVatList();
    getInitialData();

    if (location.state && location.state.parentId) {
      getParentRfqDetails(location.state.parentId);
    }
  }, []);

  const getDefaultNotes = useCallback(() => {
    commonActions.getNoteSettingsInfo().then((res) => {
      if (res.status === 200) {
        setValue('notes', res.data.defaultTermsAndConditions);
        setValue('footNote', res.data.defaultFootNotes);
      }
    });
  }, [commonActions, setValue]);

  const getInitialData = useCallback(() => {
    requestForQuotationAction.getVatList().then((res) => {
      if (res.status === 200 && res.data) {
        setVatList(res.data);
      }
    });

    getInvoiceNo();
    requestForQuotationAction.getSupplierList(contactType);

    currencyConvertActions.getCurrencyConversionList().then((response) => {
      if (response.data && response.data[0]) {
        setValue('currencyCode', parseInt(response.data[0].currencyCode));
      }
    });

    requestForQuotationAction.getInvoicePrefix().then((response) => {
      if (response.data) {
        setPrefix(response.data);
      }
    });

    requestForQuotationAction.getExciseList();
    requestForQuotationAction.getVatList();
    requestForQuotationAction.getCountryList();
    requestForQuotationAction.getProductList();
    ProductActions.getProductCategoryList();
    fetchPurchaseCategory();
    fetchSalesCategory();
    getCompanyCurrency();
  }, [requestForQuotationAction, currencyConvertActions, ProductActions, contactType, setValue]);

  const getInvoiceNo = useCallback(() => {
    requestForQuotationCreateAction.getRfqNo().then((res) => {
      setValue('rfq_number', res.data.toString());
    });
  }, [requestForQuotationCreateAction, setValue]);

  const fetchPurchaseCategory = useCallback(() => {
    ProductActions.getTransactionCategoryListForPurchaseProduct('10').then((res) => {
      if (res.status === 200) {
        setPurchaseCategory(res.data);
      }
    });
  }, [ProductActions]);

  const fetchSalesCategory = useCallback(() => {
    ProductActions.getTransactionCategoryListForSalesProduct('2').then((res) => {
      if (res.status === 200) {
        setSalesCategory(res.data);
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
    });
  }, [currencyConvertActions, commonActions]);

  const getParentRfqDetails = useCallback((parentId) => {
    requestForQuotationCreateAction.getRFQeById(parentId).then((res) => {
      if (res.status === 200) {
        const rfqData = res.data;

        setValue('rfqReceiveDate', rfqData.rfqReceiveDate ? new Date(rfqData.rfqReceiveDate) : new Date());
        setValue('rfqExpiryDate', rfqData.rfqExpiryDate ? new Date(rfqData.rfqExpiryDate) : new Date());
        setValue('supplierId', rfqData.supplierId || '');
        setValue('rfqNumber', rfqData.rfqNumber || '');
        setValue('totalVatAmount', rfqData.totalVatAmount || 0);
        setValue('totalAmount', rfqData.totalAmount || 0);
        setValue('total_net', 0);
        setValue('notes', rfqData.notes || '');
        setValue('placeOfSupplyId', rfqData.placeOfSupplyId || '');
        setValue('total_excise', rfqData.totalExciseAmount || 0);
        setValue('taxType', rfqData.taxType || false);
        setValue('receiptNumber', rfqData.receiptNumber || '');
        setValue('receiptAttachmentDescription', rfqData.receiptAttachmentDescription || '');

        setTaxType(rfqData.taxType || false);

        if (rfqData.poQuatationLineItemRequestModelList) {
          setData(rfqData.poQuatationLineItemRequestModelList);
          setValue('lineItemsString', rfqData.poQuatationLineItemRequestModelList);

          const maxId = Math.max(...rfqData.poQuatationLineItemRequestModelList.map(item => item.id));
          setIdCount(maxId);
        }

        getCurrency(rfqData.supplierId);
      }
    });
  }, [requestForQuotationCreateAction, setValue]);

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
      exciseAmount: '',
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

  const checkedRow = useCallback(() => {
    if (data.length > 0) {
      const lastIndex = data.length - 1;
      const temp = Object.values(data[lastIndex]).indexOf('');
      return temp > -1;
    }
    return false;
  }, [data]);

  const selectItem = useCallback((value, row, fieldName) => {
    const newData = data.map((obj) => {
      if (obj.id === row.id) {
        return { ...obj, [fieldName]: value };
      }
      return obj;
    });

    setData(newData);

    if (['unitPrice', 'vatCategoryId', 'quantity', 'exciseTaxId', 'discount', 'discountType'].includes(fieldName)) {
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
          unitPrice: product.unitPrice,
          vatCategoryId: product.vatCategoryId,
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
      setValue(`lineItemsString.${index}.vatCategoryId`, product.vatCategoryId);
      setValue(`lineItemsString.${index}.unitPrice`, product.unitPrice);
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
          net_value = ((obj.unitPrice * obj.quantity));
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
          net_value = ((obj.unitPrice * obj.quantity));
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

  // Form submission
  const onSubmit = useCallback((formData) => {
    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Request For Quotation...');

    const postData = new FormData();
    postData.append('taxType', taxType);
    postData.append('rfqNumber', formData.rfq_number ? prefix + formData.rfq_number : '');
    postData.append('rfqReceiveDate', formData.rfqReceiveDate || '');
    postData.append('rfqExpiryDate', formData.rfqExpiryDate || '');
    postData.append('receiptNumber', formData.receiptNumber || '');
    postData.append('notes', formData.notes || '');
    postData.append('type', 3);
    postData.append('totalExciseAmount', formData.total_excise || 0);
    postData.append('exciseType', false);

    if (formData.placeOfSupplyId) {
      postData.append('placeOfSupplyId', formData.placeOfSupplyId.value || formData.placeOfSupplyId);
    }

    postData.append('lineItemsString', JSON.stringify(data));
    postData.append('totalVatAmount', formData.totalVatAmount || 0);
    postData.append('totalAmount', formData.totalAmount || 0);

    if (formData.supplierId && formData.supplierId.value) {
      postData.append('supplierId', formData.supplierId.value);
    }

    if (uploadFile.current && uploadFile.current.files && uploadFile.current.files[0]) {
      postData.append('attachmentFile', uploadFile.current.files[0]);
    }

    if (formData.currency !== null && formData.currency) {
      postData.append('currencyCode', supplier_currency);
    }

    postData.append('receiptAttachmentDescription', formData.receiptAttachmentDescription || '');

    requestForQuotationCreateAction
      .createRFQ(postData)
      .then((res) => {
        commonActions.tostifyAlert('success', res.data ? res.data.message : 'Request For Quotation Created Successfully');

        if (createMore) {
          setDisabled(false);
          setLoading(false);
          setDisableLeavePage(false);
          setCreateMore(false);
          reset();
          setData([{
            id: 0,
            description: '',
            quantity: 1,
            unitPrice: '',
            vatCategoryId: '',
            exciseTaxId: '',
            exciseAmount: '',
            subTotal: 0,
            vatAmount: 0,
            productId: '',
          }]);
          setIdCount(0);
          getInvoiceNo();
        } else {
          history.push('/admin/expense/request-for-quotation');
        }
      })
      .catch((err) => {
        setDisabled(false);
        setLoading(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert('error', err.data ? err.data.message : 'Request For Quotation Created Unsuccessfully');
      });
  }, [taxType, prefix, data, supplier_currency, createMore, requestForQuotationCreateAction, commonActions, history, reset, getInvoiceNo]);

  // Render functions for table columns
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
              if (!checkedRow()) {
                addRow();
              }
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
  }, [data, product_list, errors, selectItem, productValue, checkedRow, addRow]);

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
              if (e.target.value === '' || regDecimal.test(e.target.value)) {
                selectItem(e.target.value, row, 'quantity');
              }
            }}
            placeholder={strings.Quantity}
            className={`form-control w-50 ${errors.lineItemsString?.[idx]?.quantity ? 'is-invalid' : ''}`}
          />
          {row.productId !== '' && <Input value={row.unitType || ''} disabled />}
        </div>
        {errors.lineItemsString?.[idx]?.quantity && (
          <div className="invalid-feedback" style={{ display: 'block', whiteSpace: 'normal' }}>
            {errors.lineItemsString[idx].quantity.message}
          </div>
        )}
      </div>
    );
  }, [data, errors, regDecimal, selectItem]);

  const renderUnitPrice = useCallback((cell, row) => {
    const idx = data.findIndex((obj) => obj.id === row.id);
    if (idx === -1) return null;

    return (
      <>
        <Input
          type="text"
          min="0"
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
        value={excise_list ? selectOptionsFactory.renderOptions('name', 'id', excise_list, 'Excise').find((option) => option.value === +row.exciseTaxId) : null}
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
    const value = row.vatAmount && row.vatAmount !== 0 ? row.vatAmount : 0;
    return value === 0
      ? supplier_currency_symbol + ' ' + value.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : supplier_currency_symbol + ' ' + value.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        className="btn-twitter btn-brand icon mt-1"
        disabled={data.length === 1}
        onClick={(e) => deleteRow(e, row)}
      >
        <i className="fas fa-trash"></i>
      </Button>
    ) : null;
  }, [data, deleteRow]);

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
      <div className="create-request-for-quotation-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fas fa-address-book" />
                        <span className="ml-2">{strings.Create + ' ' + strings.RequestForQuotation}</span>
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
                              <Label htmlFor="rfq_number">
                                <span className="text-danger">* </span>
                                {strings.RFQNumber}
                              </Label>
                              <Controller
                                name="rfq_number"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    id="rfq_number"
                                    disabled
                                    className={errors.rfq_number ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.rfq_number && (
                                <div className="invalid-feedback">{errors.rfq_number.message}</div>
                              )}
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
                                    {...field}
                                    id="supplierId"
                                    options={selectOptionsFactory.renderOptions('label', 'value', tmpSupplier_list, 'Supplier Name')}
                                    styles={selectStyles}
                                    onChange={(option) => {
                                      field.onChange(option);
                                      if (option && option.value) {
                                        setValue('currency', getCurrency(option.value));
                                        setValue('taxTreatmentid', getTaxTreatment(option.value));
                                      }
                                    }}
                                    className={errors.supplierId ? 'is-invalid' : ''}
                                  />
                                )}
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
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      id="placeOfSupplyId"
                                      options={selectOptionsFactory.renderOptions('label', 'value', placelist, 'Place of Supply')}
                                      styles={selectStyles}
                                      className={errors.placeOfSupplyId ? 'is-invalid' : ''}
                                    />
                                  )}
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
                                    {...field}
                                    id="rfqReceiveDate"
                                    placeholderText={strings.IssueDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
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
                              <Label htmlFor="rfqExpiryDate">
                                <span className="text-danger">* </span>
                                {strings.ExpiryDate}
                              </Label>
                              <Controller
                                name="rfqExpiryDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    id="rfqExpiryDate"
                                    placeholderText={strings.ExpiryDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    minDate={new Date()}
                                    dropdownMode="select"
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
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
                          <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-end">
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => setCreateMore(false)}
                              >
                                <i className="fa fa-dot-circle-o"></i> {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => setCreateMore(true)}
                              >
                                <i className="fa fa-refresh"></i> {disabled ? 'Creating...' : strings.CreateandMore}
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
          salesCategory={salesCategory}
          purchaseCategory={purchaseCategory}
        />
      </div>

      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateRequestForQuotation);
