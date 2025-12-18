import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import PasswordChecklist from 'react-password-checklist';
import { upperFirst } from 'lodash-es';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'components';

import { AuthActions, CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import logo from 'assets/images/brand/logo.png';
import configData from 'constants/config';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';
import './style.scss';

import LocalizedStrings from 'react-localization';
import { data } from '../Language/index';

let strings = new LocalizedStrings(data);
if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Password validation regex
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// Zod validation schema
const registerSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required').max(100),
    currencyCode: z
      .number()
      .or(z.string())
      .refine(val => val !== '', 'Currency is required'),
    companyTypeCode: z.string().min(1, 'Company / business type is required'),
    companyAddress1: z.string().min(1, 'Company address line 1 is required').max(250),
    companyAddress2: z.string().max(250).optional(),
    timeZone: z.string().min(1, 'Time zone is required'),
    countryId: z
      .number()
      .or(z.string())
      .refine(val => val !== '', 'Country is required'),
    stateId: z.any().refine(val => {
      if (!val) return false;
      if (typeof val === 'object')
        return val.value !== undefined && val.value !== null && val.value !== '';
      return val !== '';
    }, 'Emirate is required'),
    phoneNumber: z.string().min(1, 'Mobile number is required'),
    isDesignatedZone: z.boolean().default(false),
    IsRegistered: z.boolean().default(false),
    TaxRegistrationNumber: z.string().optional(),
    vatRegistrationDate: z.any().optional(),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password must be at most 255 characters')
      .regex(
        passwordRegex,
        'Must contain minimum 8 characters, one uppercase, one lowercase, one number and one special character'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.IsRegistered) {
      if (!data.TaxRegistrationNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tax registration number is required',
          path: ['TaxRegistrationNumber'],
        });
      } else if (data.TaxRegistrationNumber.length < 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid TRN (must be 15 digits)',
          path: ['TaxRegistrationNumber'],
        });
      }
      if (!data.vatRegistrationDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'VAT registration date is required',
          path: ['vatRegistrationDate'],
        });
      }
    }
  });

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const state_list = useSelector(state => state.common.state_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);
  const company_type_list = useSelector(state => state.common.company_type_list);

  // Local state
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [nextLoadingMsg, setNextLoadingMsg] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [timezone, setTimezone] = useState([]);
  const [sabackend, setSabackend] = useState('');
  const [checkPhoneNumberParam, setCheckPhoneNumberParam] = useState(false);

  // Default country list for UAE
  const country_list = [
    {
      countryCode: 229,
      countryName: 'United Arab Emirates',
    },
  ];

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: '',
      currencyCode: 150,
      companyTypeCode: '',
      companyAddress1: '',
      companyAddress2: '',
      timeZone: 'Asia/Dubai',
      countryId: 229,
      stateId: '',
      phoneNumber: '',
      isDesignatedZone: false,
      IsRegistered: false,
      TaxRegistrationNumber: '',
      vatRegistrationDate: null,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const isVatRegistered = form.watch('IsRegistered');
  const isDesignatedZone = form.watch('isDesignatedZone');

  useEffect(() => {
    getInitialData();
    getBackendRelease();
  }, []);

  const getBackendRelease = () => {
    dispatch(AuthActions.getSimpleAccountsreleasenumber())
      .then(action => {
        if (action?.payload?.simpleAccountsRelease) {
          setSabackend(action.payload.simpleAccountsRelease);
        }
      })
      .catch(() => {
        // Silent fail
      });
  };

  const getInitialData = () => {
    dispatch(AuthActions.getTimeZoneList())
      .then(action => {
        if (action?.payload && Array.isArray(action.payload)) {
          const output = action.payload.map(value => ({ label: value, value: value }));
          setTimezone(output);
        }
      })
      .catch(() => {
        setTimezone([]);
      });

    dispatch(CommonActions.getStateList()).catch(() => {});
    dispatch(CommonActions.getCompanyTypeListRegister()).catch(() => {});
    dispatch(AuthActions.getCurrencyList()).catch(() => {});

    dispatch(AuthActions.getCompanyCount())
      .then(action => {
        if (action?.payload > 0) {
          navigate('/login');
        }
      })
      .catch(() => {});
  };

  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const onSubmit = data => {
    // Validate phone number
    if (checkPhoneNumberParam) {
      form.setError('phoneNumber', { message: 'Invalid mobile number' });
      return;
    }

    setLoading(true);
    setLoadingMsg('Registering Company,');
    setNextLoadingMsg('Please wait till we setup your account');

    toast.info('Please wait till we setup your account', { duration: 40000 });

    // Prepare form data
    const formData = new FormData();
    formData.append('companyName', data.companyName || '');
    formData.append('currencyCode', data.currencyCode || '');
    formData.append('firstName', data.firstName || '');
    formData.append('lastName', data.lastName || '');
    formData.append('email', data.email || '');
    formData.append('timeZone', 'Asia/Dubai');
    formData.append('countryId', data.countryId || '229');

    let stateIdValue = '';
    if (data.stateId) {
      if (typeof data.stateId === 'object' && data.stateId.value !== undefined) {
        stateIdValue = data.stateId.value;
      } else if (typeof data.stateId === 'string' || typeof data.stateId === 'number') {
        stateIdValue = data.stateId;
      }
    }
    formData.append('stateId', stateIdValue);
    formData.append('phoneNumber', data.phoneNumber || '');
    formData.append('IsDesignatedZone', data.isDesignatedZone || false);

    if (data.IsRegistered) {
      formData.append('IsRegisteredVat', data.IsRegistered);
    }
    if (data.TaxRegistrationNumber) {
      formData.append('TaxRegistrationNumber', data.TaxRegistrationNumber);
    }
    if (data.vatRegistrationDate) {
      formData.append('vatRegistrationDate', data.vatRegistrationDate);
    }
    formData.append('companyTypeCode', data.companyTypeCode || '');
    formData.append('companyAddressLine1', data.companyAddress1 || '');
    formData.append('companyAddressLine2', data.companyAddress2 || '');
    formData.append('loginUrl', window.location.origin);
    formData.append('password', data.password);

    // Prepare Strapi objects
    const strapiUserObj = {
      username: data.email,
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      MobileNumber: data.phoneNumber,
    };

    const companyStrapiObj = {
      CompanyName: data.companyName,
      currency: data.currencyCode || '',
      companyType: data.companyTypeCode,
      country: 'UAE',
      stateId: stateIdValue,
      IsDesignatedZone: data.isDesignatedZone || false,
      IsRegisteredVat: data.IsRegistered || false,
      TaxRegistrationNumber: data.TaxRegistrationNumber,
      vatRegistrationDate: data.vatRegistrationDate,
      domainName: configData.API_ROOT_URL,
      companyURL: data.companyName,
      frontend: configData.FRONTEND_RELEASE,
      backend: sabackend,
      status: 'nosub',
      createdAt: new Date(),
      updatedAt: new Date(),
      TimeZonePrefrence: 'Asia/Dubai',
      Emirate: data.stateId?.label || '',
      MobileNumber: data.phoneNumber,
      IsVatRegistered: data.IsRegistered || false,
      CompanyLocatedAt: 'Dubai',
      Currency: 'UAE Dirham - AED',
      CompanyAddressLine1: data.companyAddress1,
      CompanyAddressLine2: data.companyAddress2,
      user: {
        id: '6',
        username: data.email,
        email: data.email,
        provider: 'local',
        confirmed: true,
        blocked: false,
        nickname: null,
        firstname: data.firstName,
        lastname: data.lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      activePlan: null,
    };

    // Register Strapi user (non-critical)
    dispatch(AuthActions.registerStrapiUser(strapiUserObj, companyStrapiObj)).catch(() => {});

    // Main registration
    dispatch(AuthActions.register(formData))
      .then(action => {
        if (action?.type?.includes('fulfilled')) {
          setLoading(false);
          toast.success('Account created successfully');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setLoading(false);
          const errorMessage = action?.payload?.message || action?.payload || 'Registration failed';
          toast.error(errorMessage);
        }
      })
      .catch(action => {
        setLoading(false);
        let errorMessage = 'Registration Failed. Please Try Again';
        if (action?.payload) {
          if (typeof action.payload === 'string') {
            errorMessage = action.payload;
          } else if (action.payload.message) {
            errorMessage = action.payload.message;
          } else if (action.payload.error) {
            errorMessage = action.payload.error;
          }
        } else if (action?.error?.message) {
          errorMessage = action.error.message;
        }
        toast.error(errorMessage);
      });
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.2)' : 'none',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} NextloadingMsg={nextLoadingMsg} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="logo" className="h-20 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">{strings.Register}</CardTitle>
            <CardDescription>Enter your details below to register</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Details Section */}
              <div>
                <h4 className="text-lg font-semibold mb-4">{strings.CompanyDetails}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.CompanyName}
                        </FormLabel>
                        <Input
                          placeholder="Enter Company Name"
                          maxLength={100}
                          className={fieldState.error ? 'border-destructive' : ''}
                          {...field}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="currencyCode"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>{strings.Currency}</FormLabel>
                        <Select
                          isDisabled
                          styles={customSelectStyles}
                          options={
                            universal_currency_list
                              ? selectCurrencyFactory.renderOptions(
                                  'currencyName',
                                  'currencyCode',
                                  universal_currency_list,
                                  'Currency'
                                )
                              : []
                          }
                          value={
                            universal_currency_list &&
                            selectCurrencyFactory
                              .renderOptions(
                                'currencyName',
                                'currencyCode',
                                universal_currency_list,
                                'Currency'
                              )
                              .find(option => option.value === +field.value)
                          }
                          onChange={option => field.onChange(option?.value || '')}
                          className={fieldState.error ? 'border-destructive rounded-md' : ''}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Company Type */}
                  <FormField
                    control={form.control}
                    name="companyTypeCode"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.CompanyBusinessType}
                        </FormLabel>
                        <Select
                          styles={customSelectStyles}
                          options={
                            company_type_list
                              ? selectOptionsFactory.renderOptions(
                                  'label',
                                  'value',
                                  company_type_list,
                                  'Company Type Code'
                                )
                              : []
                          }
                          value={company_type_list?.find(option => option.value === +field.value)}
                          onChange={option => field.onChange(option?.value?.toString() || '')}
                          placeholder={strings.Select + strings.CompanyBusinessType}
                          className={fieldState.error ? 'border-destructive rounded-md' : ''}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Company Address 1 */}
                  <FormField
                    control={form.control}
                    name="companyAddress1"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.CompanyAddressLine1}
                        </FormLabel>
                        <Input
                          placeholder="Enter Company Address"
                          maxLength={250}
                          className={fieldState.error ? 'border-destructive' : ''}
                          {...field}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Company Address 2 */}
                  <FormField
                    control={form.control}
                    name="companyAddress2"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>{strings.CompanyAddressLine2}</FormLabel>
                        <Input placeholder="Enter Company Address" maxLength={250} {...field} />
                      </FormItem>
                    )}
                  />

                  {/* Timezone */}
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>{strings.TimeZonePreference}</FormLabel>
                        <Select
                          isDisabled
                          styles={customSelectStyles}
                          options={timezone}
                          value={timezone.find(option => option.value === field.value)}
                          onChange={option => field.onChange(option?.value || '')}
                          className={fieldState.error ? 'border-destructive rounded-md' : ''}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="countryId"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>{strings.Country}</FormLabel>
                        <Select
                          isDisabled
                          styles={customSelectStyles}
                          options={selectOptionsFactory.renderOptions(
                            'countryName',
                            'countryCode',
                            country_list,
                            'Country'
                          )}
                          value={selectOptionsFactory
                            .renderOptions('countryName', 'countryCode', country_list, 'Country')
                            .find(option => option.value === +field.value)}
                          onChange={option => field.onChange(option?.value || '')}
                          className={fieldState.error ? 'border-destructive rounded-md' : ''}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Emirate/State */}
                  <FormField
                    control={form.control}
                    name="stateId"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.Emirate}
                        </FormLabel>
                        <Select
                          styles={customSelectStyles}
                          options={
                            state_list
                              ? selectOptionsFactory.renderOptions(
                                  'label',
                                  'value',
                                  state_list,
                                  'Emirate'
                                )
                              : []
                          }
                          value={state_list?.find(
                            option =>
                              option.value === +field.value?.value || option.value === +field.value
                          )}
                          onChange={option => field.onChange(option)}
                          placeholder="Select Emirate"
                          className={fieldState.error ? 'border-destructive rounded-md' : ''}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.MobileNumber}
                        </FormLabel>
                        <PhoneInput
                          country="ae"
                          enableSearch
                          value={field.value}
                          placeholder={strings.Enter + strings.MobileNumber}
                          onChange={value => {
                            field.onChange(value);
                            setCheckPhoneNumberParam(value.length !== 12);
                          }}
                          inputClass={fieldState.error ? 'border-destructive' : ''}
                          containerClass="phone-input-container"
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>

                {/* Company Location */}
                <div className="mt-4">
                  <Label className="mb-2 block">Where Is The Company Located?</Label>
                  <FormField
                    control={form.control}
                    name="isDesignatedZone"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value ? 'freezone' : 'mainland'}
                        onValueChange={value => field.onChange(value === 'freezone')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mainland" id="mainland" />
                          <Label htmlFor="mainland" className="font-normal cursor-pointer">
                            {strings.Mainland}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="freezone" id="freezone" />
                          <Label htmlFor="freezone" className="font-normal cursor-pointer">
                            {strings.Freezone}
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                {/* VAT Registration */}
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="IsRegistered"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="IsRegistered"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="IsRegistered" className="font-normal cursor-pointer">
                          Is VAT Registered?
                        </Label>
                      </div>
                    )}
                  />
                </div>

                {/* VAT Details (conditional) */}
                {isVatRegistered && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="TaxRegistrationNumber"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive">* </span>
                            {strings.TaxRegistrationNumber}
                          </FormLabel>
                          <Input
                            placeholder="Enter Tax Registration Number"
                            minLength={15}
                            maxLength={15}
                            className={fieldState.error ? 'border-destructive' : ''}
                            {...field}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || /^[0-9\d]+$/.test(value)) {
                                field.onChange(e);
                              }
                            }}
                          />
                          {fieldState.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                          <a
                            href="https://tax.gov.ae/en/default.aspx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {strings.VerifyTRN}
                          </a>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vatRegistrationDate"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive">* </span>
                            VAT Registered On
                          </FormLabel>
                          <DatePicker
                            autoComplete="off"
                            minDate={new Date('01/01/2018')}
                            maxDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dateFormat="dd-MM-yyyy"
                            dropdownMode="select"
                            placeholderText="Select VAT Registered Date"
                            selected={field.value}
                            onChange={date => field.onChange(date)}
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
                              fieldState.error ? 'border-destructive' : ''
                            }`}
                          />
                          {fieldState.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Super Admin Section */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Super Admin</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.FirstName}
                        </FormLabel>
                        <Input
                          placeholder="Enter First Name"
                          maxLength={100}
                          className={fieldState.error ? 'border-destructive' : ''}
                          {...field}
                          onChange={e => {
                            const value = e.target.value;
                            if (value === '' || /^[a-zA-Z ]+$/.test(value)) {
                              field.onChange(upperFirst(value));
                            }
                          }}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.LastName}
                        </FormLabel>
                        <Input
                          placeholder="Enter Last Name"
                          maxLength={100}
                          className={fieldState.error ? 'border-destructive' : ''}
                          {...field}
                          onChange={e => {
                            const value = e.target.value;
                            if (value === '' || /^[a-zA-Z ]+$/.test(value)) {
                              field.onChange(upperFirst(value));
                            }
                          }}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          {strings.EmailAddress}
                        </FormLabel>
                        <Input
                          type="email"
                          placeholder="Enter Email Address"
                          maxLength={80}
                          className={fieldState.error ? 'border-destructive' : ''}
                          {...field}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          Password
                        </FormLabel>
                        <div className="relative">
                          <Input
                            type={isPasswordShown ? 'text' : 'password'}
                            placeholder="Enter Password"
                            autoComplete="new-password"
                            className={fieldState.error ? 'border-destructive pr-10' : 'pr-10'}
                            onPaste={e => e.preventDefault()}
                            onCopy={e => e.preventDefault()}
                            {...field}
                            onChange={e => {
                              field.onChange(e);
                              setShowPasswordRules(e.target.value !== '');
                            }}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {isPasswordShown ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        {showPasswordRules && (
                          <div className="mt-2">
                            <PasswordChecklist
                              rules={['maxLength', 'minLength', 'specialChar', 'number', 'capital']}
                              minLength={8}
                              maxLength={255}
                              value={password}
                              valueAgain={confirmPassword}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive">* </span>
                          Confirm Password
                        </FormLabel>
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          autoComplete="new-password"
                          className={fieldState.error ? 'border-destructive' : ''}
                          onPaste={e => e.preventDefault()}
                          onCopy={e => e.preventDefault()}
                          {...field}
                        />
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        {showPasswordRules && (
                          <div className="mt-2">
                            <PasswordChecklist
                              rules={['match']}
                              minLength={8}
                              value={password}
                              valueAgain={confirmPassword}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  Note: <strong>Super Admin</strong> details cannot be altered after registration
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col items-center gap-4">
                <Button type="submit" className="w-full md:w-auto min-w-[200px]" disabled={loading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Register'}
                </Button>
                <a
                  href="https://www.simpleaccounts.io/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Privacy Policy
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
