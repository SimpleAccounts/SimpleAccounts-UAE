import React from 'react';
import { useFormContext, Controller, FormProvider } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * Form component - Wrapper around FormProvider from react-hook-form
 * Provides form context to all child components
 *
 * @param {Object} props - React Hook Form form methods and options
 * @param {React.ReactNode} props.children - Form content
 */
export const Form = ({ children, ...props }) => {
  return <FormProvider {...props}>{children}</FormProvider>;
};

/**
 * FormField component - Wrapper around Controller from react-hook-form
 * Connects form fields to react-hook-form state
 *
 * @param {string} props.name - Field name (must match schema)
 * @param {Object} props.control - Optional control object (uses context if not provided)
 * @param {Function} props.render - Render function receiving { field, fieldState, formState }
 */
export const FormField = ({ name, control, render, ...props }) => {
  const formContext = useFormContext();
  const fieldControl = control || formContext?.control;

  if (!fieldControl) {
    throw new Error('FormField must be used within a Form component or provide control prop');
  }

  return (
    <Controller
      name={name}
      control={fieldControl}
      render={({ field, fieldState, formState }) => {
        return render({
          field,
          fieldState,
          formState,
          ...props,
        });
      }}
    />
  );
};

/**
 * FormItem component - Spacing wrapper for form fields
 * Provides consistent spacing between form elements
 *
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Form field content
 */
export const FormItem = ({ className, children, ...props }) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * FormControl component - Wrapper for form input elements
 * Provides styling and accessibility attributes
 *
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Input element
 */
export const FormControl = ({ className, children, ...props }) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * FormLabel component - Label for form fields
 * Styled label component compatible with shadcn/ui
 *
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Label text
 */
export const FormLabel = ({ className, children, ...props }) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

/**
 * FormDescription component - Helper text for form fields
 * Displays additional information about a field
 *
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Description text
 */
export const FormDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
};

/**
 * FormMessage component - Error message display for form fields
 * Displays validation errors from react-hook-form
 *
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Custom error message (optional)
 */
export const FormMessage = ({ className, children, ...props }) => {
  // If children provided, use them (for custom messages)
  if (children) {
    return (
      <p className={cn('text-sm font-medium text-destructive', className)} {...props}>
        {children}
      </p>
    );
  }

  return null;
};
