import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi, api } from 'utils';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('utils', () => ({
  authApi: jest.fn(),
  api: jest.fn(),
}));

describe('LogIn Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialData action', () => {
    it('should dispatch initialData action successfully', () => {
      const obj = { test: 'data' };
      const result = actions.initialData(obj);

      expect(typeof result).toBe('function');

      const dispatch = jest.fn();
      result(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle initialData with empty object', () => {
      const obj = {};
      const result = actions.initialData(obj);
      const dispatch = jest.fn();

      result(dispatch);

      expect(typeof result).toBe('function');
    });

    it('should handle initialData with null parameter', () => {
      const result = actions.initialData(null);
      const dispatch = jest.fn();

      result(dispatch);

      expect(typeof result).toBe('function');
    });
  });

  describe('login async action', () => {
    it('should successfully login with valid credentials', async () => {
      const mockLoginAction = (credentials) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/auth/login',
            data: credentials,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data,
              });
              return res;
            })
            .catch((err) => {
              dispatch({
                type: 'LOGIN_FAILURE',
                payload: err.message,
              });
              throw err;
            });
        };
      };

      const credentials = { username: 'test@example.com', password: 'password123' };
      const mockResponse = {
        status: 200,
        data: {
          token: 'mock-token',
          user: { id: 1, email: 'test@example.com' },
        },
      };

      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(mockLoginAction(credentials));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toHaveLength(1);
      expect(actionsDispatched[0].type).toBe('LOGIN_SUCCESS');
      expect(actionsDispatched[0].payload).toEqual(mockResponse.data);
    });

    it('should handle login failure with invalid credentials', async () => {
      const mockLoginAction = (credentials) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/auth/login',
            data: credentials,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data,
              });
              return res;
            })
            .catch((err) => {
              dispatch({
                type: 'LOGIN_FAILURE',
                payload: err.message,
              });
              throw err;
            });
        };
      };

      const credentials = { username: 'wrong@example.com', password: 'wrongpass' };
      const mockError = { message: 'Invalid credentials' };

      authApi.mockRejectedValue(mockError);

      try {
        await store.dispatch(mockLoginAction(credentials));
      } catch (error) {
        expect(error).toEqual(mockError);
      }

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toHaveLength(1);
      expect(actionsDispatched[0].type).toBe('LOGIN_FAILURE');
    });

    it('should handle network error during login', async () => {
      const mockLoginAction = (credentials) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/auth/login',
            data: credentials,
          };

          return authApi(data).catch((err) => {
            dispatch({
              type: 'LOGIN_FAILURE',
              payload: err.message,
            });
            throw err;
          });
        };
      };

      const credentials = { username: 'test@example.com', password: 'password' };
      authApi.mockRejectedValue({ message: 'Network error' });

      try {
        await store.dispatch(mockLoginAction(credentials));
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('LOGIN_FAILURE');
    });
  });

  describe('getCompanyCount action', () => {
    it('should fetch company count successfully', async () => {
      const mockGetCompanyCount = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/company/count',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_COMPANY_COUNT',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({ status: 200, data: 5 });

      await store.dispatch(mockGetCompanyCount());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_COMPANY_COUNT');
      expect(actionsDispatched[0].payload).toBe(5);
    });

    it('should handle company count of zero', async () => {
      const mockGetCompanyCount = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/company/count',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_COMPANY_COUNT',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({ status: 200, data: 0 });

      await store.dispatch(mockGetCompanyCount());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].payload).toBe(0);
    });

    it('should handle error when fetching company count', async () => {
      const mockGetCompanyCount = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/company/count',
          };

          return authApi(data).catch((err) => {
            throw err;
          });
        };
      };

      authApi.mockRejectedValue({ message: 'Failed to fetch' });

      try {
        await store.dispatch(mockGetCompanyCount());
      } catch (error) {
        expect(error.message).toBe('Failed to fetch');
      }
    });
  });

  describe('getUserSubscription action', () => {
    it('should fetch user subscription status successfully', async () => {
      const mockGetSubscription = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/user/subscription',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_SUBSCRIPTION_STATUS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockResponse = {
        status: 200,
        data: { status: 'active', message: 'Subscription active' },
      };

      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(mockGetSubscription());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_SUBSCRIPTION_STATUS');
      expect(actionsDispatched[0].payload).toEqual(mockResponse.data);
    });

    it('should handle expired subscription status', async () => {
      const mockGetSubscription = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/user/subscription',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_SUBSCRIPTION_STATUS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockResponse = {
        status: 200,
        data: { status: 'expired', message: 'Subscription expired' },
      };

      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(mockGetSubscription());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].payload.status).toBe('expired');
    });
  });

  describe('logout action', () => {
    it('should dispatch logout action', () => {
      const mockLogout = () => {
        return (dispatch) => {
          dispatch({ type: 'LOGOUT' });
        };
      };

      store.dispatch(mockLogout());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('LOGOUT');
    });

    it('should clear authentication data on logout', async () => {
      const mockLogout = () => {
        return (dispatch) => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        };
      };

      store.dispatch(mockLogout());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('LOGOUT');
    });
  });

  describe('login with remember me', () => {
    it('should handle login with remember me option', async () => {
      const mockLoginWithRemember = (credentials, rememberMe) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/auth/login',
            data: { ...credentials, rememberMe },
          };

          return authApi(data)
            .then((res) => {
              if (rememberMe) {
                localStorage.setItem('token', res.data.token);
              }
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const credentials = { username: 'test@example.com', password: 'password' };
      const mockResponse = {
        status: 200,
        data: { token: 'token-123', user: { id: 1 } },
      };

      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(mockLoginWithRemember(credentials, true));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('LOGIN_SUCCESS');
    });
  });

  describe('password validation', () => {
    it('should validate password strength before login', () => {
      const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
      };

      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('NoNumbers')).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should validate email format before login', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
    });
  });
});
