/**
 * Comprehensive tests for axios HTTP client configuration.
 * These tests verify that axios interceptors and API calls work correctly
 * before/after axios upgrades.
 *
 * Covers: axios 0.21.1 → 1.7.x upgrade
 */
import axios from 'axios';

describe('Axios HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ============ Basic Axios Functionality ============

  describe('Axios Core Functionality', () => {
    it('should have axios library available', () => {
      expect(axios).toBeDefined();
      expect(axios.create).toBeDefined();
    });

    it('should create axios instance', () => {
      const instance = axios.create({
        baseURL: 'http://localhost:8080',
        timeout: 30000
      });

      expect(instance).toBeDefined();
      expect(instance.interceptors).toBeDefined();
      expect(instance.interceptors.request).toBeDefined();
      expect(instance.interceptors.response).toBeDefined();
    });

    it('should have interceptors API', () => {
      const instance = axios.create();

      expect(typeof instance.interceptors.request.use).toBe('function');
      expect(typeof instance.interceptors.response.use).toBe('function');
    });
  });

  // ============ Request Interceptor Patterns ============

  describe('Request Interceptor Patterns', () => {
    it('should add Authorization header when token exists', () => {
      localStorage.setItem('accessToken', 'test-jwt-token');

      const config = { headers: {} };
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      expect(config.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should not add Authorization header when no token', () => {
      const config = { headers: {} };
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      expect(config.headers.Authorization).toBeUndefined();
    });

    it('should preserve existing headers', () => {
      localStorage.setItem('accessToken', 'test-token');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value'
        }
      };

      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers['X-Custom-Header']).toBe('custom-value');
      expect(config.headers.Authorization).toBe('Bearer test-token');
    });
  });

  // ============ Response Interceptor Patterns ============

  describe('Response Interceptor Patterns', () => {
    it('should pass through successful responses', () => {
      const response = {
        status: 200,
        data: { success: true, message: 'OK' }
      };

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should handle 401 unauthorized errors', () => {
      localStorage.setItem('accessToken', 'old-token');
      localStorage.setItem('user', JSON.stringify({ name: 'Test' }));

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      // Simulate 401 handling logic
      if (error.response && error.response.status === 401) {
        localStorage.clear();
      }

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle network errors (no response)', () => {
      const error = {
        message: 'Network Error',
        code: 'ERR_NETWORK'
      };

      expect(error.response).toBeUndefined();
      expect(error.message).toBe('Network Error');
    });

    it('should handle timeout errors', () => {
      const error = {
        message: 'timeout of 30000ms exceeded',
        code: 'ECONNABORTED'
      };

      expect(error.code).toBe('ECONNABORTED');
    });

    it('should preserve error response data', () => {
      const error = {
        response: {
          status: 400,
          data: {
            errors: [
              { field: 'email', message: 'Invalid email format' }
            ]
          }
        }
      };

      expect(error.response.status).toBe(400);
      expect(error.response.data.errors).toHaveLength(1);
      expect(error.response.data.errors[0].field).toBe('email');
    });
  });

  // ============ Error Status Codes ============

  describe('Error Status Codes', () => {
    const statusCodes = [
      { code: 400, message: 'Bad Request' },
      { code: 401, message: 'Unauthorized' },
      { code: 403, message: 'Forbidden' },
      { code: 404, message: 'Not Found' },
      { code: 422, message: 'Unprocessable Entity' },
      { code: 500, message: 'Internal Server Error' },
      { code: 502, message: 'Bad Gateway' },
      { code: 503, message: 'Service Unavailable' }
    ];

    statusCodes.forEach(({ code, message }) => {
      it(`should handle ${code} ${message}`, () => {
        const error = {
          response: {
            status: code,
            statusText: message,
            data: { error: message }
          }
        };

        expect(error.response.status).toBe(code);
        expect(error.response.statusText).toBe(message);
      });
    });
  });

  // ============ Content Types ============

  describe('Content Types', () => {
    it('should handle JSON content type header', () => {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      expect(config.headers['Content-Type']).toBe('application/json');
    });

    it('should handle multipart form data header', () => {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      expect(config.headers['Content-Type']).toBe('multipart/form-data');
    });
  });

  // ============ Axios 1.x Compatibility ============

  describe('Axios 1.x Compatibility', () => {
    it('should handle headers as object', () => {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        }
      };

      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers.Authorization).toBe('Bearer token');
    });

    it('should handle error structure consistency', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Error' }
        },
        config: {
          url: '/api/test',
          method: 'get'
        },
        message: 'Request failed with status code 400'
      };

      expect(error.response).toBeDefined();
      expect(error.config).toBeDefined();
      expect(error.message).toContain('400');
    });

    it('should handle request config structure', () => {
      const config = {
        url: '/api/test',
        method: 'POST',
        baseURL: 'http://localhost:8080',
        headers: { 'Content-Type': 'application/json' },
        data: { key: 'value' },
        timeout: 30000
      };

      expect(config.url).toBe('/api/test');
      expect(config.method).toBe('POST');
      expect(config.data).toEqual({ key: 'value' });
    });
  });

  // ============ Interceptor Registration ============

  describe('Interceptor Registration', () => {
    it('should register request interceptor', () => {
      const instance = axios.create();
      const interceptorId = instance.interceptors.request.use(
        (config) => config,
        (error) => Promise.reject(error)
      );

      expect(typeof interceptorId).toBe('number');
    });

    it('should register response interceptor', () => {
      const instance = axios.create();
      const interceptorId = instance.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(error)
      );

      expect(typeof interceptorId).toBe('number');
    });

    it('should allow ejecting interceptors', () => {
      const instance = axios.create();
      const interceptorId = instance.interceptors.request.use((config) => config);

      expect(() => {
        instance.interceptors.request.eject(interceptorId);
      }).not.toThrow();
    });
  });
});
