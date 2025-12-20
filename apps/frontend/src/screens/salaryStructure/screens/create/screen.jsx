import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
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
import { LeavePage } from 'components';
import { CommonActions } from 'services/global';
import * as EmployeeActions from '../../actions';
import * as SalaryStructureCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const regEx = /^[0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const strings = new LocalizedStrings(data);

// Zod validation schema
const createSalaryStructureSchema = z.object({
  type: z.string().min(1, 'Salary structure type is required'),
  name: z.string().min(1, 'Salary structure name is required'),
});

const mapStateToProps = (state) => {
  return {
    currency_list: state.employee.currency_list,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    salaryStructureCreateActions: bindActionCreators(SalaryStructureCreateActions, dispatch),
  };
};

const CreateSalaryStructure = (props) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);

  strings.setLanguage(language);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createSalaryStructureSchema),
    defaultValues: {
      type: '',
      name: '',
    },
  });

  const type = watch('type');
  const name = watch('name');

  useEffect(() => {
    // Initialize data if needed
  }, []);

  const onSubmit = (data) => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { type, name } = data;

    const formData = new FormData();
    formData.append('type', type != null ? type : '');
    formData.append('name', name != null ? name : '');

    props.salaryStructureCreateActions
      .createSalaryStructure(formData)
      .then((res) => {
        if (res.status === 200) {
          setDisabled(false);
          props.commonActions.tostifyAlert('success', 'New Salary Structure Created Successfully');
          if (createMore) {
            setCreateMore(false);
            reset({
              type: '',
              name: '',
            });
          } else {
            props.history.push('/admin/payroll/config', { tabNo: '2' });
          }
        }
      })
      .catch((err) => {
        setDisabled(false);
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === '' || regEx.test(value)) {
      setValue('type', value, { shouldValidate: true });
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      setValue('name', value, { shouldValidate: true });
    }
  };

  const handleCreateClick = () => {
    if (errors && Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
    }
    setCreateMore(false);
  };

  const handleCreateAndMoreClick = () => {
    if (errors && Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
    }
    setCreateMore(true);
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
                      <span className="ml-2">{strings.CreateSalaryStructure}</span>
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
                                  <span className="text-danger">* </span>{' '}
                                  {strings.SalaryStructureType}
                                </Label>
                                <Input
                                  type="text"
                                  maxLength="30"
                                  id="type"
                                  name="type"
                                  value={type}
                                  placeholder={strings.Enter + strings.SalaryStructureType}
                                  onChange={handleTypeChange}
                                  className={
                                    errors.type && touchedFields.type ? 'is-invalid' : ''
                                  }
                                />
                                {errors.type && touchedFields.type && (
                                  <div className="invalid-feedback">{errors.type.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="select">
                                  <span className="text-danger">* </span>
                                  {strings.SalaryStructureName}
                                </Label>
                                <Input
                                  type="text"
                                  maxLength="30"
                                  id="name"
                                  name="name"
                                  value={name}
                                  placeholder={strings.Enter + strings.SalaryStructureName}
                                  onChange={handleNameChange}
                                  className={
                                    errors.name && touchedFields.name ? 'is-invalid' : ''
                                  }
                                />
                                {errors.name && touchedFields.name && (
                                  <div className="invalid-feedback">{errors.name.message}</div>
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
                              onClick={handleCreateClick}
                            >
                              <i className="fa fa-dot-circle-o"></i>{' '}
                              {disabled ? 'Creating...' : strings.Create}
                            </Button>
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={handleCreateAndMoreClick}
                            >
                              <i className="fa fa-refresh"></i>{' '}
                              {disabled ? 'Creating...' : strings.CreateandMore}
                            </Button>
                            <Button
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                props.history.push('/admin/payroll/config', { tabNo: '2' });
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
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryStructure);
