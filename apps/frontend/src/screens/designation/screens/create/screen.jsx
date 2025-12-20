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
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { LeavePage } from 'components';
import { selectOptionsFactory, selectStyles } from 'utils';
import { CommonActions } from 'services/global';
import * as SalaryRoleActions from '../../actions';
import * as EmployeeDesignationCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createDesignationSchema = z.object({
  designationName: z
    .string()
    .min(1, 'Designation name is required')
    .max(30, 'Designation name is too long'),
  designationType: z
    .object({
      value: z.union([z.number(), z.string()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, strings.DesignationTypeIsRequired),
  designationId: z
    .string()
    .min(1, 'Designation id is required')
    .max(9, 'Designation id is too long'),
}).refine(
  (data) => {
    const id = parseInt(data.designationId);
    return id !== 0;
  },
  {
    message: 'Enter valid designation ID',
    path: ['designationId'],
  }
);

const mapStateToProps = (state) => {
  return {
    currency_list: state.employee.currency_list,
    designationType_list: state.employeeDesignation.designationType_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    salaryRoleActions: bindActionCreators(SalaryRoleActions, dispatch),
    employeeDesignationCreateAction: bindActionCreators(
      EmployeeDesignationCreateActions,
      dispatch
    ),
  };
};

const regEx = /^[0-9\d]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const CreateDesignation = ({
  commonActions,
  salaryRoleActions,
  employeeDesignationCreateAction,
  designationType_list,
  history,
}) => {
  const [createMore, setCreateMore] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [idExist, setIdExist] = useState(false);
  const [nameExist, setNameExist] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createDesignationSchema),
    defaultValues: {
      designationName: '',
      designationId: '',
      designationType: null,
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
    trigger,
  } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    salaryRoleActions.getParentDesignationList();
  };

  const designationNamevalidationCheck = useCallback(
    (value) => {
      const data = {
        moduleType: 26,
        name: value,
      };
      commonActions.checkValidation(data).then((response) => {
        if (response.data === 'Designation name already exists') {
          setNameExist(true);
          setError('designationName', {
            type: 'manual',
            message: 'Designation name already exist',
          });
        } else {
          setNameExist(false);
          clearErrors('designationName');
        }
      });
    },
    [commonActions, setError, clearErrors]
  );

  const designationIdvalidationCheck = useCallback(
    (value) => {
      const data = {
        moduleType: 25,
        name: value,
      };
      commonActions.checkValidation(data).then((response) => {
        if (response.data === 'Designation ID already exists') {
          setIdExist(true);
          setError('designationId', {
            type: 'manual',
            message: 'Designation ID already exist',
          });
        } else {
          setIdExist(false);
          clearErrors('designationId');
        }
      });
    },
    [commonActions, setError, clearErrors]
  );

  const onSubmit = (data) => {
    // Check for existing ID or reserved IDs
    const id = parseInt(data.designationId);
    if (
      idExist ||
      id === 1 ||
      id === 2 ||
      id === 3 ||
      id === 4
    ) {
      setError('designationId', {
        type: 'manual',
        message: 'Designation ID already exist',
      });
      return;
    }

    if (nameExist) {
      setError('designationName', {
        type: 'manual',
        message: 'Designation name already exist',
      });
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const { designationName, designationId, designationType } = data;

    const formData = new FormData();
    formData.append('designationId', designationId != null ? designationId : '');
    formData.append(
      'designationName',
      designationName != null ? designationName : ''
    );
    formData.append(
      'parentId',
      designationType
        ? designationType.value
          ? designationType.value
          : designationType
        : ''
    );

    employeeDesignationCreateAction
      .createEmployeeDesignation(formData)
      .then((res) => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            'New Employee Designation Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            setDisableLeavePage(false);
            setDisabled(false);
            reset();
          } else {
            history.push('/admin/payroll/config', { tabNo: '3' });
          }
        }
      })
      .catch((err) => {
        setDisabled(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const handleDesignationIdChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regEx.test(value)) {
      onChange(e);
      if (value) {
        designationIdvalidationCheck(value);
      }
    }
  };

  const handleDesignationNameChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      onChange(e);
      if (value) {
        designationNamevalidationCheck(value);
      }
    }
  };

  const handleFormSubmit = async (isCreateMore) => {
    setCreateMore(isCreateMore);
    const isValid = await trigger();
    if (!isValid) {
      commonActions.fillManDatoryDetails();
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
                      <span className="ml-2">{strings.CreateDesignation}</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <Row>
                        <Col lg={10}>
                          <Row className="row-wrapper">
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="designationId">
                                  <span className="text-danger">* </span>
                                  {strings.DESIGNATIONID}
                                </Label>
                                <Controller
                                  name="designationId"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="designationId"
                                      maxLength="9"
                                      placeholder={
                                        strings.Enter + strings.DESIGNATIONID
                                      }
                                      {...field}
                                      onChange={(e) =>
                                        handleDesignationIdChange(e, field.onChange)
                                      }
                                      className={
                                        errors.designationId ? 'is-invalid' : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.designationId && (
                                  <div className="invalid-feedback">
                                    {errors.designationId.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="designationName">
                                  <span className="text-danger">* </span>
                                  {strings.DesignationName}
                                </Label>
                                <Controller
                                  name="designationName"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      id="designationName"
                                      maxLength="30"
                                      placeholder={
                                        strings.Enter + strings.DesignationName
                                      }
                                      {...field}
                                      onChange={(e) =>
                                        handleDesignationNameChange(
                                          e,
                                          field.onChange
                                        )
                                      }
                                      className={
                                        errors.designationName ? 'is-invalid' : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.designationName && (
                                  <div className="invalid-feedback">
                                    {errors.designationName.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="designationType">
                                  <span className="text-danger">* </span>
                                  {strings.DesignationType}
                                  <i
                                    id="designationTypeTooltip"
                                    className="fa fa-question-circle ml-1"
                                  ></i>
                                  <UncontrolledTooltip
                                    placement="right"
                                    target="designationTypeTooltip"
                                  >
                                    Based on the designation type selected, the chart
                                    of accounts will be created for the employee. This
                                    field will be locked once the designation has been
                                    assigned to an employee.
                                  </UncontrolledTooltip>
                                </Label>
                                <Controller
                                  name="designationType"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      id="designationType"
                                      options={
                                        designationType_list
                                          ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              designationType_list,
                                              strings.DesignationType
                                            )
                                          : []
                                      }
                                      placeholder={
                                        strings.Select + strings.DesignationType
                                      }
                                      styles={selectStyles}
                                      className={
                                        errors.designationType ? 'is-invalid' : ''
                                      }
                                      isClearable
                                    />
                                  )}
                                />
                                {errors.designationType && (
                                  <div className="invalid-feedback">
                                    {errors.designationType.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <hr />
                          <Row>
                            <Col>
                              <p>
                                <strong>Note:</strong> If the designation is
                                assigned to an employee, it cannot be deleted.
                              </p>
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
                              disabled={disabled}
                              onClick={() => handleFormSubmit(false)}
                            >
                              <i className="fa fa-dot-circle-o"></i>{' '}
                              {strings.Create}
                            </Button>
                            <Button
                              type="submit"
                              name="button"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={() => handleFormSubmit(true)}
                            >
                              <i className="fa fa-refresh"></i>{' '}
                              {strings.CreateandMore}
                            </Button>
                            <Button
                              type="button"
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                history.push('/admin/payroll/config', {
                                  tabNo: '3',
                                });
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateDesignation);
