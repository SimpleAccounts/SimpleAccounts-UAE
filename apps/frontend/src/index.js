import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'polyfill';

// Apply Formik/Yup compatibility patch before other imports
import 'utils/formikYupPatch';

// Register Chart.js components before any chart renders
import 'utils/chartRegistry';

import React from 'react';
import { createRoot } from 'react-dom/client';

import 'assets/css/tailwind.css';
import 'assets/css/global.scss';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from 'next-themes';

import App from 'app';
import { Toaster } from '@/components/ui/sonner';
import * as serviceWorker from 'serviceWorker';

// Suppress findDOMNode deprecation warning from react-select v3
// This is a known issue in react-select v3.x that will be fixed in v5+
// See: https://github.com/JedWatson/react-select/issues/3590
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) {
      // Suppress this specific warning from react-select
      return;
    }
    originalError.apply(console, args);
  };
}

// Global error handler for Formik/Yup compatibility issue
// Catches "yupError.inner is undefined" errors from Formik validation
// This is a fallback - the patch should prevent these errors, but this catches any that slip through
window.addEventListener('unhandledrejection', event => {
  if (event.reason) {
    const errorMessage = event.reason.message || event.reason.toString() || '';
    const errorStack = event.reason.stack || '';

    // Check for the specific error pattern
    if (
      errorMessage.includes('yupError.inner is undefined') ||
      errorMessage.includes('inner is undefined') ||
      errorMessage.includes('inner.length') ||
      errorStack.includes('yupToFormErrors') ||
      (errorMessage.includes('TypeError') &&
        (errorStack.includes('formik') || errorStack.includes('yup')))
    ) {
      // Try to normalize the error if possible
      try {
        const { normalizeYupError } = require('utils/formikYupPatch');
        if (normalizeYupError && event.reason) {
          const normalized = normalizeYupError(event.reason);
          // Replace the reason with normalized error
          Object.defineProperty(event, 'reason', {
            value: normalized,
            writable: true,
            configurable: true,
          });
        }
      } catch (e) {
        // If normalization fails, just suppress the error
      }

      // Suppress this specific error - it's a known compatibility issue
      // between Yup 1.7.1 and Formik 1.5.1
      event.preventDefault();
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'Formik/Yup validation error handled (yupError.inner compatibility issue)',
          event.reason
        );
      }
    }
  }
});

// Try to patch Formik's yupToFormErrors when Formik is loaded
// This runs after the initial render to ensure Formik is available
setTimeout(() => {
  try {
    const formikModule = require('formik');
    const { normalizeYupError } = require('utils/formikYupPatch');

    if (formikModule && formikModule.yupToFormErrors && normalizeYupError) {
      const originalYupToFormErrors = formikModule.yupToFormErrors;
      formikModule.yupToFormErrors = function (yupError) {
        const normalized = normalizeYupError(yupError);
        return originalYupToFormErrors.call(this, normalized);
      };

      if (process.env.NODE_ENV === 'development') {
        console.debug('Successfully patched Formik yupToFormErrors');
      }
    }
  } catch (error) {
    // Formik might not be loaded yet or yupToFormErrors might not be accessible
    // This is okay, we'll rely on the Yup patch instead
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        'Could not patch Formik yupToFormErrors (this is usually fine):',
        error.message
      );
    }
  }
}, 100);

const theme = createTheme({
  palette: {
    primary: {
      main: '#2064d8',
    },
    secondary: {
      main: '#2064d8',
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <MuiThemeProvider theme={theme}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
      <Toaster />
    </ThemeProvider>
  </MuiThemeProvider>
);

serviceWorker.unregister();
