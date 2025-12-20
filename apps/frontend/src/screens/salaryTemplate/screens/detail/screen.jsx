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
import { Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectStyles } from 'utils';
import * as EmployeeActions from '../../actions';
import * as SalarayTemplateDetailActions from './actions';
import * as SalaryTemplateActions from './../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

const regExBoth = /[a-zA-Z0-9]+$/;

// Zod validation schema (empty as original had no validation)
const updateSalaryTemplateSchema = z.object({
  description: z.string().optional(),
  formula: z.string().optional(),
  salaryStructureId: z.string().optional(),
  salaryRoleId: z.string().optional(),
});

const mapStateToProps = state => {
  return {
    currency_list: state.employee.currency_list,
    salary_structure_dropdown: state.salarytemplate.salary_structure_dropdown,
    salary_role_dropdown: state.salarytemplate.salary_role_dropdown,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    salarayTemplateDetailActions: bindActionCreators(SalarayTemplateDetailActions, dispatch),
    salaryTemplateActions: bindActionCreators(SalaryTemplateActions, dispatch),
  };
};

const DetailSalaryTemplate = props => {
  const [loading, setLoading] = useState(true);
  const [currentSalaryTemplateId, setCurrentSalaryTemplateId] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(updateSalaryTemplateSchema),
    defaultValues: {
      description: '',
      formula: '',
      salaryStructureId: '',
      salaryRoleId: '',
    },
  });

  const description = watch('description');
  const formula = watch('formula');
  const salaryStructureId = watch('salaryStructureId');
  const salaryRoleId = watch('salaryRoleId');

  useEffect(() => {
    props.salaryTemplateActions.getSalaryStructureForDropdown();
    props.salaryTemplateActions.getSalaryRolesForDropdown();
    initializeData();
  }, []);

  const initializeData = () => {
    if (props.location.state && props.location.state.id) {
      props.salarayTemplateDetailActions
        .getSalaryTemplateById(props.location.state.id)
        .then(res => {
          if (res.status === 200) {
            setCurrentSalaryTemplateId(props.location.state.id);
            reset({
              description: res.data.description ? res.data.description : '',
              formula: res.data.formula ? res.data.formula : '',
              salaryStructureId:
                res.data.salaryStructureId && res.data.salaryStructureId !== null
                  ? res.data.salaryStructureId
                  : '',
              salaryRoleId:
                res.data.salaryRoleId && res.data.salaryRoleId !== null
                  ? res.data.salaryRoleId
                  : '',
            });
            setLoading(false);
          }
        })
        .catch(err => {
          props.commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    } else {
      props.history.push('/admin/payroll/salaryTemplates');
    }
  };

  const onSubmit = data => {
    setDisabled(true);

    const { salaryRoleId, salaryStructureId, description, formula } = data;

    let formData = new FormData();
    formData.append('id', currentSalaryTemplateId);
    formData.append('formula', formula ? formula : '');
    formData.append('description', description ? description : '');
    formData.append('salaryRoleId', salaryRoleId ? salaryRoleId : '');
    formData.append('salaryStructureId', salaryStructureId ? salaryStructureId : '');

    props.salarayTemplateDetailActions
      .updateSalaryTemplate(formData)
      .then(res => {
        setDisabled(false);
        props.commonActions.tostifyAlert('success', 'salary Template Updated Successfully.');
        props.history.push('/admin/payroll/salaryTemplate');
      })
      .catch(err => {
        setDisabled(false);
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
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
    const current_employee_id = currentSalaryTemplateId;
    props.employeeDetailActions
      .deleteEmployee(current_employee_id)
      .then(res => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert('success', 'Employee Deleted Successfully !!');
          props.history.push('/admin/master/employee');
        }
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const handleDescriptionChange = e => {
    const value = e.target.value;
    if (value === '' || regExBoth.test(value)) {
      setValue('description', value, { shouldValidate: true });
    }
  };

  const handleFormulaChange = e => {
    const value = e.target.value;
    if (value === '' || regExBoth.test(value)) {
      setValue('formula', value, { shouldValidate: true });
    }
  };

  const handleUpdateClick = () => {
    if (errors && Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
    }
  };

  if (loading) {
    return <Loader />;
  }

  const { salary_structure_dropdown, salary_role_dropdown } = props;

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
                        <i className="nav-icon fas fa-user-tie" />
                        <span className="ml-2">Update Salary Template</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={10}>
                            <Row className="row-wrapper">
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">
                                    <span className="text-danger">* </span>Description
                                  </Label>
                                  <Input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={description}
                                    placeholder="Enter Salary description"
                                    onChange={handleDescriptionChange}
                                    className={
                                      errors.description && touchedFields.description
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {errors.description && touchedFields.description && (
                                    <div className="invalid-feedback">
                                      {errors.description.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">
                                    <span className="text-danger">* </span>Formula
                                  </Label>
                                  <Input
                                    type="text"
                                    id="formula"
                                    name="formula"
                                    value={formula}
                                    placeholder="Enter Salary formula"
                                    onChange={handleFormulaChange}
                                    className={
                                      errors.formula && touchedFields.formula ? 'is-invalid' : ''
                                    }
                                  />
                                  {errors.formula && touchedFields.formula && (
                                    <div className="invalid-feedback">{errors.formula.message}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row className="row-wrapper">
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">
                                    <span className="text-danger">* </span>Salary Role
                                  </Label>
                                  <Controller
                                    name="salaryRoleId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        styles={selectStyles}
                                        options={
                                          salary_role_dropdown
                                            ? selectOptionsFactory.renderOptions(
                                                'label',
                                                'value',
                                                salary_role_dropdown,
                                                'SalaryRole'
                                              )
                                            : []
                                        }
                                        isDisabled={true}
                                        id="salaryRoleId"
                                        placeholder="Select salary Role "
                                        value={
                                          salary_role_dropdown &&
                                          selectOptionsFactory
                                            .renderOptions(
                                              'label',
                                              'value',
                                              salary_role_dropdown,
                                              'SalaryRole'
                                            )
                                            .find(option => option.value === salaryRoleId)
                                        }
                                        onChange={options => {
                                          if (options && options.value) {
                                            setValue('salaryRoleId', options.value);
                                          } else {
                                            setValue('salaryRoleId', '');
                                          }
                                        }}
                                        className={`${
                                          errors.salaryRoleId && touchedFields.salaryRoleId
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                      />
                                    )}
                                  />
                                  {errors.salaryRoleId && touchedFields.salaryRoleId && (
                                    <div className="invalid-feedback">
                                      {errors.salaryRoleId.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">
                                    <span className="text-danger">* </span>Salary Structure
                                  </Label>
                                  <Controller
                                    name="salaryStructureId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        styles={selectStyles}
                                        options={
                                          salary_structure_dropdown
                                            ? selectOptionsFactory.renderOptions(
                                                'label',
                                                'value',
                                                salary_structure_dropdown,
                                                'SalaryStructure'
                                              )
                                            : []
                                        }
                                        isDisabled={true}
                                        id="salaryStructureId"
                                        placeholder="Select Salary Structure "
                                        value={
                                          salary_structure_dropdown &&
                                          selectOptionsFactory
                                            .renderOptions(
                                              'label',
                                              'value',
                                              salary_structure_dropdown,
                                              'SalaryStructure'
                                            )
                                            .find(option => option.value === salaryStructureId)
                                        }
                                        onChange={options => {
                                          if (options && options.value) {
                                            setValue('salaryStructureId', options.value);
                                          } else {
                                            setValue('salaryStructureId', '');
                                          }
                                        }}
                                        className={`${
                                          errors.salaryStructureId &&
                                          touchedFields.salaryStructureId
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                      />
                                    )}
                                  />
                                  {errors.salaryStructureId && touchedFields.salaryStructureId && (
                                    <div className="invalid-feedback">
                                      {errors.salaryStructureId.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <hr />
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
                                name="button"
                                color="danger"
                                className="btn-square"
                                onClick={deleteEmployee}
                              >
                                <i className="fa fa-trash"></i> Delete
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={handleUpdateClick}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Updating...' : 'Update'}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  props.history.push('/admin/payroll/salaryTemplate');
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
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailSalaryTemplate);
