import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import PasswordChecklist from 'react-password-checklist';
import { upperFirst } from 'lodash-es';
import { User, Building2, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

import { Loader, ImageUploader } from 'components';
import { selectOptionsFactory, cryptoService, selectCurrencyFactory } from 'utils';
import dayjs from '@/utils/date';

import * as ProfileActions from './actions';
import { CommonActions, AuthActions } from 'services/global';
import config from 'constants/config';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';
import './style.scss';

const strings = new LocalizedStrings(data);

// Zod schemas
const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
  timezone: z.string().min(1, 'Time zone is required'),
  dob: z.date().nullable().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const companyProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyRegistrationNumber: z.string().optional(),
  vatRegistrationNumber: z.string().optional(),
  isRegisteredVat: z.boolean().optional(),
  companyTypeCode: z.string().optional(),
  industryTypeCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().optional(),
  currencyCode: z.number().min(1, 'Currency is required'),
  // Invoicing address
  invoicingAddressLine1: z.string().optional(),
  invoicingAddressLine2: z.string().optional(),
  invoicingAddressLine3: z.string().optional(),
  invoicingCity: z.string().optional(),
  invoicingStateRegion: z.string().optional(),
  invoicingPostZipCode: z.string().optional(),
  invoicingPoBoxNumber: z.string().optional(),
  invoicingCountryCode: z.number().optional(),
  // Company address
  companyAddressLine1: z.string().optional(),
  companyAddressLine2: z.string().optional(),
  companyAddressLine3: z.string().optional(),
  companyCity: z.string().optional(),
  companyStateRegion: z.string().optional(),
  companyPostZipCode: z.string().optional(),
  companyPoBoxNumber: z.string().optional(),
  companyCountryCode: z.number().optional(),
  companyStateCode: z.string().optional(),
  // Other
  companyExpenseBudget: z.string().optional(),
  companyRevenueBudget: z.string().optional(),
  dateFormat: z.string().optional(),
  telephoneNumber: z.string().optional(),
  fax: z.string().optional(),
});

// Custom select styles for dark mode
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    '&:hover': {
      borderColor: 'hsl(var(--primary))',
    },
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
  }),
  singleValue: base => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  input: base => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
};

/**
 * Modern Profile Screen
 * Uses functional components, shadcn/ui, React Hook Form + Zod
 */
function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const currency_list = useSelector(state => state.profile.currency_list);
  const country_list = useSelector(state => state.profile.country_list);
  const role_list = useSelector(state => state.profile.role_list);
  const invoicing_state_list = useSelector(state => state.profile.invoicing_state_list);
  const company_state_list = useSelector(state => state.profile.company_state_list);

  // Actions
  const profileActions = useMemo(() => bindActionCreators(ProfileActions, dispatch), [dispatch]);
  const authActions = useMemo(() => bindActionCreators(AuthActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [activeTab, setActiveTab] = useState('account');

  // User state
  const [userId, setUserId] = useState('');
  const [userPhoto, setUserPhoto] = useState([]);
  const [userPhotoFile, setUserPhotoFile] = useState([]);
  const [userPhotoChange, setUserPhotoChange] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(false);
  const [timezone, setTimezone] = useState([]);
  const [companyTypeList, setCompanyTypeList] = useState([]);

  // Company state
  const [companyLogo, setCompanyLogo] = useState([]);
  const [companyLogoFile, setCompanyLogoFile] = useState([]);
  const [companyLogoChange, setCompanyLogoChange] = useState(false);
  const [isVatEditable, setIsVatEditable] = useState(true);
  const [isSame, setIsSame] = useState(false);
  const [companyDataLoaded, setCompanyDataLoaded] = useState(false);

  // Password state
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [displayRules, setDisplayRules] = useState(false);

  // Form instances
  const userForm = useForm({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
      timezone: '',
      dob: null,
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const companyForm = useForm({
    resolver: zodResolver(companyProfileSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      companyRegistrationNumber: '',
      vatRegistrationNumber: '',
      isRegisteredVat: false,
      companyTypeCode: '',
      industryTypeCode: '',
      phoneNumber: '',
      emailAddress: '',
      website: '',
      currencyCode: 0,
      invoicingAddressLine1: '',
      invoicingAddressLine2: '',
      invoicingAddressLine3: '',
      invoicingCity: '',
      invoicingStateRegion: '',
      invoicingPostZipCode: '',
      invoicingPoBoxNumber: '',
      invoicingCountryCode: 0,
      companyAddressLine1: '',
      companyAddressLine2: '',
      companyAddressLine3: '',
      companyCity: '',
      companyStateRegion: '',
      companyPostZipCode: '',
      companyPoBoxNumber: '',
      companyCountryCode: 229,
      companyStateCode: '',
      companyExpenseBudget: '',
      companyRevenueBudget: '',
      dateFormat: '',
      telephoneNumber: '',
      fax: '',
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Get user data
  const getUserData = useCallback(async () => {
    try {
      // Get timezone list
      const tzResponse = await authActions.getTimeZoneList();
      const tzOptions = tzResponse.data.map(value => ({ label: value, value: value }));
      setTimezone(tzOptions);

      // Get user by ID
      const userIdFromStorage = cryptoService.decryptService('userId');
      if (userIdFromStorage) {
        setLoading(true);
        const res = await profileActions.getUserById(userIdFromStorage);

        // Load supporting data
        profileActions.getCurrencyList();
        profileActions.getCountryList();
        profileActions.getCompanyTypeList();
        profileActions.getRoleList();

        if (res.status === 200) {
          const userData = res.data;
          userForm.reset({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            roleId: userData.roleId?.toString() || '',
            timezone: userData.timeZone || '',
            dob: userData.dob ? dayjs(userData.dob, 'DD-MM-YYYY').toDate() : null,
          });
          setUserId(userData.id || '');
          setSelectedStatus(userData.active || false);
          if (userData.profilePicByteArray) {
            setUserPhoto([userData.profilePicByteArray]);
          }
          setLoading(false);
        }
      }
    } catch (err) {
      commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      setLoading(false);
    }
  }, [profileActions, authActions, commonActions, userForm]);

  // Get company data
  const getCompanyData = useCallback(async () => {
    if (companyDataLoaded) return;

    try {
      setLoading(true);
      const res = await profileActions.getCompanyById();

      if (res.status === 200) {
        const data = res.data;
        companyForm.reset({
          companyName: data.companyName || '',
          companyRegistrationNumber: data.companyRegistrationNumber || '',
          vatRegistrationNumber: data.vatRegistrationNumber || '',
          isRegisteredVat: data.isRegisteredVat || false,
          companyTypeCode: data.companyTypeCode?.toString() || '',
          industryTypeCode: data.industryTypeCode?.toString() || '',
          phoneNumber: data.phoneNumber || '',
          emailAddress: data.emailAddress || '',
          website: data.website || '',
          currencyCode: data.currencyCode || 0,
          invoicingAddressLine1: data.invoicingAddressLine1 || '',
          invoicingAddressLine2: data.invoicingAddressLine2 || '',
          invoicingAddressLine3: data.invoicingAddressLine3 || '',
          invoicingCity: data.invoicingCity || '',
          invoicingStateRegion: data.invoicingStateRegion || '',
          invoicingPostZipCode: data.invoicingPostZipCode || '',
          invoicingPoBoxNumber: data.invoicingPoBoxNumber || '',
          invoicingCountryCode: data.invoicingCountryCode || 0,
          companyAddressLine1: data.companyAddressLine1 || '',
          companyAddressLine2: data.companyAddressLine2 || '',
          companyAddressLine3: data.companyAddressLine3 || '',
          companyCity: data.companyCity || '',
          companyStateRegion: data.companyStateRegion || '',
          companyPostZipCode: data.companyPostZipCode || '',
          companyPoBoxNumber: data.companyPoBoxNumber || '',
          companyCountryCode: data.companyCountryCode || 229,
          companyStateCode: data.companyStateCode || '',
          companyExpenseBudget: data.companyExpenseBudget?.toString() || '',
          companyRevenueBudget: data.companyRevenueBudget?.toString() || '',
          dateFormat: data.dateFormat || '',
          telephoneNumber: data.telephoneNumber || '',
          fax: data.fax || '',
        });

        setIsVatEditable(data.isVatEditable);
        setIsSame(data.isSame || false);
        if (data.companyLogoByteArray) {
          setCompanyLogo([data.companyLogoByteArray]);
        }
        setCompanyDataLoaded(true);

        // Load state lists
        if (data.invoicingCountryCode) {
          profileActions.getStateList(data.invoicingCountryCode, 'invoicing');
        }
        if (data.companyCountryCode) {
          profileActions.getStateList(data.companyCountryCode, 'company');
        }
      }
      setLoading(false);
    } catch (err) {
      commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      setLoading(false);
    }
  }, [profileActions, commonActions, companyForm, companyDataLoaded]);

  useEffect(() => {
    getUserData();
    profileActions.getCompanyTypeList2().then(res => {
      if (res.status === 200) {
        setCompanyTypeList(res.data);
      }
    });
  }, []);

  // Tab change handler
  const handleTabChange = value => {
    setActiveTab(value);
    if (value === 'company' && !companyDataLoaded) {
      getCompanyData();
    }
  };

  // Upload handlers
  const uploadUserImage = (picture, file) => {
    setUserPhoto(picture);
    setUserPhotoFile(file);
    setUserPhotoChange(true);
  };

  const uploadCompanyImage = (picture, file) => {
    setCompanyLogo(picture);
    setCompanyLogoFile(file);
    setCompanyLogoChange(true);
  };

  // Submit handlers
  const handleUserSubmit = async data => {
    const formData = new FormData();
    formData.append('id', userId);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('dob', data.dob ? dayjs(data.dob).format('DD-MM-YYYY') : '');
    formData.append('active', selectedStatus);
    formData.append('timeZone', data.timezone);
    formData.append('roleId', data.roleId);
    formData.append('userPhotoChange', userPhotoChange);

    if (userPhotoFile.length > 0) {
      formData.append('profilePic', userPhotoFile[0]);
    }

    setLoading(true);
    setLoadingMsg('Updating User Profile...');

    try {
      const res = await profileActions.updateUser(formData);
      if (res.status === 200) {
        commonActions.tostifyAlert('success', 'Profile Updated Successfully');
        await authActions.checkAuthStatus();
        navigate(config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice');
      }
    } catch (err) {
      commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async data => {
    const formData = new FormData();
    formData.append('id', userId);
    formData.append('password', data.password);
    formData.append('currentPassword', data.currentPassword);
    formData.append('confirmPassword', data.confirmPassword);

    setLoading(true);
    setLoadingMsg('Updating Password...');

    try {
      const res = await profileActions.updateUser(formData);
      if (res.status === 200) {
        commonActions.tostifyAlert('success', 'Password Updated Successfully');
        passwordForm.reset();
        setDisplayRules(false);
      }
    } catch (err) {
      commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async data => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key] ?? '');
    });
    formData.append('isSame', isSame);
    formData.append('companyLogoChange', companyLogoChange);

    if (companyLogoFile.length > 0) {
      formData.append('companyLogo', companyLogoFile[0]);
    }

    setLoading(true);
    setLoadingMsg('Updating Company Profile...');

    try {
      const res = await profileActions.updateCompany(formData);
      if (res.status === 200) {
        commonActions.tostifyAlert('success', 'Company Profile Updated Successfully');
      }
    } catch (err) {
      commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="profile-screen">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">{strings.Profile}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {strings.Account}
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {strings.CompanyProfile}
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {strings.PasswordSettings}
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account">
              <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Profile Photo */}
                  <div className="lg:col-span-1">
                    <Label className="mb-2 block font-semibold">{strings.ProfilePhoto}</Label>
                    <ImageUploader
                      images={userPhoto}
                      uploadImage={uploadUserImage}
                      removeImage={() => {
                        setUserPhoto([]);
                        setUserPhotoFile([]);
                        setUserPhotoChange(true);
                      }}
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-semibold">
                        <span className="text-destructive">* </span>
                        {strings.FirstName}
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Enter First Name"
                        className="input-transition"
                        {...userForm.register('firstName')}
                      />
                      {userForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive">
                          {userForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="font-semibold">
                        <span className="text-destructive">* </span>
                        {strings.LastName}
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Enter Last Name"
                        className="input-transition"
                        {...userForm.register('lastName')}
                      />
                      {userForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive">
                          {userForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold">
                        <span className="text-destructive">* </span>
                        {strings.Email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter Email"
                        className="input-transition"
                        {...userForm.register('email')}
                      />
                      {userForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {userForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">
                        <span className="text-destructive">* </span>
                        {strings.Role}
                      </Label>
                      <Controller
                        name="roleId"
                        control={userForm.control}
                        render={({ field }) => (
                          <Select
                            styles={selectStyles}
                            placeholder={strings.SelectRole}
                            options={selectOptionsFactory.renderOptions(
                              'label',
                              'value',
                              role_list,
                              'Role'
                            )}
                            value={role_list.find(r => r.value?.toString() === field.value) || null}
                            onChange={option => field.onChange(option?.value?.toString() || '')}
                          />
                        )}
                      />
                      {userForm.formState.errors.roleId && (
                        <p className="text-sm text-destructive">
                          {userForm.formState.errors.roleId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">
                        <span className="text-destructive">* </span>
                        {strings.TimeZone}
                      </Label>
                      <Controller
                        name="timezone"
                        control={userForm.control}
                        render={({ field }) => (
                          <Select
                            styles={selectStyles}
                            placeholder={strings.SelectTimeZone}
                            options={timezone}
                            value={timezone.find(tz => tz.value === field.value) || null}
                            onChange={option => field.onChange(option?.value || '')}
                          />
                        )}
                      />
                      {userForm.formState.errors.timezone && (
                        <p className="text-sm text-destructive">
                          {userForm.formState.errors.timezone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">{strings.DateOfBirth}</Label>
                      <Controller
                        name="dob"
                        control={userForm.control}
                        render={({ field }) => (
                          <DatePicker
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm input-transition"
                            placeholderText="Select Date of Birth"
                            selected={field.value}
                            onChange={field.onChange}
                            dateFormat="dd-MM-yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            maxDate={new Date()}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    className="transition-all duration-200 hover:scale-[1.02]"
                    disabled={userForm.formState.isSubmitting}
                  >
                    {userForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {strings.Save}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Company Profile Tab */}
            <TabsContent value="company">
              <form onSubmit={companyForm.handleSubmit(handleCompanySubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Company Logo */}
                  <div className="lg:col-span-1">
                    <Label className="mb-2 block font-semibold">{strings.CompanyLogo}</Label>
                    <ImageUploader
                      images={companyLogo}
                      uploadImage={uploadCompanyImage}
                      removeImage={() => {
                        setCompanyLogo([]);
                        setCompanyLogoFile([]);
                        setCompanyLogoChange(true);
                      }}
                    />
                  </div>

                  {/* Company Details */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold">
                          <span className="text-destructive">* </span>
                          {strings.CompanyName}
                        </Label>
                        <Input
                          placeholder="Enter Company Name"
                          className="input-transition"
                          {...companyForm.register('companyName')}
                        />
                        {companyForm.formState.errors.companyName && (
                          <p className="text-sm text-destructive">
                            {companyForm.formState.errors.companyName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">{strings.CompanyRegistrationNumber}</Label>
                        <Input
                          placeholder="Enter Registration Number"
                          className="input-transition"
                          {...companyForm.register('companyRegistrationNumber')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">{strings.VATRegistrationNumber}</Label>
                        <Input
                          placeholder="Enter VAT Number"
                          className="input-transition"
                          disabled={!isVatEditable}
                          {...companyForm.register('vatRegistrationNumber')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">
                          <span className="text-destructive">* </span>
                          {strings.Currency}
                        </Label>
                        <Controller
                          name="currencyCode"
                          control={companyForm.control}
                          render={({ field }) => (
                            <Select
                              styles={selectStyles}
                              placeholder={strings.SelectCurrency}
                              options={selectCurrencyFactory.renderOptions(
                                'currencyName',
                                'currencyCode',
                                currency_list,
                                'Currency'
                              )}
                              value={
                                currency_list.find(c => c.currencyCode === field.value) || null
                              }
                              onChange={option => field.onChange(option?.currencyCode || 0)}
                              getOptionLabel={opt =>
                                opt.currencyName || opt.label || `${opt.currencyCode}`
                              }
                              getOptionValue={opt => opt.currencyCode || opt.value}
                            />
                          )}
                        />
                        {companyForm.formState.errors.currencyCode && (
                          <p className="text-sm text-destructive">
                            {companyForm.formState.errors.currencyCode.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">{strings.PhoneNumber}</Label>
                        <Controller
                          name="phoneNumber"
                          control={companyForm.control}
                          render={({ field }) => (
                            <PhoneInput
                              country="ae"
                              value={field.value}
                              onChange={field.onChange}
                              inputClass="!w-full input-transition"
                              containerClass="phone-input-container"
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">{strings.Email}</Label>
                        <Input
                          type="email"
                          placeholder="Enter Email"
                          className="input-transition"
                          {...companyForm.register('emailAddress')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">{strings.Website}</Label>
                        <Input
                          placeholder="Enter Website"
                          className="input-transition"
                          {...companyForm.register('website')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">{strings.CompanyType}</Label>
                        <Controller
                          name="companyTypeCode"
                          control={companyForm.control}
                          render={({ field }) => (
                            <Select
                              styles={selectStyles}
                              placeholder={strings.SelectCompanyType}
                              options={selectOptionsFactory.renderOptions(
                                'label',
                                'value',
                                companyTypeList,
                                'Company Type'
                              )}
                              value={
                                companyTypeList.find(c => c.value?.toString() === field.value) ||
                                null
                              }
                              onChange={option => field.onChange(option?.value?.toString() || '')}
                            />
                          )}
                        />
                      </div>
                    </div>

                    {/* Invoicing Address Section */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-4">{strings.InvoicingAddress}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold">{strings.AddressLine1}</Label>
                          <Input
                            placeholder="Address Line 1"
                            className="input-transition"
                            {...companyForm.register('invoicingAddressLine1')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">{strings.AddressLine2}</Label>
                          <Input
                            placeholder="Address Line 2"
                            className="input-transition"
                            {...companyForm.register('invoicingAddressLine2')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">{strings.City}</Label>
                          <Input
                            placeholder="City"
                            className="input-transition"
                            {...companyForm.register('invoicingCity')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">{strings.Country}</Label>
                          <Controller
                            name="invoicingCountryCode"
                            control={companyForm.control}
                            render={({ field }) => (
                              <Select
                                styles={selectStyles}
                                placeholder={strings.SelectCountry}
                                options={selectOptionsFactory.renderOptions(
                                  'label',
                                  'value',
                                  country_list,
                                  'Country'
                                )}
                                value={country_list.find(c => c.value === field.value) || null}
                                onChange={option => {
                                  field.onChange(option?.value || 0);
                                  if (option?.value) {
                                    profileActions.getStateList(option.value, 'invoicing');
                                  }
                                }}
                              />
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">{strings.PostalCode}</Label>
                          <Input
                            placeholder="Postal Code"
                            className="input-transition"
                            {...companyForm.register('invoicingPostZipCode')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    className="transition-all duration-200 hover:scale-[1.02]"
                    disabled={companyForm.formState.isSubmitting}
                  >
                    {companyForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {strings.Save}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Password Settings Tab */}
            <TabsContent value="password">
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="max-w-md space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="font-semibold">
                      <span className="text-destructive">* </span>
                      {strings.CurrentPassword}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter Current Password"
                      className="input-transition"
                      {...passwordForm.register('currentPassword')}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold">
                      <span className="text-destructive">* </span>
                      {strings.NewPassword}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={isPasswordShown ? 'text' : 'password'}
                        placeholder="Enter New Password"
                        className="pr-10 input-transition"
                        {...passwordForm.register('password', {
                          onChange: e => setDisplayRules(e.target.value.length > 0),
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordShown(!isPasswordShown)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isPasswordShown ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                    {displayRules && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                        <PasswordChecklist
                          rules={['maxLength', 'minLength', 'specialChar', 'number', 'capital']}
                          minLength={8}
                          maxLength={255}
                          value={passwordForm.watch('password')}
                          valueAgain={passwordForm.watch('confirmPassword')}
                          className="password-checklist"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-semibold">
                      <span className="text-destructive">* </span>
                      {strings.ConfirmPassword}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm New Password"
                      className="input-transition"
                      {...passwordForm.register('confirmPassword')}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                    {displayRules && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                        <PasswordChecklist
                          rules={['match']}
                          minLength={8}
                          value={passwordForm.watch('password')}
                          valueAgain={passwordForm.watch('confirmPassword')}
                          className="password-checklist"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="transition-all duration-200 hover:scale-[1.02]"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        {strings.UpdatePassword}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
