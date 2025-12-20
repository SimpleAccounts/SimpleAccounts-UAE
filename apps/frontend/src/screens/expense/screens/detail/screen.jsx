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
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDeleteModal } from 'components';
import { ViewExpenseDetails } from './sections';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import * as ExpenseDetailsAction from './actions';
import * as ExpenseActions from '../../actions';
import { CommonActions } from 'services/global';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import * as ExpenseCreateActions from '../create/actions';
import dayjs from '@/utils/date';
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
    expense_detail: state.expense.expense_detail,
    currency_list: state.expense.currency_list,
    vat_list: state.expense.vat_list,
    expense_categories_list_Sorted: expenseCategoryList,
    expense_categories_list: state.expense.expense_categories_list,
    bank_list: state.expense.bank_list,
    pay_mode_list: state.expense.pay_mode_list,
    user_list: state.expense.user_list,
    currency_convert_list: state.common.currency_convert_list,
    pay_to_list: state.expense.pay_to_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    expenseDetailActions: bindActionCreators(ExpenseDetailsAction, dispatch),
    expenseCreateActions: bindActionCreators(ExpenseCreateActions, dispatch),
    expenseActions: bindActionCreators(ExpenseActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const detailExpenseSchema = z.object({
  expenseNumber: z.string().min(1, 'Expense number is required'),
  expenseCategory: z.union([
    z.object({
      value: z.number(),
      label: z.string(),
    }),
    z.number()
  ]).refine(val => val !== null && val !== '', 'Expense category is required'),
  expenseDate: z.date({ required_error: 'Expense date is required' }),
  currency: z.union([
    z.number(),
    z.object({
      value: z.number(),
      label: z.string(),
    })
  ]).refine(val => val !== null && val !== '', 'Currency is required'),
  payee: z.union([
    z.object({
      value: z.string(),
      label: z.string(),
    }),
    z.string()
  ]).refine(val => val !== null && val !== '', 'Paid by is required'),
  expenseAmount: z.string()
    .min(1, 'Amount is required')
    .regex(/^[0-9][0-9]*[.]?[0-9]{0,2}$$/, 'Enter a valid amount')
    .refine(val => parseFloat(val) > 0, 'Expense amount should be greater than 0'),
  placeOfSupplyId: z.any().optional(),
  exchangeRate: z.any().optional(),
  expenseDescription: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptAttachmentDescription: z.string().optional(),
  notes: z.string().optional(),
  vatCategoryId: z.any().optional(),
  bankAccountId: z.any().optional(),
  payMode: z.any().optional(),
  taxTreatmentId: z.any().optional(),
  curreancyname: z.string().optional(),
  attachmentFile: z.any().optional(),
});

const DetailExpense = ({
  expenseDetailActions,
  expenseCreateActions,
  expenseActions,
  commonActions,
  currencyConvertActions,
  expense_categories_list,
  expense_categories_list_Sorted,
  pay_mode_list,
  pay_to_list,
  currency_convert_list,
  vat_list,
  history,
  location,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [view, setView] = useState(false);
  const [basecurrency, setBasecurrency] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [exclusiveVat, setExclusiveVat] = useState(true);
  const [expenseType, setExpenseType] = useState(true);
  const [isVatClaimable, setIsVatClaimable] = useState(false);
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
  const [taxTreatmentId, setTaxTreatmentId] = useState(1);
  const [showReverseCharge, setShowReverseCharge] = useState(false);
  const [lockPlacelist, setLockPlacelist] = useState(false);
  const [isDesignatedZone, setIsDesignatedZone] = useState(true);
  const [curreancyname, setCurreancyname] = useState('');
  const [expenseDateForVatValidation, setExpenseDateForVatValidation] = useState(new Date());
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyVATRegistrationDate, setCompanyVATRegistrationDate] = useState(new Date());
  const [exchangeRate, setExchangeRate] = useState('');
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
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [userStateName, setUserStateName] = useState('');

  const uploadFile = useRef(null);

  const placelistRef = [
    { label: 'Abu Dhabi', value: '1' },
    { label: 'Dubai', value: '2' },
    { label: 'Sharjah', value: '3' },
    { label: 'Ajman', value: '4' },
    { label: 'Umm Al Quwain', value: '5' },
    { label: 'Ras Al-Khaimah', value: '6' },
    { label: 'Fujairah', value: '7' },
  ];

  const file_size = 1024000;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

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
    resolver: zodResolver(detailExpenseSchema),
    defaultValues: {
      curreancyname: '',
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = form;

  strings.setLanguage(language);

  useEffect(() => {
    getcurentCompanyUser();
    getTaxTreatmentList();
    initializeData();
  }, []);

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

  const initializeData = () => {
    if (location.state && location.state.expenseId) {
      expenseActions.getVatList();
      expenseDetailActions
        .getExpenseDetail(location.state.expenseId)
        .then(res => {
          if (res.status === 200) {
            getCompanyCurrency();
            expenseActions.getExpenseCategoriesList();
            expenseActions.getBankList();
            expenseActions.getPaymentMode();
            expenseActions.getUserForDropdown();
            expenseCreateActions.getPaytoList();

            let vatCategoryId = vat_list
              ? selectOptionsFactory
                  .renderOptions('name', 'id', vat_list, 'Tax')
                  .find(option => option.value === +res.data.vatCategoryId)
              : '';
            if (res.data.vatCategoryId === 10 || !res.data.vatCategoryId) {
              vatCategoryId = {};
              vatCategoryId.label = 'N/A';
              vatCategoryId.value = '10';
            }

            const expenseData = {
              expenseNumber: res.data.expenseNumber,
              payee: res.data.payee ? res.data.payee : '',
              expenseDate: res.data.expenseDate ? new Date(res.data.expenseDate) : '',
              currency: res.data.currencyCode ? res.data.currencyCode : '',
              currencyName: res.data.currencyName ? res.data.currencyName : '',
              expenseCategory: res.data.expenseCategory ? res.data.expenseCategory : '',
              expenseAmount: res.data.expenseAmount,
              vatCategoryId: vatCategoryId,
              payMode: res.data.payMode ? res.data.payMode : '',
              bankAccountId: res.data.bankAccountId ? res.data.bankAccountId : '',
              exclusiveVat:
                res.data.exclusiveVat && res.data.exclusiveVat != null
                  ? res.data.exclusiveVat
                  : '',
              exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
              expenseDescription: res.data.expenseDescription,
              receiptNumber: res.data.receiptNumber,
              attachmentFile: res.data.attachmentFile,
              receiptAttachmentDescription: res.data.receiptAttachmentDescription,
              fileName: res.data.fileName ? res.data.fileName : '',
              filePath: res.data.receiptAttachmentPath ? res.data.receiptAttachmentPath : '',
              isReverseChargeEnabled: res.data.isReverseChargeEnabled
                ? res.data.isReverseChargeEnabled
                : false,
              placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
              taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
              notes: res.data.delivaryNotes,
            };

            reset(expenseData);

            setExchangeRate(res?.data?.exchangeRate ? res.data.exchangeRate : '');
            setExpenseType(res.data.expenseType ? true : false);
            setIsVatClaimable(res.data.expenseType ? res.data.expenseType : false);
            setShowPlacelist(res.data.taxTreatmentId && res.data.taxTreatmentId !== 8 ? true : false);
            setLockPlacelist(res.data.taxTreatmentId === 7 ? true : false);
            setTaxTreatmentId(res.data.taxTreatmentId ? res.data.taxTreatmentId : '');
            setIsReverseChargeEnabled(
              res.data.isReverseChargeEnabled ? res.data.isReverseChargeEnabled : false
            );
            setExclusiveVat(res.data.exclusiveVat === true ? true : false);
            setExpenseDateForVatValidation(new Date(res.data.expenseDate));
            setView(location.state && location.state.view ? true : false);
            setLoading(false);
            setCurrentExpenseId(location.state.expenseId);

            let currency = selectCurrencyFactory
              .renderOptions('currencyName', 'currencyCode', currency_convert_list, 'Currency')
              .find(option => option.value === res.data.currencyCode);
            setExchangeFunc(currency && currency.value);
            setCurrencyFunc(currency && currency.value);
          }
        })
        .catch(err => {
          setLoading(false);
        });
    } else {
      history.push('/admin/expense/expense');
    }
  };

  const onSubmit = data => {
    setDisabled(true);
    setDisableLeavePage(true);

    const {
      expenseNumber,
      payee,
      expenseDate,
      currency,
      expenseCategory,
      expenseAmount,
      expenseDescription,
      exchangeRate,
      receiptNumber,
      receiptAttachmentDescription,
      DeliveryNotes,
      vatCategoryId,
      payMode,
      bankAccountId,
      placeOfSupplyId,
      taxTreatmentId,
      notes,
    } = data;

    let formData = new FormData();
    formData.append('expenseType', expenseType);
    formData.append('isVatClaimable', isVatClaimable);
    formData.append('delivaryNotes', notes);
    formData.append('expenseNumber', expenseNumber);
    formData.append('expenseId', currentExpenseId);
    formData.append('payee', payee ? payee.value : '');
    formData.append('expenseDate', expenseDate !== null ? dayjs(expenseDate) : '');
    formData.append('expenseDescription', expenseDescription);
    formData.append('receiptNumber', receiptNumber);
    formData.append('receiptAttachmentDescription', receiptAttachmentDescription);
    formData.append('delieryNote', DeliveryNotes);
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
    if (exchangeRate) {
      formData.append('exchangeRate', exchangeRate);
    }
    if (currency && currency.value) {
      formData.append('currencyCode', currency.value);
    }
    if (vatCategoryId) {
      formData.append('vatCategoryId', vatCategoryId.value ? vatCategoryId.value : vatCategoryId);

      if (exclusiveVat !== undefined) {
        formData.append('exclusiveVat', exclusiveVat);
      }
    }
    if (bankAccountId && bankAccountId.value && payMode === 'BANK') {
      formData.append('bankAccountId', bankAccountId.value);
    }
    if (uploadFile?.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFile?.current?.files?.[0]);
    }
    if (placeOfSupplyId) {
      formData.append(
        'placeOfSupplyId',
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }

    if (taxTreatmentId) {
      formData.append(
        'taxTreatmentId',
        taxTreatmentId.value ? taxTreatmentId.value : taxTreatmentId
      );
    }
    formData.append('isReverseChargeEnabled', isReverseChargeEnabled);
    setLoading(true);
    setLoadingMsg('Updating Expense...');
    expenseDetailActions
      .updateExpense(formData)
      .then(res => {
        setDisabled(false);
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Expense Updated Successfully'
          );
          history.push('/admin/expense/expense');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Expense Updated Unsuccessfully'
        );
        setLoading(false);
      });
  };

  const deleteExpense = () => {
    const message1 = (
      <text>
        <b>Delete Expense?</b>
      </text>
    );
    const message = 'This Expense will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeExpense}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const setExchangeFunc = value => {
    if (currency_convert_list) {
      let result = currency_convert_list.filter(obj => {
        return obj.currencyCode === value;
      });
      if (result && result[0] && result[0].exchangeRate) {
        setExchangeRate(result[0].exchangeRate);
        setValue('exchangeRate', result[0].exchangeRate);
      }
    }
  };

  const setCurrencyFunc = value => {
    if (currency_convert_list) {
      let result = currency_convert_list.filter(obj => {
        return obj.currencyCode === value;
      });
      if (result[0] && result[0].currencyName) {
        setCurreancyname(result[0].currencyName);
        setValue('curreancyname', result[0].currencyName);
      }
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

  const removeExpense = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Expense...');
    expenseDetailActions
      .deleteExpense(currentExpenseId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Expense Deleted Successfully'
          );
          history.push('/admin/expense/expense');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Expense Deleted Unsuccessfully'
        );
        setDisabled1(false);
        setLoading(false);
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const editDetails = () => {
    setView(false);
  };

  const getcurentCompanyUser = () => {
    expenseCreateActions
      .checkAuthStatus()
      .then(response => {
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
      })
      .catch(err => {
        console.log(err);
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
      let placeOfSupplyId = placelistRef.find(option => option.label === userStateName);
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

  const renderVat = () => {
    const values = getValues();
    let vat_list_filtered = [];
    let vatIds = [];
    if (isRegisteredVat && expenseDateForVatValidation > companyVATRegistrationDate) {
      if (isDesignatedZone && isDesignatedZone != null && isDesignatedZone === true) {
        switch (
          values.taxTreatmentId && values.taxTreatmentId.value
            ? values.taxTreatmentId.value
            : ''
        ) {
          case 1:
          case 3:
            if (isReverseChargeEnabled === false) vatIds = [1, 2, 3];

            break;

          case 2:
          case 4:
          case 8:
            if (isReverseChargeEnabled === false) vatIds = [4];

            break;

          case 5:
          case 6:
          case 7:
            if (isReverseChargeEnabled === false) vatIds = [3];
            else if (isReverseChargeEnabled === true) vatIds = [1, 2];
            break;

          default:
            break;
        }
      } else if (isDesignatedZone === false)
        switch (
          values.taxTreatmentId && values.taxTreatmentId.value
            ? values.taxTreatmentId.value
            : ''
        ) {
          case 1:
            if (isReverseChargeEnabled === false) vatIds = [1, 2, 3];
            else if (isReverseChargeEnabled === true) vatIds = [1, 2];
            break;

          case 3:
            if (isReverseChargeEnabled === false) vatIds = [1, 2, 3];

            break;

          case 2:
          case 4:
          case 5:
          case 6:
          case 7:
            if (isReverseChargeEnabled === false) vatIds = [3];
            else if (isReverseChargeEnabled === true) vatIds = [1, 2];
            break;

          case 8:
            if (isReverseChargeEnabled === false) vatIds = [4];
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
                    ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'VAT')
                    : []
                }
                placeholder={strings.Select + strings.VAT}
                id="vatCategoryId"
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

  return loading === true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
    <div>
      <div className="detail-expense-screen">
        <div className="animated fadeIn">
          {dialog}
          {loading ? (
            <Loader />
          ) : view ? (
            <ViewExpenseDetails initialVals={getValues()} editDetails={() => editDetails()} />
          ) : (
            <Row>
              <Col lg={12} className="mx-auto">
                <Card>
                  <CardHeader>
                    <Row>
                      <Col lg={12}>
                        <div className="h4 mb-0 d-flex align-items-center">
                          <i className="fab fa-stack-exchange" />
                          <span className="ml-2">{strings.UpdateExpense} </span>
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
                                        maxLength="100"
                                        id="expenseNumber"
                                        placeholder={strings.Enter + ' Expense Number'}
                                        disabled
                                        {...field}
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
                                        id="expenseCategory"
                                        options={
                                          expense_categories_list && expense_categories_list_Sorted
                                            ? expense_categories_list_Sorted
                                            : []
                                        }
                                        value={
                                          expense_categories_list &&
                                          selectOptionsFactory
                                            .renderOptions(
                                              'transactionCategoryName',
                                              'transactionCategoryId',
                                              expense_categories_list,
                                              'Expense Category'
                                            )
                                            .find(option => option.value === +field.value)
                                        }
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
                                        styles={selectStyles}
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
                                        value={
                                          field.value
                                            ? dayjs(field.value).format('DD-MM-YYYY')
                                            : ''
                                        }
                                        selected={
                                          field.value
                                            ? new Date(dayjs(field.value).format('MM DD YYYY'))
                                            : ''
                                        }
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
                                            value={
                                              taxTreatmentList &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  'name',
                                                  'id',
                                                  taxTreatmentList,
                                                  'Tax Treatment'
                                                )
                                                .find(option => option.value === +field.value)
                                            }
                                            onChange={option => {
                                              field.onChange(option);
                                              if (option && option.value) {
                                                setValue('placeOfSupplyId', '');
                                                setValue('vatCategoryId', '');
                                                placelistSetting(option);
                                                setIsReverseChargeEnabled(false);
                                                setExclusiveVat(true);
                                                setTaxTreatmentId(option.value);
                                              } else {
                                                setTaxTreatmentId('');
                                              }
                                            }}
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
                              {showPlacelist === true &&
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
                                                    'Place of Supply'
                                                  )
                                                : []
                                            }
                                            value={
                                              placelistRef &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  'label',
                                                  'value',
                                                  placelistRef,
                                                  'Place of Supply'
                                                )
                                                .find(
                                                  option => option.value === field.value.toString()
                                                )
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
                                        value={
                                          field.value?.value
                                            ? field.value
                                            : pay_to_list &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  'label',
                                                  'value',
                                                  pay_to_list,
                                                  'Payee'
                                                )
                                                .find(option => option.label === field.value)
                                        }
                                        onChange={option => {
                                          field.onChange(option);
                                          if (option && option.value === 'Company Expense')
                                            setValue('payMode', {
                                              label: 'Petty Cash',
                                              value: 'CASH',
                                            });
                                        }}
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
                                        placeholder={strings.Amount}
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
                                (values?.expenseCategory?.value
                                  ? values?.expenseCategory?.value !== 34
                                  : values?.expenseCategory !== 34) &&
                                renderVat()}
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
                                        id="currency"
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
                                        onChange={option => {
                                          if (option.value != '') {
                                            field.onChange(option);
                                            setExchangeFunc(option.value);
                                            setCurrencyFunc(option.value);
                                          }
                                        }}
                                        styles={selectStyles}
                                        className={errors.currency ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.currency && (
                                    <div className="invalid-feedback d-block">
                                      {errors.currency.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              {(values?.payee?.value === 'Company Expense' ||
                                values?.payee === 'Company Expense') && (
                                <Col lg={3}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="payMode">
                                      <span className="text-danger">* </span>
                                      {strings.PayThrough}
                                    </Label>
                                    <Controller
                                      name="payMode"
                                      control={control}
                                      render={({ field }) => (
                                        <Select
                                          {...field}
                                          id="payMode"
                                          placeholder={strings.Select + strings.PayThrough}
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
                                          value={
                                            pay_mode_list &&
                                            pay_mode_list.find(
                                              option => option.value === field.value
                                            )
                                          }
                                          onChange={option => {
                                            field.onChange(option.value);
                                          }}
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
                                taxTreatmentId &&
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
                                      onCheckedChange={(checked) => {
                                        setIsReverseChargeEnabled(checked);
                                        setExclusiveVat(true);
                                        setValue('vatCategoryId', '');
                                      }}
                                    />
                                    <Label htmlFor="isReverseChargeEnabled" className="ml-2 mb-0">{strings.IsReverseCharge}</Label>
                                  </Col>
                                )}
                            </Row>
                            <hr />
                            {values.exchangeRate !== 1 && (
                              <Row>
                                <Col>
                                  <Label htmlFor="currency">
                                    {strings.CurrencyExchangeRate}
                                  </Label>
                                </Col>
                              </Row>
                            )}
                            {values.exchangeRate !== 1 && (
                              <Row>
                                <Col lg={1}>
                                  <Input disabled id="1" name="1" value={1} />
                                </Col>
                                <Col lg={2}>
                                  <FormGroup className="mb-3">
                                    <div>
                                      <Controller
                                        name="curreancyname"
                                        control={control}
                                        render={({ field }) => (
                                          <Input
                                            disabled
                                            className="form-control"
                                            id="curreancyname"
                                            {...field}
                                            value={field.value ? field.value : curreancyname}
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
                                            type="text"
                                            className="form-control"
                                            id="exchangeRate"
                                            maxLength="20"
                                            {...field}
                                            onChange={e => {
                                              if (
                                                e.target.value === '' ||
                                                regDecimal.test(e.target.value)
                                              ) {
                                                field.onChange(e);
                                              }
                                            }}
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
                            )}
                            <Row>
                              <Col lg={8}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="expenseDescription">
                                    {strings.Description}
                                  </Label>
                                  <Controller
                                    name="expenseDescription"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        type="textarea"
                                        maxLength="250"
                                        id="expenseDescription"
                                        rows="5"
                                        placeholder={strings.Expense + ' ' + strings.Description}
                                        {...field}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col lg={8}>
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
                              <Col
                                lg={12}
                                className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                              >
                                <FormGroup>
                                  <Button
                                    type="button"
                                    name="button"
                                    color="danger"
                                    className="btn-square"
                                    disabled={disabled1}
                                    onClick={deleteExpense}
                                  >
                                    <i className="fa fa-trash"></i>{' '}
                                    {disabled1 ? 'Deleting...' : strings.Delete}
                                  </Button>
                                </FormGroup>
                                <FormGroup className="text-right">
                                  <Button
                                    type="submit"
                                    name="submit"
                                    color="primary"
                                    className="btn-square mr-3"
                                    disabled={disabled}
                                  >
                                    <i className="fa fa-dot-circle-o"></i>{' '}
                                    {disabled ? 'Updating...' : strings.Update}
                                  </Button>
                                  <Button
                                    type="button"
                                    name="button"
                                    color="secondary"
                                    className="btn-square"
                                    onClick={() => {
                                      if (location?.state?.renderURL) {
                                        history.push(`${location?.state?.renderURL}`, {
                                          expenseId: location?.state?.expenseId,
                                        });
                                      } else history.push('/admin/expense/expense');
                                    }}
                                  >
                                    <i className="fa fa-ban"></i>{' '}
                                    {disabled1 ? 'Deleting...' : strings.Cancel}
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
          )}
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailExpense);
