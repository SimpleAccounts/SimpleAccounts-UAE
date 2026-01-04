import { useState, useEffect } from 'react';
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
import DatePicker from 'react-datepicker';
import { CommonActions } from 'services/global';
import * as EmployeeActions from '../../actions';
import * as EmploymentCreateActions from './actions';

import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { UserCircle, CircleDot, RefreshCw, Ban } from 'lucide-react';

// Zod validation schema
const createEmploymentSchema = z.object({
  department: z.string().optional(),
  dateOfJoining: z.date().nullable().optional(),
  contractType: z.string().optional(),
  labourCard: z.string().optional(),
  availedLeaves: z.string().optional(),
  leavesAvailed: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.date().nullable().optional(),
  visaNumber: z.string().optional(),
  visaExpiryDate: z.date().nullable().optional(),
  grossSalary: z.string().optional(),
  employeeCode: z.string().optional(),
});

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
    employmentCreateActions: bindActionCreators(EmploymentCreateActions, dispatch),
  };
};

const regEx = /^[0-9]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const CreateEmployment = ({
  currency_list,
  country_list,
  state_list,
  commonActions,
  employeeActions,
  employmentCreateActions,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createEmploymentSchema),
    defaultValues: {
      department: '',
      dateOfJoining: null,
      contractType: '',
      labourCard: '',
      availedLeaves: '',
      leavesAvailed: '',
      passportNumber: '',
      passportExpiryDate: null,
      visaNumber: '',
      visaExpiryDate: null,
      grossSalary: '',
      employeeCode: '',
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
    initializeData();
  }, []);

  const initializeData = () => {
    // employeeActions.getCountryList();
  };

  const onSubmit = data => {
    setDisabled(true);

    const {
      department,
      dateOfJoining,
      contractType,
      labourCard,
      availedLeaves,
      leavesAvailed,
      passportNumber,
      passportExpiryDate,
      visaNumber,
      visaExpiryDate,
      grossSalary,
    } = data;

    const formData = new FormData();

    formData.append('department', department !== null ? department : '');
    formData.append('dateOfJoining', dateOfJoining !== null ? dateOfJoining : '');
    formData.append('contractType', contractType !== null ? contractType : '');
    formData.append('labourCard', labourCard != null ? labourCard : '');
    formData.append('availedLeaves', availedLeaves != null ? availedLeaves : '');
    formData.append('leavesAvailed', leavesAvailed != null ? leavesAvailed : '');
    formData.append('passportNumber', passportNumber != null ? passportNumber : '');
    formData.append('passportExpiryDate', passportExpiryDate != null ? passportExpiryDate : '');
    formData.append('visaNumber', visaNumber != null ? visaNumber : '');
    formData.append('visaExpiryDate', visaExpiryDate != null ? visaExpiryDate : '');
    formData.append('grossSalary', grossSalary != null ? grossSalary : '');

    employmentCreateActions
      .createEmployment(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            reset();
          } else {
            history.push('/admin/master/employee');
          }
          setDisabled(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data.message ? err.data.message : 'Created Unsuccessfully'
        );
        setDisabled(false);
      });
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
                      <UserCircle className="h-4 w-4" />
                      <span className="ml-2">Create Employment</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <h4 className="mb-4">Employment</h4>
                      <Row>
                        <Col lg={10}>
                          <Row>
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="department">Department</Label>
                                <Controller
                                  name="department"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="100"
                                      id="department"
                                      placeholder="Enter department"
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regExAlpha.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={errors.department ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.department && (
                                  <div className="invalid-feedback">
                                    {errors.department.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label htmlFor="dateOfJoining">
                                  <span className="text-danger">* </span>Date Of Joining
                                </Label>
                                <Controller
                                  name="dateOfJoining"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      className={`form-control ${errors.dateOfJoining ? 'is-invalid' : ''}`}
                                      id="dateOfJoining"
                                      placeholderText="Select Date Of Joining"
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      dropdownMode="select"
                                      selected={field.value}
                                      onChange={date => field.onChange(date)}
                                    />
                                  )}
                                />
                                {errors.dateOfJoining && (
                                  <div className="invalid-feedback">
                                    {errors.dateOfJoining.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="employeeCode">Employee Code</Label>
                                <Controller
                                  name="employeeCode"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="50"
                                      id="employeeCode"
                                      placeholder="Enter Employee Code"
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regExAlpha.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={errors.employeeCode ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.employeeCode && (
                                  <div className="invalid-feedback">
                                    {errors.employeeCode.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="labourCard">Labour Card</Label>
                                <Controller
                                  name="labourCard"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="labourCard"
                                      placeholder="Enter Labour Card"
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regExAlpha.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={errors.labourCard ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.labourCard && (
                                  <div className="invalid-feedback">
                                    {errors.labourCard.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="availedLeaves">Available Leaves</Label>
                                <Controller
                                  name="availedLeaves"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="availedLeaves"
                                      placeholder="Enter Available Leaves"
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regExAlpha.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={errors.availedLeaves ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.availedLeaves && (
                                  <div className="invalid-feedback">
                                    {errors.availedLeaves.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="leavesAvailed">Leaves Availed</Label>
                                <Controller
                                  name="leavesAvailed"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="leavesAvailed"
                                      placeholder="Enter Leaves Availed"
                                      {...field}
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regExAlpha.test(e.target.value)
                                        ) {
                                          field.onChange(e);
                                        }
                                      }}
                                      className={errors.leavesAvailed ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.leavesAvailed && (
                                  <div className="invalid-feedback">
                                    {errors.leavesAvailed.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="row-wrapper">
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="passportNumber">Passport Number</Label>
                                <Controller
                                  name="passportNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="9"
                                      id="passportNumber"
                                      placeholder="Enter Passport Number"
                                      {...field}
                                      className={errors.passportNumber ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.passportNumber && (
                                  <div className="invalid-feedback">
                                    {errors.passportNumber.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup className="mb-3">
                                <Label htmlFor="passportExpiryDate">
                                  <span className="text-danger">* </span>Passport Expiry Date
                                </Label>
                                <Controller
                                  name="passportExpiryDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      className={`form-control ${errors.passportExpiryDate ? 'is-invalid' : ''}`}
                                      id="passportExpiryDate"
                                      placeholderText="Select Passport Expiry Date"
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
                                <Label htmlFor="visaNumber">Visa Number</Label>
                                <Controller
                                  name="visaNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="9"
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
                                  <span className="text-danger">* </span>Visa Expiry Date
                                </Label>
                                <Controller
                                  name="visaExpiryDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      className={`form-control ${errors.visaExpiryDate ? 'is-invalid' : ''}`}
                                      id="visaExpiryDate"
                                      placeholderText="Select Visa Expiry Date"
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

                          <Row>
                            <Col md="4">
                              <FormGroup>
                                <Label htmlFor="grossSalary">Gross Salary</Label>
                                <Controller
                                  name="grossSalary"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="14,2"
                                      id="grossSalary"
                                      placeholder="Enter Gross Salary"
                                      {...field}
                                      className={errors.grossSalary ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                                {errors.grossSalary && (
                                  <div className="invalid-feedback">
                                    {errors.grossSalary.message}
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
                              <CircleDot className="h-4 w-4" /> Create
                            </Button>
                            <Button
                              type="submit"
                              name="button"
                              color="primary"
                              className="btn-square mr-3"
                              onClick={() => setCreateMore(true)}
                              disabled={disabled}
                            >
                              <RefreshCw className="h-4 w-4" /> Create and More
                            </Button>
                            <Button
                              type="button"
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                history.push('/admin/payroll/employment');
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
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEmployment);
