import { useState } from 'react';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  CardHeader,
  ModalBody,
  ModalFooter,
} from 'components/migration';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Ban, ChevronUp, CircleDot, IdCard } from '@/components/icons';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

// Zod Schema
const supplierSchema = z.object({
  contactType: z.number().default(1),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  organizationName: z.string().optional(),
  vatRegistrationNumber: z.string().min(1, 'Tax registration number is required'),
  currencyCode: z.string().min(1, 'Please Select Currency'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().min(1, 'Address line 2 is required'),
  addressLine3: z.string().min(1, 'Address line 3 is required'),
  countryId: z.string().min(1, 'Country is required'),
  stateId: z.string().min(1, 'State Region is required'),
  city: z.string().optional(),
  poBoxNumber: z.string().optional(),
  telephone: z.string().optional(),
  postZipCode: z.string().optional(),
  billingEmail: z.string().optional(),
  contractPoNumber: z.string().optional(),
  disabled: z.boolean().default(false),
});

const SupplierModal = ({
  openSupplierModal,
  closeSupplierModal,
  currency_list,
  country_list,
  createSupplier,
  getStateList,
  getCurrentUser,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [mobileNumberError, setMobileNumberError] = useState('');

  const regEx = /^[0-9]+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regExAlpha = /^[a-zA-Z ]+$/;
  const regExAddress = /^[a-zA-Z0-9\s,'-]+$/;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      contactType: 1,
      billingEmail: '',
      city: '',
      contractPoNumber: '',
      countryId: '',
      currencyCode: '',
      email: '',
      firstName: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      lastName: '',
      middleName: '',
      mobileNumber: '',
      organizationName: '',
      poBoxNumber: '',
      postZipCode: '',
      stateId: '',
      telephone: '',
      vatRegistrationNumber: '',
      disabled: false,
    },
  });

  strings.setLanguage(language);

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = data => {
    if (mobileNumberError) {
      return;
    }

    setIsSubmitting(true);
    const postData = getData(data);

    createSupplier(postData)
      .then(res => {
        let resConfig = JSON.parse(res.config.data);

        if (res.status === 200) {
          setIsSubmitting(false);
          reset();
          closeSupplierModal(true);

          let tmpData = res.data;
          tmpData.currencyCode = resConfig.currencyCode;

          getCurrentUser(tmpData);
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        displayMsg(err);
      });
  };

  const displayMsg = err => {
    toast.error(`${err.data.message}`, {
      position: 'top-right',
    });
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

  const handleMobileNumberChange = (value, onChange) => {
    onChange(value);
    if (value.length !== 12) {
      setMobileNumberError('Invalid mobile number');
    } else {
      setMobileNumberError('');
    }
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openSupplierModal} className="modal-success contact-modal">
        <Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <IdCard className="h-4 w-4" />
                  <span className="ml-2">{strings.CreateSupplier}</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <h4 className="mb-3 mt-3">{strings.ContactDetails}</h4>
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
                        maxLength="26"
                        id="firstName"
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.firstName ? 'is-invalid' : ''}
                        placeholder={strings.Enter + strings.FirstName}
                      />
                    )}
                  />
                  {errors.firstName && (
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
                        maxLength="26"
                        id="middleName"
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.middleName ? 'is-invalid' : ''}
                        placeholder={strings.Enter + strings.MiddleName}
                      />
                    )}
                  />
                  {errors.middleName && (
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
                        maxLength="26"
                        id="lastName"
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.lastName ? 'is-invalid' : ''}
                        placeholder={strings.Enter + strings.LastName}
                      />
                    )}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
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
                        {...field}
                        className={errors.email ? 'is-invalid' : ''}
                        placeholder={strings.Enter + strings.Email}
                      />
                    )}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="mobileNumber">
                    <span className="text-danger">* </span>
                    {strings.MobileNumber}
                  </Label>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        country={'ae'}
                        enableSearch={true}
                        international
                        value={field.value}
                        onChange={value => handleMobileNumberChange(value, field.onChange)}
                        containerClass={
                          errors.mobileNumber || mobileNumberError ? 'is-invalid' : ''
                        }
                      />
                    )}
                  />
                  {(errors.mobileNumber || mobileNumberError) && (
                    <div style={{ color: 'red' }}>
                      {errors.mobileNumber?.message || mobileNumberError}
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="organizationName">{strings.OrganizationName}</Label>
                  <Controller
                    name="organizationName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        maxLength="26"
                        id="organizationName"
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.organizationName ? 'is-invalid' : ''}
                        placeholder={strings.Enter + strings.OrganizationName}
                      />
                    )}
                  />
                  {errors.organizationName && (
                    <div className="invalid-feedback">{errors.organizationName.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row className="row-wrapper">
              <Col md="4">
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
                        maxLength="15"
                        id="vatRegistrationNumber"
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regEx.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
                        placeholder={strings.Enter + strings.TaxRegistrationNumber}
                      />
                    )}
                  />
                  {errors.vatRegistrationNumber && (
                    <div className="invalid-feedback">{errors.vatRegistrationNumber.message}</div>
                  )}
                  <div className="VerifyTRN">
                    <br />
                    <b>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://tax.gov.ae/en/default.aspx"
                        style={{ color: '#2266d8' }}
                        rel="noreferrer"
                      >
                        {strings.VerifyTRN}
                      </a>
                    </b>
                  </div>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="currencyCode">
                    <span className="text-danger">* </span>
                    {strings.Currency}
                  </Label>
                  <Controller
                    name="currencyCode"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={
                          currency_list
                            ? selectCurrencyFactory.renderOptions(
                                'currencyName',
                                'currencyCode',
                                currency_list,
                                'Currency'
                              )
                            : []
                        }
                        value={
                          currency_list &&
                          selectCurrencyFactory
                            .renderOptions(
                              'currencyName',
                              'currencyCode',
                              currency_list,
                              'Currency'
                            )
                            .find(option => option.value === +field.value)
                        }
                        onChange={option => {
                          field.onChange(option?.value || '');
                        }}
                        placeholder={strings.Select + strings.Currency}
                        id="currencyCode"
                        className={errors.currencyCode ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.currencyCode && (
                    <div className="invalid-feedback">{errors.currencyCode.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Button
                className="mb-3 ml-2"
                onClick={() => setShowDetails(true)}
                disabled={showDetails}
              >
                {strings.MoreDetails}
              </Button>
            </Row>
            {showDetails && (
              <div id="moreDetails">
                <Row className="row-wrapper">
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="poBoxNumber">{strings.POBoxNumber}</Label>
                      <Controller
                        name="poBoxNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="10"
                            id="poBoxNumber"
                            {...field}
                            className={errors.poBoxNumber ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.POBoxNumber}
                          />
                        )}
                      />
                      {errors.poBoxNumber && (
                        <div className="invalid-feedback">{errors.poBoxNumber.message}</div>
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
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || regEx.test(e.target.value)) {
                                field.onChange(e);
                              }
                            }}
                            className={errors.telephone ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.TelephoneNumber}
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
                      <Label htmlFor="postZipCode">{strings.PostZipCode}</Label>
                      <Controller
                        name="postZipCode"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="10"
                            id="postZipCode"
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                field.onChange(e);
                              }
                            }}
                            className={errors.postZipCode ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.PostZipCode}
                          />
                        )}
                      />
                      {errors.postZipCode && (
                        <div className="invalid-feedback">{errors.postZipCode.message}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="row-wrapper">
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="addressLine1">
                        <span className="text-danger">* </span>
                        {strings.AddressLine1}
                      </Label>
                      <Controller
                        name="addressLine1"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="100"
                            id="addressLine1"
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || regExAddress.test(e.target.value)) {
                                field.onChange(e);
                              }
                            }}
                            className={errors.addressLine1 ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.AddressLine1}
                          />
                        )}
                      />
                      {errors.addressLine1 && (
                        <div className="invalid-feedback">{errors.addressLine1.message}</div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="addressLine2">
                        <span className="text-danger">* </span>
                        {strings.AddressLine2}
                      </Label>
                      <Controller
                        name="addressLine2"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="100"
                            id="addressLine2"
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || regExAddress.test(e.target.value)) {
                                field.onChange(e);
                              }
                            }}
                            className={errors.addressLine2 ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.AddressLine2}
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
                      <Label htmlFor="addressLine3">
                        <span className="text-danger">* </span>
                        {strings.AddressLine3}
                      </Label>
                      <Controller
                        name="addressLine3"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="100"
                            id="addressLine3"
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || regExAddress.test(e.target.value)) {
                                field.onChange(e);
                              }
                            }}
                            className={errors.addressLine3 ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.AddressLine3}
                          />
                        )}
                      />
                      {errors.addressLine3 && (
                        <div className="invalid-feedback">{errors.addressLine3.message}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="row-wrapper">
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="countryId">
                        <span className="text-danger">* </span>
                        {strings.Country}
                      </Label>
                      <Controller
                        name="countryId"
                        control={control}
                        render={({ field }) => (
                          <Select
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
                            value={
                              country_list &&
                              selectOptionsFactory
                                .renderOptions(
                                  'countryName',
                                  'countryCode',
                                  country_list,
                                  'Country'
                                )
                                .find(option => option.value === field.value)
                            }
                            onChange={option => {
                              if (option?.value) {
                                field.onChange(option.value);
                                handleGetStateList(option.value);
                              } else {
                                field.onChange('');
                                handleGetStateList('');
                              }
                              setValue('stateId', '');
                            }}
                            placeholder={strings.Select + strings.Country}
                            id="countryId"
                            className={errors.countryId ? 'is-invalid' : ''}
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
                      <Label htmlFor="stateId">
                        <span className="text-danger">* </span>
                        {strings.StateRegion}
                      </Label>
                      <Controller
                        name="stateId"
                        control={control}
                        render={({ field }) => (
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
                            value={
                              stateList &&
                              selectOptionsFactory
                                .renderOptions('label', 'value', stateList, 'State')
                                .find(option => option.value === field.value)
                            }
                            onChange={option => {
                              field.onChange(option?.value || '');
                            }}
                            placeholder={strings.Select + strings.StateRegion}
                            id="stateId"
                            className={errors.stateId ? 'is-invalid' : ''}
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
                      <Label htmlFor="city">{strings.City}</Label>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="20"
                            id="city"
                            {...field}
                            placeholder={strings.Location}
                            className={errors.city ? 'is-invalid' : ''}
                          />
                        )}
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                    </FormGroup>
                  </Col>
                </Row>
                <hr />
                <h4 className="mb-3 mt-3">{strings.InvoicingDetails}</h4>
                <Row className="row-wrapper">
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="billingEmail">{strings.BillingEmail}</Label>
                      <Controller
                        name="billingEmail"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="80"
                            id="billingEmail"
                            {...field}
                            className={errors.billingEmail ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.BillingEmail}
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
                      <Label htmlFor="contractPoNumber">{strings.ContractPONumber}</Label>
                      <Controller
                        name="contractPoNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            maxLength="10"
                            id="contractPoNumber"
                            {...field}
                            className={errors.contractPoNumber ? 'is-invalid' : ''}
                            placeholder={strings.Enter + strings.ContractPONumber}
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
                  <ShadcnButton variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                    <ChevronUp className="h-4 w-4" />
                  </ShadcnButton>
                </Row>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" className="btn-square" disabled={isSubmitting}>
              <CircleDot className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : strings.Create}
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => closeSupplierModal(false)}
            >
              <Ban className="h-4 w-4" />
              {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierModal;
