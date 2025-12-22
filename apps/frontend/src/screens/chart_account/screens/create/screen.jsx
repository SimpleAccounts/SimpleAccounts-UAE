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
import { LeavePage, Loader } from 'components';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { CommonActions } from 'services/global';
import * as ChartOfAccontActions from '../../actions';
import * as CreateChartOfAccontActions from './actions';
import Select from 'react-select';
import { selectStyles } from 'utils';
import { AreaChart, CircleDot, RefreshCw, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createChartAccountSchema = z.object({
  transactionCategoryName: z
    .string()
    .min(1, 'Chart Of Account Name is required')
    .max(50, 'Name is too long'),
  chartOfAccount: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Account Type is required'),
});

const mapStateToProps = state => {
  return {
    sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ChartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
    createChartOfAccontActions: bindActionCreators(CreateChartOfAccontActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const regExAlpha = /^[a-zA-Z ]+$/;

const CreateChartAccount = ({
  ChartOfAccontActions,
  createChartOfAccontActions,
  commonActions,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [createMore, setCreateMore] = useState(false);
  const [exist, setExist] = useState(false);
  const [chartOfAccountCategory, setChartOfAccountCategory] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const form = useForm({
    resolver: zodResolver(createChartAccountSchema),
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
    watch,
  } = form;
  const transactionCategoryName = watch('transactionCategoryName');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    ChartOfAccontActions.getSubTransactionTypes().then(res => {
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
  }, [ChartOfAccontActions]);

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 16,
        name: value,
      };
      createChartOfAccontActions.checkValidation(data).then(response => {
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
    [createChartOfAccontActions, setError, clearErrors]
  );

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

    const postData = {
      transactionCategoryName: data.transactionCategoryName,
      chartOfAccount: data.chartOfAccount.value,
      transactionCategoryDescription: data.chartOfAccount.label,
    };

    setLoading(true);
    setLoadingMsg('Creating Chart Of Account ...');

    createChartOfAccontActions
      .createTransactionCategory(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'New Chart Of Account Created Successfully'
          );

          if (createMore) {
            setCreateMore(false);
            setDisableLeavePage(false);
            reset();
          } else {
            history.push('/admin/master/chart-account');
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'New Chart Of Account Created Unsuccessfully'
        );
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
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <AreaChart className="h-4 w-4" />
                    <span className="ml-2">Create Chart Of Account</span>
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
                                placeholder={strings.Select + strings.accountType}
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

                        <FormGroup className="text-right mt-5">
                          <Button
                            type="submit"
                            name="submit"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                            onClick={() => setCreateMore(false)}
                          >
                            <CircleDot className="h-4 w-4" />{' '}
                            {disabled ? 'Creating...' : strings.Create}
                          </Button>
                          <Button
                            type="submit"
                            name="button"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                            onClick={() => setCreateMore(true)}
                          >
                            <RefreshCw className="h-4 w-4" />{' '}
                            {disabled ? 'Creating...' : strings.CreateandMore}
                          </Button>
                          <Button
                            type="button"
                            color="secondary"
                            className="btn-square"
                            onClick={() => {
                              history.push('/admin/master/chart-account');
                            }}
                          >
                            <Ban className="h-4 w-4" /> {strings.Cancel}
                          </Button>
                        </FormGroup>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateChartAccount);
