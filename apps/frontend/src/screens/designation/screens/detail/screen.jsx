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
import { selectOptionsFactory, selectStyles } from 'utils';
import { Loader, LeavePage, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import * as EmployeeActions from '../../actions';
import * as DesignationDetailActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Ban, CircleDot, HelpCircle, Trash2, UserCircle } from 'lucide-react';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailDesignationSchema = z
  .object({
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
      .refine(val => val !== null, strings.DesignationTypeIsRequired),
    designationId: z
      .string()
      .min(1, 'Designation id is required')
      .max(9, 'Designation id is too long'),
  })
  .refine(
    data => {
      const id = parseInt(data.designationId);
      return id !== 0;
    },
    {
      message: 'Enter valid designation ID',
      path: ['designationId'],
    }
  );

const mapStateToProps = state => {
  return {
    currency_list: state.employee.currency_list,
    designationType_list: state.employeeDesignation.designationType_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    designationDetailActions: bindActionCreators(DesignationDetailActions, dispatch),
  };
};

const regEx = /^[0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const DetailDesignation = ({
  commonActions,
  employeeActions,
  designationDetailActions,
  designationType_list,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [currentSalaryRoleId, setCurrentSalaryRoleId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [idExist, setIdExist] = useState(false);
  const [nameExist, setNameExist] = useState(false);
  const [enableDelete, setEnableDelete] = useState(true);
  const [initialDesignationId, setInitialDesignationId] = useState('');
  const [initialDesignationName, setInitialDesignationName] = useState('');

  const form = useForm({
    resolver: zodResolver(detailDesignationSchema),
    defaultValues: {
      designationId: '',
      designationType: null,
      designationName: '',
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
  } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    employeeActions.getParentDesignationList();
    if (location.state && location.state.id) {
      employeeActions.getEmployeeCountForDesignation(location.state.id).then(res => {
        if (res.status === 200) {
          setEnableDelete(res.data && res.data > 0 ? false : true);
        }
      });
      designationDetailActions
        .getEmployeeDesignationById(location.state.id)
        .then(res => {
          if (res.status === 200) {
            setCurrentSalaryRoleId(location.state.id);

            const designationIdValue = res.data.designationId
              ? res.data.designationId.toString()
              : '';
            const designationNameValue = res.data.designationName ? res.data.designationName : '';

            setInitialDesignationId(designationIdValue);
            setInitialDesignationName(designationNameValue);

            reset({
              designationId: designationIdValue,
              designationType: res.data.parentId
                ? designationType_list?.find(type => type.value === res.data.parentId) || null
                : null,
              designationName: designationNameValue,
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
      history.push('/admin/payroll/config');
    }
  }, [
    location.state,
    employeeActions,
    designationDetailActions,
    commonActions,
    history,
    reset,
    designationType_list,
  ]);

  const designationIdvalidationCheck = useCallback(
    value => {
      const data = {
        moduleType: 25,
        name: value,
      };
      commonActions.checkValidation(data).then(response => {
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

  const designationNamevalidationCheck = useCallback(
    value => {
      const data = {
        moduleType: 26,
        name: value,
      };
      commonActions.checkValidation(data).then(response => {
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

  const onSubmit = data => {
    // Check for existing ID or reserved IDs
    const id = parseInt(data.designationId);
    if (idExist || id === 1 || id === 2 || id === 3 || id === 4) {
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

    setDisableLeavePage(true);

    const { designationName, designationId, designationType } = data;

    let formData = new FormData();
    formData.append('id', currentSalaryRoleId);
    formData.append(
      'parentId',
      designationType ? (designationType.value ? designationType.value : designationType) : ''
    );
    formData.append('designationId', designationId ? designationId : '');
    formData.append('designationName', designationName ? designationName : '');

    designationDetailActions
      .updateEmployeeDesignation(formData)
      .then(res => {
        commonActions.tostifyAlert('success', 'Designation Updated Successfully.');
        history.push('/admin/payroll/config', { tabNo: '3' });
      })
      .catch(err => {
        setDisableLeavePage(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const deleteDesignation = () => {
    const message1 = (
      <text>
        <b>Delete Designation ?</b>
      </text>
    );
    const message = 'This designation will be deleted permanently and cannot be recovered. ';
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
    designationDetailActions
      .deleteDesignation(currentSalaryRoleId)
      .then(res => {
        if (res.status === 200) {
          setDisableLeavePage(true);
          commonActions.tostifyAlert('success', 'Designation Deleted Successfully !');
          history.push('/admin/payroll/config', { tabNo: '3' });
        }
      })
      .catch(err => {
        if (err.status === 409) {
          setDisableLeavePage(true);
          commonActions.tostifyAlert(
            'error',
            "Designation can't be deleted, you need to delete employee first."
          );
          history.push('/admin/payroll/config', { tabNo: '3' });
        } else {
          commonActions.tostifyAlert('error', 'Something Went Wrong');
        }
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const handleDesignationIdChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regEx.test(value)) {
      onChange(e);
      if (value && initialDesignationId.toString() !== value) {
        designationIdvalidationCheck(value);
      }
    }
  };

  const handleDesignationNameChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      onChange(e);
      setNameExist(false);
      if (value && initialDesignationName !== value) {
        designationNamevalidationCheck(value);
      }
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
                        <UserCircle className="h-4 w-4" />
                        <span className="ml-2">{strings.UpdateDesignation}</span>
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
                                        placeholder={strings.Enter + strings.DESIGNATIONID}
                                        {...field}
                                        onChange={e => handleDesignationIdChange(e, field.onChange)}
                                        className={errors.designationId ? 'is-invalid' : ''}
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
                                        placeholder="Enter Designation Name"
                                        {...field}
                                        onChange={e =>
                                          handleDesignationNameChange(e, field.onChange)
                                        }
                                        className={errors.designationName ? 'is-invalid' : ''}
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
                                    <HelpCircle id="designationTypeTooltip" className="h-4 w-4 inline" />
                                    <UncontrolledTooltip
                                      placement="right"
                                      target="designationTypeTooltip"
                                    >
                                      Based on the designation type selected, the chart of accounts
                                      will be created for the employee. This field will be locked
                                      once the designation has been assigned to an employee.
                                    </UncontrolledTooltip>
                                  </Label>
                                  <Controller
                                    name="designationType"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        id="designationType"
                                        isDisabled={!enableDelete}
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
                                        placeholder={strings.Select + strings.DesignationType}
                                        styles={selectStyles}
                                        className={errors.designationType ? 'is-invalid' : ''}
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
                                  <strong>Note:</strong> If the designation is assigned to an
                                  employee, it cannot be deleted.
                                </p>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row>
                          <Col
                            lg={12}
                            className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                          >
                            <FormGroup>
                              {enableDelete && (
                                <Button
                                  type="button"
                                  name="button"
                                  color="danger"
                                  className="btn-square"
                                  onClick={deleteDesignation}
                                >
                                  <Trash2 className="h-4 w-4" /> {strings.Delete}
                                </Button>
                              )}
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button type="submit" color="primary" className="btn-square mr-3">
                                <CircleDot className="h-4 w-4" /> {strings.Update}
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
                                <Ban className="h-4 w-4" /> {strings.Cancel}
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
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDesignation);
