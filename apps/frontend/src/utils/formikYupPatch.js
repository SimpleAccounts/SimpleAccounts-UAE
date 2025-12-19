/**
 * Patch for Formik's yupToFormErrors to handle Yup 1.7.1 compatibility issue
 * Fixes: "TypeError: yupError.inner is undefined"
 *
 * This is a known compatibility issue between Yup 1.7.1 and Formik 1.5.1
 * See: https://github.com/jquense/yup/issues/1918
 *
 * This patch:
 * 1. Normalizes Yup errors to ensure they always have an `inner` array
 * 2. Patches Yup's validate and validateSync methods
 * 3. Patches Formik's yupToFormErrors function if accessible
 */

import * as Yup from 'yup';

/**
 * Normalizes a Yup validation error to ensure it has the inner property
 * that Formik expects. This fixes the "yupError.inner is undefined" error.
 *
 * Handles multiple edge cases:
 * - Errors without inner property
 * - Errors with null/undefined inner
 * - Errors from custom .test() validations
 * - Errors from conditional .when() validations
 */
function normalizeYupError(error) {
  if (!error) {
    return error;
  }

  // If inner is already a valid array, return as-is
  if (error.inner && Array.isArray(error.inner) && error.inner.length >= 0) {
    return error;
  }

  // Create a new error object if needed to avoid mutating the original
  const normalizedError = error instanceof Error ? Object.create(Object.getPrototypeOf(error)) : {};

  // Copy all properties from the original error
  Object.keys(error).forEach(key => {
    normalizedError[key] = error[key];
  });

  // Ensure inner is always an array
  // If error has a path and message, create a proper inner structure
  if (!normalizedError.inner || !Array.isArray(normalizedError.inner)) {
    normalizedError.inner = [];

    // If the error itself has path and message, add it to inner
    if (normalizedError.path && normalizedError.message) {
      normalizedError.inner.push({
        path: normalizedError.path,
        message: normalizedError.message,
        type: normalizedError.type || 'validation',
      });
    }
  }

  // Ensure all inner errors are properly structured
  if (normalizedError.inner && Array.isArray(normalizedError.inner)) {
    normalizedError.inner = normalizedError.inner.map(innerError => {
      if (!innerError || typeof innerError !== 'object') {
        return {
          path: '',
          message: String(innerError || 'Validation error'),
          type: 'validation',
        };
      }
      return {
        path: innerError.path || '',
        message: innerError.message || 'Validation error',
        type: innerError.type || 'validation',
        ...innerError,
      };
    });
  }

  return normalizedError;
}

/**
 * Patches Formik's yupToFormErrors function if it's accessible and writable
 */
async function patchFormikYupToFormErrors() {
  try {
    // Try to dynamically import Formik and patch yupToFormErrors
    // Using dynamic import for ES modules/Vite compatibility
    const formikModule = await import('formik').catch(() => null);
    if (formikModule && formikModule.yupToFormErrors) {
      const originalYupToFormErrors = formikModule.yupToFormErrors;

      // Check if the property is writable before attempting to patch
      const descriptor = Object.getOwnPropertyDescriptor(formikModule, 'yupToFormErrors');

      // If property exists and is writable, patch it
      if (!descriptor || descriptor.writable !== false) {
        try {
          formikModule.yupToFormErrors = function (yupError) {
            const normalized = normalizeYupError(yupError);
            return originalYupToFormErrors.call(this, normalized);
          };
        } catch (writeError) {
          // Property might be read-only, try using defineProperty
          try {
            Object.defineProperty(formikModule, 'yupToFormErrors', {
              value: function (yupError) {
                const normalized = normalizeYupError(yupError);
                return originalYupToFormErrors.call(this, normalized);
              },
              writable: true,
              configurable: true,
            });
          } catch (defineError) {
            // If both fail, silently skip - Yup patch will handle it
            // No need to log as this is expected for read-only properties
          }
        }
      } else {
        // Property is read-only, skip patching - Yup patch will handle it
        // No need to log as this is expected and handled by Yup patch
      }
    }
  } catch (error) {
    // Formik might not be loaded yet or yupToFormErrors might not be exported
    // This is okay, we'll rely on the Yup patch instead
    // Only log unexpected errors (not read-only property errors)
    if (
      (import.meta.env?.DEV || process.env.NODE_ENV === 'development') &&
      error.message &&
      !error.message.includes('read-only') &&
      !error.message.includes('Cannot assign')
    ) {
      console.debug('Could not patch Formik yupToFormErrors:', error.message);
    }
  }
}

// Patch Yup Schema prototype methods
try {
  // Create a test schema to find the prototype
  const testSchema = Yup.object();

  // Traverse up the prototype chain to find the base Schema class
  let currentProto = Object.getPrototypeOf(testSchema);
  let foundValidate = false;

  // Go up the prototype chain (max 10 levels to find the base Schema)
  for (let i = 0; i < 10 && currentProto && currentProto !== Object.prototype; i++) {
    // Patch validate method (async)
    if (
      currentProto.validate &&
      typeof currentProto.validate === 'function' &&
      !currentProto.validate.__patched
    ) {
      const originalValidate = currentProto.validate;

      currentProto.validate = function (value, options = {}) {
        return originalValidate.call(this, value, options).catch(error => {
          // Normalize the error before re-throwing
          const normalized = normalizeYupError(error);
          throw normalized;
        });
      };

      // Mark as patched to avoid double-patching
      currentProto.validate.__patched = true;
      foundValidate = true;
    }

    // Patch validateSync method (sync)
    if (
      currentProto.validateSync &&
      typeof currentProto.validateSync === 'function' &&
      !currentProto.validateSync.__patched
    ) {
      const originalValidateSync = currentProto.validateSync;

      currentProto.validateSync = function (value, options = {}) {
        try {
          return originalValidateSync.call(this, value, options);
        } catch (error) {
          // Normalize the error before re-throwing
          const normalized = normalizeYupError(error);
          throw normalized;
        }
      };

      // Mark as patched
      currentProto.validateSync.__patched = true;
    }

    // Move up the prototype chain
    currentProto = Object.getPrototypeOf(currentProto);
  }

  if (!foundValidate && process.env.NODE_ENV === 'development') {
    console.warn('Could not find Yup Schema validate method to patch');
  }
} catch (error) {
  // If patching fails, log a warning but don't crash
  console.warn('Failed to patch Yup Schema prototype:', error);
}

// Try to patch Formik's yupToFormErrors (may not work if Formik isn't loaded yet)
// This will be called again when Formik is actually imported
// Using async call since we're using dynamic import
patchFormikYupToFormErrors().catch(() => {
  // Silently handle if Formik isn't available yet
});

// Export the normalize function for use in Formik wrapper
export { normalizeYupError };

// Re-export Yup (unchanged, but with patched prototype methods)
export default Yup;
