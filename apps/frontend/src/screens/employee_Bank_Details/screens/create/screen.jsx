import React, { useState, useEffect } from 'react';
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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { ImageUploader } from 'components';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import * as EmployeeActions from '../../actions';
import * as EmployeeCreateActions from './actions';

import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

const mapStateToProps = state => {
  return {
    currency_list: state.employee.currency_list,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    employeeCreateActions: bindActionCreators(EmployeeCreateActions, dispatch),
  };
};

// Zod validation schema
const createEmployeeFinancialSchema = z.object({
  accountHolderName: z
    .string()
    .min(1, 'Account Holder Name is required')
    .max(100, 'Account Holder Name is too long')
    .regex(/^[a-zA-Z ]+$/, 'Only alphabets and spaces are allowed'),
  accountNumber: z.string().optional(),
  ibanNumber: z.string().max(23, 'IBAN Number cannot exceed 23 characters').optional(),
  bankName: z
    .string()
    .max(100, 'Bank Name is too long')
    .regex(/^[a-zA-Z ]+$/, 'Only alphabets and spaces are allowed')
    .optional()
    .or(z.literal('')),
  branch: z
    .string()
    .max(100, 'Branch is too long')
    .regex(/^[a-zA-Z ]+$/, 'Only alphabets and spaces are allowed')
    .optional()
    .or(z.literal('')),
  swiftCode: z
    .string()
    .min(8, 'Swift Code must be at least 8 characters')
    .max(11, 'Swift Code cannot exceed 11 characters')
    .optional()
    .or(z.literal('')),
  routingCode: z.string().optional().or(z.literal('')),
  passportExpiryDate: z.date().nullable().optional(),
  visaNumber: z
    .string()
    .max(16, 'Visa Number cannot exceed 16 characters')
    .optional()
    .or(z.literal('')),
  visaExpiryDate: z.date().nullable().optional(),
});

const regExAlpha = /^[a-zA-Z ]+$/;

const CreateEmployeeFinancial = ({
  currency_list,
  country_list,
  state_list,
  commonActions,
  employeeActions,
  employeeCreateActions,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createEmployeeFinancialSchema),
    defaultValues: {
      accountHolderName: '',
      routingCode: '',
      contractType: '',
      accountNumber: '',
      swiftCode: '',
      ibanNumber: '',
      branch: '',
      bankName: '',
      passportExpiryDate: null,
      visaNumber: '',
      visaExpiryDate: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // employeeActions.getCountryList();
  };

  const onSubmit = data => {
    setDisabled(true);

    const {
      accountHolderName,
      dateOfJoining,
      contractType,
      labourCard,
      availableLeaves,
      leaveAvailed,
      passportNumber,
      passportExpiryDate,
      visaNumber,
      visaExpiryDate,
    } = data;

    const formData = new FormData();

    formData.append('accountHolderName', accountHolderName !== null ? accountHolderName : '');
    formData.append('dateOfJoining', dateOfJoining !== null ? dateOfJoining : '');
    formData.append('contractType', contractType !== null ? contractType : '');

    employeeCreateActions
      .createEmployee(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'New Employee Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            reset();
          } else {
            history.push('/admin/master/employee');
          }
        }
        setDisabled(false);
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Employee Created Unsuccessfully'
        );
        setDisabled(false);
      });
  };

  const getStateList = countryCode => {
    employeeActions.getStateList(countryCode);
  };

  const handleAlphaChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      onChange(e);
    }
  };

  return (
    <div className="create-employee-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <i className="nav-icon fas fa-user-tie" />
                      <span className="ml-2">Create Financial</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <h4 className="mb-4">Financial Details</h4>
                      <Row>
                        <Col lg={10}>
                          <Row>
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="accountHolderName">Account Holder Name </Label>
                                <Controller
                                  name="accountHolderName"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="100"
                                      id="accountHolderName"
                                      placeholder="Enter accountHolderName"
                                      {...field}
                                      onChange={e => handleAlphaChange(e, field.onChange)}
                                      className={errors.accountHolderName ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.accountHolderName && (
                                  <div className="invalid-feedback">
                                    {errors.accountHolderName.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="accountNumber">Account Number</Label>
                                <Controller
                                  name="accountNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="23"
                                      id="accountNumber"
                                      placeholder="Enter account Number"
                                      {...field}
                                      onChange={e => handleAlphaChange(e, field.onChange)}
                                      className={errors.accountNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.accountNumber && (
                                  <div className="invalid-feedback">
                                    {errors.accountNumber.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="ibanNumber">IBAN Number</Label>
                                <Controller
                                  name="ibanNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="23"
                                      id="ibanNumber"
                                      placeholder="Enter IBAN Number"
                                      {...field}
                                      onChange={e => handleAlphaChange(e, field.onChange)}
                                      className={errors.ibanNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.ibanNumber && (
                                  <div className="invalid-feedback">
                                    {errors.ibanNumber.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Controller
                                  name="bankName"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="100"
                                      id="bankName"
                                      placeholder="Enter bank Name"
                                      {...field}
                                      onChange={e => handleAlphaChange(e, field.onChange)}
                                      className={errors.bankName ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.bankName && (
                                  <div className="invalid-feedback">{errors.bankName.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="branch">Branch</Label>
                                <Controller
                                  name="branch"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="100"
                                      id="branch"
                                      placeholder="Enter branch"
                                      {...field}
                                      onChange={e => handleAlphaChange(e, field.onChange)}
                                      className={errors.branch ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.branch && (
                                  <div className="invalid-feedback">{errors.branch.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="swiftCode">Swift Code</Label>
                                <Controller
                                  name="swiftCode"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      minLength="8"
                                      maxLength="11"
                                      id="swiftCode"
                                      placeholder="Enter swift Code"
                                      {...field}
                                      onChange={e => handleAlphaChange(e, field.onChange)}
                                      className={errors.swiftCode ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.swiftCode && (
                                  <div className="invalid-feedback">{errors.swiftCode.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="routingCode">Routing Code </Label>
                                <Controller
                                  name="routingCode"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="routingCode"
                                      placeholder="Enter Routing Code"
                                      {...field}
                                      className={errors.routingCode ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.routingCode && (
                                  <div className="invalid-feedback">
                                    {errors.routingCode.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label htmlFor="passportExpiryDate">
                                  <span className="text-danger">* </span>Passport expiry Date
                                </Label>
                                <Controller
                                  name="passportExpiryDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      className={`form-control ${errors.passportExpiryDate ? 'is-invalid' : ''}`}
                                      id="passportExpiryDate"
                                      placeholderText="Select passportExpiryDate"
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      dropdownMode="select"
                                      selected={field.value}
                                      onChange={date => field.onChange(date)}
                                    />
                                  )}
                                />
                                {errors.passportExpiryDate && (
                                  <div className="invalid-feedback">
                                    {errors.passportExpiryDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="visaNumber">Visa Number </Label>
                                <Controller
                                  name="visaNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="16"
                                      id="visaNumber"
                                      placeholder="Enter Visa Number"
                                      {...field}
                                      className={errors.visaNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.visaNumber && (
                                  <div className="invalid-feedback">
                                    {errors.visaNumber.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label htmlFor="visaExpiryDate">
                                  <span className="text-danger">* </span>Visa ExpiryDate
                                </Label>
                                <Controller
                                  name="visaExpiryDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      className={`form-control ${errors.visaExpiryDate ? 'is-invalid' : ''}`}
                                      id="visaExpiryDate"
                                      placeholderText="Select visa Expiry Date"
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      dropdownMode="select"
                                      selected={field.value}
                                      onChange={date => field.onChange(date)}
                                    />
                                  )}
                                />
                                {errors.visaExpiryDate && (
                                  <div className="invalid-feedback">
                                    {errors.visaExpiryDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row>
                        <Col lg={12} className="mt-5">
                          <FormGroup className="text-right">
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              onClick={() => setCreateMore(false)}
                              disabled={disabled}
                            >
                              <i className="fa fa-dot-circle-o"></i> Create
                            </Button>
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              onClick={() => setCreateMore(true)}
                              disabled={disabled}
                            >
                              <i className="fa fa-refresh"></i> Create and More
                            </Button>
                            <Button
                              type="button"
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                history.push('/admin/payroll/employee');
                              }}
                            >
                              <i className="fa fa-ban"></i> Cancel
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
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEmployeeFinancial);
