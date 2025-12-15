import { z } from 'zod';

/**
 * Common validation schemas for reuse across forms
 * These provide consistent validation patterns throughout the application
 */

/**
 * Email validation schema
 * Validates that the field is a non-empty string and a valid email address
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

/**
 * Password validation schema
 * Validates password strength requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
    'Password must contain at least one uppercase, one lowercase, one number, and one special character'
  );

/**
 * Phone number validation schema
 * Validates international phone number formats
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number'
  );

/**
 * Required string validation helper
 * @param {string} message - Custom error message
 * @returns {z.ZodString} Zod string schema
 */
export const requiredString = (message = 'This field is required') =>
  z.string().min(1, message);

/**
 * Required number validation helper
 * @param {string} message - Custom error message
 * @returns {z.ZodNumber} Zod number schema
 */
export const requiredNumber = (message = 'This field is required') =>
  z.number({ required_error: message, invalid_type_error: message });

/**
 * Positive number validation helper
 * @param {string} message - Custom error message
 * @returns {z.ZodNumber} Zod number schema
 */
export const positiveNumber = (message = 'Must be a positive number') =>
  z.number().positive(message);

/**
 * Date validation schema
 * Validates that the field is a valid date
 */
export const dateSchema = z.date({
  required_error: 'Date is required',
  invalid_type_error: 'Invalid date',
});

/**
 * Optional string validation helper
 * @param {z.ZodString} schema - Base string schema
 * @returns {z.ZodOptional<z.ZodString>} Optional Zod string schema
 */
export const optionalString = (schema = z.string()) => schema.optional();

/**
 * Optional number validation helper
 * @param {z.ZodNumber} schema - Base number schema
 * @returns {z.ZodOptional<z.ZodNumber>} Optional Zod number schema
 */
export const optionalNumber = (schema = z.number()) => schema.optional();

