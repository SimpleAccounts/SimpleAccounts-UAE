import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn as LogInIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { AuthActions } from 'services/global';
import logo from 'assets/images/brand/logo.png';
import config from 'constants/config';

import LocalizedStrings from 'react-localization';
import { data } from 'screens/Language/index';

let strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
});

const LogIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const version = useSelector(state => state.common.version);

  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [companyCount, setCompanyCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    getInitialData();
  }, []);

  const getInitialData = () => {
    dispatch(AuthActions.getCompanyCount())
      .then(response => {
        if (response.data < 1) {
          navigate('/register');
        }
        setCompanyCount(response.data);
      })
      .catch(() => {
        // If API fails (e.g., database not set up), show register button
        setCompanyCount(0);
      });

    dispatch(AuthActions.getUserSubscription())
      .then(action => {
        let message = null;
        if (action && action.type && action.type.includes('fulfilled')) {
          const data = action.payload;
          if (
            (data && data.message && data.message.toLowerCase() === 'active') ||
            (data && data.status && data.status.toLowerCase() === 'active')
          ) {
            message = null;
          } else {
            message = strings.SubscriptionExpiredMessage;
          }
        } else {
          message = strings.SubscriptionFailedMessage;
        }
        setSubscriptionMessage(message);
      })
      .catch(() => {
        setSubscriptionMessage(strings.SubscriptionErrorMessage);
      });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const onSubmit = data => {
    setLoading(true);
    const { username, password } = data;

    dispatch(AuthActions.logIn({ username, password }))
      .then(action => {
        if (action && action.type && action.type.includes('fulfilled')) {
          toast.success('Logged in successfully');
          navigate(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
        } else {
          setLoading(false);
          let errorMessage =
            action?.payload?.message || action?.payload || 'Invalid email or password';
          if (errorMessage === 'Unauthorized') {
            errorMessage = 'Invalid email or password';
          }
          toast.error(errorMessage);
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error('Something went wrong. Please try again.');
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
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your details below to continue</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {subscriptionMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter Email Id"
                      className={fieldState.error ? 'border-destructive' : ''}
                      {...field}
                    />
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Password</FormLabel>
                    <div className="relative">
                      <Input
                        type={isPasswordShown ? 'text' : 'password'}
                        placeholder="Enter password"
                        maxLength={255}
                        className={fieldState.error ? 'border-destructive pr-10' : 'pr-10'}
                        onPaste={e => e.preventDefault()}
                        onCopy={e => e.preventDefault()}
                        {...field}
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
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <LogInIcon className="h-4 w-4 mr-2" />
                {loading ? 'Logging in...' : 'Log In'}
              </Button>

              {companyCount < 1 && (
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 h-auto"
                    onClick={() => navigate('/register')}
                  >
                    Register Here
                  </Button>
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogIn;
