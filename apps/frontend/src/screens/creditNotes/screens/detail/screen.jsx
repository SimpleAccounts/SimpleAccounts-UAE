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
import { Switch } from '@/components/ui/switch';
import * as CreditNotesDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as CreditNotesActions from '../../actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { CustomerModal, ProductModal } from '../../sections';
import {
  LeavePage,
  Loader,
  ConfirmDeleteModal,
  ProductTableCalculation,
  TotalCalculation,
  ProductTable,
} from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Textarea } from '@/components/ui/textarea';
import { HandCoins, Upload, X, Trash2, CircleDot, Ban } from 'lucide-react';

// Zod validation schema
const detailCreditNoteSchema = z
  .object({
    invoice_number: z.string().min(1, 'Tax credit note number is required'),
    contactId: z.union([
      z.string().min(1, 'Customer name is required'),
      z.object({ value: z.any(), label: z.string() }),
    ]),
    invoiceDate: z.any().refine(val => val !== null && val !== '', {
      message: 'Tax credit note date is required',
    }),
    creditAmount: z.any().refine(val => val > 0, {
      message: 'Credit amount should be greater than 0',
    }),
    lineItemsString: z
      .array(
        z.object({
          quantity: z.any().refine(val => val > 0, {
            message: 'Quantity should be greater than 0',
          }),
        })
      )
      .optional(),
    attachmentFile: z.any().optional(),
    invoiceNumber: z.any().optional(),
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
    totalAmount: z.number().optional(),
    totalExciseAmount: z.number().optional(),
    exchangeRate: z.any().optional(),
    currencyCode: z.any().optional(),
    currencyName: z.string().optional(),
    project: z.any().optional(),
    term: z.string().optional(),
    fileName: z.string().optional(),
    remainingInvoiceAmount: z.any().optional(),
    taxTreatmentid: z.any().optional(),
  })
  .refine(
    data => {
      return true;
    },
    { message: 'Validation error' }
  );

const mapStateToProps = state => {
  return {
    project_list: state.customer_invoice.project_list,
    contact_list: state.customer_invoice.contact_list,
    currency_list: state.customer_invoice.currency_list,
    vat_list: state.customer_invoice.vat_list,
    product_list: state.customer_invoice.product_list,
    excise_list: state.customer_invoice.excise_list,
    customer_list: state.customer_invoice.customer_list,
    country_list: state.customer_invoice.country_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    creditNotesActions: bindActionCreators(CreditNotesActions, dispatch),
    creditNotesDetailActions: bindActionCreators(CreditNotesDetailActions, dispatch),
    productActions: bindActionCreators(ProductActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const DetailCreditNote = ({
  currencyConvertActions,
  creditNotesActions,
  creditNotesDetailActions,
  productActions,
  commonActions,
  project_list,
  contact_list,
  currency_list,
  vat_list,
  product_list,
  excise_list,
  customer_list,
  country_list,
  universal_currency_list,
  currency_convert_list,
  history,
  location,
}) => {
  const [language, setLanguage] = React.useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = React.useState(true);
  const [dialog, setDialog] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [disabled1, setDisabled1] = React.useState(false);
  const [discountOptions] = React.useState([
    { value: 'FIXED', label: 'Fixed' },
    { value: 'PERCENTAGE', label: 'Percentage' },
  ]);
  const [exciseTypeOption] = React.useState([
    { value: 'Inclusive', label: 'Inclusive' },
    { value: 'Exclusive', label: 'Exclusive' },
  ]);
  const [data, setData] = React.useState([]);
  const [current_customer_id, setCurrentCustomerId] = React.useState(null);
  const [contactType] = React.useState(2);
  const [openCustomerModal, setOpenCustomerModal] = React.useState(false);
  const [openProductModal, setOpenProductModal] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState('');
  const [term, setTerm] = React.useState('');
  const [placeOfSupplyId, setPlaceOfSupplyId] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [discountPercentage, setDiscountPercentage] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [fileName, setFileName] = React.useState('');
  const [basecurrency, setBasecurrency] = React.useState([]);
  const [customer_currency, setCustomerCurrency] = React.useState('');
  const [loadingMsg, setLoadingMsg] = React.useState('Loading...');
  const [showInvoiceNumber, setShowInvoiceNumber] = React.useState(false);
  const [disableLeavePage, setDisableLeavePage] = React.useState(false);
  const [invoiceSelected, setInvoiceSelected] = React.useState(false);
  const [isupdateCN, setIsupdateCN] = React.useState(true);
  const [invoiceNumber, setInvoiceNumber] = React.useState('');
  const [taxTreatmentList, setTaxTreatmentList] = React.useState([]);
  const [customer_taxTreatment, setCustomerTaxTreatment] = React.useState('');
  const [customer_taxTreatment_des, setCustomerTaxTreatmentDes] = React.useState('');
  const [customer_currency_des, setCustomerCurrencyDes] = React.useState('');
  const [customer_currency_symbol, setCustomerCurrencySymbol] = React.useState('');
  const [isRegisteredVat, setIsRegisteredVat] = React.useState(false);
  const [isDesignatedZone, setIsDesignatedZone] = React.useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = React.useState(null);
  const [taxType, setTaxType] = React.useState(false);
  const [isCreatedWithoutInvoice, setIsCreatedWithoutInvoice] = React.useState(false);
  const [isCreatedWIWP, setIsCreatedWIWP] = React.useState(false);
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = React.useState('');
  const [option, setOption] = React.useState(null);
  const [salesCategory, setSalesCategory] = React.useState([]);
  const [idCount, setIdCount] = React.useState(0);
  const [receiptDate, setReceiptDate] = React.useState('');

  const uploadFileRef = React.useRef(null);

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
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

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

  const form = useForm({
    resolver: zodResolver(detailCreditNoteSchema),
    defaultValues: {
      receiptAttachmentDescription: '',
      receiptNumber: '',
      contact_po_number: '',
      currency: '',
      currencyCode: '',
      exchangeRate: '',
      currencyName: '',
      invoiceDate: '',
      contactId: '',
      project: '',
      invoice_number: '',
      totalNet: 0,
      invoiceVATAmount: 0,
      totalAmount: 0,
      creditAmount: 0,
      notes: '',
      lineItemsString: [],
      discount: 0,
      discountPercentage: '',
      discountType: '',
      term: '',
      placeOfSupplyId: '',
      fileName: '',
      totalExciseAmount: 0,
      invoiceNumber: '',
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
  } = form;

  React.useEffect(() => {
    initializeData();
  }, []);

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

  const initializeData = () => {
    const { companyDetails } = { companyDetails: null }; // Would come from props
    if (companyDetails) {
      const { currencyCode, isRegisteredVat, isDesignatedZone, vatRegistrationDate } =
        companyDetails;
      setValue('currencyCode', currencyCode);
      setCompanyVATRegistrationDate(new Date(dayjs(vatRegistrationDate)));
      setIsDesignatedZone(isDesignatedZone);
      setIsRegisteredVat(isRegisteredVat);
      setLoading(false);
    }

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

    if (location.state && location.state.id) {
      // Get invoice number
      creditNotesActions.getInvoicesForCNById(location.state.id).then(res => {
        if (res.status === 200) {
          if (res.data.length && res.data.length != 0) {
            setInvoiceNumber(res.data[0].invoiceNumber);
            setShowInvoiceNumber(true);
          }
        }
      });

      // Get CN details
      creditNotesDetailActions
        .getCreditNoteById(
          location.state.id,
          location.state.isCNWithoutProduct ? location.state.isCNWithoutProduct : false
        )
        .then(res => {
          if (res.status === 200) {
            getCompanyCurrency();
            creditNotesActions.getVatList();
            creditNotesActions.getCustomerList(contactType).then(response => {
              if (response.status === 200) getCurrency(res.data.contactId);
            });
            creditNotesActions.getExciseList();
            creditNotesActions.getCountryList();
            creditNotesActions.getProductList();

            setTaxType(res.data.taxType ? res.data.taxType : false);
            setIsCreatedWithoutInvoice(res.data.invoiceId ? false : true);
            setCurrentCustomerId(location.state.id);

            reset({
              receiptAttachmentDescription: res.data.receiptAttachmentDescription || '',
              receiptNumber: res.data.referenceNo || '',
              contact_po_number: res.data.contactPoNumber || '',
              currency: res.data.currencyCode || '',
              currencyCode: res.data.currencyCode || '',
              exchangeRate: res.data.exchangeRate || '',
              currencyName: res.data.currencyName || '',
              invoiceDate: res.data.creditNoteDate || '',
              contactId: res.data.contactId || '',
              project: res.data.projectId || '',
              invoice_number: res.data.creditNoteNumber || '',
              totalNet: 0,
              invoiceVATAmount: res.data.totalVatAmount || 0,
              totalAmount: res.data.totalAmount || 0,
              creditAmount: res.data.totalAmount || 0,
              notes: res.data.notes || '',
              lineItemsString: res.data.invoiceLineItems || [],
              discount: res.data.discount || 0,
              discountPercentage: res.data.discountPercentage || '',
              discountType: res.data.discountType || '',
              term: res.data.term || '',
              placeOfSupplyId: res.data.placeOfSupplyId || '',
              fileName: res.data.fileName || '',
              totalExciseAmount: res.data.totalExciseTaxAmount || 0,
            });

            setIsCreatedWIWP(
              res.data.invoiceLineItems && res.data.invoiceLineItems?.length > 0 ? false : true
            );
            setInvoiceSelected(res.data.invoiceId ? true : false);
            setCustomerTaxTreatmentDes(res.data.taxTreatment || '');
            setDiscountAmount(res.data.discount || 0);
            setDiscountPercentage(res.data.discountPercentage || '');
            setData(res.data.invoiceLineItems || []);
            setSelectedContact(res.data.contactId || '');
            setTerm(res.data.term || '');
            setPlaceOfSupplyId(res.data.placeOfSupplyId || '');
            setRemainingInvoiceAmount(res.data.remainingInvoiceAmount);
            setLoading(false);

            if (res.data.invoiceLineItems && res.data.invoiceLineItems.length > 0) {
              updateAmount(res.data.invoiceLineItems);
              const idCountVal =
                res.data.invoiceLineItems.length > 0
                  ? Math.max.apply(
                      Math,
                      res.data.invoiceLineItems.map(item => item.id)
                    )
                  : 0;
              setIdCount(idCountVal);
            } else {
              setIdCount(0);
            }

            if (res.data.invoiceId) {
              creditNotesDetailActions
                .getCreditNoteById(location.state.id, false)
                .then(response => {
                  const customerdetails = {
                    label:
                      response.data.contactName === ''
                        ? response.data.organisationName
                        : response.data.contactName,
                    value: response.data.contactId,
                  };

                  setIsupdateCN(false);
                  setOption({
                    label:
                      response.data.contactName === ''
                        ? response.data.organisationName
                        : response.data.contactName,
                    value: response.data.contactId,
                  });
                  setData(response.data.invoiceLineItems);
                  setCustomerCurrency(response.data.currencyCode);
                  setRemainingInvoiceAmount(response.data.remainingInvoiceAmount);

                  if (response.data.invoiceLineItems && response.data.invoiceLineItems.length > 1) {
                    setValue('lineItemsString', response.data.invoiceLineItems, {
                      shouldValidate: true,
                    });
                    updateAmount(response.data.invoiceLineItems);
                  }

                  setValue('currency', getCurrency(customerdetails.value), {
                    shouldValidate: true,
                  });
                  setValue('taxTreatmentid', getTaxTreatment(customerdetails.value), {
                    shouldValidate: true,
                  });
                  setExchange(getCurrency(customerdetails.value));
                  setValue('contactId', option, { shouldValidate: true });
                  setValue('remainingInvoiceAmount', remainingInvoiceAmount, {
                    shouldValidate: true,
                  });
                  setValue('currencyCode', customer_currency, { shouldValidate: true });
                  getTaxTreatment(option?.value);
                  setValue(
                    'invoiceNumber',
                    {
                      value: res.data.invoiceId,
                      label: res.data.invoiceNumber,
                    },
                    { shouldValidate: true }
                  );
                });
            }
          }
        });
    } else {
      history.push('/admin/income/credit-notes');
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
    setValue('exchangeRate', result && result.length > 0 ? result[0].exchangeRate : '', {
      shouldValidate: true,
    });
  };

  const getCurrency = opt => {
    let customer_currencyCode = 0;
    customer_list.map(item => {
      if (item.label.contactId == opt) {
        setCustomerCurrency(item.label.currency.currencyCode);
        setCustomerCurrencyDes(item.label.currency.currencyName);
        setCustomerCurrencySymbol(item.label.currency.currencyIsoCode);
        customer_currencyCode = item.label.currency.currencyCode;
      }
    });
    return customer_currencyCode;
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

  const getInvoiceDetails = value => {
    if (value) {
      creditNotesActions.getInvoiceById(value).then(response => {
        if (response.status === 200) {
          const customerdetails = {
            label:
              response.data.organisationName === ''
                ? response.data.name
                : response.data.organisationName,
            value: response.data.contactId,
          };

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
          setValue('currency', getCurrency(customerdetails.value), { shouldValidate: true });
          setValue('taxTreatmentid', getTaxTreatment(customerdetails.value), {
            shouldValidate: true,
          });
          setValue('placeOfSupplyId', placeOfSupplyId, { shouldValidate: true });
          setExchange(getCurrency(customerdetails.value));
          setValue('contactId', response.data.contactId, { shouldValidate: true });
          setValue('remainingInvoiceAmount', remainingInvoiceAmount, { shouldValidate: true });
          setValue('currencyCode', customer_currency, { shouldValidate: true });
          getCurrency(option?.value);
          getTaxTreatment(option?.value);

          updateAmount(response.data.invoiceLineItems);
        }
      });
    }
  };

  const updateAmount = dataToUpdate => {
    const list = ProductTableCalculation.updateAmount(
      dataToUpdate ? dataToUpdate : [],
      vat_list,
      taxType
    );

    setData(list.data);
    setValue('totalNet', list.totalNet ? list.totalNet : 0);
    setValue('invoiceVATAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('totalExciseAmount', list.totalExciseAmount ? list.totalExciseAmount : 0);
    setValue('discount', list.discount ? list.discount : 0);
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
      invoiceDate,
      contactId,
      invoice_number,
      notes,
      creditAmount,
      email,
      exchangeRate,
      lineItemsString,
      invoiceNumber,
      placeOfSupplyId,
    } = data;

    let formData = new FormData();
    formData.append('email', email ? email : '');
    formData.append('type', 7);
    formData.append('creditNoteId', current_customer_id);
    formData.append('creditNoteNumber', invoice_number !== null ? invoice_number : '');
    formData.append('creditNoteDate', invoiceDate ? dayjs(invoiceDate) : new Date());
    formData.append('vatCategoryId', 2);
    formData.append('exchangeRate', exchangeRate);
    formData.append('referenceNo', receiptNumber !== null ? receiptNumber : '');
    formData.append('contactPoNumber', contact_po_number !== null ? contact_po_number : '');
    formData.append(
      'receiptAttachmentDescription',
      receiptAttachmentDescription !== null ? receiptAttachmentDescription : ''
    );
    formData.append('notes', notes !== null ? notes : '');
    formData.append('isCreatedWithoutInvoice', isCreatedWithoutInvoice);
    formData.append('isCreatedWIWP', isCreatedWIWP);
    formData.append('taxType', taxType ? taxType : false);

    if (invoiceNumber) {
      formData.append('invoiceId', invoiceNumber.value ? invoiceNumber.value : invoiceNumber);
      formData.append('cnCreatedOnPaidInvoice', '1');
    }
    if (isCreatedWIWP == true) formData.append('totalAmount', creditAmount);
    else {
      const values = getValues();
      formData.append('lineItemsString', JSON.stringify(data));
      formData.append('totalVatAmount', values.invoiceVATAmount);
      formData.append('totalAmount', values.totalAmount);
      formData.append('totalExciseAmount', values.totalExciseAmount);
      formData.append('discount', values.discount);
      formData.append('totalExciseTaxAmount', values.totalExciseAmount);
    }
    if (contactId) {
      formData.append(
        'contactId',
        contactId ? (contactId.value ? contactId.value : contactId) : ''
      );
    }
    if (placeOfSupplyId) {
      formData.append(
        'placeOfSupplyId',
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }
    if (currency) {
      formData.append('currencyCode', currency.value ? currency.value : currency);
    }

    setLoading(true);
    setLoadingMsg('Updating Credit Note...');
    creditNotesDetailActions
      .UpdateCreditNotes(formData)
      .then(res => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Credit Note Updated Successfully'
        );
        history.push('/admin/income/credit-notes');
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setDisabled(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert('error', 'Credit Note Updated Unsuccessfully');
        initializeData();
      });
  };

  const handleOpenCustomerModal = e => {
    e.preventDefault();
    setOpenCustomerModal(true);
  };

  const openProductModalFunc = () => {
    setOpenProductModal(true);
  };

  const getCurrentUser = data => {
    let option;
    if (data.label || data.value) {
      option = data;
    } else {
      option = {
        label: `${data.fullName}`,
        value: data.id,
      };
    }
    setValue('contactId', option.value, { shouldValidate: true });
  };

  const closeCustomerModal = res => {
    if (res) {
      creditNotesActions.getCustomerList(contactType);
    }
    setOpenCustomerModal(false);
  };

  const closeProductModal = res => {
    setOpenProductModal(false);
  };

  const getCurrentProduct = () => {
    creditNotesActions.getProductList().then(res => {
      const newData = [
        {
          id: 0,
          description: res.data[0].description,
          quantity: 1,
          unitPrice: res.data[0].unitPrice,
          vatCategoryId: res.data[0].vatCategoryId,
          discountType: res.data[0].discountType,
          subTotal: res.data[0].unitPrice,
          productId: res.data[0].id,
          unitType: res.data[0].unitType,
          unitTypeId: res.data[0].unitTypeId,
        },
      ];
      setData(newData);
      updateAmount(newData);
      setValue('lineItemsString', newData, { shouldValidate: true });
    });
  };

  const deleteInvoice = () => {
    const message1 = (
      <text>
        <b>Delete Tax Credit Note?</b>
      </text>
    );
    const message = 'This Tax Credit Note  will be deleted permanently and cannot be recovered. ';
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
    setDisableLeavePage(true);
    creditNotesDetailActions
      .deleteCN(current_customer_id)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Tax Credit Note Deleted Successfully');
          history.push('/admin/income/credit-notes');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', 'Tax Credit Note Deleted Unsuccessfully');
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const showInvoiceNumberField = () => {
    return (
      showInvoiceNumber && (
        <Col lg={3}>
          <FormGroup className="mb-3">
            <Label htmlFor="project">
              <span className="text-danger">* </span>
              {strings.InvoiceNumber}
            </Label>
            <Controller
              name="invoiceNumber"
              control={control}
              render={({ field }) => (
                <Input
                  disabled
                  id="invoiceNumber"
                  value={field.value?.label ? field.value?.label : field.value}
                />
              )}
            />
          </FormGroup>
        </Col>
      )
    );
  };

  strings.setLanguage(language);

  let tmpCustomer_list = [];
  customer_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpCustomer_list.push(obj);
  });

  return loading == true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
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
                        <HandCoins className="h-4 w-4" />
                        <span className="ml-2">{strings.UpdateCreditNote}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  {loading ? (
                    <Loader />
                  ) : (
                    <Row>
                      <Col lg={12}>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                          <Row>{showInvoiceNumberField()}</Row>
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="invoice_number">
                                  <span className="text-danger">* </span>
                                  {strings.CreditNoteNumber}
                                </Label>
                                <Controller
                                  name="invoice_number"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="text"
                                      id="invoice_number"
                                      placeholder=""
                                      disabled
                                      className={
                                        errors.invoice_number && touchedFields.invoice_number
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.invoice_number && touchedFields.invoice_number && (
                                  <div className="invalid-feedback">
                                    {errors.invoice_number.message}
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
                                      styles={selectStyles}
                                      id="contactId"
                                      isDisabled={showInvoiceNumber}
                                      options={
                                        tmpCustomer_list
                                          ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              tmpCustomer_list,
                                              'Customer'
                                            )
                                          : []
                                      }
                                      value={
                                        field.value?.value
                                          ? field.value
                                          : tmpCustomer_list &&
                                            tmpCustomer_list.find(
                                              option => option.value === +field.value
                                            )
                                      }
                                      onChange={option => {
                                        field.onChange(option);
                                        if (option && option.value) {
                                          setValue('currency', getCurrency(option.value), {
                                            shouldValidate: true,
                                          });
                                          setValue(
                                            'taxTreatmentid',
                                            getTaxTreatment(option.value),
                                            { shouldValidate: true }
                                          );
                                          setExchange(getCurrency(option.value));
                                        }
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
                                              .find(
                                                option =>
                                                  option.value == placeOfSupplyId?.toString()
                                              )
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
                                <Label htmlFor="invoiceDate">
                                  <span className="text-danger">* </span>
                                  {strings.CreditNoteDate}
                                </Label>
                                <Controller
                                  name="invoiceDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      {...field}
                                      id="invoiceDate"
                                      placeholderText={strings.Select + strings.CreditNoteDate}
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      minDate={new Date()}
                                      dropdownMode="select"
                                      value={dayjs(field.value).format('DD-MM-YYYY')}
                                      onChange={value => {
                                        field.onChange(value);
                                      }}
                                      className={`form-control ${
                                        errors.invoiceDate && touchedFields.invoiceDate
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                    />
                                  )}
                                />
                                {errors.invoiceDate && touchedFields.invoiceDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.invoiceDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>

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
                                      isDisabled={true}
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
                                      id="currencyCode"
                                      value={
                                        currency_convert_list &&
                                        selectCurrencyFactory
                                          .renderOptions(
                                            'currencyName',
                                            'currencyCode',
                                            currency_convert_list,
                                            'Currency'
                                          )
                                          .find(option => option.value === +field.value)
                                      }
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>

                            {invoiceSelected && (
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
                                  {errors.remainingInvoiceAmount && (
                                    <div className="text-danger">
                                      {errors.remainingInvoiceAmount.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            )}

                            {isCreatedWIWP && (
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
                          {!isCreatedWIWP && getValues().lineItemsString?.length > 0 && (
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
                                {errors.lineItemsString &&
                                  typeof errors.lineItemsString === 'string' && (
                                    <div className={errors.lineItemsString ? 'is-invalid' : ''}>
                                      <div className="invalid-feedback">
                                        {errors.lineItemsString}
                                      </div>
                                    </div>
                                  )}
                                <Col lg={12}>
                                  <ProductTable
                                    data={data}
                                    initValue={getValues()}
                                    isRegisteredVat={isRegisteredVat}
                                    universal_currency_list={universal_currency_list}
                                    setData={newData => {
                                      setData(newData);
                                      setValue('lineItemsString', newData, {
                                        shouldValidate: true,
                                      });
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
                          {invoiceNumber ? (
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
                                        <Upload className="h-4 w-4" /> {strings.upload}
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
<X
                                          className="h-4 w-4 cursor-pointer"
                                          onClick={() => setFileName('')}
                                          />{' '}
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
                                  onClick={() => {
                                    if (errors && Object.keys(errors).length != 0)
                                      commonActions.fillManDatoryDetails();
                                  }}
                                >
                                  <CircleDot className="h-4 w-4" />{' '}
                                  {disabled ? 'Updating...' : strings.Update}
                                </Button>
                                <Button
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    if (location?.state?.renderURL) {
                                      history.push(`${location?.state?.renderURL}`, {
                                        id: location?.state?.renderID,
                                        isCNWithoutProduct: location.state.isCNWithoutProduct,
                                      });
                                    } else history.push('/admin/income/credit-notes');
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
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        <CustomerModal
          openCustomerModal={openCustomerModal}
          closeCustomerModal={e => {
            closeCustomerModal(e);
          }}
          getCurrentUser={e => getCurrentUser(e)}
          createCustomer={creditNotesActions.createCustomer}
          currency_list={currency_list}
          country_list={country_list}
          getStateList={creditNotesActions.getStateList}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={e => {
            closeProductModal(e);
          }}
          getCurrentProduct={e => getCurrentProduct(e)}
          createProduct={productActions.createAndSaveProduct}
          vat_list={vat_list}
          product_category_list={product_list}
          salesCategory={salesCategory}
          purchaseCategory={[]}
        />
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailCreditNote);
