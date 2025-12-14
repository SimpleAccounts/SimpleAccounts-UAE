/**
 * Tests for environment variable utilities
 * Verifies that import.meta.env mocking works correctly in Jest
 */

import { getEnvMode, isProduction, isDevelopment, getBaseUrl, getEnvVar, env } from '../env';

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
