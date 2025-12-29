import { useState, useEffect, useCallback } from 'react';
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
import { Loader, ConfirmDeleteModal } from 'components';

import * as ProjectActions from '../../actions';
import { toast } from 'sonner';

import { CommonActions } from 'services/global';
import * as DetailProjectActions from './actions';
import { selectOptionsFactory, selectStyles } from 'utils';

import './style.scss';
import { Network, Plus, Trash2, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    currency_list: state.project.currency_list,
    country_list: state.project.country_list,
    contact_list: state.project.contact_list,
    title_list: state.project.title_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    projectActions: bindActionCreators(ProjectActions, dispatch),
    detailProjectActions: bindActionCreators(DetailProjectActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const INVOICE_LANGUAGE_OPTIONS = [
  { value: 1, label: 'English' },
  // { value: 2, label: 'Arabic' }
];

// Zod validation schema
const detailProjectSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .regex(/^[a-zA-Z ]+$/, 'Project name must contain only letters and spaces'),
  contactId: z.string().min(1, 'Contact name is required'),
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

const DetailProject = ({
  projectActions,
  detailProjectActions,
  commonActions,
  history,
  location,
  currency_list,
  country_list,
  contact_list,
  title_list,
}) => {
  const [openContactModal, setOpenContactModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const form = useForm({
    resolver: zodResolver(detailProjectSchema),
    defaultValues: {
      projectName: '',
      contactId: '',
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

  const initializeData = useCallback(() => {
    if (location.state?.id) {
      detailProjectActions
        .getProjectById(location.state.id)
        .then(res => {
          projectActions.getContactList();
          projectActions.getCountryList();
          projectActions.getCurrencyList();
          if (res.status === 200) {
            setCurrentProjectId(location.state.id);
            reset({
              projectName: res.data.projectName || '',
              contactId: res.data.contactId ? res.data.contactId.toString() : '',
              expenseBudget: res.data.expenseBudget || '',
              revenueBudget: res.data.revenueBudget || '',
              invoiceLanguageCode: null,
            });
            setLoading(false);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
          setLoading(false);
        });
    } else {
      history.push('/admin/master/project');
    }
  }, [location.state, detailProjectActions, projectActions, commonActions, reset, history]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Show Contact Modal
  const showContactModal = () => {
    setOpenContactModal(true);
  };

  // Close Contact Modal
  const closeContactModal = (res, data) => {
    if (res) {
      const val = { label: data.fullName, value: data.id };
      projectActions.getContactList();
      setValue('contactId', data.id.toString(), { shouldValidate: true });
    }
    setOpenContactModal(false);
  };

  // Show Success Toast
  const success = msg => {
    toast.success(msg, {
      position: 'top-right',
    });
  };

  // Update Project
  const onSubmit = data => {
    const postData = {
      projectId: currentProjectId,
      projectName: data.projectName || '',
      contactId: data.contactId || '',
      expenseBudget: data.expenseBudget || '',
      revenueBudget: data.revenueBudget || '',
    };

    detailProjectActions
      .updateProject(postData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Project Updated successfully!');
          history.push('/admin/master/project');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  const deleteProject = () => {
    const message1 = (
      <text>
        <b>Delete Project?</b>
      </text>
    );
    const message = 'This Project will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeProject}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeProject = () => {
    detailProjectActions
      .deleteProject(currentProjectId)
      .then(res => {
        if (res.status === 200) {
          success('Project Deleted Successfully');
          history.push('/admin/master/project');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  const removeDialog = () => {
    setDialog(null);
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="create-product-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <Network className="h-4 w-4" />
                        <span className="ml-2">Update Project</span>
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
                                    value={
                                      contact_list &&
                                      contact_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      if (option?.value) {
                                        field.onChange(option.value.toString());
                                      } else {
                                        field.onChange('');
                                      }
                                    }}
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
                                type="button"
                                className="btn-square"
                                onClick={showContactModal}
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
                                <div className="invalid-feedback">
                                  {errors.expenseBudget.message}
                                </div>
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
                                <div className="invalid-feedback">
                                  {errors.revenueBudget.message}
                                </div>
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
                          <Col
                            lg={12}
                            className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                          >
                            <FormGroup>
                              <Button
                                color="danger"
                                className="btn-square"
                                onClick={deleteProject}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button type="submit" color="primary" className="btn-square mr-3">
                                <CircleDot className="h-4 w-4" /> Update
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
          currencyList={currency_list}
          countryList={country_list}
          getStateList={projectActions.getStateList}
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailProject);
