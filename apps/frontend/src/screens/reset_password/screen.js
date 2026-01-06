import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-corp-bg-secondary p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-slide-up bg-white border border-corp-border-light shadow-corp-lg rounded-xl overflow-hidden">
        <CardHeader className="space-y-6 text-center pb-8 border-b border-corp-border-light">
          <div className="flex justify-center animate-fade-in">
            <img src={logo} alt="SimpleAccounts Logo" className="h-16 w-auto" />
          </div>
          <div className="animate-fade-in space-y-2" style={{ animationDelay: '100ms' }}>
            <CardTitle className="text-3xl font-bold tracking-tight text-corp-text-primary">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-base text-corp-text-secondary">
              Enter your email address and we&apos;ll send you a link to reset your password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="animate-fade-in pt-8" style={{ animationDelay: '200ms' }}>
          {alert && (
            <Alert
              className={`mb-4 animate-fade-in ${
                alert.type === 'success'
                  ? 'bg-corp-success-light text-corp-success border-corp-success/20'
                  : 'bg-corp-danger-light text-corp-danger border-corp-danger/20'
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
                    <FormLabel
                      className="font-semibold text-corp-text-primary"
                      htmlFor="reset-email"
                    >
                      <span className="text-corp-danger" aria-hidden="true">
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
                      className={`h-11 rounded-lg bg-white border border-corp-border-light focus:border-corp-primary focus:ring-2 focus:ring-corp-primary/10 transition-all duration-200 ${fieldState.error ? 'border-corp-danger text-corp-danger animate-shake' : ''}`}
                      {...field}
                    />
                    {fieldState.error && (
                      <FormMessage id="reset-email-error" role="alert" className="text-corp-danger">
                        {fieldState.error.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-lg bg-corp-primary text-white font-semibold hover:bg-corp-primary-hover active:scale-[0.98] transition-all duration-200"
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
                  className="flex-1 h-11 rounded-lg border-corp-border-light text-corp-text-secondary hover:bg-corp-bg-hover hover:border-corp-border-medium transition-all duration-200"
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
