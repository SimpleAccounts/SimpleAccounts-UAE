import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectCurrencyFactory, selectStyles } from 'utils';
import { Card, CardHeader, CardBody, Button, Input, FormGroup, Label, Row, Col } from 'components/migration';
import Select from 'react-select';
import { LeavePage, Loader } from 'components';
import { AuthActions, CommonActions } from 'services/global';
import './style.scss';
import * as CreateCurrencyConvertActions from './actions';
import * as CurrencyConvertActions from '../../actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Banknote, CircleDot, RefreshCw, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createCurrencyConvertSchema = z.object({
  currencyCode: z
    .number({
      required_error: 'Exchange currency is required',
      invalid_type_error: 'Exchange currency is required',
    })
    .positive('Exchange currency is required'),
  currencyIsoCode: z.string().optional(),
  exchangeRate: z
    .string()
    .min(1, 'Exchange rate is required')
    .refine(val => parseFloat(val) > 0, {
      message: 'Exchange rate should be greater than 0',
    }),
});

const mapStateToProps = state => {
  return {
    currency_list: state.common.currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
    createCurrencyConvertActions: bindActionCreators(CreateCurrencyConvertActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};

const CreateCurrencyConvert = ({
  currencyConvertActions,
  createCurrencyConvertActions,
  commonActions,
  authActions,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [createDisabled, setCreateDisabled] = useState(false);
  const [basecurrency, setBasecurrency] = useState([]);
  const [createMore, setCreateMore] = useState(false);
  const [currency_list, setCurrencyList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [exist, setExist] = useState(false);

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,6}$$/;

  const form = useForm({
    resolver: zodResolver(createCurrencyConvertSchema),
    defaultValues: {
      currencyCode: '',
      currencyIsoCode: '',
      exchangeRate: '',
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
    trigger,
  } = form;

  const currencyCode = watch('currencyCode');

  useEffect(() => {
    authActions
      .getCurrencylist()
      .then(res => {
        if (res.status === 200) {
          setCurrencyList(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
        setLoading(false);
      });
  }, [authActions, commonActions]);

  useEffect(() => {
    getCompanyCurrency();
  }, []);

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

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 10,
        currencyCode: value,
      };
      createCurrencyConvertActions.checkValidation(data).then(response => {
        if (response.data === 'Currency Conversions Already Exists') {
          setExist(true);
          setError('currencyCode', {
            type: 'manual',
            message: 'Currency already exists',
          });
          setCreateDisabled(false);
        } else {
          setExist(false);
          clearErrors('currencyCode');
        }
      });
    },
    [createCurrencyConvertActions, setError, clearErrors]
  );

  const onSubmit = data => {
    if (exist) {
      setError('currencyCode', {
        type: 'manual',
        message: 'Currency already exists',
      });
      return;
    }

    setCreateDisabled(true);

    const obj = {
      currencyCode: data.currencyCode,
      exchangeRate: data.exchangeRate,
      isActive: isActive,
    };

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Currency Conversion...');

    createCurrencyConvertActions
      .createCurrencyConvert(obj)
      .then(res => {
        if (res.status === 200) {
          setCreateDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Currency Convert Created Successfully'
          );

          if (createMore) {
            reset();
            setCreateMore(false);
            setDisableLeavePage(false);
          } else {
            history.push('/admin/master/CurrencyConvert');
          }
        }
      })
      .catch(err => {
        setCreateDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Currency Convert Created Unsuccessfully'
        );
      });
  };

  const handleCreateAndMore = () => {
    setCreateMore(true);
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="vat-code-create-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <Banknote className="h-5 w-5" />
                    <span className="ml-2"> {strings.NewCurrencyConversion}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={10}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col>
                            <FormGroup className="mb-3">
                              <Label htmlFor="active">
                                <span className="text-danger">* </span>
                                {strings.Status}
                              </Label>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio1"
                                    name="active"
                                    checked={selectedStatus}
                                    value={true}
                                    onChange={e => {
                                      if (e.target.value === 'true') {
                                        setSelectedStatus(true);
                                        setIsActive(true);
                                      }
                                    }}
                                  />
                                  <label className="custom-control-label" htmlFor="inline-radio1">
                                    {strings.Active}
                                  </label>
                                </div>
                              </FormGroup>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio2"
                                    name="active"
                                    value={false}
                                    checked={!selectedStatus}
                                    onChange={e => {
                                      if (e.target.value === 'false') {
                                        setSelectedStatus(false);
                                        setIsActive(false);
                                      }
                                    }}
                                  />
                                  <label className="custom-control-label" htmlFor="inline-radio2">
                                    {strings.Inactive}
                                  </label>
                                </div>
                              </FormGroup>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={1}>
                            <FormGroup className="mt-2">
                              <Label>{strings.Value}</Label>
                              <Input
                                disabled
                                id="1"
                                name="1"
                                value={
                                  1 +
                                  ' ' +
                                  (watch('currencyIsoCode') ? watch('currencyIsoCode') : '')
                                }
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mt-2">
                              <Label htmlFor="currencyCode">{strings.ExchangeCurrency}</Label>
                              <Controller
                                name="currencyCode"
                                control={control}
                                render={({ field: { onChange, value, ...field } }) => (
                                  <Select
                                    {...field}
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
                                        .find(option => option.value === value)
                                    }
                                    onChange={option => {
                                      if (option && option.value) {
                                        onChange(option.value);
                                        form.setValue('currencyIsoCode', option.iso);
                                        validationCheck(option.value);
                                      } else {
                                        onChange('');
                                        form.setValue('currencyIsoCode', '');
                                      }
                                    }}
                                    placeholder={strings.Select + strings.Currency}
                                    styles={selectStyles}
                                    className={errors.currencyCode ? 'is-invalid' : ''}
                                    isClearable
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
                          <FormGroup className="mt-5">
                            <label>
                              <b>=</b>
                            </label>
                          </FormGroup>
                          <Col lg={3}>
                            <FormGroup className="mt-2">
                              <Label htmlFor="exchangeRate">{strings.Exchangerate}</Label>
                              <Controller
                                name="exchangeRate"
                                control={control}
                                render={({ field: { onChange, value, ...field } }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    maxLength="20"
                                    id="exchangeRate"
                                    placeholder={strings.Enter + strings.Exchangerate}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regDecimal.test(e.target.value)
                                      ) {
                                        onChange(e.target.value);
                                      }
                                    }}
                                    value={value}
                                    className={errors.exchangeRate ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.exchangeRate && (
                                <div className="invalid-feedback">
                                  {errors.exchangeRate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={3}>
                            <FormGroup className="mt-2">
                              <Label htmlFor="currencyName">{strings.BaseCurrency}</Label>
                              <Input
                                disabled
                                type="text"
                                id="currencyName"
                                name="currencyName"
                                value={basecurrency.currencyName}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <span style={{ fontWeight: 'bold' }}>
                          Note: If a currency is associated with any bank, contact or document, it
                          cannot be deleted.
                        </span>
                        <FormGroup className="text-right mt-5">
                          <Button
                            type="submit"
                            name="submit"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={createDisabled}
                            onClick={() => {
                              trigger();
                              if (errors && Object.keys(errors).length !== 0) {
                                commonActions.fillManDatoryDetails();
                              }
                            }}
                          >
                            <CircleDot className="h-4 w-4" />{' '}
                            {createDisabled ? 'Creating...' : strings.Create}
                          </Button>

                          <Button
                            type="submit"
                            name="button"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={createDisabled}
                            onClick={handleCreateAndMore}
                          >
                            <RefreshCw className="h-4 w-4" />{' '}
                            {createDisabled ? 'Creating...' : strings.CreateandMore}
                          </Button>

                          <Button
                            type="button"
                            color="secondary"
                            className="btn-square"
                            onClick={() => {
                              history.push('/admin/master/CurrencyConvert');
                            }}
                          >
                            <Ban className="h-4 w-4" /> {strings.Cancel}
                          </Button>
                        </FormGroup>
                      </form>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateCurrencyConvert);
