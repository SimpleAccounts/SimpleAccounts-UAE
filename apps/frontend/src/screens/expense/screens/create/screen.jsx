import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { LeavePage, Loader } from 'components';
import { bindActionCreators } from 'redux';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import * as ExpenseActions from '../../actions';
import * as ExpenseCreateActions from './actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Checkbox } from '@/components/ui/checkbox';
import Switch from 'react-switch';

const SortExpenseCategory = list => {
  if (list.length !== 0) {
    const COAList = [
      'Admin Expense',
      'Current Asset',
      'COGS',
      'Fixed Asset',
      'Other Current Asset',
      'Other Current Liability',
      'Other Expense',
      'Other Liability',
    ];
    let expenseCategory = [];
    COAList.map(transactionCategoryDescription => {
      let expenseSubCategoryList = [];
      let sub_Cat = list.filter(
        subCat => subCat.transactionCategoryDescription === transactionCategoryDescription
      );
      expenseSubCategoryList = selectOptionsFactory.renderOptions(
        'transactionCategoryName',
        'transactionCategoryId',
        sub_Cat,
        'Expense Category'
      );
      expenseSubCategoryList = expenseSubCategoryList.filter(
        obj => obj.label !== 'Select Expense Category'
      );
      let expenseSubCategory = {
        label: transactionCategoryDescription,
        options: expenseSubCategoryList,
      };
      expenseCategory.push(expenseSubCategory);
    });
    return expenseCategory;
  } else {
    return list;
  }
};

const mapStateToProps = state => {
  const expenseCategoryList = SortExpenseCategory(state?.expense?.expense_categories_list);
  return {
    currency_list: state.expense.currency_list,
    project_list: state.expense.project_list,
    employee_list: state.expense.employee_list,
    vat_list: state.expense.vat_list,
    expense_categories_list_Sorted: expenseCategoryList,
    expense_categories_list: state.expense.expense_categories_list,
    bank_list: state.expense.bank_list,
    pay_mode_list: state.expense.pay_mode_list,
    user_list: state.expense.user_list,
    profile: state.auth.profile,
    currency_convert_list: state.common.currency_convert_list,
    pay_to_list: state.expense.pay_to_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    expenseActions: bindActionCreators(ExpenseActions, dispatch),
    expenseCreateActions: bindActionCreators(ExpenseCreateActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const createExpenseSchema = z.object({
  expenseNumber: z.string().min(1, 'Expense number is required'),
  expenseCategory: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Expense category is required'),
  expenseDate: z.date({ required_error: 'Expense date is required' }),
  currencyCode: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Currency is required'),
  payee: z
    .union([
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      z.string(),
    ])
    .refine(val => val !== null && val !== '', 'Paid by is required'),
  expenseAmount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^[0-9][0-9]*[.]?[0-9]{0,2}$$/, 'Enter a valid amount')
    .refine(val => parseFloat(val) > 0, 'Expense amount should be greater than 0'),
  payMode: z
    .union([
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      z.string(),
    ])
    .refine(val => val !== null && val !== '', 'Pay through is required'),
  placeOfSupplyId: z.any().optional(),
  exchangeRate: z.any().optional(),
  expenseDescription: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptAttachmentDescription: z.string().optional(),
  notes: z.string().optional(),
  footNote: z.string().optional(),
  vatCategoryId: z.any().optional(),
  bankAccountId: z.any().optional(),
  exclusiveVat: z.boolean().optional(),
  taxTreatmentId: z.any().optional(),
  expenseType: z.boolean().optional(),
  employee: z.any().optional(),
  project: z.any().optional(),
  currencyName: z.string().optional(),
  attachmentFile: z.any().optional(),
});

const CreateExpense = ({
  commonActions,
  expenseActions,
  expenseCreateActions,
  currencyConvertActions,
  currency_list,
  expense_categories_list,
  expense_categories_list_Sorted,
  vat_list,
  pay_mode_list,
  bank_list,
  currency_convert_list,
  pay_to_list,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [expenseType, setExpenseType] = useState(false);
  const [isVatClaimable, setIsVatClaimable] = useState(true);
  const [taxTreatmentId, setTaxTreatmentId] = useState('');
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
  const [fileName, setFileName] = useState('');
  const [expenseDateForVatValidation, setExpenseDateForVatValidation] = useState(new Date());
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [basecurrency, setBasecurrency] = useState([]);
  const [language] = useState(window['localStorage'].getItem('language'));
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [placelist, setPlacelist] = useState([
    { label: 'Abu Dhabi', value: '1' },
    { label: 'Dubai', value: '2' },
    { label: 'Sharjah', value: '3' },
    { label: 'Ajman', value: '4' },
    { label: 'Umm Al Quwain', value: '5' },
    { label: 'Ras Al-Khaimah', value: '6' },
    { label: 'Fujairah', value: '7' },
  ]);
  const [showPlacelist, setShowPlacelist] = useState(false);
  const [lockPlacelist, setLockPlacelist] = useState(false);
  const [userStateName, setUserStateName] = useState('');
  const [exist, setExist] = useState(false);
  const [isDesignatedZone, setIsDesignatedZone] = useState(false);
  const [exclusiveVat, setExclusiveVat] = useState(true);
  const [showReverseCharge, setShowReverseCharge] = useState(false);

  const uploadFile = useRef(null);

  const regExInvNum = /[a-zA-Z0-9-/]+$/;
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
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      payee: { label: 'Company Expense', value: 'Company Expense' },
      placeOfSupplyId: '',
      expenseDate: new Date(),
      currencyCode: 150,
      project: '',
      exchangeRate: 1,
      expenseCategory: '',
      expenseAmount: '',
      expenseDescription: '',
      receiptNumber: '',
      attachmentFile: '',
      employee: '',
      receiptAttachmentDescription: '',
      notes: '',
      vatCategoryId: '',
      payMode: { label: 'Petty Cash', value: 'CASH' },
      bankAccountId: '',
      exclusiveVat: true,
      exist: false,
      taxTreatmentId: '',
      expenseType: false,
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
    getValues,
    setError,
    clearErrors,
  } = form;

  strings.setLanguage(language);

  useEffect(() => {
    initializeData();
    getExpenseNumber();
    if (location.state && location.state.parentId) {
      getParentExpenseDetails(location.state.parentId);
    }
    getDefaultNotes();
  }, []);

  const getParentExpenseDetails = parentId => {
    expenseCreateActions
      .getExpenseDetail(parentId)
      .then(res => {
        if (res.status === 200) {
          getCompanyCurrency();
          let vatCategoryId = vat_list
            ? selectOptionsFactory
                .renderOptions('name', 'id', vat_list, 'Tax')
                .find(option => option.value === +res.data.vatCategoryId)
            : '';

          const expenseData = {
            expenseNumber: res.data.expenseNumber,
            payee: res.data.payee ? res.data.payee : '',
            expenseDate: res.data.expenseDate ? new Date(res.data.expenseDate) : new Date(),
            currencyCode: res.data.currencyCode ? res.data.currencyCode : '',
            currencyName: res.data.currencyName ? res.data.currencyName : '',
            expenseCategory: res.data.expenseCategory ? res.data.expenseCategory : '',
            expenseAmount: res.data.expenseAmount,
            vatCategoryId: vatCategoryId ? vatCategoryId : '',
            payMode: res.data.payMode ? res.data.payMode : '',
            bankAccountId: res.data.bankAccountId ? res.data.bankAccountId : '',
            exclusiveVat:
              res.data.exclusiveVat && res.data.exclusiveVat != null ? res.data.exclusiveVat : '',
            exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
            expenseDescription: res.data.expenseDescription,
            receiptNumber: res.data.receiptNumber,
            attachmentFile: res.data.attachmentFile,
            receiptAttachmentDescription: res.data.receiptAttachmentDescription,
            placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
            taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
            notes: res.data.notes ? res.data.notes : '',
          };

          Object.keys(expenseData).forEach(key => {
            setValue(key, expenseData[key]);
          });

          setExpenseType(res.data.expenseType ? true : false);
          setIsVatClaimable(res.data.isVatClaimable ? res.data.isVatClaimable : false);
          setShowPlacelist(res.data.taxTreatmentId !== 8 ? true : false);
          setLockPlacelist(res.data.taxTreatmentId === 7 ? true : false);
          setTaxTreatmentId(res.data.taxTreatmentId ? res.data.taxTreatmentId : '');
          setIsReverseChargeEnabled(
            res.data.isReverseChargeEnabled ? res.data.isReverseChargeEnabled : false
          );
          setExclusiveVat(res.data.exclusiveVat == true ? true : false);
          setExpenseDateForVatValidation(new Date(res.data.expenseDate));
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const getDefaultNotes = () => {
    commonActions.getNoteSettingsInfo().then(res => {
      if (res.status === 200) {
        setValue('notes', res.data.defaultNotes);
        setValue('footNote', res.data.defaultFootNotes);
      }
    });
  };

  const initializeData = () => {
    expenseCreateActions.getPaytoList();
    expenseActions.getVatList();
    expenseActions.getExpenseCategoriesList();
    commonActions.getCurrencyConversionList().then(action => {
      if (action && action.type && action.type.includes('fulfilled')) {
        setValue('currencyCode', action.payload ? parseInt(action.payload[0].currencyCode) : '');
      }
    });
    expenseActions.getBankList();
    expenseActions.getPaymentMode();
    expenseActions.getUserForDropdown();
    getCompanyCurrency();
    getTaxTreatmentList();
    getcurentCompanyUser();
  };

  const getcurentCompanyUser = () => {
    expenseCreateActions.checkAuthStatus().then(response => {
      let userStateName = response.data.company.companyStateCode.stateName
        ? response.data.company.companyStateCode.stateName
        : '';
      let isDesignatedZone = response.data.company.isDesignatedZone
        ? response.data.company.isDesignatedZone
        : false;

      setUserStateName(userStateName);
      setIsDesignatedZone(isDesignatedZone);
      setIsRegisteredVat(response.data.company.isRegisteredVat);
      setCompanyVATRegistrationDate(new Date(response.data.company.vatRegistrationDate));
    });
  };

  const getTaxTreatmentList = () => {
    expenseActions
      .getTaxTreatment()
      .then(res => {
        if (res.status === 200) {
          setTaxTreatmentList(res.data);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err.data ? err.data.message : 'ERROR');
      });
  };

  const onSubmit = data => {
    setDisabled(true);
    setDisableLeavePage(true);

    const {
      expenseNumber,
      payee,
      placeOfSupplyId,
      expenseDate,
      currencyCode,
      project,
      expenseCategory,
      expenseAmount,
      exchangeRate,
      employee,
      expenseDescription,
      receiptNumber,
      receiptAttachmentDescription,
      vatCategoryId,
      payMode,
      bankAccountId,
      taxTreatmentId,
      notes,
      footNote,
    } = data;

    let formData = new FormData();

    formData.append('isVatClaimable', isVatClaimable);
    formData.append('delivaryNotes', notes);
    formData.append('footNote', footNote ? footNote : '');
    formData.append('expenseNumber', expenseNumber ? expenseNumber : '');
    if (payee) formData.append('payee', payee.value ? payee.value : '');
    formData.append('expenseDate', expenseDate !== null ? expenseDate : '');
    formData.append('expenseDescription', expenseDescription);
    formData.append('receiptNumber', receiptNumber);
    formData.append('receiptAttachmentDescription', receiptAttachmentDescription);
    formData.append('expenseAmount', expenseAmount);
    formData.append(
      'payMode',
      payee?.value === 'Company Expense' || payee === 'Company Expense'
        ? payMode?.value
          ? payMode.value
          : payMode
        : ''
    );
    if (expenseCategory && expenseCategory.value) {
      formData.append('expenseCategory', expenseCategory.value);
    }
    if (employee && employee.value) {
      formData.append('employeeId', employee.value);
    }
    if (placeOfSupplyId) {
      formData.append(
        'placeOfSupplyId',
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }
    if (!isRegisteredVat) {
      formData.append('taxTreatmentId', '');
      formData.append('vatCategoryId', 10);
      formData.append('isReverseChargeEnabled', false);
      formData.append('expenseType', false);
    } else {
      if (isRegisteredVat && taxTreatmentId) {
        formData.append(
          'taxTreatmentId',
          taxTreatmentId.value ? taxTreatmentId.value : taxTreatmentId
        );
      }
      if (vatCategoryId) {
        formData.append('vatCategoryId', vatCategoryId.value ? vatCategoryId.value : vatCategoryId);
        if (exclusiveVat !== undefined) {
          formData.append('exclusiveVat', exclusiveVat);
        }
      }
      formData.append('isReverseChargeEnabled', isReverseChargeEnabled);
      formData.append('expenseType', expenseType);
    }
    if (exchangeRate) {
      formData.append('exchangeRate', exchangeRate);
    }
    formData.append('currencyCode', currencyCode ? (currencyCode.value ?? currencyCode) : '');

    if (bankAccountId && bankAccountId.value && payMode.value === 'BANK') {
      formData.append('bankAccountId', bankAccountId.value);
    }
    if (project && project.value) {
      formData.append('projectId', project.value);
    }
    if (uploadFile?.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFile?.current?.files?.[0]);
    }

    setLoading(true);
    setLoadingMsg('Creating Expense...');

    expenseCreateActions
      .createExpense(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Expense Created Successfully'
          );
          if (createMore) {
            reset();
            setCreateMore(false);
            setLoading(false);
            setDisableLeavePage(false);
            setExpenseDateForVatValidation(new Date());
            setDisabled(false);
            getExpenseNumber();
          } else {
            history.push('/admin/expense/expense');
            setDisabled(false);
            setLoading(false);
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Expense Created Unsuccessfully'
        );
      });
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
    if (currency_convert_list) {
      let result = currency_convert_list.filter(obj => {
        return obj.currencyCode === value;
      });
      if (result && result[0] && result[0].exchangeRate)
        setValue('exchangeRate', result[0].exchangeRate);
    }
  };

  const setCurrency = value => {
    if (currency_convert_list) {
      let result = currency_convert_list.filter(obj => {
        return obj.currencyCode === value;
      });
      if (result[0] && result[0].currencyName) {
        setValue('currencyName', result[0].currencyName);
      }
    }
  };

  const getExpenseNumber = () => {
    expenseCreateActions.getExpenseNumber().then(res => {
      if (res.status === 200) {
        setValue('expenseNumber', res.data);
        if (res.data && res.data != null) {
          expenseValidationCheck(res.data);
        }
      }
    });
  };

  const expenseValidationCheck = value => {
    const data = {
      moduleType: 18,
      name: value,
    };
    expenseCreateActions.checkExpenseCodeValidation(data).then(response => {
      if (response.data === 'Expense Number Already Exists') {
        setExist(true);
        setError('expenseNumber', {
          type: 'manual',
          message: 'Expense number already exists',
        });
      } else {
        setExist(false);
        clearErrors('expenseNumber');
      }
    });
  };

  const placelistSetting = option => {
    setShowPlacelist(true);
    setLockPlacelist(false);
    if (option?.value === 6)
      setPlacelist([
        { label: 'Abu Dhabi', value: '1' },
        { label: 'Dubai', value: '2' },
        { label: 'Sharjah', value: '3' },
        { label: 'Ajman', value: '4' },
        { label: 'Umm Al Quwain', value: '5' },
        { label: 'Ras Al-Khaimah', value: '6' },
        { label: 'Fujairah', value: '7' },
        { label: 'BAHRAIN', value: '8' },
        { label: 'SAUDI ARABIA', value: '9' },
        { label: 'OMAN', value: '10' },
        { label: 'KUWAIT', value: '11' },
        { label: 'QATAR', value: '12' },
      ]);
    else if (option?.value === 5)
      setPlacelist([
        { label: 'Abu Dhabi', value: '1' },
        { label: 'Dubai', value: '2' },
        { label: 'Sharjah', value: '3' },
        { label: 'Ajman', value: '4' },
        { label: 'Umm Al Quwain', value: '5' },
        { label: 'Ras Al-Khaimah', value: '6' },
        { label: 'Fujairah', value: '7' },
        { label: 'BAHRAIN', value: '8' },
        { label: 'SAUDI ARABIA', value: '9' },
        { label: 'OMAN', value: '10' },
      ]);
    else if (option?.value === 8) {
      setValue('placeOfSupplyId', '');
      setShowPlacelist(false);
    } else if (option?.value === 7) {
      let placeOfSupplyId = placelist.find(option => option.label === userStateName);
      setValue('placeOfSupplyId', placeOfSupplyId);
      setLockPlacelist(true);
    } else
      setPlacelist([
        { label: 'Abu Dhabi', value: '1' },
        { label: 'Dubai', value: '2' },
        { label: 'Sharjah', value: '3' },
        { label: 'Ajman', value: '4' },
        { label: 'Umm Al Quwain', value: '5' },
        { label: 'Ras Al-Khaimah', value: '6' },
        { label: 'Fujairah', value: '7' },
      ]);
  };

  const ReverseChargeSetting = option => {
    if (isDesignatedZone == true) {
      if ((option >= 1 && option <= 4) || option === 8) {
        setShowReverseCharge(false);
      } else {
        setShowReverseCharge(true);
      }
    } else {
      if (isDesignatedZone == false) {
        if (option === 3 || option === 8) {
          setShowReverseCharge(false);
        } else {
          setShowReverseCharge(true);
        }
      }
    }
  };

  const renderVat = () => {
    const values = getValues();
    let vat_list_filtered = [];
    let vatIds = [];
    if (isRegisteredVat && expenseDateForVatValidation > companyVATRegistrationDate) {
      if (isDesignatedZone && isDesignatedZone != null && isDesignatedZone == true) {
        switch (
          values.taxTreatmentId && values.taxTreatmentId.value ? values.taxTreatmentId.value : ''
        ) {
          case 1:
          case 3:
            if (isReverseChargeEnabled == false) vatIds = [1, 2, 3];
            break;

          case 2:
          case 4:
          case 8:
            if (isReverseChargeEnabled == false) vatIds = [4];
            break;

          case 5:
          case 6:
          case 7:
            if (isReverseChargeEnabled == false) vatIds = [3];
            else if (isReverseChargeEnabled == true) vatIds = [1, 2];
            break;

          default:
            break;
        }
      } else if (isDesignatedZone == false)
        switch (
          values.taxTreatmentId && values.taxTreatmentId.value ? values.taxTreatmentId.value : ''
        ) {
          case 1:
            if (isReverseChargeEnabled == false) vatIds = [1, 2, 3];
            else if (isReverseChargeEnabled == true) vatIds = [1, 2];
            break;

          case 3:
            if (isReverseChargeEnabled == false) vatIds = [1, 2, 3];
            break;

          case 2:
          case 4:
          case 5:
          case 6:
          case 7:
            if (isReverseChargeEnabled == false) vatIds = [3];
            else if (isReverseChargeEnabled == true) vatIds = [1, 2];
            break;

          case 8:
            if (isReverseChargeEnabled == false) vatIds = [4];
            break;

          default:
            break;
        }
    } else {
      vatIds = [10];
    }

    vat_list_filtered = getVatListByIds(vatIds);

    return (
      <Col lg={3}>
        <FormGroup className="mb-3">
          <Label htmlFor="vatCategoryId">
            <span className="text-danger">* </span>
            {strings.VAT}
          </Label>
          <Controller
            name="vatCategoryId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={
                  vat_list_filtered
                    ? selectOptionsFactory.renderOptions('name', 'id', vat_list_filtered, 'VAT')
                    : []
                }
                placeholder={strings.Select + strings.VAT}
                id="vatCategoryId"
                name="vatCategoryId"
                styles={selectStyles}
                className={errors.vatCategoryId ? 'is-invalid' : ''}
              />
            )}
          />
          {errors.vatCategoryId && (
            <div className="invalid-feedback d-block">{errors.vatCategoryId.message}</div>
          )}
        </FormGroup>
      </Col>
    );
  };

  const getVatListByIds = vatIds => {
    let array = [];

    vat_list.map(row => {
      vatIds.map(id => {
        if (row.id === id) {
          array.push(row);
        }
      });
    });
    if (vatIds[0] === 10) {
      array.push({
        id: 10,
        vat: 0,
        name: 'N/A',
      });
    }

    return array;
  };

  const values = watch();

  return loading == true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
    <div>
      <div className="create-expense-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fab fa-stack-exchange" />
                        <span className="ml-2">{strings.CreateExpense} </span>
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
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="expenseNumber">
                                  <span className="text-danger">* </span>
                                  {strings.ExpenseNumber}
                                </Label>
                                <Controller
                                  name="expenseNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="50"
                                      id="expenseNumber"
                                      placeholder={strings.Enter + ' Expense Number'}
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regExInvNum.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                        expenseValidationCheck(e.target.value);
                                      }}
                                      className={errors.expenseNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.expenseNumber && (
                                  <div className="invalid-feedback">
                                    {errors.expenseNumber.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="expenseCategoryId">
                                  <span className="text-danger">* </span>
                                  {strings.ExpenseCategory}
                                </Label>
                                <Controller
                                  name="expenseCategory"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      options={
                                        expense_categories_list && expense_categories_list_Sorted
                                          ? expense_categories_list_Sorted
                                          : []
                                      }
                                      placeholder={strings.Select + strings.ExpenseCategory}
                                      id="expenseCategory"
                                      styles={selectStyles}
                                      onChange={option => {
                                        field.onChange(option);
                                        if (option && option.value === 34) {
                                          setValue('payee', {
                                            label: 'Company Expense',
                                            value: 'Company Expense',
                                          });
                                          setValue('taxTreatmentId', '');
                                          setValue('vatCategoryId', '');
                                          setValue('placeOfSupplyId', '');
                                          setShowPlacelist(false);
                                        }
                                      }}
                                      className={errors.expenseCategory ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.expenseCategory && (
                                  <div className="invalid-feedback d-block">
                                    {errors.expenseCategory.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="expense_date">
                                  <span className="text-danger">* </span>
                                  {strings.ExpenseDate}
                                </Label>
                                <Controller
                                  name="expenseDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      id="date"
                                      className={`form-control ${
                                        errors.expenseDate ? 'is-invalid' : ''
                                      }`}
                                      placeholderText={strings.ExpenseDate}
                                      selected={field.value}
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode="select"
                                      dateFormat="dd-MM-yyyy"
                                      onChange={value => {
                                        if (
                                          (expenseDateForVatValidation <
                                            companyVATRegistrationDate &&
                                            value > companyVATRegistrationDate) ||
                                          (value < companyVATRegistrationDate &&
                                            expenseDateForVatValidation >
                                              companyVATRegistrationDate)
                                        ) {
                                          setValue('vatCategoryId', '');
                                        }
                                        setExpenseDateForVatValidation(value);
                                        field.onChange(value);
                                      }}
                                    />
                                  )}
                                />
                                {errors.expenseDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.expenseDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            {isRegisteredVat &&
                              values.expenseCategory &&
                              (values?.expenseCategory?.value
                                ? values?.expenseCategory?.value !== 34
                                : values?.expenseCategory !== 34) && (
                                <Col lg={3}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="taxTreatmentId">
                                      <span className="text-danger">* </span>
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
                                                  'Tax Treatment'
                                                )
                                              : []
                                          }
                                          id="taxTreatmentId"
                                          placeholder={strings.Select + strings.TaxTreatment}
                                          styles={selectStyles}
                                          onChange={option => {
                                            field.onChange(option);
                                            if (option && option.value) {
                                              setValue('placeOfSupplyId', '');
                                              setValue('vatCategoryId', '');
                                              placelistSetting(option);
                                              ReverseChargeSetting(option.value);
                                              setIsReverseChargeEnabled(false);
                                              setExclusiveVat(true);
                                              setTaxTreatmentId(option.value);
                                            }
                                          }}
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
                            {showPlacelist == true &&
                              values.expenseCategory &&
                              (values?.expenseCategory?.value
                                ? values?.expenseCategory?.value !== 34
                                : values?.expenseCategory !== 34) && (
                                <Col lg={3}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="placeOfSupplyId">
                                      <span className="text-danger">*</span>
                                      {strings.PlaceofSupply}
                                    </Label>
                                    <Controller
                                      name="placeOfSupplyId"
                                      control={control}
                                      render={({ field }) => (
                                        <Select
                                          {...field}
                                          isDisabled={lockPlacelist}
                                          id="placeOfSupplyId"
                                          placeholder={strings.Select + strings.PlaceofSupply}
                                          options={
                                            placelist
                                              ? selectOptionsFactory.renderOptions(
                                                  'label',
                                                  'value',
                                                  placelist,
                                                  'Place Of Supply'
                                                )
                                              : []
                                          }
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
                                </Col>
                              )}
                            {isRegisteredVat &&
                              values.expenseCategory &&
                              (values?.expenseCategory?.value
                                ? values?.expenseCategory?.value !== 34
                                : values?.expenseCategory !== 34) && (
                                <Col className="mb-2" lg={3}>
                                  <Label htmlFor="inline-radio3">
                                    <span className="text-danger">* </span>
                                    {strings.ExpenseType}
                                  </Label>
                                  <div style={{ display: 'flex' }}>
                                    {isVatClaimable === false ? (
                                      <span style={{ color: '#0069d9' }} className="mr-4">
                                        <b>{strings.NonClaimable}</b>
                                      </span>
                                    ) : (
                                      <span className="mr-4">{strings.NonClaimable}</span>
                                    )}

                                    <Switch
                                      checked={isVatClaimable}
                                      onChange={expenseTypeValue => {
                                        setExpenseType(expenseTypeValue);
                                        setIsVatClaimable(!isVatClaimable);
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
                                      className="react-switch"
                                    />
                                    {isVatClaimable === true ? (
                                      <span style={{ color: '#0069d9' }} className="ml-4">
                                        <b>{strings.Claimable}</b>
                                      </span>
                                    ) : (
                                      <span className="ml-4">{strings.Claimable}</span>
                                    )}
                                  </div>
                                </Col>
                              )}

                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="payee">
                                  <span className="text-danger">* </span>
                                  {strings.PaidBy}
                                </Label>
                                <Controller
                                  name="payee"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      isDisabled={
                                        values?.expenseCategory?.value === 34 ||
                                        values?.expenseCategory === 34
                                      }
                                      options={
                                        pay_to_list
                                          ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              pay_to_list,
                                              'Payee'
                                            )
                                          : []
                                      }
                                      placeholder={strings.Select + strings.Payee}
                                      id="payee"
                                      styles={selectStyles}
                                      className={errors.payee ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.payee && (
                                  <div className="invalid-feedback d-block">
                                    {errors.payee.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="expenseAmount">
                                  <span className="text-danger">* </span>
                                  {strings.Amount}
                                </Label>
                                <Controller
                                  name="expenseAmount"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      min="0"
                                      maxLength="14,2"
                                      id="expenseAmount"
                                      placeholder={'Enter' + ' ' + strings.Amount}
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regDecimal.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={errors.expenseAmount ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.expenseAmount && (
                                  <div className="invalid-feedback">
                                    {errors.expenseAmount.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            {isRegisteredVat &&
                              values.expenseCategory &&
                              (values?.expenseCategory?.value
                                ? values?.expenseCategory?.value !== 34
                                : values?.expenseCategory !== 34) &&
                              renderVat()}
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
                                      id="currencyCode"
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
                                      placeholder={strings.Select + strings.Currency}
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
                                              .find(obj => obj.value === field.value)
                                      }
                                      onChange={option => {
                                        field.onChange(option);
                                        if (option.value != '') {
                                          setExchange(option.value);
                                          setCurrency(option.value);
                                        }
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
                            {(values?.payee?.value === 'Company Expense' ||
                              values?.payee === 'Company Expense') && (
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="payMode">
                                    <span className="text-danger">* </span> {strings.PayThrough}
                                  </Label>
                                  <Controller
                                    name="payMode"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        options={
                                          pay_mode_list
                                            ? selectOptionsFactory.renderOptions(
                                                'label',
                                                'value',
                                                pay_mode_list,
                                                'Pay Through'
                                              )
                                            : []
                                        }
                                        placeholder={strings.Select + strings.PayThrough}
                                        id="payMode"
                                        styles={selectStyles}
                                        className={errors.payMode ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.payMode && (
                                    <div className="invalid-feedback d-block">
                                      {errors.payMode.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            )}
                          </Row>

                          {values.vatCategoryId !== '' &&
                            values.vatCategoryId?.label !== 'Select VAT' &&
                            values.expenseCategory &&
                            (values?.expenseCategory?.value
                              ? values?.expenseCategory?.value !== 34
                              : values?.expenseCategory !== 34) &&
                            values.vatCategoryId?.value === 1 && (
                              <Row>
                                <Col></Col>
                                <Col>
                                  <FormGroup>
                                    <span className="mr-4">{strings.ExclusiveVAT}</span>
                                    <Switch
                                      checked={!exclusiveVat}
                                      onChange={checked => {
                                        setExclusiveVat(!checked);
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
                                    <span className="ml-4">{strings.InclusiveVAT}</span>
                                  </FormGroup>
                                </Col>
                                <Col></Col>
                                <Col></Col>
                              </Row>
                            )}
                          <Row>
                            {isRegisteredVat &&
                              values.expenseCategory &&
                              (values?.expenseCategory?.value
                                ? values?.expenseCategory?.value !== 34
                                : values?.expenseCategory !== 34) &&
                              ((isDesignatedZone &&
                                (taxTreatmentId === 5 ||
                                  taxTreatmentId === 6 ||
                                  taxTreatmentId === 7)) ||
                                (!isDesignatedZone &&
                                  taxTreatmentId !== 3 &&
                                  taxTreatmentId !== 8)) && (
                                <Col className="flex items-center">
                                  <Checkbox
                                    id="isReverseChargeEnabled"
                                    checked={isReverseChargeEnabled}
                                    onCheckedChange={checked => {
                                      setIsReverseChargeEnabled(checked);
                                      setExclusiveVat(true);
                                      setValue('vatCategoryId', '');
                                    }}
                                  />
                                  <Label htmlFor="isReverseChargeEnabled" className="ml-2 mb-0">
                                    {strings.IsReverseCharge}
                                  </Label>
                                </Col>
                              )}
                          </Row>
                          <hr />
                          <Row style={{ display: values.exchangeRate === 1 ? 'none' : '' }}>
                            <Col>
                              <Label>{strings.CurrencyExchangeRate}</Label>
                            </Col>
                          </Row>
                          <Row style={{ display: values.exchangeRate === 1 ? 'none' : '' }}>
                            <Col lg={1}>
                              <Input disabled id="1" name="1" value={1} />
                            </Col>
                            <Col lg={2}>
                              <FormGroup className="mb-3">
                                <div>
                                  <Controller
                                    name="currencyName"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        disabled
                                        className="form-control"
                                        id="currencyName"
                                        {...field}
                                      />
                                    )}
                                  />
                                </div>
                              </FormGroup>
                            </Col>
                            <FormGroup className="mt-2">
                              <label>
                                <b>=</b>
                              </label>{' '}
                            </FormGroup>
                            <Col lg={2}>
                              <FormGroup className="mb-3">
                                <div>
                                  <Controller
                                    name="exchangeRate"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        id="exchangeRate"
                                        maxLength="20"
                                        {...field}
                                      />
                                    )}
                                  />
                                </div>
                              </FormGroup>
                            </Col>

                            <Col lg={2}>
                              <Input
                                disabled
                                id="currencyName"
                                name="currencyName"
                                value={basecurrency.currencyName}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={8}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="expenseDescription">{strings.Description}</Label>
                                <Controller
                                  name="expenseDescription"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="textarea"
                                      maxLength="250"
                                      id="expenseDescription"
                                      rows="5"
                                      placeholder={'Enter' + ' ' + strings.Description}
                                      {...field}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={8}>
                              <Row>
                                <Col lg={6}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="receiptNumber">{strings.ReferenceNumber}</Label>
                                    <Controller
                                      name="receiptNumber"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          type="text"
                                          maxLength="20"
                                          id="receiptNumber"
                                          placeholder={strings.ReceiptNumber}
                                          {...field}
                                          className={errors.receiptNumber ? 'is-invalid' : ' '}
                                        />
                                      )}
                                    />
                                    {errors.receiptNumber && (
                                      <div className="invalid-feedback">
                                        {errors.receiptNumber.message}
                                      </div>
                                    )}
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col lg={12} className="mt-5">
                              <FormGroup className="text-right">
                                <Button
                                  type="submit"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={disabled}
                                  onClick={() => {
                                    setCreateMore(false);
                                  }}
                                >
                                  <i className="fa fa-dot-circle-o"></i>{' '}
                                  {disabled ? 'Creating...' : strings.Create}
                                </Button>
                                {location.state && location.state.parentId ? (
                                  ''
                                ) : (
                                  <Button
                                    type="submit"
                                    color="primary"
                                    className="btn-square mr-3"
                                    disabled={disabled}
                                    onClick={() => {
                                      setCreateMore(true);
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
                                        expenseId: location?.state?.renderID,
                                      });
                                    } else history.push('/admin/expense/expense');
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateExpense);
