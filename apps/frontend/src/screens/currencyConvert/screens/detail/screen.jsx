import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectCurrencyFactory, selectStyles } from 'utils';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
} from 'components/migration';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import Select from 'react-select';
import { CommonActions, AuthActions } from 'services/global';
import './style.scss';
import * as DetailCurrencyConvertAction from './actions';
import * as CurrencyConvertActions from '../../actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Banknote, Trash2, CircleDot, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailCurrencyConvertSchema = z.object({
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
    currencyList: state.currencyConvert.currency_list,
    currency_list: state.common.currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailCurrencyConvertAction: bindActionCreators(DetailCurrencyConvertAction, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
  };
};

const DetailCurrencyConvert = ({
  commonActions,
  detailCurrencyConvertAction,
  authActions,
  currencyConvertActions,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [current_currency_convert_id, setCurrentCurrencyConvertId] = useState(null);
  const [basecurrency, setBasecurrency] = useState([]);
  const [currency_list, setCurrencyList] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [deletebutton, setDeletebutton] = useState(0);

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,6}$$/;

  const form = useForm({
    resolver: zodResolver(detailCurrencyConvertSchema),
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
    watch,
    trigger,
  } = form;

  useEffect(() => {
    if (location.state && location.state.id) {
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

      getCompanyCurrency();

      detailCurrencyConvertAction
        .getCurrencyConvertById(location.state.id)
        .then(res => {
          if (res.status === 200) {
            detailCurrencyConvertAction.getDeleteStatusById(res.data.currencyCode).then(res => {
              setDeletebutton(res.data);
            });

            setCurrentCurrencyConvertId(location.state.id);
            setIsActive(res.data ? res.data.isActive : '');
            setSelectedStatus(res.data ? res.data.isActive : '');

            reset({
              currencyCode:
                res.data.currencyCode && res.data.currencyCode !== null
                  ? res.data.currencyCode
                  : '',
              exchangeRate:
                res.data.exchangeRate && res.data.exchangeRate !== null
                  ? res.data.exchangeRate
                  : '',
              currencyIsoCode:
                res.data.currencyIsoCode && res.data.currencyIsoCode !== null
                  ? res.data.currencyIsoCode
                  : '',
            });

            setLoading(false);
          }
        })
        .catch(err => {
          setLoading(false);
          history.push('/admin/master/CurrencyConvert');
        });
    } else {
      history.push('/admin/master/CurrencyConvert');
    }
  }, [location.state, authActions, detailCurrencyConvertAction, commonActions, history, reset]);

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

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = data => {
    setDisabled(true);

    const obj = {
      currencyCode: data.currencyCode,
      exchangeRate: data.exchangeRate,
      isActive: isActive,
    };

    let postData = getData(obj);
    postData = { ...postData, ...{ id: current_currency_convert_id } };

    setLoading(true);
    setDisableLeavePage(false);
    setLoadingMsg('Updating Currency Conversion...');

    detailCurrencyConvertAction
      .updateCurrencyConvert(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Currency Conversion Updated Successfully'
          );
          history.push('/admin/master/CurrencyConvert');
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Currency Conversion Updated Unsuccessfully'
        );
      });
  };

  const deleteCurrencyConvert = () => {
    const message1 = (
      <text>
        <b>Delete Currency Conversion?</b>
      </text>
    );
    const message =
      'This Currency Conversion will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeCurrencyConvert}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeCurrencyConvert = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Currency Conversion...');

    detailCurrencyConvertAction
      .deleteCurrencyConvert(current_currency_convert_id)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Currency Conversion Deleted Successfully'
          );
          history.push('/admin/master/CurrencyConvert');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Currency Conversion Deleted Unsuccessfully'
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
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <Banknote className="h-4 w-4" />
                    <span className="ml-2"> {strings.UpdateCurrencyConversion} </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={10}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <Row>
                          <Col>
                            <FormGroup className="mb-3">
                              <Label htmlFor="active">
                                <span className="text-danger">* </span> {strings.Status}
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
                                      } else {
                                        onChange('');
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
                              <Label htmlFor="currencyName"> {strings.BaseCurrency}</Label>
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
                        <Row>
                          <Col
                            lg={10}
                            className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                          >
                            {current_currency_convert_id !== 10000 && deletebutton === 0 && (
                              <FormGroup className="text-right">
                                <Button
                                  type="button"
                                  name="button"
                                  color="danger"
                                  className="btn-square"
                                  disabled={disabled1}
                                  onClick={deleteCurrencyConvert}
                                >
                                  <Trash2 className="h-4 w-4" />{' '}
                                  {disabled1 ? 'Deleting...' : strings.Delete}
                                </Button>
                              </FormGroup>
                            )}
                            <FormGroup className="text-right">
                              {current_currency_convert_id !== 10000 && (
                                <Button
                                  type="submit"
                                  name="submit"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={disabled}
                                  onClick={() => {
                                    trigger();
                                    if (errors && Object.keys(errors).length != 0) {
                                      commonActions.fillManDatoryDetails();
                                    }
                                  }}
                                >
                                  <CircleDot className="h-4 w-4" />{' '}
                                  {disabled ? 'Updating...' : strings.Update}
                                </Button>
                              )}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailCurrencyConvert);
