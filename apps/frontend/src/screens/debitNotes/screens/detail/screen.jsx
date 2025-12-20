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
  NavLink,
  UncontrolledTooltip,
} from 'reactstrap';
import { Checkbox } from '@material-ui/core';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import * as DebitNotesDetailActions from './actions';
import * as DebitNotesActions from '../../actions';
import * as SupplierInvoiceDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { TextField } from '@material-ui/core';

import { LeavePage, Loader, ConfirmDeleteModal, ProductTableCalculation } from 'components';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, renderList, selectStyles } from 'utils';

import './style.scss';
import dayjs from '@/utils/date';
import Switch from 'react-switch';
import API_ROOT_URL from '../../../../constants/config';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = state => {
  return {
    tax_treatment_list: state.common.tax_treatment_list,
    contact_list: state.customer_invoice.contact_list,
    currency_list: state.customer_invoice.currency_list,
    vat_list: state.common.vat_list,
    product_list: state.common.product_list,
    excise_list: state.common.excise_list,
    customer_list: state.common.customer_list,
    country_list: state.customer_invoice.country_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    company_details: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    debitNotesActions: bindActionCreators(DebitNotesActions, dispatch),
    debitNotesDetailActions: bindActionCreators(DebitNotesDetailActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const detailDebitNoteSchema = z.object({
  debitNoteNumber: z.string().min(1, 'Debit Note Number is required'),
  contactId: z.union([
    z.string().min(1, 'Customer Name is required'),
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    }),
  ]),
  invoiceDate: z.union([z.date(), z.string()]).refine((val) => val !== null && val !== '', {
    message: 'Invoice Date is required',
  }),
  lineItemsString: z.array(
    z.object({
      quantity: z.union([z.string(), z.number()]).refine((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num > 0;
      }, 'Quantity must be greater than 0'),
    })
  ).optional(),
  invoiceNumber: z.union([
    z.string(),
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    }),
  ]).optional(),
  debitAmount: z.union([z.string(), z.number()]).optional(),
  referenceNumber: z.string().optional(),
  contact_po_number: z.string().optional(),
  currency: z.union([z.string(), z.object({ value: z.string(), label: z.string() })]).optional(),
  exchangeRate: z.union([z.string(), z.number()]).optional(),
  taxType: z.boolean().optional(),
  notes: z.string().optional(),
  email: z.string().optional(),
  taxTreatmentId: z.union([z.string(), z.object({ value: z.union([z.string(), z.number()]), label: z.string() })]).optional(),
  receiptAttachmentDescription: z.string().optional(),
  totalNet: z.number().optional(),
  totalVatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  total_excise: z.number().optional(),
  totalDiscount: z.number().optional(),
  discountPercentage: z.string().optional(),
  discountType: z.string().optional(),
  fileName: z.string().optional(),
}).refine((data) => {
  return true;
}, {
  message: 'Validation error',
});

const DetailDebitNote = (props) => {
  const {
    tax_treatment_list,
    invoice_list,
    currency_convert_list,
    customer_list,
    universal_currency_list,
    company_details,
    vat_list,
    product_list,
    excise_list,
    currencyConvertActions,
    debitNotesActions,
    debitNotesDetailActions,
    commonActions,
    ProductActions,
    supplierInvoiceDetailActions,
    history,
    location,
  } = props;

  const [language, setLanguage] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [customer_currency_symbol, setCustomerCurrencySymbol] = useState('');
  const [discountOptions] = useState([
    { value: 'FIXED', label: 'Fixed' },
    { value: 'PERCENTAGE', label: '%' },
  ]);
  const [exciseTypeOption] = useState([
    { value: 'Inclusive', label: 'Inclusive' },
    { value: 'Exclusive', label: 'Exclusive' },
  ]);
  const [discount_option, setDiscountOption] = useState('');
  const [data, setData] = useState([]);
  const [debitNoteId, setDebitNoteId] = useState('');
  const [contactType] = useState(1);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [invoiceSelected, setInvoiceSelected] = useState(false);
  const [term, setTerm] = useState('');
  const [placeOfSupplyId, setPlaceOfSupplyId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [fileName, setFileName] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [basecurrency, setBasecurrency] = useState([]);
  const [customer_currency, setCustomerCurrency] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [showInvoiceNumber, setShowInvoiceNumber] = useState(false);
  const [taxType, setTaxType] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [isCreatedWithoutInvoice, setIsCreatedWithoutInvoice] = useState(false);
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
  const [receiptDate, setReceiptDate] = useState('');
  const [isDNWIWithoutProduct, setIsDNWIWithoutProduct] = useState(false);
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState('');
  const [purchaseCategoryOptions, setPurchaseCategoryOptions] = useState([]);

  const uploadFile = useRef(null);

  const regEx = /^[0-9\b]+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  const regExDNNum = /[a-zA-Z0-9-/]+$/;

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
    resolver: zodResolver(detailDebitNoteSchema),
    defaultValues: {
      total_excise: 0,
      totalNet: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      totalDiscount: 0,
      invoiceNumber: '',
      receiptAttachmentDescription: '',
      referenceNumber: '',
      contact_po_number: '',
      currency: '',
      exchangeRate: '',
      currencyName: '',
      invoiceDate: '',
      contactId: '',
      debitNoteNumber: '',
      debitAmount: '',
      notes: '',
      lineItemsString: [],
      discount: 0,
      discountPercentage: '',
      discountType: '',
      fileName: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    getValues,
    setError: setFormError,
    clearErrors,
    reset,
  } = form;

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    initializeData();
    commonActions.getVatList();
    commonActions.getCustomerList(contactType).then(action => {
      if (action && action.type && action.type.includes('fulfilled'))
        getCurrency(action.payload.contactId);
    });
    commonActions.getExciseList();
    debitNotesActions.getCountryList();
    commonActions.getProductList();
  }, []);

  const initializeData = () => {
    commonActions.getTaxTreatmentList();
    if (location.state && location.state.id) {
      debitNotesActions
        .getDebitNoteById(
          location.state.id,
          location.state.isCNWithoutProduct
            ? location.state.isCNWithoutProduct
            : false
        )
        .then(res => {
          if (res.status === 200) {
            setTaxType(res.data.taxType ? res.data.taxType : false);
            setIsCreatedWithoutInvoice(res.data.invoiceId ? false : true);
            setDebitNoteId(location.state.id);
            setIsReverseChargeEnabled(res.data.isReverseChargeEnabled);

            reset({
              invoiceNumber: res.data.invoiceId
                ? { value: res.data.invoiceId, label: res.data.invoiceNumber }
                : '',
              receiptAttachmentDescription: res.data.receiptAttachmentDescription
                ? res.data.receiptAttachmentDescription
                : '',
              referenceNumber: res.data.referenceNo ? res.data.referenceNo : '',
              contact_po_number: res.data.contactPoNumber ? res.data.contactPoNumber : '',
              currency: res.data.currencyCode ? res.data.currencyCode : '',
              exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
              currencyName: res.data.currencyName ? res.data.currencyName : '',
              invoiceDate: res.data.creditNoteDate ? new Date(res.data.creditNoteDate) : '',
              contactId: res.data.contactId ? res.data.contactId : '',
              debitNoteNumber: res.data.creditNoteNumber ? res.data.creditNoteNumber : '',
              totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
              debitAmount: res.data.totalAmount ? res.data.totalAmount : 0,
              notes: res.data.notes ? res.data.notes : '',
              lineItemsString: res.data.invoiceLineItems ? res.data.invoiceLineItems : [],
              discount: res.data.discount ? res.data.discount : 0,
              discountPercentage: res.data.discountPercentage
                ? res.data.discountPercentage
                : '',
              discountType: res.data.discountType ? res.data.discountType : '',
              fileName: res.data.fileName ? res.data.fileName : '',
              total_excise: res.data.totalExciseTaxAmount ? res.data.totalExciseTaxAmount : 0,
            });

            setIsDNWIWithoutProduct(res.data.invoiceLineItems ? false : true);
            setDiscountPercentage(res.data.discountPercentage ? res.data.discountPercentage : '');
            setData(res.data.invoiceLineItems ? res.data.invoiceLineItems : []);
            setInvoiceSelected(res.data.invoiceId ? true : false);
            setRemainingInvoiceAmount(res.data.remainingInvoiceAmount);
            setLoading(false);

            const currentData = res.data.invoiceLineItems ? res.data.invoiceLineItems : [];
            if (currentData.length > 0) {
              updateAmountHandler(currentData);
            }

            getCurrency(res.data.contactId ? res.data.contactId : '');
            setValue(
              'taxTreatmentId',
              res.data.taxTreatment ? res.data.taxTreatment : '',
              { shouldValidate: true }
            );
            setValue(
              'contactId',
              res.data.contactId ? res.data.contactId : '',
              { shouldValidate: true }
            );
            setValue(
              'remainingInvoiceAmount',
              res.data.remainingInvoiceAmount,
              { shouldValidate: true }
            );
            setValue(
              'currency',
              res.data.currencyCode ? res.data.currencyCode : '',
              { shouldValidate: true }
            );
            setValue(
              'invoiceNumber',
              res.data.invoiceId ? res.data.invoiceId : '',
              { shouldValidate: true }
            );
            getInvoiceDetails(res.data.invoiceId);
            purchaseCategoryFetch();
          }
        });
    } else {
      history.push('/admin/expense/debit-notes');
    }
  };

  const purchaseCategoryFetch = () => {
    try {
      ProductActions.getTransactionCategoryListForPurchaseProduct('10').then(res => {
        if (res.status === 200) {
          setPurchaseCategory(res.data);
          setPurchaseCategoryOptions(renderList.getTransactionCategoryList(res.data));
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const renderExcise = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Select
        styles={selectStyles}
        isDisabled
        options={
          excise_list
            ? selectOptionsFactory.renderOptions('name', 'id', excise_list, 'Excise')
            : []
        }
        value={
          row.exciseTaxId
            ? excise_list &&
              selectOptionsFactory
                .renderOptions('name', 'id', excise_list, 'Excise')
                .find(option => option.value === +row.exciseTaxId)
            : ''
        }
        id="exciseTaxId"
        placeholder={strings.Select + strings.Excises}
        onChange={e => {
          selectItem(e.value, row, 'exciseTaxId');
          updateAmountHandler(data);
        }}
        className={`${
          errors.lineItemsString &&
          errors.lineItemsString[parseInt(idx, 10)] &&
          errors.lineItemsString[parseInt(idx, 10)].exciseTaxId &&
          touchedFields.lineItemsString &&
          touchedFields.lineItemsString[parseInt(idx, 10)] &&
          touchedFields.lineItemsString[parseInt(idx, 10)].exciseTaxId
            ? 'is-invalid'
            : ''
        }`}
      />
    );
  };

  const renderQuantity = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <div>
        <Input
          type="text"
          min="0"
          maxLength="10"
          value={row['quantity'] !== 0 ? row['quantity'] : 0}
          onChange={e => {
            if (e.target.value === '' || regDecimal.test(e.target.value)) {
              selectItem(e.target.value, row, 'quantity');
            }
          }}
          placeholder={strings.Quantity}
          className={`form-control
           						${
                        errors.lineItemsString &&
                        errors.lineItemsString[parseInt(idx, 10)] &&
                        errors.lineItemsString[parseInt(idx, 10)].quantity &&
                        touchedFields.lineItemsString &&
                        touchedFields.lineItemsString[parseInt(idx, 10)] &&
                        touchedFields.lineItemsString[parseInt(idx, 10)].quantity
                          ? 'is-invalid'
                          : ''
                      }`}
        />
        {errors.lineItemsString &&
          errors.lineItemsString[parseInt(idx, 10)] &&
          errors.lineItemsString[parseInt(idx, 10)].quantity &&
          touchedFields.lineItemsString &&
          touchedFields.lineItemsString[parseInt(idx, 10)] &&
          touchedFields.lineItemsString[parseInt(idx, 10)].quantity && (
            <div className="invalid-feedback">
              {errors.lineItemsString[parseInt(idx, 10)].quantity.message}
            </div>
          )}
      </div>
    );
  };

  const renderUnitPrice = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Input
        type="text"
        disabled
        value={row['unitPrice'] !== 0 ? row['unitPrice'] : 0}
        onChange={e => {
          if (e.target.value === '' || regDecimal.test(e.target.value)) {
            selectItem(e.target.value, row, 'unitPrice');
          }
        }}
        placeholder={strings.UnitPrice}
        className={`form-control
                       ${
                         errors.lineItemsString &&
                         errors.lineItemsString[parseInt(idx, 10)] &&
                         errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
                         touchedFields.lineItemsString &&
                         touchedFields.lineItemsString[parseInt(idx, 10)] &&
                         touchedFields.lineItemsString[parseInt(idx, 10)].unitPrice
                           ? 'is-invalid'
                           : ''
                       }`}
      />
    );
  };

  const renderSubTotal = (cell, row, extraData) => {
    return row.subTotal === 0
      ? customer_currency_symbol +
          ' ' +
          row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })
      : customer_currency_symbol +
          ' ' +
          row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
  };

  const renderVatAmount = (cell, row, extraData) => {
    return row.vatAmount === 0
      ? customer_currency_symbol +
          ' ' +
          row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })
      : customer_currency_symbol +
          ' ' +
          row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
  };

  const selectItem = (e, row, name) => {
    let newData = data;
    let idx;
    newData.map((obj, index) => {
      if (obj.id === row.id) {
        obj[`${name}`] = e;
        idx = index;
      }
      return obj;
    });
    if (name === 'unitPrice' || name === 'vatCategoryId' || name === 'quantity') {
      setValue(`lineItemsString.${idx}.${name}`, newData[parseInt(idx, 10)][`${name}`], { shouldValidate: true });
      updateAmountHandler(newData);
    } else {
      setData(newData);
      setValue(`lineItemsString.${idx}.${name}`, newData[parseInt(idx, 10)][`${name}`], { shouldValidate: true });
    }
  };

  const renderVat = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Select
        isDisabled
        styles={selectStyles}
        options={
          vat_list ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'Vat') : []
        }
        value={
          vat_list &&
          selectOptionsFactory
            .renderOptions('name', 'id', vat_list, 'Vat')
            .find(option => option.value === +row.vatCategoryId)
        }
        id="vatCategoryId"
        placeholder={strings.Select + strings.Vat}
        onChange={e => {
          selectItem(e.value, row, 'vatCategoryId');
        }}
        className={`${
          errors.lineItemsString &&
          errors.lineItemsString[parseInt(idx, 10)] &&
          errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
          touchedFields.lineItemsString &&
          touchedFields.lineItemsString[parseInt(idx, 10)] &&
          touchedFields.lineItemsString[parseInt(idx, 10)].vatCategoryId
            ? 'is-invalid'
            : ''
        }`}
      />
    );
  };

  const renderDiscount = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <div>
        <div className="input-group">
          <Input
            disabled
            type="text"
            min="0"
            maxLength="14,2"
            value={row['discount'] !== 0 ? row['discount'] : 0}
            onChange={e => {
              if (e.target.value === '' || regDecimal.test(e.target.value)) {
                selectItem(e.target.value, row, 'discount');
              }
              updateAmountHandler(data);
            }}
            placeholder={strings.discount}
            className={`form-control
		   								${
                        errors.lineItemsString &&
                        errors.lineItemsString[parseInt(idx, 10)] &&
                        errors.lineItemsString[parseInt(idx, 10)].discount &&
                        touchedFields.lineItemsString &&
                        touchedFields.lineItemsString[parseInt(idx, 10)] &&
                        touchedFields.lineItemsString[parseInt(idx, 10)].discount
                          ? 'is-invalid'
                          : ''
                      }`}
          />
          <div className="dropdown open input-group-append">
            <div style={{ width: '100%' }}>
              <Select
                isDisabled
                options={discountOptions}
                id="discountType"
                name="discountType"
                value={
                  discountOptions &&
                  discountOptions.find(option => option.value == row.discountType)
                }
                onChange={e => {
                  selectItem(e.value, row, 'discountType');
                  updateAmountHandler(data);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const discountType = row => {
    return (
      discountOptions &&
      selectOptionsFactory
        .renderOptions('label', 'value', discountOptions, 'discount')
        .find(option => option.value === +row.discountType)
    );
  };

  const prductValue = (e, row, name) => {
    let newData = data;
    const result = product_list.find(item => item.id === parseInt(e));
    let idx;
    newData.map((obj, index) => {
      if (obj.id === row.id) {
        obj['unitPrice'] = parseInt(result.unitPrice);
        obj['description'] = result.description;
        idx = index;
      }
      return obj;
    });
    setValue(`lineItemsString.${idx}.unitPrice`, result.unitPrice, { shouldValidate: true });
    setValue(`lineItemsString.${idx}.description`, result.description, { shouldValidate: true });
    updateAmountHandler(newData);
  };

  const renderProduct = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <>
        <Select
          styles={selectStyles}
          isDisabled
          options={
            product_list
              ? selectOptionsFactory.renderOptions('name', 'id', product_list, 'Product')
              : []
          }
          value={
            product_list &&
            selectOptionsFactory
              .renderOptions('name', 'id', product_list, 'Product')
              .find(option => option.value === +row.productId)
          }
          id="productId"
          onChange={e => {
            if (e && e.label !== 'Select Product') {
              selectItem(e.value, row, 'productId');
              prductValue(e.value, row, 'productId');
            }
          }}
          className={`${
            errors.lineItemsString &&
            errors.lineItemsString[parseInt(idx, 10)] &&
            errors.lineItemsString[parseInt(idx, 10)].productId &&
            touchedFields.lineItemsString &&
            touchedFields.lineItemsString[parseInt(idx, 10)] &&
            touchedFields.lineItemsString[parseInt(idx, 10)].productId
              ? 'is-invalid'
              : ''
          }`}
        />
        <div className="mt-1">
          <TextField
            disabled
            type="textarea"
            inputProps={{ maxLength: 2000 }}
            multiline
            minRows={1}
            maxRows={4}
            value={row['description'] ? row['description'] : ''}
            onChange={e => {
              selectItem(e.target.value, row, 'description');
            }}
            placeholder={strings.Description}
            className={`textarea ${
              errors.lineItemsString &&
              errors.lineItemsString[parseInt(idx, 10)] &&
              errors.lineItemsString[parseInt(idx, 10)].description &&
              touchedFields.lineItemsString &&
              touchedFields.lineItemsString[parseInt(idx, 10)] &&
              touchedFields.lineItemsString[parseInt(idx, 10)].description
                ? 'is-invalid'
                : ''
            }`}
          />
        </div>
      </>
    );
  };

  const renderAccount = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Select
        styles={{
          menu: provided => ({ ...provided, zIndex: 9999 }),
        }}
        options={purchaseCategory ? purchaseCategory : []}
        id="transactionCategoryId"
        onChange={e => {
          selectItem(e.value, row, 'transactionCategoryId');
        }}
        isDisabled={true}
        value={
          purchaseCategoryOptions
            ? purchaseCategoryOptions.find(obj => obj.value === row.transactionCategoryId)
            : ''
        }
        placeholder={strings.Select + strings.Account}
        className={`${
          errors.lineItemsString &&
          errors.lineItemsString[parseInt(idx, 10)] &&
          errors.lineItemsString[parseInt(idx, 10)].transactionCategoryId &&
          touchedFields.lineItemsString &&
          touchedFields.lineItemsString[parseInt(idx, 10)] &&
          touchedFields.lineItemsString[parseInt(idx, 10)].transactionCategoryId
            ? 'is-invalid'
            : ''
        }`}
      />
    );
  };

  const deleteRow = (e, row) => {
    const id = row['id'];
    let newData = [];
    e.preventDefault();
    const currentData = data;
    newData = currentData.filter(obj => obj.id !== id);
    setValue('lineItemsString', newData, { shouldValidate: true });
    updateAmountHandler(newData);
  };

  const renderActions = (cell, rows) => {
    return (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon"
        disabled={data.length === 1 ? true : false}
        onClick={e => {
          deleteRow(e, rows);
        }}
      >
        <i className="fas fa-trash"></i>
      </Button>
    );
  };

  const updateAmountHandler = (currentData) => {
    const list = ProductTableCalculation.updateAmount(currentData ? currentData : [], vat_list, taxType);
    setData(list.data);
    setValue('totalNet', list.totalNet ? list.totalNet : 0);
    setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
    setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
    setValue('total_excise', list.total_excise ? list.total_excise : 0);
    setValue('totalDiscount', list.discount ? list.discount : 0);
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
    setDisabled(true);
    setDisableLeavePage(true);

    const {
      debitNoteNumber,
      email,
      invoiceDate,
      referenceNumber,
      contact_po_number,
      receiptAttachmentDescription,
      notes,
      debitAmount,
      invoiceNumber,
      currency,
      contactId,
      exchangeRate,
    } = formData;

    let postData = new FormData();
    postData.append('creditNoteId', debitNoteId);
    postData.append('isCreatedWithoutInvoice', isCreatedWithoutInvoice);
    postData.append('isCreatedWIWP', isDNWIWithoutProduct);
    postData.append('creditNoteNumber', debitNoteNumber ? debitNoteNumber : '');
    postData.append('email', email ? email : '');
    postData.append('creditNoteDate', invoiceDate ? dayjs(invoiceDate) : new Date());
    postData.append('referenceNo', referenceNumber !== null ? referenceNumber : '');
    postData.append('exchangeRate', exchangeRate ? exchangeRate : 1);
    postData.append('contactPoNumber', contact_po_number !== null ? contact_po_number : '');
    postData.append(
      'receiptAttachmentDescription',
      receiptAttachmentDescription !== null ? receiptAttachmentDescription : ''
    );
    postData.append('notes', notes !== null ? notes : '');
    postData.append('type', 13);
    if (isDNWIWithoutProduct === true) postData.append('totalAmount', debitAmount);

    postData.append('vatCategoryId', 2);
    postData.append('taxType', taxType ? taxType : false);

    if (invoiceNumber) {
      postData.append('invoiceId', invoiceNumber.value ? invoiceNumber.value : invoiceNumber);
      postData.append('cnCreatedOnPaidInvoice', '1');
    }
    if (!isDNWIWithoutProduct) {
      postData.append('lineItemsString', JSON.stringify(data));
      postData.append('totalVatAmount', getValues('totalVatAmount'));
      postData.append('totalAmount', getValues('totalAmount'));
      postData.append('discount', getValues('totalDiscount'));
      postData.append('totalExciseTaxAmount', getValues('total_excise'));
      postData.append('isReverseChargeEnabled', isReverseChargeEnabled);
    }
    if (contactId) {
      postData.append('contactId', contactId.value ? contactId.value : contactId);
    }
    if (currency) {
      postData.append('currency', currency.value ? currency.value : currency);
    }
    if (uploadFile && uploadFile.current && uploadFile.current.files && uploadFile.current.files[0]) {
      postData.append('attachmentFile', uploadFile.current.files[0]);
    }
    setLoading(true);
    setLoadingMsg('Updating Credit Note...');
    debitNotesDetailActions
      .updateDebitNote(postData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert('success', strings.DebitNoteUpdatedSuccessfully);
        history.push('/admin/expense/debit-notes');
      })
      .catch(err => {
        commonActions.tostifyAlert('error', strings.DebitNoteUpdatedUnsuccessfully);
        setDisabled(false);
        setLoading(false);
        setDisableLeavePage(false);
        initializeData();
      });
  };

  const deleteDebitNote = () => {
    const message1 = (
      <text>
        <b>Delete Debit Note?</b>
      </text>
    );
    const message = 'This Debit Note  will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeDebitNote}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeDebitNote = () => {
    setDisabled1(true);
    setDisableLeavePage(true);
    debitNotesDetailActions
      .deleteDebitNote(debitNoteId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', strings.DebitNoteDeletedSuccessfully);
          history.push('/admin/expense/debit-notes');
        }
      })
      .catch(err => {
        setDisabled1(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert('error', strings.DebitNoteDeletedUnsuccessfully);
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const getCurrency = opt => {
    let currency;
    customer_list.map(item => {
      if (item.label.contactId == opt) {
        currency = item.label.currency.currencyCode;
        setValue('currency', currency, { shouldValidate: true });
        setValue(
          'customer_currency_symbol',
          item.label.currency.currencyIsoCode,
          { shouldValidate: true }
        );
        setCustomerCurrencySymbol(item.label.currency.currencyIsoCode);
      }
    });
    return currency;
  };

  const getTaxTreatment = opt => {
    customer_list.map(item => {
      if (item.label.contactId == opt) {
        setValue(
          'taxTreatmentId',
          item.label.taxTreatment.taxTreatment,
          { shouldValidate: true }
        );
      }
    });
  };

  const getInvoiceDetails = value => {
    if (value) {
      debitNotesActions.getInvoiceById(value).then(response => {
        if ((response.status = 200)) {
          const custmerName = {
            label:
              response.data.organisationName === ''
                ? response.data.name
                : response.data.organisationName,
            value: response.data.contactId,
          };
          setReceiptDate(
            response.data.receiptDate
              ? new Date(dayjs(response.data.receiptDate, 'YYYY-MM-DD').format())
              : new Date()
          );
          setIsReverseChargeEnabled(response.data.isReverseChargeEnabled);
          setData(response.data.invoiceLineItems ? response.data.invoiceLineItems : []);
          setTaxType(response.data.taxType ? response.data.taxType : false);
          setRemainingInvoiceAmount(response.data.remainingInvoiceAmount);
          setCustomerCurrencySymbol(
            response.data.currencyIsoCode ? response.data.currencyIsoCode : ''
          );

          setValue('currency', response.data.currencyCode ? response.data.currencyCode : '');
          setValue(
            'lineItemsString',
            response.data.invoiceLineItems ? response.data.invoiceLineItems : []
          );
          setValue('totalAmount', response.data.totalAmount);
          setValue('totalDiscount', response.data.discount);
          setValue('taxTreatmentId', response.data.taxTreatment ? response.data.taxTreatment : '');
          setValue('exchangeRate', response.data.exchangeRate ? response.data.exchangeRate : 1);
          setValue('contactId', custmerName, { shouldValidate: true });
          setValue('remainingInvoiceAmount', response.data.remainingInvoiceAmount, { shouldValidate: true });

          updateAmountHandler(response.data.invoiceLineItems ? response.data.invoiceLineItems : []);
          getTaxTreatment(custmerName.value);
          getCurrency(custmerName.value);
        }
      });
    }
  };

  const { isRegisteredVat, isDesignatedZone } = company_details;
  let tmpCustomer_list = [];

  customer_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpCustomer_list.push(obj);
  });

  // Custom validation
  const validateForm = (values) => {
    const customErrors = {};

    if (!isCreatedWithoutInvoice && !values.invoiceNumber) {
      customErrors.invoiceNumber = 'Invoice number is Required';
    }

    if (isCreatedWithoutInvoice == true && !values.debitAmount)
      customErrors.debitAmount = 'Credit Amount is Required';

    if (
      invoiceSelected &&
      parseFloat(getValues('totalAmount')) >
        parseFloat(remainingInvoiceAmount)
    ) {
      customErrors.totalAmount =
        'Invoice Total Amount Cannot be greater than  Remaining Invoice Amount';
    }
    if (
      invoiceSelected &&
      isDNWIWithoutProduct &&
      values.debitAmount &&
      parseFloat(values.debitAmount) >
        parseFloat(remainingInvoiceAmount)
    ) {
      customErrors.debitAmount =
        strings.AmountCannotBeGreaterThanTheInvoiceamount;
    }

    Object.keys(customErrors).forEach((key) => {
      setFormError(key, { type: 'manual', message: customErrors[key] });
    });

    return Object.keys(customErrors).length === 0;
  };

  const handleFormSubmit = (data) => {
    if (validateForm(data)) {
      onSubmit(data);
    }
  };

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
                        <i className="fa fa-credit-card" />
                        <span className="ml-2">Update Debit Note</span>
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
                        <Form onSubmit={handleSubmit(handleFormSubmit)}>
                          {!isCreatedWithoutInvoice && (
                            <Row>
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
                                        isDisabled
                                        id="invoiceNumber"
                                        placeholder={strings.Select + strings.InvoiceNumber}
                                        options={
                                          invoice_list
                                            ? selectOptionsFactory.renderOptions(
                                                'label',
                                                'value',
                                                invoice_list,
                                                'Invoice Number'
                                              )
                                            : []
                                        }
                                        value={
                                          field.value?.value
                                            ? field.value
                                            : invoice_list &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  'label',
                                                  'value',
                                                  invoice_list,
                                                  'Invoice Number'
                                                )
                                                .find(
                                                  obj => obj.value === field.value
                                                )
                                        }
                                        onChange={option => {
                                          if (option && option.value) {
                                            setInvoiceSelected(true);
                                            field.onChange(option);
                                            setValue('referenceNumber', option.label);
                                            getInvoiceDetails(option.value);
                                          } else {
                                            setInvoiceSelected(false);
                                            field.onChange('');
                                            setValue('referenceNumber', '');
                                          }
                                        }}
                                        className={
                                          errors.invoiceNumber &&
                                          touchedFields.invoiceNumber
                                            ? 'is-invalid'
                                            : ''
                                        }
                                        styles={selectStyles}
                                      />
                                    )}
                                  />
                                  {errors.invoiceNumber &&
                                    touchedFields.invoiceNumber && (
                                      <div className="invalid-feedback">
                                        {errors.invoiceNumber.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                            </Row>
                          )}
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="debitNoteNumber">
                                  <span className="text-danger">* </span>
                                  {strings.DebitNoteNumber}
                                </Label>
                                <Controller
                                  name="debitNoteNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      disabled
                                      maxLength="50"
                                      type="text"
                                      id="debitNoteNumber"
                                      placeholder={strings.DebitNoteNumber}
                                      onChange={e => {
                                        const option = e?.target?.value;
                                        if (option === '')
                                          field.onChange('');
                                        else if (regExDNNum.test(option)) {
                                          field.onChange(option);
                                        }
                                      }}
                                      className={
                                        errors.debitNoteNumber &&
                                        touchedFields.debitNoteNumber
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.debitNoteNumber &&
                                  touchedFields.debitNoteNumber && (
                                    <div className="invalid-feedback">
                                      {errors.debitNoteNumber.message}
                                    </div>
                                  )}
                              </FormGroup>
                            </Col>
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
                                      options={tmpCustomer_list ? tmpCustomer_list : []}
                                      value={
                                        field.value?.values
                                          ? field.value
                                          : tmpCustomer_list &&
                                            tmpCustomer_list.find(
                                              obj => obj.value === field.value
                                            )
                                      }
                                      isDisabled={invoiceSelected}
                                      onChange={option => {
                                        if (option && option.value) {
                                          setValue(
                                            'currency',
                                            getCurrency(option.value),
                                            { shouldValidate: true }
                                          );
                                          getTaxTreatment(option.value);
                                          field.onChange(option);
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                      className={
                                        errors.contactId && touchedFields.contactId
                                          ? 'is-invalid'
                                          : ''
                                      }
                                      styles={selectStyles}
                                    />
                                  )}
                                />
                                {errors.contactId && touchedFields.contactId && (
                                  <div className="invalid-feedback">
                                    {errors.contactId.message}
                                  </div>
                                )}
                              </FormGroup>
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
                                          tax_treatment_list
                                            ? selectOptionsFactory.renderOptions(
                                                'name',
                                                'id',
                                                tax_treatment_list,
                                                'Tax Treatment'
                                              )
                                            : []
                                        }
                                        isDisabled={true}
                                        id="taxTreatmentId"
                                        placeholder={strings.Select + strings.TaxTreatment}
                                        value={
                                          field.value?.value
                                            ? field.value
                                            : tax_treatment_list &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  'name',
                                                  'id',
                                                  tax_treatment_list,
                                                  'Tax Treatment'
                                                )
                                                .find(
                                                  option =>
                                                    option.label === field.value
                                                )
                                        }
                                        onChange={option => {
                                          field.onChange(option);
                                        }}
                                        className={
                                          errors.taxTreatmentId &&
                                          touchedFields.taxTreatmentId
                                            ? 'is-invalid'
                                            : ''
                                        }
                                        styles={selectStyles}
                                      />
                                    )}
                                  />
                                  {errors.taxTreatmentId &&
                                    touchedFields.taxTreatmentId && (
                                      <div className="invalid-feedback">
                                        {errors.taxTreatmentId.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                            )}
                          </Row>
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="invoiceDate">
                                  <span className="text-danger">* </span>
                                  Debit Note Date
                                </Label>
                                <Controller
                                  name="invoiceDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      {...field}
                                      id="invoiceDate"
                                      placeholderText={
                                        strings.Enter + strings.DebitNote + strings.Date
                                      }
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      dropdownMode="select"
                                      minDate={receiptDate}
                                      selected={field.value}
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
                                  <div className="invalid-feedback">
                                    {errors.invoiceDate.message?.includes('nullable()')
                                      ? strings.Debit_Note_Date_Is_Required
                                      : errors.invoiceDate.message}
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
                                        field.value?.value
                                          ? field.value
                                          : currency_convert_list &&
                                            selectCurrencyFactory
                                              .renderOptions(
                                                'currencyName',
                                                'currencyCode',
                                                currency_convert_list,
                                                'Currency'
                                              )
                                              .find(
                                                option => option.value === field.value
                                              )
                                      }
                                      className={
                                        errors.currency && touchedFields.currency
                                          ? 'is-invalid'
                                          : ''
                                      }
                                      onChange={option => {
                                        field.onChange(option);
                                      }}
                                    />
                                  )}
                                />
                                {errors.currency && touchedFields.currency && (
                                  <div className="invalid-feedback">
                                    {errors.currency.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            {invoiceSelected && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="remainingInvoiceAmount">
                                    Remaining Invoice Amount
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

                            {isDNWIWithoutProduct === true && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="debitAmount">
                                    <span className="text-danger">* </span>
                                    Debit Amount
                                  </Label>
                                  <Controller
                                    name="debitAmount"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        id="debitAmount"
                                        placeholder={strings.Enter + ' Debit Amount'}
                                        onChange={e => {
                                          const value = e.target.value;
                                          if (
                                            (value === '' ||
                                              regDecimal.test(value)) &&
                                            parseFloat(value) !== 0
                                          )
                                            field.onChange(value);
                                        }}
                                        className={
                                          errors.debitAmount && touchedFields.debitAmount
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.debitAmount && touchedFields.debitAmount && (
                                    <div className="invalid-feedback">
                                      {errors.debitAmount.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            )}
                          </Row>
                          <hr />
                          {!isCreatedWithoutInvoice && !isDNWIWithoutProduct && (
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
                                  value={taxType}
                                  checked={taxType}
                                  disabled
                                  onChange={newTaxType => {
                                    setTaxType(newTaxType);
                                    updateAmountHandler(data);
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
                          )}
                          {isDNWIWithoutProduct === false &&
                            data &&
                            data.length > 0 && (
                              <Row>
                                {errors.lineItemsString &&
                                  typeof errors.lineItemsString === 'string' && (
                                    <div
                                      className={
                                        errors.lineItemsString ? 'is-invalid' : ''
                                      }
                                    >
                                      <div className="invalid-feedback">
                                        {errors.lineItemsString.message}
                                      </div>
                                    </div>
                                  )}
                                <Col lg={12}>
                                  <BootstrapTable
                                    data={data}
                                    version="4"
                                    hover
                                    keyField="id"
                                    className="invoice-create-table"
                                  >
                                    <TableHeaderColumn
                                      width="3%"
                                      dataAlign="center"
                                      dataFormat={(cell, rows) =>
                                        renderActions(cell, rows)
                                      }
                                    ></TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="product"
                                      dataFormat={(cell, rows) =>
                                        renderProduct(cell, rows)
                                      }
                                    >
                                      {strings.PRODUCT}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      width="11%"
                                      dataField="account"
                                      dataFormat={(cell, rows) =>
                                        renderAccount(cell, rows)
                                      }
                                    >
                                      {strings.Account}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="quantity"
                                      dataFormat={(cell, rows) =>
                                        renderQuantity(cell, rows)
                                      }
                                    >
                                      {strings.QUANTITY}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                      dataField="unitPrice"
                                      dataFormat={(cell, rows) =>
                                        renderUnitPrice(cell, rows)
                                      }
                                    >
                                      {strings.UNITPRICE}
                                      <i
                                        id="UnitPriceTooltip"
                                        className="fa fa-question-circle ml-1"
                                      ></i>
                                      <UncontrolledTooltip
                                        placement="right"
                                        target="UnitPriceTooltip"
                                      >
                                        Unit Price – Price of a single product or service
                                      </UncontrolledTooltip>
                                    </TableHeaderColumn>
                                    {getValues('totalDiscount') != 0 && (
                                      <TableHeaderColumn
                                        dataField="discount"
                                        dataFormat={(cell, rows) =>
                                          renderDiscount(cell, rows)
                                        }
                                      >
                                        Discount Type
                                      </TableHeaderColumn>
                                    )}
                                    {getValues('total_excise') != 0 && (
                                      <TableHeaderColumn
                                        dataField="exciseTaxId"
                                        dataFormat={(cell, rows) =>
                                          renderExcise(cell, rows)
                                        }
                                      >
                                        {strings.Excises}
                                        <i
                                          id="ExiseTooltip"
                                          className="fa fa-question-circle ml-1"
                                        ></i>
                                        <UncontrolledTooltip
                                          placement="right"
                                          target="ExiseTooltip"
                                        >
                                          Excise dropdown will be enabled only for the excise
                                          products
                                        </UncontrolledTooltip>
                                      </TableHeaderColumn>
                                    )}
                                    {isRegisteredVat && (
                                      <TableHeaderColumn
                                        dataField="vat"
                                        dataFormat={(cell, rows) =>
                                          renderVat(cell, rows)
                                        }
                                      >
                                        {strings.VAT}
                                      </TableHeaderColumn>
                                    )}
                                    {isRegisteredVat && (
                                      <TableHeaderColumn
                                        dataField="vat_amount"
                                        dataFormat={renderVatAmount}
                                        className="text-right"
                                        columnClassName="text-right"
                                        formatExtraData={universal_currency_list}
                                      >
                                        {strings.VATAMOUNT}
                                      </TableHeaderColumn>
                                    )}
                                    <TableHeaderColumn
                                      dataField="sub_total"
                                      dataFormat={renderSubTotal}
                                      className="text-right"
                                      columnClassName="text-right"
                                      formatExtraData={universal_currency_list}
                                    >
                                      {strings.SUBTOTAL}
                                    </TableHeaderColumn>
                                  </BootstrapTable>
                                </Col>
                              </Row>
                            )}
                          {isDNWIWithoutProduct === false &&
                            data &&
                            data.length > 0 &&
                            isRegisteredVat && (
                              <Row>
                                <Col className="ml-4">
                                  {isReverseChargeEnabled === true ? (
                                    <FormGroup className="mb-3">
                                      <Input
                                        type="checkbox"
                                        id="isReverseChargeEnabled"
                                        checked={isReverseChargeEnabled}
                                        value={isReverseChargeEnabled}
                                        onChange={e => {
                                          setIsReverseChargeEnabled(isReverseChargeEnabled);
                                        }}
                                      />
                                      <Label>{strings.IsReverseCharge}</Label>
                                    </FormGroup>
                                  ) : (
                                    ''
                                  )}
                                </Col>
                              </Row>
                            )}
                          <Row>
                            <Col lg={7}>
                              <Col lg={6}>
                                {!isCreatedWithoutInvoice && (
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="referenceNumber">
                                      {strings.ReferenceNumber}
                                    </Label>
                                    <Controller
                                      name="referenceNumber"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="text"
                                          maxLength="20"
                                          id="referenceNumber"
                                          placeholder={strings.ReceiptNumber}
                                          onChange={value => {
                                            field.onChange(value);
                                          }}
                                          className={
                                            errors.referenceNumber &&
                                            touchedFields.referenceNumber
                                              ? 'is-invalid'
                                              : ' '
                                          }
                                        />
                                      )}
                                    />
                                    {errors.referenceNumber &&
                                      touchedFields.referenceNumber && (
                                        <div className="invalid-feedback">
                                          {errors.referenceNumber.message}
                                        </div>
                                      )}
                                  </FormGroup>
                                )}
                                <FormGroup className="py-2">
                                  <Label htmlFor="notes">{strings.Notes}</Label>
                                  <br />
                                  <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type="textarea"
                                        multiline
                                        style={{ width: '500px' }}
                                        className="textarea"
                                        inputProps={{ maxLength: 255 }}
                                        id="notes"
                                        maxRows={4}
                                        placeholder={strings.DeliveryNotes}
                                        onChange={option => field.onChange(option)}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Col>
                            {isDNWIWithoutProduct === false && (
                              <Col lg={5}>
                                <div className="">
                                  {getValues('total_excise') != 0 && (
                                    <div className="total-item p-2">
                                      <Row>
                                        <Col lg={6}>
                                          <h5 className="mb-0 text-right">
                                            {strings.TotalExcise}
                                          </h5>
                                        </Col>
                                        <Col lg={6} className="text-right">
                                          <label className="mb-0">
                                            {customer_currency_symbol} &nbsp;
                                            {getValues('total_excise').toLocaleString(
                                              navigator.language,
                                              { minimumFractionDigits: 2 }
                                            )}
                                          </label>
                                        </Col>
                                      </Row>
                                    </div>
                                  )}
                                  {getValues('totalDiscount') != 0 && (
                                    <div className="total-item p-2">
                                      <Row>
                                        <Col lg={6}>
                                          <h5 className="mb-0 text-right">
                                            {strings.Discount}
                                          </h5>
                                        </Col>
                                        <Col lg={6} className="text-right">
                                          <label className="mb-0">
                                            {customer_currency_symbol} &nbsp;
                                            {getValues('totalDiscount')
                                              ? getValues('totalDiscount').toLocaleString(
                                                  navigator.language,
                                                  { minimumFractionDigits: 2 }
                                                )
                                              : '0.00'}
                                          </label>
                                        </Col>
                                      </Row>
                                    </div>
                                  )}
                                  <div className="total-item p-2">
                                    <Row>
                                      <Col lg={6}>
                                        <h5 className="mb-0 text-right">
                                          {strings.TotalNet}
                                        </h5>
                                      </Col>
                                      <Col lg={6} className="text-right">
                                        <label className="mb-0">
                                          {customer_currency_symbol} &nbsp;
                                          {getValues('totalNet')
                                            ? getValues('totalNet').toLocaleString(
                                                navigator.language,
                                                { minimumFractionDigits: 2 }
                                              )
                                            : '0.00'}
                                        </label>
                                      </Col>
                                    </Row>
                                  </div>
                                  {isRegisteredVat && (
                                    <div className="total-item p-2">
                                      <Row>
                                        <Col lg={6}>
                                          <h5 className="mb-0 text-right">
                                            {strings.TotalVat}
                                          </h5>
                                        </Col>
                                        <Col lg={6} className="text-right">
                                          <label className="mb-0">
                                            {customer_currency_symbol} &nbsp;
                                            {getValues('totalVatAmount')
                                              ? getValues('totalVatAmount').toLocaleString(
                                                  navigator.language,
                                                  { minimumFractionDigits: 2 }
                                                )
                                              : '0.00'}
                                          </label>
                                        </Col>
                                      </Row>
                                    </div>
                                  )}
                                  <div className="total-item p-2">
                                    <Row>
                                      <Col lg={6}>
                                        <h5 className="mb-0 text-right">{strings.Total}</h5>
                                      </Col>
                                      <Col lg={6} className="text-right">
                                        <label className="mb-0">
                                          {customer_currency_symbol} &nbsp;
                                          {getValues('totalAmount')
                                            ? getValues('totalAmount').toLocaleString(
                                                navigator.language,
                                                { minimumFractionDigits: 2 }
                                              )
                                            : '0.00'}
                                        </label>
                                      </Col>
                                      {errors.totalAmount &&
                                        touchedFields.totalAmount && (
                                          <Col className="invalid-feedback d-block text-right">
                                            {errors.totalAmount.message}
                                          </Col>
                                        )}
                                    </Row>
                                  </div>
                                </div>
                              </Col>
                            )}
                          </Row>
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
                                  disabled1={disabled1}
                                  onClick={deleteDebitNote}
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
                                  onClick={() => {
                                    console.log(errors, 'ERROR');
                                    if (errors && Object.keys(errors).length != 0)
                                      commonActions.fillManDatoryDetails();
                                  }}
                                >
                                  <i className="fa fa-dot-circle-o"></i>{' '}
                                  {disabled ? 'Updating...' : strings.Update}
                                </Button>
                                <Button
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    if (location?.state?.renderURL) {
                                      history.push(
                                        `${location?.state?.renderURL}`,
                                        {
                                          id: location?.state?.renderID,
                                          isCNWithoutProduct:
                                            location?.state?.isCNWithoutProduct,
                                        }
                                      );
                                    } else
                                      history.push('/admin/expense/debit-notes');
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailDebitNote);
