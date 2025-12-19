import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ButtonSpinner } from '@/components/ui/loading-spinner';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';

import { api } from 'utils';
import logo from 'assets/images/brand/logo.png';

// Password validation regex: 8+ chars, uppercase, lowercase, number, special char
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// Zod validation schema
const resetNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password must be at most 255 characters')
      .regex(passwordRegex, 'Password must meet all requirements'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ResetNewPassword = ({ token }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetNewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordShown(!isConfirmPasswordShown);
  };

  const onSubmit = data => {
    setLoading(true);
    setAlert(null);

    const apiData = {
      method: 'post',
      url: '/public/resetPassword',
      data: {
        password: data.password,
        token: token,
      },
    };

    api(apiData)
      .then(res => {
        if (res.status === 200) {
          setSuccess(true);
          toast.success('Password reset successfully!');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      })
      .catch(() => {
        setAlert({
          type: 'error',
          message: 'The password reset link has expired. Please request a new one.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-slide-up shadow-lg dark:shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center animate-fade-in">
            <img src={logo} alt="SimpleAccounts Logo" className="h-16 w-auto" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardTitle className="text-2xl">
              {success ? 'Password Reset!' : 'Create New Password'}
            </CardTitle>
            <CardDescription>
              {success
                ? 'Your password has been successfully reset'
                : 'Please enter your new password below'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              {alert && (
                <Alert
                  className="mb-4 bg-destructive/10 text-destructive border-destructive/20 animate-shake"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertDescription>
                    {alert.message}{' '}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-destructive underline"
                      onClick={() => navigate('/reset-password')}
                    >
                      Request new link
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                  aria-label="Create new password form"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-semibold" htmlFor="new-password">
                          <span className="text-destructive" aria-hidden="true">
                            *{' '}
                          </span>
                          New Password
                        </FormLabel>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={isPasswordShown ? 'text' : 'password'}
                            placeholder="Enter new password"
                            minLength={8}
                            maxLength={255}
                            autoComplete="new-password"
                            aria-required="true"
                            aria-describedby="password-requirements"
                            aria-invalid={!!fieldState.error}
                            className={`input-transition focus-ring-animate pr-10 ${fieldState.error ? 'border-destructive' : ''}`}
                            onPaste={e => e.preventDefault()}
                            onCopy={e => e.preventDefault()}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                            aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                            aria-pressed={isPasswordShown}
                          >
                            {isPasswordShown ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {fieldState.error && (
                          <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                        )}
                        <div id="password-requirements">
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
                        <FormLabel className="font-semibold" htmlFor="confirm-password">
                          <span className="text-destructive" aria-hidden="true">
                            *{' '}
                          </span>
                          Confirm Password
                        </FormLabel>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={isConfirmPasswordShown ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            minLength={8}
                            maxLength={255}
                            autoComplete="new-password"
                            aria-required="true"
                            aria-invalid={!!fieldState.error}
                            className={`input-transition focus-ring-animate pr-10 ${fieldState.error ? 'border-destructive' : ''}`}
                            onPaste={e => e.preventDefault()}
                            onCopy={e => e.preventDefault()}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                            aria-label={isConfirmPasswordShown ? 'Hide password' : 'Show password'}
                            aria-pressed={isConfirmPasswordShown}
                          >
                            {isConfirmPasswordShown ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {fieldState.error && (
                          <FormMessage role="alert">{fieldState.error.message}</FormMessage>
                        )}
                        {password && confirmPassword && password === confirmPassword && (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1 animate-fade-in">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Passwords match
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner className="mr-2" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 mr-2" aria-hidden="true" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetNewPassword;
