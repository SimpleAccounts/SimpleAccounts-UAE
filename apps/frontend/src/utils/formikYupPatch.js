/**
 * Patch for Formik's yupToFormErrors to handle Yup 1.7.1 compatibility issue
 * Fixes: "TypeError: yupError.inner is undefined"
 * 
 * This is a known compatibility issue between Yup 1.7.1 and Formik 1.5.1
 * See: https://github.com/jquense/yup/issues/1918
 * 
 * Since we can't modify read-only exports, we use a Proxy to intercept
 * schema creation and patch validate methods, or we normalize errors
 * at the Promise rejection level.
 */

import * as Yup from 'yup';

/**
 * Normalizes a Yup validation error to ensure it has the inner property
 * that Formik expects. This fixes the "yupError.inner is undefined" error.
 */
function normalizeYupError(error) {
	if (!error) {
		return error;
	}
	
	// If inner is already an array, return as-is
	if (error.inner && Array.isArray(error.inner)) {
		return error;
	}
	
	// Ensure inner is always an array (even if empty)
	// This is what Formik's yupToFormErrors expects
	if (!error.inner) {
		error.inner = [];
	}
	
	return error;
}

// Try to patch the Schema prototype by traversing the prototype chain
try {
	// Create a test schema to find the prototype
	const testSchema = Yup.object();
	
	// Traverse up the prototype chain to find the base Schema class
	let currentProto = Object.getPrototypeOf(testSchema);
	let foundValidate = false;
	
	// Go up the prototype chain (max 5 levels to avoid infinite loops)
	for (let i = 0; i < 5 && currentProto && currentProto !== Object.prototype; i++) {
		if (currentProto.validate && typeof currentProto.validate === 'function') {
			const originalValidate = currentProto.validate;
			
			// Patch the validate method
			currentProto.validate = function(value, options = {}) {
				return originalValidate.call(this, value, options).catch((error) => {
					const normalized = normalizeYupError(error);
					throw normalized;
				});
			};
			
			foundValidate = true;
		}
		
		if (currentProto.validateSync && typeof currentProto.validateSync === 'function') {
			const originalValidateSync = currentProto.validateSync;
			
			currentProto.validateSync = function(value, options = {}) {
				try {
					return originalValidateSync.call(this, value, options);
				} catch (error) {
					const normalized = normalizeYupError(error);
					throw normalized;
				}
			};
		}
		
		// Move up the prototype chain
		currentProto = Object.getPrototypeOf(currentProto);
		
		// If we found and patched validate, we can stop
		if (foundValidate) {
			break;
		}
	}
	
	if (!foundValidate) {
		console.warn('Could not find Yup Schema validate method to patch');
	}
} catch (error) {
	// If patching fails, log a warning but don't crash
	console.warn('Failed to patch Yup Schema prototype:', error);
}

// Re-export Yup (unchanged, but with patched prototype methods)
export default Yup;

