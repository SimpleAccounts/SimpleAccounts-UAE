import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn as LogInIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import logo from 'assets/images/brand/logo.png';
import { AuthActions, CommonActions } from 'services/global';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

/**
 * Modern Login Screen (Under Construction)
 * Uses functional components, shadcn/ui, and React Hook Form + Zod
 */
function LogIn() {
  const dispatch = useDispatch();
  const authActions = bindActionCreators(AuthActions, dispatch);
  const commonActions = bindActionCreators(CommonActions, dispatch);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const rememberValue = watch('remember');

  const onSubmit = async data => {
    // Handle login logic here
    console.log('Login data:', data);
    // Example: await authActions.login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 flex flex-col items-center pb-4">
            <img src={logo} alt="logo" className="w-48 mb-4" />
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="text-destructive">* </span>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  <span className="text-destructive">* </span>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberValue}
                  onCheckedChange={checked => setValue('remember', checked)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogInIcon className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Links */}
              <div className="flex flex-col space-y-2 text-sm text-center">
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
                <a href="#" className="text-primary hover:underline">
                  Don&apos;t have an account? Sign Up
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LogIn;
