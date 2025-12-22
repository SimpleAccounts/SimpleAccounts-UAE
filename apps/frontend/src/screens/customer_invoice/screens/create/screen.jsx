import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';
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
import * as CustomerInvoiceCreateActions from './actions';
import * as CustomerInvoiceActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import { CustomerModal, ProductModal } from 'screens/customer_invoice/sections';
import {
  LeavePage,
  Loader,
  CurrencyExchangeRate,
  ProductTable,
  ProductTableCalculation,
  InvoiceAdditionaNotesInformation,
  TotalCalculation,
  TermDateInput,
} from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import {
  renderList,
  selectOptionsFactory,
  InputValidation,
  DropdownLists,
  Lists,
  selectStyles,
} from 'utils';
import { Switch } from '@/components/ui/switch';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { AddressComponent } from 'screens/contact/sections';
import { FileText, Plus, CircleDot, RefreshCw, Ban } from 'lucide-react';

const mapStateToProps = state => {
  const contact_list = state.customer_invoice.customer_list;
  const currencyList = state.common.currency_convert_list;
  return {
    currency_list: state.customer_invoice.currency_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    vat_list: state.customer_invoice.vat_list,
    product_list: state.common.product_list,
    customer_list: contact_list,
    excise_list: state.customer_invoice.excise_list,
    country_list: state.customer_invoice.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
    companyDetails: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    customerInvoiceCreateActions: bindActionCreators(CustomerInvoiceCreateActions, dispatch),
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
const createCustomerInvoiceSchema = z
  .object({
    invoice_number: z.string().min(1, 'Invoice number is required'),
    contactId: z
      .union([
        z.string().min(1, 'Customer Name is required'),
        z.number().positive('Customer Name is required'),
        z.object({ value: z.union([z.string(), z.number()]), label: z.string() }),
      ])
      .refine(
        val => {
          // Accept string, number, or object with value
          if (typeof val === 'string') return val.length > 0;
          if (typeof val === 'number') return val > 0;
          if (typeof val === 'object' && val !== null)
            return val.value !== undefined && val.value !== null && val.value !== '';
          return false;
        },
        { message: 'Customer Name is required' }
      ),
    term: z
      .union([
        z.string().min(1, 'Term is required'),
        z.object({ value: z.string(), label: z.string() }),
      ])
      .refine(
        val => {
          if (typeof val === 'object' && val.label === 'Select Terms') return false;
          return true;
        },
        { message: 'Term is required' }
      ),
    currencyCode: z.union([
      z.string().min(1, 'Currency is required'),
      z.object({ value: z.string(), label: z.string() }),
    ]),
    invoiceDate: z
      .union([z.string(), z.date()])
      .refine(val => val !== '', { message: 'Invoice date is required' }),
    invoiceDueDate: z.string().optional(),
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
    discount: z.union([z.string(), z.number()]).optional(),
    discountPercentage: z.string().optional(),
    discountType: z.string().optional(),
    totalNet: z.number().optional(),
    totalVatAmount: z.number().optional(),
    totalAmount: z.number().optional(),
    totalExciseAmount: z.number().optional(),
    currencyName: z.string().optional(),
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

const regExInvNum = /[a-zA-Z0-9-/]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

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

const CreateCustomerInvoice = ({
  customerInvoiceActions,
  customerInvoiceCreateActions,
  productActions,
  commonActions,
  currency_list_dropdown,
  vat_list,
  product_list,
  customer_list,
  customer_list_dropdown,
  excise_list,
  country_list,
  product_category_list,
  universal_currency_list,
  currency_convert_list,
  companyDetails,
  history,
  location: locationProp,
}) => {
  // Use useLocation hook for React Router v6 compatibility
  const locationFromHook = useLocation();
  const location = locationProp || locationFromHook;
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [discountOptions] = useState([
    { value: 'FIXED', label: 'FIXED' },
    { value: 'PERCENTAGE', label: '%' },
  ]);
  const [exciseTypeOption] = useState([
    { value: 'Inclusive', label: 'Inclusive' },
    { value: 'Exclusive', label: 'Exclusive' },
  ]);
  const [data, setData] = useState([
    {
      id: 0,
      description: '',
      quantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      exciseTaxId: '',
      discountType: 'FIXED',
      exciseAmount: 0,
      discount: 0,
      subTotal: 0,
      vatAmount: 0,
      productId: '',
      isExciseTaxExclusive: '',
      unitType: '',
    },
  ]);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [contactType] = useState(2);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [createMore, setCreateMore] = useState(false);
  const [fileName, setFileName] = useState('');
  const [term, setTerm] = useState('');
  const [enablePlaceOfSupply, setEnablePlaceOfSupply] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [exist, setExist] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [income] = useState(true);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [basecurrency, setBasecurrency] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [param, setParam] = useState(false);
  const [date, setDate] = useState('');
  const [contactId, setContactId] = useState('');
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [invoiceBeforeVatRegistration, setInvoiceBeforeVatRegistration] = useState(false);
  const [producttype, setProducttype] = useState([]);
  const [isQuotationSelected, setIsQuotationSelected] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [taxTreatmentId, setTaxTreatmentId] = useState('');
  const [prefixData, setPrefixData] = useState(null);
  const [placeOfSupplyId, setPlaceOfSupplyId] = useState('');
  const [quotationId, setQuotationId] = useState(null);
  const [quotationDate, setQuotationDate] = useState(null);
  const [parentInvoiceId, setParentInvoiceId] = useState(null);

  const uploadFile = useRef(null);

  const form = useForm({
    resolver: zodResolver(createCustomerInvoiceSchema),
    defaultValues: {
      receiptAttachmentDescription: '',
      receiptNumber: '',
      contact_po_number: '',
      currencyCode: '',
      invoiceDueDate: '',
      invoiceDate: new Date(),
      contactId: '',
      placeOfSupplyId: '',
      term: '',
      exchangeRate: 1,
      changeShippingAddress: false,
      shippingAddress: Lists.Address,
      lineItemsString: [
        {
          id: 0,
          description: '',
          quantity: 1,
          unitPrice: '',
          vatCategoryId: '',
          productId: '',
        },
      ],
      invoice_number: '',
      totalNet: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      notes: '',
      discount: 0,
      discountPercentage: '',
      discountType: 'FIXED',
      totalExciseAmount: 0,
      currencyName: '',
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
  const watchInvoiceNumber = watch('invoice_number');

  useEffect(() => {
    if (watchInvoiceNumber) {
      validationCheck(watchInvoiceNumber);
    }
  }, [watchInvoiceNumber]);

  const setDateHandler = value => {
    const val = term ? term.value.split('_') : '';
    const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];

    const values = value ? value : dayjs(watch('invoiceDate'), 'DD-MM-YYYY').toDate();
    if (temp && values) {
      setDate(dayjs(values).add(temp, 'days'));
      const date1 = dayjs(values).add(temp, 'days').format('DD-MM-YYYY');
      setValue('invoiceDueDate', date1, { shouldValidate: true });
    }
  };

  const setCurrency = (value, exchangeRateValue) => {
    if (currency_convert_list) {
      let result = currency_convert_list.find(obj => obj.currencyCode === value);
      if (result) {
        setValue('currencyCode', result.currencyCode, { shouldValidate: true });
        setValue('exchangeRate', result.exchangeRate, { shouldValidate: true });
        setValue('currencyName', result.currencyName, { shouldValidate: true });
        resetProductTableValues(result.exchangeRate, exchangeRateValue);
      }
    }
  };

  const validationCheck = useCallback(
    value => {
      const validationData = {
        moduleType: 6,
        name: value,
      };
      customerInvoiceCreateActions.checkValidation(validationData).then(response => {
        if (response.data === 'Invoice Number Already Exists') {
          setExist(true);
          setError('invoice_number', {
            type: 'manual',
            message: 'Invoice number already exists',
          });
        } else {
          setExist(false);
          clearErrors('invoice_number');
        }
      });
    },
    [customerInvoiceCreateActions, setError, clearErrors]
  );

  const getQuotationDetails = async quotationIdParam => {
    customerInvoiceCreateActions.getQuotationById(quotationIdParam).then(res => {
      if (res.status === 200) {
        const invoiceData = renderList.mapInvoiceListFromQuotation(res.data);
        populateData(invoiceData);
      }
    });
  };

  const populateData = invoiceData => {
    delete invoiceData.initValue.invoiceNumber;

    Object.entries(invoiceData.initValue).forEach(([name, value]) => {
      setValue(name, value, { shouldValidate: true });
    });

    const populatedData = invoiceData.state.data || data;
    setData(populatedData);
    setIdCount(invoiceData.state.idCount || 0);
    setLoading(false);
    getVatListForProducts(renderList.addRow(populatedData, invoiceData.state.idCount));
  };

  const getParentInvoiceDetails = parentInvoiceIdParam => {
    customerInvoiceCreateActions.getInvoiceById(parentInvoiceIdParam).then(res => {
      if (res.status === 200) {
        const invoiceData = renderList.mapInvoiceList(res.data);
        populateData(invoiceData);
      }
    });
  };

  const getDefaultNotes = () => {
    commonActions.getNoteSettingsInfo().then(res => {
      if (res.status === 200) {
        setValue('notes', res.data.defaultNotes, { shouldValidate: true });
        setValue('footNote', res.data.defaultFootNotes, { shouldValidate: true });
      }
    });
  };

  const getInitialData = async () => {
    getInvoiceNo();
    await customerInvoiceActions.getCustomerList(contactType);
    await customerInvoiceActions.getCountryList();
    await customerInvoiceActions.getExciseList();
    await commonActions.getProductList();
    await productActions.getProductCategoryList();
    await customerInvoiceActions.getInvoicePrefix().then(response => {
      setPrefixData(response.data);
    });
    await customerInvoiceActions
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
    await customerInvoiceActions.getVatList();

    if (companyDetails) {
      const {
        currencyCode,
        isRegisteredVat: regVat,
        isDesignatedZone: desZone,
        vatRegistrationDate,
      } = companyDetails;
      setValue('currencyCode', currencyCode);
      setCompanyVATRegistrationDate(new Date(dayjs(vatRegistrationDate)));
      setIsDesignatedZone(desZone);
      setIsRegisteredVat(regVat);
      setLoading(false);
    }

    if (location?.state?.quotationId) {
      setQuotationId(location.state.quotationId);
      getQuotationDetails(location.state.quotationId);
    }

    if (location?.state?.parentInvoiceId) {
      setParentInvoiceId(location.state.parentInvoiceId);
      getParentInvoiceDetails(location.state.parentInvoiceId);
    }

    getDefaultNotes();
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const discountType = row => {
    return (
      discountOptions &&
      selectOptionsFactory
        .renderOptions('label', 'value', discountOptions, 'discount')
        .find(option => option.value === +row.discountType)
    );
  };

  const getContactShippingAddress = (customerID, taxID) => {
    const { placeList } = Lists;
    if (enablePlaceOfSupply) {
      customerInvoiceCreateActions.getCustomerShippingAddressbyID(customerID).then(res => {
        if (res.status === 200) {
          var PlaceofSupply =
            placeList &&
            placeList.find(
              option => option.label.toUpperCase() === res.data.shippingStateName.toUpperCase()
            );
          if (PlaceofSupply) {
            setPlaceOfSupplyId(PlaceofSupply);
            setValue('placeOfSupplyId', PlaceofSupply.value, { shouldValidate: true });
          }
        }
      });
    }
  };

  const getTaxTreatment = e => {
    let taxTreatmentIdValue = '';
    taxTreatmentIdValue = e.taxTreatment;
    setTaxTreatmentId(taxTreatmentIdValue);
    setEnablePlaceOfSupply(
      !!(
        taxTreatmentIdValue !== 'GCC VAT REGISTERED' &&
        taxTreatmentIdValue !== 'GCC NON-VAT REGISTERED' &&
        taxTreatmentIdValue !== 'NON GCC'
      )
    );
    setValue('taxTreatmentId', taxTreatmentIdValue, { shouldValidate: true });

    getContactShippingAddress(e.id, taxTreatmentIdValue);
    return taxTreatmentIdValue;
  };

  const getProductType = id => {
    if (taxTreatmentId) {
      const product = product_list.find(obj => obj.id === id);
      if (product) {
        var vt = [];
        if (isRegisteredVat && !invoiceBeforeVatRegistration) {
          if (isDesignatedZone) {
            if (product.productType === 'GOODS') {
              if (
                taxTreatmentId === 'UAE VAT REGISTERED' ||
                taxTreatmentId === 'UAE VAT REGISTERED FREEZONE' ||
                taxTreatmentId === 'UAE NON-VAT REGISTERED FREEZONE' ||
                taxTreatmentId === 'GCC VAT REGISTERED' ||
                taxTreatmentId === 'GCC NON-VAT REGISTERED' ||
                taxTreatmentId === 'NON GCC'
              ) {
                vat_list.map(element => {
                  if (element.name == 'OUT OF SCOPE') {
                    vt.push(element);
                  }
                });
              }
              if (taxTreatmentId === 'UAE NON-VAT REGISTERED') {
                vt = vat_list;
              }
            } else if (product.productType === 'SERVICE') {
              if (
                taxTreatmentId === 'UAE VAT REGISTERED' ||
                taxTreatmentId === 'UAE NON-VAT REGISTERED' ||
                taxTreatmentId === 'UAE VAT REGISTERED FREEZONE' ||
                taxTreatmentId === 'UAE NON-VAT REGISTERED FREEZONE'
              ) {
                vt = vat_list;
              }
              if (
                taxTreatmentId === 'GCC VAT REGISTERED' ||
                taxTreatmentId === 'GCC NON-VAT REGISTERED' ||
                taxTreatmentId === 'NON GCC'
              ) {
                vat_list.map(element => {
                  if (element.name == 'ZERO RATED TAX (0%)') {
                    vt.push(element);
                  }
                });
              }
            }
          } else {
            if (
              taxTreatmentId === 'UAE VAT REGISTERED' ||
              taxTreatmentId === 'UAE NON-VAT REGISTERED' ||
              taxTreatmentId === 'UAE VAT REGISTERED FREEZONE' ||
              taxTreatmentId === 'UAE NON-VAT REGISTERED FREEZONE'
            ) {
              vt = vat_list;
            }
            if (
              taxTreatmentId === 'GCC VAT REGISTERED' ||
              taxTreatmentId === 'GCC NON-VAT REGISTERED' ||
              taxTreatmentId === 'NON GCC'
            ) {
              vat_list.map(element => {
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

        return vt;
      }
    }
  };

  const resetProductTableValues = (newExchangeRate, preExchangeRate) => {
    const newData = [];
    data.map(obj => {
      const result = product_list.find(item => item.id === obj.productId);
      if (obj.productId && result) {
        const vatList = getProductType(obj.productId);
        obj.vat_list = vatList;
        if (preExchangeRate && newExchangeRate !== preExchangeRate) {
          obj.unitPrice = result
            ? (parseFloat(result.unitPrice) * (1 / newExchangeRate)).toFixed(2)
            : 0;
        }
        obj.vatCategoryId = getVatCategoryId(obj.vatCategoryId, vatList);
      }
      newData.push(obj);
      return obj;
    });
    setValue('lineItemsString', newData, { shouldValidate: true });
    updateAmount(newData);
  };

  const updateAmount = dataToUpdate => {
    const list = ProductTableCalculation.updateAmount(dataToUpdate, vat_list, taxType);
    setData(list.data ? list.data : []);
    setValue('totalNet', list.totalNet ? list.totalNet : 0);
    setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('discount', list.discount ? list.discount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('totalExciseAmount', list.totalExciseAmount ? list.totalExciseAmount : 0);
  };

  const getVatListForProducts = dataToProcess => {
    if (dataToProcess && dataToProcess.length > 0) {
      let newData = [];
      dataToProcess.map(obj => {
        if (obj.productId) {
          const vatList = getProductType(obj.productId);
          obj.vat_list = vatList;
          obj.vatCategoryId = getVatCategoryId(obj.vatCategoryId, vatList);
        }
        newData.push(obj);
        return obj;
      });
      setValue('lineItemsString', newData, { shouldValidate: true });
      updateAmount(newData);
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
    if (exist) {
      return;
    }

    setDisabled(true);
    const postFormData = new FormData();
    postFormData.append('taxType', taxType);
    postFormData.append('quotationId', quotationId ?? '');
    postFormData.append(
      'referenceNumber',
      formData.invoice_number !== null ? prefix + formData.invoice_number : ''
    );
    postFormData.append('invoiceDueDate', formData.invoiceDueDate ? formData.invoiceDueDate : null);
    postFormData.append('invoiceDate', formData.invoiceDate ? formData.invoiceDate : null);
    postFormData.append(
      'receiptNumber',
      formData.receiptNumber !== null ? formData.receiptNumber : ''
    );
    postFormData.append(
      'receiptAttachmentDescription',
      formData.receiptAttachmentDescription !== null ? formData.receiptAttachmentDescription : ''
    );
    postFormData.append(
      'exchangeRate',
      formData.exchangeRate !== null ? formData.exchangeRate : ''
    );
    postFormData.append(
      'contactPoNumber',
      formData.contact_po_number !== null ? formData.contact_po_number : ''
    );

    if (formData.changeShippingAddress && formData.changeShippingAddress === true) {
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

    postFormData.append('notes', formData.notes !== null ? formData.notes : '');
    postFormData.append('footNote', formData.footNote ? formData.footNote : '');
    postFormData.append('type', 2);
    const local = data.map(({ taxtreatment, vat_list: vatListItem, ...rest }) => rest);
    postFormData.append('lineItemsString', JSON.stringify(local));
    postFormData.append('totalVatAmount', watch('totalVatAmount'));
    postFormData.append('totalAmount', watch('totalAmount'));
    postFormData.append('totalExciseAmount', watch('totalExciseAmount'));
    postFormData.append('discount', watch('discount'));
    postFormData.append('term', term ? (term.value ?? term) : '');
    postFormData.append(
      'contactId',
      formData.contactId ? (formData.contactId.value ?? formData.contactId) : ''
    );
    postFormData.append(
      'placeOfSupplyId',
      formData.placeOfSupplyId ? (formData.placeOfSupplyId.value ?? formData.placeOfSupplyId) : ''
    );
    postFormData.append(
      'currencyCode',
      formData.currencyCode ? (formData.currencyCode.value ?? formData.currencyCode) : ''
    );

    if (uploadFile.current && uploadFile.current.files && uploadFile.current.files[0]) {
      postFormData.append('attachmentFile', uploadFile.current.files[0]);
    }

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Invoice...');

    customerInvoiceCreateActions
      .createInvoice(postFormData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? strings.InvoiceCreatedSuccessfully : res.data.message
        );

        if (createMore) {
          setCreateMore(false);
          setSelectedContact('');
          setExchangeRate('');
          setDisableLeavePage(false);
          setProducttype([]);
          setData([
            {
              id: 0,
              description: '',
              quantity: 1,
              unitPrice: '',
              vatCategoryId: '',
              taxtreatment: '',
              subTotal: 0,
              discount: 0,
              discountType: 'FIXED',
              vatAmount: 0,
              productId: '',
            },
          ]);

          reset({
            ...watch(),
            totalNet: 0,
            totalVatAmount: 0,
            totalAmount: 0,
            discountType: 'FIXED',
            discount: 0,
            discountPercentage: '',
            totalExciseAmount: 0,
            contactId: '',
            placeOfSupplyId: '',
            currencyCode: null,
            taxTreatmentId: '',
            term: '',
            changeShippingAddress: false,
          });

          setContactId('');
          setPlaceOfSupplyId('');
          getInvoiceNo();
          setValue('lineItemsString', data, { shouldValidate: false });
        } else {
          history.push('/admin/income/customer-invoice');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Invoice Created Unsuccessfully!'
        );
      });
  };

  const openCustomerModalHandler = () => {
    setOpenCustomerModal(true);
  };

  const openProductModalHandler = () => {
    setOpenProductModal(true);
  };

  const getVatCategoryId = (vatId, vatList) => {
    if (!isRegisteredVat || invoiceBeforeVatRegistration) {
      return 10;
    }
    const vatCategory = vatList && vatList.find(vat => vat.id === vatId);
    if (vatCategory) return vatCategory.id;
    else return vatList && vatList.length > 0 ? vatList[0]?.id : '';
  };

  const getCurrentProduct = newProduct => {
    if (newProduct) {
      let exchangeRateValue = watch('exchangeRate') || 1;
      const vatList = getProductType(newProduct.id);
      data.map(obj => {
        if (!obj.productId) {
          obj['unitPrice'] = (parseFloat(newProduct.unitPrice) * (1 / exchangeRateValue)).toFixed(
            2
          );
          obj['exciseTaxId'] = newProduct.exciseTaxId;
          obj['description'] = newProduct.description;
          obj['discountType'] = newProduct.discountType;
          obj['transactionCategoryId'] = newProduct.transactionCategoryId;
          obj['transactionCategoryLabel'] = newProduct.transactionCategoryLabel;
          obj['isExciseTaxExclusive'] = newProduct.isExciseTaxExclusive;
          obj['unitType'] = newProduct.unitType;
          obj['unitTypeId'] = newProduct.unitTypeId;
          obj['productId'] = newProduct.id;
          obj['quantity'] = '1';
          obj.vat_list = vatList;
          obj['vatCategoryId'] = getVatCategoryId(parseInt(newProduct.vatCategoryId), vatList);
        }
        return obj;
      });

      setData(data);
      setIdCount(idCount + 1);
      updateAmount(renderList.addRow(data, idCount));
      setValue('lineItemsString', data, { shouldValidate: true });
    }
  };

  const closeCustomerModal = () => {
    setOpenCustomerModal(false);
  };

  const closeProductModal = () => {
    setOpenProductModal(false);
  };

  const getInvoiceNo = () => {
    customerInvoiceCreateActions.getInvoiceNo().then(res => {
      if (res.status === 200) {
        setValue('invoice_number', res.data, { shouldValidate: true });
        validationCheck(res.data);
      }
    });
  };

  const setContactDetails = customerID => {
    if (!customerID) return;

    // Normalize customerID to a scalar value (handle both object and primitive formats)
    // Use stricter check: only treat as object if it has a 'value' property
    // Note: customerID is guaranteed to be truthy due to early return above
    const customerIdValue =
      typeof customerID === 'object' && 'value' in customerID ? customerID.value : customerID;
    setValue('contactId', customerIdValue, { shouldValidate: true });

    // Find customer from original customer_list (not dropdown) to get full structure
    if (!customer_list || !Array.isArray(customer_list)) return;

    const customer = customer_list.find(
      obj =>
        obj.value === customerIdValue ||
        obj.contactId === customerIdValue ||
        (obj.label &&
          (obj.label.value === customerIdValue || obj.label.contactId === customerIdValue))
    );
    if (customer) {
      // Safely access nested properties with optional chaining
      const customerLabel = customer.label || customer;
      const currencyCode =
        customerLabel?.currency?.currencyCode || customerLabel?.currencyCode || null;
      const taxTreatment =
        customerLabel?.taxTreatment?.taxTreatment || customerLabel?.taxTreatment || null;

      // Use normalized customerIdValue consistently
      setContactId(customerIdValue);

      if (taxTreatment) {
        setTaxTreatmentId(taxTreatment);
        setEnablePlaceOfSupply(
          !!(
            taxTreatment !== 'GCC VAT REGISTERED' &&
            taxTreatment !== 'GCC NON-VAT REGISTERED' &&
            taxTreatment !== 'NON GCC'
          )
        );
        setValue('taxTreatmentId', taxTreatment, { shouldValidate: true });
        // Use normalized customerIdValue consistently
        getContactShippingAddress(customerIdValue, taxTreatment);
      } else {
        setValue('taxTreatmentId', '', { shouldValidate: true });
      }

      if (currencyCode) {
        setCurrency(currencyCode);
      }
    } else {
      setValue('taxTreatmentId', '', { shouldValidate: true });
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  const { termList, placeList } = Lists;

  return (
    <div>
      <div className="create-customer-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <FileText className="h-4 w-4" />
                        <span className="ml-2">{strings.CreateInvoice}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <FormProvider {...form}>
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
                                      onChange={option => {
                                        if (
                                          option.target.value === '' ||
                                          regExInvNum.test(option.target.value)
                                        ) {
                                          field.onChange(option);
                                        }
                                      }}
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
                          <hr />
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
                                      isDisabled={isQuotationSelected}
                                      id="contactId"
                                      placeholder={strings.Select + strings.CustomerName}
                                      options={customer_list_dropdown}
                                      value={
                                        field.value?.value
                                          ? field.value
                                          : customer_list_dropdown.find(
                                              option => option.value == field.value
                                            )
                                      }
                                      onChange={option => {
                                        // Pass the full option object to field.onChange for validation
                                        field.onChange(option);
                                        // Pass the value (could be number) to setContactDetails
                                        if (option) {
                                          setContactDetails(option.value || option);
                                        }
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
                            {quotationId ? (
                              ''
                            ) : (
                              <Col lg={3}>
                                <Label htmlFor="contactId" style={{ display: 'block' }}>
                                  {strings.AddNewCustomer}
                                </Label>
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-square mr-3 mb-3"
                                  onClick={openCustomerModalHandler}
                                >
                                  <Plus className="h-4 w-4" /> {strings.AddACustomer}
                                </Button>
                              </Col>
                            )}
                            {isRegisteredVat && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="taxTreatmentId">{strings.TaxTreatment}</Label>
                                  <Controller
                                    name="taxTreatmentId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
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
                                        id="taxTreatmentId"
                                        placeholder={strings.Select + strings.TaxTreatment}
                                        value={
                                          taxTreatmentList &&
                                          selectOptionsFactory
                                            .renderOptions('name', 'id', taxTreatmentList, 'VAT')
                                            .find(option => option.label === field.value)
                                        }
                                        styles={selectStyles}
                                        className={errors.taxTreatmentId ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.taxTreatmentId && (
                                    <div className="invalid-feedback d-block">
                                      {errors.taxTreatmentId.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            )}
                            <Col lg={3}>
                              {enablePlaceOfSupply && (
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
                                        isDisabled={isQuotationSelected}
                                        id="placeOfSupplyId"
                                        placeholder={strings.Select + strings.PlaceofSupply}
                                        options={placeList}
                                        value={
                                          field.value?.value
                                            ? field.value
                                            : placeList.find(option => option.value == field.value)
                                        }
                                        onChange={option => {
                                          field.onChange(option.value);
                                          setPlaceOfSupplyId(option.value);
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
                          <hr />
                          <Row>
                            <TermDateInput
                              fields={{
                                term: {
                                  values: term ?? '',
                                  errors: errors.term,
                                  touched: true,
                                  label: strings.Terms,
                                  required: true,
                                  disabled: false,
                                  name: 'term',
                                  placeholder: strings.Terms,
                                },
                                invoiceDate: {
                                  values: watch('invoiceDate'),
                                  errors: errors.invoiceDate,
                                  touched: true,
                                  label: strings.InvoiceDate,
                                  required: true,
                                  disabled: false,
                                  name: 'invoiceDate',
                                  placeholder: strings.Select + strings.InvoiceDate,
                                  minDate: quotationDate,
                                },
                                invoiceDueDate: {
                                  values: watch('invoiceDueDate'),
                                  errors: errors.invoiceDueDate,
                                  touched: true,
                                  label: strings.InvoiceDueDate,
                                  required: true,
                                  disabled: true,
                                  name: 'invoiceDueDate',
                                  placeholder: strings.InvoiceDueDate,
                                },
                              }}
                              onChange={(field, value) => {
                                if (field === 'term') setTerm(value);
                                else if (field === 'invoiceDate') {
                                  if (dayjs(value).isBefore(dayjs(companyVATRegistrationDate))) {
                                    setInvoiceBeforeVatRegistration(true);
                                    resetProductTableValues();
                                  } else {
                                    setInvoiceBeforeVatRegistration(false);
                                    resetProductTableValues();
                                  }
                                }
                                setValue(field, value);
                              }}
                            />
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="currencyCode">
                                  <span className="text-danger">* </span>
                                  {strings.Currency}
                                </Label>
                                <Controller
                                  name="currencyCode"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      placeholder={strings.Select + strings.Currency}
                                      options={currency_list_dropdown}
                                      value={
                                        field.value?.values
                                          ? field.value
                                          : currency_list_dropdown.find(
                                              option => option.value === field.value
                                            )
                                      }
                                      onChange={option => {
                                        field.onChange(option);
                                        setCurrency(option.value, watch('exchangeRate'));
                                      }}
                                      styles={selectStyles}
                                      className={errors.currencyCode ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.currencyCode && (
                                  <div className="invalid-feedback d-block">
                                    {errors.currencyCode.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col>
                              <FormGroup check inline className="mb-3">
                                <div>
                                  <Controller
                                    name="changeShippingAddress"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="checkbox"
                                        id="inline-radio1"
                                        checked={field.value}
                                        onChange={value => {
                                          if (value !== null) {
                                            field.onChange(value);
                                          } else {
                                            field.onChange('');
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                  <label htmlFor="inline-radio1">
                                    {strings.noteforchangeaddress}
                                  </label>
                                </div>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row
                            style={{
                              display: watch('changeShippingAddress') === true ? '' : 'none',
                            }}
                          >
                            <AddressComponent
                              values={watch('shippingAddress') || {}}
                              errors={errors.shippingAddress || {}}
                              touched={true}
                              onChange={(field, value) => {
                                setValue(`shippingAddress.${field}`, value);
                              }}
                              country_list={country_list}
                              addressType={strings.Shipping}
                              disabled={{
                                email: false,
                                city: false,
                                countryId: false,
                                address: false,
                                postZipCode: false,
                                stateId: false,
                                telephone: false,
                                fax: false,
                              }}
                            />
                          </Row>
                          <hr />
                          <CurrencyExchangeRate
                            strings={strings}
                            currencyName={watch('currencyName')}
                            exchangeRate={watch('exchangeRate')}
                            onChange={value => {
                              resetProductTableValues(value, watch('exchangeRate'));
                              setValue('exchangeRate', value);
                            }}
                          />
                          <Row className="mb-3">
                            <Col lg={8} className="mb-3">
                              {quotationId ? (
                                ''
                              ) : (
                                <Button
                                  color="primary"
                                  className="btn-square mr-3"
                                  onClick={openProductModalHandler}
                                >
                                  <Plus className="h-4 w-4" /> {strings.Addproduct}
                                </Button>
                              )}
                            </Col>

                            <Col>
                              {taxType === false ? (
                                <span style={{ color: '#0069d9' }} className="mr-4">
                                  <b>{strings.Exclusive}</b>
                                </span>
                              ) : (
                                <span className="mr-4">{strings.Exclusive}</span>
                              )}
                              <Switch
                                value={taxType}
                                checked={taxType}
                                onChange={newTaxType => {
                                  setTaxType(newTaxType);
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
                                className="react-switch "
                              />
                              {taxType === true ? (
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
                              <ProductTable
                                data={data}
                                initValue={watch()}
                                isRegisteredVat={isRegisteredVat}
                                universal_currency_list={universal_currency_list}
                                setData={newData => {
                                  setData(newData);
                                  setValue('lineItemsString', newData, { shouldValidate: true });
                                }}
                                setIdCount={newIdCount => {
                                  setIdCount(newIdCount);
                                }}
                                props={{ values: watch(), errors, touched: {} }}
                                strings={strings}
                                vat_list={vat_list}
                                product_list={product_list}
                                excise_list={excise_list}
                                discountEnabled={discountEnabled}
                                idCount={idCount}
                                updateAmount={updateAmount}
                                enableAccount={false}
                                exchangeRate={watch('exchangeRate')}
                                disableVat={invoiceBeforeVatRegistration || !isRegisteredVat}
                                getProductType={id => {
                                  const vatList = getProductType(id);
                                  return vatList;
                                }}
                              />
                            </Col>
                          </Row>

                          <Row className="ml-4 ">
                            <Col className=" ml-4">
                              <FormGroup className="pull-right">
                                <Input
                                  type="checkbox"
                                  id="discountEnabled"
                                  checked={discountEnabled}
                                  onChange={() => {
                                    if (watch('discount') > 0) {
                                      setDiscountEnabled(true);
                                    } else {
                                      setDiscountEnabled(!discountEnabled);
                                    }
                                  }}
                                />
                                <Label>{strings.ApplyLineItemDiscount}</Label>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={8}>
                              <InvoiceAdditionaNotesInformation
                                notesValue={watch('notes')}
                                notesLabel={strings.Notes}
                                notesPlaceholder={strings.DeliveryNotes}
                                onChange={(field, value) => {
                                  setValue(field, value);
                                }}
                                referenceNumberLabel={strings.ReferenceNumber}
                                referenceNumberPlaceholder={strings.ReceiptNumber}
                                referenceNumberValue={watch('receiptNumber')}
                                referenceNumber={true}
                                notes={true}
                                footNotePlaceholder={strings.PaymentDetails}
                                footNoteLabel={strings.Footnote}
                                footNoteValue={watch('footNote')}
                                footNote={true}
                              />
                            </Col>
                            <Col lg={4}>
                              <TotalCalculation
                                initValue={watch()}
                                currency_symbol={watch('currencyIsoCode')}
                                isRegisteredVat={isRegisteredVat}
                                strings={strings}
                                discountEnabled={discountEnabled}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col
                              lg={12}
                              className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                            >
                              <FormGroup className="text-right w-100">
                                <Button
                                  type="submit"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={disabled}
                                  onClick={() => {
                                    if (data.length === 1) {
                                      if (errors && Object.keys(errors).length != 0) {
                                        commonActions.fillManDatoryDetails();
                                      }
                                    } else {
                                      let newData = [];
                                      newData = data.filter(obj => obj.productId !== '');
                                      setValue('lineItemsString', newData, {
                                        shouldValidate: true,
                                      });
                                      updateAmount(newData);
                                    }
                                    setCreateMore(false);
                                  }}
                                >
                                  <CircleDot className="h-4 w-4" />{' '}
                                  {disabled ? 'Creating...' : strings.Create}
                                </Button>
                                {quotationId || parentInvoiceId ? (
                                  ''
                                ) : (
                                  <Button
                                    type="submit"
                                    color="primary"
                                    className="btn-square mr-3"
                                    disabled={disabled}
                                    onClick={() => {
                                      if (data.length === 1) {
                                        if (errors && Object.keys(errors).length != 0) {
                                          commonActions.fillManDatoryDetails();
                                        }
                                      } else {
                                        let newData = [];
                                        newData = data.filter(obj => obj.productId !== '');
                                        setValue('lineItemsString', newData, {
                                          shouldValidate: true,
                                        });
                                        updateAmount(newData);
                                      }
                                      setCreateMore(true);
                                    }}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    {disabled ? 'Creating...' : strings.CreateandMore}
                                  </Button>
                                )}
                                <Button
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    if (location?.state?.renderURL) {
                                      history.push(`${location?.state?.renderURL}`, {
                                        id: location?.state?.renderID,
                                      });
                                    } else {
                                      history.push('/admin/income/customer-invoice');
                                    }
                                  }}
                                >
                                  <Ban className="h-4 w-4" />
                                  {strings.Cancel}
                                </Button>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Form>
                      </FormProvider>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        <CustomerModal
          openCustomerModal={openCustomerModal}
          closeCustomerModal={() => {
            closeCustomerModal();
          }}
          getCurrentUser={e => {
            customerInvoiceActions.getCustomerList(contactType);
            setContactDetails(e.value ?? e.id);
            getTaxTreatment(e);
          }}
          contactType={{ label: 'Customer', value: 2 }}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={() => {
            closeProductModal();
          }}
          getCurrentProduct={e => {
            customerInvoiceActions.getProductList().then(res => {
              if (res.status === 200) getCurrentProduct(res.data[0]);
            });
          }}
          income={income}
          createProduct={productActions.createAndSaveProduct}
          vat_list={vat_list}
          product_category_list={product_category_list}
          salesCategory={salesCategory}
          purchaseCategory={purchaseCategory}
        />
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateCustomerInvoice);
