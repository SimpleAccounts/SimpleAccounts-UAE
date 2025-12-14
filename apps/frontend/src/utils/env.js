/**
 * Environment variable utilities for Vite
 * 
 * Vite uses import.meta.env instead of process.env
 * This module provides a consistent interface for accessing environment variables
 * with fallbacks and type safety.
 * 
 * In Jest tests, import.meta is mocked via setupTests.js
 */

// Helper to get import.meta.env safely (works in both Vite and Jest)
// NOTE: We cannot use import.meta directly because Jest will try to parse it and fail
// Solution: Check for Jest mock first, then use a Vite-specific global that we'll inject
function getMetaEnv() {
  // In Jest tests (mocked via globalThis.import) - check this first
  if (typeof globalThis !== 'undefined' && globalThis.import && globalThis.import.meta && globalThis.import.meta.env) {
    return globalThis.import.meta.env;
  }
  // In Vite runtime - check for a global that Vite will inject
  // We use window.__VITE_ENV__ which will be set by Vite at build time
  // This avoids Jest parse errors while still getting Vite env vars
  if (typeof window !== 'undefined' && window.__VITE_ENV__) {
    return window.__VITE_ENV__;
  }
  // Fallback (used when not in Jest and Vite env not injected)
  return {
    MODE: 'development',
    DEV: true,
    PROD: false,
    SSR: false,
    BASE_URL: '/',
  };
}

/**
 * Get the current environment mode
 * @returns {string} 'development' | 'production' | 'test'
 */
export const getEnvMode = () => {
  // eslint-disable-next-line no-undef
  return getMetaEnv().MODE || 'development';
};

/**
 * Check if we're in production mode
 * @returns {boolean}
 */
export const isProduction = () => {
  return getEnvMode() === 'production';
};

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return getEnvMode() === 'development';
};

/**
 * Get the base URL for public assets
 * In Vite, this is import.meta.env.BASE_URL (defaults to '/')
 * This replaces CRA's process.env.PUBLIC_URL
 * @returns {string}
 */
export const getBaseUrl = () => {
  // eslint-disable-next-line no-undef
  return getMetaEnv().BASE_URL || '/';
};

/**
 * Get a Vite environment variable
 * Only variables prefixed with VITE_ are exposed to the client
 * @param {string} key - The environment variable key (without VITE_ prefix)
 * @param {string} defaultValue - Default value if not set
 * @returns {string}
 */
export const getEnvVar = (key, defaultValue = '') => {
  const fullKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
  // eslint-disable-next-line no-undef
  const env = getMetaEnv();
  return env[fullKey] || defaultValue;
};

/**
 * Get all Vite environment variables
 * @returns {Record<string, string>}
 */
export const getAllEnvVars = () => {
  // eslint-disable-next-line no-undef
  return getMetaEnv();
};

/**
 * Environment variable accessor object
 * Provides a clean API for common environment variables
 */
// eslint-disable-next-line no-undef
const metaEnv = getMetaEnv();
export const env = {
  // Mode
  mode: getEnvMode(),
  isProduction: isProduction(),
  isDevelopment: isDevelopment(),
  
  // Base URL (replaces PUBLIC_URL)
  baseUrl: getBaseUrl(),
  
  // Dev server
  dev: metaEnv.DEV,
  prod: metaEnv.PROD,
  
  // SSR
  ssr: metaEnv.SSR,
};

export default env;
