import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { getFieldError } from '@/lib/validations/utils';

/**
 * Example validation schema demonstrating Zod usage
 * This schema includes:
 * - Required field validation
 * - Email validation
 * - Password strength validation
 * - Cross-field validation (password confirmation)
 */
const exampleSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Password must contain at least one uppercase, one lowercase, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Example form component demonstrating React Hook Form + Zod integration
 * This component shows:
 * - How to set up useForm with zodResolver
 * - How to use FormField with Controller
 * - How to display validation errors
 * - How to handle form submission
 */
export const ExampleForm = () => {
  const form = useForm({
    resolver: zodResolver(exampleSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // In a real application, you would:
    // 1. Call an API endpoint
    // 2. Handle success/error responses
    // 3. Redirect or show success message
    alert('Form submitted successfully! Check console for data.');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>React Hook Form + Zod Example</CardTitle>
          <CardDescription>
            This form demonstrates the integration of React Hook Form with Zod
            validation and shadcn/ui components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                    <FormMessage>{getFieldError(fieldState)}</FormMessage>
                    <FormDescription>
                      We'll never share your email with anyone else.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                    <FormMessage>{getFieldError(fieldState)}</FormMessage>
                    <FormDescription>
                      Must be at least 8 characters with uppercase, lowercase,
                      number, and special character.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                    <FormMessage>{getFieldError(fieldState)}</FormMessage>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExampleForm;

