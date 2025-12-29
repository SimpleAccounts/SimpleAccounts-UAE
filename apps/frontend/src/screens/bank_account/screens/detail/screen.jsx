import { useState, useEffect, useCallback } from 'react';
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
import dayjs from '@/utils/date';
import { Loader, ConfirmDeleteModal, LeavePage } from 'components';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import { CommonActions } from 'services/global';
import * as detailBankAccountActions from './actions';
import * as BankAccountActions from '../../actions';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Landmark, Trash2, CircleDot, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailBankAccountSchema = z
  .object({
    account_name: z
      .string()
      .min(1, 'Account name is required')
      .min(2, 'Account name is too short!')
      .max(30, 'Account name is too long!'),
    currency: z.number({
      required_error: 'Currency is required',
      invalid_type_error: 'Currency is required',
    }),
    opening_balance: z.string().min(1, 'Opening balance is required'),
    account_type: z.number({
      required_error: 'Account type is required',
      invalid_type_error: 'Account type is required',
    }),
    bank_name: z.union([
      z.object({
        value: z.number(),
        label: z.string(),
      }),
      z.string().min(1, 'Bank name is required'),
    ]),
    account_number: z
      .string()
      .min(1, 'Account number is required')
      .min(2, 'Account number is too short!')
      .max(25, 'Account number is too long!'),
    account_is_for: z.string().min(1, 'Account for is required'),
    countryId: z.number().optional(),
    ifsc_code: z.string().optional(),
    swift_code: z.string().optional(),
    openingDate: z.string().optional(),
    transactionCount: z.number().optional(),
    newBankName: z.string().optional(),
  })
  .refine(
    data => {
      if (typeof data.bank_name === 'object' && data.bank_name?.value === 999) {
        return data.newBankName && data.newBankName.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Bank Name is Required',
      path: ['newBankName'],
    }
  );

const mapStateToProps = state => {
  return {
    account_type_list: state.bank_account.account_type_list,
    currency_list: state.bank_account.currency_list,
    country_list: state.bank_account.country_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    bankAccountActions: bindActionCreators(BankAccountActions, dispatch),
    detailBankAccountActions: bindActionCreators(detailBankAccountActions, dispatch),
  };
};

const regExAlpha = /^[a-zA-Z ]+$/;
const regEx = /^\d+$/;

const account_for = [
  { label: 'Personal', value: 'P' },
  { label: 'Corporate', value: 'C' },
];

const DetailBankAccount = ({
  account_type_list,
  currency_list,
  country_list,
  commonActions,
  bankAccountActions,
  detailBankAccountActions,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabledDate, setDisabledDate] = useState(true);
  const [disabled1, setDisabled1] = useState(false);
  const [currentBankAccountId, setCurrentBankAccountId] = useState(null);
  const [currentBankAccount, setCurrentBankAccount] = useState(null);
  const [exist, setExist] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);

  const form = useForm({
    resolver: zodResolver(detailBankAccountSchema),
    defaultValues: {
      account_name: '',
      currency: '',
      opening_balance: '',
      account_type: '',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      swift_code: '',
      countryId: '',
      account_is_for: '',
      openingDate: '',
      transactionCount: 0,
      newBankName: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    watch,
  } = form;

  const bankNameValue = watch('bank_name');

  useEffect(() => {
    if (location.state && location.state.bankAccountId) {
      const bankAccountId = location.state.bankAccountId;
      initializeData();

      detailBankAccountActions.getTransactionsCountByBankId(bankAccountId).then(res => {
        if (res.status === 200) {
          if (res.data === 0) {
            setDisabledDate(false);
          }
        }
      });

      updateOpeningBalance(bankAccountId);
      setCurrentBankAccountId(bankAccountId);

      detailBankAccountActions
        .getBankAccountByID(bankAccountId)
        .then(res => {
          setCurrentBankAccount(res);
          reset({
            account_name: res.bankAccountName,
            currency: res.bankAccountCurrency ? res.bankAccountCurrency : '',
            opening_balance: res.openingBalance,
            account_type: res.bankAccountType ? res.bankAccountType : '',
            bank_name: res.bankName,
            account_number: res.accountNumber,
            ifsc_code: res.ifscCode,
            swift_code: res.swiftCode,
            countryId: res.bankCountry ? res.bankCountry : '',
            account_is_for: res.personalCorporateAccountInd ? res.personalCorporateAccountInd : '',
            openingDate: dayjs(res.openingDate).format('DD-MM-YYYY'),
            transactionCount: res.transactionCount,
            newBankName: '',
          });
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          history.push('/admin/banking/bank-account');
        });
    } else {
      history.push('/admin/banking/bank-account');
    }
  }, [location.state, history]);

  const initializeData = useCallback(() => {
    detailBankAccountActions.getAccountTypeList();
    detailBankAccountActions.getCurrencyList();
    detailBankAccountActions.getCountryList();
    detailBankAccountActions.getBankList().then(response => {
      setBankList(response.data);
    });
  }, [detailBankAccountActions]);

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 17,
        name: value,
        checkId: currentBankAccountId,
      };
      detailBankAccountActions.checkValidation(data).then(response => {
        if (response.data === 'Bank Account Already Exists') {
          setExist(true);
          setError('account_number', {
            type: 'manual',
            message: 'Account number already exists',
          });
        } else {
          setExist(false);
          clearErrors('account_number');
        }
      });
    },
    [currentBankAccountId, detailBankAccountActions, setError, clearErrors]
  );

  const updateOpeningBalance = useCallback(
    id => {
      bankAccountActions
        .getExplainCount(id)
        .then(res => {
          setTransactionCount(res.data);
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    },
    [bankAccountActions, commonActions]
  );

  const onSubmit = data => {
    if (exist) {
      setError('account_number', {
        type: 'manual',
        message: 'Account number already exists',
      });
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const obj = {
      bankAccountId: currentBankAccountId,
      bankAccountName: data.account_name,
      bankAccountCurrency: data.currency,
      personalCorporateAccountInd: data.account_is_for,
      bankName: data.bank_name && data.bank_name.label ? data.bank_name.label : data.bank_name,
      accountNumber: data.account_number,
      ifscCode: data.ifsc_code,
      swiftCode: data.swift_code,
      openingBalance: data.opening_balance,
      bankCountry: data.countryId,
      bankAccountType: data.account_type,
      newBankName: data.newBankName,
    };

    setLoading(true);
    setLoadingMsg('Updating Bank Account Details...');

    detailBankAccountActions
      .updateBankAccount(obj)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Bank Account Details Updated Successfully'
          );
          history.push('/admin/banking/bank-account');
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Bank Account Details Updated Unsuccessfully'
        );
      });
  };

  const closeBankAccount = currentBankAccountId => {
    bankAccountActions
      .getExplainCount(currentBankAccountId)
      .then(res => {
        if (res.data > 0) {
          commonActions.tostifyAlert(
            'error',
            'You need to unexplain all the transaction to delete this bank'
          );
        } else {
          const message1 = (
            <text>
              <b>Delete Bank Account?</b>
            </text>
          );
          const message = 'This Bank Account will be deleted permanently and cannot be recovered.';
          setDialog(
            <ConfirmDeleteModal
              isOpen={true}
              okHandler={() => removeBankAccount(currentBankAccountId)}
              cancelHandler={removeDialog}
              message1={message1}
              message={message}
            />
          );
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const removeBankAccount = () => {
    setDisabled1(true);
    removeDialog();
    setLoading(true);
    setLoadingMsg('Deleting Bank Account ...');

    detailBankAccountActions
      .removeBankAccountByID(currentBankAccountId)
      .then(res => {
        setDisabled1(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Bank Account Deleted Successfully'
        );
        history.push('/admin/banking/bank-account');
      })
      .catch(err => {
        setDisabled1(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Bank Account Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="detail-bank-account-screen">
        <div className="animated fadeIn">
          {dialog}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <Landmark className="h-4 w-4" />
                    <span className="ml-2">
                      {strings.UpdateBankAccount}
                      {currentBankAccount ? ` - ${currentBankAccount.bankAccountName}` : ''}
                    </span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="account_name">
                            <span className="text-danger">* </span>
                            {strings.AccountName}
                          </Label>
                          <Controller
                            name="account_name"
                            control={control}
                            render={({ field }) => (
                              <Input
                                disabled
                                type="text"
                                maxLength="100"
                                id="account_name"
                                autoComplete="off"
                                placeholder={strings.Enter + strings.AccountName}
                                {...field}
                                onChange={e => {
                                  if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                                    field.onChange(e);
                                  }
                                }}
                                className={errors.account_name ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.account_name && (
                            <div className="invalid-feedback">{errors.account_name.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
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
                                id="currency"
                                isDisabled
                                options={
                                  currency_list
                                    ? selectCurrencyFactory.renderOptions(
                                        'currencyName',
                                        'currencyCode',
                                        currency_list,
                                        'Currency'
                                      )
                                    : []
                                }
                                value={
                                  currency_list &&
                                  selectCurrencyFactory
                                    .renderOptions(
                                      'currencyName',
                                      'currencyCode',
                                      currency_list,
                                      'Currency'
                                    )
                                    .find(option => option.value === +field.value)
                                }
                                onChange={option => {
                                  field.onChange(option ? option.value : '');
                                }}
                                styles={selectStyles}
                                className={errors.currency ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.currency && (
                            <div className="invalid-feedback">{errors.currency.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="opening_balance">
                            <span className="text-danger">* </span>
                            {strings.OpeningBalance}
                          </Label>
                          <Controller
                            name="opening_balance"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                maxLength="14,2"
                                id="opening_balance"
                                placeholder={strings.Enter + strings.OpeningBalance}
                                {...field}
                                onChange={e => {
                                  if (e.target.value === '' || regEx.test(e.target.value)) {
                                    field.onChange(e);
                                  }
                                }}
                                className={errors.opening_balance ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.opening_balance && (
                            <div className="invalid-feedback">{errors.opening_balance.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="openingDate">
                            <span className="text-danger">* </span>
                            {strings.OpeningDate}
                          </Label>
                          <Controller
                            name="openingDate"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                id="openingDate"
                                className={`form-control ${errors.openingDate ? 'is-invalid' : ''}`}
                                value={field.value}
                                showMonthDropdown
                                showYearDropdown
                                disabled={disabledDate}
                                dropdownMode="select"
                                dateFormat="dd-MM-yyyy"
                                onChange={value => {
                                  field.onChange(dayjs(value).format('DD-MM-YYYY'));
                                }}
                              />
                            )}
                          />
                          {errors.openingDate && (
                            <div className="invalid-feedback">{errors.openingDate.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="">
                          <Label htmlFor="account_type">
                            <span className="text-danger">* </span>
                            {strings.AccountType}
                          </Label>
                          <Controller
                            name="account_type"
                            control={control}
                            render={({ field }) => (
                              <Select
                                id="account_type"
                                options={
                                  account_type_list
                                    ? selectOptionsFactory.renderOptions(
                                        'name',
                                        'id',
                                        account_type_list,
                                        'Account Type'
                                      )
                                    : []
                                }
                                value={
                                  account_type_list &&
                                  selectOptionsFactory
                                    .renderOptions('name', 'id', account_type_list, 'Account Type')
                                    .find(option => option.value === field.value)
                                }
                                onChange={option => {
                                  field.onChange(option ? option.value : '');
                                }}
                                styles={selectStyles}
                                className={errors.account_type ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.account_type && (
                            <div className="invalid-feedback">{errors.account_type.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="bank_name">
                            <span className="text-danger">* </span> {strings.BankName}
                          </Label>
                          <Controller
                            name="bank_name"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                id="bank_name"
                                options={
                                  bankList
                                    ? selectOptionsFactory.renderOptions(
                                        'bankName',
                                        'bankId',
                                        bankList,
                                        'Bank'
                                      )
                                    : []
                                }
                                value={
                                  bankList &&
                                  selectOptionsFactory
                                    .renderOptions('bankName', 'bankId', bankList, 'Bank')
                                    .find(option => option.label === field.value)
                                }
                                onChange={option => {
                                  field.onChange(option ? option : '');
                                }}
                                placeholder={strings.Select + strings.BankName}
                                styles={selectStyles}
                                className={errors.bank_name ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.bank_name && (
                            <div className="invalid-feedback">{errors.bank_name.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="account_number">
                            <span className="text-danger">* </span>
                            {strings.AccountNumber}
                          </Label>
                          <Controller
                            name="account_number"
                            control={control}
                            render={({ field }) => (
                              <Input
                                disabled
                                type="text"
                                maxLength="25"
                                id="account_number"
                                autoComplete="off"
                                placeholder={strings.Enter + strings.AccountNumber}
                                {...field}
                                onChange={e => {
                                  if (e.target.value === '' || regEx.test(e.target.value)) {
                                    field.onChange(e);
                                  }
                                  validationCheck(e.target.value);
                                }}
                                className={errors.account_number ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.account_number && (
                            <div className="invalid-feedback">{errors.account_number.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <Label htmlFor="countryId">{strings.Country}</Label>
                          <Controller
                            name="countryId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                styles={selectStyles}
                                options={
                                  country_list
                                    ? selectOptionsFactory.renderOptions(
                                        'countryName',
                                        'countryCode',
                                        country_list,
                                        'Country'
                                      )
                                    : []
                                }
                                value={
                                  country_list &&
                                  selectOptionsFactory
                                    .renderOptions(
                                      'countryName',
                                      'countryCode',
                                      country_list,
                                      'Country'
                                    )
                                    .find(option => option.value === +field.value)
                                }
                                onChange={option => {
                                  field.onChange(option ? option.value : '');
                                }}
                                placeholder={strings.Select + strings.Country}
                                id="countryId"
                                className={errors.countryId ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.countryId && (
                            <div className="invalid-feedback">{errors.countryId.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      {typeof bankNameValue === 'object' && bankNameValue?.value === 999 && (
                        <Col lg={4}>
                          <FormGroup className="mb-3">
                            <Label>
                              <span className="text-danger">* </span>
                              {strings.AddNewBank}
                            </Label>
                            <Controller
                              name="newBankName"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="text"
                                  maxLength="25"
                                  id="newBankName"
                                  placeholder={`${strings.Enter} ${strings.New} ${strings.BankName}`}
                                  {...field}
                                  className={errors.newBankName ? 'is-invalid' : ''}
                                />
                              )}
                            />
                            {errors.newBankName && (
                              <div className="invalid-feedback">{errors.newBankName.message}</div>
                            )}
                          </FormGroup>
                        </Col>
                      )}
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="account_is_for">
                            <span className="text-danger">* </span>
                            {strings.Accountisfor}
                          </Label>
                          <Controller
                            name="account_is_for"
                            control={control}
                            render={({ field }) => (
                              <Select
                                id="account_is_for"
                                options={
                                  account_for
                                    ? selectOptionsFactory.renderOptions(
                                        'label',
                                        'value',
                                        account_for,
                                        'Type'
                                      )
                                    : []
                                }
                                value={
                                  account_for &&
                                  account_for.find(option => option.value === field.value)
                                }
                                onChange={option => {
                                  field.onChange(option ? option.value : '');
                                }}
                                styles={selectStyles}
                                className={errors.account_is_for ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.account_is_for && (
                            <div className="invalid-feedback">{errors.account_is_for.message}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col
                        lg={12}
                        className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                      >
                        <FormGroup>
                          {transactionCount > 0 || currentBankAccountId === 10000 ? (
                            ''
                          ) : (
                            <Button
                              type="button"
                              name="button"
                              color="danger"
                              className="btn-square"
                              disabled={disabled1}
                              onClick={() => closeBankAccount(currentBankAccountId)}
                            >
                              <Trash2 className="h-4 w-4" />{' '}
                              {disabled1 ? 'Deleting...' : strings.Delete}
                            </Button>
                          )}
                        </FormGroup>
                        <FormGroup className="text-right">
                          <Button
                            type="submit"
                            name="submit"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                          >
                            <CircleDot className="h-4 w-4" />{' '}
                            {disabled ? 'Updating...' : strings.Update}
                          </Button>
                          <Button
                            type="button"
                            name="button"
                            color="secondary"
                            className="btn-square"
                            onClick={() => {
                              history.push('/admin/banking/bank-account');
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
        </div>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailBankAccount);
