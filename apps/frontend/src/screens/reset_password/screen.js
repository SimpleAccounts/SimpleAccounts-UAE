import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ButtonSpinner } from '@/components/ui/loading-spinner';

import { api } from 'utils';
import logo from 'assets/images/brand/logo.png';
import ResetNewPassword from './sections/reset_new_password';

// Zod validation schema
const resetPasswordSchema = z.object({
  username: z.string().min(1, 'Email address is required').email('Invalid email address'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = data => {
    setLoading(true);
    setAlert(null);

    const apiData = {
      method: 'post',
      url: '/public/forgotPassword',
      data: { username: data.username, url: window.location.href },
    };

    api(apiData)
      .then(() => {
        setAlert({
          type: 'success',
          message: 'We have sent you a verification email. Please check your mailbox.',
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch(() => {
        setAlert({
          type: 'error',
          message: 'Invalid email address or account not found.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // If token exists, show the new password form
  if (token) {
    return <ResetNewPassword token={token} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-slide-up shadow-2xl shadow-blue-900/5 dark:shadow-blue-900/20 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-6 text-center pb-8 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex justify-center animate-fade-in">
            <img src={logo} alt="SimpleAccounts Logo" className="h-20 w-auto drop-shadow-sm" />
          </div>
          <div className="animate-fade-in space-y-2" style={{ animationDelay: '100ms' }}>
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-base">
              Enter your email address and we&apos;ll send you a link to reset your password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="animate-fade-in pt-8" style={{ animationDelay: '200ms' }}>
          {alert && (
            <Alert
              className={`mb-4 animate-fade-in ${
                alert.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
              role="alert"
              aria-live="polite"
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
              aria-label="Reset password form"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold" htmlFor="reset-email">
                      <span className="text-destructive" aria-hidden="true">
                        *{' '}
                      </span>
                      Email Address
                    </FormLabel>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      aria-required="true"
                      aria-describedby={fieldState.error ? 'reset-email-error' : undefined}
                      aria-invalid={!!fieldState.error}
                      className={`input-transition focus-ring-animate ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                      {...field}
                    />
                    {fieldState.error && (
                      <FormMessage id="reset-email-error" role="alert">
                        {fieldState.error.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <ButtonSpinner className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                      Send Reset Link
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate('/login')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
