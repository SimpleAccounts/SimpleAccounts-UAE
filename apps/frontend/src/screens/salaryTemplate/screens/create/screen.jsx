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
} from 'components/migration';
import Select from 'react-select';
import { CommonActions } from 'services/global';
import * as SalaryTemplateActions from '../../actions';
import * as EmployeeCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { selectOptionsFactory, selectStyles } from 'utils';
import { UserCircle, CircleDot, RefreshCw, Ban } from 'lucide-react';

const regExBoth = /[a-zA-Z0-9]+$/;

// Zod validation schema
const createSalaryTemplateSchema = z.object({
  salaryStructureId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  description: z.string().optional(),
  formula: z.string().optional(),
  salaryRoleId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
});

const mapStateToProps = state => {
  return {
    salary_structure_dropdown: state.salarytemplate.salary_structure_dropdown,
    salary_role_dropdown: state.salarytemplate.salary_role_dropdown,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    salaryTemplateActions: bindActionCreators(SalaryTemplateActions, dispatch),
    employeeCreateActions: bindActionCreators(EmployeeCreateActions, dispatch),
  };
};

const CreateSalaryTemplate = props => {
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createSalaryTemplateSchema),
    defaultValues: {
      salaryStructureId: null,
      description: '',
      formula: '',
      salaryRoleId: null,
    },
  });

  const description = watch('description');
  const formula = watch('formula');

  useEffect(() => {
    props.salaryTemplateActions.getSalaryStructureForDropdown();
    props.salaryTemplateActions.getSalaryRolesForDropdown();
  }, []);

  const onSubmit = data => {
    setDisabled(true);

    const { formula, salaryStructureId, description, salaryRoleId } = data;

    const formData = new FormData();
    formData.append('description', description != null ? description : '');

    if (salaryRoleId && salaryRoleId.value) {
      formData.append('salaryRoleId', salaryRoleId.value);
    }
    formData.append('formula', formula != null ? formula : '');
    if (salaryStructureId && salaryStructureId.value) {
      formData.append('salaryStructureId', salaryStructureId.value);
    }

    props.employeeCreateActions
      .createSalaryTemplate(formData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          props.commonActions.tostifyAlert(
            'success',
            'New Template Component Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            reset({
              salaryStructureId: null,
              description: '',
              formula: '',
              salaryRoleId: null,
            });
          } else {
            props.history.push('/admin/payroll/salaryTemplate');
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
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

  const { salary_structure_dropdown, salary_role_dropdown } = props;

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
                      <span className="ml-2">Create Salary Template</span>
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
                                <Label htmlFor="select">
                                  <span className="text-danger">* </span>Salary Description
                                </Label>
                                <Input
                                  type="text"
                                  id="description"
                                  name="description"
                                  value={description}
                                  placeholder="Enter description"
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
                                  placeholder="Enter formula"
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
                                      {...field}
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
                                      id="salaryRoleId"
                                      placeholder="Select salary Role "
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
                                      {...field}
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
                                      id="salaryStructureId"
                                      placeholder="Select Salary Structure "
                                      className={`${
                                        errors.salaryStructureId && touchedFields.salaryStructureId
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
                        <Col lg={12} className="mt-5">
                          <FormGroup className="text-right">
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={() => {
                                setCreateMore(false);
                              }}
                            >
                              <CircleDot className="h-4 w-4" />{' '}
                              {disabled ? 'Creating...' : 'Create'}
                            </Button>
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={() => {
                                setCreateMore(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />{' '}
                              {disabled ? 'Creating...' : 'Create and More'}
                            </Button>
                            <Button
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                props.history.push('/admin/payroll/salaryTemplate');
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryTemplate);
