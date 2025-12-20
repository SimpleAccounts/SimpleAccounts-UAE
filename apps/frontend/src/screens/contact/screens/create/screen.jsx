import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { LeavePage, Loader } from 'components';
import { upperFirst } from 'lodash-es';
import { selectOptionsFactory, InputValidation, DropdownLists, Lists, selectStyles } from 'utils';
import './style.scss';
import { data } from '../../../Language/index';
import { AddressComponent } from 'screens/contact/sections';
import LocalizedStrings from 'react-localization';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as CreateContactActions from './actions';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const mapStateToProps = state => {
  const currencyList = state.common.currency_convert_list;
  return {
    country_list: state.contact.country_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    contact_type_list: state.contact.contact_type_list,
    companyDetails: state.common.company_details,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    contactActions: bindActionCreators(ContactActions, dispatch),
    createContactActions: bindActionCreators(CreateContactActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

// Zod validation schema
const createContactSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  middleName: z.string().optional(),
  currencyCode: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Currency is required'),
  contactType: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Contact type is required'),
  taxTreatmentId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Tax Treatment is required'),
  email: z.string().min(1, 'Email is required').email('Invalid Email'),
  organization: z.string().optional(),
  telephone: z.string().optional(),
  mobileNumber: z.string().optional(),
  website: z.string().optional(),
  vatRegistrationNumber: z.string().optional(),
  billingAddress: z.object({
    email: z.string().optional(),
    city: z.string().optional(),
    countryId: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
    postZipCode: z.string().optional(),
    stateId: z.union([z.string(), z.number()]).optional(),
    telephone: z.string().optional(),
    fax: z.string().optional(),
  }),
  shippingAddress: z.object({
    city: z.string().optional(),
    countryId: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
    postZipCode: z.string().optional(),
    stateId: z.union([z.string(), z.number()]).optional(),
    telephone: z.string().optional(),
    fax: z.string().optional(),
  }),
});

const CreateContact = ({
  contactActions,
  createContactActions,
  commonActions,
  history,
  contactType,
  country_list,
  currency_list_dropdown,
  contact_type_list,
  companyDetails,
  isParentComponentPresent,
  getCurrentContactData,
  closeModal,
  confirmCancel,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [createMore, setCreateMore] = useState(false);
  const [checkmobileNumberParam, setCheckmobileNumberParam] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isRegisteredForVat, setIsRegisteredForVat] = useState(false);
  const [isSame, setIsSame] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [disableCountry, setDisableCountry] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [trnExist, setTrnExist] = useState(false);
  const [emailExist, setEmailExist] = useState(false);

  const regEx = /^[0-9]+$/;
  const regExTelephone = /^[0-9-]+$/;
  const regExAlpha = /^[a-zA-Z ]+$/;
  const regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;

  const form = useForm({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      shippingAddress: Lists.Address,
      billingAddress: {
        email: '',
        city: '',
        countryId: '',
        address: '',
        postZipCode: '',
        stateId: '',
        telephone: '',
        fax: '',
      },
      contactType: contactType || null,
      currencyCode: null,
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      mobileNumber: '',
      organization: '',
      telephone: '',
      website: '',
      vatRegistrationNumber: '',
      taxTreatmentId: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    trigger,
  } = form;

  const watchedValues = watch();

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    initializeData();
    createContactActions
      .getTaxTreatment()
      .then(res => {
        if (res.status === 200) {
          const array = res.data.filter(row => row.id !== 8);
          setTaxTreatmentList(array);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err.data ? err.data.message : 'ERROR');
      });
  }, []);

  const initializeData = () => {
    commonActions.getCurrencyConversionList();
    contactActions.getContactTypeList();
    contactActions.getCountryList();
    if (companyDetails) {
      const { currencyCode, isRegisteredVat } = companyDetails;
      const currencyOption = currency_list_dropdown?.find(option => option.value === currencyCode);
      if (currencyOption) {
        setValue('currencyCode', currencyOption);
      }
      setIsRegisteredVat(isRegisteredVat);
    }
  };

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else if (data[`${item}`] && data[`${item}`].value !== undefined) {
        temp[`${item}`] = data[`${item}`].value;
      }
    }

    const billingcountryId = data[`billingAddress`].countryId;
    const shippingCountryId = data[`shippingAddress`].countryId;

    temp[`isActive`] = isActive;
    temp[`isBillingAndShippingAddressSame`] = isSame;
    temp[`addressLine1`] = data[`billingAddress`].address;
    temp[`countryId`] = billingcountryId;
    temp[`stateId`] = data[`billingAddress`].stateId;
    temp[`postZipCode`] = data[`billingAddress`].postZipCode;
    temp[`city`] = data[`billingAddress`].city;
    temp[`fax`] = data[`billingAddress`].fax;
    temp[`billingTelephone`] = data[`billingAddress`].telephone;
    temp[`addressLine2`] = data[`shippingAddress`].address;
    temp[`poBoxNumber`] = data[`billingAddress`].postZipCode;

    const billingAdress = {
      billingAddress: data[`billingAddress`].address,
      billingCity: data[`billingAddress`].city,
      billingEmail: data[`billingAddress`].email,
      billingFax: data[`billingAddress`].fax,
      billingPoBoxNumber: billingcountryId === 229 ? data[`billingAddress`].postZipCode : '',
      billingPostZipCode: billingcountryId !== 229 ? data[`billingAddress`].postZipCode : '',
      billingStateProvince: data[`billingAddress`].stateId,
      billingcountryId: data[`billingAddress`].countryId,
    };

    const shippingAddress = {
      shippingAddress: data[`shippingAddress`].address,
      shippingCity: data[`shippingAddress`].city,
      billingEmail: data[`shippingAddress`].email,
      shippingFax: data[`shippingAddress`].fax,
      shippingTelephone: data[`shippingAddress`].telephone,
      shippingPoBoxNumber: shippingCountryId === 229 ? data[`shippingAddress`].postZipCode : '',
      shippingPostZipCode: shippingCountryId !== 229 ? data[`shippingAddress`].postZipCode : '',
      shippingStateId: data[`shippingAddress`].stateId,
      shippingCountryId: data[`shippingAddress`].countryId,
    };
    temp = { ...temp, ...billingAdress, ...shippingAddress };
    return temp;
  };

  const onSubmit = data => {
    // Custom validation
    if (!(isParentComponentPresent && isParentComponentPresent === true)) {
      if (checkmobileNumberParam === true) {
        setError('mobileNumber', { type: 'manual', message: 'Invalid mobile number' });
        return;
      }
    }
    if (isRegisteredForVat === true) {
      if (data.vatRegistrationNumber === '') {
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Tax registration number is required',
        });
        return;
      }
      if (data.vatRegistrationNumber.length !== 15) {
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Please enter 15 digit Tax registration number',
        });
        return;
      }
    }
    if (trnExist === true) {
      setError('vatRegistrationNumber', {
        type: 'manual',
        message: 'Tax registration number already exists',
      });
      return;
    }
    if (emailExist === true) {
      setError('email', { type: 'manual', message: 'Email already exists' });
      return;
    }

    const shippingAddressError = InputValidation.addressValidation(data.shippingAddress);
    if (shippingAddressError && Object.values(shippingAddressError).length > 0) {
      setError('shippingAddress', { type: 'manual', message: 'Invalid shipping address' });
      return;
    }
    const billingAddressError = InputValidation.addressValidation(data.billingAddress);
    if (billingAddressError && Object.values(billingAddressError).length > 0) {
      setError('billingAddress', { type: 'manual', message: 'Invalid billing address' });
      return;
    }

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Contact...');
    setDisabled(true);

    const postData = getData(data);

    createContactActions
      .createContact(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert('success', 'Contact Created Successfully');
          if (createMore) {
            reset({
              shippingAddress: Lists.Address,
              billingAddress: {
                email: '',
                city: '',
                countryId: '',
                address: '',
                postZipCode: '',
                stateId: '',
                telephone: '',
                fax: '',
              },
              contactType: contactType || null,
              currencyCode: companyDetails
                ? currency_list_dropdown?.find(
                    option => option.value === companyDetails.currencyCode
                  )
                : null,
              email: '',
              firstName: '',
              lastName: '',
              middleName: '',
              mobileNumber: '',
              organization: '',
              telephone: '',
              website: '',
              vatRegistrationNumber: '',
              taxTreatmentId: null,
            });
            setCreateMore(false);
            setDisableLeavePage(false);
          } else {
            if (isParentComponentPresent && isParentComponentPresent === true) {
              getCurrentContactData(res.data);
              closeModal(true);
            } else {
              history.push('/admin/master/contact');
            }
            setLoading(false);
          }
        }
      })
      .catch(err => {
        console.log(err);
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Contact Created Unsuccessfully'
        );
      });
  };

  const resetCountryList = taxtid => {
    let list = [];
    if (taxtid === 7 || taxtid === 5 || taxtid === 6) {
      country_list.forEach(obj => {
        if (
          (taxtid === 6 || taxtid === 5) &&
          (obj.countryCode === 229 ||
            obj.countryCode === 191 ||
            obj.countryCode === 178 ||
            obj.countryCode === 165 ||
            obj.countryCode === 117 ||
            obj.countryCode === 17)
        ) {
          list.push(obj);
        }
        if (
          taxtid === 7 &&
          obj.countryCode !== 229 &&
          obj.countryCode !== 191 &&
          obj.countryCode !== 178 &&
          obj.countryCode !== 165 &&
          obj.countryCode !== 117 &&
          obj.countryCode !== 17
        ) {
          list.push(obj);
        }
      });
      setValue('shippingAddress.countryId', '');
      setValue('billingAddress.countryId', '');
      setValue('shippingAddress.stateId', '');
      setValue('billingAddress.stateId', '');
      setIsSame(false);
    } else {
      list = country_list;
      const country = country_list.find(option => option.countryCode === 229);
      if (country) {
        setValue('shippingAddress.countryId', country.countryCode);
        setValue('billingAddress.countryId', country.countryCode);
      }
      setValue('shippingAddress.stateId', '');
      setValue('billingAddress.stateId', '');
      setIsSame(false);
    }
    list = list
      ? selectOptionsFactory.renderOptions('countryName', 'countryCode', list, 'Country')
      : [];
    setCountryList(list);
  };

  const validationCheck = value => {
    const data = {
      moduleType: 21,
      name: value,
    };
    contactActions.checkValidation(data).then(response => {
      if (response.data === 'Tax Registration Number Already Exists') {
        setTrnExist(true);
      } else {
        setTrnExist(false);
      }
    });
  };

  const emailvalidationCheck = value => {
    const data = {
      moduleType: 22,
      name: value,
    };
    contactActions.checkValidation(data).then(response => {
      if (response.data === 'Email Already Exists') {
        setEmailExist(true);
      } else {
        setEmailExist(false);
      }
    });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="create-contact-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-id-card-alt" />
                        <span className="ml-2">{strings.CreateContact}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col>
                            {!(isParentComponentPresent && isParentComponentPresent === true) && (
                              <FormGroup className="mb-3">
                                <Label htmlFor="active">
                                  <span className="text-danger">* </span>
                                  {strings.Status}
                                </Label>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <FormGroup check inline>
                                  <div className="custom-radio custom-control">
                                    <input
                                      className="custom-control-input"
                                      type="radio"
                                      id="inline-radio1"
                                      name="active"
                                      checked={selectedStatus}
                                      value={true}
                                      onChange={e => {
                                        if (e.target.value === 'true') {
                                          setSelectedStatus(true);
                                          setIsActive(true);
                                        }
                                      }}
                                    />
                                    <label className="custom-control-label" htmlFor="inline-radio1">
                                      {strings.Active}
                                    </label>
                                  </div>
                                </FormGroup>
                                <FormGroup check inline>
                                  <div className="custom-radio custom-control">
                                    <input
                                      className="custom-control-input"
                                      type="radio"
                                      id="inline-radio2"
                                      name="active"
                                      value={false}
                                      checked={!selectedStatus}
                                      onChange={e => {
                                        if (e.target.value === 'false') {
                                          setSelectedStatus(false);
                                          setIsActive(false);
                                        }
                                      }}
                                    />
                                    <label className="custom-control-label" htmlFor="inline-radio2">
                                      {strings.Inactive}
                                    </label>
                                  </div>
                                </FormGroup>
                              </FormGroup>
                            )}
                          </Col>
                        </Row>
                        <h4 className="mb-4">{strings.ContactName}</h4>

                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="firstName">
                                <span className="text-danger">* </span>
                                {strings.FirstName}
                              </Label>
                              <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="firstName"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.FirstName}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(upperFirst(value));
                                      }
                                    }}
                                    className={
                                      errors.firstName && touchedFields.firstName
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.firstName && touchedFields.firstName && (
                                <div className="invalid-feedback">{errors.firstName.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="middleName">{strings.MiddleName}</Label>
                              <Controller
                                name="middleName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="middleName"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.MiddleName}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(upperFirst(value));
                                      }
                                    }}
                                    className={
                                      errors.middleName && touchedFields.middleName
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.middleName && touchedFields.middleName && (
                                <div className="invalid-feedback">{errors.middleName.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="lastName">
                                <span className="text-danger">* </span>
                                {strings.LastName}
                              </Label>
                              <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="lastName"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.LastName}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAlpha.test(value)) {
                                        field.onChange(upperFirst(value));
                                      }
                                    }}
                                    className={
                                      errors.lastName && touchedFields.lastName ? 'is-invalid' : ''
                                    }
                                  />
                                )}
                              />
                              {errors.lastName && touchedFields.lastName && (
                                <div className="invalid-feedback">{errors.lastName.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <h4 className="mb-4">{strings.ContactDetails}</h4>

                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="contactType">
                                <span className="text-danger">* </span>
                                {strings.ContactType}
                                <i id="Contacttyprtip" className="fa fa-question-circle ml-1"></i>
                                <UncontrolledTooltip placement="right" target="Contacttyprtip">
                                  The contact type cannot be changed once a document has been
                                  created for this contact.
                                </UncontrolledTooltip>
                              </Label>
                              <Controller
                                name="contactType"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={
                                      contact_type_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            contact_type_list,
                                            'Contact '
                                          )
                                        : []
                                    }
                                    isDisabled={contactType ? true : false}
                                    placeholder={strings.Select + strings.ContactType}
                                    id="contactType"
                                    styles={selectStyles}
                                    className={
                                      errors.contactType && touchedFields.contactType
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.contactType && touchedFields.contactType && (
                                <div className="invalid-feedback">{errors.contactType.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="organization">{strings.OrganizationName}</Label>
                              <Controller
                                name="organization"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="organization"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.OrganizationName}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAddress.test(value)) {
                                        field.onChange(upperFirst(value));
                                      }
                                    }}
                                    className={
                                      errors.organization && touchedFields.organization
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.organization && touchedFields.organization && (
                                <div className="invalid-feedback">
                                  {errors.organization.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="email">
                                <span className="text-danger">* </span>
                                {strings.Email}
                              </Label>
                              <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="email"
                                    maxLength="80"
                                    id="email"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.EmailAddres}
                                    {...field}
                                    onChange={e => {
                                      field.onChange(e);
                                      emailvalidationCheck(e.target.value);
                                    }}
                                    className={
                                      errors.email && touchedFields.email ? 'is-invalid' : ''
                                    }
                                  />
                                )}
                              />
                              {errors.email && touchedFields.email && (
                                <div className="invalid-feedback">{errors.email.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="row-wrapper">
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="currencyCode">
                                <span className="text-danger">* </span>
                                {strings.Currency}
                                <i id="Currencytip" className="fa fa-question-circle ml-1"></i>
                                <UncontrolledTooltip placement="right" target="Currencytip">
                                  You cannot change the currency once a document is created for this
                                  contact.
                                </UncontrolledTooltip>
                              </Label>
                              <Controller
                                name="currencyCode"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={currency_list_dropdown}
                                    placeholder={strings.Select + strings.Currency}
                                    id="currencyCode"
                                    styles={selectStyles}
                                    className={
                                      errors.currencyCode && touchedFields.currencyCode
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.currencyCode && touchedFields.currencyCode && (
                                <div className="invalid-feedback">
                                  {errors.currencyCode.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="telephone">{strings.Telephone}</Label>
                              <Controller
                                name="telephone"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    maxLength="15"
                                    type="text"
                                    id="telephone"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.TelephoneNumber}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExTelephone.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={
                                      errors.telephone && touchedFields.telephone
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.telephone && touchedFields.telephone && (
                                <div className="invalid-feedback">{errors.telephone.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="mobileNumber">
                                <span className="text-danger"> </span>
                                {strings.MobileNumber}
                              </Label>
                              <Controller
                                name="mobileNumber"
                                control={control}
                                render={({ field }) => (
                                  <div
                                    className={
                                      errors.mobileNumber && touchedFields.mobileNumber
                                        ? ' is-invalidMobile '
                                        : ''
                                    }
                                  >
                                    <PhoneInput
                                      enableSearch={true}
                                      id="mobileNumber"
                                      country={'ae'}
                                      value={field.value}
                                      placeholder={strings.Enter + strings.MobileNumber}
                                      onChange={value => {
                                        field.onChange(value);
                                        setCheckmobileNumberParam(value.length !== 12);
                                      }}
                                      isValid
                                    />
                                  </div>
                                )}
                              />
                              {errors.mobileNumber && touchedFields.mobileNumber && (
                                <div className="invalid-feedback">
                                  {errors.mobileNumber.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>

                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="website">{strings.Website}</Label>
                              <Controller
                                name="website"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    id="website"
                                    maxLength="100"
                                    autoComplete="Off"
                                    placeholder={strings.Enter + strings.Website}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regExAddress.test(value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={
                                      errors.website && touchedFields.website ? 'is-invalid' : ''
                                    }
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="taxTreatmentId">
                                <span className="text-danger">* </span>
                                {strings.TaxTreatment}
                                <i id="TaxTreatmenttip" className="fa fa-question-circle ml-1"></i>
                                <UncontrolledTooltip placement="right" target="TaxTreatmenttip">
                                  Once any document has been created for this contact, you cannot
                                  change the Tax treatment.
                                </UncontrolledTooltip>
                              </Label>
                              <Controller
                                name="taxTreatmentId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={
                                      taxTreatmentList
                                        ? selectOptionsFactory.renderOptions(
                                            'name',
                                            'id',
                                            taxTreatmentList,
                                            'VAT'
                                          )
                                        : []
                                    }
                                    id="taxTreatmentId"
                                    placeholder={strings.Select + strings.TaxTreatment}
                                    styles={selectStyles}
                                    onChange={option => {
                                      field.onChange(option);
                                      if (option && option.value) {
                                        resetCountryList(option.value);
                                        if (
                                          option.value === 1 ||
                                          option.value === 3 ||
                                          option.value === 5
                                        ) {
                                          setIsRegisteredForVat(true);
                                        } else {
                                          setIsRegisteredForVat(false);
                                        }
                                        if (
                                          option.value === 1 ||
                                          option.value === 2 ||
                                          option.value === 3 ||
                                          option.value === 4
                                        ) {
                                          setDisableCountry(true);
                                        } else {
                                          setDisableCountry(false);
                                        }
                                      } else {
                                        setDisableCountry(false);
                                      }
                                      setValue('vatRegistrationNumber', '');
                                    }}
                                    className={
                                      errors.taxTreatmentId && touchedFields.taxTreatmentId
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.taxTreatmentId && touchedFields.taxTreatmentId && (
                                <div className="invalid-feedback">
                                  {errors.taxTreatmentId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          {watchedValues.taxTreatmentId && watchedValues.taxTreatmentId.value && (
                            <Col
                              md="4"
                              style={{
                                display:
                                  watchedValues.taxTreatmentId.value === 1 ||
                                  watchedValues.taxTreatmentId.value === 3 ||
                                  watchedValues.taxTreatmentId.value === 5
                                    ? ''
                                    : 'none',
                              }}
                            >
                              <FormGroup>
                                <Label htmlFor="vatRegistrationNumber">
                                  <span className="text-danger">* </span>
                                  {strings.TaxRegistrationNumber}
                                </Label>
                                <Controller
                                  name="vatRegistrationNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      minLength="15"
                                      maxLength="15"
                                      id="vatRegistrationNumber"
                                      autoComplete="Off"
                                      placeholder={strings.Enter + strings.TaxRegistrationNumber}
                                      {...field}
                                      onChange={e => {
                                        const value = e.target.value;
                                        if (value === '' || regEx.test(value)) {
                                          field.onChange(e);
                                          validationCheck(value);
                                        }
                                      }}
                                      className={
                                        errors.vatRegistrationNumber &&
                                        touchedFields.vatRegistrationNumber
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.vatRegistrationNumber &&
                                  touchedFields.vatRegistrationNumber && (
                                    <div className="invalid-feedback">
                                      {errors.vatRegistrationNumber.message}
                                    </div>
                                  )}
                                <div className="VerifyTRN">
                                  <br />
                                  <b>
                                    <a
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      href="https://tax.gov.ae/en/default.aspx"
                                      style={{ color: '#2266d8' }}
                                    >
                                      {strings.VerifyTRN}
                                    </a>
                                  </b>
                                </div>
                              </FormGroup>
                            </Col>
                          )}
                        </Row>
                        <hr />
                        <h2 className="mb-3 mt-3">{strings.ContactAddressDetails}</h2>
                        <h5 className="mb-3 mt-3">{strings.BillingDetails}</h5>
                        <Row className="row-wrapper">
                          <AddressComponent
                            values={watchedValues.billingAddress}
                            errors={errors.billingAddress}
                            touched={touchedFields.billingAddress || touchedFields.shippingAddress}
                            onChange={(field, value) => {
                              setValue(`billingAddress.${field}`, value);
                              setIsSame(false);
                            }}
                            country_list={countryList}
                            addressType={strings.Billing}
                            disabled={{
                              email: false,
                              city: false,
                              countryId: disableCountry,
                              address: false,
                              postZipCode: false,
                              stateId: false,
                              telephone: false,
                              fax: false,
                            }}
                          />
                        </Row>
                        <hr />
                        <h5 className="mb-3 mt-3">{strings.ShippingDetails}</h5>
                        <Row>
                          <Col lg={12}>
                            <FormGroup check inline className="mb-3">
                              <div>
                                <Input
                                  onChange={() => {
                                    if (!isSame) {
                                      setValue('shippingAddress', watchedValues.billingAddress);
                                    } else {
                                      setValue('shippingAddress', Lists.Address);
                                      if (disableCountry) {
                                        setValue('shippingAddress.countryId', 229);
                                      }
                                    }
                                    setIsSame(!isSame);
                                  }}
                                  type="checkbox"
                                  id="inline-radio1"
                                  name="SMTP-auth"
                                  checked={isSame}
                                />
                                <label>{strings.ShippingAddressIsSameAsBillingAddress}</label>
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="row-wrapper">
                          <AddressComponent
                            values={watchedValues.shippingAddress || {}}
                            errors={errors.shippingAddress || {}}
                            touched={touchedFields.shippingAddress}
                            onChange={(field, value) => {
                              setValue(`shippingAddress.${field}`, value);
                              setIsSame(false);
                            }}
                            country_list={countryList}
                            addressType={strings.Shipping}
                            disabled={{
                              email: false,
                              city: false,
                              countryId: disableCountry,
                              address: false,
                              postZipCode: false,
                              stateId: false,
                              telephone: false,
                              fax: false,
                            }}
                          />
                        </Row>

                        <Row>
                          <Col lg={12} className="mt-5">
                            <FormGroup className="text-right">
                              <Button
                                type="button"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                                onClick={() => {
                                  trigger().then(isValid => {
                                    if (!isValid || Object.keys(errors).length !== 0) {
                                      commonActions.fillManDatoryDetails();
                                    }
                                  });
                                  setCreateMore(false);
                                  handleSubmit(onSubmit)();
                                }}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Creating...' : strings.Create}
                              </Button>
                              {!(isParentComponentPresent && isParentComponentPresent === true) && (
                                <Button
                                  name="button"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={disabled}
                                  onClick={() => {
                                    trigger().then(isValid => {
                                      if (!isValid || Object.keys(errors).length !== 0) {
                                        commonActions.fillManDatoryDetails();
                                      }
                                    });
                                    setCreateMore(true);
                                    setIsSame(false);
                                    handleSubmit(onSubmit)();
                                  }}
                                >
                                  <i className="fa fa-refresh"></i>{' '}
                                  {disabled ? 'Creating...' : strings.CreateandMore}
                                </Button>
                              )}
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  if (
                                    isParentComponentPresent &&
                                    isParentComponentPresent === true
                                  ) {
                                    confirmCancel(true);
                                  } else {
                                    history.push('/admin/master/contact');
                                  }
                                }}
                              >
                                <i className="fa fa-ban mr-1"></i> {strings.Cancel}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateContact);
