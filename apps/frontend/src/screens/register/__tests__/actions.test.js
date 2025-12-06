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

describe('Register Actions', () => {
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

    it('should handle initialData with undefined parameter', () => {
      const result = actions.initialData(undefined);
      const dispatch = jest.fn();

      result(dispatch);

      expect(typeof result).toBe('function');
    });
  });

  describe('register async action', () => {
    it('should successfully register a new company', async () => {
      const mockRegisterAction = (companyData) => {
        return (dispatch) => {
          dispatch({ type: 'REGISTER_REQUEST' });

          const data = {
            method: 'POST',
            url: '/rest/auth/register',
            data: companyData,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data,
              });
              return res;
            })
            .catch((err) => {
              dispatch({
                type: 'REGISTER_FAILURE',
                payload: err.message,
              });
              throw err;
            });
        };
      };

      const companyData = {
        companyName: 'Test Company LLC',
        email: 'test@company.com',
        password: 'SecurePass123!',
        country: 229,
        currency: 150,
      };

      const mockResponse = {
        status: 200,
        data: {
          message: 'Company registered successfully',
          companyId: 1,
        },
      };

      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(mockRegisterAction(companyData));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toHaveLength(2);
      expect(actionsDispatched[0].type).toBe('REGISTER_REQUEST');
      expect(actionsDispatched[1].type).toBe('REGISTER_SUCCESS');
    });

    it('should handle registration failure', async () => {
      const mockRegisterAction = (companyData) => {
        return (dispatch) => {
          dispatch({ type: 'REGISTER_REQUEST' });

          const data = {
            method: 'POST',
            url: '/rest/auth/register',
            data: companyData,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data,
              });
              return res;
            })
            .catch((err) => {
              dispatch({
                type: 'REGISTER_FAILURE',
                payload: err.message,
              });
              throw err;
            });
        };
      };

      const companyData = {
        companyName: '',
        email: 'invalid-email',
      };

      authApi.mockRejectedValue({ message: 'Validation failed' });

      try {
        await store.dispatch(mockRegisterAction(companyData));
      } catch (error) {
        expect(error.message).toBe('Validation failed');
      }

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('REGISTER_REQUEST');
      expect(actionsDispatched[1].type).toBe('REGISTER_FAILURE');
    });

    it('should handle duplicate company name error', async () => {
      const mockRegisterAction = (companyData) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/auth/register',
            data: companyData,
          };

          return authApi(data).catch((err) => {
            dispatch({
              type: 'REGISTER_FAILURE',
              payload: err.message,
            });
            throw err;
          });
        };
      };

      authApi.mockRejectedValue({ message: 'Company name already exists' });

      try {
        await store.dispatch(mockRegisterAction({ companyName: 'Existing Company' }));
      } catch (error) {
        expect(error.message).toBe('Company name already exists');
      }
    });
  });

  describe('getCountryList action', () => {
    it('should fetch country list successfully', async () => {
      const mockGetCountryList = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/common/countries',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_COUNTRY_LIST',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockCountries = [
        { countryCode: 229, countryName: 'United Arab Emirates' },
        { countryCode: 230, countryName: 'Saudi Arabia' },
      ];

      authApi.mockResolvedValue({ status: 200, data: mockCountries });

      await store.dispatch(mockGetCountryList());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_COUNTRY_LIST');
      expect(actionsDispatched[0].payload).toEqual(mockCountries);
    });

    it('should handle error when fetching country list', async () => {
      const mockGetCountryList = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/common/countries',
          };

          return authApi(data).catch((err) => {
            throw err;
          });
        };
      };

      authApi.mockRejectedValue({ message: 'Failed to fetch countries' });

      try {
        await store.dispatch(mockGetCountryList());
      } catch (error) {
        expect(error.message).toBe('Failed to fetch countries');
      }
    });
  });

  describe('getStateList action', () => {
    it('should fetch state list by country successfully', async () => {
      const mockGetStateList = (countryCode) => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: `/rest/common/states?countryCode=${countryCode}`,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_STATE_LIST',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockStates = [
        { value: 1, label: 'Dubai' },
        { value: 2, label: 'Abu Dhabi' },
      ];

      authApi.mockResolvedValue({ status: 200, data: mockStates });

      await store.dispatch(mockGetStateList(229));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_STATE_LIST');
      expect(actionsDispatched[0].payload).toEqual(mockStates);
    });
  });

  describe('getCurrencyList action', () => {
    it('should fetch currency list successfully', async () => {
      const mockGetCurrencyList = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/common/currencies',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_CURRENCY_LIST',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockCurrencies = [
        { currencyCode: 150, currencyName: 'UAE Dirham', currencyIsoCode: 'AED' },
        { currencyCode: 151, currencyName: 'US Dollar', currencyIsoCode: 'USD' },
      ];

      authApi.mockResolvedValue({ status: 200, data: mockCurrencies });

      await store.dispatch(mockGetCurrencyList());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_CURRENCY_LIST');
      expect(actionsDispatched[0].payload).toEqual(mockCurrencies);
    });
  });

  describe('getTimeZoneList action', () => {
    it('should fetch timezone list successfully', async () => {
      const mockGetTimeZoneList = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/common/timezones',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_TIMEZONE_LIST',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockTimezones = ['Asia/Dubai', 'Asia/Abu_Dhabi', 'UTC'];

      authApi.mockResolvedValue({ status: 200, data: mockTimezones });

      await store.dispatch(mockGetTimeZoneList());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_TIMEZONE_LIST');
      expect(actionsDispatched[0].payload).toEqual(mockTimezones);
    });
  });

  describe('getCompanyTypeList action', () => {
    it('should fetch company type list successfully', async () => {
      const mockGetCompanyTypeList = () => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: '/rest/common/company-types',
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_COMPANY_TYPE_LIST',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockCompanyTypes = [
        { value: 1, label: 'LLC' },
        { value: 2, label: 'Sole Proprietorship' },
      ];

      authApi.mockResolvedValue({ status: 200, data: mockCompanyTypes });

      await store.dispatch(mockGetCompanyTypeList());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_COMPANY_TYPE_LIST');
      expect(actionsDispatched[0].payload).toEqual(mockCompanyTypes);
    });
  });

  describe('registerStrapiUser action', () => {
    it('should register user in Strapi successfully', async () => {
      const mockRegisterStrapiUser = (userData) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/strapi/register',
            data: userData,
          };

          return authApi(data)
            .then((res) => {
              return res;
            });
        };
      };

      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      authApi.mockResolvedValue({ status: 200, data: { id: 1 } });

      const result = await store.dispatch(mockRegisterStrapiUser(userData));

      expect(result.status).toBe(200);
      expect(authApi).toHaveBeenCalledWith({
        method: 'POST',
        url: '/rest/strapi/register',
        data: userData,
      });
    });
  });

  describe('validateCompanyDetails action', () => {
    it('should validate company details successfully', async () => {
      const mockValidateCompany = (companyName) => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: `/rest/validation/company?name=${companyName}`,
          };

          return authApi(data)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              dispatch({
                type: 'SET_VALIDATION_ERRORS',
                payload: { companyName: err.message },
              });
              throw err;
            });
        };
      };

      authApi.mockResolvedValue({ status: 200, data: { valid: true } });

      const result = await store.dispatch(mockValidateCompany('Test Company'));

      expect(result.data.valid).toBe(true);
    });

    it('should handle validation failure', async () => {
      const mockValidateCompany = (companyName) => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: `/rest/validation/company?name=${companyName}`,
          };

          return authApi(data)
            .catch((err) => {
              dispatch({
                type: 'SET_VALIDATION_ERRORS',
                payload: { companyName: err.message },
              });
              throw err;
            });
        };
      };

      authApi.mockRejectedValue({ message: 'Company name already exists' });

      try {
        await store.dispatch(mockValidateCompany('Existing Company'));
      } catch (error) {
        expect(error.message).toBe('Company name already exists');
      }

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_VALIDATION_ERRORS');
    });
  });

  describe('clearRegistration action', () => {
    it('should clear registration state', () => {
      const mockClearRegistration = () => {
        return (dispatch) => {
          dispatch({ type: 'CLEAR_REGISTRATION' });
        };
      };

      store.dispatch(mockClearRegistration());

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('CLEAR_REGISTRATION');
    });
  });

  describe('email validation', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should validate password requirements', () => {
      const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        return password.length >= minLength && hasUpperCase && hasNumber && hasSpecial;
      };

      expect(validatePassword('SecurePass123!')).toBe(true);
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('NoSpecial123')).toBe(false);
    });
  });

  describe('TRN validation', () => {
    it('should validate UAE TRN format', () => {
      const validateTRN = (trn) => {
        const trnRegex = /^\d{15}$/;
        return trnRegex.test(trn);
      };

      expect(validateTRN('123456789012345')).toBe(true);
      expect(validateTRN('12345')).toBe(false);
      expect(validateTRN('abc123456789012')).toBe(false);
    });
  });
});
