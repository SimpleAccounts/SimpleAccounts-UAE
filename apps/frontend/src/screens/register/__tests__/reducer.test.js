import { AUTH } from 'constants/types';

describe('Register Reducer', () => {
  const initialState = {
    registering: false,
    registered: false,
    error: null,
    country_list: [],
    state_list: [],
    currency_list: [],
    timezone_list: [],
    company_type_list: [],
    company_count: 0,
    validation_errors: {},
  };

  const mockReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
      case 'REGISTER_REQUEST':
        return {
          ...state,
          registering: true,
          error: null,
          validation_errors: {},
        };

      case 'REGISTER_SUCCESS':
        return {
          ...state,
          registering: false,
          registered: true,
          error: null,
        };

      case 'REGISTER_FAILURE':
        return {
          ...state,
          registering: false,
          registered: false,
          error: payload,
        };

      case 'SET_COUNTRY_LIST':
        return {
          ...state,
          country_list: payload,
        };

      case 'SET_STATE_LIST':
        return {
          ...state,
          state_list: payload,
        };

      case 'SET_CURRENCY_LIST':
        return {
          ...state,
          currency_list: payload,
        };

      case 'SET_TIMEZONE_LIST':
        return {
          ...state,
          timezone_list: payload,
        };

      case 'SET_COMPANY_TYPE_LIST':
        return {
          ...state,
          company_type_list: payload,
        };

      case 'SET_VALIDATION_ERRORS':
        return {
          ...state,
          validation_errors: payload,
        };

      case 'CLEAR_REGISTRATION':
        return initialState;

      default:
        return state;
    }
  };

  it('should return the initial state', () => {
    const state = mockReducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should handle REGISTER_REQUEST action', () => {
    const action = { type: 'REGISTER_REQUEST' };
    const state = mockReducer(initialState, action);

    expect(state.registering).toBe(true);
    expect(state.error).toBe(null);
    expect(state.validation_errors).toEqual({});
  });

  it('should handle REGISTER_SUCCESS action', () => {
    const action = { type: 'REGISTER_SUCCESS' };
    const state = mockReducer(initialState, action);

    expect(state.registering).toBe(false);
    expect(state.registered).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle REGISTER_FAILURE action', () => {
    const errorMessage = 'Registration failed';
    const action = { type: 'REGISTER_FAILURE', payload: errorMessage };
    const state = mockReducer(initialState, action);

    expect(state.registering).toBe(false);
    expect(state.registered).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it('should handle SET_COUNTRY_LIST action', () => {
    const countries = [
      { countryCode: 229, countryName: 'United Arab Emirates' },
      { countryCode: 230, countryName: 'Saudi Arabia' },
    ];
    const action = { type: 'SET_COUNTRY_LIST', payload: countries };
    const state = mockReducer(initialState, action);

    expect(state.country_list).toEqual(countries);
    expect(state.country_list).toHaveLength(2);
  });

  it('should handle SET_STATE_LIST action', () => {
    const states = [
      { value: 1, label: 'Dubai' },
      { value: 2, label: 'Abu Dhabi' },
    ];
    const action = { type: 'SET_STATE_LIST', payload: states };
    const state = mockReducer(initialState, action);

    expect(state.state_list).toEqual(states);
  });

  it('should handle SET_CURRENCY_LIST action', () => {
    const currencies = [
      { currencyCode: 150, currencyName: 'UAE Dirham', currencyIsoCode: 'AED' },
      { currencyCode: 151, currencyName: 'US Dollar', currencyIsoCode: 'USD' },
    ];
    const action = { type: 'SET_CURRENCY_LIST', payload: currencies };
    const state = mockReducer(initialState, action);

    expect(state.currency_list).toEqual(currencies);
  });

  it('should handle SET_TIMEZONE_LIST action', () => {
    const timezones = ['Asia/Dubai', 'Asia/Abu_Dhabi', 'UTC'];
    const action = { type: 'SET_TIMEZONE_LIST', payload: timezones };
    const state = mockReducer(initialState, action);

    expect(state.timezone_list).toEqual(timezones);
  });

  it('should handle SET_COMPANY_TYPE_LIST action', () => {
    const companyTypes = [
      { value: 1, label: 'LLC' },
      { value: 2, label: 'Sole Proprietorship' },
      { value: 3, label: 'Partnership' },
    ];
    const action = { type: 'SET_COMPANY_TYPE_LIST', payload: companyTypes };
    const state = mockReducer(initialState, action);

    expect(state.company_type_list).toEqual(companyTypes);
    expect(state.company_type_list).toHaveLength(3);
  });

  it('should handle SET_VALIDATION_ERRORS action', () => {
    const errors = {
      companyName: 'Company name is required',
      email: 'Invalid email format',
    };
    const action = { type: 'SET_VALIDATION_ERRORS', payload: errors };
    const state = mockReducer(initialState, action);

    expect(state.validation_errors).toEqual(errors);
  });

  it('should handle CLEAR_REGISTRATION action', () => {
    const modifiedState = {
      registering: true,
      registered: true,
      error: 'Some error',
      country_list: [{ countryCode: 1 }],
      state_list: [{ value: 1 }],
      currency_list: [{ currencyCode: 1 }],
      timezone_list: ['UTC'],
      company_type_list: [{ value: 1 }],
      company_count: 5,
      validation_errors: { error: 'test' },
    };

    const action = { type: 'CLEAR_REGISTRATION' };
    const state = mockReducer(modifiedState, action);

    expect(state).toEqual(initialState);
  });

  it('should clear validation errors on REGISTER_REQUEST', () => {
    const stateWithErrors = {
      ...initialState,
      validation_errors: { email: 'Invalid email' },
    };

    const action = { type: 'REGISTER_REQUEST' };
    const state = mockReducer(stateWithErrors, action);

    expect(state.validation_errors).toEqual({});
  });

  it('should maintain data lists when registration fails', () => {
    const stateWithData = {
      ...initialState,
      country_list: [{ countryCode: 229 }],
      currency_list: [{ currencyCode: 150 }],
    };

    const action = { type: 'REGISTER_FAILURE', payload: 'Failed' };
    const state = mockReducer(stateWithData, action);

    expect(state.country_list).toEqual([{ countryCode: 229 }]);
    expect(state.currency_list).toEqual([{ currencyCode: 150 }]);
  });

  it('should not mutate original state', () => {
    const originalState = { ...initialState };
    const action = { type: 'REGISTER_REQUEST' };

    mockReducer(initialState, action);

    expect(initialState).toEqual(originalState);
  });

  it('should handle empty country list', () => {
    const action = { type: 'SET_COUNTRY_LIST', payload: [] };
    const state = mockReducer(initialState, action);

    expect(state.country_list).toEqual([]);
  });

  it('should preserve state for unknown action types', () => {
    const currentState = {
      ...initialState,
      registered: true,
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const state = mockReducer(currentState, action);

    expect(state).toEqual(currentState);
  });
});
