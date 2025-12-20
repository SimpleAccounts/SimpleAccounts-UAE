/**
 * Tests for React Hook Form components
 * Verifies Phase 2: Form Component Wrappers
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../form';
import { Input } from '../input';

// Test component that uses the form
const TestForm = () => {
  const form = useForm({
    defaultValues: {
      testField: '',
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          name="testField"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Test Field</FormLabel>
              <Input {...field} data-testid="test-input" />
              <FormDescription>This is a test field</FormDescription>
              <FormMessage>{fieldState?.error?.message}</FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe('Form Components (Phase 2)', () => {
  test('Form component renders without errors', () => {
    render(<TestForm />);
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  test('FormField integrates with Controller', () => {
    render(<TestForm />);
    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
  });

  test('FormLabel renders correctly', () => {
    render(<TestForm />);
    const label = screen.getByText('Test Field');
    expect(label.tagName).toBe('LABEL');
  });

  test('FormDescription renders helper text', () => {
    render(<TestForm />);
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  test('FormItem provides spacing wrapper', () => {
    const { container } = render(<TestForm />);
    const formItem = container.querySelector('.space-y-2');
    expect(formItem).toBeInTheDocument();
  });
});
