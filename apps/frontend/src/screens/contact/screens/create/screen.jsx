import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LeavePage, Loader } from 'components';
import { upperFirst } from 'lodash-es';
import { selectOptionsFactory, InputValidation, DropdownLists, Lists } from 'utils';
import './style.scss';
import { data } from '../../../Language/index';
import { AddressComponent } from 'screens/contact/sections';
import LocalizedStrings from 'react-localization';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as CreateContactActions from './actions';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Ban, CircleDot, HelpCircle, IdCard, RefreshCw } from 'lucide-react';

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
const createContactSchema = z
  .object({
    firstName: z.string().min(1, 'First Name is required'),
    lastName: z.string().min(1, 'Last Name is required'),
    middleName: z.string().optional(),
    currencyCode: z.string().min(1, 'Currency is required'),
    contactType: z.string().min(1, 'Contact type is required'),
    taxTreatmentId: z.string().min(1, 'Tax Treatment is required'),
    email: z.string().min(1, 'Email is required').email('Invalid Email'),
    organization: z.string().optional(),
    telephone: z.string().optional(),
    mobileNumber: z.string().optional(),
    website: z.string().optional(),
    vatRegistrationNumber: z.string().optional(),
    isBillingAndShippingAddressSame: z.boolean().default(false),
    billingAddress: z.object({
      email: z.string().optional(),
      city: z.string().optional(),
      countryId: z
        .union([z.string(), z.number()])
        .refine(val => val !== '' && val !== null && val !== undefined, {
          message: 'Country is required',
        }),
      address: z.string().min(1, 'Address is required'),
      postZipCode: z.string().min(1, 'PO Box / Zip Code is required'),
      stateId: z
        .union([z.string(), z.number()])
        .refine(val => val !== '' && val !== null && val !== undefined, {
          message: 'State/Emirate is required',
        }),
      telephone: z.string().optional(),
      fax: z.string().optional(),
    }),
    shippingAddress: z.object({
      city: z.string().optional(),
      countryId: z.union([z.string(), z.number()]).optional().nullable(),
      address: z.string().optional(),
      postZipCode: z.string().optional(),
      stateId: z.union([z.string(), z.number()]).optional().nullable(),
      telephone: z.string().optional(),
      fax: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    // Only validate shipping address if it's NOT same as billing
    if (!data.isBillingAndShippingAddressSame) {
      if (!data.shippingAddress.address || data.shippingAddress.address.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Address is required',
          path: ['shippingAddress', 'address'],
        });
      }
      if (!data.shippingAddress.countryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Country is required',
          path: ['shippingAddress', 'countryId'],
        });
      }
      if (!data.shippingAddress.stateId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'State/Emirate is required',
          path: ['shippingAddress', 'stateId'],
        });
      }
      if (!data.shippingAddress.postZipCode || data.shippingAddress.postZipCode.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PO Box / Zip Code is required',
          path: ['shippingAddress', 'postZipCode'],
        });
      }
    }
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
      isBillingAndShippingAddressSame: false,
      contactType: contactType ? String(contactType.value || contactType) : '',
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
        commonActions.tostifyAlert('error', err?.data?.message || err?.message || 'ERROR');
      });
  }, []);

  // Initialize countryList when Redux country_list is populated
  useEffect(() => {
    if (country_list && country_list.length > 0 && countryList.length === 0) {
      const list = selectOptionsFactory.renderOptions(
        'countryName',
        'countryCode',
        country_list,
        'Country'
      );
      setCountryList(list);
    }
  }, [country_list]);

  const initializeData = () => {
    commonActions.getCurrencyConversionList();
    contactActions.getContactTypeList();
    contactActions.getCountryList();
    if (companyDetails) {
      const { currencyCode, isRegisteredVat } = companyDetails;
      if (currencyCode) {
        setValue('currencyCode', String(currencyCode));
      }
      setIsRegisteredVat(isRegisteredVat);
    }
  };

  const getData = data => {
    console.log('🔧 [getData] Starting data transformation');
    console.log('🔧 [getData] Input data:', JSON.stringify(data, null, 2));

    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        // Convert string values to numbers for contactType, currencyCode, and taxTreatmentId
        if (item === 'contactType' || item === 'currencyCode' || item === 'taxTreatmentId') {
          const converted = parseInt(data[`${item}`], 10);
          console.log(`🔧 [getData] Converting ${item}: "${data[item]}" → ${converted}`);
          temp[`${item}`] = converted;
        } else {
          temp[`${item}`] = data[`${item}`];
        }
      } else if (data[`${item}`] && data[`${item}`].value !== undefined) {
        temp[`${item}`] = data[`${item}`].value;
      }
    }

    console.log('🔧 [getData] Checking billing address:', data.billingAddress);
    console.log('🔧 [getData] Checking shipping address:', data.shippingAddress);

    if (!data.billingAddress) {
      console.error('❌ [getData] billingAddress is missing!');
      throw new Error('Billing address is required');
    }
    if (!data.shippingAddress) {
      console.error('❌ [getData] shippingAddress is missing!');
      throw new Error('Shipping address is required');
    }

    const billingcountryId = data[`billingAddress`].countryId;
    const shippingCountryId = data[`shippingAddress`].countryId;
    console.log('🔧 [getData] Billing country ID:', billingcountryId);
    console.log('🔧 [getData] Shipping country ID:', shippingCountryId);

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
    console.log(
      '🔧 [getData] Transformation complete. Final output:',
      JSON.stringify(temp, null, 2)
    );
    return temp;
  };

  const onSubmit = data => {
    console.log('🚀 [CONTACT_CREATE] onSubmit called');
    console.log('📋 [CONTACT_CREATE] Form data:', JSON.stringify(data, null, 2));

    // Custom validation
    console.log('✅ [CONTACT_CREATE] Check 1: Mobile number validation');
    if (!(isParentComponentPresent && isParentComponentPresent === true)) {
      if (checkmobileNumberParam === true) {
        console.error('❌ [CONTACT_CREATE] Mobile number validation failed');
        setError('mobileNumber', { type: 'manual', message: 'Invalid mobile number' });
        return;
      }
    }
    console.log('✅ [CONTACT_CREATE] Mobile number validation passed');

    console.log(
      '✅ [CONTACT_CREATE] Check 2: VAT registration (isRegisteredForVat:',
      isRegisteredForVat,
      ')'
    );
    if (isRegisteredForVat === true) {
      if (data.vatRegistrationNumber === '') {
        console.error('❌ [CONTACT_CREATE] VAT number required but empty');
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Tax registration number is required',
        });
        return;
      }
      if (data.vatRegistrationNumber.length !== 15) {
        console.error(
          '❌ [CONTACT_CREATE] VAT number length invalid:',
          data.vatRegistrationNumber?.length
        );
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Please enter 15 digit Tax registration number',
        });
        return;
      }
    }
    console.log('✅ [CONTACT_CREATE] VAT registration validation passed');

    console.log('✅ [CONTACT_CREATE] Check 3: TRN exists check (trnExist:', trnExist, ')');
    if (trnExist === true) {
      console.error('❌ [CONTACT_CREATE] TRN already exists');
      setError('vatRegistrationNumber', {
        type: 'manual',
        message: 'Tax registration number already exists',
      });
      return;
    }
    console.log('✅ [CONTACT_CREATE] TRN check passed');

    console.log('✅ [CONTACT_CREATE] Check 4: Email exists check (emailExist:', emailExist, ')');
    if (emailExist === true) {
      console.error('❌ [CONTACT_CREATE] Email already exists');
      setError('email', { type: 'manual', message: 'Email already exists' });
      return;
    }
    console.log('✅ [CONTACT_CREATE] Email check passed');

    console.log('✅ [CONTACT_CREATE] Check 5: Shipping address validation');
    console.log('📦 [CONTACT_CREATE] isSame (shipping same as billing):', isSame);
    // Only validate shipping address if it's NOT same as billing address
    if (!isSame) {
      console.log(
        '📦 [CONTACT_CREATE] Shipping address data:',
        JSON.stringify(data.shippingAddress, null, 2)
      );
      const shippingAddressError = InputValidation.addressValidation(data.shippingAddress);
      console.log(
        '📦 [CONTACT_CREATE] Shipping address errors:',
        JSON.stringify(shippingAddressError, null, 2)
      );
      if (shippingAddressError && Object.values(shippingAddressError).length > 0) {
        console.error(
          '❌ [CONTACT_CREATE] Shipping address validation failed:',
          shippingAddressError
        );
        setError('shippingAddress', { type: 'manual', message: 'Invalid shipping address' });
        return;
      }
    }
    console.log('✅ [CONTACT_CREATE] Shipping address validation passed');

    console.log('✅ [CONTACT_CREATE] Check 6: Billing address validation');
    console.log(
      '📦 [CONTACT_CREATE] Billing address data:',
      JSON.stringify(data.billingAddress, null, 2)
    );
    const billingAddressError = InputValidation.addressValidation(data.billingAddress);
    console.log(
      '📦 [CONTACT_CREATE] Billing address errors:',
      JSON.stringify(billingAddressError, null, 2)
    );
    if (billingAddressError && Object.values(billingAddressError).length > 0) {
      console.error('❌ [CONTACT_CREATE] Billing address validation failed:', billingAddressError);
      setError('billingAddress', { type: 'manual', message: 'Invalid billing address' });
      return;
    }
    console.log('✅ [CONTACT_CREATE] Billing address validation passed');

    console.log('✅ [CONTACT_CREATE] All validations passed! Proceeding with contact creation...');
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Contact...');
    setDisabled(true);

    console.log('🔄 [CONTACT_CREATE] Calling getData() to transform form data...');
    const postData = getData(data);
    console.log('📤 [CONTACT_CREATE] Post data prepared:', JSON.stringify(postData, null, 2));

    console.log('🌐 [CONTACT_CREATE] Calling API: POST /rest/contact/save');
    createContactActions
      .createContact(postData)
      .then(res => {
        console.log('✅ [CONTACT_CREATE] API response received:', res);
        if (res.status === 200) {
          console.log('🎉 [CONTACT_CREATE] Contact created successfully!');
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
              contactType: contactType ? String(contactType.value || contactType) : '',
              currencyCode: companyDetails?.currencyCode ? String(companyDetails.currencyCode) : '',
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
        console.error('❌ [CONTACT_CREATE] API call failed:', err);
        console.error('❌ [CONTACT_CREATE] Error details:', {
          message: err?.message,
          data: err?.data,
          status: err?.status,
          response: err?.response,
        });
        // Error handled by error boundary or user notification
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
      setValue('isBillingAndShippingAddressSame', false);
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
      setValue('isBillingAndShippingAddressSame', false);
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

  // Corporate theme constants
  const theme = {
    bg: '#f8f9fa',
    bgWhite: '#ffffff',
    primary: '#2064d8',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    border: '#e5e7eb',
  };

  return (
    <div
      className="create-contact-screen"
      style={{ background: theme.bg, minHeight: '100vh', padding: '24px' }}
    >
      <div className="animated fadeIn max-w-7xl mx-auto">
        <Card
          className="rounded-xl overflow-hidden"
          style={{
            background: theme.bgWhite,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" style={{ color: '#1e6eff' }} />
              <span>{strings.CreateContact}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Status Radio Group */}
                {!(isParentComponentPresent && isParentComponentPresent === true) && (
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
                )}

                {/* Contact Name Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">{strings.ContactName}</h4>

                  {/* First Name, Middle Name, Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="firstName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.FirstName}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                maxLength={100}
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.FirstName}`}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAlpha.test(value)) {
                                    field.onChange(upperFirst(value));
                                  }
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="middleName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>{strings.MiddleName}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                maxLength={100}
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.MiddleName}`}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAlpha.test(value)) {
                                    field.onChange(upperFirst(value));
                                  }
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="lastName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.LastName}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                maxLength={100}
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.LastName}`}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAlpha.test(value)) {
                                    field.onChange(upperFirst(value));
                                  }
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="space-y-4 border-t pt-6" style={{ borderColor: theme.border }}>
                  <h4 className="text-lg font-semibold mb-4">{strings.ContactDetails}</h4>

                  {/* Contact Type, Organization, Email */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="contactType"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-red-500">* </span>
                              {strings.ContactType}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      The contact type cannot be changed once a document has been
                                      created for this contact.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={contactType ? true : false}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'rounded-lg',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={strings.Select + ' ' + strings.ContactType}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contact_type_list
                                  ?.filter(
                                    (type, index, self) =>
                                      type.value != null &&
                                      type.value !== '' &&
                                      self.findIndex(t => t.value === type.value) === index
                                  )
                                  .map((type, index) => (
                                    <SelectItem
                                      key={`contact-type-${type.value}-${index}`}
                                      value={String(type.value)}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="organization"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>{strings.OrganizationName}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                maxLength={100}
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.OrganizationName}`}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAddress.test(value)) {
                                    field.onChange(upperFirst(value));
                                  }
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="email"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.Email}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                maxLength={80}
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.EmailAddres}`}
                                onChange={e => {
                                  field.onChange(e);
                                  emailvalidationCheck(e.target.value);
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Currency, Telephone, Mobile Number, Website */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="currencyCode"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-red-500">* </span>
                              {strings.Currency}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      You cannot change the currency once a document is created for
                                      this contact.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'rounded-lg',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={strings.Select + ' ' + strings.Currency}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currency_list_dropdown
                                  ?.filter(
                                    (currency, index, self) =>
                                      currency.value != null &&
                                      currency.value !== '' &&
                                      self.findIndex(c => c.value === currency.value) === index
                                  )
                                  .map((currency, index) => (
                                    <SelectItem
                                      key={`currency-${currency.value}-${index}`}
                                      value={String(currency.value)}
                                    >
                                      {currency.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="telephone"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>{strings.Telephone}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                maxLength={15}
                                type="text"
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.TelephoneNumber}`}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExTelephone.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="mobileNumber"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>{strings.MobileNumber}</FormLabel>
                            <FormControl>
                              <div
                                className={cn(fieldState.error && 'border-red-500 rounded-xl p-1')}
                              >
                                <PhoneInput
                                  enableSearch={true}
                                  country={'ae'}
                                  value={field.value || ''}
                                  placeholder={`${strings.Enter} ${strings.MobileNumber}`}
                                  onChange={value => {
                                    field.onChange(value);
                                    setCheckmobileNumberParam(value.length !== 12);
                                  }}
                                />
                              </div>
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="website"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>{strings.Website}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                maxLength={100}
                                autoComplete="off"
                                placeholder={`${strings.Enter} ${strings.Website}`}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAddress.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                className={cn('rounded-lg', fieldState?.error && 'border-red-500')}
                                style={{
                                  background: theme.bgWhite,
                                  border: `1px solid ${theme.border}`,
                                }}
                              />
                            </FormControl>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Tax Treatment and VAT Registration Number */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="col-span-1 md:col-span-4">
                      <FormField
                        name="taxTreatmentId"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-red-500">* </span>
                              {strings.TaxTreatment}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Once any document has been created for this contact, you
                                      cannot change the Tax treatment.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select
                              onValueChange={value => {
                                field.onChange(value);
                                if (value) {
                                  const numValue = parseInt(value, 10);
                                  resetCountryList(numValue);
                                  if (numValue === 1 || numValue === 3 || numValue === 5) {
                                    setIsRegisteredForVat(true);
                                  } else {
                                    setIsRegisteredForVat(false);
                                  }
                                  if (
                                    numValue === 1 ||
                                    numValue === 2 ||
                                    numValue === 3 ||
                                    numValue === 4
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
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'rounded-lg',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={strings.Select + ' ' + strings.TaxTreatment}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {taxTreatmentList
                                  ?.filter(
                                    (treatment, index, self) =>
                                      treatment.id != null &&
                                      treatment.id !== '' &&
                                      self.findIndex(t => t.id === treatment.id) === index
                                  )
                                  .map((treatment, index) => (
                                    <SelectItem
                                      key={`tax-treatment-${treatment.id}-${index}`}
                                      value={String(treatment.id)}
                                    >
                                      {treatment.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {fieldState?.error && (
                              <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    {watchedValues?.taxTreatmentId && (
                      <div
                        className={cn(
                          'col-span-1 md:col-span-4',
                          !(
                            parseInt(watchedValues.taxTreatmentId, 10) === 1 ||
                            parseInt(watchedValues.taxTreatmentId, 10) === 3 ||
                            parseInt(watchedValues.taxTreatmentId, 10) === 5
                          ) && 'hidden'
                        )}
                      >
                        <FormField
                          name="vatRegistrationNumber"
                          control={control}
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>
                                <span className="text-red-500">* </span>
                                {strings.TaxRegistrationNumber}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="text"
                                  minLength={15}
                                  maxLength={15}
                                  autoComplete="off"
                                  placeholder={`${strings.Enter} ${strings.TaxRegistrationNumber}`}
                                  onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || regEx.test(value)) {
                                      field.onChange(e);
                                      validationCheck(value);
                                    }
                                  }}
                                  className={cn('rounded-lg', fieldState.error && 'border-red-500')}
                                  style={{
                                    background: theme.bgWhite,
                                    border: `1px solid ${theme.border}`,
                                  }}
                                />
                              </FormControl>
                              {fieldState.error && (
                                <FormMessage>{fieldState.error.message}</FormMessage>
                              )}
                              <div className="mt-2">
                                <a
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href="https://tax.gov.ae/en/default.aspx"
                                  className="text-blue-600 hover:underline font-semibold"
                                >
                                  {strings.VerifyTRN}
                                </a>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Address Details Section */}
                <div className="space-y-4 border-t pt-6" style={{ borderColor: theme.border }}>
                  <h2 className="text-xl font-semibold mb-4">{strings.ContactAddressDetails}</h2>

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h5 className="text-lg font-medium mb-4">{strings.BillingDetails}</h5>
                    <AddressComponent
                      addressPrefix="billingAddress"
                      addressType={strings.Billing}
                      country_list={countryList}
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
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4 border-t pt-6" style={{ borderColor: theme.border }}>
                    <h5 className="text-lg font-medium mb-4">{strings.ShippingDetails}</h5>
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shipping-same-as-billing"
                          checked={isSame}
                          onCheckedChange={checked => {
                            const checkedValue = checked === true;
                            if (!checkedValue) {
                              setValue('shippingAddress', watchedValues.billingAddress);
                            } else {
                              setValue('shippingAddress', Lists.Address);
                              if (disableCountry) {
                                setValue('shippingAddress.countryId', 229);
                              }
                            }
                            setIsSame(checkedValue);
                            setValue('isBillingAndShippingAddressSame', checkedValue);
                          }}
                        />
                        <label
                          htmlFor="shipping-same-as-billing"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {strings.ShippingAddressIsSameAsBillingAddress}
                        </label>
                      </div>
                    </div>
                    {!isSame && (
                      <AddressComponent
                        addressPrefix="shippingAddress"
                        addressType={strings.Shipping}
                        country_list={countryList}
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
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="flex justify-end gap-3 mt-8 pt-6 border-t"
                  style={{ borderColor: theme.border }}
                >
                  <Button
                    type="button"
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
                    className="rounded-lg"
                    style={{
                      background: theme.primary,
                    }}
                  >
                    <CircleDot className="h-4 w-4" />
                    {disabled ? 'Creating...' : strings.Create}
                  </Button>
                  {!(isParentComponentPresent && isParentComponentPresent === true) && (
                    <Button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        trigger().then(isValid => {
                          if (!isValid || Object.keys(errors).length !== 0) {
                            commonActions.fillManDatoryDetails();
                          }
                        });
                        setCreateMore(true);
                        setIsSame(false);
                        setValue('isBillingAndShippingAddressSame', false);
                        handleSubmit(onSubmit)();
                      }}
                      className="rounded-lg"
                      style={{
                        background: theme.primary,
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {disabled ? 'Creating...' : strings.CreateandMore}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => {
                      if (isParentComponentPresent && isParentComponentPresent === true) {
                        confirmCancel(true);
                      } else {
                        history.push('/admin/master/contact');
                      }
                    }}
                    style={{
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <Ban className="h-4 w-4" />
                    {strings.Cancel}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateContact);
