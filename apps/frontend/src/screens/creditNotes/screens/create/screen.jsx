import React from 'react';
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
import DatePicker from 'react-datepicker';
import Switch from 'react-switch';
import * as CreditNotesCreateActions from './actions';
import * as CreditNotesActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import {
  LeavePage,
  Loader,
  ProductTableCalculation,
  ProductTable,
  TotalCalculation,
} from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, DropdownLists, selectStyles } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Textarea } from '@/components/ui/textarea';
// Use import instead of require for Vite compatibility
import invoiceimage from 'assets/images/invoice/invoice.png';

// Zod validation schema
const createCreditNoteSchema = z.object({
  invoiceNumber: z.any(),
  creditNoteNumber: z.string().min(1, 'Tax credit note number is required'),
  contactId: z.union([
    z.string().min(1, 'Customer name is required'),
    z.object({ value: z.any(), label: z.string() }),
  ]),
  creditNoteDate: z.any().refine((val) => val !== null && val !== '', {
    message: 'Tax credit note date is required',
  }),
  lineItemsString: z
    .array(
      z.object({
        quantity: z.any().refine((val) => val > 0, {
          message: 'Quantity should be greater than 0',
        }),
      })
    )
    .min(1, 'At least one Tax Credit Note sub detail is mandatory'),
  attachmentFile: z.any().optional(),
  creditAmount: z.any().optional(),
  placeOfSupplyId: z.any().optional(),
  receiptAttachmentDescription: z.string().optional(),
  receiptNumber: z.string().optional(),
  contact_po_number: z.string().optional(),
  currency: z.any().optional(),
  notes: z.string().optional(),
  email: z.string().optional(),
  discount: z.any().optional(),
  discountPercentage: z.string().optional(),
  discountType: z.string().optional(),
  totalNet: z.number().optional(),
  invoiceVATAmount: z.number().optional(),
  totalVatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  totalExciseAmount: z.number().optional(),
  exchangeRate: z.any().optional(),
  currencyCode: z.any().optional(),
  remainingInvoiceAmount: z.any().optional(),
  taxTreatmentid: z.any().optional(),
}).refine(
  (data) => {
    // Custom validation for conditional fields
    return true;
  },
  { message: 'Validation error' }
);

const mapStateToProps = state => {
  const contact_list = state.customer_invoice.customer_list;
  return {
    currency_list: state.customer_invoice.currency_list,
    invoice_list: state.creditNote.invoice_list,
    vat_list: state.customer_invoice.vat_list,
    product_list: state.customer_invoice.product_list,
    customer_list: state.customer_invoice.customer_list,
    excise_list: state.customer_invoice.excise_list,
    country_list: state.customer_invoice.country_list,
    product_category_list: state.product.product_category_list,
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    companyDetails: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    creditNotesActions: bindActionCreators(CreditNotesActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    creditNotesCreateActions: bindActionCreators(CreditNotesCreateActions, dispatch),
    productActions: bindActionCreators(ProductActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const ZERO = 0.0;
let strings = new LocalizedStrings(data);

const CreateCreditNote = ({
  creditNotesActions,
  currencyConvertActions,
  creditNotesCreateActions,
  productActions,
  commonActions,
  currency_list,
  invoice_list,
  vat_list,
  product_list,
  customer_list,
  excise_list,
  country_list,
  product_category_list,
  customer_list_dropdown,
  universal_currency_list,
  currency_convert_list,
  companyDetails,
  history,
  location,
}) => {
  const [language, setLanguage] = React.useState(window['localStorage'].getItem('language'));
  const [customer_currency_symbol, setCustomerCurrencySymbol] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [discountOptions] = React.useState([
    { value: 'FIXED', label: 'Fixed' },
    { value: 'PERCENTAGE', label: 'Percentage' },
  ]);
  const [exciseTypeOption] = React.useState([
    { value: 'Inclusive', label: 'Inclusive' },
    { value: 'Exclusive', label: 'Exclusive' },
  ]);
  const [data, setData] = React.useState([
    {
      id: 0,
      description: '',
      quantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      exciseTaxId: '',
      exciseAmount: 0,
      subTotal: 0,
      vatAmount: 0,
      productId: '',
      isExciseTaxExclusive: '',
      discountType: 'FIXED',
      discount: 0,
      unitType: '',
      unitTypeId: '',
    },
  ]);
  const [idCount, setIdCount] = React.useState(0);
  const [contactType] = React.useState(2);
  const [selectedContact, setSelectedContact] = React.useState('');
  const [createMore, setCreateMore] = React.useState(false);
  const [fileName, setFileName] = React.useState('');
  const [term, setTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState({ value: 'FIXED', label: 'Fixed' });
  const [discountPercentage, setDiscountPercentage] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [exist, setExist] = React.useState(false);
  const [prefix, setPrefix] = React.useState('');
  const [purchaseCategory, setPurchaseCategory] = React.useState([]);
  const [salesCategory, setSalesCategory] = React.useState([]);
  const [basecurrency, setBasecurrency] = React.useState([]);
  const [inventoryList, setInventoryList] = React.useState([]);
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = React.useState('');
  const [invoiceSelected, setInvoiceSelected] = React.useState(false);
  const [isCreatedWIWP, setIsCreatedWIWP] = React.useState(false);
  const [quantityExceeded, setQuantityExceeded] = React.useState('');
  const [isCreatedWithoutInvoice, setIsCreatedWithoutInvoice] = React.useState(false);
  const [loadingMsg, setLoadingMsg] = React.useState('Loading');
  const [disableLeavePage, setDisableLeavePage] = React.useState(false);
  const [lockInvoiceDetail, setLockInvoiceDetail] = React.useState(false);
  const [receiptDate, setReceiptDate] = React.useState('');
  const [isfreshCN, setIsfreshCN] = React.useState(true);
  const [customer_currency, setCustomerCurrency] = React.useState('');
  const [customer_currency_des, setCustomerCurrencyDes] = React.useState('');
  const [customer_taxTreatment, setCustomerTaxTreatment] = React.useState('');
  const [customer_taxTreatment_des, setCustomerTaxTreatmentDes] = React.useState('');
  const [taxTreatmentList, setTaxTreatmentList] = React.useState([]);
  const [isRegisteredVat, setIsRegisteredVat] = React.useState(false);
  const [isDesignatedZone, setIsDesignatedZone] = React.useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = React.useState(null);
  const [taxType, setTaxType] = React.useState(false);
  const [placeOfSupplyId, setPlaceOfSupplyId] = React.useState(null);
  const [option, setOption] = React.useState(null);

  const uploadFileRef = React.useRef(null);

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

  const regEx = /^[0-9\b]+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regExCNNum = /[a-zA-Z0-9-/]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  const regDecimalP = /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/;

  const form = useForm({
    resolver: zodResolver(createCreditNoteSchema),
    defaultValues: {
      invoiceNumber: '',
      receiptAttachmentDescription: '',
      receiptNumber: '',
      contact_po_number: '',
      currency: '',
      creditNoteDate: new Date(),
      contactId: '',
      placeOfSupplyId: '',
      project: '',
      term: '',
      lineItemsString: [
        {
          id: 0,
          description: '',
          quantity: 1,
          exciseAmount: 0,
          discount: 0,
          unitPrice: '',
          vatCategoryId: '',
          productId: '',
          subTotal: 0,
        },
      ],
      creditNoteNumber: '',
      totalNet: 0,
      invoiceVATAmount: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      notes: '',
      email: '',
      discount: 0,
      discountPercentage: '',
      discountType: 'FIXED',
      creditAmount: '',
      totalExciseAmount: 0,
      exchangeRate: '',
      currencyCode: '',
      remainingInvoiceAmount: '',
      taxTreatmentid: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    getValues,
    setError: setFormError,
    clearErrors,
    trigger,
  } = form;

  React.useEffect(() => {
    getInitialData();
    getDefaultNotes();
  }, []);

  const getDefaultNotes = () => {
    commonActions.getNoteSettingsInfo().then(res => {
      if (res.status === 200) {
        setValue('notes', res.data.defaultNotes, { shouldValidate: true });
        setValue('footNote', res.data.defaultFootNotes, { shouldValidate: true });
      }
    });
  };

  const getInitialData = () => {
    if (companyDetails) {
      const { currencyCode, isRegisteredVat, isDesignatedZone, vatRegistrationDate } =
        companyDetails;
      setValue('currencyCode', currencyCode);
      setCompanyVATRegistrationDate(new Date(dayjs(vatRegistrationDate)));
      setIsDesignatedZone(isDesignatedZone);
      setIsRegisteredVat(isRegisteredVat);
      setLoading(false);
    }
    getInvoiceNo();
    creditNotesActions.getInvoiceListForDropdown();
    creditNotesActions.getCustomerList(contactType);
    creditNotesActions.getCountryList();
    creditNotesActions.getExciseList();
    creditNotesActions.getVatList();
    creditNotesActions.getProductList();
    productActions.getProductCategoryList();
    creditNotesActions
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
    commonActions.getCurrencyConversionList().then(action => {
      if (action && action.type && action.type.includes('fulfilled')) {
        setValue('currency', action.payload ? parseInt(action.payload[0].currencyCode) : '');
      }
    });
    getCompanyCurrency();
    salesCategoryFunc();
    purchaseCategoryFunc();
    if (location?.state?.invoiceID) {
      getInvoiceDetails(location?.state?.invoiceID);
      setValue('invoiceNumber', location?.state?.invoiceID, { shouldValidate: true });
      setInvoiceSelected(true);
      setLockInvoiceDetail(true);
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

  const salesCategoryFunc = () => {
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

  const purchaseCategoryFunc = () => {
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

  const validationCheck = value => {
    const validationData = {
      moduleType: 28,
      name: value,
    };
    creditNotesCreateActions.checkValidation(validationData).then(response => {
      if (response.data === 'Credit Note Number Already Exists') {
        setExist(true);
      } else {
        setExist(false);
      }
    });
  };

  const getCurrency = (currencyCode, currencyName, currencyIsoCode) => {
    setCustomerCurrency(currencyCode);
    setCustomerCurrencyDes(currencyName);
    setCustomerCurrencySymbol(currencyIsoCode);
    return currencyCode;
  };

  const getTaxTreatment = opt => {
    let customer_taxTreatmentId = 0;
    customer_list.map(item => {
      if (item.label.contactId == opt) {
        setCustomerTaxTreatment(item.label.taxTreatment.id);
        setCustomerTaxTreatmentDes(item.label.taxTreatment.taxTreatment);
        customer_taxTreatmentId = item.label.taxTreatment.id;
      }
    });
    return customer_taxTreatmentId;
  };

  const setExchange = value => {
    let result = currency_convert_list
      ? currency_convert_list.find(obj => {
          return obj.currencyCode === value;
        })
      : '';
    setValue('exchangeRate', result?.exchangeRate, { shouldValidate: true });
  };

  const getInvoiceDetails = value => {
    if (value) {
      creditNotesCreateActions.getInvoiceById(value).then(response => {
        if (response.status === 200) {
          const customerdetails = {
            label:
              response.data.organisationName === ''
                ? response.data.name
                : response.data.organisationName,
            value: response.data.contactId,
          };

          setIsfreshCN(false);
          setReceiptDate(response.data.receiptDate);
          setTaxType(response.data.taxType);
          setPlaceOfSupplyId(response.data.placeOfSupplyId);
          setOption({
            label:
              response.data.organisationName === ''
                ? response.data.name
                : response.data.organisationName,
            value: response.data.contactId,
          });
          setData(response.data.invoiceLineItems);
          setCustomerCurrency(response.data.currencyCode);
          setRemainingInvoiceAmount(response.data.remainingInvoiceAmount);

          setValue('lineItemsString', response.data.invoiceLineItems, { shouldValidate: true });
          setValue('currency', response.data.currencyCode, { shouldValidate: true });
          setValue('taxTreatmentid', getTaxTreatment(customerdetails.value), {
            shouldValidate: true,
          });
          setValue('placeOfSupplyId', response.data.placeOfSupplyId, { shouldValidate: true });
          setExchange(
            getCurrency(
              response?.data?.currencyCode,
              response?.data?.currencyName,
              response?.data?.currencyIsoCode
            )
          );
          setValue('contactId', response.data.contactId, { shouldValidate: true });
          setValue('remainingInvoiceAmount', response.data.remainingInvoiceAmount, {
            shouldValidate: true,
          });
          setValue('currencyCode', response.data.currencyCode, { shouldValidate: true });

          updateAmount(response.data.invoiceLineItems);
        }
      });
    }
  };

  const getInvoiceNo = () => {
    creditNotesCreateActions.getInvoiceNo().then(res => {
      if (res.status === 200) {
        setValue('creditNoteNumber', res.data, { shouldValidate: true });
        validationCheck(res.data);
      }
    });
  };

  const getCurrentProduct = () => {
    creditNotesActions.getProductList().then(res => {
      const newData = [
        {
          id: 0,
          discount: 0,
          description: res.data[0].description,
          quantity: 1,
          unitPrice: res.data[0].unitPrice,
          vatCategoryId: res.data[0].vatCategoryId,
          subTotal: res.data[0].unitPrice,
          productId: res.data[0].id,
          discountType: res.data[0].discountType,
          exciseTaxId: res.data[0].exciseTaxId,
          unitType: res.data[0].unitType,
          unitTypeId: res.data[0].unitTypeId,
        },
      ];
      setData(newData);
      updateAmount(newData);
      setValue('lineItemsString', newData, { shouldValidate: true });
    });
  };

  const updateAmount = (dataToUpdate) => {
    const list = ProductTableCalculation.updateAmount(
      dataToUpdate ? dataToUpdate : [],
      vat_list,
      taxType
    );
    setData(list.data ? list.data : []);
    setValue('totalNet', list.totalNet ? list.totalNet : 0);
    setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('discount', list.discount ? list.discount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('totalExciseAmount', list.totalExciseAmount ? list.totalExciseAmount : 0);
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

  const onSubmit = data => {
    setDisabled(true);
    setDisableLeavePage(true);
    const {
      receiptAttachmentDescription,
      receiptNumber,
      contact_po_number,
      currency,
      invoiceNumber,
      exchangeRate,
      creditNoteDate,
      contactId,
      creditNoteNumber,
      discount,
      discountType,
      discountPercentage,
      notes,
      email,
      creditAmount,
      vatCategoryId,
      placeOfSupplyId,
    } = data;

    const formData = new FormData();

    formData.append('isCreatedWithoutInvoice', isCreatedWithoutInvoice);
    formData.append('isCreatedWIWP', isCreatedWIWP);
    formData.append('creditNoteNumber', creditNoteNumber ? prefix + creditNoteNumber : '');
    formData.append('email', email ? email : '');
    formData.append(
      'creditNoteDate',
      creditNoteDate ? dayjs(creditNoteDate, 'DD-MM-YYYY').toDate() : null
    );
    formData.append('referenceNo', receiptNumber !== null ? receiptNumber : '');
    formData.append('exchangeRate', exchangeRate ? exchangeRate : '');
    formData.append('contactPoNumber', contact_po_number !== null ? contact_po_number : '');
    formData.append(
      'receiptAttachmentDescription',
      receiptAttachmentDescription !== null ? receiptAttachmentDescription : ''
    );
    formData.append('notes', notes !== null ? notes : '');
    formData.append('type', 7);
    if (isCreatedWIWP === true) formData.append('totalAmount', creditAmount);

    formData.append('vatCategoryId', 2);
    formData.append('taxType', taxType ? taxType : false);

    if (invoiceNumber) {
      formData.append('invoiceId', invoiceNumber.value ? invoiceNumber.value : invoiceNumber);
      formData.append('cnCreatedOnPaidInvoice', '1');
    }
    if (placeOfSupplyId) {
      formData.append(
        'placeOfSupplyId',
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }
    if (!isCreatedWIWP) {
      const values = getValues();
      formData.append('lineItemsString', JSON.stringify(data));
      formData.append('totalVatAmount', values.totalVatAmount);
      formData.append('totalAmount', values.totalAmount);
      formData.append('discount', values.discount);
      formData.append('totalExciseTaxAmount', values.totalExciseAmount);
    }
    if (contactId) {
      formData.append('contactId', contactId.value ? contactId.value : contactId);
    }
    if (currency !== null && currency) {
      formData.append('currencyCode', customer_currency);
    }
    if (uploadFileRef.current && uploadFileRef.current.files && uploadFileRef.current.files[0]) {
      formData.append('attachmentFile', uploadFileRef.current.files[0]);
    }

    setLoading(true);
    setLoadingMsg('Creating Credit Note...');
    creditNotesCreateActions
      .createCreditNote(formData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'New Tax Credit Note Created Successfully.'
        );
        if (createMore) {
          creditNotesActions.getInvoiceListForDropdown();
          setDisableLeavePage(false);
          setRemainingInvoiceAmount('');
          setCreateMore(false);
          setSelectedContact('');
          setTerm('');
          setData([
            {
              id: 0,
              description: '',
              quantity: 1,
              unitPrice: '',
              vatCategoryId: '',
              subTotal: 0,
              productId: '',
            },
          ]);
          reset({
            ...getValues(),
            totalNet: 0,
            totalVatAmount: 0,
            totalAmount: 0,
            discountType: '',
            discount: 0,
            discountPercentage: '',
            totalExciseAmount: 0,
          });
          getInvoiceNo();
          setValue('lineItemsString', data, { shouldValidate: false });
        } else {
          history.push('/admin/income/credit-notes');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'New Tax Credit Note Created Unsuccessfully.'
        );
      });
  };

  strings.setLanguage(language);

  return loading === true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
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
                        <i className="nav-icon fas fa-donate" />
                        <span className="ml-2">{strings.CreateCreditNote}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Row>
                      <Col lg={12}>
                        <Loader />
                      </Col>
                    </Row>
                  ) : (
                    <Row>
                      <Col lg={12}>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                          <Row>
                            {!isCreatedWithoutInvoice && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="invoiceNumber">
                                    <span className="text-danger">* </span>
                                    {strings.InvoiceNumber}
                                  </Label>
                                  <Controller
                                    name="invoiceNumber"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        isDisabled={lockInvoiceDetail}
                                        id="invoiceNumber"
                                        placeholder={strings.Select + strings.InvoiceNumber}
                                        options={
                                          invoice_list.data
                                            ? selectOptionsFactory.renderOptions(
                                                'label',
                                                'value',
                                                invoice_list.data,
                                                'Invoice Number'
                                              )
                                            : []
                                        }
                                        styles={selectStyles}
                                        onChange={option => {
                                          field.onChange(option);
                                          if (option && option.value) {
                                            getInvoiceDetails(option.value);
                                            setInvoiceSelected(true);
                                          } else {
                                            setInvoiceSelected(false);
                                          }
                                          setValue('receiptNumber', option?.label || '', {
                                            shouldValidate: true,
                                          });
                                        }}
                                        className={
                                          errors.invoiceNumber && touchedFields.invoiceNumber
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.invoiceNumber && touchedFields.invoiceNumber && (
                                    <div className="invalid-feedback d-block">
                                      {errors.invoiceNumber.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            )}
                          </Row>
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="creditNoteNumber">
                                  <span className="text-danger">* </span>
                                  {strings.CreditNoteNumber}
                                </Label>
                                <Controller
                                  name="creditNoteNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      maxLength="50"
                                      type="text"
                                      id="creditNoteNumber"
                                      placeholder={strings.Enter + strings.CreditNoteNumber}
                                      onChange={option => {
                                        if (
                                          option.target.value === '' ||
                                          regExCNNum.test(option.target.value)
                                        ) {
                                          field.onChange(option);
                                        }
                                        validationCheck(option.target.value);
                                      }}
                                      className={
                                        errors.creditNoteNumber && touchedFields.creditNoteNumber
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.creditNoteNumber && touchedFields.creditNoteNumber && (
                                  <div className="invalid-feedback">
                                    {errors.creditNoteNumber.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
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
                                        customer_list_dropdown
                                          ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              customer_list_dropdown,
                                              'Customer Name'
                                            )
                                          : []
                                      }
                                      styles={selectStyles}
                                      value={
                                        field.value?.value
                                          ? field.value
                                          : customer_list_dropdown &&
                                            selectOptionsFactory
                                              .renderOptions(
                                                'label',
                                                'value',
                                                customer_list_dropdown,
                                                'Customer Name'
                                              )
                                              .find(obj => obj.value === field.value)
                                      }
                                      isDisabled={invoiceSelected}
                                      onChange={option => {
                                        field.onChange(option);
                                      }}
                                      className={
                                        errors.contactId && touchedFields.contactId
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.contactId && touchedFields.contactId && (
                                  <div className="invalid-feedback d-block">
                                    {errors.contactId.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>

                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="taxTreatmentid">{strings.TaxTreatment}</Label>
                                <Controller
                                  name="taxTreatmentid"
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
                                      styles={selectStyles}
                                      isDisabled={true}
                                      id="taxTreatmentid"
                                      placeholder={strings.Select + strings.TaxTreatment}
                                      value={
                                        taxTreatmentList &&
                                        selectOptionsFactory
                                          .renderOptions('name', 'id', taxTreatmentList, 'VAT')
                                          .find(
                                            option => option.label === customer_taxTreatment_des
                                          )
                                      }
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                            <Col lg={3}>
                              {customer_taxTreatment_des !== 'NON GCC' &&
                                customer_taxTreatment_des !== 'GCC VAT REGISTERED' &&
                                customer_taxTreatment_des !== 'GCC NON-VAT REGISTERED' && (
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
                                          placeholder={strings.Select + strings.PlaceofSupply}
                                          options={
                                            placelist
                                              ? selectOptionsFactory.renderOptions(
                                                  'label',
                                                  'value',
                                                  placelist,
                                                  'Place of Supply'
                                                )
                                              : []
                                          }
                                          styles={selectStyles}
                                          value={
                                            placelist &&
                                            selectOptionsFactory
                                              .renderOptions(
                                                'label',
                                                'value',
                                                placelist,
                                                'Place of Supply'
                                              )
                                              .find(option => option.value == placeOfSupplyId)
                                          }
                                          isDisabled={placeOfSupplyId !== null}
                                          onChange={option => {
                                            field.onChange(option);
                                            setPlaceOfSupplyId(option);
                                          }}
                                        />
                                      )}
                                    />
                                  </FormGroup>
                                )}
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="creditNoteDate">
                                  <span className="text-danger">* </span>
                                  {strings.CreditNoteDate}
                                </Label>
                                <Controller
                                  name="creditNoteDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      {...field}
                                      id="creditNoteDate"
                                      placeholderText={strings.Select + strings.CreditNoteDate}
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      minDate={new Date(dayjs(receiptDate, 'YYYY-MM-DD').format())}
                                      dropdownMode="select"
                                      selected={field.value}
                                      className={`form-control ${
                                        errors.creditNoteDate && touchedFields.creditNoteDate
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                    />
                                  )}
                                />
                                {errors.creditNoteDate && touchedFields.creditNoteDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.creditNoteDate.message}
                                  </div>
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
                                      isDisabled={true}
                                      styles={selectStyles}
                                      placeholder={strings.Select + strings.Currency}
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
                                          .renderOptions(
                                            'currencyName',
                                            'currencyCode',
                                            currency_convert_list,
                                            'Currency'
                                          )
                                          .find(option => option.value === +customer_currency)
                                      }
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>

                            {!isCreatedWithoutInvoice && invoiceSelected === true && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="remainingInvoiceAmount">
                                    {strings.RemainingInvoiceAmount}
                                  </Label>
                                  <Input
                                    type="text"
                                    id="remainingInvoiceAmount"
                                    name="remainingInvoiceAmount"
                                    placeholder="Remaining invoice Amount"
                                    disabled={true}
                                    value={remainingInvoiceAmount}
                                  />
                                </FormGroup>
                              </Col>
                            )}

                            {isCreatedWIWP === true && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="creditAmount">
                                    <span className="text-danger">* </span>
                                    {strings.CreditAmount}
                                  </Label>
                                  <Controller
                                    name="creditAmount"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="14,2"
                                        id="creditAmount"
                                        placeholder={strings.Enter + strings.CreditAmount}
                                        onChange={value => {
                                          if (
                                            (regDecimal.test(value.target.value) &&
                                              parseFloat(value.target.value) >= 1) ||
                                            value.target.value === ''
                                          ) {
                                            field.onChange(value);
                                          }
                                        }}
                                        className={
                                          errors.creditAmount && touchedFields.creditAmount
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.creditAmount && (
                                    <div className="invalid-feedback">
                                      {errors.creditAmount.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            )}
                          </Row>
                          <hr />
                          {isCreatedWIWP === false && (
                            <>
                              <Row>
                                <Col lg={8} className="mb-3"></Col>
                                <Col>
                                  {taxType === false ? (
                                    <span style={{ color: '#0069d9' }} className="mr-4">
                                      <b>{strings.Exclusive}</b>
                                    </span>
                                  ) : (
                                    <span className="mr-4">{strings.Exclusive}</span>
                                  )}
                                  <Switch
                                    checked={taxType}
                                    disabled
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
                                    initValue={getValues()}
                                    isRegisteredVat={isRegisteredVat}
                                    universal_currency_list={universal_currency_list}
                                    setData={newData => {
                                      setData(newData);
                                      setValue('lineItemsString', newData, { shouldValidate: true });
                                    }}
                                    setIdCount={setIdCount}
                                    props={{ errors, touched: touchedFields }}
                                    strings={strings}
                                    vat_list={vat_list}
                                    product_list={product_list}
                                    excise_list={excise_list}
                                    discountEnabled={getValues().discount != 0 ? true : false}
                                    idCount={idCount}
                                    updateAmount={updateAmount}
                                    enableAccount={false}
                                    exchangeRate={getValues().exchangeRate}
                                    disableVat={!isRegisteredVat}
                                    disableAll={true}
                                  />
                                </Col>
                              </Row>

                              {getValues().discount != 0 && (
                                <Row className="ml-4 ">
                                  <Col className=" ml-4">
                                    <FormGroup className="pull-right">
                                      <Input
                                        type="checkbox"
                                        id="discountEnabled"
                                        checked={getValues().discount != 0 ? true : false}
                                        value={getValues().discount != 0 ? true : false}
                                      />
                                      <Label>{strings.ApplyLineItemDiscount}</Label>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              )}
                            </>
                          )}
                          {data[0].id != 0 ? (
                            <Row>
                              <Col lg={8}>
                                <FormGroup className="py-2">
                                  <Label htmlFor="notes">{strings.RefundNotes}</Label>
                                  <br />
                                  <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                      <Textarea
                                        {...field}
                                        style={{ width: '500px' }}
                                        className="textarea"
                                        maxLength={255}
                                        id="notes"
                                        rows={4}
                                        placeholder={strings.DeliveryNotes}
                                      />
                                    )}
                                  />
                                </FormGroup>

                                <Row>
                                  <Col lg={6}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="receiptNumber">
                                        {strings.ReferenceNumber}
                                      </Label>
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
                                            className={
                                              errors.receiptNumber && touchedFields.receiptNumber
                                                ? 'is-invalid'
                                                : ' '
                                            }
                                          />
                                        )}
                                      />
                                      {errors.receiptNumber && touchedFields.receiptNumber && (
                                        <div className="invalid-feedback">
                                          {errors.receiptNumber.message}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={6}>
                                    <FormGroup className="mb-3 hideAttachment">
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
                                          <i
                                            className="fa fa-close"
                                            onClick={() => setFileName('')}
                                          ></i>{' '}
                                          {fileName}
                                        </div>
                                      )}
                                      {errors.attachmentFile && touchedFields.attachmentFile && (
                                        <div className="invalid-file">
                                          {errors.attachmentFile.message}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <FormGroup className="mb-3 hideAttachment">
                                  <Label htmlFor="receiptAttachmentDescription">
                                    {strings.AttachmentDescription}
                                  </Label>
                                  <br />
                                  <Controller
                                    name="receiptAttachmentDescription"
                                    control={control}
                                    render={({ field }) => (
                                      <Textarea
                                        {...field}
                                        className="textarea"
                                        maxLength={250}
                                        style={{ width: '700px' }}
                                        id="receiptAttachmentDescription"
                                        rows={2}
                                        placeholder={strings.ReceiptAttachmentDescription}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                              {!isCreatedWIWP && (
                                <Col lg={4}>
                                  <TotalCalculation
                                    initValue={getValues()}
                                    currency_symbol={getValues().currencyIsoCode}
                                    isRegisteredVat={isRegisteredVat}
                                    strings={strings}
                                    discountEnabled={getValues().discount != 0 ? true : false}
                                  />
                                </Col>
                              )}
                            </Row>
                          ) : (
                            <Row>
                              <Col lg={8}>
                                <FormGroup className="py-2">
                                  <Label htmlFor="notes">{strings.RefundNotes}</Label>
                                  <br />
                                  <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                      <Textarea
                                        {...field}
                                        style={{ width: '700px' }}
                                        className="textarea"
                                        maxLength={255}
                                        id="notes"
                                        rows={2}
                                        placeholder={strings.DeliveryNotes}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          )}
                          <Row>
                            <Col
                              lg={12}
                              className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                            >
                              <FormGroup className="text-right w-100">
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={
                                    disabled ||
                                    (parseFloat(parseFloat(getValues().totalAmount).toFixed(2)) >
                                      remainingInvoiceAmount &&
                                      !isCreatedWIWP)
                                  }
                                  onClick={() => {
                                    if (errors && Object.keys(errors).length != 0)
                                      commonActions.fillManDatoryDetails();
                                    setCreateMore(false);
                                    handleSubmit(onSubmit)();
                                  }}
                                >
                                  <i className="fa fa-dot-circle-o"></i>{' '}
                                  {disabled ? 'Creating...' : strings.Create}
                                </Button>

                                {!location?.state?.invoiceID && (
                                  <Button
                                    type="button"
                                    color="primary"
                                    className="btn-square mr-3"
                                    disabled={
                                      disabled ||
                                      (parseFloat(parseFloat(getValues().totalAmount).toFixed(2)) >
                                        remainingInvoiceAmount &&
                                        !isCreatedWIWP)
                                    }
                                    onClick={() => {
                                      if (errors && Object.keys(errors).length != 0)
                                        commonActions.fillManDatoryDetails();
                                      setCreateMore(true);
                                      handleSubmit(onSubmit)();
                                    }}
                                  >
                                    <i className="fa fa-refresh"></i>{' '}
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
                                    } else if (location?.state?.invoiceID)
                                      history.push('/admin/income/customer-invoice');
                                    else history.push('/admin/income/credit-notes');
                                  }}
                                >
                                  <i className="fa fa-ban"></i> {strings.Cancel}
                                </Button>
                              </FormGroup>
                            </Col>
                          </Row>

                          {parseFloat(parseFloat(getValues().totalAmount).toFixed(2)) >
                            remainingInvoiceAmount &&
                            !isCreatedWIWP && (
                              <div style={{ color: 'red' }}>
                                Remaining Invoice Amount cannot be less than Total Amount
                              </div>
                            )}
                        </Form>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateCreditNote);
