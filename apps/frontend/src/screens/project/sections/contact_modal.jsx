import React, { useState, useEffect } from 'react';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'components/migration';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Zod validation schema
const contactSchema = z
  .object({
    contactType: z.number().default(2),
    billingEmail: z.string().optional(),
    city: z.string().optional(),
    countryId: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .nullable()
      .refine(val => val !== null, 'Country is a required field'),
    currencyCode: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .nullable()
      .optional(),
    firstName: z.string().min(1, 'First name is a required field'),
    lastName: z.string().min(1, 'Last name is a required field'),
    middleName: z.string().min(1, 'Middle name is required'),
    email: z.string().min(1, 'Email is a required field').email('Email must be a valid email'),
    stateId: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .nullable()
      .optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    addressLine3: z.string().optional(),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    organization: z.string().optional(),
    poBoxNumber: z.string().optional(),
    postZipCode: z.string().min(1, 'Postal code is required'),
    telephone: z.string().min(1, 'Telephone number is required'),
    vatRegistrationNumber: z.string().min(1, 'Tax registration number is required'),
    contractPoNumber: z.string().optional(),
  })
  .refine(
    data => {
      if (data.countryId) {
        return data.stateId !== null;
      }
      return true;
    },
    {
      message: 'State is required',
      path: ['stateId'],
    }
  );

const regEx = /^[0-9]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const ContactModal = ({
  openContactModal,
  closeContactModal,
  currencyList,
  countryList,
  createContact,
  getStateList,
}) => {
  const [stateList, setStateList] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactType: 2,
      billingEmail: '',
      city: '',
      countryId: null,
      currencyCode: null,
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      stateId: null,
      addressLine1: '',
      addressLine2: '',
      mobileNumber: '',
      organization: '',
      poBoxNumber: '',
      postZipCode: '',
      telephone: '',
      vatRegistrationNumber: '',
      contractPoNumber: '',
      addressLine3: '',
    },
    mode: 'onChange',
  });

  const countryId = watch('countryId');

  useEffect(() => {
    if (countryId && countryId.value) {
      handleGetStateList(countryId.value);
    } else {
      setStateList([]);
      setValue('stateId', null);
    }
  }, [countryId]);

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`]?.value || '';
      }
    }
    return temp;
  };

  const handleGetStateList = countryCode => {
    if (countryCode) {
      getStateList(countryCode).then(res => {
        if (res.status === 200) {
          setStateList(res.data);
        }
      });
    } else {
      setStateList([]);
    }
  };

  const onSubmit = data => {
    const postData = getData(data);
    const request = createContact(postData);
    request.then(res => {
      if (res.status === 200) {
        closeContactModal(true, res.data);
        reset();
      }
    });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openContactModal} className="modal-success contact-modal">
        <Form name="simpleForm" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>New Contact</ModalHeader>
          <ModalBody>
            <Row>
              <Col>
                <FormGroup>
                  <Label htmlFor="firstName">
                    <span className="text-danger">* </span>First Name
                  </Label>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        id="firstName"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        placeholder="Enter firstName "
                        value={value}
                        className={errors.firstName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Controller
                    name="middleName"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        id="middleName"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        placeholder="Enter middleName  "
                        value={value}
                        className={errors.middleName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.middleName && (
                    <div className="invalid-feedback">{errors.middleName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label htmlFor="lastName">
                    <span className="text-danger">* </span>Last Name
                  </Label>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        id="lastName"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        placeholder="Enter lastName   "
                        value={value}
                        className={errors.lastName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <hr />
            <h4 className="mb-3 mt-3">Contact Details</h4>
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="organization">Organization Name</Label>
                  <Controller
                    name="organization"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="organization"
                        {...field}
                        className={errors.organization ? 'is-invalid' : ''}
                        placeholder="Enter Organization Name"
                      />
                    )}
                  />
                  {errors.organization && (
                    <div className="invalid-feedback">{errors.organization.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="poBoxNumber">PO Box Number</Label>
                  <Controller
                    name="poBoxNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="poBoxNumber"
                        {...field}
                        className={errors.poBoxNumber ? 'is-invalid' : ''}
                        placeholder="Enter PO Box Number"
                      />
                    )}
                  />
                  {errors.poBoxNumber && (
                    <div className="invalid-feedback">{errors.poBoxNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label htmlFor="email">
                    <span className="text-danger">* </span>Email
                  </Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="email"
                        id="email"
                        {...field}
                        placeholder="Enter email"
                        className={errors.email ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="telephone">
                    <span className="text-danger">* </span>Telephone
                  </Label>
                  <Controller
                    name="telephone"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        maxLength="15"
                        type="text"
                        id="telephone"
                        onChange={e => {
                          if (e.target.value === '' || regEx.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        value={value}
                        className={errors.telephone ? 'is-invalid' : ''}
                        placeholder="Enter Telephone Number"
                      />
                    )}
                  />
                  {errors.telephone && (
                    <div className="invalid-feedback">{errors.telephone.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="mobileNumber">
                    <span className="text-danger">* </span>Mobile Number
                  </Label>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        defaultCountry="AE"
                        international
                        value={value}
                        onChange={onChange}
                        className={errors.mobileNumber ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.mobileNumber && (
                    <div className="invalid-feedback">{errors.mobileNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label htmlFor="addressLine1">
                    <span className="text-danger">* </span>Address Line 1
                  </Label>
                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="addressLine1"
                        {...field}
                        placeholder="Enter AddressLine1"
                        className={errors.addressLine1 ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.addressLine1 && (
                    <div className="invalid-feedback">{errors.addressLine1.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label htmlFor="addressLine2">
                    <span className="text-danger">* </span>Address Line 2
                  </Label>
                  <Controller
                    name="addressLine2"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="addressLine2"
                        {...field}
                        placeholder="Enter AddressLine2"
                        className={errors.addressLine2 ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.addressLine2 && (
                    <div className="invalid-feedback">{errors.addressLine2.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="addressLine3">Address Line3</Label>
                  <Controller
                    name="addressLine3"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="addressLine3"
                        {...field}
                        placeholder="Enter AddressLine 3"
                      />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="countryId">
                    <span className="text-danger">* </span>Country
                  </Label>
                  <Controller
                    name="countryId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        options={
                          countryList
                            ? selectOptionsFactory.renderOptions(
                                'countryName',
                                'countryCode',
                                countryList,
                                'Country'
                              )
                            : []
                        }
                        value={value}
                        onChange={option => {
                          onChange(option || null);
                        }}
                        placeholder="Select Country"
                        id="countryId"
                        className={errors.countryId ? 'is-invalid' : ''}
                        isClearable
                      />
                    )}
                  />
                  {errors.countryId && (
                    <div className="invalid-feedback">{errors.countryId.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="stateId">State</Label>
                  <Controller
                    name="stateId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        options={
                          stateList
                            ? selectOptionsFactory.renderOptions(
                                'label',
                                'value',
                                stateList,
                                'State'
                              )
                            : []
                        }
                        value={value}
                        onChange={option => {
                          onChange(option || null);
                        }}
                        placeholder="Select State"
                        id="stateId"
                        className={errors.stateId ? 'is-invalid' : ''}
                        isClearable
                      />
                    )}
                  />
                  {errors.stateId && (
                    <div className="invalid-feedback">{errors.stateId.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="city">City</Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        value={value}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        placeholder=""
                        id="city"
                        className={errors.city ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                </FormGroup>
              </Col>
            </Row>
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="postZipCode">
                    <span className="text-danger">* </span>Post Zip Code
                  </Label>
                  <Controller
                    name="postZipCode"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        id="postZipCode"
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        value={value}
                        className={errors.postZipCode ? 'is-invalid' : ''}
                        placeholder="Enter Postal ZipCode"
                      />
                    )}
                  />
                  {errors.postZipCode && (
                    <div className="invalid-feedback">{errors.postZipCode.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <hr />
            <h4 className="mb-3 mt-3">Invoicing Details</h4>
            <Row>
              <Col lg={4}>
                <FormGroup>
                  <Label htmlFor="billingEmail">
                    <span className="text-danger">* </span>Billing Email
                  </Label>
                  <Controller
                    name="billingEmail"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="billingEmail"
                        {...field}
                        placeholder="Enter billingEmail"
                        className={errors.billingEmail ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.billingEmail && (
                    <div className="invalid-feedback">{errors.billingEmail.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="contractPoNumber">Contract PO Number</Label>
                  <Controller
                    name="contractPoNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="contractPoNumber"
                        {...field}
                        className={errors.contractPoNumber ? 'is-invalid' : ''}
                        placeholder="Enter Contract PoNumber"
                      />
                    )}
                  />
                  {errors.contractPoNumber && (
                    <div className="invalid-feedback">{errors.contractPoNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="vatRegistrationNumber">
                    <span className="text-danger">* </span>Tax Registration Number
                  </Label>
                  <Controller
                    name="vatRegistrationNumber"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        id="vatRegistrationNumber"
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        value={value}
                        className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
                        placeholder="Enter Tax Registration Number"
                      />
                    )}
                  />
                  {errors.vatRegistrationNumber && (
                    <div className="invalid-feedback">{errors.vatRegistrationNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Controller
                    name="currencyCode"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        options={
                          currencyList
                            ? selectCurrencyFactory.renderOptions(
                                'currencyName',
                                'currencyCode',
                                currencyList,
                                'Currency'
                              )
                            : []
                        }
                        value={value}
                        onChange={option => {
                          onChange(option || null);
                        }}
                        placeholder="Select Currency"
                        id="currencyCode"
                        className={errors.currencyCode ? 'is-invalid' : ''}
                        isClearable
                      />
                    )}
                  />
                  {errors.currencyCode && (
                    <div className="invalid-feedback">{errors.currencyCode.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="success" type="submit" className="btn-square">
              Save
            </Button>
            &nbsp;
            <Button
              color="secondary"
              type="button"
              className="btn-square"
              onClick={() => {
                closeContactModal(false);
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactModal;
