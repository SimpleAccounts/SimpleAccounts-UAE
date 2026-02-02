import { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
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
import { LeavePage, Loader } from 'components';
import DatePicker from 'react-datepicker';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import { CommonActions } from 'services/global';
import * as createBankAccountActions from './actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Landmark, CircleDot, RefreshCw, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createBankAccountSchema = z
  .object({
    account_name: z
      .string()
      .min(1, 'Account name is required')
      .min(2, 'Account name is too short!'),
    currency: z.number({
      required_error: 'Currency is required',
      invalid_type_error: 'Currency is required',
    }),
    opening_balance: z.string().min(1, 'Opening balance is required'),
    openingDate: z.date({
      required_error: 'Opening date is required',
      invalid_type_error: 'Opening date is required',
    }),
    account_type: z.number({
      required_error: 'Account type is required',
      invalid_type_error: 'Account type is required',
    }),
    bankId: z
      .object({
        value: z.number(),
        label: z.string(),
      })
      .nullable()
      .refine(val => val !== null, 'Bank name is required'),
    account_number: z
      .string()
      .min(1, 'Account number is required')
      .min(2, 'Account number is too short!')
      .max(30, 'Account number is too long!'),
    account_is_for: z.string().min(1, 'Account for is required'),
    countrycode: z.number().optional(),
    ifsc_code: z.string().optional(),
    swift_code: z.string().optional(),
    newBankName: z.string().optional(),
  })
  .refine(
    data => {
      if (data.bankId?.value === 999) {
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
    currency_convert_list: state.common.currency_convert_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    createBankAccountActions: bindActionCreators(createBankAccountActions, dispatch),
  };
};

const regExAlpha = /^[a-zA-Z0-9 -]+$/; // Allow alphanumeric characters, spaces, and hyphens
const regEx = /^[0-9]+$/;
const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

const account_for = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Corporate', value: 'Corporate' },
];

const CreateBankAccount = ({
  account_type_list,
  currency_list,
  country_list,
  currency_convert_list,
  commonActions,
  currencyConvertActions,
  createBankAccountActions,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [exist, setExist] = useState(false);

  const form = useForm({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      account_name: '',
      currency: 150,
      opening_balance: '',
      account_type: 2,
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      swift_code: '',
      countrycode: 229,
      openingDate: new Date(),
      account_is_for: '',
      bankId: null,
      newBankName: '',
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

  const bankIdValue = watch('bankId');

  useEffect(() => {
    initializeData();
    createBankAccountActions.getBankList().then(response => {
      setBankList(response.data);
    });
  }, []);

  const initializeData = useCallback(() => {
    createBankAccountActions.getAccountTypeList();
    commonActions.getCurrencyConversionList().then(action => {
      if (action && action.type && action.type.includes('fulfilled')) {
        if (action.payload && action.payload.length > 0) {
          setValue('currency', parseInt(action.payload[0].currencyCode));
        }
      }
    });
    createBankAccountActions.getCurrencyList().then(response => {
      if (response.data && response.data.length > 0) {
        setValue('currency', parseInt(response.data[0].currencyCode));
        setValue('account_is_for', 'Corporate');
      }
    });
    createBankAccountActions.getCountryList();
  }, [createBankAccountActions, commonActions, setValue]);

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 5,
        name: value,
      };
      createBankAccountActions.checkValidation(data).then(response => {
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
    [createBankAccountActions, setError, clearErrors]
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
      bankAccountName: data.account_name,
      bankAccountCurrency: data.currency ? data.currency : '',
      openingBalance: data.opening_balance,
      openingDate: data.openingDate ? data.openingDate : null,
      bankAccountType: data.account_type ? data.account_type : '',
      bankName: data.bankId && data.bankId.label ? data.bankId.label : '',
      accountNumber: data.account_number,
      ifscCode: data.ifsc_code,
      swiftCode: data.swift_code,
      bankCountry: data.countrycode ? data.countrycode : '',
      personalCorporateAccountInd: data.account_is_for ? data.account_is_for : '',
      newBankName: data.newBankName,
    };

    setLoading(true);
    setLoadingMsg('Creating New Bank Account...');

    createBankAccountActions
      .createBankAccount(obj)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'New Bank Account Created Successfully.'
        );
        if (createMore) {
          setCreateMore(false);
          setDisableLeavePage(false);
          initializeData();
          reset({
            account_name: '',
            currency: 150,
            opening_balance: '',
            account_type: 2,
            bank_name: '',
            account_number: '',
            ifsc_code: '',
            swift_code: '',
            countrycode: 229,
            openingDate: new Date(),
            account_is_for: '',
            bankId: null,
            newBankName: '',
          });
        } else {
          navigate('/admin/banking/bank-account');
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'New Bank Account Created Unsuccessfully'
        );
      });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="create-bank-account-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <Landmark className="h-4 w-4" />
                        <span className="ml-2">{strings.CreateBankAccount}</span>
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
                                    type="text"
                                    maxLength="100"
                                    id="account_name"
                                    autoComplete="off"
                                    placeholder={strings.Enter + strings.AccountName}
                                    style={{ background: 'white' }}
                                    {...field}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regExAlpha.test(e.target.value)
                                      ) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.account_name ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.account_name && (
                                <div className="invalid-feedback">
                                  {errors.account_name.message}
                                </div>
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
                                    placeholder={strings.Select + strings.Currency}
                                    options={
                                      currency_convert_list
                                        ? (() => {
                                            const options = selectCurrencyFactory.renderOptions(
                                              'currencyName',
                                              'currencyCode',
                                              currency_convert_list,
                                              'Currency'
                                            );
                                            // Deduplicate by value (currencyCode)
                                            const seen = new Set();
                                            return options.filter(option => {
                                              if (seen.has(option.value)) {
                                                return false;
                                              }
                                              seen.add(option.value);
                                              return true;
                                            });
                                          })()
                                        : []
                                    }
                                    value={
                                      currency_convert_list &&
                                      (() => {
                                        const options = selectCurrencyFactory.renderOptions(
                                          'currencyName',
                                          'currencyCode',
                                          currency_convert_list,
                                          'Currency'
                                        );
                                        // Deduplicate before finding
                                        const seen = new Set();
                                        const uniqueOptions = options.filter(option => {
                                          if (seen.has(option.value)) {
                                            return false;
                                          }
                                          seen.add(option.value);
                                          return true;
                                        });
                                        return uniqueOptions.find(
                                          option => option.value === +field.value
                                        );
                                      })()
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
                                    autoComplete="off"
                                    placeholder={strings.Enter + strings.OpeningBalance}
                                    style={{ background: 'white' }}
                                    {...field}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regDecimal.test(e.target.value)
                                      ) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.opening_balance ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.opening_balance && (
                                <div className="invalid-feedback">
                                  {errors.opening_balance.message}
                                </div>
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
                                    autoComplete="off"
                                    className={`form-control ${
                                      errors.openingDate ? 'is-invalid' : ''
                                    }`}
                                    popperPlacement="bottom-start"
                                    popperModifiers={{
                                      flip: {
                                        behavior: ['bottom'],
                                      },
                                      preventOverflow: {
                                        enabled: false,
                                      },
                                      hide: {
                                        enabled: false,
                                      },
                                    }}
                                    placeholderText={strings.Select + strings.OpeningDate}
                                    selected={field.value}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    dateFormat="dd-MM-yyyy"
                                    maxDate={new Date()}
                                    onChange={value => field.onChange(value)}
                                  />
                                )}
                              />
                              {errors.openingDate && (
                                <div className="invalid-feedback">{errors.openingDate.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
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
                                    autoComplete="off"
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
                                        .renderOptions(
                                          'name',
                                          'id',
                                          account_type_list,
                                          'Account Type'
                                        )
                                        .find(option => option.value === +field.value)
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
                                <div className="invalid-feedback">
                                  {errors.account_type.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="bankId">
                                <span className="text-danger">* </span> {strings.BankName}{' '}
                              </Label>
                              <Controller
                                name="bankId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    id="bankId"
                                    autoComplete="off"
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
                                    placeholder={strings.Select + strings.BankName}
                                    styles={selectStyles}
                                    className={errors.bankId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.bankId && (
                                <div className="invalid-feedback">{errors.bankId.message}</div>
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
                                    type="text"
                                    maxLength="25"
                                    id="account_number"
                                    autoComplete="off"
                                    placeholder={strings.Enter + strings.AccountNumber}
                                    style={{ background: 'white' }}
                                    {...field}
                                    onChange={e => {
                                      // Allow alphanumeric characters (letters, numbers, hyphens, underscores)
                                      if (
                                        e.target.value === '' ||
                                        regExAlpha.test(e.target.value)
                                      ) {
                                        field.onChange(e);
                                      }
                                      validationCheck(e.target.value);
                                    }}
                                    className={errors.account_number ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.account_number && (
                                <div className="invalid-feedback">
                                  {errors.account_number.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="countrycode">{strings.Country}</Label>
                              <Controller
                                name="countrycode"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    styles={selectStyles}
                                    id="countrycode"
                                    placeholder={strings.Select + strings.Country}
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
                                    onChange={option => {
                                      field.onChange(option ? option.value : '');
                                    }}
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
                                    className={errors.countrycode ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.countrycode && (
                                <div className="invalid-feedback">{errors.countrycode.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          {bankIdValue?.value === 999 && (
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
                                  <div className="invalid-feedback">
                                    {errors.newBankName.message}
                                  </div>
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
                                            'Account is for'
                                          )
                                        : []
                                    }
                                    value={
                                      account_for &&
                                      selectOptionsFactory
                                        .renderOptions(
                                          'label',
                                          'value',
                                          account_for,
                                          'Account is for'
                                        )
                                        .find(option => option.value === field.value)
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
                                <div className="invalid-feedback">
                                  {errors.account_is_for.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={12}>
                            <FormGroup className="text-right mt-5 form-action-btn">
                              <Button
                                type="submit"
                                name="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => {
                                  if (errors && Object.keys(errors).length !== 0) {
                                    commonActions.fillManDatoryDetails();
                                  }
                                }}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              <Button
                                type="button"
                                name="button"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => {
                                  if (errors && Object.keys(errors).length !== 0) {
                                    commonActions.fillManDatoryDetails();
                                  }
                                  setCreateMore(true);
                                  handleSubmit(onSubmit)();
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                                {disabled ? ' Creating...' : strings.CreateandMore}
                              </Button>
                              <Button
                                type="button"
                                name="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  navigate('/admin/banking/bank-account');
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
            </Col>
          </Row>
        </div>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateBankAccount);
