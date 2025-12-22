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
import { Switch } from '@/components/ui/switch';
import * as QuotationDetailsAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import * as ProductActions from '../../../product/actions';
import { ProductModal } from '../../../customer_invoice/sections';
import {
  LeavePage,
  Loader,
  ProductTableCalculation,
  ProductTable,
  TotalCalculation,
  InvoiceAdditionaNotesInformation,
  ConfirmDeleteModal,
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
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { FileText, Trash2, Plus, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  const contact_list = state.request_for_quotation.contact_list;
  const currencyList = state.common.currency_convert_list;
  return {
    project_list: state.request_for_quotation.project_list,
    contact_list,
    currency_list: state.request_for_quotation.currency_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    product_list: state.customer_invoice.product_list,
    excise_list: state.request_for_quotation.excise_list,
    supplier_list: state.request_for_quotation.supplier_list,
    country_list: state.request_for_quotation.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
    companyDetails: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    quotationDetailsAction: bindActionCreators(QuotationDetailsAction, dispatch),
    requestForQuotationAction: bindActionCreators(RequestForQuotationAction, dispatch),
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
const updateQuotationSchema = z.object({
  quotationNumber: z.string().optional(),
  customerId: z
    .union([
      z.string().min(1, 'Customer name is required'),
      z.object({ value: z.union([z.string(), z.number()]), label: z.string() }),
    ])
    .optional(),
  quotationdate: z.union([z.string(), z.date()]).optional(),
  quotaionExpiration: z.union([z.string(), z.date()]).refine(val => val !== null && val !== '', {
    message: 'Expiry date is required',
  }),
  currencyCode: z
    .union([
      z.string().min(1, 'Currency is required'),
      z.object({ value: z.string(), label: z.string() }),
    ])
    .optional(),
  placeOfSupplyId: z
    .union([z.string(), z.object({ value: z.string(), label: z.string() })])
    .optional(),
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
});

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

const DetailQuotation = ({
  requestForQuotationAction,
  quotationDetailsAction,
  ProductActions,
  commonActions,
  currency_list_dropdown,
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
  const [data, setData] = useState([]);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [contactType] = useState(2);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [income] = useState(true);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [contactId, setContactId] = useState('');
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [quotationBeforeVatRegistration, setQuotationBeforeVatRegistration] = useState(false);
  const [producttype, setProducttype] = useState([]);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [taxTreatmentId, setTaxTreatmentId] = useState('');
  const [placeOfSupplyId, setPlaceOfSupplyId] = useState('');
  const [quotationId, setQuotationId] = useState(null);
  const [enablePlaceOfSupply, setEnablePlaceOfSupply] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [vat_list, setVatList] = useState([]);

  const uploadFile = useRef(null);

  const form = useForm({
    resolver: zodResolver(updateQuotationSchema),
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
      lineItemsString: [],
      quotationNumber: '',
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

  const initializeData = () => {
    if (location.state && location.state.id) {
      quotationDetailsAction.getQuotationById(location.state.id).then(res => {
        if (res.status === 200) {
          setQuotationId(location.state.id);

          // Set form values
          setValue(
            'quotaionExpiration',
            res.data.quotaionExpiration
              ? dayjs(res.data.quotaionExpiration).format('DD-MM-YYYY')
              : ''
          );
          setValue(
            'quotationdate',
            res.data.quotationdate ? dayjs(res.data.quotationdate).format('DD-MM-YYYY') : ''
          );
          setValue('attachmentDescription', res.data.attachmentDescription || '');
          setValue('customerId', res.data.customerId || '');
          setValue('quotationNumber', res.data.quotationNumber || '');
          setValue('receiptNumber', res.data.receiptNumber || '');
          setValue('totalVatAmount', res.data.totalVatAmount || 0);
          setValue('totalAmount', res.data.totalAmount || 0);
          setValue('total_net', 0);
          setValue('notes', res.data.notes || '');
          setValue('placeOfSupplyId', res.data.placeOfSupplyId || '');
          setValue('total_excise', res.data.totalExciseAmount || '');
          setValue('discount', res.data.discount || 0);
          setValue('exchangeRate', res.data.exchangeRate || 1);
          setValue('discountPercentage', res.data.discountPercentage || 0);
          setValue('discountType', res.data.discountType || '');
          setValue('currencyCode', res.data.currencyCode || '');

          setTaxType(res.data.taxType || false);
          setTaxTreatmentId(res.data.taxtreatment || '');
          setPlaceOfSupplyId(res.data.placeOfSupplyId || '');
          setData(res.data.poQuatationLineItemRequestModelList || []);
          setQuotationBeforeVatRegistration(
            res.data.quotationdate
              ? dayjs(res.data.quotationdate).isBefore(dayjs(companyVATRegistrationDate))
              : false
          );
          setContactId(res.data.customerId || '');
          setDiscountEnabled(res.data.discount > 0);
          setLoading(false);

          if (
            res.data.poQuatationLineItemRequestModelList &&
            res.data.poQuatationLineItemRequestModelList.length > 0
          ) {
            const lineItems = res.data.poQuatationLineItemRequestModelList;
            setValue('lineItemsString', lineItems);
            updateAmount(lineItems);

            const calculatedIdCount =
              lineItems.length > 0
                ? Math.max.apply(
                    Math,
                    lineItems.map(item => {
                      if (item['productId']) getProductType(item['productId']);
                      return item.id;
                    })
                  )
                : 0;
            setIdCount(calculatedIdCount);
            addRow(lineItems);
          } else {
            setIdCount(0);
          }

          requestForQuotationAction.getSupplierList(contactType);
          requestForQuotationAction.getExciseList();
          requestForQuotationAction.getCountryList();
          requestForQuotationAction.getProductList();
          purchaseCategoryInit();
          salesCategoryInit();
        }
      });
    } else {
      history.push('/admin/income/quotation');
    }
  };

  const addRow = currentData => {
    const dataToUse = currentData || data;
    const hasEmptyRow = dataToUse.some(obj => obj.productId === '');
    if (!hasEmptyRow) {
      const newRow = {
        id: idCount + 1,
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
      };
      const updatedData = [...dataToUse, newRow];
      setData(updatedData);
      setValue('lineItemsString', updatedData);
      setIdCount(idCount + 1);
    }
  };

  useEffect(() => {
    requestForQuotationAction.getVatList().then(res => {
      if (res.status === 200) setVatList(res.data);
    });
    initializeData();
    getCompanyType();
  }, []);

  const getCompanyType = () => {
    if (companyDetails) {
      const {
        isRegisteredVat: regVat,
        isDesignatedZone: desZone,
        vatRegistrationDate,
      } = companyDetails;
      setCompanyVATRegistrationDate(new Date(dayjs(vatRegistrationDate)));
      setIsDesignatedZone(desZone);
      setIsRegisteredVat(regVat);
    }
  };

  const purchaseCategoryInit = () => {
    try {
      ProductActions.getTransactionCategoryListForPurchaseProduct('10').then(res => {
        if (res.status === 200) {
          setPurchaseCategory(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const salesCategoryInit = () => {
    try {
      ProductActions.getTransactionCategoryListForSalesProduct('2').then(res => {
        if (res.status === 200) {
          setSalesCategory(res.data);
        }
      });
    } catch (err) {
      console.log(err);
    }
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

  const updateAmount = dataToUpdate => {
    const list = ProductTableCalculation.updateAmount(dataToUpdate, vat_list, taxType);
    setData(list.data ? list.data : []);
    setValue('total_net', list.totalNet ? list.totalNet : 0);
    setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('discount', list.discount ? list.discount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('total_excise', list.totalExciseAmount ? list.totalExciseAmount : 0);
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
    // Trigger validation
    const isValid = await trigger();
    if (!isValid) {
      commonActions.fillManDatoryDetails();
      return;
    }

    setDisabled(true);
    const postFormData = new FormData();
    postFormData.append('taxType', taxType);
    postFormData.append('id', quotationId);
    postFormData.append('quotationNumber', formData.quotationNumber || '');
    postFormData.append('quotaionExpiration', formData.quotaionExpiration || null);
    postFormData.append('quotationdate', formData.quotationdate || null);
    postFormData.append('receiptNumber', formData.receiptNumber || '');
    postFormData.append(
      'receiptAttachmentDescription',
      formData.receiptAttachmentDescription || ''
    );
    postFormData.append('exchangeRate', formData.exchangeRate || '');
    postFormData.append('contactPoNumber', formData.contact_po_number || '');
    postFormData.append('notes', formData.notes || '');
    postFormData.append('footNote', formData.footNote || '');
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
    setLoadingMsg('Updating Quotation...');

    quotationDetailsAction
      .updateQuotation(postFormData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? strings.QuotationUpdatedSuccessfully : res.data.message
        );
        history.push('/admin/income/quotation');
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Quotation Update Unsuccessful!'
        );
      });
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

  const closeProductModal = () => {
    setOpenProductModal(false);
  };

  const handleDelete = () => {
    setDialog(false);
    setLoading(true);
    setLoadingMsg('Deleting Quotation...');
    quotationDetailsAction
      .deleteQuotation(quotationId)
      .then(res => {
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Quotation Deleted Successfully'
        );
        history.push('/admin/income/quotation');
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Quotation Deletion Failed'
        );
      });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  const { placeList } = Lists;

  return (
    <div>
      <div className="detail-quotation-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <FileText className="h-4 w-4" />
                          <span className="ml-2">{strings.QuotationDetails}</span>
                        </div>
                        <Button
                          color="danger"
                          className="btn-square"
                          onClick={() => setDialog(true)}
                        >
                          <Trash2 className="h-4 w-4" /> {strings.Delete}
                        </Button>
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
                              <Label htmlFor="quotationNumber">{strings.QuotationNumber}</Label>
                              <Controller
                                name="quotationNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input {...field} type="text" id="quotationNumber" disabled />
                                )}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="customerId">{strings.CustomerName}</Label>
                              <Controller
                                name="customerId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    id="customerId"
                                    options={customer_list_dropdown}
                                    value={customer_list_dropdown.find(
                                      option => option.value == field.value
                                    )}
                                    isDisabled={true}
                                    styles={selectStyles}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="quotationdate">{strings.QuotationDate}</Label>
                              <Controller
                                name="quotationdate"
                                control={control}
                                render={({ field }) => (
                                  <Input {...field} type="text" id="quotationdate" disabled />
                                )}
                              />
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
                        </Row>
                        <hr />
                        <Row className="mb-3">
                          <Col lg={8} className="mb-3">
                            <Button
                              color="primary"
                              className="btn-square mr-3"
                              onClick={openProductModalHandler}
                            >
                              <Plus className="h-4 w-4" /> {strings.Addproduct}
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
                                }}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/income/quotation');
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
        <ConfirmDeleteModal
          isOpen={dialog}
          toggle={() => setDialog(!dialog)}
          onConfirm={handleDelete}
          message={strings.AreYouSureYouWantToDeleteThisQuotation}
        />
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailQuotation);
