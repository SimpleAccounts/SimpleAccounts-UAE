import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'components/migration';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as CustomerInvoiceDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as CustomerInvoiceActions from '../../actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { CustomerModal, ProductModal } from '../../sections';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import {
  optionFactory,
  selectCurrencyFactory,
  selectOptionsFactory,
  InputValidation,
  DropdownLists,
  Lists,
  selectStyles,
} from 'utils';
import './style.scss';
import { AddressComponent } from 'screens/contact/sections';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Switch } from '@/components/ui/switch';
import { FileText, Trash2, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    project_list: state.customer_invoice.project_list,
    contact_list: state.customer_invoice.contact_list,
    currency_list: state.customer_invoice.currency_list,
    excise_list: state.customer_invoice.excise_list,
    product_list: state.customer_invoice.product_list,
    customer_list: state.customer_invoice.customer_list,
    country_list: state.customer_invoice.country_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    product_category_list: state.product.product_category_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    customerInvoiceDetailActions: bindActionCreators(CustomerInvoiceDetailActions, dispatch),
    productActions: bindActionCreators(ProductActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailCustomerInvoiceSchema = z
  .object({
    invoice_number: z.string().min(1, 'Invoice number is required'),
    contactId: z.union([z.string().min(1, 'Customer name is required'), z.number()]),
    term: z.string().min(1, 'Terms is required'),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    invoiceDueDate: z.string().min(1, 'Invoice due date is required'),
    currencyCode: z.string().min(1, 'Currency is required'),
    placeOfSupplyId: z
      .union([z.string(), z.object({ value: z.string(), label: z.string() })])
      .optional(),
    changeShippingAddress: z.boolean().optional(),
    shippingAddress: z
      .object({
        address: z.string().optional(),
        city: z.string().optional(),
        countryId: z.string().optional(),
        stateId: z.string().optional(),
        postZipCode: z.string().optional(),
        telephone: z.string().optional(),
        fax: z.string().optional(),
      })
      .optional(),
    lineItemsString: z
      .array(
        z.object({
          quantity: z
            .union([z.string(), z.number()])
            .refine(value => parseFloat(value) > 0, { message: 'Quantity must be greater than 0' }),
          unitPrice: z.union([z.string(), z.number()]).refine(value => parseFloat(value) > 0, {
            message: 'Unit price must be greater than 0',
          }),
          vatCategoryId: z
            .union([z.string(), z.number()])
            .refine(value => value !== '', { message: 'VAT is required' }),
          productId: z
            .union([z.string(), z.number()])
            .refine(value => value !== '', { message: 'Product is required' }),
        })
      )
      .min(1, 'At least one invoice line item is required'),
    attachmentFile: z.any().optional(),
    receiptAttachmentDescription: z.string().optional(),
    receiptNumber: z.string().optional(),
    contact_po_number: z.string().optional(),
    exchangeRate: z.union([z.string(), z.number()]).optional(),
    notes: z.string().optional(),
    footNote: z.string().optional(),
    project: z.union([z.string(), z.number()]).optional(),
  })
  .refine(
    data => {
      if (data.changeShippingAddress === true && data.shippingAddress) {
        const errors = InputValidation.addressValidation(data.shippingAddress);
        return !errors || Object.keys(errors).length === 0;
      }
      return true;
    },
    {
      message: 'Shipping address validation failed',
      path: ['shippingAddress'],
    }
  );

const regEx = /^[0-9\b]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;
const regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
const regExAlpha = /^[a-zA-Z0-9!@#$&()\\`.+,/"]+$/;
const regExTelephone = /^[0-9-]+$/;
const regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;
const regExCity = /^[a-zA-Z ]+$/;

const file_size = 1024000;
const supported_format = [
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const DetailCustomerInvoice = ({
  currencyConvertActions,
  customerInvoiceActions,
  customerInvoiceDetailActions,
  productActions,
  commonActions,
  project_list,
  contact_list,
  currency_list,
  excise_list,
  product_list,
  customer_list,
  country_list,
  universal_currency_list,
  currency_convert_list,
  product_category_list,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [dialog, setDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [discountOptions] = useState([
    { value: 'FIXED', label: 'FIXED' },
    { value: 'PERCENTAGE', label: '%' },
  ]);
  const [exciseTypeOption] = useState([
    { value: 'Inclusive', label: 'Inclusive' },
    { value: 'Exclusive', label: 'Exclusive' },
  ]);
  const [data, setData] = useState([]);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [contactType] = useState(2);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [term, setTerm] = useState('');
  const [placeOfSupplyId, setPlaceOfSupplyId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [fileName, setFileName] = useState('');
  const [basecurrency, setBasecurrency] = useState([]);
  const [income] = useState(true);
  const [customerCurrency, setCustomerCurrency] = useState('');
  const [stateListForShipping, setStateListForShipping] = useState([]);
  const [param, setParam] = useState(false);
  const [date, setDate] = useState('');
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [invoiceDateForVatValidation, setInvoiceDateForVatValidation] = useState(new Date());
  const [producttype, setProducttype] = useState([]);
  const [changeShippingAddress, setChangeShippingAddress] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [datesChanged, setDatesChanged] = useState(false);
  const [customerCurrencySymbol, setCustomerCurrencySymbol] = useState('');
  const [idCount, setIdCount] = useState(0);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [customerTaxTreatmentDes, setCustomerTaxTreatmentDes] = useState('');
  const [invoiceDateNoChange, setInvoiceDateNoChange] = useState(null);
  const [taxType, setTaxType] = useState(false);
  const [invoiceDueDateNoChange, setInvoiceDueDateNoChange] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [vatList, setVatList] = useState([]);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [customerCurrencyDes, setCustomerCurrencyDes] = useState('');
  const [customerCurrencyCode, setCustomerCurrencyCode] = useState('');
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [salesCategory, setSalesCategory] = useState([]);
  const [purchaseCategory, setPurchaseCategory] = useState([]);

  const uploadFile = useRef(null);
  const termList = [
    { label: 'Net 7 Days', value: 'NET_7' },
    { label: 'Net 10 Days', value: 'NET_10' },
    { label: 'Net 15 Days', value: 'NET_15' },
    { label: 'Net 30 Days', value: 'NET_30' },
    { label: 'Net 45 Days', value: 'NET_45' },
    { label: 'Net 60 Days', value: 'NET_60' },
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

  const form = useForm({
    resolver: zodResolver(detailCustomerInvoiceSchema),
    defaultValues: {
      invoiceDate: new Date(),
      receiptAttachmentDescription: '',
      receiptNumber: '',
      contact_po_number: '',
      currencyCode: '',
      exchangeRate: '',
      currencyName: '',
      invoiceDueDate: '',
      contactId: '',
      project: '',
      invoice_number: '',
      total_net: 0,
      invoiceVATAmount: 0,
      totalAmount: 0,
      notes: '',
      changeShippingAddress: false,
      shippingAddress: Lists.Address,
      lineItemsString: [],
      discount: 0,
      term: '',
      placeOfSupplyId: '',
      fileName: '',
      filePath: '',
      total_excise: 0,
      taxType: false,
      footNote: '',
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
    clearErrors,
  } = form;

  const initializeData = useCallback(() => {
    if (location.state && location.state.id) {
      customerInvoiceDetailActions.getInvoiceById(location.state.id).then(res => {
        if (res.status === 200) {
          getCompanyCurrency();
          customerInvoiceActions.getCustomerList(contactType);
          customerInvoiceActions.getExciseList();
          customerInvoiceActions.getCountryList();
          productActions.getProductCategoryList();

          setCurrentCustomerId(location.state.id);
          setDiscountEnabled(res.data.discount > 0);
          setCustomerTaxTreatmentDes(res.data.taxTreatment ? res.data.taxTreatment : '');
          setInvoiceDateNoChange(res.data.invoiceDate ? dayjs(res.data.invoiceDate) : '');
          setTaxType(res.data.taxType ? true : false);
          setInvoiceDueDateNoChange(res.data.invoiceDueDate ? dayjs(res.data.invoiceDueDate) : '');
          setInvoiceDate(res.data.invoiceDate ? res.data.invoiceDate : '');
          setInvoiceDueDate(res.data.invoiceDueDate ? res.data.invoiceDueDate : '');
          setInvoiceDateForVatValidation(
            res.data.invoiceDate ? new Date(res.data.invoiceDate) : ''
          );
          setDiscountAmount(res.data.discount ? res.data.discount : 0);
          setDiscountPercentage(res.data.discountPercentage ? res.data.discountPercentage : '');
          setData(res.data.invoiceLineItems ? res.data.invoiceLineItems : []);
          setSelectedContact(res.data.contactId ? res.data.contactId : '');
          setTerm(res.data.term ? res.data.term : '');
          setPlaceOfSupplyId(res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '');
          setCustomerCurrency(res.data.currencyCode ? res.data.currencyCode : '');
          setCustomerCurrencyDes(res.data.currencyName ? res.data.currencyName : '');
          setCustomerCurrencySymbol(res.data.currencyIsoCode ? res.data.currencyIsoCode : '');
          setCustomerCurrencyCode(res.data.currencyCode ? res.data.currencyCode : '');

          reset({
            receiptAttachmentDescription: res.data.receiptAttachmentDescription || '',
            receiptNumber: res.data.receiptNumber || '',
            contact_po_number: res.data.contactPoNumber || '',
            currencyCode: res.data.currencyCode || '',
            exchangeRate: res.data.exchangeRate || '',
            currencyName: res.data.currencyName || '',
            invoiceDueDate: res.data.invoiceDueDate
              ? dayjs(res.data.invoiceDueDate).format('DD-MM-YYYY')
              : '',
            invoiceDate: res.data.invoiceDate
              ? dayjs(res.data.invoiceDate).format('DD-MM-YYYY')
              : '',
            invoiceDate1: res.data.invoiceDate || '',
            contactId: res.data.contactId || '',
            project: res.data.projectId || '',
            invoice_number: res.data.referenceNumber || '',
            total_net: 0,
            invoiceVATAmount: res.data.totalVatAmount || 0,
            totalAmount: res.data.totalAmount || 0,
            notes: res.data.notes || '',
            changeShippingAddress: res.data.changeShippingAddress || false,
            shippingAddress: {
              city: res.data.shippingCity ?? '',
              countryId: res.data.shippingCountry ?? '',
              address: res.data.shippingAddress ?? '',
              postZipCode: res.data.shippingPostZipCode ?? '',
              stateId: res.data.shippingState ?? '',
              telephone: res.data.shippingTelephone ?? '',
              fax: res.data.shippingFax ?? '',
            },
            lineItemsString: res.data.invoiceLineItems || [],
            discount: res.data.discount || 0,
            term: res.data.term || '',
            placeOfSupplyId: res.data.placeOfSupplyId || '',
            fileName: res.data.fileName || '',
            filePath: res.data.filePath || '',
            total_excise: res.data.totalExciseAmount || 0,
            taxType: res.data.taxType ? true : false,
            footNote: res.data.footNote || '',
          });

          if (res.data.changeShippingAddress) {
            setValue('shippingAddress', {
              city: res.data.shippingCity ?? '',
              countryId: res.data.shippingCountry ?? '',
              address: res.data.shippingAddress ?? '',
              postZipCode: res.data.shippingPostZipCode ?? '',
              stateId: res.data.shippingState ?? '',
              telephone: res.data.shippingTelephone ?? '',
              fax: res.data.shippingFax ?? '',
            });
          }

          if (res.data.invoiceLineItems && res.data.invoiceLineItems.length > 0) {
            updateAmount(res.data.invoiceLineItems);
            const dataItems = res.data.invoiceLineItems;
            const calculatedIdCount =
              dataItems.length > 0
                ? Math.max.apply(
                    Math,
                    dataItems.map(item => {
                      if (item['productId']) getProductType(item['productId']);
                      return item.id;
                    })
                  )
                : 0;
            setIdCount(calculatedIdCount);
            addRow();
          } else {
            setIdCount(0);
          }

          setLoading(false);
        }
      });
    } else {
      history.push('/admin/income/customer-invoice');
    }
  }, [location.state, customerInvoiceDetailActions, history]);

  useEffect(() => {
    customerInvoiceActions.getProductList();
    customerInvoiceActions
      .getTaxTreatment()
      .then(res => {
        if (res.status === 200) {
          let array = [];
          res.data.map(row => {
            if (row.id !== 8) array.push(row);
          });
          setTaxTreatmentList(array);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err.data ? err.data.message : 'ERROR');
      });

    customerInvoiceActions.getVatList().then(res => {
      if (res.status == 200) setVatList(res.data);
    });

    initializeData();
    getCompanyType();
  }, []);

  const salesCategoryHandler = () => {
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

  const calTotalNet = dataItems => {
    let total_net = 0;
    dataItems.map(obj => {
      if (obj.isExciseTaxExclusive === false) {
        total_net = +(total_net + +obj.unitPrice * obj.quantity);
      } else {
        total_net = +(total_net + +(obj.unitPrice + obj.exciseAmount) * obj.quantity);
      }
      return obj;
    });
    total_net = total_net - discountAmount;
    setValue('total_net', total_net);
  };

  const addRow = () => {
    const currentData = [...data];
    const currentIdCount = idCount
      ? idCount
      : currentData.length > 0
        ? Math.max.apply(
            Math,
            currentData.map(item => item.id)
          )
        : 0;
    setData(
      currentData.concat({
        id: currentIdCount + 1,
        description: '',
        quantity: 1,
        unitPrice: '',
        vatCategoryId: '',
        subTotal: 0,
        exciseTaxId: '',
        discountType: 'FIXED',
        vatAmount: 0,
        discount: 0,
        productId: '',
      })
    );
    setIdCount(currentIdCount + 1);
    setValue(
      'lineItemsString',
      [
        ...currentData,
        {
          id: currentIdCount + 1,
          description: '',
          quantity: 1,
          unitPrice: '',
          vatCategoryId: '',
          subTotal: 0,
          exciseTaxId: '',
          discountType: 'FIXED',
          vatAmount: 0,
          discount: 0,
          productId: '',
        },
      ],
      { shouldValidate: true }
    );
  };

  const selectItem = (e, row, name) => {
    let currentData = data;
    let idx;
    currentData.map((obj, index) => {
      if (obj.id === row.id) {
        obj[`${name}`] = e;
        idx = index;
      }
      return obj;
    });

    if (
      name === 'unitPrice' ||
      name === 'vatCategoryId' ||
      name === 'quantity' ||
      name === 'exciseTaxId'
    ) {
      setValue(`lineItemsString.${idx}.${name}`, e, { shouldValidate: true });
      updateAmount(currentData);
    } else {
      setData(currentData);
      setValue(`lineItemsString.${idx}.${name}`, e, { shouldValidate: true });
    }
  };

  const getContactShippingAddress = (customerID, taxID) => {
    if (taxID !== 5 && taxID !== 6 && taxID !== 7) {
      customerInvoiceDetailActions.getCustomerShippingAddressbyID(customerID).then(res => {
        if (res.status === 200) {
          var PlaceofSupply =
            placelist &&
            selectOptionsFactory
              .renderOptions('label', 'value', placelist, 'Place of Supply')
              .find(
                option => option.label.toUpperCase() === res.data.shippingStateName.toUpperCase()
              );
          if (PlaceofSupply) {
            setValue('placeOfSupplyId', PlaceofSupply);
            setPlaceOfSupplyId(PlaceofSupply);
          }
        }
      });
    }
  };

  const getCompanyType = () => {
    customerInvoiceDetailActions
      .getCompanyById()
      .then(res => {
        if (res.status === 200) {
          setIsDesignatedZone(res.data.isDesignatedZone);
          setCompanyVATRegistrationDate(
            new Date(dayjs(res.data.vatRegistrationDate).format('MM DD YYYY'))
          );
          setIsRegisteredVat(res.data.isRegisteredVat);
        }
      })
      .catch(err => {
        console.log(err, 'Get Company Type Error');
      });
  };

  const getProductType = id => {
    if (customerTaxTreatmentDes) {
      const product = product_list.find(obj => obj.id === id);
      if (product) {
        let pt = {};
        var vt = [];
        pt.id = product.id;
        pt.type = product.productType;

        if (isRegisteredVat && invoiceDateForVatValidation > companyVATRegistrationDate) {
          if (isDesignatedZone) {
            if (product.productType === 'GOODS') {
              if (
                customerTaxTreatmentDes === 'UAE VAT REGISTERED' ||
                customerTaxTreatmentDes === 'UAE VAT REGISTERED FREEZONE' ||
                customerTaxTreatmentDes === 'UAE NON-VAT REGISTERED FREEZONE' ||
                customerTaxTreatmentDes === 'GCC VAT REGISTERED' ||
                customerTaxTreatmentDes === 'GCC NON-VAT REGISTERED' ||
                customerTaxTreatmentDes === 'NON GCC'
              ) {
                vatList.map(element => {
                  if (element.name == 'OUT OF SCOPE') {
                    vt.push(element);
                  }
                });
              }
              if (customerTaxTreatmentDes === 'UAE NON-VAT REGISTERED') {
                vt = vatList;
              }
            } else if (product.productType === 'SERVICE') {
              if (
                customerTaxTreatmentDes === 'UAE VAT REGISTERED' ||
                customerTaxTreatmentDes === 'UAE NON-VAT REGISTERED' ||
                customerTaxTreatmentDes === 'UAE VAT REGISTERED FREEZONE' ||
                customerTaxTreatmentDes === 'UAE NON-VAT REGISTERED FREEZONE'
              ) {
                vt = vatList;
              }
              if (
                customerTaxTreatmentDes === 'GCC VAT REGISTERED' ||
                customerTaxTreatmentDes === 'GCC NON-VAT REGISTERED' ||
                customerTaxTreatmentDes === 'NON GCC'
              ) {
                vatList.map(element => {
                  if (element.name == 'ZERO RATED TAX (0%)') {
                    vt.push(element);
                  }
                });
              }
            }
          } else {
            if (
              customerTaxTreatmentDes === 'UAE VAT REGISTERED' ||
              customerTaxTreatmentDes === 'UAE NON-VAT REGISTERED' ||
              customerTaxTreatmentDes === 'UAE VAT REGISTERED FREEZONE' ||
              customerTaxTreatmentDes === 'UAE NON-VAT REGISTERED FREEZONE'
            ) {
              vt = vatList;
            }
            if (
              customerTaxTreatmentDes === 'GCC VAT REGISTERED' ||
              customerTaxTreatmentDes === 'GCC NON-VAT REGISTERED' ||
              customerTaxTreatmentDes === 'NON GCC'
            ) {
              vatList.map(element => {
                if (element.name == 'ZERO RATED TAX (0%)') {
                  vt.push(element);
                }
              });
            }
          }
        } else {
          vt = [
            {
              id: 10,
              vat: 0,
              name: 'N/A',
            },
          ];
        }

        pt.vat_list = vt;
        setProducttype(prevState => [...prevState, pt]);
        return pt;
      }
    }
  };

  const resetVatId = () => {
    setProducttype([]);
    let newData = [];
    const currentData = data;
    currentData.map((obj, index) => {
      if (isRegisteredVat) obj['vatCategoryId'] = '';
      else obj['vatCategoryId'] = 10;
      newData.push(obj);
      if (obj['productId']) getProductType(obj['productId']);
      return obj;
    });
    setValue('lineItemsString', newData, { shouldValidate: true });
    updateAmount(newData);
  };

  const exchangeRaterevalidate = exc => {
    let local = [...data];

    let local2 = local.map((obj, index) => {
      const result = product_list.find(item => item.id === obj.productId);
      return {
        ...obj,
        unitPrice: result ? (parseFloat(result.unitPrice) * (1 / exc)).toFixed(2) : 0,
      };
    });

    setData(local2);
    updateAmount(local2);
  };

  const prductValue = (e, row, name) => {
    let currentData = data;
    const result = product_list.find(item => item.id === parseInt(e));
    const producttypeItem = getProductType(parseInt(e));
    let idx;
    let exchangeRate =
      watch('exchangeRate') > 0 && watch('exchangeRate') !== '' ? watch('exchangeRate') : 1;

    currentData.map((obj, index) => {
      if (obj.id === row.id) {
        obj['unitPrice'] = (parseInt(result.unitPrice) * (1 / exchangeRate)).toFixed(2);
        obj['vatCategoryId'] = result.vatCategoryId;
        obj['description'] = result.description;
        obj['exciseTaxId'] = result.exciseTaxId;
        obj['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
        obj['unitType'] = result.unitType;
        obj['unitTypeId'] = result.unitTypeId;
        idx = index;

        if (isRegisteredVat) {
          if (producttypeItem) {
            if (producttypeItem.id === parseInt(e)) {
              obj['vatCategoryId'] = result.vatCategoryId;
            } else {
              obj['vatCategoryId'] = '';
            }
          }
        } else {
          obj['vatCategoryId'] = 10;
        }
      }
      return obj;
    });

    setValue(`lineItemsString.${idx}.vatCategoryId`, result.vatCategoryId, {
      shouldValidate: true,
    });
    setValue(`lineItemsString.${idx}.unitPrice`, result.unitPrice, { shouldValidate: true });
    setValue(`lineItemsString.${idx}.description`, result.description, { shouldValidate: true });
    setValue(`lineItemsString.${idx}.exciseTaxId`, parseInt(result.exciseTaxId), {
      shouldValidate: true,
    });
    updateAmount(currentData);
  };

  const deleteRow = (e, row) => {
    const id = row['id'];
    let newData = [];
    e.preventDefault();
    const currentData = data;
    newData = currentData.filter(obj => obj.id !== id);
    setValue('lineItemsString', newData, { shouldValidate: true });
    updateAmount(newData);
  };

  const checkedRow = () => {
    if (data.length > 0) {
      let length = data.length - 1;
      let temp = data?.[length].productId !== '' ? data?.[length].productId : -2;
      if (temp > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const updateAmount = dataItems => {
    let total_net = 0;
    let total_excise = 0;
    let total = 0;
    let total_vat = 0;
    let net_value = 0;
    let discount_total = 0;
    let exchangeRate =
      watch('exchangeRate') > 0 && watch('exchangeRate') !== '' ? watch('exchangeRate') : 1;

    dataItems.map(obj => {
      let unitprice = obj.unitPrice;
      const index =
        obj.vatCategoryId !== '' && vatList
          ? vatList.findIndex(item => item.id === +obj.vatCategoryId)
          : '';
      const vat = index !== '' && index >= 0 ? vatList[`${index}`].vat : 0;

      // Exclusive case
      let discount;
      let vat_amount;
      if (taxType === false) {
        if (obj.discountType === 'PERCENTAGE') {
          net_value = (+unitprice - +(unitprice * obj.discount) / 100) * obj.quantity;
          discount = unitprice * obj.quantity - net_value;
          if (obj.exciseTaxId != 0) {
            if (obj.exciseTaxId === 1) {
              const value = +net_value / 2;
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
          vat_amount = vat === 0 ? 0 : (+net_value * vat) / 100;
        } else {
          net_value = unitprice * obj.quantity - obj.discount;
          discount = unitprice * obj.quantity - net_value;
          if (obj.exciseTaxId != 0) {
            if (obj.exciseTaxId === 1) {
              const value = +net_value / 2;
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
          vat_amount = vat === 0 ? 0 : (+net_value * vat) / 100;
        }
      }
      // Inclusive case
      else {
        if (obj.discountType === 'PERCENTAGE') {
          net_value = (+unitprice - +(unitprice * obj.discount) / 100) * obj.quantity;
          discount = unitprice * obj.quantity - net_value;
          vat_amount = vat === 0 ? 0 : (+net_value * ((vat / (100 + vat)) * 100)) / 100;
          net_value = net_value - vat_amount;

          if (obj.exciseTaxId != 0) {
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
          net_value = unitprice * obj.quantity - obj.discount;
          discount = unitprice * obj.quantity - net_value;
          vat_amount = vat === 0 ? 0 : (+net_value * ((vat / (100 + vat)) * 100)) / 100;
          net_value = net_value - vat_amount;

          if (obj.exciseTaxId != 0) {
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

      obj.unitPrice = unitprice;
      obj.vatAmount = vat_amount;
      obj.subTotal = net_value ? parseFloat(net_value) + parseFloat(vat_amount) : 0;
      discount_total = +discount_total + discount;
      total_net = +(total_net + parseFloat(net_value));
      total_vat = +(total_vat + vat_amount);
      total_excise = +(total_excise + obj.exciseAmount);
      total = total_vat + total_net;
      return obj;
    });

    setData(dataItems);
    setValue('total_net', total_net - total_excise);
    setValue('invoiceVATAmount', total_vat);
    setValue('discount', discount_total ? discount_total : 0);
    setValue('totalAmount', total);
    setValue('total_excise', total_excise);
  };

  const setDateHandler = value => {
    setDatesChanged(true);
    const val = term.split('_');
    const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];

    const values = value ? value : watch('invoiceDate1');
    if (temp && values) {
      setInvoiceDueDate(dayjs(values).add(temp, 'days'));
      setInvoiceDate(dayjs(values));
      const date = dayjs(values).add(temp, 'days').format('DD-MM-YYYY');
      setValue('invoiceDueDate', date, { shouldValidate: true });
      setValue('invoiceDate1', values, { shouldValidate: true });
    }
  };

  const handleFileChange = e => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setValue('attachmentFile', file, { shouldValidate: true });
    }
  };

  const onSubmit = formData => {
    setDisabled(true);

    let postFormData = new FormData();
    postFormData.append('type', 2);
    postFormData.append('taxType', taxType);
    postFormData.append('invoiceId', currentCustomerId);
    postFormData.append(
      'referenceNumber',
      formData.invoice_number !== null ? formData.invoice_number : ''
    );

    if (formData.changeShippingAddress && formData.changeShippingAddress == true) {
      postFormData.append(
        'changeShippingAddress',
        formData.changeShippingAddress !== null ? formData.changeShippingAddress : ''
      );
      postFormData.append('shippingAddress', formData.shippingAddress.address ?? '');
      postFormData.append('shippingCountry', formData.shippingAddress.countryId ?? '');
      postFormData.append('shippingState', formData.shippingAddress.stateId ?? '');
      postFormData.append('shippingCity', formData.shippingAddress.city ?? '');
      postFormData.append('shippingPostZipCode', formData.shippingAddress.postZipCode ?? '');
      postFormData.append('shippingTelephone', formData.shippingAddress.telephone ?? '');
      postFormData.append('shippingFax', formData.shippingAddress.fax ?? '');
    }

    if (datesChanged === true) {
      postFormData.append(
        'invoiceDate',
        typeof formData.invoiceDate === 'string' ? invoiceDate : formData.invoiceDate
      );
      postFormData.append(
        'invoiceDueDate',
        typeof formData.invoiceDueDate === 'string' ? invoiceDueDate : formData.invoiceDueDate
      );
    } else {
      postFormData.append(
        'invoiceDate',
        typeof formData.invoiceDate === 'string' ? invoiceDateNoChange : ''
      );
      postFormData.append(
        'invoiceDueDate',
        typeof formData.invoiceDueDate === 'string' ? invoiceDueDateNoChange : ''
      );
    }

    postFormData.append(
      'exchangeRate',
      formData.exchangeRate !== null ? formData.exchangeRate : ''
    );
    postFormData.append(
      'receiptNumber',
      formData.receiptNumber !== null ? formData.receiptNumber : ''
    );
    postFormData.append(
      'contactPoNumber',
      formData.contact_po_number !== null ? formData.contact_po_number : ''
    );
    postFormData.append(
      'receiptAttachmentDescription',
      formData.receiptAttachmentDescription !== null ? formData.receiptAttachmentDescription : ''
    );
    postFormData.append('notes', formData.notes !== null ? formData.notes : '');
    postFormData.append('footNote', formData.footNote ? formData.footNote : '');
    postFormData.append('lineItemsString', JSON.stringify(data));
    postFormData.append('totalVatAmount', watch('invoiceVATAmount'));
    postFormData.append('totalAmount', watch('totalAmount'));
    postFormData.append('discount', watch('discount'));
    postFormData.append('totalExciseAmount', watch('total_excise'));
    postFormData.append('term', term);

    if (formData.contactId) {
      postFormData.append('contactId', formData.contactId);
    }
    if (formData.currencyCode) {
      postFormData.append('currencyCode', formData.currencyCode);
    }
    if (formData.placeOfSupplyId) {
      postFormData.append(
        'placeOfSupplyId',
        formData.placeOfSupplyId.value ? formData.placeOfSupplyId.value : formData.placeOfSupplyId
      );
    }
    if (formData.project) {
      postFormData.append('projectId', formData.project);
    }
    if (uploadFile.current?.files?.[0]) {
      postFormData.append('attachmentFile', uploadFile.current?.files?.[0]);
    }

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Invoice...');

    customerInvoiceDetailActions
      .updateInvoice(postFormData)
      .then(res => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? strings.InvoiceUpdatedSuccessfully : res.data.message
        );
        history.push('/admin/income/customer-invoice');
        setLoading(false);
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Invoice Updated Unsuccessfully!'
        );
      });
  };

  const openCustomerModalHandler = e => {
    e.preventDefault();
    setOpenCustomerModal(true);
  };

  const openProductModalHandler = () => {
    setOpenProductModal(true);
  };

  const getCurrentUser = newData => {
    let option;
    if (newData.label || newData.value) {
      option = newData;
    } else {
      option = {
        label: `${newData.fullName}`,
        value: newData.id,
      };
    }
    setValue('contactId', option.value, { shouldValidate: true });
  };

  const closeCustomerModal = res => {
    if (res) {
      customerInvoiceActions.getCustomerList(contactType);
    }
    setOpenCustomerModal(false);
  };

  const closeProductModal = () => {
    setOpenProductModal(false);
  };

  const getCurrentProduct = newProduct => {
    if (newProduct) {
      let newData = [];
      newData = data.filter(obj => obj.productId !== '');
      let exchangeRate =
        watch('exchangeRate') > 0 && watch('exchangeRate') !== '' ? watch('exchangeRate') : 1;

      setData([
        ...newData,
        {
          id: idCount + 1,
          description: newProduct.description,
          quantity: 1,
          discount: 0,
          unitPrice: (parseFloat(newProduct.unitPrice) * (1 / exchangeRate)).toFixed(2),
          vatCategoryId: isRegisteredVat ? '' : 10,
          exciseTaxId: newProduct.exciseTaxId,
          vatAmount: newProduct.vatAmount ? newProduct.vatAmount : 0,
          subTotal: newProduct.unitPrice,
          productId: newProduct.id,
          discountType: newProduct.discountType,
          unitType: newProduct.unitType,
          unitTypeId: newProduct.unitTypeId,
        },
      ]);

      setIdCount(idCount + 1);
      const values = { values: watch() };
      updateAmount([
        ...newData,
        {
          id: idCount + 1,
          description: newProduct.description,
          quantity: 1,
          discount: 0,
          unitPrice: (parseFloat(newProduct.unitPrice) * (1 / exchangeRate)).toFixed(2),
          vatCategoryId: isRegisteredVat ? '' : 10,
          exciseTaxId: newProduct.exciseTaxId,
          vatAmount: newProduct.vatAmount ? newProduct.vatAmount : 0,
          subTotal: newProduct.unitPrice,
          productId: newProduct.id,
          discountType: newProduct.discountType,
          unitType: newProduct.unitType,
          unitTypeId: newProduct.unitTypeId,
        },
      ]);
      addRow();
      getProductType(newProduct.id);

      setValue(`lineItemsString.${0}.unitPrice`, newProduct.unitPrice, { shouldValidate: true });
      setValue(`lineItemsString.${0}.unitType`, newProduct.unitType, { shouldValidate: true });
      setValue(`lineItemsString.${0}.quantity`, 1, { shouldValidate: true });
      setValue(`lineItemsString.${0}.discount`, 1, { shouldValidate: true });
      setValue(`lineItemsString.${0}.discountType`, 1, { shouldValidate: true });
      setValue(`lineItemsString.${0}.vatCategoryId`, newProduct.vatCategoryId, {
        shouldValidate: true,
      });
      setValue(`lineItemsString.${0}.exciseTaxId`, 1, { shouldValidate: true });
      setValue(`lineItemsString.${0}.productId`, newProduct.id, { shouldValidate: true });
    }
  };

  const getCompanyCurrency = () => {
    currencyConvertActions
      .getCompanyCurrency()
      .then(res => {
        if (res.status === 200) {
          setBasecurrency(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
        setLoading(false);
      });
  };

  const setExchange = value => {
    let result = currency_convert_list.filter(obj => {
      return obj.currencyCode === value;
    });
    if (result[0]) {
      setValue('exchangeRate', result[0].exchangeRate, { shouldValidate: true });
      exchangeRaterevalidate(result[0].exchangeRate);
    } else {
      setValue('exchangeRate', '', { shouldValidate: true });
      exchangeRaterevalidate('');
    }
  };

  const setCurrency = value => {
    let result = currency_convert_list.filter(obj => {
      return obj.currencyCode === value;
    });
    setCustomerCurrencyDes(result[0].currencyName);
    setValue('curreancyname', result[0].currencyName, { shouldValidate: true });
    setCustomerCurrencySymbol(result[0].currencyIsoCode);
  };

  const deleteInvoice = () => {
    const message1 = (
      <text>
        <b>Delete Customer Invoice?</b>
      </text>
    );
    const message = 'This customer invoice will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeInvoice}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeInvoice = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Invoice...');
    customerInvoiceDetailActions
      .deleteInvoice(currentCustomerId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? strings.InvoiceDeletedSuccessfully : res.data.message
          );
          history.push('/admin/income/customer-invoice');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Invoice Deleted Unsuccessfully!'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const getCurrency = opt => {
    let customer_currencyCode = 0;
    let customer_item_currency = '';
    customer_list.map(item => {
      if (item.label.contactId == opt) {
        setCustomerCurrency(item.label.currency.currencyCode);
        setCustomerCurrencyDes(item.label.currency.currencyName);
        setCustomerCurrencySymbol(item.label.currency.currencyIsoCode);
        customer_currencyCode = item.label.currency.currencyCode;
        customer_item_currency = item.label.currency;
      }
    });
    return customer_currencyCode;
  };

  const getTaxTreatment = opt => {
    let customer_taxTreatmentId = 0;
    let customer_item_taxTreatment = '';
    customer_list.map(item => {
      if (item.label.contactId == opt) {
        setCustomerTaxTreatmentDes(item.label.taxTreatment.taxTreatment);
        customer_taxTreatmentId = item.label.taxTreatment.id;
        customer_item_taxTreatment = item.label.currency;
      }
    });
    return customer_taxTreatmentId;
  };

  const rendertotalexcise = () => {
    let val = watch('total_excise').toLocaleString(navigator.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return parseFloat(val).toFixed(2);
  };

  const getStateList = countryCode => {
    customerInvoiceActions.getStateList(countryCode);
  };

  const getStateListForShippingAddress = countryCode => {
    customerInvoiceActions.getStateListForShippingAddress(countryCode).then(res => {
      setStateListForShipping(res);
    });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  let tmpCustomer_list = [];
  customer_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpCustomer_list.push(obj);
  });

  let hasExciseTax = false;
  if (watch()) {
    hasExciseTax = data.some(
      row => row.exciseTaxId !== null && row.exciseTaxId !== '' && row.exciseTaxId !== 0
    );
  }

  return (
    <div>
      <div className="detail-customer-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <FileText className="h-4 w-4" />
                        <span className="ml-2">{strings.UpdateInvoice}</span>
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
                              <Label htmlFor="invoice_number">
                                <span className="text-danger">* </span>
                                {strings.InvoiceNumber}
                              </Label>
                              <Controller
                                name="invoice_number"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    maxLength="50"
                                    id="invoice_number"
                                    placeholder={strings.InvoiceNumber}
                                    disabled
                                    className={errors.invoice_number ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.invoice_number && (
                                <div className="invalid-feedback">
                                  {errors.invoice_number.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="contactId">
                                <span className="text-danger">* </span>
                                {strings.CustomerName}
                              </Label>
                              <Controller
                                name="contactId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    id="contactId"
                                    options={
                                      tmpCustomer_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            tmpCustomer_list,
                                            'Customer Name'
                                          )
                                        : []
                                    }
                                    value={
                                      tmpCustomer_list &&
                                      tmpCustomer_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      resetVatId();
                                      if (option && option.value) {
                                        setValue('currencyCode', getCurrency(option.value), {
                                          shouldValidate: true,
                                        });
                                        setValue('taxTreatmentid', getTaxTreatment(option.value), {
                                          shouldValidate: true,
                                        });
                                        setExchange(getCurrency(option.value));
                                        field.onChange(option.value);
                                      } else {
                                        field.onChange('');
                                      }
                                      getContactShippingAddress(
                                        option.value,
                                        getTaxTreatment(option.value)
                                      );
                                    }}
                                    styles={selectStyles}
                                    className={errors.contactId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.contactId && (
                                <div className="invalid-feedback d-block">
                                  {errors.contactId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>

                          {isRegisteredVat && (
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="taxTreatmentid">{strings.TaxTreatment}</Label>
                                <Select
                                  options={
                                    taxTreatmentList
                                      ? selectOptionsFactory.renderOptions(
                                          'name',
                                          'id',
                                          taxTreatmentList,
                                          'VAT'
                                        )
                                      : []
                                  }
                                  isDisabled={true}
                                  id="taxTreatmentid"
                                  placeholder={strings.Select + strings.TaxTreatment}
                                  value={
                                    taxTreatmentList &&
                                    selectOptionsFactory
                                      .renderOptions('name', 'id', taxTreatmentList, 'VAT')
                                      .find(option => option.label === customerTaxTreatmentDes)
                                  }
                                  styles={selectStyles}
                                />
                              </FormGroup>
                            </Col>
                          )}

                          <Col lg={3}>
                            {customerTaxTreatmentDes !== 'NON GCC' &&
                              customerTaxTreatmentDes !== 'GCC VAT REGISTERED' &&
                              customerTaxTreatmentDes !== 'GCC NON-VAT REGISTERED' && (
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
                                        options={placelist}
                                        placeholder={strings.Select + strings.PlaceofSupply}
                                        value={
                                          field.value?.value
                                            ? field.value
                                            : placelist.find(option => option.value == field.value)
                                        }
                                        onChange={option => {
                                          field.onChange(option);
                                          setPlaceOfSupplyId(option);
                                        }}
                                        styles={selectStyles}
                                        className={errors.placeOfSupplyId ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.placeOfSupplyId && (
                                    <div className="invalid-feedback d-block">
                                      {errors.placeOfSupplyId.message}
                                    </div>
                                  )}
                                </FormGroup>
                              )}
                          </Col>
                        </Row>

                        <Row>
                          <Col
                            lg={12}
                            className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                          >
                            <FormGroup>
                              <Button
                                type="button"
                                color="danger"
                                className="btn-square"
                                disabled={disabled1}
                                onClick={deleteInvoice}
                              >
                                <Trash2 className="h-4 w-4" />{' '}
                                {disabled1 ? 'Deleting...' : strings.Delete}
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/income/customer-invoice');
                                }}
                              >
                                <Ban className="h-4 w-4" /> {strings.Cancel}
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
        <CustomerModal
          openCustomerModal={openCustomerModal}
          closeCustomerModal={closeCustomerModal}
          getCurrentUser={getCurrentUser}
          contactType={{ label: 'Customer', value: 2 }}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={closeProductModal}
          getCurrentProduct={e => {
            customerInvoiceActions.getProductList().then(res => {
              if (res.status === 200) getCurrentProduct(res.data[0]);
            });
          }}
          income={income}
          createProduct={productActions.createAndSaveProduct}
          vat_list={vatList}
          product_category_list={product_category_list}
          salesCategory={salesCategory}
          purchaseCategory={purchaseCategory}
        />
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailCustomerInvoice);
