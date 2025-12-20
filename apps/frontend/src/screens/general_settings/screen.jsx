import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Eye, EyeOff, Send, Save, X, HelpCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Loader, LeavePage } from 'components';
import { CommonActions, AuthActions } from 'services/global';
import * as GeneralSettingActions from './actions';
import config from 'constants/config';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern General Settings Screen
 * Uses functional components, shadcn/ui, and React Hook Form + Zod
 */
function GeneralSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Actions
  const generalSettingActions = useMemo(
    () => bindActionCreators(GeneralSettingActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);
  const authActions = useMemo(() => bindActionCreators(AuthActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [userId, setUserId] = useState(null);
  const [smtpAuth, setSmtpAuth] = useState(false);
  const [smtpEnable, setSmtpEnable] = useState(false);
  const [emailUsed, setEmailUsed] = useState('');

  // Zod schema for validation
  const formSchema = z.object({
    id: z.string().optional(),
    invoiceMailingSubject: z.string().optional(),
    invoicingReferencePattern: z.string().optional(),
    mailingHost: z.string().optional(),
    mailingPort: z.string().optional(),
    mailingUserName: z.string().optional(),
    mailingPassword: z.string().optional(),
    mailingAPIKey: z.string().optional(),
    fromEmailAddress: z.string().email(strings.InvalidEmail).optional().or(z.literal('')),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      invoiceMailingSubject: '',
      invoicingReferencePattern: '',
      mailingHost: '',
      mailingPort: '',
      mailingUserName: '',
      mailingPassword: '',
      mailingAPIKey: '',
      fromEmailAddress: '',
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    generalSettingActions
      .getGeneralSettingDetail()
      .then(res => {
        if (res.status === 200) {
          const data = res.data;
          setValue('id', data.id || '');
          setValue('invoiceMailingSubject', data.invoiceMailingSubject || '');
          setValue('invoicingReferencePattern', data.invoicingReferencePattern || '');
          setValue('mailingHost', data.mailingHost || '');
          setValue('mailingPort', data.mailingPort || '');
          setValue('mailingUserName', data.mailingUserName || '');
          setValue('mailingPassword', data.mailingPassword || '');
          setValue('mailingAPIKey', data.mailingAPIKey || '');
          setValue('fromEmailAddress', data.fromEmailAddress || '');

          setSmtpAuth(data.mailingSmtpAuthorization === 'true');
          setSmtpEnable(data.mailingSmtpStarttlsEnable === 'true');
          setEmailUsed(
            data.loggedInUserEmailFlag
              ? 'loginUser'
              : !data.fromEmailAddress || data.fromEmailAddress === ''
                ? 'defaultEmail'
                : 'anotherEmail'
          );
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        navigate(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
      });
  }, [generalSettingActions, commonActions, navigate, setValue]);

  useEffect(() => {
    initializeData();
    authActions
      .checkAuthStatus()
      .then(res => {
        if (res.status === 200) {
          setUserId(res.data.userId);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        navigate(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
      });
  }, []);

  // Test mail
  const testMail = () => {
    generalSettingActions.getTestUserMailById(userId || 1).then(res => {
      if (res.status === 200) {
        commonActions.tostifyAlert('success', 'Test Mail Sent Successfully');
      }
    });
  };

  // Form submit
  const onSubmit = formData => {
    setLoading(true);
    setDisableLeavePage(true);

    const setLoggedInUserEmail =
      emailUsed === 'DefaultEmailId'
        ? false
        : emailUsed === 'anotherEmail'
          ? false
          : emailUsed === 'loginUser';

    const postData = {
      id: formData.id,
      invoiceMailingBody: '',
      invoiceMailingSubject: formData.invoiceMailingSubject,
      invoicingReferencePattern: formData.invoicingReferencePattern,
      mailingHost: formData.mailingHost,
      mailingPassword: formData.mailingPassword,
      mailingPort: formData.mailingPort,
      mailingSmtpAuthorization: smtpAuth,
      mailingAPIKey: formData.mailingAPIKey,
      mailingSmtpStarttlsEnable: smtpEnable,
      mailingUserName: formData.mailingUserName,
      setLoggedInUserEmail: setLoggedInUserEmail,
      fromEmailAddress: formData.fromEmailAddress || null,
    };

    generalSettingActions
      .updateGeneralSettings(postData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'General Setting Updated Successfully');
          navigate(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Handle email type change
  const handleEmailTypeChange = value => {
    setEmailUsed(value);
    if (value !== 'anotherEmail') {
      setValue('fromEmailAddress', '');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="general-settings-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.GeneralSettings}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h4 className="text-lg font-semibold">{strings.MailConfigurationDetail}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mailing Host */}
                <div className="space-y-2">
                  <Label htmlFor="mailingHost">{strings.MailingHost}</Label>
                  <Input
                    id="mailingHost"
                    placeholder={`${strings.Enter}${strings.MailingHost}`}
                    className="input-transition"
                    {...register('mailingHost')}
                  />
                  {errors.mailingHost && (
                    <p className="text-sm text-destructive">{errors.mailingHost.message}</p>
                  )}
                </div>

                {/* Mailing Port */}
                <div className="space-y-2">
                  <Label htmlFor="mailingPort">{strings.MailingPort}</Label>
                  <Input
                    id="mailingPort"
                    placeholder={`${strings.Enter}${strings.MailingPort}`}
                    className="input-transition"
                    {...register('mailingPort')}
                  />
                  {errors.mailingPort && (
                    <p className="text-sm text-destructive">{errors.mailingPort.message}</p>
                  )}
                </div>

                {/* Mailing Username */}
                <div className="space-y-2">
                  <Label htmlFor="mailingUserName">{strings.MailingUserName}</Label>
                  <Input
                    id="mailingUserName"
                    placeholder={`${strings.Enter}Mailing ${strings.UserName}`}
                    autoComplete="off"
                    className="input-transition"
                    {...register('mailingUserName')}
                  />
                  {errors.mailingUserName && (
                    <p className="text-sm text-destructive">{errors.mailingUserName.message}</p>
                  )}
                </div>

                {/* Mailing Password */}
                <div className="space-y-2">
                  <Label htmlFor="mailingPassword">{strings.MailingPassword}</Label>
                  <div className="relative">
                    <Input
                      id="mailingPassword"
                      type={isPasswordShown ? 'text' : 'password'}
                      placeholder={`${strings.Enter}Mailing ${strings.Password}`}
                      autoComplete="new-password"
                      className="input-transition pr-10"
                      {...register('mailingPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordShown(!isPasswordShown)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {isPasswordShown ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.mailingPassword && (
                    <p className="text-sm text-destructive">{errors.mailingPassword.message}</p>
                  )}
                </div>

                {/* SMTP Authorization */}
                <div className="space-y-2">
                  <Label>{strings.MailingSMTPAuthorization}</Label>
                  <RadioGroup
                    value={smtpAuth ? 'yes' : 'no'}
                    onValueChange={val => setSmtpAuth(val === 'yes')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="smtp-auth-yes" />
                      <Label htmlFor="smtp-auth-yes" className="font-normal cursor-pointer">
                        {strings.Yes}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="smtp-auth-no" />
                      <Label htmlFor="smtp-auth-no" className="font-normal cursor-pointer">
                        {strings.No}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* SMTP TLS Enable */}
                <div className="space-y-2">
                  <Label>{strings.MailingSMTPStartTLSEnable}</Label>
                  <RadioGroup
                    value={smtpEnable ? 'yes' : 'no'}
                    onValueChange={val => setSmtpEnable(val === 'yes')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="smtp-tls-yes" />
                      <Label htmlFor="smtp-tls-yes" className="font-normal cursor-pointer">
                        {strings.Yes}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="smtp-tls-no" />
                      <Label htmlFor="smtp-tls-no" className="font-normal cursor-pointer">
                        {strings.No}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* API Key (conditional) */}
              {smtpAuth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mailingAPIKey">{strings.APIKey}</Label>
                    <Input
                      id="mailingAPIKey"
                      placeholder={`${strings.Enter}${strings.APIKey}`}
                      className="input-transition"
                      {...register('mailingAPIKey')}
                    />
                    {errors.mailingAPIKey && (
                      <p className="text-sm text-destructive">{errors.mailingAPIKey.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Sender Email */}
              <div className="space-y-4">
                <Label>{strings.SenderEmail}</Label>
                <RadioGroup
                  value={emailUsed}
                  onValueChange={handleEmailTypeChange}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="loginUser" id="email-login" />
                    <Label htmlFor="email-login" className="font-normal cursor-pointer">
                      {strings.loginUserEmailId}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anotherEmail" id="email-another" />
                    <Label htmlFor="email-another" className="font-normal cursor-pointer">
                      {strings.AnotherEmailId}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="defaultEmail" id="email-default" />
                    <Label
                      htmlFor="email-default"
                      className="font-normal cursor-pointer flex items-center gap-1"
                    >
                      {strings.DefaultEmailId}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{strings.CompanyRegistrationEmailAddress}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                </RadioGroup>

                {emailUsed === 'anotherEmail' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmailAddress">
                        <span className="text-destructive">* </span>
                        {strings.EmailID}
                      </Label>
                      <Input
                        id="fromEmailAddress"
                        type="email"
                        maxLength={80}
                        placeholder={`${strings.Enter}${strings.EmailID}`}
                        className="input-transition"
                        {...register('fromEmailAddress')}
                      />
                      {errors.fromEmailAddress && (
                        <p className="text-sm text-destructive">
                          {errors.fromEmailAddress.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={testMail}>
                  <Send className="mr-2 h-4 w-4" />
                  {strings.TestMail}
                </Button>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {strings.Save}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      navigate(
                        config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice'
                      )
                    }
                  >
                    <X className="mr-2 h-4 w-4" />
                    {strings.Cancel}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {!disableLeavePage && isDirty && <LeavePage />}
    </div>
  );
}

export default GeneralSettings;
