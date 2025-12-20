import React, { useState, useEffect, useCallback } from 'react';
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
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
} from 'reactstrap';
import { Loader, LeavePage } from 'components';
import Select from 'react-select';
import { selectOptionsFactory, selectStyles } from 'utils';
import DatePicker from 'react-datepicker';
import { CommonActions, AuthActions } from 'services/global';
import './style.scss';
import * as DetailOpeningBalancesAction from './actions';
import * as OpeningBalanceActions from '../../actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailOpeningBalanceSchema = z.object({
  transactionCategoryId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  effectiveDate: z.date().nullable().optional(),
  openingBalance: z.string().optional(),
});

const mapStateToProps = (state) => {
  return {
    transaction_category_list: state.opening_balance.transaction_category_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailOpeningBalancesAction: bindActionCreators(DetailOpeningBalancesAction, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch),
  };
};

const DetailOpeningBalance = ({
  commonActions,
  detailOpeningBalancesAction,
  authActions,
  openingBalanceActions,
  transaction_category_list,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [currentOpeningBalanceId, setCurrentOpeningBalanceId] = useState(null);
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const form = useForm({
    resolver: zodResolver(detailOpeningBalanceSchema),
    defaultValues: {
      transactionCategoryId: null,
      effectiveDate: null,
      openingBalance: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (location.state && location.state.id) {
      openingBalanceActions.getTransactionCategoryList();
      detailOpeningBalancesAction
        .getOpeningBalanceById(location.state.id)
        .then((res) => {
          if (res.status === 200) {
            setLoading(false);
            setCurrentOpeningBalanceId(location.state.id);
            reset({
              id: res.data.current_opening_balance_id ? res.data.current_opening_balance_id : '',
              transactionCategoryId: res.data.transactionCategoryId
                ? {
                    value: res.data.transactionCategoryId,
                    label: res.data.transactionCategoryName || '',
                  }
                : null,
              openingBalance: res.data.openingBalance ? res.data.openingBalance : '',
            });
          }
        })
        .catch((err) => {
          setLoading(false);
          history.push('/admin/accountant/opening-balance');
        });
    } else {
      history.push('/admin/accountant/opening-balance');
    }
  }, [location.state, detailOpeningBalancesAction, openingBalanceActions, history, reset]);

  const getData = (data) => {
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

  const onSubmit = (data) => {
    let postData = getData(data);
    postData = { ...postData, ...{ id: currentOpeningBalanceId } };

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Opening Balance...');

    detailOpeningBalancesAction
      .updateOpeningBalance(postData)
      .then((res) => {
        if (res.status === 200) {
          reset();
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Opening Balance Updated Successfully!'
          );
          history.push('/admin/accountant/opening-balance');
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Opening Balance Updated Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  if (loading === true) {
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
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2">{strings.Update + ' ' + strings.OpeningBalance}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Loader></Loader>
                  ) : (
                    <Row>
                      <Col lg={10}>
                        <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="transactionCategoryBalanceId">
                                  {strings.ChartofAccounts}
                                </Label>
                                <Controller
                                  name="transactionCategoryId"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      styles={selectStyles}
                                      id="transactionCategoryId"
                                      placeholder={strings.Select + strings.TransactionCategory}
                                      options={
                                        transaction_category_list
                                          ? selectOptionsFactory.renderOptions(
                                              'transactionCategoryName',
                                              'transactionCategoryId',
                                              transaction_category_list,
                                              'Chart of Account'
                                            )
                                          : []
                                      }
                                      className={errors.transactionCategoryId ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.transactionCategoryId && (
                                  <div className="invalid-feedback d-block">
                                    {errors.transactionCategoryId.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="effectiveDate">
                                  <span className="text-danger">* </span>
                                  {strings.EffectiveDate}
                                </Label>
                                <Controller
                                  name="effectiveDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      {...field}
                                      id="date"
                                      selected={field.value}
                                      onChange={(date) => field.onChange(date)}
                                      className={`form-control ${
                                        errors.effectiveDate ? 'is-invalid' : ''
                                      }`}
                                      placeholderText={strings.EffectiveDate}
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode="select"
                                      dateFormat="dd-MM-yyyy"
                                      maxDate={new Date()}
                                    />
                                  )}
                                />
                                {errors.effectiveDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.effectiveDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={3}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="openingBalance">
                                  <span className="text-danger">* </span>
                                  {strings.Amount}
                                </Label>
                                <Controller
                                  name="openingBalance"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="text"
                                      min="0"
                                      maxLength="14,2"
                                      id="openingBalance"
                                      rows="5"
                                      className={errors.openingBalance ? 'is-invalid' : ''}
                                      onChange={(e) => {
                                        if (
                                          e.target.value === '' ||
                                          regDecimal.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      placeholder={strings.Enter + strings.Amount}
                                    />
                                  )}
                                />
                                {errors.openingBalance && (
                                  <div className="invalid-feedback">
                                    {errors.openingBalance.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={10} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                              <FormGroup className="text-right">
                                <Button
                                  type="submit"
                                  name="submit"
                                  color="primary"
                                  className="btn-square mr-3"
                                >
                                  <i className="fa fa-dot-circle-o"></i> {strings.Update}
                                </Button>
                                <Button
                                  type="button"
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    history.push('/admin/accountant/opening-balance');
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailOpeningBalance);
