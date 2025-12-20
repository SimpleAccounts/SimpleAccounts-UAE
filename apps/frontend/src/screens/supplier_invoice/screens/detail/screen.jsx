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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as SupplierInvoiceDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as SupplierInvoiceActions from '../../actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { CustomerModal, ProductModal } from 'screens/customer_invoice/sections'; // Use shared modals
import {
  LeavePage,
  Loader,
  ConfirmDeleteModal,
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
  optionFactory,
  selectCurrencyFactory,
  selectOptionsFactory,
  InputValidation,
  DropdownLists,
  Lists,
  selectStyles,
} from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import Switch from 'react-switch';

const mapStateToProps = state => {
  return {
    project_list: state.supplier_invoice.project_list,
    contact_list: state.supplier_invoice.contact_list,
    currency_list: state.supplier_invoice.currency_list,
    excise_list: state.supplier_invoice.excise_list,
    product_list: state.supplier_invoice.product_list,
    supplier_list: state.supplier_invoice.contact_list,
    country_list: state.supplier_invoice.country_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    product_category_list: state.product.product_category_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
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
const detailSupplierInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  contactId: z.union([z.string().min(1, 'Supplier name is required'), z.number()]),
  term: z.string().min(1, 'Terms is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  invoiceDueDate: z.string().min(1, 'Invoice due date is required'),
  currencyCode: z.string().min(1, 'Currency is required'),
  // placeOfSupplyId: z.union([
  //   z.string(),
  //   z.object({ value: z.string(), label: z.string() })
  // ]).optional(),
  // changeShippingAddress: z.boolean().optional(),
  // shippingAddress: z.object({
  //   address: z.string().optional(),
  //   city: z.string().optional(),
  //   countryId: z.string().optional(),
  //   stateId: z.string().optional(),
  //   postZipCode: z.string().optional(),
  //   telephone: z.string().optional(),
  //   fax: z.string().optional(),
  // }).optional(),
  lineItemsString: z
    .array(
      z.object({
        quantity: z
          .union([z.string(), z.number()])
          .refine(value => parseFloat(value) > 0, { message: 'Quantity must be greater than 0' }),
        unitPrice: z
          .union([z.string(), z.number()])
          .refine(value => parseFloat(value) > 0, { message: 'Unit price must be greater than 0' }),
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
});

const regExInvNum = /[a-zA-Z0-9-/]+$/;

const DetailSupplierInvoice = ({
  currencyConvertActions,
  supplierInvoiceActions,
  supplierInvoiceDetailActions,
  productActions,
  commonActions,
  project_list,
  contact_list,
  currency_list,
  excise_list,
  product_list,
  supplier_list,
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
  const [data, setData] = useState([]);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const [contactType] = useState(1); // Supplier
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [term, setTerm] = useState('');
  // const [placeOfSupplyId, setPlaceOfSupplyId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [basecurrency, setBasecurrency] = useState([]);
  const [income] = useState(false); // Expense
  const [supplierCurrency, setSupplierCurrency] = useState('');
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [invoiceDateForVatValidation, setInvoiceDateForVatValidation] = useState(new Date());
  const [producttype, setProducttype] = useState([]);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [datesChanged, setDatesChanged] = useState(false);
  const [supplierCurrencySymbol, setSupplierCurrencySymbol] = useState('');
  const [idCount, setIdCount] = useState(0);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [supplierTaxTreatmentDes, setSupplierTaxTreatmentDes] = useState('');
  const [invoiceDateNoChange, setInvoiceDateNoChange] = useState(null);
  const [taxType, setTaxType] = useState(false);
  const [invoiceDueDateNoChange, setInvoiceDueDateNoChange] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [vatList, setVatList] = useState([]);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [supplierCurrencyDes, setSupplierCurrencyDes] = useState('');
  const [supplierCurrencyCode, setSupplierCurrencyCode] = useState('');
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [salesCategory, setSalesCategory] = useState([]);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [enablePlaceOfSupply, setEnablePlaceOfSupply] = useState(false); // Probably not needed for Supplier Invoice as much

  const uploadFile = useRef(null);
  const { termList, placeList } = Lists;

  const form = useForm({
    resolver: zodResolver(detailSupplierInvoiceSchema),
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
      // changeShippingAddress: false,
      // shippingAddress: Lists.Address,
      lineItemsString: [],
      discount: 0,
      term: '',
      // placeOfSupplyId: '',
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
      supplierInvoiceDetailActions.getInvoiceById(location.state.id).then(res => {
        if (res.status === 200) {
          getCompanyCurrency();
          supplierInvoiceActions.getSupplierList(contactType);
          supplierInvoiceActions.getExciseList();
          supplierInvoiceActions.getCountryList();
          productActions.getProductCategoryList();

          setCurrentSupplierId(location.state.id);
          setDiscountEnabled(res.data.discount > 0);
          setSupplierTaxTreatmentDes(res.data.taxTreatment ? res.data.taxTreatment : '');
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
          // setPlaceOfSupplyId(res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '');
          setSupplierCurrency(res.data.currencyCode ? res.data.currencyCode : '');
          setSupplierCurrencyDes(res.data.currencyName ? res.data.currencyName : '');
          setSupplierCurrencySymbol(res.data.currencyIsoCode ? res.data.currencyIsoCode : '');
          setSupplierCurrencyCode(res.data.currencyCode ? res.data.currencyCode : '');

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
            contactId: res.data.contactId || '',
            project: res.data.projectId || '',
            invoice_number: res.data.invoiceNumber || '',
            total_net: 0,
            invoiceVATAmount: res.data.totalVatAmount || 0,
            totalAmount: res.data.totalAmount || 0,
            notes: res.data.notes || '',
            // changeShippingAddress: res.data.changeShippingAddress || false,
            lineItemsString: res.data.invoiceLineItems || [],
            discount: res.data.discount || 0,
            term: res.data.term || '',
            // placeOfSupplyId: res.data.placeOfSupplyId || '',
            fileName: res.data.fileName || '',
            filePath: res.data.filePath || '',
            total_excise: res.data.totalExciseAmount || 0,
            taxType: res.data.taxType ? true : false,
            footNote: res.data.footNote || '',
          });

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
      history.push('/admin/expense/supplier-invoice');
    }
  }, [location.state, supplierInvoiceDetailActions, history]);

  useEffect(() => {
    supplierInvoiceActions.getProductList();
    supplierInvoiceActions
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

    supplierInvoiceActions.getVatList().then(res => {
      if (res.status == 200) setVatList(res.data);
    });

    initializeData();
    getCompanyType();
  }, []);

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

  const getCompanyType = () => {
    supplierInvoiceDetailActions
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
    if (supplierTaxTreatmentDes) {
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
                supplierTaxTreatmentDes === 'UAE VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'UAE VAT REGISTERED FREEZONE' ||
                supplierTaxTreatmentDes === 'UAE NON-VAT REGISTERED FREEZONE' ||
                supplierTaxTreatmentDes === 'GCC VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'GCC NON-VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'NON GCC'
              ) {
                vatList.map(element => {
                  if (element.name == 'OUT OF SCOPE') {
                    vt.push(element);
                  }
                });
              }
              if (supplierTaxTreatmentDes === 'UAE NON-VAT REGISTERED') {
                vt = vatList;
              }
            } else if (product.productType === 'SERVICE') {
              if (
                supplierTaxTreatmentDes === 'UAE VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'UAE NON-VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'UAE VAT REGISTERED FREEZONE' ||
                supplierTaxTreatmentDes === 'UAE NON-VAT REGISTERED FREEZONE'
              ) {
                vt = vatList;
              }
              if (
                supplierTaxTreatmentDes === 'GCC VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'GCC NON-VAT REGISTERED' ||
                supplierTaxTreatmentDes === 'NON GCC'
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
              supplierTaxTreatmentDes === 'UAE VAT REGISTERED' ||
              supplierTaxTreatmentDes === 'UAE NON-VAT REGISTERED' ||
              supplierTaxTreatmentDes === 'UAE VAT REGISTERED FREEZONE' ||
              supplierTaxTreatmentDes === 'UAE NON-VAT REGISTERED FREEZONE'
            ) {
              vt = vatList;
            }
            if (
              supplierTaxTreatmentDes === 'GCC VAT REGISTERED' ||
              supplierTaxTreatmentDes === 'GCC NON-VAT REGISTERED' ||
              supplierTaxTreatmentDes === 'NON GCC'
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

      // Logic similar to create/customer invoice
      if (taxType === false) {
        // Exclusive
        if (obj.discountType === 'PERCENTAGE') {
          net_value = (+unitprice - +(unitprice * obj.discount) / 100) * obj.quantity;
          var discount = unitprice * obj.quantity - net_value;
          obj.exciseAmount = 0; // Simplified
          var vat_amount = vat === 0 ? 0 : (+net_value * vat) / 100;
        } else {
          net_value = unitprice * obj.quantity - obj.discount;
          var discount = unitprice * obj.quantity - net_value;
          obj.exciseAmount = 0; // Simplified
          var vat_amount = vat === 0 ? 0 : (+net_value * vat) / 100;
        }
      } else {
        // Inclusive
        if (obj.discountType === 'PERCENTAGE') {
          net_value = (+unitprice - +(unitprice * obj.discount) / 100) * obj.quantity;
          var discount = unitprice * obj.quantity - net_value;
          var vat_amount = vat === 0 ? 0 : (+net_value * ((vat / (100 + vat)) * 100)) / 100;
          net_value = net_value - vat_amount;
          obj.exciseAmount = 0; // Simplified
        } else {
          net_value = unitprice * obj.quantity - obj.discount;
          var discount = unitprice * obj.quantity - net_value;
          var vat_amount = vat === 0 ? 0 : (+net_value * ((vat / (100 + vat)) * 100)) / 100;
          net_value = net_value - vat_amount;
          obj.exciseAmount = 0;
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
    postFormData.append('type', 6); // Supplier
    postFormData.append('taxType', taxType);
    postFormData.append('invoiceId', currentSupplierId);
    postFormData.append(
      'invoiceNumber',
      formData.invoice_number !== null ? formData.invoice_number : ''
    );

    // Dates
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
    // if (formData.placeOfSupplyId) {
    //   postFormData.append('placeOfSupplyId', formData.placeOfSupplyId.value ? formData.placeOfSupplyId.value : formData.placeOfSupplyId);
    // }

    if (uploadFile.current?.files?.[0]) {
      postFormData.append('attachmentFile', uploadFile.current?.files?.[0]);
    }

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Invoice...');

    supplierInvoiceDetailActions
      .updateInvoice(postFormData)
      .then(res => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? strings.InvoiceUpdatedSuccessfully : res.data.message
        );
        history.push('/admin/expense/supplier-invoice');
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

  const openSupplierModalHandler = e => {
    e.preventDefault();
    setOpenSupplierModal(true);
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

  const closeSupplierModal = res => {
    if (res) {
      supplierInvoiceActions.getSupplierList(contactType);
    }
    setOpenSupplierModal(false);
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

      const newRow = {
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
      };

      setData([...newData, newRow]);

      setIdCount(idCount + 1);

      updateAmount([...newData, newRow]);
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
    setSupplierCurrencyDes(result[0].currencyName);
    setValue('curreancyname', result[0].currencyName, { shouldValidate: true });
    setSupplierCurrencySymbol(result[0].currencyIsoCode);
  };

  const deleteInvoice = () => {
    const message1 = (
      <text>
        <b>Delete Supplier Invoice?</b>
      </text>
    );
    const message = 'This supplier invoice will be deleted permanently and cannot be recovered. ';
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
    supplierInvoiceDetailActions
      .deleteInvoice(currentSupplierId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? strings.InvoiceDeletedSuccessfully : res.data.message
          );
          history.push('/admin/expense/supplier-invoice');
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
    let supplier_currencyCode = 0;

    supplier_list.map(item => {
      if (item.label.contactId == opt) {
        setSupplierCurrency(item.label.currency.currencyCode);
        setSupplierCurrencyDes(item.label.currency.currencyName);
        setSupplierCurrencySymbol(item.label.currency.currencyIsoCode);
        supplier_currencyCode = item.label.currency.currencyCode;
      }
    });
    return supplier_currencyCode;
  };

  const getTaxTreatment = opt => {
    let supplier_taxTreatmentId = 0;

    supplier_list.map(item => {
      if (item.label.contactId == opt) {
        setSupplierTaxTreatmentDes(item.label.taxTreatment.taxTreatment);
        supplier_taxTreatmentId = item.label.taxTreatment.id;
      }
    });
    return supplier_taxTreatmentId;
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  let tmpSupplier_list = [];
  supplier_list.map(item => {
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
                        <i className="fas fa-file-invoice" />
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
                                {strings.SupplierName}
                              </Label>
                              <Controller
                                name="contactId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    id="contactId"
                                    options={
                                      tmpSupplier_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            tmpSupplier_list,
                                            'Supplier Name'
                                          )
                                        : []
                                    }
                                    value={
                                      tmpSupplier_list &&
                                      tmpSupplier_list.find(option => option.value === +field.value)
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
                                      // getContactShippingAddress(option.value, getTaxTreatment(option.value));
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
                                      .find(option => option.label === supplierTaxTreatmentDes)
                                  }
                                  styles={selectStyles}
                                />
                              </FormGroup>
                            </Col>
                          )}
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
                                    options={DropdownLists.getCurrencyDropdown(currency_list)}
                                    value={
                                      field.value?.values
                                        ? field.value
                                        : DropdownLists.getCurrencyDropdown(currency_list).find(
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

                        <CurrencyExchangeRate
                          strings={strings}
                          currencyName={watch('currencyName')}
                          exchangeRate={watch('exchangeRate')}
                          onChange={value => {
                            exchangeRaterevalidate(value);
                            setValue('exchangeRate', value);
                          }}
                        />

                        <Row className="mb-3">
                          <Col lg={8} className="mb-3">
                            <Button
                              color="primary"
                              className="btn-square mr-3"
                              onClick={openProductModalHandler}
                            >
                              <i className="fa fa-plus"></i> {strings.Addproduct}
                            </Button>
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
                              vat_list={vatList}
                              product_list={product_list}
                              excise_list={excise_list}
                              discountEnabled={discountEnabled}
                              idCount={idCount}
                              updateAmount={updateAmount}
                              enableAccount={true}
                              exchangeRate={watch('exchangeRate')}
                              // disableVat={invoiceBeforeVatRegistration || !isRegisteredVat}
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
                                <i className="fa fa-trash"></i>{' '}
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
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/expense/supplier-invoice');
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
        <CustomerModal
          openCustomerModal={openSupplierModal}
          closeCustomerModal={closeSupplierModal}
          getCurrentUser={getCurrentUser}
          contactType={{ label: 'Supplier', value: 1 }}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={closeProductModal}
          getCurrentProduct={e => {
            supplierInvoiceActions.getProductList().then(res => {
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailSupplierInvoice);
