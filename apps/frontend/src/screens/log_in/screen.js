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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SocialLoginButtons } from '@/components/ui/social-login-buttons';
import { ButtonSpinner, SkeletonCard } from '@/components/ui/loading-spinner';

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
  rememberMe: z.boolean().optional(),
});

const LogIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const version = useSelector(state => state.common.version);

  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [companyCount, setCompanyCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subscriptionMessage, setSubscriptionMessage] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: localStorage.getItem('rememberedEmail') || '',
      password: '',
      rememberMe: !!localStorage.getItem('rememberedEmail'),
    },
  });

  useEffect(() => {
    getInitialData();
  }, []);

  const getInitialData = () => {
    Promise.all([
      dispatch(AuthActions.getCompanyCount())
        .then(response => {
          if (response.data < 1) {
            navigate('/register');
          }
          setCompanyCount(response.data);
        })
        .catch(() => {
          setCompanyCount(0);
        }),
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
        }),
    ]).finally(() => {
      setInitialLoading(false);
    });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const onSubmit = data => {
    setLoading(true);
    const { username, password, rememberMe } = data;

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', username);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

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

  const handleSocialLogin = provider => {
    toast.info(`${provider} login coming soon!`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black p-4 transition-colors duration-300">
      {/* Theme Toggle - Fixed position */}
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="animate-fade-in pt-8" style={{ animationDelay: '200ms' }}>
          {subscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
            <div
              className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md animate-shake"
              role="alert"
              aria-live="polite"
            >
              {subscriptionMessage}
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
              aria-label="Login form"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold" htmlFor="email-input">
                      Email
                    </FormLabel>
                    <Input
                      id="email-input"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-describedby={fieldState.error ? 'email-error' : undefined}
                      aria-invalid={!!fieldState.error}
                      className={`input-transition focus-ring-animate ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
                      {...field}
                    />
                    {fieldState.error && (
                      <FormMessage id="email-error" role="alert">
                        {fieldState.error.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold" htmlFor="password-input">
                      Password
                    </FormLabel>
                    <div className="relative">
                      <Input
                        id="password-input"
                        type={isPasswordShown ? 'text' : 'password'}
                        placeholder="Enter your password"
                        maxLength={255}
                        autoComplete="current-password"
                        aria-describedby={fieldState.error ? 'password-error' : undefined}
                        aria-invalid={!!fieldState.error}
                        className={`input-transition focus-ring-animate pr-10 ${fieldState.error ? 'border-destructive animate-shake' : ''}`}
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
                      <FormMessage id="password-error" role="alert">
                        {fieldState.error.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Remember my email"
                      />
                      <Label
                        htmlFor="remember-me"
                        className="text-sm font-normal cursor-pointer select-none"
                      >
                        Remember me
                      </Label>
                    </div>
                  )}
                />
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-sm"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <ButtonSpinner className="mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogInIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                    Log In
                  </>
                )}
              </Button>

              <SocialLoginButtons
                onGoogleClick={() => handleSocialLogin('Google')}
                onMicrosoftClick={() => handleSocialLogin('Microsoft')}
                disabled={loading}
              />

              {companyCount < 1 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
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
