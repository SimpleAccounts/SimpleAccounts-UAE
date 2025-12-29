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
  Form,
  FormGroup,
  Label,
  Row,
  Col,
} from 'components/migration';
import { Loader, LeavePage } from 'components';
import Select from 'react-select';
import { CommonActions } from 'services/global';
import * as DetailEmployeeBankAction from './actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { selectOptionsFactory } from 'utils';
import * as CreatePayrollEmployeeActions from '../create/actions';
import { CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    designation_dropdown: state.payrollEmployee.designation_dropdown,
    employee_list_dropdown: state.payrollEmployee.employee_list_dropdown,
    state_list: state.payrollEmployee.state_list,
    country_list: state.payrollEmployee.country_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
    detailEmployeeBankAction: bindActionCreators(DetailEmployeeBankAction, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const regExNum = /^[0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;
const regEx = /^[0-9]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;

// Zod validation schema
const updateEmployeeBankSchema = z.object({
  accountHolderName: z
    .string()
    .min(1, 'Account holder name is required')
    .regex(/^[A-Za-z\s]+$/, 'Only alphabets and spaces are allowed'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .regex(/^[0-9]+$/, 'Only numbers are allowed')
    .refine(val => !/^0+$/.test(val), 'Please enter a valid Account number'),
  bankId: z
    .object({
      value: z.number().or(z.string()),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Bank name is required'),
  branch: z
    .string()
    .min(1, 'Branch is required')
    .regex(/^[a-zA-Z ]+$/, 'Only alphabets and spaces are allowed'),
  iban: z
    .string()
    .min(1, 'IBAN Number is required')
    .refine(val => !/^0+$/.test(val), 'Please enter a valid IBAN Number'),
  swiftCode: z.string().optional(),
  agentId: z
    .string()
    .min(1, 'Agent ID is required')
    .regex(/^[0-9]+$/, 'Only numbers are allowed')
    .min(9, 'Agent ID must be 9 digits')
    .max(9, 'Agent ID must be 9 digits'),
});

const UpdateEmployeeBank = ({
  commonActions,
  createPayrollEmployeeActions,
  detailEmployeeBankAction,
  location,
  history,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [employmentId, setEmploymentId] = useState('');
  const [employeeBankDetailsId, setEmployeeBankDetailsId] = useState('');
  const [existForAccountNumber, setExistForAccountNumber] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateEmployeeBankSchema),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      bankId: null,
      branch: '',
      iban: '',
      swiftCode: '',
      agentId: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = form;

  const accountNumber = watch('accountNumber');

  useEffect(() => {
    createPayrollEmployeeActions.getBankListForEmployees().then(response => {
      setBankList(response.data);
    });

    if (location.state?.id) {
      detailEmployeeBankAction
        .getEmployeeById(location.state.id)
        .then(res => {
          if (res.status === 200) {
            setLoading(false);
            setEmploymentId(res.data.employmentId || '');
            setEmployeeBankDetailsId(res.data.employeeBankDetailsId || '');

            setValue('accountHolderName', res.data.accountHolderName || res.data.fullName || '');
            setValue('agentId', res.data.agentId || '');
            setValue('accountNumber', res.data.accountNumber || '');
            setValue(
              'bankId',
              res.data.bankId ? { value: res.data.bankId, label: res.data.bankName } : null
            );
            setValue('iban', res.data.iban ? res.data.iban.replace('AE', '') : '');
            setValue('swiftCode', res.data.swiftCode || '');
            setValue('branch', res.data.branch || '');
          }
        })
        .catch(err => {
          setLoading(false);
          history.push('/admin/master/employee/viewEmployee', { id: location.state.id });
        });
    } else {
      history.push('/admin/master/employee/viewEmployee', { id: location.state.id });
    }
  }, [location.state, createPayrollEmployeeActions, detailEmployeeBankAction, setValue, history]);

  const checkAccountNumberExists = useCallback(
    value => {
      const data = {
        moduleType: 19,
        name: value,
      };
      createPayrollEmployeeActions.checkValidation(data).then(response => {
        if (response.data === 'Account Number Already Exists') {
          setExistForAccountNumber(true);
        } else {
          setExistForAccountNumber(false);
        }
      });
    },
    [createPayrollEmployeeActions]
  );

  useEffect(() => {
    if (accountNumber) {
      checkAccountNumberExists(accountNumber);
    }
  }, [accountNumber, checkAccountNumberExists]);

  const onSubmit = data => {
    if (existForAccountNumber) {
      commonActions.tostifyAlert('error', 'Account number already Exists');
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const { accountHolderName, accountNumber, iban, branch, swiftCode, bankId, agentId } = data;

    let formData = new FormData();
    formData.append('id', employeeBankDetailsId);
    formData.append('employee', location.state.id || '');
    formData.append('accountHolderName', accountHolderName || '');
    formData.append('accountNumber', accountNumber || '');
    formData.append('iban', iban ? 'AE' + iban : '');

    if (bankId?.value) {
      formData.append('bankId', bankId.value);
    }
    if (bankId?.label) {
      formData.append('bankName', bankId.label);
    }

    formData.append('branch', branch || '');
    formData.append('swiftCode', swiftCode || '');
    formData.append('employmentId', employmentId || '');
    formData.append('agentId', agentId || '');

    setLoading(true);
    setLoadingMsg('Updating Employee Bank...');

    detailEmployeeBankAction
      .updateEmployeeBank(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'Employee Bank Updated Successfully'
          );
          history.push('/admin/master/employee/viewEmployee', { id: location.state.id });
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data?.message || 'Employee Bank Updated Unsuccessfully'
        );
        setLoading(false);
        setDisabled(false);
        setDisableLeavePage(false);
      });
  };

  const handleAccountHolderNameChange = (e, field) => {
    const inputValue = e.target.value;
    if (/^[A-Za-z\s]*$/.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  const handleAccountNumberChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regExNum.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  const handleBranchChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regExAlpha.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  const handleIbanChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regEx.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  const handleSwiftCodeChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regExBoth.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  const handleAgentIdChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regEx.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  strings.setLanguage(language);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2"> {strings.UpdateEmployeeBankDetails} </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={8}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <Row>
                          <Col lg={12}>
                            <h4>{strings.BankDetails}</h4>
                            <hr />

                            <Row>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="accountHolderName">
                                    <span className="text-danger">* </span>
                                    {strings.AccountHolderName}
                                  </Label>
                                  <Controller
                                    name="accountHolderName"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="100"
                                        id="accountHolderName"
                                        placeholder={strings.Enter + strings.AccountHolderName}
                                        onChange={e => handleAccountHolderNameChange(e, field)}
                                        className={errors.accountHolderName ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.accountHolderName && (
                                    <div className="invalid-feedback d-block">
                                      {errors.accountHolderName.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="accountNumber">
                                    <span className="text-danger">* </span>
                                    {strings.AccountNumber}
                                  </Label>
                                  <Controller
                                    name="accountNumber"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="25"
                                        id="accountNumber"
                                        placeholder={strings.Enter + strings.AccountNumber}
                                        onChange={e => handleAccountNumberChange(e, field)}
                                        className={
                                          errors.accountNumber || existForAccountNumber
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.accountNumber && (
                                    <div className="invalid-feedback d-block">
                                      {errors.accountNumber.message}
                                    </div>
                                  )}
                                  {existForAccountNumber && (
                                    <div className="invalid-feedback d-block">
                                      Account number already Exists
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="bankId">
                                    <span className="text-danger">* </span>
                                    {strings.BankName}
                                  </Label>
                                  <Controller
                                    name="bankId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
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
                                        id="bankId"
                                        className={errors.bankId ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.bankId && (
                                    <div className="invalid-feedback d-block">
                                      {errors.bankId.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row className="row-wrapper">
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="branch">
                                    <span className="text-danger">* </span>
                                    {strings.Branch}
                                  </Label>
                                  <Controller
                                    name="branch"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="100"
                                        id="branch"
                                        placeholder={strings.Enter + strings.Branch}
                                        onChange={e => handleBranchChange(e, field)}
                                        className={errors.branch ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.branch && (
                                    <div className="invalid-feedback d-block">
                                      {errors.branch.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="iban">
                                    <span className="text-danger">* </span>
                                    {strings.IBANNumber}
                                  </Label>
                                  <div style={{ display: 'flex' }}>
                                    <Input disabled style={{ width: '25%' }} value="AE" />
                                    <Controller
                                      name="iban"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="text"
                                          id="iban"
                                          maxLength="21"
                                          placeholder={strings.Enter + strings.IBANNumber}
                                          onChange={e => handleIbanChange(e, field)}
                                          className={errors.iban ? 'is-invalid' : ''}
                                        />
                                      )}
                                    />
                                  </div>
                                  {errors.iban && (
                                    <div className="invalid-feedback d-block">
                                      {errors.iban.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="swiftCode">{strings.SwiftCode}</Label>
                                  <Controller
                                    name="swiftCode"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="11"
                                        id="swiftCode"
                                        placeholder={strings.Enter + strings.SwiftCode}
                                        onChange={e => handleSwiftCodeChange(e, field)}
                                        className={errors.swiftCode ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.swiftCode && (
                                    <div className="invalid-feedback d-block">
                                      {errors.swiftCode.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="agentId">
                                    <span className="text-danger">* </span>
                                    {strings.agent_id}
                                  </Label>
                                  <Controller
                                    name="agentId"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="9"
                                        minLength="9"
                                        id="agentId"
                                        placeholder={strings.Enter + ' Agent Id'}
                                        onChange={e => handleAgentIdChange(e, field)}
                                        className={errors.agentId ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.agentId && (
                                    <div className="invalid-feedback d-block">
                                      {errors.agentId.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row className="pull-right">
                          <FormGroup className="text-right">
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={() => {
                                if (Object.keys(errors).length !== 0) {
                                  commonActions.fillManDatoryDetails();
                                }
                              }}
                            >
                              <CircleDot className="h-4 w-4" />{' '}
                              {disabled ? 'Updating...' : strings.Update}
                            </Button>
                            <Button
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                history.push('/admin/master/employee/viewEmployee', {
                                  id: location.state.id,
                                });
                              }}
                            >
                              <Ban className="h-4 w-4" /> {strings.Cancel}
                            </Button>
                          </FormGroup>
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
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateEmployeeBank);
