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
  UncontrolledTooltip,
} from 'reactstrap';
import { Loader, LeavePage } from 'components';
import { CommonActions } from 'services/global';
import DatePicker from 'react-datepicker';
import * as DetailEmployeeEmployementAction from './actions';
import * as CreatePayrollEmployeeActions from '../create/actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import { Ban, CircleDot, HelpCircle, UserPlus } from 'lucide-react';

const mapStateToProps = state => {
  return {
    salary_role_dropdown: state.payrollEmployee.salary_role_dropdown,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailEmployeeEmployementAction: bindActionCreators(DetailEmployeeEmployementAction, dispatch),
    createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const regExAlpha = /^[a-zA-Z ]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;

// Zod validation schema
const updateEmployeeEmploymentSchema = z.object({
  employeeCode: z
    .string()
    .min(1, 'Employee unique id is required')
    .max(14, 'Employee unique id must be at most 14 characters'),
  labourCard: z
    .string()
    .min(1, 'Labour card id is required')
    .max(14, 'Labour card id must be at most 14 characters')
    .regex(/[a-zA-Z0-9]+$/, 'Invalid labour card id'),
  dateOfJoining: z.date({
    required_error: 'Date of joining is required',
    invalid_type_error: 'Date of joining is required',
  }),
  department: z.string().optional(),
  passportNumber: z
    .string()
    .max(9, 'Passport number is too long')
    .regex(/[a-zA-Z0-9]*$/, 'Invalid passport number')
    .optional()
    .or(z.literal('')),
  passportExpiryDate: z.date().nullable().optional(),
  salaryRoleId: z.string().optional(),
});

const UpdateEmployeeEmployment = ({
  commonActions,
  detailEmployeeEmployementAction,
  createPayrollEmployeeActions,
  salary_role_dropdown,
  location,
  history,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [employmentId, setEmploymentId] = useState('');
  const [exist, setExist] = useState(false);
  const [laborCardIdexist, setLaborCardIdexist] = useState(false);
  const [employeeChildActivitiesPresentOrNot, setEmployeeChildActivitiesPresentOrNot] =
    useState(false);

  const form = useForm({
    resolver: zodResolver(updateEmployeeEmploymentSchema),
    defaultValues: {
      employeeCode: '',
      labourCard: '',
      department: '',
      dateOfJoining: null,
      passportNumber: '',
      passportExpiryDate: null,
      salaryRoleId: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const employeeCode = watch('employeeCode');
  const labourCard = watch('labourCard');

  useEffect(() => {
    if (location.state?.id) {
      detailEmployeeEmployementAction
        .getEmployeeById(location.state.id)
        .then(res => {
          if (res.status === 200) {
            createPayrollEmployeeActions.getSalaryRolesForDropdown();
            setLoading(false);
            setEmploymentId(res.data.employmentId || '');
            setEmployeeChildActivitiesPresentOrNot(res.data.employeeChildActivitiesPresentOrNot);

            setValue('employeeCode', res.data.employeeCode || '');
            setValue('department', res.data.department || '');
            setValue('labourCard', res.data.labourCard || '');
            setValue(
              'dateOfJoining',
              res.data.dateOfJoining ? dayjs(res.data.dateOfJoining, 'DD-MM-YYYY').toDate() : null
            );
            setValue('passportNumber', res.data.passportNumber || '');
            setValue(
              'passportExpiryDate',
              res.data.passportExpiryDate
                ? dayjs(res.data.passportExpiryDate, 'DD-MM-YYYY').toDate()
                : null
            );
            setValue('salaryRoleId', res.data.salaryRoleId || '');
          }
        })
        .catch(err => {
          setLoading(false);
          history.push('/admin/master/employee/viewEmployee', { id: location.state.id });
        });
    } else {
      history.push('/admin/master/employee/viewEmployee', { id: location.state.id });
    }
  }, [
    location.state,
    detailEmployeeEmployementAction,
    createPayrollEmployeeActions,
    setValue,
    history,
  ]);

  const employeeValidationCheck = useCallback(
    value => {
      const data = {
        moduleType: 15,
        name: value,
      };
      createPayrollEmployeeActions.checkValidation(data).then(response => {
        if (response.data === 'Employee Code Already Exists') {
          setExist(true);
        } else {
          setExist(false);
        }
      });
    },
    [createPayrollEmployeeActions]
  );

  const laborCardIdValidationCheck = useCallback(
    value => {
      const data = {
        moduleType: 23,
        name: value,
      };
      createPayrollEmployeeActions.checkValidation(data).then(response => {
        if (response.data === 'Labour Card Id Already Exists') {
          setLaborCardIdexist(true);
        } else {
          setLaborCardIdexist(false);
        }
      });
    },
    [createPayrollEmployeeActions]
  );

  useEffect(() => {
    if (employeeCode) {
      employeeValidationCheck(employeeCode);
    }
  }, [employeeCode, employeeValidationCheck]);

  useEffect(() => {
    if (labourCard) {
      laborCardIdValidationCheck(labourCard);
    }
  }, [labourCard, laborCardIdValidationCheck]);

  const onSubmit = data => {
    if (exist) {
      commonActions.tostifyAlert('error', 'Employee unique id already exists');
      return;
    }
    if (laborCardIdexist) {
      commonActions.tostifyAlert('error', 'Labour card id already exists');
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const {
      department,
      labourCard,
      passportNumber,
      dateOfJoining,
      passportExpiryDate,
      salaryRoleId,
      employeeCode,
    } = data;

    let formData = new FormData();
    formData.append('id', employmentId);
    formData.append('employee', location.state.id || '');
    formData.append('salaryRoleId', salaryRoleId || '');
    formData.append('department', department || '');
    formData.append('employeeCode', employeeCode || '');
    formData.append('labourCard', labourCard || '');
    formData.append('passportNumber', passportNumber || '');
    formData.append(
      'dateOfJoining',
      dateOfJoining ? dayjs(dateOfJoining).format('DD-MM-YYYY') : ''
    );
    formData.append(
      'passportExpiryDate',
      passportExpiryDate ? dayjs(passportExpiryDate).format('DD-MM-YYYY') : ''
    );

    setLoading(true);
    setLoadingMsg('Updating Employee ...');

    detailEmployeeEmployementAction
      .updateEmployment(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'Employee Updated Successfully'
          );
          history.push('/admin/master/employee/viewEmployee', { id: location.state.id });
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err.data?.message || 'Updated Unsuccessfully');
        setLoading(false);
        setDisabled(false);
        setDisableLeavePage(false);
      });
  };

  const handlePassportNumberChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regExBoth.test(inputValue)) {
      field.onChange(inputValue);
    }
  };

  const handleLabourCardChange = (e, field) => {
    const inputValue = e.target.value;
    if (inputValue === '' || regExBoth.test(inputValue)) {
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
                    <UserPlus className="h-4 w-4" />
                    <span className="ml-2"> {strings.UpdateEmployementDetails}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={8}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <Row>
                          <Col lg={12}>
                            <Row>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="employeeCode">
                                    <span className="text-danger">* </span>
                                    {strings.EmployeeCode}
                                    <HelpCircle
                                      id="employeeCodeTooltip"
                                      className="h-4 w-4 inline"
                                    />
                                    <UncontrolledTooltip
                                      placement="right"
                                      target="employeeCodeTooltip"
                                    >
                                      Employee Unique Id system is designed by the organization to
                                      identify the employee from a group of employees and his work
                                      details. i.e. Its Internal ID designed for Identifying
                                      Employee.
                                    </UncontrolledTooltip>
                                  </Label>
                                  <Controller
                                    name="employeeCode"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="14"
                                        autoComplete="off"
                                        id="employeeCode"
                                        placeholder={strings.Enter + strings.EmployeeCode}
                                        className={errors.employeeCode || exist ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.employeeCode && (
                                    <div className="invalid-feedback d-block">
                                      {errors.employeeCode.message}
                                    </div>
                                  )}
                                  {exist && !errors.employeeCode && (
                                    <div className="invalid-feedback d-block">
                                      Employee unique id already exists
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="labourCard">
                                    <span className="text-danger">* </span>
                                    {strings.LabourCardId}
                                    <HelpCircle id="labourCardTooltip" className="h-4 w-4 inline" />
                                    <UncontrolledTooltip
                                      placement="right"
                                      target="labourCardTooltip"
                                    >
                                      Labour Card Id (LIN) is a unique identification number issued
                                      to employers to simplifying business regulations and bringing
                                      in transparency and accountability in labor inspections by
                                      various agencies and bodies under the administrative control
                                      of Labour Ministry. It will be available in SIF-file.
                                    </UncontrolledTooltip>
                                  </Label>
                                  <Controller
                                    name="labourCard"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="14"
                                        id="labourCard"
                                        autoComplete="off"
                                        placeholder={strings.Enter + strings.LabourCardId}
                                        onChange={e => handleLabourCardChange(e, field)}
                                        className={
                                          errors.labourCard || laborCardIdexist ? 'is-invalid' : ''
                                        }
                                      />
                                    )}
                                  />
                                  {errors.labourCard && (
                                    <div className="invalid-feedback d-block">
                                      {errors.labourCard.message}
                                    </div>
                                  )}
                                  {laborCardIdexist && !errors.labourCard && (
                                    <div className="invalid-feedback d-block">
                                      Labour card id already exists
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="department">{strings.Department}</Label>
                                  <Controller
                                    name="department"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="100"
                                        id="department"
                                        placeholder={strings.Enter + strings.Department}
                                        className={errors.department ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.department && (
                                    <div className="invalid-feedback d-block">
                                      {errors.department.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup className="mb-3">
                                  <Label htmlFor="dateOfJoining">
                                    <span className="text-danger">* </span>
                                    {strings.DateOfJoining}
                                  </Label>
                                  <Controller
                                    name="dateOfJoining"
                                    control={control}
                                    render={({ field }) => (
                                      <DatePicker
                                        {...field}
                                        disabled={employeeChildActivitiesPresentOrNot}
                                        className={`form-control ${errors.dateOfJoining ? 'is-invalid' : ''}`}
                                        id="dateOfJoining"
                                        placeholderText={strings.Select + strings.DateOfJoining}
                                        showMonthDropdown
                                        showYearDropdown
                                        autoComplete="off"
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        selected={field.value}
                                      />
                                    )}
                                  />
                                  {errors.dateOfJoining && (
                                    <div className="invalid-feedback d-block">
                                      {errors.dateOfJoining.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="passportNumber">{strings.PassportNumber}</Label>
                                  <Controller
                                    name="passportNumber"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        maxLength="9"
                                        id="passportNumber"
                                        placeholder={strings.Enter + strings.PassportNumber}
                                        onChange={e => handlePassportNumberChange(e, field)}
                                        className={errors.passportNumber ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.passportNumber && (
                                    <div className="invalid-feedback d-block">
                                      {errors.passportNumber.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup className="mb-3">
                                  <Label htmlFor="passportExpiryDate">
                                    {strings.PassportExpiryDate}
                                  </Label>
                                  <Controller
                                    name="passportExpiryDate"
                                    control={control}
                                    render={({ field }) => (
                                      <DatePicker
                                        {...field}
                                        className={`form-control ${errors.passportExpiryDate ? 'is-invalid' : ''}`}
                                        id="passportExpiryDate"
                                        placeholderText={
                                          strings.Select + strings.PassportExpiryDate
                                        }
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        selected={field.value}
                                      />
                                    )}
                                  />
                                  {errors.passportExpiryDate && (
                                    <div className="invalid-feedback d-block">
                                      {errors.passportExpiryDate.message}
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

export default connect(mapStateToProps, mapDispatchToProps)(UpdateEmployeeEmployment);
