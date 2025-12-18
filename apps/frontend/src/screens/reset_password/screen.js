import React, { useState, useEffect } from 'react';
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
        }, 1500);
      })
      .catch(() => {
        setAlert({
          type: 'error',
          message: 'Invalid email address',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="logo" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a verification link
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {alert && (
            <Alert
              className={`mb-4 ${alert.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      <span className="text-destructive">* </span>Email Address
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="Please enter your email address"
                      className={fieldState.error ? 'border-destructive' : ''}
                      {...field}
                    />
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Verification Email'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/login')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
