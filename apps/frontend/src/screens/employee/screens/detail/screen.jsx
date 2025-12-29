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
import { Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectStyles } from 'utils';
import * as EmployeeActions from '../../actions';
import * as EmployeeDetailActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { UserCircle, Trash2, CircleDot, Ban } from 'lucide-react';

const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

// Zod validation schema
const detailEmployeeSchema = z
  .object({
    id: z.number().or(z.string()),
    firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
    middleName: z.string().min(1, 'Middle name is required').max(100, 'Middle name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
    email: z.string().optional(),
    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Must contain 8 characters, one uppercase, one lowercase, one number and one special case character'
      )
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional(),
    dob: z.date({
      required_error: 'DOB is required',
      invalid_type_error: 'DOB is required',
    }),
    referenceCode: z.string().max(100, 'Reference code is too long').optional(),
    title: z.string().max(100, 'Title is too long').optional(),
    billingEmail: z
      .string()
      .email('Valid email is required')
      .max(80, 'Billing email is too long')
      .optional()
      .or(z.literal('')),
    vatRegestationNo: z.string().max(15, 'Tax registration number is too long').optional(),
    currencyCode: z
      .object({
        value: z.number(),
        label: z.string(),
      })
      .nullable()
      .optional()
      .or(z.string()),
    poBoxNumber: z.string().max(8, 'Contract PO number is too long').optional(),
  })
  .refine(
    data => {
      if (data.password && data.password !== '') {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords must match',
      path: ['confirmPassword'],
    }
  );

const mapStateToProps = state => {
  return {
    currency_list: state.employee.currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    employeeDetailActions: bindActionCreators(EmployeeDetailActions, dispatch),
  };
};

const DetailEmployee = ({
  commonActions,
  employeeActions,
  employeeDetailActions,
  currency_list,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

  const form = useForm({
    resolver: zodResolver(detailEmployeeSchema),
    defaultValues: {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: '',
      referenceCode: '',
      title: '',
      billingEmail: '',
      vatRegestationNo: '',
      currencyCode: '',
      poBoxNumber: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const initializeData = useCallback(() => {
    if (location.state && location.state.id) {
      employeeActions.getCurrencyList();
      employeeDetailActions
        .getEmployeeDetail(location.state.id)
        .then(res => {
          if (res.status === 200) {
            setCurrentEmployeeId(location.state.id);
            reset({
              id: res.data.id || '',
              firstName: res.data.firstName || '',
              middleName: res.data.middleName || '',
              lastName: res.data.lastName || '',
              email: res.data.email || '',
              password: res.data.password || '',
              confirmPassword: '',
              dob: res.data.dob ? new Date(res.data.dob) : '',
              referenceCode: res.data.referenceCode || '',
              title: res.data.title || '',
              billingEmail: res.data.billingEmail || '',
              vatRegestationNo: res.data.vatRegestationNo || '',
              currencyCode: res.data.currencyCode || '',
              poBoxNumber: res.data.poBoxNumber || '',
            });
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
    } else {
      history.push('/admin/master/employee');
    }
  }, [location.state, employeeActions, employeeDetailActions, commonActions, reset, history]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const onSubmit = data => {
    const postData = Object.assign({}, data);
    if (typeof postData.currencyCode === 'object') {
      postData.currencyCode = data.currencyCode.value;
    }

    setLoading(true);
    setLoadingMsg('Updating Employee...');

    employeeDetailActions
      .updateEmployee(postData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Employee Updated Successfully'
          );
          history.push('/admin/master/employee');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Employee Updated Unsuccessfully'
        );
        setLoading(false);
      });
  };

  const deleteEmployee = () => {
    const message1 = (
      <text>
        <b>Delete Employee?</b>
      </text>
    );
    const message = 'This Employee will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeEmployee}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeEmployee = () => {
    setLoading(true);
    setLoadingMsg('Deleting Employee...');
    employeeDetailActions
      .deleteEmployee(currentEmployeeId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Employee Deleted Successfully !!'
          );
          history.push('/admin/master/employee');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Employee Deleted Unsuccessfully'
        );
        setLoading(false);
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
      <div className="detail-employee-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <UserCircle className="h-4 w-4" />
                        <span className="ml-2">Update Employee</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <h4 className="mb-4">Contact Name</h4>
                        <Row>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="referenceCode">Reference Code</Label>
                              <Controller
                                name="referenceCode"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    id="referenceCode"
                                    placeholder="Enter Reference Code"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExBoth.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.referenceCode ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.referenceCode && (
                                <div className="invalid-feedback">
                                  {errors.referenceCode.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="title">Title</Label>
                              <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    id="title"
                                    placeholder="Enter Title"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.title ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.title && (
                                <div className="invalid-feedback">{errors.title.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="email">
                                <span className="text-danger">* </span>Email
                              </Label>
                              <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="email"
                                    maxLength="80"
                                    id="email"
                                    placeholder="Enter Email Address"
                                    {...field}
                                    className={errors.email ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.email && (
                                <div className="invalid-feedback">{errors.email.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="firstName">
                                <span className="text-danger">* </span>First Name
                              </Label>
                              <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="firstName"
                                    placeholder="Enter First Name"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.firstName ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.firstName && (
                                <div className="invalid-feedback">{errors.firstName.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="middleName">
                                <span className="text-danger">* </span>Middle Name
                              </Label>
                              <Controller
                                name="middleName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="middleName"
                                    placeholder="Enter Middle Name"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.middleName ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.middleName && (
                                <div className="invalid-feedback">{errors.middleName.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="lastName">
                                <span className="text-danger">* </span>Last Name
                              </Label>
                              <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="lastName"
                                    placeholder="Enter Last Name"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.lastName ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.lastName && (
                                <div className="invalid-feedback">{errors.lastName.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="password">Password</Label>
                              <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="password"
                                    id="password"
                                    placeholder="Enter Password"
                                    {...field}
                                    className={errors.password ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.password ? (
                                <div className="invalid-feedback">{errors.password.message}</div>
                              ) : (
                                <span className="password-msg">
                                  Must Contain 8 Characters, One Uppercase, One Lowercase, One
                                  Number and one special case Character.
                                </span>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <Controller
                                name="confirmPassword"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Enter Confirm Password"
                                    {...field}
                                    className={errors.confirmPassword ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.confirmPassword && (
                                <div className="invalid-feedback">
                                  {errors.confirmPassword.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup className="mb-3">
                              <Label htmlFor="dob">Date Of Birth</Label>
                              <Controller
                                name="dob"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                                    id="dob"
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    placeholderText="Select Date of Birth"
                                    selected={field.value}
                                    maxDate={new Date()}
                                    onChange={date => field.onChange(date)}
                                  />
                                )}
                              />
                              {errors.dob && (
                                <div className="invalid-feedback d-block">{errors.dob.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <h4 className="mb-3 mt-3">Invoicing Details</h4>
                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="billingEmail">Billing Email</Label>
                              <Controller
                                name="billingEmail"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="80"
                                    id="billingEmail"
                                    placeholder="Enter Billing Email Address"
                                    {...field}
                                    className={errors.billingEmail ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.billingEmail && (
                                <div className="invalid-feedback">
                                  {errors.billingEmail.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="poBoxNumber">Contract PO Number</Label>
                              <Controller
                                name="poBoxNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="8"
                                    id="poBoxNumber"
                                    placeholder="Enter Contract PO Number"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExBoth.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.poBoxNumber ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.poBoxNumber && (
                                <div className="invalid-feedback">{errors.poBoxNumber.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="vatRegestationNo">Tax Registration Number</Label>
                              <Controller
                                name="vatRegestationNo"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="15"
                                    id="vatRegestationNo"
                                    placeholder="Enter Tax Registration Number"
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExBoth.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.vatRegestationNo ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.vatRegestationNo && (
                                <div className="invalid-feedback">
                                  {errors.vatRegestationNo.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="currencyCode">Currency Code</Label>
                              <Controller
                                name="currencyCode"
                                control={control}
                                render={({ field }) => (
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
                                      currency_list && typeof field.value === 'string'
                                        ? selectCurrencyFactory
                                            .renderOptions(
                                              'currencyName',
                                              'currencyCode',
                                              currency_list,
                                              'Currency'
                                            )
                                            .find(option => option.value === +field.value)
                                        : field.value
                                    }
                                    onChange={option => {
                                      field.onChange(option);
                                    }}
                                    placeholder="Select Currency"
                                    id="currencyCode"
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
                        </Row>
                        <Row>
                          <Col
                            lg={12}
                            className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                          >
                            <FormGroup>
                              <Button
                                type="button"
                                color="danger"
                                className="btn-square"
                                onClick={deleteEmployee}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button type="submit" color="primary" className="btn-square mr-3">
                                <CircleDot className="h-4 w-4" /> Update
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/master/employee');
                                }}
                              >
                                <Ban className="h-4 w-4" /> Cancel
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
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailEmployee);
