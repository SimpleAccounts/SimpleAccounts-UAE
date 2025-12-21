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
  UncontrolledTooltip,
} from 'reactstrap';
import { LeavePage, ConfirmDeleteModal, Loader } from 'components';
import { CommonActions } from 'services/global';
import * as SalaryComponentActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Ban, CircleDot, HelpCircle, RefreshCw, Trash2, Wallet } from 'lucide-react';

const strings = new LocalizedStrings(data);

const regEx = /[a-zA-Z]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;
const regExCode = /[a-zA-Z0-9-/]+$/;
const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;

// Zod validation schema
const salaryComponentSchema = z
  .object({
    componentId: z.string().min(1, 'Component ID is required'),
    componentName: z.string().min(1, 'Component Name is required'),
    componentType: z.string().min(1, 'Component Type is required'),
    calculationType: z.number(),
    ctcPercent: z.string().optional(),
    flatAmount: z.string().optional(),
  })
  .refine(
    data => {
      if (data.calculationType === 2 && !data.ctcPercent) {
        return false;
      }
      if (data.calculationType === 1 && !data.flatAmount) {
        return false;
      }
      return true;
    },
    {
      message: 'Required field is missing',
      path: ['calculationType'],
    }
  );

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    salaryComponentActions: bindActionCreators(SalaryComponentActions, dispatch),
  };
};

const SalaryComponentScreen = props => {
  const { componentID, isCreated, ComponentType, salaryStructureModalCard, history } =
    props.props || props;

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [enableDelete, setEnableDelete] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [idExist, setIdExist] = useState(false);
  const [nameExist, setNameExist] = useState(false);

  strings.setLanguage(language);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(salaryComponentSchema),
    defaultValues: {
      componentId: '',
      componentName: '',
      componentType: ComponentType ? ComponentType : 'Earning',
      calculationType: 2,
      ctcPercent: '',
      flatAmount: '',
    },
  });

  const componentId = watch('componentId');
  const componentName = watch('componentName');
  const componentType = watch('componentType');
  const calculationType = watch('calculationType');
  const ctcPercent = watch('ctcPercent');
  const flatAmount = watch('flatAmount');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    if (componentID && isCreated) {
      props.salaryComponentActions.getSalaryComponentById(componentID).then(res => {
        if (res.status === 200) {
          setEnableDelete(res.data.isComponentDeletable);
          reset({
            componentId: res.data.componentCode || '',
            componentName: res.data.description || '',
            componentType: res.data.componentType || 'Earning',
            calculationType: res.data.calculationType || 2,
            ctcPercent: res.data.formula || '',
            flatAmount: res.data.flatAmount || '',
          });
        }
      });
    } else {
      getComponentId();
    }
  };

  const getComponentId = () => {
    props.salaryComponentActions.getComponentId().then(res => {
      if (res.status === 200) {
        setValue('componentId', res.data, { shouldValidate: true });
        componentIdvalidationCheck(res.data);
      }
    });
  };

  const componentNamevalidationCheck = value => {
    const data = {
      moduleType: 29,
      name: value,
    };
    props.commonActions.checkValidation(data).then(response => {
      if (response.data === 'Description Name Already Exists') {
        setNameExist(true);
      } else {
        setNameExist(false);
      }
    });
  };

  const componentIdvalidationCheck = value => {
    const data = {
      moduleType: 30,
      name: value,
    };
    props.commonActions.checkValidation(data).then(response => {
      if (response.data === 'Component ID Already Exists') {
        setIdExist(true);
      } else {
        setIdExist(false);
      }
    });
  };

  const deleteComponent = () => {
    const message1 = (
      <text>
        <b>Delete Salary Component?</b>
      </text>
    );
    const message = 'This Salary Component will be deleted permanently and cannot be recovered. ';
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
    setDisableLeavePage(true);
    props.salaryComponentActions
      .deleteSalaryComponent(componentID)
      .then(res => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert('success', 'Salary Component Deleted Successfully !');
          history.push('/admin/payroll/config', { tabNo: '5' });
        }
      })
      .catch(err => {
        if (err.status === 409) {
          props.commonActions.tostifyAlert(
            'error',
            "Salary Component can't be deleted, you need to delete employee first."
          );
        } else {
          props.commonActions.tostifyAlert('error', 'Something Went Wrong');
        }
        setDisableLeavePage(false);
        removeDialog();
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const onSubmit = data => {
    // Check for validation errors from custom validators
    if (idExist) {
      props.commonActions.tostifyAlert('error', 'Component ID already exists');
      return;
    }
    if (nameExist) {
      props.commonActions.tostifyAlert('error', 'Component name already exists');
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const { componentName, componentId, componentType, flatAmount, ctcPercent, calculationType } =
      data;

    const formData = new FormData();
    if (componentID) formData.append('id', componentID);
    formData.append('invoiceType', '14');
    formData.append('description', componentName != null ? componentName : '');
    formData.append('flatAmount', flatAmount != null ? flatAmount : '');
    formData.append('formula', ctcPercent != null ? ctcPercent : '');
    formData.append('componentCode', componentId != null ? componentId : '');
    formData.append('componentType', componentType ? componentType : '');
    formData.append('salaryStructure', componentType ? (componentType === 'Earning' ? 1 : 3) : '');
    formData.append('calculationType', calculationType ? calculationType : '');

    props.salaryComponentActions
      .saveSalaryComponent(formData, isCreated)
      .then(res => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert(
            'success',
            isCreated
              ? 'Salary Component Updated Successfully'
              : 'Salary Component Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            reset({
              componentId: '',
              componentName: '',
              componentType: ComponentType ? ComponentType : 'Earning',
              calculationType: 2,
              ctcPercent: '',
              flatAmount: '',
            });
            getComponentId();
          } else {
            if (salaryStructureModalCard) {
              props.closeModal(true);
              props.getCurrentSalaryComponent(res.data);
            } else {
              history.push('/admin/payroll/config', { tabNo: '5' });
            }
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setDisableLeavePage(false);
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const handleComponentIdChange = e => {
    const value = e.target.value;
    if (value === '' || regExCode.test(value)) {
      setValue('componentId', value, { shouldValidate: true });
      setIdExist(false);
      componentIdvalidationCheck(value);
    }
  };

  const handleComponentNameChange = e => {
    const value = e.target.value;
    if (
      value === '' ||
      (!componentName && regEx.test(value)) ||
      (componentName && regExAlpha.test(value))
    ) {
      setValue('componentName', value, { shouldValidate: true });
      setNameExist(false);
      componentNamevalidationCheck(value);
    }
  };

  const handleComponentTypeChange = value => {
    setValue('componentType', value, { shouldValidate: true });
  };

  const handleCalculationTypeChange = value => {
    setValue('calculationType', value, { shouldValidate: true });
  };

  const handleCtcPercentChange = e => {
    const value = e.target.value;
    if (parseInt(value) > 0 && parseInt(value) < 101) {
      setValue('ctcPercent', value, { shouldValidate: true });
    } else if (value === '') {
      setValue('ctcPercent', '', { shouldValidate: true });
    }
  };

  const handleFlatAmountChange = e => {
    const value = e.target.value;
    if (value === '0') {
      // Don't allow 0
    } else if (value === '' || regDecimal.test(value)) {
      setValue('flatAmount', value, { shouldValidate: true });
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

  const handleUpdateClick = () => {
    if (errors && Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
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
                      <Wallet className="h-4 w-4" />
                      <span className="ml-2">
                        {isCreated ? strings.UpdateSalaryComponent : strings.CreateSalaryComponent}
                      </span>
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
                        <Col lg={12}>
                          <Row className="row-wrapper">
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="componentId">
                                  <span className="text-danger">* </span>
                                  {strings.ComponentID}
                                </Label>
                                <Input
                                  type="text"
                                  id="componentId"
                                  name="componentId"
                                  disabled={isCreated}
                                  maxLength="10"
                                  value={componentId}
                                  placeholder={strings.Enter + strings.ComponentID}
                                  onChange={handleComponentIdChange}
                                  className={
                                    (errors.componentId && touchedFields.componentId) || idExist
                                      ? 'is-invalid'
                                      : ''
                                  }
                                />
                                {errors.componentId && touchedFields.componentId && (
                                  <div className="invalid-feedback">
                                    {errors.componentId.message}
                                  </div>
                                )}
                                {idExist && (
                                  <div className="invalid-feedback">
                                    Component ID already exists
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="componentName">
                                  <span className="text-danger">* </span>
                                  {strings.ComponentName}
                                </Label>
                                <Input
                                  type="text"
                                  id="componentName"
                                  name="componentName"
                                  maxLength="100"
                                  value={componentName}
                                  placeholder={strings.Enter + strings.ComponentName}
                                  onChange={handleComponentNameChange}
                                  className={
                                    (errors.componentName && touchedFields.componentName) ||
                                    nameExist
                                      ? 'is-invalid'
                                      : ''
                                  }
                                />
                                {errors.componentName && touchedFields.componentName && (
                                  <div className="invalid-feedback">
                                    {errors.componentName.message}
                                  </div>
                                )}
                                {nameExist && (
                                  <div className="invalid-feedback">
                                    Component name already exists
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={12}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="componentType">
                                  <span className="text-danger">* </span>
                                  {strings.ComponentType}
                                  <HelpCircle
                                    id="componentTypeTooltip"
                                    className="h-4 w-4 inline"
                                  />
                                  <UncontrolledTooltip
                                    placement="right"
                                    target="componentTypeTooltip"
                                  >
                                    {strings.ComponentTypeTooltip}
                                  </UncontrolledTooltip>
                                </Label>
                                <br />
                                <FormGroup check inline>
                                  <div className="custom-radio custom-control">
                                    <input
                                      disabled={ComponentType || !enableDelete}
                                      className="custom-control-input"
                                      type="radio"
                                      id="componentType-inline-radio1"
                                      name="componentType-inline-radio1"
                                      checked={componentType === 'Earning'}
                                      value={componentType}
                                      onChange={() => handleComponentTypeChange('Earning')}
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="componentType-inline-radio1"
                                    >
                                      {strings.Earning}
                                    </label>
                                  </div>
                                </FormGroup>
                                <FormGroup check inline>
                                  <div className="custom-radio custom-control">
                                    <input
                                      disabled={!enableDelete}
                                      className="custom-control-input"
                                      type="radio"
                                      id="componentType-inline-radio2"
                                      name="componentType-inline-radio2"
                                      value={componentType}
                                      checked={componentType === 'Deduction'}
                                      onChange={() => handleComponentTypeChange('Deduction')}
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="componentType-inline-radio2"
                                    >
                                      {strings.Deduction}
                                    </label>
                                  </div>
                                </FormGroup>
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={12}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="calculationType">
                                  <span className="text-danger">* </span>
                                  {strings.CalculationType}
                                </Label>
                                <br />
                                <FormGroup check inline>
                                  <div className="custom-radio custom-control">
                                    <input
                                      className="custom-control-input"
                                      type="radio"
                                      id="calculationType-inline-radio1"
                                      name="calculationType-inline-radio1"
                                      checked={calculationType === 2}
                                      value={calculationType}
                                      onChange={() => handleCalculationTypeChange(2)}
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="calculationType-inline-radio1"
                                    >
                                      {strings.PercentOfCTC}
                                    </label>
                                  </div>
                                </FormGroup>
                                <FormGroup check inline>
                                  <div className="custom-radio custom-control">
                                    <input
                                      className="custom-control-input"
                                      type="radio"
                                      id="calculationType-inline-radio2"
                                      name="calculationType-inline-radio2"
                                      value={calculationType}
                                      checked={calculationType === 1}
                                      onChange={() => handleCalculationTypeChange(1)}
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="calculationType-inline-radio2"
                                    >
                                      {strings.FlatAmount}
                                    </label>
                                  </div>
                                </FormGroup>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
                              {calculationType === 2 ? (
                                <FormGroup className="mb-3">
                                  <Label htmlFor="ctcPercent">
                                    <span className="text-danger">* </span>
                                    {strings.PercentOfCTC}
                                  </Label>
                                  <Input
                                    type="text"
                                    maxLength="5,2"
                                    value={ctcPercent}
                                    onChange={handleCtcPercentChange}
                                    placeholder={strings.Enter + strings.PercentOfCTC}
                                    id="ctcPercent"
                                    name="ctcPercent"
                                    className={
                                      errors.ctcPercent && touchedFields.ctcPercent
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {errors.ctcPercent && touchedFields.ctcPercent && (
                                    <div className="invalid-feedback">
                                      {strings.PercentOfCTCIsRequired}
                                    </div>
                                  )}
                                </FormGroup>
                              ) : (
                                <FormGroup className="mb-3">
                                  <Label htmlFor="flatAmount">
                                    <span className="text-danger">* </span>
                                    {strings.FlatAmount}
                                  </Label>
                                  <Input
                                    type="text"
                                    maxLength="14,2"
                                    min={1}
                                    value={flatAmount}
                                    onChange={handleFlatAmountChange}
                                    placeholder={strings.Enter + strings.FlatAmount}
                                    id="flatAmount"
                                    name="flatAmount"
                                    className={
                                      errors.flatAmount && touchedFields.flatAmount
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {errors.flatAmount && touchedFields.flatAmount && (
                                    <div className="invalid-feedback">
                                      {strings.FlatAmountIsRequired}
                                    </div>
                                  )}
                                </FormGroup>
                              )}
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col>
                              <p>
                                <strong>Note:</strong> {strings.SalaryComponentCreateNote}
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
                            {enableDelete && isCreated && (
                              <Button
                                type="button"
                                name="button"
                                color="danger"
                                className="btn-square"
                                onClick={deleteComponent}
                              >
                                <Trash2 className="h-4 w-4" /> {strings.Delete}
                              </Button>
                            )}
                          </FormGroup>
                          <FormGroup className="text-right">
                            {!isCreated ? (
                              <>
                                <Button
                                  type="submit"
                                  color="primary"
                                  className="btn-square mr-3"
                                  onClick={handleCreateClick}
                                  disabled={disabled}
                                >
                                  <CircleDot className="h-4 w-4" /> {strings.Create}
                                </Button>
                                {!salaryStructureModalCard && (
                                  <Button
                                    type="submit"
                                    color="primary"
                                    className="btn-square mr-3"
                                    onClick={handleCreateAndMoreClick}
                                    disabled={disabled}
                                  >
                                    <RefreshCw className="h-4 w-4" /> {strings.CreateandMore}
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                onClick={handleUpdateClick}
                                disabled={disabled}
                              >
                                <CircleDot className="h-4 w-4" /> {strings.Update}
                              </Button>
                            )}
                            <Button
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                if (salaryStructureModalCard) props.closeModal(true);
                                else history.push('/admin/payroll/config', { tabNo: '5' });
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
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SalaryComponentScreen);
