import { useState, useEffect } from 'react';
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
        console.log('[Login] Action received:', action);
        console.log('[Login] Action type:', action?.type);
        console.log('[Login] Includes fulfilled?:', action?.type?.includes('fulfilled'));

        if (action && action.type && action.type.includes('fulfilled')) {
          const targetRoute = config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE;
          console.log('[Login] Login successful! Navigating to:', targetRoute);
          console.log(
            '[Login] AccessToken in localStorage:',
            !!localStorage.getItem('accessToken')
          );

          toast.success('Logged in successfully');
          navigate(targetRoute);

          console.log('[Login] Navigate called');
        } else {
          setLoading(false);
          console.log('[Login] Login failed:', action?.payload);
          let errorMessage =
            action?.payload?.message || action?.payload || 'Invalid email or password';
          if (errorMessage === 'Unauthorized') {
            errorMessage = 'Invalid email or password';
          }
          toast.error(errorMessage);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('[Login] Login error:', error);
        toast.error('Something went wrong. Please try again.');
      });
  };

  const handleSocialLogin = provider => {
    toast.info(`${provider} login coming soon!`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neu-bg dark:bg-neu-bg-dark p-4">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neu-bg dark:bg-neu-bg-dark p-4 transition-colors duration-300">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-slide-up shadow-neu-out dark:shadow-neu-out-dark bg-neu-bg dark:bg-neu-bg-dark border-none rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center animate-fade-in">
            <img src={logo} alt="SimpleAccounts Logo" className="h-16 w-auto drop-shadow-sm" />
          </div>
          <div className="animate-fade-in space-y-2" style={{ animationDelay: '100ms' }}>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground/80">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="animate-fade-in px-8 pb-10" style={{ animationDelay: '200ms' }}>
          {subscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
            <div
              className="mb-6 p-3 shadow-neu-in dark:shadow-neu-in-dark bg-neu-bg dark:bg-neu-bg-dark text-destructive text-sm rounded-xl animate-shake text-center font-medium"
              role="alert"
              aria-live="polite"
            >
              {subscriptionMessage}
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
              aria-label="Login form"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-bold ml-1" htmlFor="email-input">
                      Email
                    </FormLabel>
                    <Input
                      id="email-input"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-describedby={fieldState.error ? 'email-error' : undefined}
                      aria-invalid={!!fieldState.error}
                      className={`h-12 rounded-xl bg-neu-bg dark:bg-neu-bg-dark border-none shadow-neu-in dark:shadow-neu-in-dark focus:ring-0 focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-300 ${fieldState.error ? 'text-destructive placeholder:text-destructive/50' : ''}`}
                      {...field}
                    />
                    {fieldState.error && (
                      <FormMessage id="email-error" role="alert" className="ml-1">
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
                    <FormLabel className="font-bold ml-1" htmlFor="password-input">
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
                        className={`h-12 rounded-xl bg-neu-bg dark:bg-neu-bg-dark border-none shadow-neu-in dark:shadow-neu-in-dark pr-12 focus:ring-0 focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-300 ${fieldState.error ? 'text-destructive placeholder:text-destructive/50' : ''}`}
                        onPaste={e => e.preventDefault()}
                        onCopy={e => e.preventDefault()}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none p-2 rounded-full active:shadow-neu-in dark:active:shadow-neu-in-dark"
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
                      <FormMessage id="password-error" role="alert" className="ml-1">
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
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none"
                      onClick={() => field.onChange(!field.value)}
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={field.value}
                        aria-label="Remember my email"
                        onClick={e => {
                          e.stopPropagation();
                          field.onChange(!field.value);
                        }}
                        style={{
                          background: field.value
                            ? 'linear-gradient(145deg, var(--primary), hsl(var(--primary) / 0.8))'
                            : 'var(--neu-bg, #e8eef5)',
                          boxShadow: field.value
                            ? '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)'
                            : 'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                        className="relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none border-0"
                      >
                        <span
                          style={{
                            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                            boxShadow:
                              '2px 2px 4px rgba(0,0,0,0.1), -1px -1px 3px rgba(255,255,255,0.8)',
                            borderRadius: '9999px',
                          }}
                          className={`pointer-events-none inline-block h-6 w-6 transform ring-0 transition-all duration-300 ease-in-out ${
                            field.value ? 'translate-x-9' : 'translate-x-1'
                          } mt-1`}
                        />
                      </button>
                      <Label
                        htmlFor="remember-me"
                        className="text-sm font-medium cursor-pointer text-foreground"
                      >
                        Remember me
                      </Label>
                    </div>
                  )}
                />
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-sm text-primary font-semibold hover:text-primary/80"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-neu-out dark:shadow-neu-out-dark hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-neu-in dark:active:shadow-neu-in-dark transition-all duration-200"
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
                    <LogInIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Log In
                  </>
                )}
              </Button>

              <div className="relative mt-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neu-bg dark:bg-neu-bg-dark px-2 text-muted-foreground font-semibold">
                    Or continue with
                  </span>
                </div>
              </div>

              <SocialLoginButtons
                onGoogleClick={() => handleSocialLogin('Google')}
                onMicrosoftClick={() => handleSocialLogin('Microsoft')}
                disabled={loading}
              />

              {companyCount < 1 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Don&apos;t have an account?</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-xl border-primary/50 text-primary hover:bg-primary/5 hover:text-primary shadow-neu-out dark:shadow-neu-out-dark hover:shadow-neu-in dark:hover:shadow-neu-in-dark transition-all"
                    onClick={() => navigate('/register')}
                  >
                    Register Here
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogIn;
