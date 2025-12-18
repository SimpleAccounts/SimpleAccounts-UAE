import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import {
  Eye,
  EyeOff,
  UserPlus,
  Building2,
  MapPin,
  User,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import { upperFirst } from 'lodash-es';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { StepWizard, StepContent, StepNavigation } from '@/components/ui/step-wizard';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { LoadingOverlay, ButtonSpinner } from '@/components/ui/loading-spinner';

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

// Wizard steps
const WIZARD_STEPS = [
  { id: 'company', title: 'Company Details', icon: Building2 },
  { id: 'location', title: 'Location & VAT', icon: MapPin },
  { id: 'admin', title: 'Admin Account', icon: User },
];

// Step 1 validation schema
const step1Schema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
  currencyCode: z
    .number()
    .or(z.string())
    .refine(val => val !== '', 'Currency is required'),
  companyTypeCode: z.string().min(1, 'Company / business type is required'),
  companyAddress1: z.string().min(1, 'Company address line 1 is required').max(250),
  companyAddress2: z.string().max(250).optional(),
  timeZone: z.string().min(1, 'Time zone is required'),
});

// Step 2 validation schema
const step2Schema = z.object({
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
});

// Step 3 validation schema
const step3Schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must be at most 255 characters')
    .regex(passwordRegex, 'Password must meet all requirements'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
});

// Full schema
const registerSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [timezone, setTimezone] = useState([]);
  const [sabackend, setSabackend] = useState('');
  const [checkPhoneNumberParam, setCheckPhoneNumberParam] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Default country list for UAE
  const country_list = [{ countryCode: 229, countryName: 'United Arab Emirates' }];

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

  useEffect(() => {
    getInitialData();
    getBackendRelease();
  }, []);

  const getBackendRelease = () => {
    dispatch(AuthActions.getSimpleAccountsreleasenumber())
      .then(action => {
        if (action?.payload?.simpleAccountsRelease)
          setSabackend(action.payload.simpleAccountsRelease);
      })
      .catch(() => {});
  };

  const getInitialData = () => {
    dispatch(AuthActions.getTimeZoneList())
      .then(action => {
        if (action?.payload && Array.isArray(action.payload)) {
          setTimezone(action.payload.map(value => ({ label: value, value: value })));
        }
      })
      .catch(() => setTimezone([]));

    dispatch(CommonActions.getStateList()).catch(() => {});
    dispatch(CommonActions.getCompanyTypeListRegister()).catch(() => {});
    dispatch(AuthActions.getCurrencyList()).catch(() => {});
    dispatch(AuthActions.getCompanyCount())
      .then(action => {
        if (action?.payload > 0) navigate('/login');
      })
      .catch(() => {});
  };

  const validateCurrentStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        'companyName',
        'currencyCode',
        'companyTypeCode',
        'companyAddress1',
        'timeZone',
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = ['countryId', 'stateId', 'phoneNumber'];
      if (form.getValues('IsRegistered')) {
        fieldsToValidate.push('TaxRegistrationNumber', 'vatRegistrationDate');
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    }
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep === 2 && checkPhoneNumberParam) {
        form.setError('phoneNumber', { message: 'Invalid mobile number' });
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleStepClick = step => {
    if (step <= currentStep) setCurrentStep(step);
  };

  const onSubmit = data => {
    if (checkPhoneNumberParam) {
      form.setError('phoneNumber', { message: 'Invalid mobile number' });
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    toast.info('Please wait while we set up your account...', { duration: 40000 });

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
      stateIdValue = typeof data.stateId === 'object' ? data.stateId.value : data.stateId;
    }
    formData.append('stateId', stateIdValue);
    formData.append('phoneNumber', data.phoneNumber || '');
    formData.append('IsDesignatedZone', data.isDesignatedZone || false);
    if (data.IsRegistered) formData.append('IsRegisteredVat', data.IsRegistered);
    if (data.TaxRegistrationNumber)
      formData.append('TaxRegistrationNumber', data.TaxRegistrationNumber);
    if (data.vatRegistrationDate) formData.append('vatRegistrationDate', data.vatRegistrationDate);
    formData.append('companyTypeCode', data.companyTypeCode || '');
    formData.append('companyAddressLine1', data.companyAddress1 || '');
    formData.append('companyAddressLine2', data.companyAddress2 || '');
    formData.append('loginUrl', window.location.origin);
    formData.append('password', data.password);

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

    dispatch(AuthActions.registerStrapiUser(strapiUserObj, companyStrapiObj)).catch(() => {});

    dispatch(AuthActions.register(formData))
      .then(action => {
        setLoading(false);
        if (action?.type?.includes('fulfilled')) {
          setRegistrationSuccess(true);
          toast.success('Account created successfully!');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          toast.error(action?.payload?.message || action?.payload || 'Registration failed');
        }
      })
      .catch(action => {
        setLoading(false);
        let errorMessage = 'Registration Failed. Please Try Again';
        if (action?.payload) {
          errorMessage =
            typeof action.payload === 'string'
              ? action.payload
              : action.payload.message || action.payload.error || errorMessage;
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
      backgroundColor: 'hsl(var(--background))',
      '&:hover': { borderColor: 'hsl(var(--ring))' },
    }),
    menu: base => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
      color: 'hsl(var(--foreground))',
      '&:active': { backgroundColor: 'hsl(var(--accent))' },
    }),
    singleValue: base => ({ ...base, color: 'hsl(var(--foreground))' }),
    input: base => ({ ...base, color: 'hsl(var(--foreground))' }),
  };

  if (loading) {
    return (
      <LoadingOverlay
        message="Creating your account..."
        submessage="Please wait while we set up everything"
      />
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md animate-scale-in shadow-lg dark:shadow-2xl">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Registration Successful!</h2>
              <p className="text-muted-foreground">
                Your account has been created. Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 py-8 transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="fixed top-4 left-4 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Button>
      </div>

      <Card className="w-full max-w-4xl animate-slide-up shadow-lg dark:shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center animate-fade-in">
            <img src={logo} alt="SimpleAccounts Logo" className="h-16 w-auto" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Complete the steps below to get started</CardDescription>
          </div>
          <StepWizard
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            className="pt-4"
          />
        </CardHeader>

        <CardContent className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
              aria-label="Registration form"
            >
              {/* Step 1: Company Details */}
              <StepContent isActive={currentStep === 1}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">{strings.CompanyDetails}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel htmlFor="companyName">
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            {strings.CompanyName}
                          </FormLabel>
                          <Input
                            id="companyName"
                            placeholder="Enter Company Name"
                            maxLength={100}
                            aria-required="true"
                            aria-invalid={!!fieldState.error}
                            className={`input-transition ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                            {...field}
                          />
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyTypeCode"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            {strings.CompanyBusinessType}
                          </FormLabel>
                          <Select
                            styles={customSelectStyles}
                            aria-label="Select company type"
                            options={
                              company_type_list
                                ? selectOptionsFactory.renderOptions(
                                    'label',
                                    'value',
                                    company_type_list,
                                    'Company Type'
                                  )
                                : []
                            }
                            value={company_type_list?.find(option => option.value === +field.value)}
                            onChange={option => field.onChange(option?.value?.toString() || '')}
                            placeholder="Select Business Type"
                            className={fieldState.error ? 'border-destructive rounded-md' : ''}
                          />
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyAddress1"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel htmlFor="companyAddress1">
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            {strings.CompanyAddressLine1}
                          </FormLabel>
                          <Input
                            id="companyAddress1"
                            placeholder="Enter Company Address"
                            maxLength={250}
                            aria-required="true"
                            aria-invalid={!!fieldState.error}
                            className={`input-transition ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                            {...field}
                          />
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyAddress2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="companyAddress2">
                            {strings.CompanyAddressLine2}
                          </FormLabel>
                          <Input
                            id="companyAddress2"
                            placeholder="Enter Company Address (Optional)"
                            maxLength={250}
                            className="input-transition"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currencyCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{strings.Currency}</FormLabel>
                          <Select
                            isDisabled
                            styles={customSelectStyles}
                            aria-label="Currency"
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
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeZone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{strings.TimeZonePreference}</FormLabel>
                          <Select
                            isDisabled
                            styles={customSelectStyles}
                            options={timezone}
                            aria-label="Timezone"
                            value={timezone.find(option => option.value === field.value)}
                            onChange={option => field.onChange(option?.value || '')}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </StepContent>

              {/* Step 2: Location & VAT */}
              <StepContent isActive={currentStep === 2}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">Location & VAT Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="countryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{strings.Country}</FormLabel>
                          <Select
                            isDisabled
                            styles={customSelectStyles}
                            aria-label="Country"
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
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stateId"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            {strings.Emirate}
                          </FormLabel>
                          <Select
                            styles={customSelectStyles}
                            aria-label="Select emirate"
                            aria-required="true"
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
                                option.value === +field.value?.value ||
                                option.value === +field.value
                            )}
                            onChange={option => field.onChange(option)}
                            placeholder="Select Emirate"
                            className={fieldState.error ? 'border-destructive rounded-md' : ''}
                          />
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive" aria-hidden="true">
                            *{' '}
                          </span>
                          {strings.MobileNumber}
                        </FormLabel>
                        <PhoneInput
                          country="ae"
                          enableSearch
                          value={field.value}
                          placeholder="Enter Mobile Number"
                          onChange={value => {
                            field.onChange(value);
                            setCheckPhoneNumberParam(value.length !== 12);
                          }}
                          inputClass={fieldState.error ? 'border-destructive' : ''}
                          containerClass="phone-input-container"
                        />
                        {fieldState.error && (
                          <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4 pt-4">
                    <Label className="block font-medium">Company Location Type</Label>
                    <FormField
                      control={form.control}
                      name="isDesignatedZone"
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value ? 'freezone' : 'mainland'}
                          onValueChange={value => field.onChange(value === 'freezone')}
                          className="flex flex-wrap gap-4"
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
                    <FormField
                      control={form.control}
                      name="IsRegistered"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id="IsRegistered"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label="Is VAT registered"
                          />
                          <Label htmlFor="IsRegistered" className="font-normal cursor-pointer">
                            Is VAT Registered?
                          </Label>
                        </div>
                      )}
                    />
                  </div>
                  {isVatRegistered && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      <FormField
                        control={form.control}
                        name="TaxRegistrationNumber"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel htmlFor="trn">
                              <span className="text-destructive" aria-hidden="true">
                                *{' '}
                              </span>
                              {strings.TaxRegistrationNumber}
                            </FormLabel>
                            <Input
                              id="trn"
                              placeholder="Enter TRN (15 digits)"
                              minLength={15}
                              maxLength={15}
                              aria-required="true"
                              aria-invalid={!!fieldState.error}
                              className={`input-transition ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                              {...field}
                              onChange={e => {
                                if (e.target.value === '' || /^[0-9]+$/.test(e.target.value))
                                  field.onChange(e);
                              }}
                            />
                            {fieldState.error && (
                              <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                            )}
                            <a
                              href="https://tax.gov.ae/en/default.aspx"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Verify TRN
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
                              <span className="text-destructive" aria-hidden="true">
                                *{' '}
                              </span>
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
                              placeholderText="Select Date"
                              selected={field.value}
                              onChange={date => field.onChange(date)}
                              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm input-transition ${fieldState.error ? 'border-destructive' : ''}`}
                            />
                            {fieldState.error && (
                              <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </StepContent>

              {/* Step 3: Admin Account */}
              <StepContent isActive={currentStep === 3}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">Super Admin Account</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This account will have full administrative access. Details cannot be changed
                    after registration.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel htmlFor="firstName">
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            {strings.FirstName}
                          </FormLabel>
                          <Input
                            id="firstName"
                            placeholder="Enter First Name"
                            maxLength={100}
                            aria-required="true"
                            aria-invalid={!!fieldState.error}
                            className={`input-transition ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || /^[a-zA-Z ]+$/.test(e.target.value))
                                field.onChange(upperFirst(e.target.value));
                            }}
                          />
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel htmlFor="lastName">
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            {strings.LastName}
                          </FormLabel>
                          <Input
                            id="lastName"
                            placeholder="Enter Last Name"
                            maxLength={100}
                            aria-required="true"
                            aria-invalid={!!fieldState.error}
                            className={`input-transition ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                            {...field}
                            onChange={e => {
                              if (e.target.value === '' || /^[a-zA-Z ]+$/.test(e.target.value))
                                field.onChange(upperFirst(e.target.value));
                            }}
                          />
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">
                          <span className="text-destructive" aria-hidden="true">
                            *{' '}
                          </span>
                          {strings.EmailAddress}
                        </FormLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter Email Address"
                          maxLength={80}
                          autoComplete="email"
                          aria-required="true"
                          aria-invalid={!!fieldState.error}
                          className={`input-transition ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                          {...field}
                        />
                        {fieldState.error && (
                          <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel htmlFor="reg-password">
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            Password
                          </FormLabel>
                          <div className="relative">
                            <Input
                              id="reg-password"
                              type={isPasswordShown ? 'text' : 'password'}
                              placeholder="Create Password"
                              autoComplete="new-password"
                              aria-required="true"
                              aria-invalid={!!fieldState.error}
                              aria-describedby="password-strength"
                              className={`input-transition pr-10 ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                              onPaste={e => e.preventDefault()}
                              onCopy={e => e.preventDefault()}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setIsPasswordShown(!isPasswordShown)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
                              aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                              aria-pressed={isPasswordShown}
                            >
                              {isPasswordShown ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                          <div id="password-strength">
                            <PasswordStrengthMeter password={password} />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel htmlFor="confirmPassword">
                            <span className="text-destructive" aria-hidden="true">
                              *{' '}
                            </span>
                            Confirm Password
                          </FormLabel>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={isConfirmPasswordShown ? 'text' : 'password'}
                              placeholder="Confirm Password"
                              autoComplete="new-password"
                              aria-required="true"
                              aria-invalid={!!fieldState.error}
                              className={`input-transition pr-10 ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                              onPaste={e => e.preventDefault()}
                              onCopy={e => e.preventDefault()}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
                              aria-label={
                                isConfirmPasswordShown ? 'Hide password' : 'Show password'
                              }
                              aria-pressed={isConfirmPasswordShown}
                            >
                              {isConfirmPasswordShown ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {fieldState.error && (
                            <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                          )}
                          {password && confirmPassword && password === confirmPassword && (
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1 animate-fade-in">
                              <CheckCircle2 className="h-3 w-3" /> Passwords match
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </StepContent>

              {/* Navigation */}
              <StepNavigation
                currentStep={currentStep}
                totalSteps={3}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={form.handleSubmit(onSubmit)}
                isSubmitting={loading}
                submitLabel="Create Account"
              />

              <p className="text-center text-xs text-muted-foreground pt-4">
                By registering, you agree to our{' '}
                <a
                  href="https://www.simpleaccounts.io/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
