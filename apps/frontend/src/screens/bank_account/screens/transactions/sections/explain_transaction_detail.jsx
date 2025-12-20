import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button as ShadcnButton } from 'components/ui/button';
import { Checkbox } from 'components/ui/checkbox';

import * as TransactionsActions from 'screens/bank_account/screens/transactions/actions';
import * as TransactionDetailActions from 'screens/bank_account/screens/transactions/screens/detail/actions';
import * as CurrencyConvertActions from 'screens/currencyConvert/actions';
import { CommonActions, selectOptionsFactory, selectCurrencyFactory } from 'services/global';
import { ConfirmDeleteModal } from 'components';
import { Loader } from 'components';

import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

// Regex patterns
const regEx = /^[0-9]*$/;
const regExBoth = /^[a-zA-Z0-9]*$/;
const regDecimal = /^[0-9]*\.?[0-9]*$/;

// Custom styles for react-select
const customStyles = {
  control: provided => ({
    ...provided,
    maxHeight: '50px',
  }),
};

// Supported file formats
const SUPPORTED_FORMAT = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const FILE_SIZE = 1024 * 1024 * 5; // 5MB

// Validation schema
const createValidationSchema = (coaCategoryId, expenseCategory, payrollListIds) => {
  return z.object({
    transactionDate: z.any().refine(val => val, { message: 'Transaction Date is Required' }),
    amount: z
      .string()
      .min(1, 'Transaction Amount is Required')
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

const ExplainTransactionDetail = ({
  selectedData,
  bankId,
  closeExplainTransactionModal,
  getbankdetails,
  data: propData,
}) => {
  const dispatch = useDispatch();

  // Actions
  const transactionsActions = bindActionCreators(TransactionsActions, dispatch);
  const transactionDetailActions = bindActionCreators(TransactionDetailActions, dispatch);
  const currencyConvertActions = bindActionCreators(CurrencyConvertActions, dispatch);
  const commonActions = bindActionCreators(CommonActions, dispatch);

  // Redux state
  const expense_categories_list = useSelector(
    state => state.bank_account?.expense_categories_list || []
  );
  const vat_list = useSelector(state => state.bank_account?.vat_list || []);
  const vendor_list = useSelector(state => state.bank_account?.vendor_list || []);
  const currency_list = useSelector(state => state.bank_account?.currency_list || []);
  const currency_convert_list = useSelector(
    state => state.currencyConvert?.currency_convert_list || []
  );
  const UnPaidPayrolls_List = useSelector(state => state.bank_account?.UnPaidPayrolls_List || []);

  // Local state
  const [language] = useState(window.localStorage.getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [fileName, setFileName] = useState('');

  // Form-related state
  const [chartOfAccountCategoryList, setChartOfAccountCategoryList] = useState([]);
  const [transactionCategoryList, setTransactionCategoryList] = useState({
    categoriesList: [],
    dataList: [],
  });
  const [moneyCategoryList, setMoneyCategoryList] = useState([]);
  const [customer_invoice_list_state, setCustomerInvoiceListState] = useState([]);
  const [supplier_invoice_list_state, setSupplierInvoiceListState] = useState([]);
  const [VATlist, setVATlist] = useState([]);

  // Transaction state
  const [transactionId, setTransactionId] = useState(null);
  const [explanationId, setExplanationId] = useState(null);
  const [transactionCategoryId, setTransactionCategoryIdState] = useState(null);
  const [amount, setAmount] = useState(0);
  const [bankCurrency, setBankCurrency] = useState(null);
  const [basecurrency, setBasecurrency] = useState({});
  const [exchangeRate, setExchangeRateState] = useState(1);
  const [expenseType, setExpenseType] = useState(false);
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
  const [exclusiveVat, setExclusiveVat] = useState(false);
  const [creationMode, setCreationMode] = useState(null);
  const [count, setCount] = useState(0);
  const [custInvoiceCurrency, setCustInvoiceCurrency] = useState(null);
  const [invoiceCurrency, setInvoiceCurrency] = useState(null);
  const [transactionVatAmount, setTransactionVatAmount] = useState(0);
  const [transactionExpenseAmount, setTransactionExpenseAmount] = useState(0);
  const [unexplainValue, setUnexplainValue] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Refs
  const uploadFileRef = useRef(null);

  // Initial values
  const [initValue, setInitValue] = useState({
    bankId: bankId || '',
    transactionDate: new Date(),
    reference: '',
    description: '',
    amount: 0,
    dueAmount: 0,
    coaCategoryId: '',
    transactionCategoryId: '',
    vendorId: '',
    customerId: '',
    vatId: '',
    currencyCode: '',
    curreancyname: '',
    exchangeRate: 1,
    invoiceIdList: [],
    employeeId: '',
    expenseCategory: '',
    VATReportId: '',
    transactionId: '',
    exclusiveVat: false,
    isReverseChargeEnabled: false,
    expenseType: false,
    payrollListIds: [],
    explinationStatusEnum: null,
  });

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createValidationSchema()),
    defaultValues: initValue,
  });

  const watchedValues = watch();

  // Initialize component
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getCompanyCurrency(),
        getChartOfAccountCategoryList(selectedData.debitCreditFlag === 'D' ? 1 : 2),
      ]);
      await initializeTransactionDetail();
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyCurrency = async () => {
    try {
      const res = await currencyConvertActions.getCompanyCurrency();
      if (res.status === 200) {
        setBasecurrency(res.data);
      }
    } catch (err) {
      commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
    }
  };

  const getChartOfAccountCategoryList = async type => {
    try {
      const res = await transactionsActions.getChartOfCategoryList(type);
      if (res.status === 200) {
        setChartOfAccountCategoryList(res.data);
      }
    } catch (err) {
      console.error('Error getting chart of account category list:', err);
    }
  };

  const initializeTransactionDetail = async () => {
    try {
      const res = await transactionDetailActions.getTransactionById(selectedData.id);
      if (res.status === 200) {
        const data = res.data;
        setTransactionId(data.transactionId);
        setExplanationId(data.explanationId);
        setAmount(data.amount);
        setBankCurrency(data.bankAccount);
        setCreationMode(data.creationMode);
        setTransactionCategoryIdState(data.transactionCategoryId);
        setExpenseType(data.expenseType || false);
        setIsReverseChargeEnabled(data.isReverseChargeEnabled || false);
        setExclusiveVat(data.exclusiveVat || false);
        setSelectedStatus(data.expenseType);
        setUnexplainValue(data);

        const newInitValue = {
          ...initValue,
          bankId: data.bankId,
          transactionDate: data.date ? new Date(data.date) : new Date(),
          reference: data.reference || '',
          description: data.description || '',
          amount: data.amount || 0,
          dueAmount: data.dueAmount || 0,
          coaCategoryId: data.coaCategoryId
            ? { value: data.coaCategoryId, label: data.coaCategoryLabel }
            : '',
          transactionCategoryId: data.transactionCategoryId || '',
          vendorId: data.vendorId || '',
          customerId: data.customerId || '',
          vatId: data.vatId || '',
          currencyCode: data.currencyCode || '',
          curreancyname: data.curreancyname || '',
          exchangeRate: data.exchangeRate || 1,
          invoiceIdList: data.invoiceIdList || [],
          employeeId: data.employeeId || '',
          expenseCategory: data.expenseCategory || '',
          VATReportId: data.VATReportId || '',
          transactionId: data.transactionId || '',
          exclusiveVat: data.exclusiveVat || false,
          isReverseChargeEnabled: data.isReverseChargeEnabled || false,
          expenseType: data.expenseType || false,
          payrollListIds: data.payrollDropdownList || [],
          explinationStatusEnum: data.explinationStatusEnum,
          contactName: data.contactName || '',
        };

        setInitValue(newInitValue);
        reset(newInitValue);

        // Handle specific transaction type data
        if (data.coaCategoryId === 16) {
          getVatReportListForBank(1);
        }
        if (data.coaCategoryId === 17) {
          getVatReportListForBank(2);
        }
      }
    } catch (err) {
      console.error('Error getting transaction detail:', err);
    }
  };

  const getVatReportListForBank = async type => {
    try {
      const res = await transactionsActions.getVatReportListForBank(type);
      if (res.status === 200) {
        setVATlist(res.data);
        if (res.data.length > 0) {
          const firstVat = res.data[0];
          setValue('VATReportId', { label: firstVat.vatNumber, value: firstVat.id });
          setValue('amount', firstVat.dueAmount);
          setValue('vatTotalAmount', firstVat.totalAmount);
        }
      }
    } catch (err) {
      console.error('Error getting VAT report list:', err);
    }
  };

  const getTransactionCategoryList = async type => {
    setValue('coaCategoryId', type, { shouldValidate: true });
    setTransactionCategoryList({ categoriesList: [], dataList: [] });

    if (type?.value === 100) {
      getVendorList();
    } else {
      try {
        const res = await transactionsActions.getTransactionCategoryListForExplain(
          type.value,
          initValue.bankId
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

  const getVendorList = () => {
    transactionsActions.getVendorList(initValue.bankId);
  };

  const getExpensesCategoriesList = () => {
    transactionsActions.getExpensesCategoriesList();
    transactionsActions.getVatList();
    currencyConvertActions.getCurrencyConversionList().then(response => {
      if (response.data?.length > 0) {
        setValue('currency', parseInt(response.data[0].currencyCode));
      }
    });
  };

  const getMoneyPaidToUserlist = async option => {
    try {
      const res = await transactionsActions.getMoneyCategoryList(option.value);
      if (res.status === 200) {
        setMoneyCategoryList(res.data);
      }
    } catch (err) {
      console.error('Error getting money category list:', err);
    }
  };

  const getSuggestionInvoicesFotCust = async (option, amount, invoice_list) => {
    const data = {
      amount: amount,
      id: option,
      currency: custInvoiceCurrency && invoice_list != null ? custInvoiceCurrency : 0,
      bankId: bankId,
    };
    try {
      const res = await transactionsActions.getCustomerInvoiceList(data);
      setCustomerInvoiceListState(res.data);
    } catch (err) {
      console.error('Error getting customer invoice list:', err);
    }
    if (invoice_list === null) {
      setValue('curreancyname', '');
      setValue('exchangeRate', '');
      setValue('currencyCode', '');
    }
  };

  const getSuggestionInvoicesFotVend = async (option, amount, invoice_list) => {
    const data = {
      amount: amount,
      id: option,
      currency: invoiceCurrency && invoice_list != null ? invoiceCurrency : 0,
      bankId: bankId,
    };
    try {
      const res = await transactionsActions.getVendorInvoiceList(data);
      setSupplierInvoiceListState(res.data);
    } catch (err) {
      console.error('Error getting vendor invoice list:', err);
    }
    if (invoice_list === null) {
      setValue('curreancyname', '');
      setValue('exchangeRate', '');
      setValue('currencyCode', '');
    }
  };

  const calculateVAT = (transactionAmount, vatId, exclusiveVatValue) => {
    if (exclusiveVatValue === null) {
      exclusiveVatValue = false;
    }
    let transactionVatAmt = 0;
    let transactionExpenseAmt = 0;
    if (transactionAmount && vatId === 1 && exclusiveVatValue) {
      transactionVatAmt = transactionAmount * 0.05;
      transactionExpenseAmt = transactionVatAmt + transactionAmount;
      transactionAmount = transactionExpenseAmt;
      setTransactionVatAmount(transactionVatAmt);
      setTransactionExpenseAmount(transactionExpenseAmt);
    } else if (transactionAmount && vatId === 1 && !exclusiveVatValue) {
      transactionVatAmt = (transactionAmount * 5) / 105;
      transactionExpenseAmt = transactionAmount - transactionVatAmt;
      setTransactionVatAmount(transactionVatAmt);
      setTransactionExpenseAmount(transactionExpenseAmt);
    }
    return transactionAmount;
  };

  const getExchangeRate = () => {
    const result = currency_convert_list.filter(obj => {
      return obj.currencyCode === bankCurrency?.bankAccountCurrency;
    });
    return result[0];
  };

  const setExchange = value => {
    const result = currency_convert_list.filter(obj => {
      return obj.currencyCode === value;
    });
    if (result[0]) {
      setValue('exchangeRate', result[0].exchangeRate);
      setExchangeRateState(result[0].exchangeRate);
    }
  };

  const setCurrency = value => {
    const result = currency_convert_list.filter(obj => {
      return obj.currencyCode === value;
    });
    if (result[0]?.currencyIsoCode) {
      setValue('curreancyname', result[0].currencyIsoCode);
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

  const expenceconvert = amount => {
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
    const transactionAmount = getValues('amount') || 0;
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

  const setcustomexchnage = (customerinvoice, exrate) => {
    let exchange;
    let convertor =
      bankCurrency?.bankAccountCurrency === basecurrency?.currencyCode
        ? customerinvoice
        : bankCurrency?.bankAccountCurrency;
    const result = currency_convert_list.filter(obj => obj.currencyCode === convertor);
    const ex = exrate || result[0]?.exchangeRate || 1;
    setValue('exchangeRate', ex);

    if (customerinvoice === bankCurrency?.bankAccountCurrency) {
      exchange = 1;
    } else {
      if (basecurrency?.currencyCode === customerinvoice) exchange = 1 / ex;
      else exchange = ex;
    }
    setValue('exchangeRateFromList', ex);
    return exchange;
  };

  const basecurrencyconvertor = customerinvoice => {
    let exchange;
    if (customerinvoice !== basecurrency?.currencyCode) {
      const result = currency_convert_list.filter(obj => obj.currencyCode === customerinvoice);
      exchange = result[0]?.exchangeRate || 1;
    } else {
      exchange = 1;
    }
    return exchange;
  };

  const setexchnagedamount = (option, amount, exrate) => {
    if (option?.length > 0) {
      const transactionAmount = amount || getValues('transactionAmount');
      const invoicelist = [...option];
      let remainingcredit = transactionAmount;
      const finaldata = invoicelist.map(i => {
        let localexe = setcustomexchnage(i.currencyCode, exrate);
        let finalcredit = 0;
        let localremainamount = remainingcredit;
        if (remainingcredit > 0) {
          localremainamount = remainingcredit - i.dueAmount * localexe;
          if (localremainamount >= 0) {
            finalcredit = i.dueAmount * localexe;
          }
          if (localremainamount < 0) {
            finalcredit = i.dueAmount * localexe + localremainamount;
          }
          remainingcredit = localremainamount;
        }
        const basecurrencyVal = basecurrencyconvertor(i.currencyCode);
        return {
          ...i,
          invoiceId: i.value,
          invoiceAmount: i.dueAmount,
          convertedInvoiceAmount: i.dueAmount * localexe,
          explainedAmount: i.dueAmount * localexe,
          exchangeRate: localexe,
          pp: false,
          convertedToBaseCurrencyAmount: i.dueAmount * basecurrencyVal,
        };
      });
      setValue('invoiceIdList', finaldata);
      return finaldata;
    } else {
      setValue('invoiceIdList', []);
      return [];
    }
  };

  const onppclick = (value, indexofinvoce) => {
    const invoiceIdList = getValues('invoiceIdList') || [];
    const local2 = [...invoiceIdList];
    local2[indexofinvoce].pp = value;
    let finaldata = [...local2];

    const howManyAreClicked = finaldata.reduce((a, c) => a + (c.pp ? 1 : 0), 0);
    const transactionAmount = getValues('amount');
    const total = finaldata.reduce((accu, curr) => accu + curr.convertedInvoiceAmount, 0);
    const shortAmount = transactionAmount - total;

    let updatedfinaldata = [];
    const temp = finaldata.reduce(
      (a, c) => (c.convertedInvoiceAmount >= transactionAmount ? a + 1 : a + 0),
      0
    );
    const amountislessthanallinvoice = temp === finaldata.length;

    let tempdata;
    if (amountislessthanallinvoice) {
      if (value) {
        tempdata = finaldata.map(i => {
          const basecurrencyVal = basecurrencyconvertor(i.currencyCode);
          return {
            ...i,
            pp: value,
            explainedAmount: transactionAmount / finaldata.length,
            convertedToBaseCurrencyAmount: (
              (transactionAmount / finaldata.length) *
              basecurrencyVal
            ).toFixed(2),
          };
        });
      } else {
        const temp = finaldata.map(i => ({ ...i, pp: value }));
        tempdata = setexchnagedamount(temp);
      }
      finaldata = [...tempdata];
      if (transactionAmount > 0 && transactionAmount !== '') setValue('invoiceIdList', finaldata);
    } else {
      let currentshort = shortAmount;
      finaldata.forEach((i, inx) => {
        const local = { ...i };
        if (i.pp) {
          const iio = local.convertedInvoiceAmount + currentshort / howManyAreClicked;
          local.explainedAmount = iio < 0 ? 0 : iio;
        } else {
          local.explainedAmount = local.convertedInvoiceAmount?.toFixed(2);
        }
        updatedfinaldata.push(local);
      });

      updatedfinaldata = updatedfinaldata.map(i => {
        const basecurrencyVal = basecurrencyconvertor(i.currencyCode);
        return {
          ...i,
          convertedToBaseCurrencyAmount: (i.explainedAmount * basecurrencyVal).toFixed(2),
        };
      });
      setValue('invoiceIdList', updatedfinaldata);
    }
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
    let {
      transactionDate,
      reference,
      description,
      amount,
      dueAmount,
      coaCategoryId,
      vendorId,
      employeeId,
      exchangeRate,
      invoiceIdList,
      customerId,
      vatId,
      currencyCode,
      VATReportId,
      exclusiveVat,
      expenseCategory,
      payrollListIds,
    } = data;

    const expenseTypeVal = selectedStatus;
    if (coaCategoryId && (coaCategoryId.value === 10 || coaCategoryId.label === 'Expense')) {
      amount = calculateVAT(amount, vatId?.value, exclusiveVat);
    }

    let result;
    if (
      (invoiceIdList && coaCategoryId.label === 'Sales') ||
      (invoiceIdList && coaCategoryId.label === 'Supplier Invoice')
    ) {
      result = invoiceIdList.map(o => ({
        id: o.value,
        remainingInvoiceAmount: 0,
        type: o.type,
      }));
    }

    let result1;
    if (payrollListIds && expenseCategory && expenseCategory === 34) {
      result1 = payrollListIds.map(o => ({
        payrollId: o.value,
      }));
    }

    let id;
    if (coaCategoryId?.value === 100) {
      id = 10;
    } else {
      id = coaCategoryId?.value;
    }

    const formData = new FormData();
    formData.append('transactionId', transactionId || '');
    formData.append('explanationId', explanationId || '');
    formData.append('bankId ', bankId || '');
    formData.append('date', dayjs(transactionDate));
    formData.append('exchangeRate', exchangeRate || 1);

    if (coaCategoryId?.label === 'Vat Payment' || coaCategoryId?.label === 'Vay Claim') {
      const info = VATlist.find(i => i.id === VATReportId?.value);
      if (info) {
        delete info.taxFiledOn;
        formData.append('explainedVatPaymentListString', JSON.stringify([info]));
      }
    }

    formData.append('description', description || '');
    formData.append('amount', amount || '');
    formData.append('dueAmount', dueAmount || 0);
    formData.append('coaCategoryId', coaCategoryId ? id : '');

    if (transactionCategoryId) {
      formData.append(
        'transactionCategoryId',
        transactionCategoryId?.value !== undefined
          ? transactionCategoryId.value
          : transactionCategoryId
      );
    }

    if (customerId && coaCategoryId?.value === 2) {
      formData.append('customerId', customerId || '');
    }

    if (vendorId && coaCategoryId?.label === 'Supplier Invoice') {
      formData.append('vendorId', vendorId?.value || vendorId);
    }

    if (currencyCode?.value) {
      formData.append('currencyCode', currencyCode.value);
    } else if (currencyCode) {
      formData.append('currencyCode', currencyCode);
    }

    if (
      expenseCategory &&
      ['Expense', 'Admin Expense', 'Other Expense', 'Cost Of Goods Sold'].includes(
        coaCategoryId?.label
      )
    ) {
      formData.append('expenseCategory', expenseCategory || '');
    }

    if ((vatId && coaCategoryId?.value === 10) || (vatId && coaCategoryId?.label === 'Expense')) {
      formData.append('vatId', vatId || '');
      formData.append('isReverseChargeEnabled', isReverseChargeEnabled);
      formData.append('exclusiveVat', exclusiveVat);
      formData.append('bankGenerated', true);
      formData.append('convertedAmount', expenceconvert(amount));
    }

    if (employeeId !== null) {
      formData.append('employeeId', employeeId?.value || employeeId || '');
    }

    if (
      (invoiceIdList && coaCategoryId?.label === 'Sales') ||
      (invoiceIdList && coaCategoryId?.label === 'Supplier Invoice')
    ) {
      formData.append('explainParamListStr', invoiceIdList ? JSON.stringify(result) : '');
    }

    formData.append(
      'explainedInvoiceListString',
      invoiceIdList
        ? JSON.stringify(
            invoiceIdList.map(i => ({
              invoiceId: i.value,
              invoiceAmount: i.amount,
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
    formData.append('reference', reference || '');

    if (uploadFileRef.current?.files?.[0]) {
      formData.append('attachment', uploadFileRef.current.files[0]);
    }

    if (payrollListIds && expenseCategory && expenseCategory === 34) {
      formData.append('payrollListIds', payrollListIds ? JSON.stringify(result1) : '');
    }

    formData.append('expenseType', expenseType || false);

    transactionDetailActions
      .updateTransaction(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Transaction Detail Explained Successfully.');
          closeExplainTransactionModal(selectedData.id);
          getbankdetails();
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  const UnexplainTransaction = () => {
    const formData = new FormData();
    for (const key in unexplainValue) {
      formData.append(key, unexplainValue[key]);
      formData.set('date', dayjs(unexplainValue['date']));
      formData.set('explainParamListStr', JSON.stringify(unexplainValue['explainParamList']));
      if (Object.keys(unexplainValue['invoiceIdList'] || {}).length > 0) {
        formData.delete('invoiceIdList');
        formData.set('explainParamListStr', JSON.stringify(unexplainValue['invoiceIdList']));
      } else {
        formData.delete('invoiceIdList');
      }
    }
    formData.delete('explainParamList');

    transactionDetailActions
      .UnexplainTransaction(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Transaction Detail Updated Successfully.');
          closeExplainTransactionModal(selectedData.id);
          getbankdetails();
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  const closeTransaction = id => {
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={() => removeTransaction(id)}
        cancelHandler={removeDialog}
        message="This Transaction will be deleted and cannot be reversed"
        message1="Do you want to switch to another page?"
      />
    );
  };

  const removeTransaction = id => {
    removeDialog();
    transactionsActions
      .deleteTransactionById(id)
      .then(() => {
        commonActions.tostifyAlert('success', 'Transaction Deleted Successfully');
        closeExplainTransactionModal(selectedData.id);
        getbankdetails();
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || null);
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  // Validation function
  const validateForm = values => {
    const errors = {};
    calculateVAT(values.amount, values.vatId, values.exclusiveVat);

    const totalexplained = values?.invoiceIdList?.reduce((a, c) => a + c.explainedAmount, 0) || 0;

    if (!values.coaCategoryId) {
      errors.coaCategoryId = 'Please select Transaction Type';
    }

    if (values.coaCategoryId?.value === 2 || values.coaCategoryId?.value === 100) {
      if (!values.vendorId?.value && values.coaCategoryId?.value === 100) {
        errors.vendorId = 'Please select the Vendor';
      } else if (!values.customerId && values.coaCategoryId?.value === 2) {
        errors.customerId = 'Please select the Customer';
      }
      if (!values.invoiceIdList || values.invoiceIdList.length === 0) {
        errors.invoiceIdList = 'Please Select Invoice';
      } else {
        let isExplainAmountZero = false;
        values.invoiceIdList.forEach(i => {
          if (i.explainedAmount === 0) {
            isExplainAmountZero = true;
          }
        });
        if (isExplainAmountZero) {
          errors.invoiceIdList = 'Explained Amount Cannot Be Zero';
        }
      }
    }

    if (
      values.vatId === '' &&
      values.coaCategoryId?.label === 'Expense' &&
      values.expenseCategory !== 34
    ) {
      errors.vatId = 'Please select Vat';
    }

    if (
      (!values.payrollListIds || values.payrollListIds?.length === 0) &&
      values.coaCategoryId?.label === 'Expense' &&
      values.expenseCategory == 34
    ) {
      errors.payrollListIds = 'Please select Payroll';
    }

    if (
      (values.expenseCategory === '' || !values.expenseCategory) &&
      values.coaCategoryId?.label === 'Expense'
    ) {
      errors.expenseCategory = 'Please select Expense Category';
    }

    return errors;
  };

  const handleFormSubmit = e => {
    e?.preventDefault();
    const values = getValues();
    const validationErrors = validateForm(values);

    if (Object.keys(validationErrors).length > 0) {
      commonActions.fillManDatoryDetails();
      return;
    }

    handleSubmit(onSubmit)(e);
  };

  // Set language
  strings.setLanguage(language);

  // Derived values
  const explainedstatus =
    initValue.explinationStatusEnum === 'PARTIAL' ||
    initValue.explinationStatusEnum === 'FULL' ||
    initValue.explinationStatusEnum === 'RECONCILED';

  const ExchangeChangeList = getExchangeRate();

  // Prepare supplier list
  const tmpSupplier_list = vendor_list.map(item => ({
    label: item.label?.contactName,
    value: item.value,
  }));

  // Transaction category value
  let transactionCategoryValue = { label: 'Select Category' };
  if (transactionCategoryList?.categoriesList) {
    let allCategories = [];
    transactionCategoryList.categoriesList.forEach(cat => {
      if (cat.options && Array.isArray(cat.options)) {
        cat.options.forEach(opt => allCategories.push(opt));
      }
    });
    if (transactionCategoryId) {
      const labelObj = allCategories.find(ac => ac.value == transactionCategoryId);
      if (labelObj) {
        transactionCategoryValue = { label: labelObj.label, value: labelObj.value };
      }
    }
  }

  return (
    <div className="detail-bank-transaction-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            {dialog}
            {loading ? (
              <Loader />
            ) : (
              <Card style={{ height: '620px' }}>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="icon-doc" />
                        <span className="ml-2">
                          {selectedData.debitCreditFlag === 'D'
                            ? `${strings.Explain} ${strings.Transaction} ${strings.For} ${strings.WithdrawalAmount} ${bankCurrency?.bankAccountCurrencyIsoCode} ${amount}`
                            : `${strings.Explain} ${strings.Transaction} ${strings.For} ${strings.DepositAmount} ${bankCurrency?.bankAccountCurrencyIsoCode} ${amount}`}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleFormSubmit}>
                        <Row>
                          <Col lg={3}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="chartOfAccountId">
                                <span className="text-danger">* </span>
                                {strings.TransactionType}
                              </Label>
                              <Controller
                                name="coaCategoryId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    isDisabled={explainedstatus}
                                    options={
                                      chartOfAccountCategoryList[0]
                                        ? [
                                            {
                                              ...chartOfAccountCategoryList[0],
                                              options: explainedstatus
                                                ? chartOfAccountCategoryList[0]?.options?.filter(
                                                    i => i.value !== 6
                                                  )
                                                : chartOfAccountCategoryList[0]?.options?.filter(
                                                    i => i.value !== 16 && i.value !== 17
                                                  ),
                                            },
                                          ]
                                        : []
                                    }
                                    onChange={option => {
                                      field.onChange(option);
                                      const result = getExchangeRate();
                                      if (result) setValue('exchangeRate', result.exchangeRate);

                                      if (
                                        option?.label !== 'Expense' &&
                                        option?.label !== 'Supplier Invoice' &&
                                        option?.label !== 'Vat Payment' &&
                                        option?.label !== 'Vat Claim'
                                      ) {
                                        getTransactionCategoryList(option);
                                      }
                                      if (option?.label === 'Expense') {
                                        getExpensesCategoriesList();
                                      }
                                      if (option?.label === 'Supplier Invoice') {
                                        getVendorList();
                                      }
                                      if (option?.label === 'Vat Payment') {
                                        getVatReportListForBank(1);
                                      }
                                      if (option?.label === 'Vat Claim') {
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
                                    readOnly={creationMode !== 'MANUAL'}
                                    placeholderText={strings.TransactionDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD-MM-YYYY"
                                    dropdownMode="select"
                                    selected={field.value ? new Date(field.value) : null}
                                    onChange={date => field.onChange(date)}
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
                              <Label htmlFor="amount">
                                <span className="text-danger">* </span>
                                {strings.Amount}
                              </Label>
                              <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    placeholder={strings.Amount}
                                    readOnly={creationMode !== 'MANUAL'}
                                    onChange={e => {
                                      if (e.target.value === '' || regEx.test(e.target.value)) {
                                        field.onChange(e.target.value);
                                      }
                                      const invoiceIdList = getValues('invoiceIdList');
                                      const exchRate = getValues('exchangeRate');
                                      setexchnagedamount(invoiceIdList, e.target.value, exchRate);
                                    }}
                                    disabled={
                                      watchedValues.coaCategoryId?.label === 'Vat Claim' ||
                                      watchedValues.coaCategoryId?.label === 'Vat Payment'
                                    }
                                    className={errors.amount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.amount && (
                                <div className="invalid-feedback">{errors.amount.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* Form buttons */}
                        <Row>
                          {initValue.explinationStatusEnum !== 'RECONCILED' && (
                            <Col lg={12} className="mt-5">
                              <FormGroup className="text-left">
                                {initValue.explinationStatusEnum !== 'FULL' &&
                                initValue.explinationStatusEnum !== 'PARTIAL' ? (
                                  <div>
                                    <Button
                                      type="submit"
                                      color="primary"
                                      className="btn-square mr-3"
                                    >
                                      <i className="fa fa-dot-circle-o"></i> {strings.Explain}
                                    </Button>
                                    {initValue.explinationStatusEnum !== null && (
                                      <Button
                                        color="secondary"
                                        className="btn-square"
                                        onClick={() => closeTransaction(initValue.transactionId)}
                                      >
                                        <i className="fa fa-ban"></i> {strings.Delete}
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <Button
                                      type="button"
                                      color="primary"
                                      className="btn-square mr-3"
                                      disabled={propData?.isCTNCreated}
                                      onClick={UnexplainTransaction}
                                    >
                                      <i className="fa fa-dot-circle-o"></i> {strings.Unexplain}
                                    </Button>
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          )}
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
    </div>
  );
};

export default ExplainTransactionDetail;
