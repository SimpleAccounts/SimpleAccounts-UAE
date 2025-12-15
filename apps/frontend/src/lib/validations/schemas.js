import { z } from 'zod';
import {
  emailSchema,
  requiredString,
  requiredNumber,
  positiveNumber,
  phoneSchema,
  dateSchema,
} from './common';

/**
 * Example validation schemas for common forms
 * These can be used as-is or as templates for creating new schemas
 */

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  username: requiredString('Username is required'),
  password: requiredString('Password is required'),
});

/**
 * User registration/creation form validation schema
 */
export const userSchema = z.object({
  firstName: requiredString('First name is required'),
  lastName: requiredString('Last name is required'),
  middleName: requiredString('Middle name is required').optional(),
  email: emailSchema,
  roleId: requiredString('Role is required'),
  timezone: requiredString('Timezone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If password is provided, confirmPassword must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Invoice form validation schema
 */
export const invoiceSchema = z.object({
  customerName: requiredString('Customer name is required'),
  amount: positiveNumber('Amount must be positive'),
  dueDate: dateSchema,
  items: z
    .array(
      z.object({
        description: requiredString('Description is required'),
        quantity: positiveNumber('Quantity must be positive'),
        price: positiveNumber('Price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
});

/**
 * Contact form validation schema
 * Includes conditional validation for stateId when countryId is selected
 */
export const contactSchema = z
  .object({
    firstName: requiredString('First name is required'),
    lastName: requiredString('Last name is required'),
    middleName: requiredString('Middle name is required').optional(),
    email: emailSchema,
    telephone: phoneSchema,
    mobileNumber: z.string().optional(),
    countryId: requiredString('Country is required'),
    stateId: z.string().optional(),
    city: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
  })
  .refine(
    (data) => {
      // Conditional validation: stateId required if countryId is set
      if (data.countryId && !data.stateId) {
        return false;
      }
      return true;
    },
    {
      message: 'State is required when country is selected',
      path: ['stateId'],
    }
  );

/**
 * Expense form validation schema
 * Includes conditional validations based on payment mode and VAT status
 */
export const expenseSchema = z
  .object({
    expenseCategory: z.object({ value: z.string() }).optional(),
    payMode: z
      .object({ value: z.string() })
      .refine((val) => val && val.value, {
        message: 'Pay Through is required',
      }),
    bankAccountId: z.string().optional(),
    vatCategoryId: z.string().optional(),
    placeOfSupplyId: z
      .object({ value: z.string() })
      .or(z.string())
      .optional(),
    taxTreatmentId: z.string().optional(),
    amount: positiveNumber('Amount must be positive'),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // Bank account required when payment mode is BANK
      if (data.payMode?.value === 'BANK' && !data.bankAccountId) {
        return false;
      }
      return true;
    },
    {
      message: 'Bank account is required',
      path: ['bankAccountId'],
    }
  )
  .refine(
    (data) => {
      // VAT category required for registered VAT (except category 34)
      const categoryValue =
        typeof data.expenseCategory === 'object'
          ? data.expenseCategory?.value
          : data.expenseCategory;
      if (
        data.isRegisteredVat &&
        !data.vatCategoryId &&
        categoryValue !== '34' &&
        categoryValue !== 34
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'VAT category is required',
      path: ['vatCategoryId'],
    }
  );

/**
 * Product form validation schema
 */
export const productSchema = z.object({
  name: requiredString('Product name is required'),
  productCode: z.string().optional(),
  description: z.string().optional(),
  price: positiveNumber('Price must be positive'),
  quantity: z.number().min(0, 'Quantity cannot be negative').optional(),
  categoryId: z.string().optional(),
  vatCategoryId: z.string().optional(),
});

/**
 * Payment form validation schema
 */
export const paymentSchema = z.object({
  amount: positiveNumber('Amount must be positive'),
  paymentDate: dateSchema,
  payMode: requiredString('Payment mode is required'),
  bankAccountId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

