import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { bindActionCreators } from 'redux';
import Select from 'react-select';
import { Switch } from '@/components/ui/switch';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';

import * as transactionCreateActions from './actions';
import * as transactionActions from '../../actions';
import * as detailBankAccountActions from '../../../detail/actions';
import * as AllPayrollActions from '../../../../../payroll_run/actions';
import * as CurrencyConvertActions from '../../../../../currencyConvert/actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectCurrencyFactory } from 'utils';
import { LeavePage, Loader } from 'components';
import { Checkbox } from '@/components/ui/checkbox';
import { defaultState } from './helpers/defaultstate';
import { calculateVAT } from './helpers/calculateVat';
import { amountFormat } from './helpers/amountformater';

import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Upload, X, CircleDot, RefreshCw, Ban } from 'lucide-react';

let strings = new LocalizedStrings(data);

// Regex patterns
const regEx = /^\d+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;

// Custom styles for react-select
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

// File constraints
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

// Validation schema
const createValidationSchema = () => {
  return z.object({
    transactionDate: z.any().refine(val => val, { message: 'Transaction Date is Required' }),
    transactionAmount: z
      .any()
      .refine(val => val !== '' && val !== undefined, { message: 'Transaction Amount is Required' })
      .refine(val => parseFloat(val) > 0, { message: 'Transaction Amount Must Be Greater Than 0' }),
    coaCategoryId: z.any().refine(val => val, { message: 'Transaction Type is Required' }),
    vendorId: z.any().optional(),
    customerId: z.any().optional(),
    employeeId: z.any().optional(),
    invoiceIdList: z.array(z.any()).optional(),
    transactionCategoryId: z.any().optional(),
    expenseCategory: z.any().optional(),
    vatId: z.any().optional(),
    payrollListIds: z.array(z.any()).optional(),
    VATReportId: z.any().optional(),
    description: z.string().optional(),
    reference: z.string().optional(),
    exchangeRate: z.any().optional(),
    currencyCode: z.any().optional(),
    curreancyname: z.string().optional(),
    isReverseChargeEnabled: z.boolean().optional(),
    exclusiveVat: z.boolean().optional(),
    expenseType: z.boolean().optional(),
    attachment: z
      .any()
      .optional()
      .refine(
        file => {
          if (!file) return true;
          return SUPPORTED_FORMAT.includes(file.type);
        },
        { message: '*Unsupported File Format' }
      )
      .refine(
        file => {
          if (!file) return true;
          return file.size <= FILE_SIZE;
        },
        { message: '*File Size is too large' }
      ),
  });
};

const CreateBankTransaction = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Actions
  const transactionActionsDispatch = bindActionCreators(transactionActions, dispatch);
  const transactionCreateActionsDispatch = bindActionCreators(transactionCreateActions, dispatch);
  const currencyConvertActionsDispatch = bindActionCreators(CurrencyConvertActions, dispatch);
  const commonActionsDispatch = bindActionCreators(CommonActions, dispatch);
  const detailBankAccountActionsDispatch = bindActionCreators(detailBankAccountActions, dispatch);
  const allPayrollActionsDispatch = bindActionCreators(AllPayrollActions, dispatch);

  // Redux state
  const transaction_category_list = useSelector(
    state => state.bank_account?.transaction_category_list || []
  );
  const transaction_type_list = useSelector(
    state => state.bank_account?.transaction_type_list || []
  );
  const customer_invoice_list = useSelector(
    state => state.bank_account?.customer_invoice_list || []
  );
  const vendor_invoice_list = useSelector(state => state.bank_account?.vendor_invoice_list || []);
  const expense_categories_list = useSelector(
    state => state.expense?.expense_categories_list || []
  );
  const user_list = useSelector(state => state.bank_account?.user_list || []);
  const currency_list = useSelector(state => state.bank_account?.currency_list || []);
  const vendor_list = useSelector(state => state.bank_account?.vendor_list || []);
  const vat_list = useSelector(state => state.bank_account?.vat_list || []);
  const currency_convert_list = useSelector(state => state.common?.currency_convert_list || []);
  const UnPaidPayrolls_List = useSelector(state => state.bank_account?.UnPaidPayrolls_List || []);

  // Local state
  const [language] = useState(window.localStorage.getItem('language'));
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [fileName, setFileName] = useState('');

  // Form-related state
  const [chartOfAccountCategoryList, setChartOfAccountCategoryList] = useState([]);
  const [transactionCategoryList, setTransactionCategoryList] = useState([]);
  const [moneyCategoryList, setMoneyCategoryList] = useState([]);
  const [customerInvoiceListState, setCustomerInvoiceListState] = useState([]);
  const [supplierInvoiceListState, setSupplierInvoiceListState] = useState([]);
  const [VATlist, setVATlist] = useState([]);
  const [COACList, setCOACList] = useState([]);
  const [corporateTaxList, setCorporateTaxList] = useState([]);
  const [ct_taxPeriodList, setCt_taxPeriodList] = useState([]);
  const [ct_taxPeriod, setCt_taxPeriod] = useState(null);

  // Bank and currency state
  const [id, setId] = useState(location.state?.bankAccountId || '');
  const [date, setDate] = useState('');
  const [reconciledDate, setReconciledDate] = useState('');
  const [bankCurrency, setBankCurrency] = useState(null);
  const [basecurrency, setBasecurrency] = useState({});
  const [companyDetails, setCompanyDetails] = useState({});
  const [isRegisteredVat, setIsRegisteredVat] = useState(location.state?.isRegisteredVat || false);
  const [payrolldata, setPayrolldata] = useState([]);

  // Transaction state
  const [expenseType, setExpenseType] = useState(false);
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
  const [exclusiveVat, setExclusiveVat] = useState(false);
  const [transactionVatAmount, setTransactionVatAmount] = useState(0);
  const [transactionExpenseAmount, setTransactionExpenseAmount] = useState(0);
  const [custInvoiceCurrency, setCustInvoiceCurrency] = useState(null);
  const [invoiceCurrency, setInvoiceCurrency] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Refs
  const uploadFileRef = useRef(null);

  // Initial values
  const defaultStateValues = defaultState(
    location.state?.currency,
    location.state?.isRegisteredVat
  );

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createValidationSchema()),
    defaultValues: {
      transactionDate: new Date(),
      transactionAmount: '',
      description: '',
      reference: '',
      coaCategoryId: '',
      transactionCategoryId: '',
      vendorId: '',
      customerId: '',
      employeeId: '',
      vatId: '',
      currencyCode: '',
      curreancyname: '',
      exchangeRate: 1,
      invoiceIdList: [],
      expenseCategory: '',
      VATReportId: '',
      exclusiveVat: false,
      isReverseChargeEnabled: false,
      expenseType: false,
      payrollListIds: [],
      attachment: null,
    },
  });

  const watchedValues = watch();

  // Initialize component
  useEffect(() => {
    initializeData();
    transactionActionsDispatch.getUnPaidPayrollsList();
    transactionActionsDispatch.getCOACList().then(response => {
      setCOACList(response.data);
    });
    getCorporateTaxList();

    commonActionsDispatch.getCompanyDetails().then(action => {
      if (action?.type?.includes('fulfilled')) {
        setCompanyDetails(action.payload);
        setIsRegisteredVat(action.payload.isRegisteredVat);
      }
    });
  }, []);

  const initializeData = async () => {
    getCompanyCurrency();

    commonActionsDispatch.getCurrencyConversionList().then(action => {
      if (action?.type?.includes('fulfilled')) {
        const currencyCode = action.payload?.[0]?.currencyCode;
        if (currencyCode) {
          setValue('currency', currencyCode);
        }
      }
    });

    const paginationData = {
      pageNo: '',
      pageSize: '',
      paginationDisable: true,
    };
    const sortingData = {
      order: '',
      sortingCol: '',
    };
    const postData = { ...paginationData, ...sortingData };

    transactionCreateActionsDispatch.getAllPayrollList(postData).then(res => {
      setPayrolldata(res.data);
    });

    if (location.state?.bankAccountId) {
      const bankAccountId = location.state.bankAccountId;
      setId(bankAccountId);

      detailBankAccountActionsDispatch
        .getBankAccountByID(bankAccountId)
        .then(res => {
          setDate(res.openingDate ? dayjs(res.openingDate).format('MM/DD/YYYY') : '');
          setReconciledDate(
            res.lastReconcileDate ? dayjs(res.lastReconcileDate).format('MM/DD/YYYY') : ''
          );
          setBankCurrency(res.bankAccountCurrency ? res : '');
        })
        .catch(err => {
          commonActionsDispatch.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        });
    }

    // Get transaction type list
    transactionActionsDispatch.getTransactionTypeList(location.state?.bankAccountId).then(res => {
      setChartOfAccountCategoryList(res.data || []);
    });
  };

  const getCompanyCurrency = async () => {
    try {
      const res = await currencyConvertActionsDispatch.getCompanyCurrency();
      if (res.status === 200) {
        setBasecurrency(res.data);
      }
    } catch (err) {
      commonActionsDispatch.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
    }
  };

  const getVatReportListForBank = async id => {
    try {
      const res = await transactionCreateActionsDispatch.getVatReportListForBank(id);
      setVATlist(res.data);
    } catch (err) {
      console.error('Error getting VAT report list:', err);
    }
  };

  const getCorporateTaxList = async () => {
    try {
      const res = await transactionActionsDispatch.getCorporateTaxList();
      if (res.status === 200) {
        let data = res.data?.data?.filter(obj => obj.status === 'Filed') || [];
        let list = data.map((obj, index) => ({
          label: `${dayjs(obj.startDate).format('DD-MM-YYYY')} To ${dayjs(obj.endDate).format('DD-MM-YYYY')}`,
          value: index,
        }));
        setCorporateTaxList(data);
        setCt_taxPeriodList(list);
      }
    } catch (err) {
      console.error('Error getting corporate tax list:', err);
    }
  };

  const setCTValues = value => {
    const report = corporateTaxList?.find((obj, index) => index === value);
    if (report) {
      setValue('transactionAmount', report.balanceDue);
      setValue('balanceDue', report.balanceDue);
      setValue('totalAmount', report.taxAmount);
      setValue('transactionDate', new Date(report.taxFiledOn));
    }
  };

  const getTransactionCategoryList = async type => {
    setTransactionCategoryList([]);
    if (type?.value === 100) {
      getVendorList();
    } else {
      try {
        const res = await transactionActionsDispatch.getTransactionCategoryListForExplain(
          type.value,
          id
        );
        if (res.status === 200) {
          let categoryList = res.data.categoriesList?.map(category => {
            let newOption = category.options;
            if (category.label === 'Other Current Liability') {
              newOption = category.options.filter(obj => obj.label !== 'Payroll Liability');
            }
            return { label: category.label, options: newOption };
          });
          setTransactionCategoryList({ categoriesList: categoryList, dataList: res.data.dataList });
        }
      } catch (err) {
        console.error('Error getting transaction category list:', err);
      }
    }
  };

  const getExpensesCategoriesList = () => {
    transactionActionsDispatch.getExpensesCategoriesList();
    transactionActionsDispatch.getCurrencyList().then(response => {
      if (response.data?.[0]?.currencyCode) {
        setValue('currencyCode', parseInt(response.data[0].currencyCode));
      }
    });
    transactionActionsDispatch.getUserForDropdown();
    transactionActionsDispatch.getVatList();
  };

  const getVendorList = () => {
    transactionActionsDispatch.getVendorList(id);
  };

  const getSuggestionInvoicesFotCust = async (option, amount) => {
    const data = {
      amount: amount,
      id: option,
      currency: bankCurrency?.bankAccountCurrency || 0,
      bankId: id,
    };
    try {
      const res = await transactionActionsDispatch.getCustomerInvoiceList(data);
      setCustomerInvoiceListState(res.data);
    } catch (err) {
      console.error('Error getting customer invoice list:', err);
    }
  };

  const getSuggestionInvoicesFotVend = async (option, amount) => {
    const data = {
      amount: amount,
      id: option,
      currency: invoiceCurrency || 0,
      bankId: id,
    };
    try {
      const res = await transactionActionsDispatch.getVendorInvoiceList(data);
      setSupplierInvoiceListState(res.data);
    } catch (err) {
      console.error('Error getting vendor invoice list:', err);
    }
  };

  const getMoneyPaidToUserlist = async option => {
    try {
      const res = await transactionActionsDispatch.getMoneyCategoryList(option.value);
      if (res.status === 200) {
        setMoneyCategoryList(res.data);
      }
    } catch (err) {
      console.error('Error getting money category list:', err);
    }
  };

  const expense_categories_list_generate = () => {
    const categoriesList = [...expense_categories_list];
    const grouped = [];
    categoriesList.forEach(i => {
      const category = grouped.findIndex(g => g.label === i.transactionCategoryDescription);
      if (category > -1) {
        grouped[category].options = [
          ...grouped[category].options,
          { label: i.transactionCategoryName, value: i.transactionCategoryId },
        ];
      } else {
        grouped.push({
          label: i.transactionCategoryDescription,
          options: [{ label: i.transactionCategoryName, value: i.transactionCategoryId }],
        });
      }
    });
    return grouped;
  };

  const getExchangeRate = () => {
    const result = currency_convert_list.filter(
      obj => obj.currencyCode === bankCurrency?.bankAccountCurrency
    );
    return result[0];
  };

  const setExchange = value => {
    const result = currency_convert_list.filter(obj => obj.currencyCode === value);
    if (result[0]) {
      setValue('exchangeRate', result[0].exchangeRate);
    }
  };

  const setCurrency = value => {
    const result = currency_convert_list.filter(obj => obj.currencyCode === value);
    if (result[0]?.currencyIsoCode) {
      setValue('curreancyname', result[0].currencyIsoCode);
    }
  };

  const expenceconvert = amount => {
    const exchangeRate = getValues('exchangeRate') || 1;
    return amount * exchangeRate;
  };

  const setexcessorshortamount = () => {
    const invoiceIdList = getValues('invoiceIdList') || [];
    const totalexpainedamount = invoiceIdList.reduce(
      (accu, curr) => accu + (curr.explainedAmount || 0),
      0
    );
    const totalconvetedamount = invoiceIdList.reduce(
      (accu, curr) => accu + (curr.convertedInvoiceAmount || 0),
      0
    );
    const transactionAmount = getValues('transactionAmount') || 0;
    const isppselected = invoiceIdList.reduce((a, c) => a + (c.pp ? 1 : 0), 0);

    let final = 0;
    const totalshort = totalexpainedamount - totalconvetedamount;
    if (isppselected > 0) {
      final = 0;
    } else if (totalshort < 0) {
      final = totalshort;
    } else if (totalshort >= 0) {
      final = transactionAmount - totalconvetedamount;
    }

    return {
      value: `${bankCurrency?.bankAccountCurrencyIsoCode} ${final.toLocaleString(
        navigator.language,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`,
      data: final.toFixed(2),
    };
  };

  const handleFileChange = e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setValue('attachment', file, { shouldValidate: true });
      setFileName(file.name);
    }
  };

  const onSubmit = data => {
    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);

    const bankAccountId = id;
    let {
      transactionDate,
      description,
      transactionAmount,
      coaCategoryId,
      transactionCategoryId,
      invoiceIdList,
      payrollListIds,
      reference,
      exchangeRate,
      customerId,
      vatId,
      vendorId,
      employeeId,
      expenseCategory,
      currencyCode,
      isReverseChargeEnabled,
      exclusiveVat,
      VATReportId,
      currencyName,
    } = data;

    const formData = new FormData();

    // Calculate VAT if expense
    if (coaCategoryId && (coaCategoryId.value === 10 || coaCategoryId.label === 'Expense')) {
      const list = calculateVAT(transactionAmount, vatId?.value, exclusiveVat);
      transactionAmount = list.transactionAmount;
      setTransactionVatAmount(list.transactionVatAmount);
      setTransactionExpenseAmount(list.transactionExpenseAmount);
    }

    // Handle invoice list for Sales or Supplier Invoice
    if (coaCategoryId?.label === 'Sales' || coaCategoryId?.label === 'Supplier Invoice') {
      const result = invoiceIdList?.map(o => ({
        id: o.value,
        remainingInvoiceAmount: 0,
        type: o.type,
        exchangeRate: exchangeRate,
      }));

      formData.append('explainParamListStr', invoiceIdList ? JSON.stringify(result) : '');
      formData.append(
        'explainedInvoiceListString',
        invoiceIdList
          ? JSON.stringify(
              invoiceIdList.map(i => ({
                invoiceId: i.value,
                invoiceAmount: i.dueAmount,
                convertedInvoiceAmount: i.convertedInvoiceAmount,
                explainedAmount: i.explainedAmount,
                exchangeRate: i.exchangeRate,
                partiallyPaid: i.pp,
                nonConvertedInvoiceAmount: i.explainedAmount / i.exchangeRate,
                convertedToBaseCurrencyAmount: i.convertedToBaseCurrencyAmount,
              }))
            )
          : []
      );

      const excessResult = setexcessorshortamount();
      formData.append(
        'exchangeGainOrLossId',
        excessResult.data < 0 ? 103 : excessResult.data > 0 ? 79 : 0
      );
      formData.append('exchangeGainOrLoss', excessResult.data);
    }

    // Handle payroll
    if (payrollListIds && expenseCategory?.label === 'Salaries and Employee Wages') {
      const result1 = payrollListIds.map(o => ({ payrollId: o.value }));
      formData.append('payrollListIds', JSON.stringify(result1));
    }

    // Append basic fields
    formData.append('expenseType', expenseType);
    formData.append('bankId ', bankAccountId || '');
    formData.append('date', transactionDate || '');
    formData.append('description', description || '');
    formData.append('amount', transactionAmount || '');
    formData.append(
      'coaCategoryId',
      coaCategoryId ? (coaCategoryId.value === 100 ? 10 : coaCategoryId.value) : ''
    );
    formData.append('exchangeRate', exchangeRate || 1);

    if (transactionCategoryId) {
      formData.append('transactionCategoryId', transactionCategoryId.value || '');
    }

    if (expenseCategory && coaCategoryId?.label === 'Expense') {
      formData.append('expenseCategory', expenseCategory.value || '');
    }

    if ((vatId && coaCategoryId?.value === 10) || (vatId && coaCategoryId?.label === 'Expense')) {
      formData.append('vatId', vatId.value || '');
      formData.append('transactionVatAmount', transactionVatAmount || '');
      formData.append('transactionExpenseAmount', transactionExpenseAmount || '');
      formData.append('currencyName', currencyName || '');
      formData.append('bankGenerated', true);
      formData.append('isReverseChargeEnabled', isReverseChargeEnabled);
      formData.append('exclusiveVat', exclusiveVat);
      formData.append('convertedAmount', expenceconvert(transactionAmount));
    }

    if (
      currencyCode &&
      (coaCategoryId?.label === 'Expense' ||
        coaCategoryId?.label === 'Sales' ||
        coaCategoryId?.label === 'Supplier Invoice')
    ) {
      formData.append('currencyCode', currencyCode.value || currencyCode);
    }

    if (customerId && (coaCategoryId?.label === 'Expenses' || coaCategoryId?.label === 'Sales')) {
      formData.append('customerId', customerId.value || '');
    }

    if (vendorId && coaCategoryId?.label === 'Supplier Invoice') {
      formData.append('vendorId', vendorId.value || vendorId);
    }

    if (employeeId) {
      formData.append('employeeId', employeeId.value || '');
    }

    formData.append('reference', reference || '');

    if (uploadFileRef.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFileRef.current.files[0]);
    }

    // Handle VAT Payment/Claim
    if (coaCategoryId?.label === 'VAT Payment' || coaCategoryId?.label === 'VAT Claim') {
      const info = { ...VATlist.find(i => i.id === VATReportId?.value) };
      delete info.taxFiledOn;
      formData.append('explainedVatPaymentListString', info ? JSON.stringify([info]) : '');
    }

    // Handle Corporate Tax Payment
    if (coaCategoryId?.label === 'Corporate Tax Payment') {
      const report = { ...corporateTaxList.find((obj, index) => index === ct_taxPeriod?.value) };
      formData.append('explainedCorporateTaxListString', report ? JSON.stringify([report]) : '');
    }

    transactionCreateActionsDispatch
      .createTransaction(formData)
      .then(res => {
        if (res.status === 200) {
          reset();
          commonActionsDispatch.tostifyAlert('success', 'New Transaction Created Successfully.');
          if (createMore) {
            setCreateMore(false);
            setDisabled(false);
          } else {
            navigate('/admin/banking/bank-account/transaction', {
              state: { bankAccountId, currency: location.state?.currency },
            });
          }
        }
      })
      .catch(err => {
        commonActionsDispatch.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setDisabled(false);
        setLoading(false);
        setDisableLeavePage(false);
      });
  };

  const handleFormSubmit = (isCreateMore = false) => {
    setCreateMore(isCreateMore);
    handleSubmit(onSubmit)();
  };

  // Set language
  strings.setLanguage(language);

  // Derived values
  const ExchangeChangeList = getExchangeRate();
  const tmpSupplier_list = vendor_list.map(item => ({
    label: item.label?.contactName,
    value: item.value,
  }));

  return (
    <div className="create-bank-transaction-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            {loading ? (
              <Loader />
            ) : (
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="icon-doc" />
                        <span className="ml-2">
                          {strings.Create} {strings.Transaction}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form
                        onSubmit={e => {
                          e.preventDefault();
                          handleFormSubmit(false);
                        }}
                      >
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="coaCategoryId">
                                <span className="text-danger">* </span>
                                {strings.TransactionType}
                              </Label>
                              <Controller
                                name="coaCategoryId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={customStyles}
                                    options={chartOfAccountCategoryList}
                                    onChange={option => {
                                      field.onChange(option);
                                      const result = getExchangeRate();
                                      if (result) setValue('exchangeRate', result.exchangeRate);

                                      if (
                                        option?.label !== 'Expense' &&
                                        option?.label !== 'Supplier Invoice' &&
                                        option?.label !== 'VAT Payment' &&
                                        option?.label !== 'VAT Claim' &&
                                        option?.label !== 'Corporate Tax Payment'
                                      ) {
                                        getTransactionCategoryList(option);
                                      }
                                      if (option?.label === 'Expense') {
                                        getExpensesCategoriesList();
                                      }
                                      if (option?.label === 'Supplier Invoice') {
                                        getVendorList();
                                      }
                                      if (option?.label === 'VAT Payment') {
                                        getVatReportListForBank(1);
                                      }
                                      if (option?.label === 'VAT Claim') {
                                        getVatReportListForBank(2);
                                      }
                                    }}
                                    placeholder={strings.Select + strings.TransactionType}
                                    className={errors.coaCategoryId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.coaCategoryId && (
                                <div className="invalid-feedback">
                                  {errors.coaCategoryId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="transactionDate">
                                <span className="text-danger">* </span>
                                {strings.TransactionDate}
                              </Label>
                              <Controller
                                name="transactionDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="transactionDate"
                                    placeholderText={strings.TransactionDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={field.value ? new Date(field.value) : null}
                                    onChange={date => field.onChange(date)}
                                    minDate={
                                      reconciledDate
                                        ? new Date(reconciledDate)
                                        : date
                                          ? new Date(date)
                                          : null
                                    }
                                    className={`form-control ${errors.transactionDate ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.transactionDate && (
                                <div className="invalid-feedback">
                                  {errors.transactionDate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="transactionAmount">
                                <span className="text-danger">* </span>
                                {strings.Amount}
                              </Label>
                              <Controller
                                name="transactionAmount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    placeholder={strings.Amount}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regDecimal.test(e.target.value)
                                      ) {
                                        field.onChange(e.target.value);
                                      }
                                    }}
                                    className={errors.transactionAmount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.transactionAmount && (
                                <div className="invalid-feedback">
                                  {errors.transactionAmount.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* Description */}
                        {watchedValues.coaCategoryId?.label !== 'Corporate Tax Payment' && (
                          <Row>
                            <Col lg={8}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="description">{strings.Description}</Label>
                                <Controller
                                  name="description"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="textarea"
                                      rows="6"
                                      placeholder={strings.Description}
                                      onChange={e => {
                                        if (!e.target.value.includes('=')) {
                                          field.onChange(e.target.value);
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        )}

                        {/* Reference and Attachment */}
                        <Row>
                          <Col lg={8}>
                            <Row>
                              <Col lg={6}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="reference">{strings.ReferenceNumber}</Label>
                                  <Controller
                                    name="reference"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="20"
                                        placeholder={strings.ReceiptNumber}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3 hideAttachment">
                              <Label>{strings.Attachment}</Label>
                              <br />
                              <Button
                                color="primary"
                                onClick={() => document.getElementById('fileInput').click()}
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
                              {errors.attachment && (
                                <div className="invalid-file">{errors.attachment.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* Buttons */}
                        <Row>
                          <Col lg={12} className="mt-5">
                            <FormGroup className="text-right">
                              <Button
                                type="button"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => handleFormSubmit(false)}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              <Button
                                type="button"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => handleFormSubmit(true)}
                              >
                                <RefreshCw className="h-4 w-4" />{' '}
                                {disabled ? 'Creating...' : strings.CreateandMore}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  navigate('/admin/banking/bank-account/transaction', {
                                    state: {
                                      bankAccountId: id,
                                      currency: location.state?.currency,
                                    },
                                  });
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
            )}
          </Col>
        </Row>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default CreateBankTransaction;
