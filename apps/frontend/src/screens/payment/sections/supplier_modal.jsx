import { useState, useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

// Zod validation schema
const supplierSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().min(1, 'Middle name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  telephone: z.string().min(1, 'Telephone number is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  countryId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Country is required'),
  stateId: z
    .union([
      z.object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
      }),
      z.string(),
    ])
    .refine(val => {
      // stateId is required when countryId is present
      return val !== null && val !== '';
    }, 'State is required'),
  postZipCode: z.string().min(1, 'Postal code is required'),
  vatRegistrationNumber: z.string().min(1, 'Tax registration number is required'),
  organization: z.string().optional(),
  poBoxNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),
  city: z.string().optional(),
  contractPoNumber: z.string().optional(),
  currencyCode: z.any().optional(),
  billingEmail: z.string().optional(),
});

const SupplierModal = ({
  openSupplierModal,
  closeSupplierModal,
  createSupplier,
  getCurrentUser,
  getStateList,
  currency_list,
  country_list,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [stateList, setStateList] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const regExAlpha = /^[a-zA-Z]+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regEx = /^[0-9]+$/;

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      contactType: 1,
      mobileNumber: '',
      organization: '',
      poBoxNumber: '',
      postZipCode: '',
      stateId: '',
      telephone: '',
      vatRegistrationNumber: '',
      billingEmail: '',
      city: '',
      contractPoNumber: '',
      countryId: null,
      currencyCode: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const watchCountryId = watch('countryId');

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (watchCountryId && watchCountryId.value) {
      handleCountryChange(watchCountryId.value);
    } else {
      setStateList([]);
    }
  }, [watchCountryId]);

  const handleCountryChange = countryCode => {
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

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else if (data[`${item}`] && data[`${item}`].value !== undefined) {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = data => {
    setDisabled(true);
    const postData = getData(data);
    createSupplier(postData)
      .then(res => {
        if (res.status === 200) {
          reset();
          closeSupplierModal(true);
          getCurrentUser(res.data);
          setDisabled(false);
        }
      })
      .catch(err => {
        displayMsg();
        setDisabled(false);
      });
  };

  const displayMsg = () => {
    toast.error('Something Went Wrong... ', {
      position: 'top-right',
    });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openSupplierModal} className="modal-success contact-modal">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader toggle={() => closeSupplierModal(false)}>{strings.NewSupplier}</ModalHeader>
          <ModalBody>
            <Row>
              <Col lg="4">
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
                        id="firstName"
                        placeholder={strings.Enter + strings.FirstName}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.firstName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg="4">
                <FormGroup>
                  <Label htmlFor="middleName">
                    <span className="text-danger">* </span>
                    {strings.MiddleName}
                  </Label>
                  <Controller
                    name="middleName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="middleName"
                        placeholder={strings.Enter + strings.MiddleName}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.middleName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.middleName && (
                    <div className="invalid-feedback">{errors.middleName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg="4">
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
                        id="lastName"
                        placeholder={strings.Enter + strings.LastName}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
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
            <h4 className="mb-3 mt-3">{strings.ContactDetails}</h4>
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="organization">{strings.OrganizationName}</Label>
                  <Controller
                    name="organization"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="organization"
                        placeholder={strings.Enter + strings.OrganizationName}
                        {...field}
                        className={errors.organization ? 'is-invalid' : ''}
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
                  <Label htmlFor="poBoxNumber">{strings.POBoxNumber}</Label>
                  <Controller
                    name="poBoxNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="poBoxNumber"
                        placeholder={strings.Enter + strings.POBoxNumber}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.poBoxNumber ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.poBoxNumber && (
                    <div className="invalid-feedback">{errors.poBoxNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row className="row-wrapper">
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
                        id="email"
                        placeholder={strings.Enter + strings.Email}
                        {...field}
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
                    <span className="text-danger">* </span>
                    {strings.Telephone}
                  </Label>
                  <Controller
                    name="telephone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        maxLength="15"
                        type="text"
                        id="telephone"
                        placeholder={strings.Enter + strings.TelephoneNumber}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regEx.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.telephone ? 'is-invalid' : ''}
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
                        onChange={value => field.onChange(value)}
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
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="addressLine1">{strings.AddressLine1}</Label>
                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="addressLine1"
                        placeholder={strings.Enter + strings.AddressLine1}
                        {...field}
                        className={errors.addressLine1 ? 'is-invalid' : ''}
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
                  <Label htmlFor="addressLine2">{strings.AddressLine2}</Label>
                  <Controller
                    name="addressLine2"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="addressLine2"
                        placeholder={strings.Enter + strings.AddressLine2}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="addressLine3">{strings.AddressLine3}</Label>
                  <Controller
                    name="addressLine3"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="addressLine3"
                        placeholder={strings.Enter + strings.AddressLine3}
                        {...field}
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
                    <span className="text-danger">* </span>
                    {strings.Country}
                  </Label>
                  <Controller
                    name="countryId"
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
                        placeholder={strings.Select + strings.Country}
                        id="countryId"
                        styles={selectStyles}
                        onChange={option => {
                          field.onChange(option);
                          setValue('stateId', '');
                        }}
                        className={errors.countryId ? 'is-invalid' : ''}
                        isClearable
                      />
                    )}
                  />
                  {errors.countryId && (
                    <div className="invalid-feedback d-block">{errors.countryId.message}</div>
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
                          stateList && field.value
                            ? selectOptionsFactory
                                .renderOptions('label', 'value', stateList, 'State')
                                .find(opt => opt.value === field.value)
                            : null
                        }
                        onChange={option => {
                          if (option && option.value) {
                            field.onChange(option);
                          } else {
                            field.onChange('');
                          }
                        }}
                        placeholder={strings.Select + strings.StateRegion}
                        id="stateId"
                        styles={selectStyles}
                        className={errors.stateId ? 'is-invalid' : ''}
                        isClearable
                      />
                    )}
                  />
                  {errors.stateId && (
                    <div className="invalid-feedback d-block">{errors.stateId.message}</div>
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
                        id="city"
                        placeholder={strings.Location}
                        {...field}
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
                    <span className="text-danger">* </span>
                    {strings.PostZipCode}
                  </Label>
                  <Controller
                    name="postZipCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="postZipCode"
                        placeholder={strings.Enter + strings.PostZipCode}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.postZipCode ? 'is-invalid' : ''}
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
                        id="billingEmail"
                        placeholder={strings.Enter + strings.BillingEmail}
                        {...field}
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
                  <Label htmlFor="contractPoNumber">{strings.ContractPONumber}</Label>
                  <Controller
                    name="contractPoNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="contractPoNumber"
                        placeholder={strings.Enter + strings.ContractPONumber}
                        {...field}
                        className={errors.contractPoNumber ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.contractPoNumber && (
                    <div className="invalid-feedback">{errors.contractPoNumber.message}</div>
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
                        id="vatRegistrationNumber"
                        placeholder={strings.Enter + strings.TaxRegistrationNumber}
                        {...field}
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
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
                  <Label htmlFor="currencyCode">{strings.CurrencyCode}</Label>
                  <Controller
                    name="currencyCode"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
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
                        placeholder={strings.Select + strings.Currency}
                        id="currencyCode"
                        styles={selectStyles}
                        className={errors.currencyCode ? 'is-invalid' : ''}
                        isClearable
                      />
                    )}
                  />
                  {errors.currencyCode && (
                    <div className="invalid-feedback d-block">{errors.currencyCode.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="success" type="submit" className="btn-square" disabled={disabled}>
              {strings.Save}
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeSupplierModal(false);
              }}
            >
              {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierModal;
