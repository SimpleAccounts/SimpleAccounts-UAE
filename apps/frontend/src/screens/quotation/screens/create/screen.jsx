import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
import * as QuotationCreateAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import * as ProductActions from '../../../product/actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';
import { CustomerModal, ProductModal } from '../../../customer_invoice/sections';
import {
  LeavePage,
  Loader,
  ProductTableCalculation,
  ProductTable,
  TotalCalculation,
  InvoiceAdditionaNotesInformation,
} from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { renderList, selectOptionsFactory, DropdownLists, Lists, selectStyles } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { FileText, Plus, CircleDot, RefreshCw, Ban } from 'lucide-react';

const mapStateToProps = state => {
  const contact_list = state.quotation.contact_list;
  const currencyList = state.common.currency_convert_list;
  return {
    contact_list,
    currency_list: state.quotation.currency_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    vat_list: state.quotation.vat_list,
    product_list: state.quotation.product_list,
    supplier_list: state.quotation.supplier_list,
    excise_list: state.quotation.excise_list,
    country_list: state.quotation.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
    companyDetails: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    requestForQuotationAction: bindActionCreators(RequestForQuotationAction, dispatch),
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    quotationCreateAction: bindActionCreators(QuotationCreateAction, dispatch),
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
const createQuotationSchema = z
  .object({
    quotation_Number: z.string().min(1, 'Quotation number is required'),
    customerId: z.union([
      z.string().min(1, 'Customer name is required'),
      z.object({ value: z.union([z.string(), z.number()]), label: z.string() }),
    ]),
    quotationdate: z.union([z.string(), z.date()]).refine(val => val !== '', {
      message: 'Quotation date is required',
    }),
    quotaionExpiration: z.union([z.string(), z.date()]).refine(val => val !== '', {
      message: 'Expiry date is required',
    }),
    currencyCode: z.union([
      z.string().min(1, 'Currency is required'),
      z.object({ value: z.string(), label: z.string() }),
    ]),
    placeOfSupplyId: z
      .union([z.string(), z.object({ value: z.string(), label: z.string() })])
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
      .min(1, 'At least one quotation line item is required'),
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
    total_net: z.number().optional(),
    totalVatAmount: z.number().optional(),
    totalAmount: z.number().optional(),
    total_excise: z.number().optional(),
    currencyName: z.string().optional(),
  })
  .refine(
    formData => {
      // Validate expiration date is after quotation date
      if (formData.quotationdate && formData.quotaionExpiration) {
        const quotDate =
          typeof formData.quotationdate === 'string'
            ? dayjs(formData.quotationdate, 'DD-MM-YYYY')
            : dayjs(formData.quotationdate);
        const expDate =
          typeof formData.quotaionExpiration === 'string'
            ? dayjs(formData.quotaionExpiration, 'DD-MM-YYYY')
            : dayjs(formData.quotaionExpiration);

        return expDate.isAfter(quotDate) || expDate.isSame(quotDate);
      }
      return true;
    },
    {
      message: 'Expiry date should be on or after quotation date',
      path: ['quotaionExpiration'],
    }
  );

const regExInvNum = /[a-zA-Z0-9,-/ ]+$/;
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

const CreateQuotation = ({
  requestForQuotationAction,
  quotationCreateAction,
  ProductActions,
  commonActions,
  currency_list_dropdown,
  vat_list,
  product_list,
  customer_list_dropdown,
  excise_list,
  country_list,
  product_category_list,
  universal_currency_list,
  currency_convert_list,
  companyDetails,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [discountOptions] = useState([
    { value: 'FIXED', label: 'FIXED' },
    { value: 'PERCENTAGE', label: '%' },
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
      unitTypeId: '',
    },
  ]);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [contactType] = useState(2);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [fileName, setFileName] = useState('');
  const [exist, setExist] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [income] = useState(true);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [date, setDate] = useState('');
  const [contactId, setContactId] = useState('');
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [quotationBeforeVatRegistration, setQuotationBeforeVatRegistration] = useState(false);
  const [producttype, setProducttype] = useState([]);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [taxTreatmentId, setTaxTreatmentId] = useState('');
  const [prefixData, setPrefixData] = useState(null);
  const [placeOfSupplyId, setPlaceOfSupplyId] = useState('');
  const [parentId, setParentId] = useState(null);
  const [enablePlaceOfSupply, setEnablePlaceOfSupply] = useState(false);

  const uploadFile = useRef(null);

  const form = useForm({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      receiptAttachmentDescription: '',
      receiptNumber: '',
      contact_po_number: '',
      currencyCode: '',
      quotaionExpiration: new Date(),
      quotationdate: new Date(),
      customerId: '',
      placeOfSupplyId: '',
      exchangeRate: 1,
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
      quotation_Number: '',
      total_net: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      notes: '',
      footNote: '',
      discount: 0,
      discountPercentage: '',
      discountType: 'FIXED',
      total_excise: 0,
      currencyName: '',
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
    trigger,
  } = form;
  const watchQuotationNumber = watch('quotation_Number');

  useEffect(() => {
    if (watchQuotationNumber) {
      validationCheck(watchQuotationNumber);
    }
  }, [watchQuotationNumber]);

  const validationCheck = useCallback(
    value => {
      const validationData = {
        moduleType: 12,
        name: value,
      };
      quotationCreateAction.checkValidation(validationData).then(response => {
        if (response.data === 'Quotation Number Already Exists') {
          setExist(true);
          setError('quotation_Number', {
            type: 'manual',
            message: 'Quotation number already exists',
          });
        } else {
          setExist(false);
          clearErrors('quotation_Number');
        }
      });
    },
    [quotationCreateAction, setError, clearErrors]
  );

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

  const getParentQuotationDetails = parentIdParam => {
    quotationCreateAction.getQuotationById(parentIdParam).then(res => {
      if (res.status === 200) {
        const quotationData = renderList.mapQuotationList(res.data);
        populateData(quotationData);
      }
    });
  };

  const populateData = quotationData => {
    delete quotationData.initValue.quotationNumber;

    Object.entries(quotationData.initValue).forEach(([name, value]) => {
      setValue(name, value, { shouldValidate: true });
    });

    const populatedData = quotationData.state.data || data;
    setData(populatedData);
    setIdCount(quotationData.state.idCount || 0);
    setLoading(false);
    getVatListForProducts(renderList.addRow(populatedData, quotationData.state.idCount));
  };

  const getDefaultNotes = () => {
    commonActions.getNoteSettingsInfo().then(res => {
      if (res.status === 200) {
        setValue('notes', res.data.defaultTermsAndConditions, { shouldValidate: true });
        setValue('footNote', res.data.defaultFootNotes, { shouldValidate: true });
      }
    });
  };

  const getInitialData = async () => {
    getQuotationNo();
    await requestForQuotationAction.getSupplierList(contactType);
    await requestForQuotationAction.getCountryList();
    await requestForQuotationAction.getExciseList();
    await requestForQuotationAction.getProductList();
    await ProductActions.getProductCategoryList();
    await requestForQuotationAction.getPoPrefix().then(response => {
      setPrefixData(response.data);
    });
    await requestForQuotationAction.getVatList();
    await requestForQuotationAction
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

    if (location.state && location.state.parentId) {
      setParentId(location.state.parentId);
      getParentQuotationDetails(location.state.parentId);
    }

    getDefaultNotes();
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const getContactShippingAddress = (customerID, taxID) => {
    const { placeList } = Lists;
    if (enablePlaceOfSupply) {
      quotationCreateAction.getCustomerShippingAddressbyID(customerID).then(res => {
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
        if (isRegisteredVat && !quotationBeforeVatRegistration) {
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
    setValue('total_net', list.totalNet ? list.totalNet : 0);
    setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('discount', list.discount ? list.discount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('total_excise', list.totalExciseAmount ? list.totalExciseAmount : 0);
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

  const onSubmit = async formData => {
    if (exist) {
      return;
    }

    // Trigger validation
    const isValid = await trigger();
    if (!isValid) {
      commonActions.fillManDatoryDetails();
      return;
    }

    setDisabled(true);
    const postFormData = new FormData();
    postFormData.append('taxType', taxType);
    postFormData.append('parentId', parentId ?? '');
    postFormData.append(
      'quotationNumber',
      formData.quotation_Number !== null ? prefix + formData.quotation_Number : ''
    );
    postFormData.append(
      'quotaionExpiration',
      formData.quotaionExpiration ? formData.quotaionExpiration : null
    );
    postFormData.append('quotationdate', formData.quotationdate ? formData.quotationdate : null);
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
    postFormData.append('notes', formData.notes !== null ? formData.notes : '');
    postFormData.append('footNote', formData.footNote ? formData.footNote : '');
    postFormData.append('type', 2);

    const local = data.map(({ taxtreatment, vat_list: vatListItem, ...rest }) => rest);
    postFormData.append('lineItemsString', JSON.stringify(local));
    postFormData.append('totalVatAmount', watch('totalVatAmount'));
    postFormData.append('totalAmount', watch('totalAmount'));
    postFormData.append('totalExciseAmount', watch('total_excise'));
    postFormData.append('discount', watch('discount'));
    postFormData.append(
      'customerId',
      formData.customerId ? (formData.customerId.value ?? formData.customerId) : ''
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
    setLoadingMsg('Creating Quotation...');

    quotationCreateAction
      .createQuotation(postFormData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? strings.QuotationCreatedSuccessfully : res.data.message
        );

        if (createMore) {
          setCreateMore(false);
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
            total_net: 0,
            totalVatAmount: 0,
            totalAmount: 0,
            discountType: 'FIXED',
            discount: 0,
            discountPercentage: '',
            total_excise: 0,
            customerId: '',
            placeOfSupplyId: '',
            currencyCode: null,
            taxTreatmentId: '',
          });

          setContactId('');
          setPlaceOfSupplyId('');
          getQuotationNo();
          setValue('lineItemsString', data, { shouldValidate: false });
        } else {
          history.push('/admin/income/quotation');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Quotation Created Unsuccessfully!'
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
    if (!isRegisteredVat || quotationBeforeVatRegistration) {
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

  const getQuotationNo = () => {
    quotationCreateAction.getQuotationNo().then(res => {
      if (res.status === 200) {
        setValue('quotation_Number', res.data, { shouldValidate: true });
        validationCheck(res.data);
      }
    });
  };

  const setContactDetails = customerID => {
    setValue('customerId', customerID, { shouldValidate: true });
    const customer = customer_list_dropdown.find(obj => obj.value === customerID);
    if (customer) {
      const currencyCode = customer.label.currency.currencyCode;
      const taxTreatment = customer.label.taxTreatment.taxTreatment;
      setContactId(customerID);
      setTaxTreatmentId(taxTreatment);
      setEnablePlaceOfSupply(
        !!(
          taxTreatment !== 'GCC VAT REGISTERED' &&
          taxTreatment !== 'GCC NON-VAT REGISTERED' &&
          taxTreatment !== 'NON GCC'
        )
      );
      setValue('taxTreatmentId', taxTreatment, { shouldValidate: true });
      setCurrency(currencyCode);
      getContactShippingAddress(customerID, taxTreatment);
    } else {
      setValue('taxTreatmentId', '', { shouldValidate: true });
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  const { placeList } = Lists;

  return (
    <div>
      <div className="create-quotation-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <FileText className="h-4 w-4" />
                        <span className="ml-2">{strings.CreateQuotation}</span>
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
                              <Label htmlFor="quotation_Number">
                                <span className="text-danger">* </span>
                                {strings.QuotationNumber}
                              </Label>
                              <Controller
                                name="quotation_Number"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    maxLength="50"
                                    id="quotation_Number"
                                    placeholder={strings.Enter + strings.QuotationNumber}
                                    onChange={option => {
                                      if (
                                        option.target.value === '' ||
                                        regExInvNum.test(option.target.value)
                                      ) {
                                        field.onChange(option);
                                      }
                                    }}
                                    className={errors.quotation_Number ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.quotation_Number && (
                                <div className="invalid-feedback">
                                  {errors.quotation_Number.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="customerId">
                                <span className="text-danger">* </span>
                                {strings.CustomerName}
                              </Label>
                              <Controller
                                name="customerId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    id="customerId"
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
                                      field.onChange(option);
                                      setContactDetails(option.value);
                                    }}
                                    styles={selectStyles}
                                    className={errors.customerId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.customerId && (
                                <div className="invalid-feedback d-block">
                                  {errors.customerId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          {!parentId && (
                            <Col lg={3}>
                              <Label htmlFor="customerId" style={{ display: 'block' }}>
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
                                    />
                                  )}
                                />
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
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="quotationdate">
                                <span className="text-danger">* </span>
                                {strings.QuotationDate}
                              </Label>
                              <Controller
                                name="quotationdate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    selected={
                                      field.value
                                        ? typeof field.value === 'string'
                                          ? dayjs(field.value, 'DD-MM-YYYY').toDate()
                                          : field.value
                                        : null
                                    }
                                    onChange={date => {
                                      field.onChange(date);
                                      if (dayjs(date).isBefore(dayjs(companyVATRegistrationDate))) {
                                        setQuotationBeforeVatRegistration(true);
                                        resetProductTableValues();
                                      } else {
                                        setQuotationBeforeVatRegistration(false);
                                        resetProductTableValues();
                                      }
                                    }}
                                    dateFormat="dd-MM-yyyy"
                                    className={`form-control ${errors.quotationdate ? 'is-invalid' : ''}`}
                                    placeholderText={strings.Select + strings.QuotationDate}
                                  />
                                )}
                              />
                              {errors.quotationdate && (
                                <div className="invalid-feedback d-block">
                                  {errors.quotationdate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="quotaionExpiration">
                                <span className="text-danger">* </span>
                                {strings.ExpiryDate}
                              </Label>
                              <Controller
                                name="quotaionExpiration"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    selected={
                                      field.value
                                        ? typeof field.value === 'string'
                                          ? dayjs(field.value, 'DD-MM-YYYY').toDate()
                                          : field.value
                                        : null
                                    }
                                    onChange={field.onChange}
                                    dateFormat="dd-MM-yyyy"
                                    minDate={watch('quotationdate')}
                                    className={`form-control ${errors.quotaionExpiration ? 'is-invalid' : ''}`}
                                    placeholderText={strings.Select + strings.ExpiryDate}
                                  />
                                )}
                              />
                              {errors.quotaionExpiration && (
                                <div className="invalid-feedback d-block">
                                  {errors.quotaionExpiration.message}
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
                                    placeholder={strings.Select + strings.Currency}
                                    options={currency_list_dropdown}
                                    value={
                                      field.value?.value
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
                        <Row className="mb-3">
                          <Col lg={8} className="mb-3">
                            {!parentId && (
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
                              checked={taxType}
                              onCheckedChange={newTaxType => {
                                setTaxType(newTaxType);
                                updateAmount(data);
                              }}
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
                              disableVat={quotationBeforeVatRegistration || !isRegisteredVat}
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
                              notesPlaceholder={strings.TermsAndConditions}
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
                                    setValue('lineItemsString', newData, { shouldValidate: true });
                                    updateAmount(newData);
                                  }
                                  setCreateMore(false);
                                }}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              {!parentId && (
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
                                    history.push('/admin/income/quotation');
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
            requestForQuotationAction.getSupplierList(contactType);
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
            requestForQuotationAction.getProductList().then(res => {
              if (res.status === 200) getCurrentProduct(res.data[0]);
            });
          }}
          income={income}
          createProduct={ProductActions.createAndSaveProduct}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateQuotation);
