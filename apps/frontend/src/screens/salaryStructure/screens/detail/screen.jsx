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
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import * as EmployeeActions from '../../actions';
import * as SalarayStructureDetailActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const regEx = /^[0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const strings = new LocalizedStrings(data);

// Zod validation schema
const updateSalaryStructureSchema = z.object({
  salaryStructureType: z.string().min(1, 'Salary structure type is required'),
  salaryStructureName: z.string().min(1, 'Salary structure name is required'),
});

const mapStateToProps = (state) => {
  return {
    currency_list: state.employee.currency_list,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    salarayStructureDetailActions: bindActionCreators(SalarayStructureDetailActions, dispatch),
  };
};

const DetailSalaryStructure = (props) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [currentSalaryStructureId, setCurrentSalaryStructureId] = useState(null);
  const [dialog, setDialog] = useState(false);
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
    resolver: zodResolver(updateSalaryStructureSchema),
    defaultValues: {
      salaryStructureType: '',
      salaryStructureName: '',
    },
  });

  const salaryStructureType = watch('salaryStructureType');
  const salaryStructureName = watch('salaryStructureName');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    if (props.location.state && props.location.state.id) {
      props.salarayStructureDetailActions
        .getSalaryStructureById(props.location.state.id)
        .then((res) => {
          if (res.status === 200) {
            setCurrentSalaryStructureId(props.location.state.id);
            reset({
              salaryStructureName: res.data.name ? res.data.name : '',
              salaryStructureType: res.data.type ? res.data.type : '',
            });
            setLoading(false);
          }
        })
        .catch((err) => {
          props.commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    } else {
      props.history.push('/admin/payroll/config');
    }
  };

  const onSubmit = (data) => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { salaryStructureName, salaryStructureType } = data;

    let formData = new FormData();
    formData.append('id', currentSalaryStructureId);
    formData.append('type', salaryStructureType ? salaryStructureType : '');
    formData.append('name', salaryStructureName ? salaryStructureName : '');

    props.salarayStructureDetailActions
      .updateSalaryStructure(formData)
      .then((res) => {
        setDisabled(false);
        props.commonActions.tostifyAlert('success', 'Salary Structure Updated Successfully.');
        props.history.push('/admin/payroll/config', { tabNo: '2' });
      })
      .catch((err) => {
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
    const { current_employee_id } = currentSalaryStructureId;
    props.employeeDetailActions
      .deleteEmployee(current_employee_id)
      .then((res) => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert('success', 'Employee Deleted Successfully !!');
          props.history.push('/admin/payroll/config');
        }
      })
      .catch((err) => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === '' || regEx.test(value)) {
      setValue('salaryStructureType', value, { shouldValidate: true });
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      setValue('salaryStructureName', value, { shouldValidate: true });
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
                        <span className="ml-2">{strings.UpdateSalaryStructure}</span>
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
                                    <span className="text-danger">* </span>
                                    {strings.SalaryStructureType}
                                  </Label>
                                  <Input
                                    type="text"
                                    maxLength="30"
                                    id="salaryStructureType"
                                    name="salaryStructureType"
                                    value={salaryStructureType}
                                    placeholder="Enter Salary Structure Type"
                                    onChange={handleTypeChange}
                                    className={
                                      errors.salaryStructureType && touchedFields.salaryStructureType
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {errors.salaryStructureType &&
                                    touchedFields.salaryStructureType && (
                                      <div className="invalid-feedback">
                                        {errors.salaryStructureType.message}
                                      </div>
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
                                    id="salaryStructureName"
                                    name="salaryStructureName"
                                    value={salaryStructureName}
                                    placeholder="Enter Salary Structure Name"
                                    onChange={handleNameChange}
                                    className={
                                      errors.salaryStructureName && touchedFields.salaryStructureName
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {errors.salaryStructureName &&
                                    touchedFields.salaryStructureName && (
                                      <div className="invalid-feedback">
                                        {errors.salaryStructureName.message}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                            </Row>

                            <hr />
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={12} className="d-flex align-items-center justify-content-between flex-wrap mt-5">
                            {/* <FormGroup>
                              <Button
                                type="button"
                                name="button"
                                color="danger"
                                className="btn-square"
                                onClick={deleteEmployee}
                              >
                                <i className="fa fa-trash"></i> {strings.Delete}
                              </Button>
                            </FormGroup> */}
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={handleUpdateClick}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
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
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailSalaryStructure);
