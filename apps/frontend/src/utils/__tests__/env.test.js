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
      expect(getEnvMode()).toBe('test');
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
  });

  describe('getEnvVar', () => {
    it('should return default value when variable is not set', () => {
      expect(getEnvVar('NON_EXISTENT_VAR', 'default')).toBe('default');
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
      expect(env.mode).toBe('test');
      expect(env.isProduction).toBe(false);
      expect(env.baseUrl).toBe('/');
      expect(env.dev).toBe(true); // DEV is true when not production
      expect(env.prod).toBe(false);
      expect(env.ssr).toBe(false);
    });
  });
});
