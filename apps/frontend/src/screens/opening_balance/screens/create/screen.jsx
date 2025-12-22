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
  Input,
  FormGroup,
  Label,
  Row,
  Col,
} from 'components/migration';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import _ from 'lodash-es';
import { Loader, LeavePage } from 'components';
import dayjs from '@/utils/date';
import { AuthActions, CommonActions } from 'services/global';
import * as OpeningBalanceActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import * as CreateOpeningBalancesActions from './actions';
import { selectOptionsFactory, selectStyles } from 'utils';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { HelpCircle, CircleDot, Ban, Scale } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createOpeningBalanceSchema = z.object({
  transactionCategoryId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Transaction category is required')
    .refine(
      val => val && val.label !== 'Select Transaction Category',
      'Transaction category is required'
    ),
  effectiveDate: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date is required',
  }),
  openingBalance: z.string().min(1, 'Amount is required'),
});

const mapStateToProps = state => {
  return {
    currency_list: state.common.currency_list,
    transaction_category_list: state.opening_balance.transaction_category_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch),
    createOpeningBalancesActions: bindActionCreators(CreateOpeningBalancesActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};

const CreateOpeningBalance = ({
  openingBalanceActions,
  createOpeningBalancesActions,
  commonActions,
  authActions,
  transaction_category_list,
  history,
  location: _location,
}) => {
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [openingbalancelist, setOpeningbalancelist] = useState('');
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [_companyDetails, setCompanyDetails] = useState(null);

  const regEx = /^[0-9]+$/;

  const form = useForm({
    resolver: zodResolver(createOpeningBalanceSchema),
    defaultValues: {
      effectiveDate: new Date(),
      openingBalance: '',
      transactionCategoryId: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = form;

  const getOpeningBalanceList = useCallback(() => {
    createOpeningBalancesActions
      .getOpeningBalanceList()
      .then(res => {
        if (res.status === 200) {
          setOpeningbalancelist(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  }, [createOpeningBalancesActions, commonActions]);

  const initializeData = useCallback(() => {
    openingBalanceActions.getTransactionCategoryList();
    commonActions.getCompanyDetails().then(action => {
      // Redux Toolkit thunks return action objects
      if (action && action.type && action.type.includes('fulfilled')) {
        const isRegisteredVatValue = action.payload.isRegisteredVat;
        setIsRegisteredVat(isRegisteredVatValue);
        setCompanyDetails(action.payload);
      }
    });
  }, [openingBalanceActions, commonActions]);

  useEffect(() => {
    authActions.getCurrencylist();
    getOpeningBalanceList();
    initializeData();
  }, [authActions, getOpeningBalanceList, initializeData]);

  const checkIfOpeningBalanceAlreadyExist = transactioncategorylist => {
    const openingbalancelistData = openingbalancelist.data;
    if (
      openingbalancelistData &&
      openingbalancelistData.length &&
      openingbalancelistData.length !== 0
    ) {
      let transactioncategorynewlist = [];
      transactioncategorylist.map(category => {
        let openingbalance = openingbalancelistData.find(
          element => category.transactionCategoryId === element.transactionCategoryId
        );
        if (!openingbalance) {
          transactioncategorynewlist.push(category);
        }
      });
      return transactioncategorynewlist;
    } else {
      return transactioncategorylist;
    }
  };

  const onSubmit = data => {
    setDisabled(true);

    let formData = new FormData();
    formData.append(
      `persistModelList[${0}].transactionCategoryId`,
      data.transactionCategoryId.value
    );
    formData.append(`persistModelList[${0}].effectiveDate`, dayjs(data.effectiveDate));
    formData.append(`persistModelList[${0}].openingBalance`, data.openingBalance);

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating New Opening Balance...');

    createOpeningBalancesActions
      .addOpeningBalance(formData)
      .then(res => {
        setDisabled(false);
        if (res.status === 200) {
          reset({
            effectiveDate: new Date(),
            openingBalance: '',
            transactionCategoryId: null,
          });
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'New Opening Balance Created Successfully.'
          );
          if (createMore) {
            setCreateMore(false);
            setLoading(false);
            setDisableLeavePage(false);
          } else {
            history.push('/admin/accountant/opening-balance');
            setLoading(false);
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'New Opening Balance Created Unsuccessfully'
        );
      });
  };

  if (loading === true) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  let filteredTransactionCategoryList = transaction_category_list;
  if (transaction_category_list && transaction_category_list?.length !== 0) {
    filteredTransactionCategoryList = checkIfOpeningBalanceAlreadyExist(transaction_category_list);
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
                    <Scale className="h-5 w-5" />
                    <span className="ml-2">{strings.NewOpeningBalance}</span>
                  </div>
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
                      <Col lg={10}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="transactionCategoryBalanceId">
                                  <span className="text-danger">* </span>
                                  {strings.TransactionCategory}
                                  <div className="tooltip-icon ml-1">
                                    <HelpCircle className="h-4 w-4 inline" />
                                    <span className="tooltiptext">
                                      This list will only include categories for which an opening
                                      balance has not been created.
                                    </span>
                                  </div>
                                </Label>
                                <Controller
                                  name="transactionCategoryId"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      id="transactionCategoryId"
                                      placeholder={strings.Select + strings.TransactionCategory}
                                      options={
                                        filteredTransactionCategoryList
                                          ? selectOptionsFactory.renderOptions(
                                              'transactionCategoryName',
                                              'transactionCategoryId',
                                              filteredTransactionCategoryList
                                                .filter(
                                                  category =>
                                                    isRegisteredVat ||
                                                    ![
                                                      'VAT Penalty',
                                                      'Output VAT Adjustment',
                                                      'Input VAT Adjustment',
                                                      'VAT Payable',
                                                      'GCC VAT Payable',
                                                      'Output VAT',
                                                      'Input VAT',
                                                    ].includes(
                                                      category.transactionCategoryName.trim()
                                                    )
                                                )
                                                .sort((a, b) =>
                                                  a.transactionCategoryName.localeCompare(
                                                    b.transactionCategoryName
                                                  )
                                                ),
                                              'Transaction Category'
                                            )
                                          : []
                                      }
                                      styles={selectStyles}
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

                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="effectiveDate">
                                  <span className="text-danger">* </span>
                                  {strings.OpeningDate}
                                </Label>
                                <Controller
                                  name="effectiveDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      {...field}
                                      id="date"
                                      selected={field.value}
                                      onChange={date => field.onChange(date)}
                                      className={`form-control ${
                                        errors.effectiveDate ? 'is-invalid' : ''
                                      }`}
                                      placeholderText={strings.Enter + strings.EffectiveDate}
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode="select"
                                      dateFormat="dd-MM-yyyy"
                                    />
                                  )}
                                />
                                {errors.effectiveDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.effectiveDate.message &&
                                    errors.effectiveDate.message.includes('nullable()')
                                      ? 'Opening date is required'
                                      : errors.effectiveDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
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
                                      maxLength="14,2"
                                      id="openingBalance"
                                      rows="5"
                                      className={errors.openingBalance ? 'is-invalid' : ''}
                                      onChange={e => {
                                        if (e.target.value === '' || regEx.test(e.target.value)) {
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
                            <FormGroup className="text-right ml-3 mt-5">
                              <Button
                                type="submit"
                                name="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={async () => {
                                  const isValid = await trigger();
                                  if (!isValid) {
                                    commonActions.fillManDatoryDetails();
                                  }
                                }}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Creating...' : strings.Create}
                              </Button>

                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/accountant/opening-balance');
                                }}
                              >
                                <Ban className="h-4 w-4" /> {strings.Cancel}
                              </Button>
                            </FormGroup>
                          </Row>
                        </form>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
          {loading ? <Loader></Loader> : ''}
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateOpeningBalance);
