import { lazy } from 'react';

/**
 * Utility function to wrap dynamic imports with retry logic
 * This helps handle chunk loading failures that can occur in production
 *
 * @param {Function} importFunc - The dynamic import function
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} interval - Delay between retries in ms (default: 1000)
 * @returns {Promise} - Promise that resolves to the module
 */
const retry = (importFunc, retries = 3, interval = 1000) => {
  return new Promise((resolve, reject) => {
    importFunc()
      .then(resolve)
      .catch(error => {
        if (retries === 0) {
          reject(error);
          return;
        }

        setTimeout(() => {
          console.log(`Retrying import... (${retries} attempts remaining)`);
          retry(importFunc, retries - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

/**
 * Enhanced lazy loading function with retry logic
 * Use this instead of React.lazy() directly for better error handling
 *
 * @param {Function} importFunc - The dynamic import function
 * @returns {React.LazyExoticComponent} - Lazy loaded component
 *
 * @example
 * const Dashboard = lazyLoad(() => import('./screens/dashboard'));
 */
export const lazyLoad = (importFunc) => {
  return lazy(() => retry(importFunc));
};

/**
 * Preload a lazy-loaded component
 * This can be used to preload components before they're needed
 *
 * @param {Function} importFunc - The dynamic import function
 *
 * @example
 * preloadComponent(() => import('./screens/dashboard'));
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

export default lazyLoad;
