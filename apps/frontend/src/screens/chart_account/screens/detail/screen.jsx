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
} from 'components/migration';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import './style.scss';
import * as ChartOfAccontActions from '../../actions';
import * as DetailChartOfAccontActions from './actions';
import Select from 'react-select';
import { CommonActions } from 'services/global';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { selectStyles } from 'utils';
import { AreaChart, Trash2, CircleDot, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailChartAccountSchema = z.object({
  transactionCategoryName: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  chartOfAccount: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Type is required'),
});

const mapStateToProps = state => {
  return {
    sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    chartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
    detailChartOfAccontActions: bindActionCreators(DetailChartOfAccontActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const regExAlpha = /^[A-Za-z0-9 !@#$%^&*)(+=._-]+$/;

const DetailChartAccount = ({
  chartOfAccontActions,
  detailChartOfAccontActions,
  commonActions,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [coaId, setCoaId] = useState(null);
  const [chartOfAccountCategory, setChartOfAccountCategory] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [childRecordsPresent, setChildRecordsPresent] = useState(false);
  const [exist, setExist] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const form = useForm({
    resolver: zodResolver(detailChartAccountSchema),
    defaultValues: {
      transactionCategoryName: '',
      chartOfAccount: null,
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
  } = form;

  const getSubTransactionTypes = useCallback(() => {
    chartOfAccontActions.getSubTransactionTypes().then(res => {
      if (res.status === 200) {
        let val = Object.assign({}, res.data);
        let temp = [];
        Object.keys(val).map(item => {
          temp.push({
            label: item,
            options: val[`${item}`],
          });
          return item;
        });
        setChartOfAccountCategory(temp);
      }
    });
  }, [chartOfAccontActions]);

  const initializeData = useCallback(() => {
    const id = location.state?.id;
    if (location.state && id) {
      detailChartOfAccontActions
        .getTransactionCategoryById(id)
        .then(res => {
          if (res.status === 200) {
            getSubTransactionTypes();
            setCoaId(res.data.transactionCategoryId);
            reset({
              transactionCategoryName: res.data.transactionCategoryName,
              chartOfAccount: res.data.transactionTypeId
                ? {
                    label: res.data.transactionTypeName,
                    value: res.data.transactionTypeId,
                  }
                : null,
            });
            setInitialDataLoaded(true);
            setLoading(false);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          setLoading(false);
        });
    }
  }, [location.state, detailChartOfAccontActions, getSubTransactionTypes, commonActions, reset]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 16,
        name: value,
      };
      detailChartOfAccontActions.checkValidation(data).then(response => {
        if (response.data === 'Transaction Category Name Already Exists') {
          setExist(true);
          setError('transactionCategoryName', {
            type: 'manual',
            message: 'Name already exists',
          });
        } else {
          setExist(false);
          clearErrors('transactionCategoryName');
        }
      });
    },
    [detailChartOfAccontActions, setError, clearErrors]
  );

  const removeDialog = () => {
    setDialog(null);
  };

  const removeChartAccount = () => {
    setDisabled1(true);
    const id = location.state.id;
    setLoading(true);
    setLoadingMsg('Deleting Chart Of Account...');
    detailChartOfAccontActions
      .deleteChartAccount(id)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Chart Of Account Deleted Successfully'
          );
          history.push('/admin/master/chart-account');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Chart Of Account Deleted Unsuccessfully'
        );
        setDisabled1(false);
        setLoading(false);
      });
  };

  const deleteChartAccount = () => {
    chartOfAccontActions.getExplainedTransactionCountForTransactionCategory(coaId).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert(
          'error',
          'You need to delete invoices to delete the chart of account'
        );
      } else {
        const message1 = (
          <text>
            <b>Delete Chart of Account?</b>
          </text>
        );
        const message =
          'This Chart of Account will be deleted permanently and cannot be recovered.';
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeChartAccount}
            cancelHandler={removeDialog}
            message={message}
            message1={message1}
          />
        );
      }
    });
  };

  const onSubmit = data => {
    if (exist) {
      setError('transactionCategoryName', {
        type: 'manual',
        message: 'Name already exists',
      });
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const id = location.state.id;
    const postData = {
      transactionCategoryName: data.transactionCategoryName,
      chartOfAccount: data.chartOfAccount.value,
      transactionCategoryId: id,
      transactionCategoryDescription: data.chartOfAccount.label,
    };

    setLoading(true);
    setLoadingMsg('Updating Chart Of Account...');

    detailChartOfAccontActions
      .updateTransactionCategory(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          reset();
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Chart Of Account Updated Successfully'
          );
          history.push('/admin/master/chart-account');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Chart Of Account Updated Unsuccessfully'
        );
        setDisabled(false);
        setLoading(false);
      });
  };

  const handleNameChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      onChange(e);
      if (value) {
        validationCheck(value);
      }
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="chart-account-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <AreaChart className="h-4 w-4" />
                    <span className="ml-2"> Update Chart Of Account </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <FormGroup>
                          <Label htmlFor="transactionCategoryName">
                            <span className="text-danger">* </span>
                            {strings.chartOfAccountName}
                          </Label>
                          <Controller
                            name="transactionCategoryName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                maxLength="50"
                                id="transactionCategoryName"
                                placeholder={strings.Enter + strings.chartOfAccountName}
                                {...field}
                                onChange={e => handleNameChange(e, field.onChange)}
                                className={errors.transactionCategoryName ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.transactionCategoryName && (
                            <div className="invalid-feedback">
                              {errors.transactionCategoryName.message}
                            </div>
                          )}
                        </FormGroup>

                        <FormGroup>
                          <Label htmlFor="chartOfAccount">
                            <span className="text-danger">* </span>
                            {strings.accountType}
                          </Label>
                          <Controller
                            name="chartOfAccount"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                id="chartOfAccount"
                                isDisabled={childRecordsPresent}
                                options={chartOfAccountCategory}
                                styles={selectStyles}
                                className={errors.chartOfAccount ? 'is-invalid' : ''}
                                isClearable
                              />
                            )}
                          />
                          {errors.chartOfAccount && (
                            <div className="invalid-feedback d-block">
                              {errors.chartOfAccount.message}
                            </div>
                          )}
                        </FormGroup>

                        <span style={{ fontWeight: 'bold' }}>Note:</span>
                        <span>
                          {' '}
                          A Chart Of Account cannot be edited if they are associated with a product,
                          document or transaction.
                        </span>

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
                                onClick={deleteChartAccount}
                              >
                                <Trash2 className="h-4 w-4" />{' '}
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
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
                                name="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/master/chart-account');
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailChartAccount);
