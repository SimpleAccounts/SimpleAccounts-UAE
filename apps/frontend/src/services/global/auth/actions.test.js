import { AUTH, COMMON } from 'constants/types';
import * as authActions from './actions';

// Mock the api modules
jest.mock('utils', () => ({
  api: jest.fn(),
  authApi: jest.fn(),
  cryptoService: {
    encryptService: jest.fn(),
  },
}));

import { api, authApi, cryptoService } from 'utils';

describe('Auth Actions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    jest.clearAllMocks();
    // Clear localStorage
    window.localStorage.clear();
  });

  describe('logIn', () => {
    it('should dispatch SIGNED_IN and store token on successful login', async () => {
      const mockResponse = {
        status: 200,
        data: { token: 'test-token-123' },
      };
      api.mockResolvedValue(mockResponse);

      const credentials = { username: 'test@example.com', password: 'password123' };
      const thunk = authActions.logIn(credentials);

      await thunk(dispatch);

      expect(api).toHaveBeenCalledWith({
        method: 'post',
        url: '/auth/token',
        data: credentials,
      });
      expect(dispatch).toHaveBeenCalledWith({ type: AUTH.SIGNED_IN });
      expect(window.localStorage.getItem('accessToken')).toBe('test-token-123');
      expect(window.localStorage.getItem('language')).toBe('en');
    });

    it('should throw error on login failure', async () => {
      const mockError = new Error('Invalid credentials');
      api.mockRejectedValue(mockError);

      const credentials = { username: 'test@example.com', password: 'wrong' };
      const thunk = authActions.logIn(credentials);

      await expect(thunk(dispatch)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logOut', () => {
    it('should clear localStorage and dispatch SIGNED_OUT', () => {
      window.localStorage.setItem('accessToken', 'test-token');
      window.localStorage.setItem('language', 'en');

      const thunk = authActions.logOut();
      thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: AUTH.SIGNED_OUT });
      expect(window.localStorage.getItem('accessToken')).toBeNull();
      expect(window.localStorage.getItem('language')).toBeNull();
    });
  });

  describe('checkAuthStatus', () => {
    it('should dispatch SIGNED_IN and USER_PROFILE on successful auth check', async () => {
      const mockResponse = {
        status: 200,
        data: { userId: 1, email: 'test@example.com' },
      };
      authApi.mockResolvedValue(mockResponse);

      const thunk = authActions.checkAuthStatus();
      await thunk(dispatch);

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/user/current',
      });
      expect(dispatch).toHaveBeenCalledWith({ type: AUTH.SIGNED_IN });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTH.USER_PROFILE,
        payload: { data: mockResponse.data },
      });
      expect(cryptoService.encryptService).toHaveBeenCalledWith('userId', 1);
    });

    it('should throw error when auth status is not 200', async () => {
      const mockResponse = { status: 401 };
      authApi.mockResolvedValue(mockResponse);

      const thunk = authActions.checkAuthStatus();

      await expect(thunk(dispatch)).rejects.toThrow('Auth Failed');
    });

    it('should throw error when api call fails', async () => {
      const mockError = new Error('Network error');
      authApi.mockRejectedValue(mockError);

      const thunk = authActions.checkAuthStatus();

      await expect(thunk(dispatch)).rejects.toThrow('Network error');
    });
  });

  describe('getCurrencyList', () => {
    it('should dispatch UNIVERSAL_CURRENCY_LIST on success', async () => {
      const mockResponse = {
        status: 200,
        data: [{ id: 1, code: 'USD' }, { id: 2, code: 'AED' }],
      };
      api.mockResolvedValue(mockResponse);

      const thunk = authActions.getCurrencyList();
      await thunk(dispatch);

      expect(api).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/company/getCurrency',
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: COMMON.UNIVERSAL_CURRENCY_LIST,
        payload: { data: mockResponse.data },
      });
    });
  });

  describe('getCurrencylist (auth)', () => {
    it('should dispatch CURRENCY_LIST on success', async () => {
      const mockResponse = {
        status: 200,
        data: [{ id: 1, code: 'USD' }],
      };
      authApi.mockResolvedValue(mockResponse);

      const thunk = authActions.getCurrencylist();
      await thunk(dispatch);

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/currency/getcurrency',
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: COMMON.CURRENCY_LIST,
        payload: { data: mockResponse.data },
      });
    });
  });

  describe('getCompanyCount', () => {
    it('should return response on success', async () => {
      const mockResponse = { status: 200, data: { count: 5 } };
      api.mockResolvedValue(mockResponse);

      const thunk = authActions.getCompanyCount();
      const result = await thunk(dispatch);

      expect(api).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/company/getCompanyCount',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failure', async () => {
      const mockError = new Error('Server error');
      api.mockRejectedValue(mockError);

      const thunk = authActions.getCompanyCount();

      await expect(thunk(dispatch)).rejects.toThrow('Server error');
    });
  });

  describe('getTimeZoneList', () => {
    it('should return timezone list on success', async () => {
      const mockResponse = {
        status: 200,
        data: [{ id: 1, name: 'UTC' }, { id: 2, name: 'Asia/Dubai' }],
      };
      api.mockResolvedValue(mockResponse);

      const thunk = authActions.getTimeZoneList();
      const result = await thunk(dispatch);

      expect(api).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/company/getTimeZoneList',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSimpleAccountsreleasenumber', () => {
    it('should return release number on success', async () => {
      const mockResponse = { status: 200, data: '1.2.3' };
      api.mockResolvedValue(mockResponse);

      const thunk = authActions.getSimpleAccountsreleasenumber();
      const result = await thunk(dispatch);

      expect(api).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/company/getSimpleAccountsreleasenumber',
      });
      expect(result).toBe('1.2.3');
    });
  });

  describe('register', () => {
    it('should call register API with company data', async () => {
      const mockResponse = { status: 200 };
      api.mockResolvedValue(mockResponse);

      const companyData = { name: 'Test Company', email: 'test@example.com' };
      const thunk = authActions.register(companyData);
      await thunk(dispatch);

      expect(api).toHaveBeenCalledWith({
        method: 'post',
        url: '/rest/company/register',
        data: companyData,
      });
    });

    it('should throw error on registration failure', async () => {
      const mockError = new Error('Registration failed');
      api.mockRejectedValue(mockError);

      const thunk = authActions.register({});

      await expect(thunk(dispatch)).rejects.toThrow('Registration failed');
    });
  });

  describe('getUserSubscription', () => {
    it('should return subscription data on success', async () => {
      const mockResponse = {
        status: 200,
        data: { subscriptionType: 'premium', active: true },
      };
      api.mockResolvedValue(mockResponse);

      const thunk = authActions.getUserSubscription();
      const result = await thunk(dispatch);

      expect(api).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on subscription check failure', async () => {
      const mockError = new Error('Subscription check failed');
      api.mockRejectedValue(mockError);

      const thunk = authActions.getUserSubscription();

      await expect(thunk(dispatch)).rejects.toThrow('Subscription check failed');
    });
  });
});
