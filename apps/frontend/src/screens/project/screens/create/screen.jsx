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
} from 'components/migration';
import Select from 'react-select';

import { ContactModal } from '../../sections';

import * as ProjectActions from '../../actions';
import * as CreateProjectActions from './actions';
import { CommonActions } from 'services/global';

import { selectOptionsFactory, selectStyles } from 'utils';

import './style.scss';
import { Network, Plus, CircleDot, RefreshCw, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    currency_list: state.project.currency_list,
    contact_list: state.project.contact_list,
    country_list: state.project.country_list,
    title_list: state.project.title_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    projectActions: bindActionCreators(ProjectActions, dispatch),
    createProjectActions: bindActionCreators(CreateProjectActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const INVOICE_LANGUAGE_OPTIONS = [
  { value: 1, label: 'English' },
  // { value: 2, label: 'Arabic' }
];

// Zod validation schema
const createProjectSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .regex(/^[a-zA-Z ]+$/, 'Project name must contain only letters and spaces'),
  contactId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Contact is required'),
  expenseBudget: z.string().optional(),
  revenueBudget: z.string().optional(),
  invoiceLanguageCode: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
});

const regEx = /^[0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const CreateProject = ({
  projectActions,
  createProjectActions,
  commonActions,
  history,
  currency_list,
  contact_list,
  country_list,
  title_list,
}) => {
  const [openContactModal, setOpenContactModal] = useState(false);
  const [createMore, setCreateMore] = useState(false);

  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      projectName: '',
      contactId: null,
      expenseBudget: '',
      revenueBudget: '',
      invoiceLanguageCode: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = form;

  useEffect(() => {
    projectActions.getCurrencyList();
    projectActions.getContactList();
    projectActions.getCountryList();
  }, [projectActions]);

  // Show Contact Modal
  const showContactModal = () => {
    setOpenContactModal(true);
  };

  // Close Contact Modal
  const closeContactModal = (res, data) => {
    if (res) {
      const val = { label: data.fullName, value: data.id };
      projectActions.getContactList();
      setValue('contactId', val, { shouldValidate: true });
    }
    setOpenContactModal(false);
  };

  // Create Project
  const onSubmit = data => {
    const postData = {
      projectName: data.projectName || '',
      contactId: data.contactId?.value || '',
      expenseBudget: data.expenseBudget || '',
      revenueBudget: data.revenueBudget || '',
    };

    createProjectActions
      .createAndSaveProject(postData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'New Project Created Successfully!');
          if (createMore) {
            setCreateMore(false);
            reset();
          } else {
            history.push('/admin/master/project');
          }
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  const handleExpenseBudgetChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regEx.test(value)) {
      onChange(e);
    }
  };

  const handleRevenueBudgetChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regEx.test(value)) {
      onChange(e);
    }
  };

  const handleProjectNameChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      onChange(e);
    }
  };

  return (
    <div className="create-product-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <Network className="h-4 w-4" />
                      <span className="ml-2">Create Project</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <Row>
                        <Col lg={4}>
                          <FormGroup className="mb-3">
                            <Label htmlFor="projectName">
                              <span className="text-danger">* </span>Project Name
                            </Label>
                            <Controller
                              name="projectName"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="text"
                                  id="name"
                                  placeholder="Enter Project Name"
                                  {...field}
                                  onChange={e => handleProjectNameChange(e, field.onChange)}
                                  className={errors.projectName ? 'is-invalid' : ''}
                                />
                              )}
                            />
                            {errors.projectName && (
                              <div className="invalid-feedback">{errors.projectName.message}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col lg={4}>
                          <FormGroup className="mb-3">
                            <Label htmlFor="contactId">
                              <span className="text-danger">* </span>Contact
                            </Label>
                            <Controller
                              name="contactId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={
                                    contact_list
                                      ? selectOptionsFactory.renderOptions(
                                          'label',
                                          'value',
                                          contact_list,
                                          'Contact Name'
                                        )
                                      : []
                                  }
                                  id="contactId"
                                  placeholder="Select Contact"
                                  styles={selectStyles}
                                  className={errors.contactId ? 'is-invalid' : ''}
                                  isClearable
                                />
                              )}
                            />
                            {errors.contactId && (
                              <div className="invalid-feedback d-block">
                                {errors.contactId.message}
                              </div>
                            )}
                          </FormGroup>
                          <FormGroup className="mb-1 text-right">
                            <Button
                              color="primary"
                              className="btn-square"
                              onClick={showContactModal}
                              type="button"
                            >
                              <Plus className="h-4 w-4" /> Add a Contact
                            </Button>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={4}>
                          <FormGroup className="">
                            <Label htmlFor="expenseBudget">Expense Budget</Label>
                            <Controller
                              name="expenseBudget"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="text"
                                  id="expenseBudget"
                                  placeholder="Enter Expense Budgets"
                                  {...field}
                                  onChange={e => handleExpenseBudgetChange(e, field.onChange)}
                                  className={errors.expenseBudget ? 'is-invalid' : ''}
                                />
                              )}
                            />
                            {errors.expenseBudget && (
                              <div className="invalid-feedback">{errors.expenseBudget.message}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col lg={4}>
                          <FormGroup className="">
                            <Label htmlFor="revenueBudget">Revenue Budget</Label>
                            <Controller
                              name="revenueBudget"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="text"
                                  id="revenueBudget"
                                  placeholder="Enter VAT Revenue Budget"
                                  {...field}
                                  onChange={e => handleRevenueBudgetChange(e, field.onChange)}
                                  className={errors.revenueBudget ? 'is-invalid' : ''}
                                />
                              )}
                            />
                            {errors.revenueBudget && (
                              <div className="invalid-feedback">{errors.revenueBudget.message}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col lg={4}>
                          <FormGroup className="">
                            <Label htmlFor="invoiceLanguageCode">
                              <span className="text-danger"></span>Invoice Language(TBD)
                            </Label>
                            <Controller
                              name="invoiceLanguageCode"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={INVOICE_LANGUAGE_OPTIONS}
                                  id="invoiceLanguageCode"
                                  placeholder="Select invoiceLanguageCode"
                                  styles={selectStyles}
                                  className={errors.invoiceLanguageCode ? 'is-invalid' : ''}
                                  isClearable
                                />
                              )}
                            />
                            {errors.invoiceLanguageCode && (
                              <div className="invalid-feedback d-block">
                                {errors.invoiceLanguageCode.message}
                              </div>
                            )}
                          </FormGroup>
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
                            >
                              <CircleDot className="h-4 w-4" /> Create
                            </Button>
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              onClick={() => setCreateMore(true)}
                            >
                              <RefreshCw className="h-4 w-4" /> Create and More
                            </Button>
                            <Button
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                history.push('/admin/master/project');
                              }}
                              type="button"
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

      <ContactModal
        openContactModal={openContactModal}
        closeContactModal={(val, data) => {
          closeContactModal(val, data);
        }}
        createContact={projectActions.createProjectContact}
        titleList={title_list}
        currencyList={currency_list}
        countryList={country_list}
        getStateList={projectActions.getStateList}
      />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateProject);
