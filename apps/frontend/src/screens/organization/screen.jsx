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
  Input,
  Col,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';

import ImageUploader from 'react-images-upload';
import Select from 'react-select';
import { Loader } from 'components';
import { CommonActions } from 'services/global';
import * as OrganizationActions from './actions';
import { selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';
import config from 'constants/config';

// Zod validation schema
const organizationSchema = z.object({
  name: z.string().min(1, 'Company Name is required'),
  industryTypeCode: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Industry Type is required'),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  countryCode: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Country is required'),
  postZipCode: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactEmailAddress: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhoneNumber: z.string().optional(),
  phoneNumber: z.string().min(1, 'Phone Number is required'),
  companyRegistrationId: z.string().min(1, 'Company ID is required'),
  vatNumber: z.string().min(1, 'VAT Number is required'),
});

const mapStateToProps = state => {
  return {
    country_list: state.organization.country_list,
    industry_type_list: state.organization.industry_type_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    organizationActions: bindActionCreators(OrganizationActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const Organization = ({
  organizationActions,
  commonActions,
  country_list,
  industry_type_list,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [pictures, setPictures] = useState([]);

  const form = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      industryTypeCode: null,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      countryCode: null,
      postZipCode: '',
      contactPersonName: '',
      contactEmailAddress: '',
      contactPhoneNumber: '',
      phoneNumber: '',
      companyRegistrationId: '',
      vatNumber: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    organizationActions.getCountryList();
    organizationActions.getIndustryTypeList();
  }, [organizationActions]);

  const uploadImage = picture => {
    setPictures(picture);
  };

  const onSubmit = data => {
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('industryTypeCode', data.industryTypeCode?.value || '');
    formData.append('addressLine1', data.addressLine1 || '');
    formData.append('addressLine2', data.addressLine2 || '');
    formData.append('city', data.city || '');
    formData.append('state', data.state || '');
    formData.append('countryCode', data.countryCode?.value || '');
    formData.append('postZipCode', data.postZipCode || '');
    formData.append('contactPersonName', data.contactPersonName || '');
    formData.append('contactEmailAddress', data.contactEmailAddress || '');
    formData.append('contactPhoneNumber', data.contactPhoneNumber || '');
    formData.append('phoneNumber', data.phoneNumber || '');
    formData.append('companyRegistrationId', data.companyRegistrationId || '');
    formData.append('vatNumber', data.vatNumber || '');

    if (pictures.length > 0) {
      formData.append('companyLogo ', pictures[0]);
    }

    organizationActions
      .createOrganization(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'New Company Created Successfully');
          history.push(config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const containerStyle = {
    zIndex: 1999,
    closeOnClick: true,
    draggable: true,
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="organization-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon fas fa-sitemap" />
                <span className="ml-2">Organization</span>
              </div>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg="12">
                  <Form name="simpleForm" className="mt-3" onSubmit={handleSubmit(onSubmit)}>
                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName" className="mt-3">
                          Company Logo
                        </Label>
                      </Col>
                      <Col xs="12" md="8" lg="2">
                        <ImageUploader
                          withIcon={true}
                          buttonText="Choose images"
                          onChange={uploadImage}
                          imgExtension={['jpg', 'gif', 'png', 'jpeg']}
                          maxFileSize={1048576}
                          withPreview={true}
                          singleImage={true}
                          label="'Max file size: 1mb"
                        />
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="companyName">
                          <span className="text-danger">* </span>Company Name
                        </Label>
                      </Col>
                      <Col xs="12" md="5">
                        <Input
                          type="text"
                          id="name"
                          placeholder="Enter Company Name"
                          {...register('name')}
                          className={errors.name ? 'is-invalid' : ''}
                        />
                        {errors.name && (
                          <div className="invalid-feedback d-block">{errors.name.message}</div>
                        )}
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName">
                          <span className="text-danger">* </span>Industry
                        </Label>
                      </Col>
                      <Col xs="12" md="5">
                        <Controller
                          name="industryTypeCode"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={
                                industry_type_list
                                  ? selectOptionsFactory.renderOptions(
                                      'label',
                                      'value',
                                      industry_type_list
                                    )
                                  : []
                              }
                              placeholder="Select Industry"
                              id="industryTypeCode"
                              styles={selectStyles}
                              className={errors.industryTypeCode ? 'is-invalid' : ''}
                              isClearable
                            />
                          )}
                        />
                        {errors.industryTypeCode && (
                          <div className="invalid-feedback d-block">
                            {errors.industryTypeCode.message}
                          </div>
                        )}
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName">
                          <span className="text-danger">* </span>Company Address
                        </Label>
                      </Col>
                      <Col xs="12" md="8">
                        <FormGroup>
                          <Input
                            type="text"
                            id="addressLine1"
                            placeholder="Street1"
                            {...register('addressLine1')}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="text"
                            id="addressLine2"
                            placeholder="Street2"
                            {...register('addressLine2')}
                          />
                        </FormGroup>
                        <Row>
                          <Col xs="12" md="3">
                            <Controller
                              name="countryCode"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={
                                    country_list
                                      ? selectOptionsFactory.renderOptions(
                                          'countryName',
                                          'countryCode',
                                          country_list,
                                          'Country'
                                        )
                                      : []
                                  }
                                  placeholder="Select Country"
                                  id="countryCode"
                                  styles={selectStyles}
                                  className={errors.countryCode ? 'is-invalid' : ''}
                                  isClearable
                                />
                              )}
                            />
                            {errors.countryCode && (
                              <div className="invalid-feedback d-block">
                                {errors.countryCode.message}
                              </div>
                            )}
                          </Col>
                          <Col xs="12" md="3">
                            <Input type="text" id="city" placeholder="City" {...register('city')} />
                          </Col>
                          <Col xs="12" md="3">
                            <Input
                              type="text"
                              id="state"
                              placeholder="State/Province"
                              {...register('state')}
                            />
                          </Col>
                          <Col xs="12" md="3">
                            <Input
                              type="text"
                              id="postZipCode"
                              placeholder="Zip/Postal Code"
                              {...register('postZipCode')}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName">
                          <span className="text-danger">* </span>Phone
                        </Label>
                      </Col>
                      <Col xs="12" md="8">
                        <Input
                          type="text"
                          id="phoneNumber"
                          placeholder="Enter Phone Number"
                          {...register('phoneNumber')}
                          className={errors.phoneNumber ? 'is-invalid' : ''}
                        />
                        {errors.phoneNumber && (
                          <div className="invalid-feedback d-block">
                            {errors.phoneNumber.message}
                          </div>
                        )}
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName">
                          <span className="text-danger">* </span>Contact Detail
                        </Label>
                      </Col>
                      <Col xs="12" md="8">
                        <Row>
                          <Col xs="12" md="4">
                            <Input
                              type="text"
                              id="contactPersonName"
                              placeholder="Name"
                              {...register('contactPersonName')}
                            />
                          </Col>
                          <Col xs="12" md="4">
                            <Input
                              type="text"
                              id="contactEmailAddress"
                              placeholder="Email"
                              {...register('contactEmailAddress')}
                              className={errors.contactEmailAddress ? 'is-invalid' : ''}
                            />
                            {errors.contactEmailAddress && (
                              <div className="invalid-feedback d-block">
                                {errors.contactEmailAddress.message}
                              </div>
                            )}
                          </Col>
                          <Col xs="12" md="4">
                            <Input
                              type="text"
                              id="contactPhoneNumber"
                              placeholder="Phone"
                              {...register('contactPhoneNumber')}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName">
                          <span className="text-danger">* </span>Company ID
                        </Label>
                      </Col>
                      <Col xs="12" md="8">
                        <Input
                          type="text"
                          id="companyRegistrationId"
                          placeholder="Enter Company Id"
                          {...register('companyRegistrationId')}
                          className={errors.companyRegistrationId ? 'is-invalid' : ''}
                        />
                        {errors.companyRegistrationId && (
                          <div className="invalid-feedback d-block">
                            {errors.companyRegistrationId.message}
                          </div>
                        )}
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2" className="text-right">
                        <Label htmlFor="categoryName">
                          <span className="text-danger">* </span>VAT Number
                        </Label>
                      </Col>
                      <Col xs="12" md="8">
                        <Input
                          type="text"
                          id="vatNumber"
                          placeholder="Enter VAT Number"
                          {...register('vatNumber')}
                          className={errors.vatNumber ? 'is-invalid' : ''}
                        />
                        {errors.vatNumber && (
                          <div className="invalid-feedback d-block">{errors.vatNumber.message}</div>
                        )}
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Col md="2"></Col>
                      <Col xs="12" md="8">
                        <Button type="submit" color="primary" className="btn-square mt-5">
                          <i className="fas fa-save mr-2"></i>Save
                        </Button>
                      </Col>
                    </FormGroup>
                  </Form>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Organization);
