/**
 * Formik wrapper component that fixes Yup 1.7.1 compatibility issues
 *
 * This component wraps Formik and ensures that validation errors are properly
 * normalized before being passed to Formik's internal error handling.
 *
 * Usage: Replace <Formik> with <FormikWithYupFix>
 */

import React from 'react';
import { Formik } from 'formik';
import { normalizeYupError } from 'utils/formikYupPatch';

/**
 * Wraps Formik's validationSchema to normalize errors
 */
function wrapValidationSchema(validationSchema) {
  if (!validationSchema) {
    return validationSchema;
  }

  // If it's a Yup schema, wrap the validate method
  if (validationSchema && typeof validationSchema.validate === 'function') {
    const originalValidate = validationSchema.validate.bind(validationSchema);
    const originalValidateSync = validationSchema.validateSync?.bind(validationSchema);

    // Create a new schema-like object that wraps validation
    const wrappedSchema = {
      ...validationSchema,
      validate: function (value, options = {}) {
        return originalValidate(value, options).catch(error => {
          const normalized = normalizeYupError(error);
          throw normalized;
        });
      },
    };

    // Wrap validateSync if it exists
    if (originalValidateSync) {
      wrappedSchema.validateSync = function (value, options = {}) {
        try {
          return originalValidateSync(value, options);
        } catch (error) {
          const normalized = normalizeYupError(error);
          throw normalized;
        }
      };
    }

    // Copy other schema methods
    Object.keys(validationSchema).forEach(key => {
      if (!wrappedSchema[key] && typeof validationSchema[key] === 'function') {
        wrappedSchema[key] = validationSchema[key].bind(validationSchema);
      }
    });

    return wrappedSchema;
  }

  return validationSchema;
}

/**
 * Formik component with Yup error normalization
 *
 * All props are passed through to Formik, but validationSchema is wrapped
 * to ensure errors are normalized.
 */
export function FormikWithYupFix({ validationSchema, ...formikProps }) {
  // Wrap the validation schema to normalize errors
  const wrappedSchema = React.useMemo(
    () => wrapValidationSchema(validationSchema),
    [validationSchema]
  );

  // Also wrap the validate prop if provided
  const wrappedValidate = React.useCallback(
    values => {
      if (!formikProps.validate) {
        return {};
      }

      try {
        const errors = formikProps.validate(values);
        return errors;
      } catch (error) {
        // Normalize any errors thrown by custom validate function
        const normalized = normalizeYupError(error);
        if (normalized && normalized.message) {
          return { _error: normalized.message };
        }
        return {};
      }
    },
    [formikProps.validate]
  );

  return (
    <Formik
      {...formikProps}
      validationSchema={wrappedSchema}
      validate={formikProps.validate ? wrappedValidate : undefined}
    />
  );
}

export default FormikWithYupFix;
