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
import { Loader, LeavePage, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import * as EmployeeActions from '../../actions';
import * as SalarayRoleDetailActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const regExAlpha = /^[a-zA-Z ]+$/;

const strings = new LocalizedStrings(data);

// Zod validation schema
const updateSalaryRoleSchema = z.object({
  salaryRoleName: z.string().min(1, 'Salary role name is required'),
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
    salarayRoleDetailActions: bindActionCreators(SalarayRoleDetailActions, dispatch),
  };
};

const DetailSalaryRole = (props) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [currentSalaryRoleId, setCurrentSalaryRoleId] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  strings.setLanguage(language);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(updateSalaryRoleSchema),
    defaultValues: {
      salaryRoleName: '',
    },
  });

  const salaryRoleName = watch('salaryRoleName');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    if (props.location.state && props.location.state.id) {
      props.salarayRoleDetailActions
        .getSalaryRoleById(props.location.state.id)
        .then((res) => {
          if (res.status === 200) {
            setCurrentSalaryRoleId(props.location.state.id);
            reset({
              salaryRoleName: res.data.salaryRoleName ? res.data.salaryRoleName : '',
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

    const { salaryRoleName } = data;

    let formData = new FormData();
    formData.append('id', currentSalaryRoleId);
    formData.append('salaryRoleName', salaryRoleName ? salaryRoleName : '');

    props.salarayRoleDetailActions
      .updateSalaryRole(formData)
      .then((res) => {
        setDisabled(false);
        props.commonActions.tostifyAlert('success', 'Salary Role Updated Successfully.');
        props.history.push('/admin/payroll/config');
      })
      .catch((err) => {
        setDisabled(false);
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const deleteRole = () => {
    const message1 = (
      <text>
        <b>Delete Salary Role ?</b>
      </text>
    );
    const message =
      'This salary role will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={remove}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const remove = () => {
    props.salarayRoleDetailActions
      .deleteSalaryRole(currentSalaryRoleId)
      .then((res) => {
        if (res.status === 200) {
          setDisableLeavePage(true);
          props.commonActions.tostifyAlert('success', 'Salary role deleted successfully !!');
          props.history.push('/admin/payroll/config', { tabNo: '1' });
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

  const handleSalaryRoleNameChange = (e) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      setValue('salaryRoleName', value, { shouldValidate: true });
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
                        <span className="ml-2"> {strings.UpdateSalaryRole}</span>
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
                                    {strings.SalaryRoleName}
                                  </Label>
                                  <Input
                                    type="text"
                                    id="salaryRoleName"
                                    name="salaryRoleName"
                                    maxLength="30"
                                    value={salaryRoleName}
                                    placeholder={strings.Enter + strings.SalaryRoleName}
                                    onChange={handleSalaryRoleNameChange}
                                    className={
                                      errors.salaryRoleName && touchedFields.salaryRoleName
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {errors.salaryRoleName && touchedFields.salaryRoleName && (
                                    <div className="invalid-feedback">
                                      {errors.salaryRoleName.message}
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
                            <FormGroup>
                              <Button
                                type="button"
                                name="button"
                                color="danger"
                                className="btn-square"
                                onClick={deleteRole}
                              >
                                <i className="fa fa-trash"></i> {strings.Delete}
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
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  props.history.push('/admin/payroll/config', { tabNo: '1' });
                                }}
                              >
                                <i className="fa fa-ban"></i>
                                {strings.Cancel}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailSalaryRole);
