/**
 * Environment variable utilities for Vite
 * 
 * Vite uses import.meta.env instead of process.env
 * This module provides a consistent interface for accessing environment variables
 * with fallbacks and type safety.
 */

/**
 * Get the current environment mode
 * @returns {string} 'development' | 'production' | 'test'
 */
export const getEnvMode = () => {
  return import.meta.env.MODE || 'development';
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
  const env = getMetaEnv();
  return env[fullKey] || defaultValue;
};

/**
 * Get all Vite environment variables
 * @returns {Record<string, string>}
 */
export const getAllEnvVars = () => {
  return getMetaEnv();
};

/**
 * Environment variable accessor object
 * Provides a clean API for common environment variables
 */
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
