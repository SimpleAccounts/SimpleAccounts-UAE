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
import * as SupplierInvoiceCreateActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import { CustomerModal, ProductModal } from 'screens/customer_invoice/sections'; // Reusing modals for now
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
import { renderList, selectOptionsFactory, InputValidation, DropdownLists, Lists, selectStyles } from 'utils';
import Switch from 'react-switch';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { AddressComponent } from 'screens/contact/sections';

const mapStateToProps = state => {
  const contact_list = state.supplier_invoice.contact_list;
  const currencyList = state.common.currency_convert_list;
  return {
    currency_list: state.supplier_invoice.currency_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    vat_list: state.supplier_invoice.vat_list,
    product_list: state.supplier_invoice.product_list,
    supplier_list: contact_list,
    excise_list: state.supplier_invoice.excise_list,
    country_list: state.supplier_invoice.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    supplier_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
    companyDetails: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    supplierInvoiceCreateActions: bindActionCreators(SupplierInvoiceCreateActions, dispatch),
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
const createSupplierInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  contactId: z.union([
    z.string().min(1, 'Supplier Name is required'),
    z.object({ value: z.union([z.string(), z.number()]), label: z.string() })
  ]),
  term: z.union([
    z.string().min(1, 'Term is required'),
    z.object({ value: z.string(), label: z.string() })
  ]).refine((val) => {
    if (typeof val === 'object' && val.label === 'Select Terms') return false;
    return true;
  }, { message: 'Term is required' }),
  currencyCode: z.union([
    z.string().min(1, 'Currency is required'),
    z.object({ value: z.string(), label: z.string() })
  ]),
  invoiceDate: z.union([z.string(), z.date()]).refine((val) => val !== '', { message: 'Invoice date is required' }),
  invoiceDueDate: z.string().optional(),
  // placeOfSupplyId: z.union([z.string(), z.object({ value: z.string(), label: z.string() })]).optional(),
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
  lineItemsString: z.array(
    z.object({
      quantity: z.union([z.string(), z.number()]).refine(
        value => parseFloat(value) > 0,
        { message: 'Quantity must be greater than 0' }
      ),
      unitPrice: z.union([z.string(), z.number()]).refine(
        value => parseFloat(value) > 0,
        { message: 'Unit price must be greater than 0' }
      ),
      vatCategoryId: z.union([z.string(), z.number()]).refine(
        value => value !== '',
        { message: 'VAT is required' }
      ),
      productId: z.union([z.string(), z.number()]).refine(
        value => value !== '',
        { message: 'Product is required' }
      ),
    })
  ).min(1, 'At least one invoice line item is required'),
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
});

const regExInvNum = /[a-zA-Z0-9-/]+$/;

const CreateSupplierInvoice = ({
  supplierInvoiceActions,
  supplierInvoiceCreateActions,
  productActions,
  commonActions,
  currency_list_dropdown,
  vat_list,
  product_list,
  supplier_list_dropdown,
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
    },
  ]);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [contactType] = useState(1); // 1 for Supplier
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [term, setTerm] = useState('');
  const [exist, setExist] = useState(false);
  const [income] = useState(false); // False for Expense/Supplier
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [invoiceBeforeVatRegistration, setInvoiceBeforeVatRegistration] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [taxTreatmentId, setTaxTreatmentId] = useState('');
  const [contactId, setContactId] = useState('');

  const uploadFile = useRef(null);

  const form = useForm({
    resolver: zodResolver(createSupplierInvoiceSchema),
    defaultValues: {
      receiptAttachmentDescription: '',
      receiptNumber: '',
      contact_po_number: '',
      currencyCode: '',
      invoiceDueDate: '',
      invoiceDate: new Date(),
      contactId: '',
      // placeOfSupplyId: '',
      term: '',
      exchangeRate: 1,
      // changeShippingAddress: false,
      // shippingAddress: Lists.Address,
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

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch, setError, clearErrors } = form;
  const watchInvoiceNumber = watch('invoice_number');

  useEffect(() => {
    if (watchInvoiceNumber) {
      validationCheck(watchInvoiceNumber);
    }
  }, [watchInvoiceNumber]);

  const setDateHandler = (value) => {
    const val = term ? term.value.split('_') : '';
    const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];

    const values = value ? value : dayjs(watch('invoiceDate'), 'DD-MM-YYYY').toDate();
    if (temp && values) {
      // setDate(dayjs(values).add(temp, 'days'));
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

  const validationCheck = useCallback((value) => {
    const validationData = {
      moduleType: 6, // Check if this module type is correct for Supplier Invoice
      name: value,
    };
    supplierInvoiceCreateActions.checkValidation(validationData).then(response => {
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
  }, [supplierInvoiceCreateActions, setError, clearErrors]);

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
    await supplierInvoiceActions.getSupplierList(contactType);
    await supplierInvoiceActions.getCountryList();
    await supplierInvoiceActions.getExciseList();
    await supplierInvoiceActions.getProductList();
    await productActions.getProductCategoryList();
   
    await supplierInvoiceActions
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
    await supplierInvoiceActions.getVatList();

    if (companyDetails) {
      const { currencyCode, isRegisteredVat: regVat, isDesignatedZone: desZone, vatRegistrationDate } =
        companyDetails;
      setValue('currencyCode', currencyCode);
      setCompanyVATRegistrationDate(new Date(dayjs(vatRegistrationDate)));
      setIsDesignatedZone(desZone);
      setIsRegisteredVat(regVat);
      setLoading(false);
    }

    getDefaultNotes();
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const getTaxTreatment = e => {
    let taxTreatmentIdValue = '';
    taxTreatmentIdValue = e.taxTreatment;
    setTaxTreatmentId(taxTreatmentIdValue);
    // setEnablePlaceOfSupply(!!(
    //   taxTreatmentIdValue !== 'GCC VAT REGISTERED' &&
    //   taxTreatmentIdValue !== 'GCC NON-VAT REGISTERED' &&
    //   taxTreatmentIdValue !== 'NON GCC'
    // ));
    setValue('taxTreatmentId', taxTreatmentIdValue, { shouldValidate: true });

    // getContactShippingAddress(e.id, taxTreatmentIdValue);
    return taxTreatmentIdValue;
  };

  const getProductType = id => {
    if (taxTreatmentId) {
      const product = product_list.find(obj => obj.id === id);
      if (product) {
        var vt = [];
        if (isRegisteredVat && !invoiceBeforeVatRegistration) {
          // Logic for VAT type based on product type and tax treatment
          // Simplified for now, similar to customer invoice but adapted for supplier if needed
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

  const updateAmount = (dataToUpdate) => {
    const list = ProductTableCalculation.updateAmount(dataToUpdate, vat_list, taxType);
    setData(list.data ? list.data : []);
    setValue('totalNet', list.totalNet ? list.totalNet : 0);
    setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('discount', list.discount ? list.discount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('totalExciseAmount', list.totalExciseAmount ? list.totalExciseAmount : 0);
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setValue('attachmentFile', file, { shouldValidate: true });
    }
  };

  const onSubmit = (formData) => {
    if (exist) {
      return;
    }

    setDisabled(true);
    const postFormData = new FormData();
    postFormData.append('taxType', taxType);
    postFormData.append(
      'invoiceNumber',
      formData.invoice_number !== null ? formData.invoice_number : ''
    );
    postFormData.append('invoiceDueDate', formData.invoiceDueDate ? formData.invoiceDueDate : null);
    postFormData.append('invoiceDate', formData.invoiceDate ? formData.invoiceDate : null);
    postFormData.append('receiptNumber', formData.receiptNumber !== null ? formData.receiptNumber : '');
    postFormData.append(
      'receiptAttachmentDescription',
      formData.receiptAttachmentDescription !== null ? formData.receiptAttachmentDescription : ''
    );
    postFormData.append('exchangeRate', formData.exchangeRate !== null ? formData.exchangeRate : '');
    postFormData.append('contactPoNumber', formData.contact_po_number !== null ? formData.contact_po_number : '');

    postFormData.append('notes', formData.notes !== null ? formData.notes : '');
    postFormData.append('footNote', formData.footNote ? formData.footNote : '');
    postFormData.append('type', 6); // Supplier Invoice Type
    const local = data.map(({ taxtreatment, vat_list: vatListItem, ...rest }) => rest);
    postFormData.append('lineItemsString', JSON.stringify(local));
    postFormData.append('totalVatAmount', watch('totalVatAmount'));
    postFormData.append('totalAmount', watch('totalAmount'));
    postFormData.append('totalExciseAmount', watch('totalExciseAmount'));
    postFormData.append('discount', watch('discount'));
    postFormData.append('term', term ? (term.value ?? term) : '');
    postFormData.append('contactId', formData.contactId ? (formData.contactId.value ?? formData.contactId) : '');
    // postFormData.append(
    //   'placeOfSupplyId',
    //   formData.placeOfSupplyId ? (formData.placeOfSupplyId.value ?? formData.placeOfSupplyId) : ''
    // );
    postFormData.append('currencyCode', formData.currencyCode ? (formData.currencyCode.value ?? formData.currencyCode) : '');

    if (uploadFile.current && uploadFile.current.files && uploadFile.current.files[0]) {
      postFormData.append('attachmentFile', uploadFile.current.files[0]);
    }

    setLoading(true);
    setLoadingMsg('Creating Invoice...');

    supplierInvoiceCreateActions
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
          setExchangeRate('');
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
            // placeOfSupplyId: '',
            currencyCode: null,
            taxTreatmentId: '',
            term: '',
          });

          setContactId('');
          getInvoiceNo();
          setValue('lineItemsString', data, { shouldValidate: false });
        } else {
          history.push('/admin/expense/supplier-invoice');
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

  const openSupplierModalHandler = () => {
    setOpenSupplierModal(true);
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
          obj['unitPrice'] = (parseFloat(newProduct.unitPrice) * (1 / exchangeRateValue)).toFixed(2);
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
          obj['vatCategoryId'] = getVatCategoryId(
            parseInt(newProduct.vatCategoryId),
            vatList
          );
        }
        return obj;
      });

      setData(data);
      setIdCount(idCount + 1);
      updateAmount(renderList.addRow(data, idCount));
      setValue('lineItemsString', data, { shouldValidate: true });
    }
  };

  const closeSupplierModal = () => {
    setOpenSupplierModal(false);
  };

  const closeProductModal = () => {
    setOpenProductModal(false);
  };

  const getInvoiceNo = () => {
    supplierInvoiceCreateActions.getInvoiceNo().then(res => {
      if (res.status === 200) {
        setValue('invoice_number', res.data, { shouldValidate: true });
        validationCheck(res.data);
      }
    });
  };

  const setContactDetails = (customerID) => {
    setValue('contactId', customerID, { shouldValidate: true });
    const customer = supplier_list_dropdown.find(obj => obj.value === customerID);
    if (customer) {
      const currencyCode = customer.label.currency.currencyCode;
      const taxTreatment = customer.label.taxTreatment.taxTreatment;
      setContactId(customerID);
      setTaxTreatmentId(taxTreatment);
      // setEnablePlaceOfSupply(!!(
      //   taxTreatment !== 'GCC VAT REGISTERED' &&
      //   taxTreatment !== 'GCC NON-VAT REGISTERED' &&
      //   taxTreatment !== 'NON GCC'
      // ));
      setValue('taxTreatmentId', taxTreatment, { shouldValidate: true });
      setCurrency(currencyCode);
    } else {
      setValue('taxTreatmentId', '', { shouldValidate: true });
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  const { termList } = Lists;

  return (
    <div>
      <div className="create-supplier-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fas fa-file-invoice" />
                        <span className="ml-2">{strings.CreateInvoice}</span>
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
                                {strings.SupplierName}
                              </Label>
                              <Controller
                                name="contactId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    id="contactId"
                                    placeholder={strings.Select + strings.SupplierName}
                                    options={supplier_list_dropdown}
                                    value={
                                      field.value?.value
                                        ? field.value
                                        : supplier_list_dropdown.find(
                                            option => option.value == field.value
                                          )
                                    }
                                    onChange={option => {
                                      field.onChange(option);
                                      setContactDetails(option.value);
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
                          
                            <Col lg={3}>
                              <Label htmlFor="contactId" style={{ display: 'block' }}>
                                {strings.AddNewSupplier}
                              </Label>
                              <Button
                                type="button"
                                color="primary"
                                className="btn-square mr-3 mb-3"
                                onClick={openSupplierModalHandler}
                              >
                                <i className="fa fa-plus"></i> {strings.AddASupplier}
                              </Button>
                            </Col>
                          
                          {isRegisteredVat && (
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="taxTreatmentId">
                                  {strings.TaxTreatment}
                                </Label>
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
                                          .find(
                                            option => option.label === field.value
                                          )
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
                              else if (field === 'invoiceDate') {
                                if (
                                  dayjs(value).isBefore(dayjs(companyVATRegistrationDate))
                                ) {
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
                              vat_list={vat_list}
                              product_list={product_list}
                              excise_list={excise_list}
                              discountEnabled={discountEnabled}
                              idCount={idCount}
                              updateAmount={updateAmount}
                              enableAccount={true} // Enable Account column for Expenses
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
                                    setValue('lineItemsString', newData, { shouldValidate: true });
                                    updateAmount(newData);
                                  }
                                  setCreateMore(false);
                                }}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              
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
                                    setCreateMore(true);
                                  }}
                                >
                                  <i className="fa fa-refresh mr-1"></i>
                                  {disabled ? 'Creating...' : strings.CreateandMore}
                                </Button>
                              
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  if (location?.state?.renderURL) {
                                    history.push(
                                      `${location?.state?.renderURL}`,
                                      { id: location?.state?.renderID }
                                    );
                                  } else {
                                    history.push('/admin/expense/supplier-invoice');
                                  }
                                }}
                              >
                                <i className="fa fa-ban mr-1"></i>
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
          openCustomerModal={openSupplierModal}
          closeCustomerModal={() => {
            closeSupplierModal();
          }}
          getCurrentUser={e => {
            supplierInvoiceActions.getSupplierList(contactType);
            setContactDetails(e.value ?? e.id);
            getTaxTreatment(e);
          }}
          contactType={{ label: 'Supplier', value: 1 }}
        />
        <ProductModal
          openProductModal={openProductModal}
          closeProductModal={() => {
            closeProductModal();
          }}
          getCurrentProduct={e => {
            supplierInvoiceActions.getProductList().then(res => {
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
      
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateSupplierInvoice);