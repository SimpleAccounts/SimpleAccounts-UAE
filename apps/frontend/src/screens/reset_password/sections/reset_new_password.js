import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import PasswordChecklist from 'react-password-checklist';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      .regex(
        passwordRegex,
        'Must contain 8 characters, one uppercase, one lowercase, one number and one special character'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

const ResetNewPassword = ({ token }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetNewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown);
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
          setAlert({
            type: 'success',
            message: 'Password reset successfully.',
          });
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      })
      .catch(() => {
        setAlert({
          type: 'error',
          message:
            "Email verification link is expired. Please enter your email address and we'll send another verification link.",
          link: '/reset-password',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="logo" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {alert && (
            <Alert
              className={`mb-4 ${alert.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
            >
              <AlertDescription>
                {alert.message}
                {alert.link && (
                  <Button
                    variant="link"
                    className="h-auto p-0 ml-1 text-destructive"
                    onClick={() => navigate(alert.link)}
                  >
                    Click here
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      <span className="text-destructive">* </span>Password
                    </FormLabel>
                    <div className="relative">
                      <Input
                        type={isPasswordShown ? 'text' : 'password'}
                        placeholder="Enter new password"
                        minLength={8}
                        maxLength={255}
                        autoComplete="new-password"
                        className={fieldState.error ? 'border-destructive pr-10' : 'pr-10'}
                        onPaste={e => e.preventDefault()}
                        onCopy={e => e.preventDefault()}
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          setShowRules(e.target.value !== '');
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
                    {showRules && (
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      <span className="text-destructive">* </span>Confirm Password
                    </FormLabel>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      minLength={8}
                      maxLength={255}
                      autoComplete="new-password"
                      className={fieldState.error ? 'border-destructive' : ''}
                      onPaste={e => e.preventDefault()}
                      onCopy={e => e.preventDefault()}
                      {...field}
                    />
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                    {showRules && (
                      <div className="mt-2">
                        <PasswordChecklist
                          rules={['match']}
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

              <Button type="submit" className="w-full" disabled={loading}>
                <KeyRound className="h-4 w-4 mr-2" />
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetNewPassword;
