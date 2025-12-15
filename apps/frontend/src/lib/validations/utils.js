/**
 * Utility functions for working with React Hook Form and Zod validation
 */

/**
 * Helper to extract field error message from form state
 * @param {Object} fieldState - Field state from react-hook-form Controller
 * @returns {string|null} Error message or null if no error
 *
 * @example
 * <FormMessage>{getFieldError(fieldState)}</FormMessage>
 */
export const getFieldError = (fieldState) => {
  return fieldState?.error?.message || null;
};

/**
 * Helper to check if field has an error
 * @param {Object} fieldState - Field state from react-hook-form Controller
 * @returns {boolean} True if field has error
 *
 * @example
 * const hasError = hasFieldError(fieldState);
 * <Input className={hasError ? 'border-red-500' : ''} />
 */
export const hasFieldError = (fieldState) => {
  return !!fieldState?.error;
};

/**
 * Helper to get field value from form state
 * @param {Object} formState - Form state from react-hook-form
 * @param {string} fieldName - Name of the field
 * @returns {any} Field value or undefined
 */
export const getFieldValue = (formState, fieldName) => {
  return formState?.values?.[fieldName];
};

/**
 * Helper to check if form is submitting
 * @param {Object} formState - Form state from react-hook-form
 * @returns {boolean} True if form is currently submitting
 */
export const isSubmitting = (formState) => {
  return formState?.isSubmitting || false;
};

/**
 * Helper to check if form is valid
 * @param {Object} formState - Form state from react-hook-form
 * @returns {boolean} True if form has no errors
 */
export const isFormValid = (formState) => {
  return Object.keys(formState?.errors || {}).length === 0;
};

/**
 * Helper to get all form errors
 * @param {Object} formState - Form state from react-hook-form
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const getAllErrors = (formState) => {
  const errors = {};
  const formErrors = formState?.errors || {};

  Object.keys(formErrors).forEach((key) => {
    if (formErrors[key]?.message) {
      errors[key] = formErrors[key].message;
    }
  });

  return errors;
};

