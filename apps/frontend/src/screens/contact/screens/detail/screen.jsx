import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
// Note: Using reactstrap Input for unmigrated form fields - will migrate to shadcn/ui Input later
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Select from 'react-select';
// Temporarily keep Reactstrap imports for unmigrated components
import { Row, Col, FormGroup, Label, UncontrolledTooltip, Input } from 'reactstrap';
import { selectOptionsFactory, InputValidation, DropdownLists, Lists, selectStyles } from 'utils';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { toast } from 'sonner';
import './style.scss';
import { AddressComponent } from 'screens/contact/sections';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as DetailContactActions from './actions';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Ban, CircleDot, HelpCircle, IdCard, Trash2 } from 'lucide-react';

const mapStateToProps = state => {
  const currencyList = state.common.currency_convert_list;
  return {
    country_list: state.contact.country_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    contact_type_list: state.contact.contact_type_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    contactActions: bindActionCreators(ContactActions, dispatch),
    detailContactActions: bindActionCreators(DetailContactActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

// Zod validation schema
const detailContactSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  middleName: z.string().optional(),
  currencyCode: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Currency is required'),
  contactType: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Contact type is required'),
  taxTreatmentId: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Tax Treatment is required'),
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

const DetailContact = ({
  contactActions,
  detailContactActions,
  commonActions,
  history,
  location,
  country_list,
  currency_list_dropdown,
  contact_type_list,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [dialog, setDialog] = useState(null);
  const [currentContactId, setCurrentContactId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [checkmobileNumberParam, setCheckmobileNumberParam] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [childRecordsPresent, setChildRecordsPresent] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [isSame, setIsSame] = useState(false);
  const [disableCountry, setDisableCountry] = useState(false);
  const [isRegisteredForVat, setIsRegisteredForVat] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  const [existingTrn, setExistingTrn] = useState('');
  const [trnExist, setTrnExist] = useState(false);
  const [emailExist, setEmailExist] = useState(false);

  const regEx = /^[0-9]+$/;
  const regExTelephone = /^[0-9-]+$/;
  const regExAlpha = /^[a-zA-Z ]+$/;
  const regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;

  const form = useForm({
    resolver: zodResolver(detailContactSchema),
    defaultValues: {
      contactType: '',
      currencyCode: '',
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      mobileNumber: '',
      organization: '',
      telephone: '',
      website: '',
      vatRegistrationNumber: '',
      taxTreatmentId: '',
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
      shippingAddress: {
        city: '',
        countryId: '',
        address: '',
        postZipCode: '',
        stateId: '',
        telephone: '',
        fax: '',
      },
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
    detailContactActions
      .getTaxTreatment()
      .then(res => {
        if (res.status === 200) {
          const array = res.data.filter(row => row.id !== 8);
          setTaxTreatmentList(array);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || err?.message || 'ERROR');
      });

    initializeData();
  }, []);

  const initializeData = () => {
    if (location.state && location.state.id) {
      contactActions.getContactTypeList();
      contactActions.getCountryList();
      detailContactActions
        .getContactById(location.state.id)
        .then(res => {
          const data = res.data;
          setCurrentContactId(location.state.id);
          setLoading(false);
          setIsActive(data ? data.isActive : false);
          setSelectedStatus(data ? data.isActive : false);
          setExistingEmail(data.email ?? '');
          setExistingTrn(data.vatRegistrationNumber ?? '');
          setIsRegisteredForVat(data.isRegisteredForVat ?? false);
          setIsSame(data.isBillingAndShippingAddressSame);

          const taxTreatmentId = data.taxTreatmentId ?? '';
          if (taxTreatmentId) {
            if (
              taxTreatmentId === 1 ||
              taxTreatmentId === 2 ||
              taxTreatmentId === 3 ||
              taxTreatmentId === 4
            ) {
              setDisableCountry(true);
            }
            if (taxTreatmentId === 1 || taxTreatmentId === 3 || taxTreatmentId === 5) {
              setIsRegisteredForVat(true);
            }
          }

          reset({
            billingAddress: {
              email: data.billingEmail ?? '',
              city: data.city ?? '',
              countryId: data.countryId ?? '',
              address: data.addressLine1 ?? '',
              postZipCode: data.postZipCode ?? '',
              stateId: data.stateId ?? '',
              telephone: data.billingTelephone ?? '',
              fax: data.fax ?? '',
            },
            shippingAddress: {
              city: data.shippingCity ?? '',
              countryId: data.shippingCountryId ?? '',
              address: data.addressLine2 ?? '',
              postZipCode: data.shippingPostZipCode || data.shippingPoBoxNumber,
              stateId: data.shippingStateId ?? '',
              telephone: data.shippingTelephone ?? '',
              fax: data.shippingFax ?? '',
            },
            contactType: data.contactType ?? '',
            currencyCode: data.currencyCode ?? '',
            email: data.email ?? '',
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            middleName: data.middleName ?? '',
            website: data.website ?? '',
            mobileNumber: data.mobileNumber ?? '',
            organization: data.organization ?? '',
            telephone: data.telephone ?? '',
            vatRegistrationNumber: data.vatRegistrationNumber ?? '',
            taxTreatmentId: taxTreatmentId,
          });

          checkChildActivitiesForContactId(location.state.id);
        })
        .catch(err => {
          setLoading(false);
          commonActions.tostifyAlert('error', err);
        });
    } else {
      history.push('/admin/master/contact');
    }
  };

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else if (data[`${item}`] && data[`${item}`].value !== undefined) {
        temp[`${item}`] = data[`${item}`].value;
      } else {
        temp[`${item}`] = data[`${item}`];
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
    if (isRegisteredForVat === true) {
      if (data.vatRegistrationNumber === '') {
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Tax Registration Number is Required',
        });
        return;
      }
      if (data.vatRegistrationNumber.length !== 15) {
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Please enter 15 digit Tax Registration Number',
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
      setError('email', { type: 'manual', message: 'Email Already Exists' });
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

    setDisabled(true);
    let postData = getData(data);
    postData = { ...postData, ...{ contactId: currentContactId } };
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Contact...');

    detailContactActions
      .updateContact(postData)
      .then(res => {
        if (res.status === 200) {
          // Success - action completed
          setDisabled(false);
          reset();
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Contact Updated Successfully'
          );
          history.push('/admin/master/contact');
          setLoading(false);
        }
      })
      .catch(err => {
        // Error handled by error boundary or user notification
        setDisabled(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Contact Updated Unsuccessfully'
        );
        setLoading(false);
      });
  };

  const checkChildActivitiesForContactId = id => {
    contactActions.getInvoicesCountContact(id).then(res => {
      if (res.data > 0) {
        setChildRecordsPresent(true);
      } else {
        setChildRecordsPresent(false);
      }
    });
  };

  const deleteContact = () => {
    contactActions.getInvoicesCountContact(currentContactId).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert('error', 'You need to delete invoices to delete the contact');
      } else {
        const message1 = (
          <text>
            <b>Delete Contact?</b>
          </text>
        );
        const message = 'This Contact will be deleted permanently and cannot be recovered. ';
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeContact}
            cancelHandler={removeDialog}
            message1={message1}
            message={message}
          />
        );
      }
    });
  };

  const removeContact = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Contact...');
    detailContactActions
      .deleteContact(currentContactId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Contact Deleted Successfully'
          );
          history.push('/admin/master/contact');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Contact Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
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
    } else {
      list = country_list;
    }
    setIsSame(false);
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

  // Neumorphic theme constants
  const theme = {
    bg: '#e8eef5',
    shadowDark: '#c4c9cf',
    shadowLight: '#ffffff',
  };

  const shadows = {
    raised: {
      lg: `6px 6px 12px ${theme.shadowDark}, -6px -6px 12px ${theme.shadowLight}`,
    },
    pressed: {
      sm: `inset 2px 2px 4px ${theme.shadowDark}, inset -2px -2px 4px ${theme.shadowLight}`,
    },
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div
      className="detail-contact-screen"
      style={{ background: theme.bg, minHeight: '100vh', padding: '24px' }}
    >
      <div className="animated fadeIn max-w-7xl mx-auto">
        {dialog}
        <Card
          className="rounded-2xl overflow-hidden"
          style={{
            background: theme.bg,
            boxShadow: shadows.raised.lg,
          }}
        >
          <CardHeader className="border-b" style={{ borderColor: `${theme.shadowDark}40` }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IdCard className="h-5 w-5" style={{ color: '#1e6eff' }} />
                <span>{strings.UpdateContact}</span>
              </CardTitle>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteContact}
                className="rounded-xl"
                style={{
                  boxShadow: shadows.raised.sm,
                }}
              >
                <Trash2 className="h-4 w-4" />
                {strings.Delete}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Status Radio Group */}
                <div className="mb-6">
                  <FormLabel className="text-base font-semibold mb-3 block">
                    <span className="text-red-500">* </span>
                    {strings.Status}
                  </FormLabel>
                  <RadioGroup
                    value={selectedStatus ? 'true' : 'false'}
                    onValueChange={value => {
                      const boolValue = value === 'true';
                      setSelectedStatus(boolValue);
                      setIsActive(boolValue);
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="inline-radio1" />
                      <label
                        htmlFor="inline-radio1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {strings.Active}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="inline-radio2" />
                      <label
                        htmlFor="inline-radio2"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {strings.Inactive}
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Contact Name Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">{strings.ContactName}</h4>
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
                              id="firstName"
                              maxLength="100"
                              placeholder={strings.Enter + strings.FirstName}
                              {...field}
                              onChange={e => {
                                const value = e.target.value;
                                if (value === '' || regExAlpha.test(value)) {
                                  field.onChange(e);
                                }
                              }}
                              className={
                                errors.firstName && touchedFields.firstName ? 'is-invalid' : ''
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
                              id="middleName"
                              maxLength="100"
                              placeholder={strings.Enter + strings.MiddleName}
                              {...field}
                              onChange={e => {
                                const value = e.target.value;
                                if (value === '' || regExAlpha.test(value)) {
                                  field.onChange(e);
                                }
                              }}
                              className={
                                errors.middleName && touchedFields.middleName ? 'is-invalid' : ''
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
                              id="lastName"
                              maxLength="100"
                              placeholder={strings.Enter + strings.LastName}
                              {...field}
                              onChange={e => {
                                const value = e.target.value;
                                if (value === '' || regExAlpha.test(value)) {
                                  field.onChange(e);
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
                </div>
                <hr />
                <h4 className="mb-4">{strings.ContactDetails}</h4>
                <Row>
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="contactType">
                        <span className="text-danger">* </span>
                        {strings.ContactType}
                        <HelpCircle id="Contacttyprtip" className="h-4 w-4 inline" />
                        <UncontrolledTooltip placement="right" target="Contacttyprtip">
                          The contact type cannot be changed once a document has been created for
                          this contact.
                        </UncontrolledTooltip>
                      </Label>
                      <Controller
                        name="contactType"
                        control={control}
                        render={({ field }) => (
                          <Select
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
                            value={
                              contact_type_list &&
                              contact_type_list.find(option => option.value === +field.value)
                            }
                            onChange={option => {
                              if (option && option.value) {
                                field.onChange(option.value);
                              } else {
                                field.onChange('');
                              }
                            }}
                            isDisabled={childRecordsPresent}
                            placeholder={strings.Select + strings.ContactType}
                            id="contactType"
                            styles={selectStyles}
                            className={
                              errors.contactType && touchedFields.contactType ? 'is-invalid' : ''
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
                            id="organization"
                            maxLength="100"
                            placeholder={strings.Enter + strings.OrganizationName}
                            {...field}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || regExAddress.test(value)) {
                                field.onChange(e);
                              }
                            }}
                            className={
                              errors.organization && touchedFields.organization ? 'is-invalid' : ''
                            }
                          />
                        )}
                      />
                      {errors.organization && touchedFields.organization && (
                        <div className="invalid-feedback">{errors.organization.message}</div>
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
                            id="email"
                            placeholder={strings.Enter + strings.EmailAddres}
                            {...field}
                            onChange={e => {
                              field.onChange(e);
                            }}
                            className={errors.email && touchedFields.email ? 'is-invalid' : ''}
                          />
                        )}
                      />
                      {errors.email && touchedFields.email && (
                        <div className="invalid-feedback">{errors.email.message}</div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label htmlFor="currencyCode">
                        <span className="text-danger">* </span>
                        {strings.CurrencyCode}
                        <HelpCircle id="Currencytip" className="h-4 w-4 inline" />
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
                            options={currency_list_dropdown}
                            value={currency_list_dropdown.find(
                              option => option.value === +field.value
                            )}
                            onChange={option => {
                              if (option && option.value) {
                                field.onChange(option);
                              } else {
                                field.onChange('');
                              }
                            }}
                            isDisabled={childRecordsPresent}
                            placeholder={strings.Select + strings.Currency}
                            id="currencyCode"
                            styles={selectStyles}
                            className={
                              errors.currencyCode && touchedFields.currencyCode ? 'is-invalid' : ''
                            }
                          />
                        )}
                      />
                      {errors.currencyCode && touchedFields.currencyCode && (
                        <div className="invalid-feedback">{errors.currencyCode.message}</div>
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
                            placeholder={strings.Enter + strings.TelephoneNumber}
                            {...field}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || regEx.test(value)) {
                                field.onChange(e);
                              }
                            }}
                            className={
                              errors.telephone && touchedFields.telephone ? 'is-invalid' : ''
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
                              id="mobileNumber"
                              country={'ae'}
                              enableSearch={true}
                              value={field.value}
                              placeholder={strings.Enter + strings.MobileNumber}
                              onChange={value => {
                                field.onChange(value);
                              }}
                            />
                          </div>
                        )}
                      />
                      {errors.mobileNumber && touchedFields.mobileNumber && (
                        <div style={{ color: 'red' }}>{errors.mobileNumber.message}</div>
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
                            placeholder={strings.Enter + strings.Website}
                            {...field}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || regExAddress.test(value)) {
                                field.onChange(e);
                              }
                            }}
                            className={errors.website && touchedFields.website ? 'is-invalid' : ''}
                          />
                        )}
                      />
                    </FormGroup>
                  </Col>

                  <Col lg={4}>
                    <FormGroup className="mb-3 hideTRN">
                      <Label htmlFor="taxTreatmentId">
                        <span className="text-danger">* </span>
                        {strings.TaxTreatment}
                        <HelpCircle id="TaxTreatmenttip" className="h-4 w-4 inline" />
                        <UncontrolledTooltip placement="right" target="TaxTreatmenttip">
                          Once any document has been created for this contact, you cannot change the
                          Tax treatment.
                        </UncontrolledTooltip>
                      </Label>
                      <Controller
                        name="taxTreatmentId"
                        control={control}
                        render={({ field }) => (
                          <Select
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
                            isDisabled={field.value === 1 || field.value === 3 || field.value === 5}
                            id="taxTreatmentId"
                            placeholder={strings.Select + strings.TaxTreatment}
                            value={
                              taxTreatmentList &&
                              selectOptionsFactory
                                .renderOptions('name', 'id', taxTreatmentList, 'TaxTreatment')
                                .find(option => option.value === +field.value)
                            }
                            onChange={option => {
                              setValue('shippingAddress.countryId', '');
                              setValue('billingAddress.countryId', '');
                              setValue('shippingAddress.stateId', '');
                              setValue('billingAddress.stateId', '');
                              if (option && option.value) {
                                resetCountryList(option.value);
                                field.onChange(option.value);
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
                                  setValue('shippingAddress.countryId', 229);
                                  setValue('billingAddress.countryId', 229);
                                } else {
                                  setDisableCountry(false);
                                }
                              } else {
                                field.onChange('');
                                setDisableCountry(false);
                              }
                              setValue('vatRegistrationNumber', '');
                            }}
                            styles={selectStyles}
                            className={
                              errors.taxTreatmentId && touchedFields.taxTreatmentId
                                ? 'is-invalid'
                                : ''
                            }
                          />
                        )}
                      />
                      {errors.taxTreatmentId && touchedFields.taxTreatmentId && (
                        <div className="invalid-feedback">{errors.taxTreatmentId.message}</div>
                      )}
                    </FormGroup>
                  </Col>

                  {watchedValues.taxTreatmentId && (
                    <Col
                      md="4"
                      style={{
                        display:
                          watchedValues.taxTreatmentId === 1 ||
                          watchedValues.taxTreatmentId === 3 ||
                          watchedValues.taxTreatmentId === 5
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
                              maxLength="15"
                              id="vatRegistrationNumber"
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
                                errors.vatRegistrationNumber && touchedFields.vatRegistrationNumber
                                  ? 'is-invalid'
                                  : ''
                              }
                            />
                          )}
                        />
                        {errors.vatRegistrationNumber && touchedFields.vatRegistrationNumber && (
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
                    touched={touchedFields.billingAddress}
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
                          type="checkbox"
                          id="inline-radio1"
                          name="SMTP-auth"
                          checked={isSame}
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
                  <Col
                    lg={12}
                    className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                  >
                    <FormGroup>
                      <Button
                        type="button"
                        name="button"
                        color="danger"
                        className="btn-square"
                        disabled={disabled1}
                        onClick={deleteContact}
                      >
                        <Trash2 className="h-4 w-4" /> {disabled1 ? 'Deleting...' : strings.Delete}
                      </Button>
                    </FormGroup>
                    <FormGroup className="text-right">
                      <Button
                        type="submit"
                        name="submit"
                        color="primary"
                        className="btn-square mr-3"
                        disabled={disabled}
                        onClick={() => {
                          trigger().then(isValid => {
                            if (!isValid || Object.keys(errors).length !== 0) {
                              commonActions.fillManDatoryDetails();
                            }
                          });
                        }}
                      >
                        <CircleDot className="h-4 w-4" />{' '}
                        {disabled ? 'Updating...' : strings.Update}
                      </Button>
                      <Button
                        type="button"
                        name="button"
                        color="secondary"
                        className="btn-square"
                        onClick={() => {
                          history.push('/admin/master/contact');
                        }}
                      >
                        <Ban className="h-4 w-4" /> {disabled1 ? 'Deleting...' : strings.Cancel}
                      </Button>
                    </FormGroup>
                  </Col>
                </Row>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailContact);
