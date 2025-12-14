/**
 * Tests for environment variable utilities
 * Verifies that import.meta.env mocking works correctly in Jest
 * 
 * IMPORTANT: This test verifies that getMetaEnv() is defined and accessible,
 * preventing ReferenceError when importing the module.
 */

import { getEnvMode, isProduction, isDevelopment, getBaseUrl, getEnvVar, getAllEnvVars, env } from '../env';

describe('env utilities - module loading', () => {
  it('should load without ReferenceError', () => {
    // This test verifies that getMetaEnv() is defined and the module loads correctly
    expect(() => {
      require('../env');
    }).not.toThrow();
  });

  it('should export all expected functions', () => {
    expect(typeof getEnvMode).toBe('function');
    expect(typeof isProduction).toBe('function');
    expect(typeof isDevelopment).toBe('function');
    expect(typeof getBaseUrl).toBe('function');
    expect(typeof getEnvVar).toBe('function');
    expect(typeof getAllEnvVars).toBe('function');
    expect(typeof env).toBe('object');
  });
});

describe('env utilities', () => {
  describe('getEnvMode', () => {
    it('should return test mode in Jest environment', () => {
      // MODE should match process.env.NODE_ENV or default to 'test'
      const expectedMode = process.env.NODE_ENV || 'test';
      expect(getEnvMode()).toBe(expectedMode);
    });

    it('should handle missing MODE with fallback', () => {
      // Test the fallback path when MODE is undefined
      const originalMODE = globalThis.import.meta.env.MODE;
      delete globalThis.import.meta.env.MODE;
      
      // Should fall back to 'development' when MODE is missing
      const mode = getEnvMode();
      expect(mode).toBe('development');
      
      // Restore
      globalThis.import.meta.env.MODE = originalMODE;
    });
  });

  describe('isProduction', () => {
    it('should return false in test environment', () => {
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('should return false in test environment', () => {
      // In Jest, MODE is 'test', not 'development'
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('getBaseUrl', () => {
    it('should return default base URL', () => {
      expect(getBaseUrl()).toBe('/');
    });

    it('should handle missing BASE_URL with fallback', () => {
      // Test the fallback path when BASE_URL is undefined
      const originalBASE_URL = globalThis.import.meta.env.BASE_URL;
      delete globalThis.import.meta.env.BASE_URL;
      
      // Should fall back to '/' when BASE_URL is missing
      const baseUrl = getBaseUrl();
      expect(baseUrl).toBe('/');
      
      // Restore
      globalThis.import.meta.env.BASE_URL = originalBASE_URL;
    });
  });

  describe('getEnvVar', () => {
    it('should return default value when variable is not set', () => {
      expect(getEnvVar('NON_EXISTENT_VAR', 'default')).toBe('default');
    });

    it('should return empty string when no default is provided', () => {
      expect(getEnvVar('NON_EXISTENT_VAR')).toBe('');
    });

    it('should handle VITE_ prefixed variables', () => {
      // If VITE_TEST_VAR is set in process.env, it should be available
      const originalEnv = process.env.VITE_TEST_VAR;
      process.env.VITE_TEST_VAR = 'test-value';
      
      // Re-define import.meta.env mock with new variable
      globalThis.import.meta.env.VITE_TEST_VAR = 'test-value';
      
      expect(getEnvVar('TEST_VAR', 'default')).toBe('test-value');
      expect(getEnvVar('VITE_TEST_VAR', 'default')).toBe('test-value');
      
      // Restore
      if (originalEnv !== undefined) {
        process.env.VITE_TEST_VAR = originalEnv;
      } else {
        delete process.env.VITE_TEST_VAR;
      }
      delete globalThis.import.meta.env.VITE_TEST_VAR;
    });
  });

  describe('getAllEnvVars', () => {
    it('should return all environment variables', () => {
      const allVars = getAllEnvVars();
      expect(allVars).toBeDefined();
      expect(typeof allVars).toBe('object');
      expect(allVars).toHaveProperty('MODE');
      expect(allVars).toHaveProperty('DEV');
      expect(allVars).toHaveProperty('PROD');
    });
  });

  describe('getAllEnvVars - additional coverage', () => {
    it('should include SSR and BASE_URL properties', () => {
      const allVars = getAllEnvVars();
      expect(allVars).toHaveProperty('SSR');
      expect(allVars).toHaveProperty('BASE_URL');
    });
  });

  describe('env object', () => {
    it('should have correct properties', () => {
      expect(env).toHaveProperty('mode');
      expect(env).toHaveProperty('isProduction');
      expect(env).toHaveProperty('isDevelopment');
      expect(env).toHaveProperty('baseUrl');
      expect(env).toHaveProperty('dev');
      expect(env).toHaveProperty('prod');
      expect(env).toHaveProperty('ssr');
    });

    it('should have correct values in test environment', () => {
      // MODE should be 'test' in Jest environment
      // (setupTests.js sets it to process.env.NODE_ENV || 'test')
      const expectedMode = process.env.NODE_ENV || 'test';
      expect(env.mode).toBe(expectedMode);
      
      // isProduction should be false when not in production mode
      // isProduction checks if mode === 'production', so it should be false for 'test'
      expect(env.isProduction).toBe(expectedMode === 'production');
      
      // baseUrl should default to '/'
      expect(env.baseUrl).toBe('/');
      
      // DEV is true when NODE_ENV is not 'production'
      const expectedDev = process.env.NODE_ENV !== 'production';
      expect(env.dev).toBe(expectedDev);
      
      // PROD is true only when NODE_ENV is 'production'
      expect(env.prod).toBe(process.env.NODE_ENV === 'production');
      
      // SSR should always be false in browser environment
      expect(env.ssr).toBe(false);
    });
  });
});
