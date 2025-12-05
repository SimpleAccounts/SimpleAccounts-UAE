import CommonReducer from './reducer';
import { COMMON } from 'constants/types';

describe('CommonReducer', () => {
  const initialState = {
    is_loading: false,
    version: '',
    tostifyAlertFunc: null,
    tostifyAlert: {},
    universal_currency_list: [],
    currency_list: [],
    user_role_list: [],
    company_profile: [],
    country_list: [],
    state_list: [],
    company_type_list: [],
    tax_treatment_list: [],
    vat_list: [],
    product_list: [],
    excise_list: [],
    customer_list: [],
    pay_mode: [],
    company_details: [],
    salary_component_list: [],
    companyCurrency: [],
    currency_convert_list: [],
  };

  it('should return initial state when no action provided', () => {
    const result = CommonReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  describe('Loading state', () => {
    it('should handle START_LOADING', () => {
      const result = CommonReducer(initialState, { type: COMMON.START_LOADING });
      expect(result.is_loading).toBe(true);
    });

    it('should handle END_LOADING', () => {
      const state = { ...initialState, is_loading: true };
      const result = CommonReducer(state, { type: COMMON.END_LOADING });
      expect(result.is_loading).toBe(false);
    });
  });

  describe('Toast notifications', () => {
    it('should handle TOSTIFY_ALERT_FUNC', () => {
      const alertFunc = jest.fn();
      const action = {
        type: COMMON.TOSTIFY_ALERT_FUNC,
        payload: { data: alertFunc },
      };

      const result = CommonReducer(initialState, action);
      expect(result.tostifyAlertFunc).toBe(alertFunc);
    });

    it('should handle TOSTIFY_ALERT and call alert function', () => {
      const alertFunc = jest.fn();
      const state = { ...initialState, tostifyAlertFunc: alertFunc };
      const action = {
        type: COMMON.TOSTIFY_ALERT,
        payload: { status: 'success', message: 'Test message' },
      };

      const result = CommonReducer(state, action);

      expect(alertFunc).toHaveBeenCalledWith('success', 'Test message');
      expect(result.tostifyAlert).toEqual({ status: 'success', message: 'Test message' });
    });

    it('should handle TOSTIFY_ALERT when no alert function set', () => {
      const action = {
        type: COMMON.TOSTIFY_ALERT,
        payload: { status: 'error', message: 'Error message' },
      };

      const result = CommonReducer(initialState, action);

      expect(result.tostifyAlert).toEqual({ status: 'error', message: 'Error message' });
    });
  });

  describe('Version', () => {
    it('should handle GET_SIMPLE_ACCOUNTS_RELEASE', () => {
      const action = {
        type: COMMON.GET_SIMPLE_ACCOUNTS_RELEASE,
        payload: { data: '1.2.3' },
      };

      const result = CommonReducer(initialState, action);
      expect(result.version).toBe('1.2.3');
    });
  });

  describe('Currency lists', () => {
    it('should handle UNIVERSAL_CURRENCY_LIST', () => {
      const currencies = [{ id: 1, code: 'USD' }, { id: 2, code: 'AED' }];
      const action = {
        type: COMMON.UNIVERSAL_CURRENCY_LIST,
        payload: { data: currencies },
      };

      const result = CommonReducer(initialState, action);
      expect(result.universal_currency_list).toEqual(currencies);
    });

    it('should handle CURRENCY_LIST', () => {
      const currencies = [{ id: 1, code: 'EUR' }];
      const action = {
        type: COMMON.CURRENCY_LIST,
        payload: { data: currencies },
      };

      const result = CommonReducer(initialState, action);
      expect(result.currency_list).toEqual(currencies);
    });

    it('should handle COMPANY_CURRENCY', () => {
      const currency = [{ id: 1, code: 'AED' }];
      const action = {
        type: COMMON.COMPANY_CURRENCY,
        payload: currency,
      };

      const result = CommonReducer(initialState, action);
      expect(result.companyCurrency).toEqual(currency);
    });

    it('should handle CURRENCY_CONVERT_LIST', () => {
      const conversions = [{ from: 'USD', to: 'AED', rate: 3.67 }];
      const action = {
        type: COMMON.CURRENCY_CONVERT_LIST,
        payload: { data: conversions },
      };

      const result = CommonReducer(initialState, action);
      expect(result.currency_convert_list).toEqual(conversions);
    });
  });

  describe('Location lists', () => {
    it('should handle COUNTRY_LIST', () => {
      const countries = [{ id: 1, name: 'UAE' }];
      const action = {
        type: COMMON.COUNTRY_LIST,
        payload: countries,
      };

      const result = CommonReducer(initialState, action);
      expect(result.country_list).toEqual(countries);
    });

    it('should handle STATE_LIST', () => {
      const states = [{ id: 1, name: 'Dubai' }];
      const action = {
        type: COMMON.STATE_LIST,
        payload: states,
      };

      const result = CommonReducer(initialState, action);
      expect(result.state_list).toEqual(states);
    });
  });

  describe('Company data', () => {
    it('should handle COMPANY_TYPE', () => {
      const types = [{ id: 1, name: 'LLC' }];
      const action = {
        type: COMMON.COMPANY_TYPE,
        payload: types,
      };

      const result = CommonReducer(initialState, action);
      expect(result.company_type_list).toEqual(types);
    });

    it('should handle COMPANY_PROFILE', () => {
      const profile = [{ id: 1, name: 'Test Company' }];
      const action = {
        type: COMMON.COMPANY_PROFILE,
        payload: { data: profile },
      };

      const result = CommonReducer(initialState, action);
      expect(result.company_profile).toEqual(profile);
    });

    it('should handle COMPANY_DETAILS', () => {
      const details = [{ id: 1, address: '123 Main St' }];
      const action = {
        type: COMMON.COMPANY_DETAILS,
        payload: { data: details },
      };

      const result = CommonReducer(initialState, action);
      expect(result.company_details).toEqual(details);
    });
  });

  describe('Tax and VAT', () => {
    it('should handle TAX_TREATMENT_LIST', () => {
      const treatments = [{ id: 1, name: 'Standard' }];
      const action = {
        type: COMMON.TAX_TREATMENT_LIST,
        payload: { data: treatments },
      };

      const result = CommonReducer(initialState, action);
      expect(result.tax_treatment_list).toEqual(treatments);
    });

    it('should handle VAT_LIST', () => {
      const vatList = [{ id: 1, rate: 5 }];
      const action = {
        type: COMMON.VAT_LIST,
        payload: { data: vatList },
      };

      const result = CommonReducer(initialState, action);
      expect(result.vat_list).toEqual(vatList);
    });

    it('should handle EXCISE_LIST', () => {
      const exciseList = [{ id: 1, category: 'Tobacco' }];
      const action = {
        type: COMMON.EXCISE_LIST,
        payload: { data: exciseList },
      };

      const result = CommonReducer(initialState, action);
      expect(result.excise_list).toEqual(exciseList);
    });
  });

  describe('Product and Customer lists', () => {
    it('should handle PRODUCT_LIST', () => {
      const products = [{ id: 1, name: 'Product A' }];
      const action = {
        type: COMMON.PRODUCT_LIST,
        payload: { data: products },
      };

      const result = CommonReducer(initialState, action);
      expect(result.product_list).toEqual(products);
    });

    it('should handle CUSTOMER_LIST', () => {
      const customers = [{ id: 1, name: 'Customer A' }];
      const action = {
        type: COMMON.CUSTOMER_LIST,
        payload: { data: customers },
      };

      const result = CommonReducer(initialState, action);
      expect(result.customer_list).toEqual(customers);
    });
  });

  describe('Payment and Payroll', () => {
    it('should handle PAY_MODE', () => {
      const payModes = [{ id: 1, name: 'Cash' }];
      const action = {
        type: COMMON.PAY_MODE,
        payload: { data: payModes },
      };

      const result = CommonReducer(initialState, action);
      expect(result.pay_mode).toEqual(payModes);
    });

    it('should handle SALARY_COMPONENT_LIST', () => {
      const components = [{ id: 1, name: 'Basic Salary' }];
      const action = {
        type: COMMON.SALARY_COMPONENT_LIST,
        payload: { data: components },
      };

      const result = CommonReducer(initialState, action);
      expect(result.salary_component_list).toEqual(components);
    });
  });

  describe('User roles', () => {
    it('should handle USER_ROLE_LIST', () => {
      const roles = [{ id: 1, name: 'Admin' }];
      const action = {
        type: COMMON.USER_ROLE_LIST,
        payload: roles,
      };

      const result = CommonReducer(initialState, action);
      expect(result.user_role_list).toEqual(roles);
    });
  });

  it('should not mutate state on actions', () => {
    const state = { ...initialState };
    const action = { type: COMMON.START_LOADING };

    const result = CommonReducer(state, action);

    expect(result).not.toBe(state);
    expect(state.is_loading).toBe(false);
  });
});
