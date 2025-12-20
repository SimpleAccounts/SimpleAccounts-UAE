import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PasswordChecklist from 'react-password-checklist';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { api } from 'utils';
import { Message } from 'components';
import './style.scss';

// Zod validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Must contain minimum 8 characters, one uppercase, one lowercase, one number and one special case character'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

/**
 * Modern Reset Password Component
 * Uses functional components, shadcn/ui, and React Hook Form + Zod
 */
function ResetNewPassword({ token, history }) {
  const navigate = useNavigate();
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const onSubmit = async data => {
    const obj = {
      password: data.password,
      token: token,
    };

    const requestData = {
      method: 'post',
      url: '/public/resetPassword',
      data: obj,
    };

    try {
      const res = await api(requestData);
      if (res.status === 200) {
        setAlert(<Message type="success" content="Password Reset Successfully." />);
        setTimeout(() => {
          if (history) {
            history.push('/login');
          } else {
            navigate('/login');
          }
        }, 1500);
      }
    } catch (err) {
      setAlert(
        <Message
          type="danger"
          content="Email Verification Link Is Expired. Please enter your email address and we'll send another verification link."
          link="/reset-password"
        />
      );
    }
  };

  return (
    <div className="animated fadeIn">
      <div className="app flex-row align-items-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-md">{alert}</div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Reset Password</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        <span className="text-destructive">* </span>
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={isPasswordShown ? 'text' : 'password'}
                          placeholder="Enter Password"
                          className="pr-10"
                          {...register('password', {
                            onChange: e => setShowChecklist(e.target.value.length > 0),
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordShown(!isPasswordShown)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {isPasswordShown ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                      )}
                      {showChecklist && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                          <PasswordChecklist
                            rules={['length', 'specialChar', 'number', 'capital']}
                            minLength={8}
                            value={passwordValue}
                            valueAgain={confirmPasswordValue}
                          />
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        <span className="text-destructive">* </span>
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        {...register('confirmPassword')}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                      )}
                      {showChecklist && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                          <PasswordChecklist
                            rules={['match']}
                            minLength={8}
                            value={passwordValue}
                            valueAgain={confirmPasswordValue}
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetNewPassword;
