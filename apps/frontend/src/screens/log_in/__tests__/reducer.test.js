import { AUTH } from 'constants/types';

describe('LogIn Reducer', () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    company_count: 0,
    subscription_status: null,
  };

  const mockReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
      case 'LOGIN_REQUEST':
        return {
          ...state,
          loading: true,
          error: null,
        };

      case 'LOGIN_SUCCESS':
        return {
          ...state,
          loading: false,
          isAuthenticated: true,
          user: payload.user,
          token: payload.token,
          error: null,
        };

      case 'LOGIN_FAILURE':
        return {
          ...state,
          loading: false,
          isAuthenticated: false,
          error: payload,
        };

      case 'SET_COMPANY_COUNT':
        return {
          ...state,
          company_count: payload,
        };

      case 'SET_SUBSCRIPTION_STATUS':
        return {
          ...state,
          subscription_status: payload,
        };

      case 'LOGOUT':
        return initialState;

      default:
        return state;
    }
  };

  it('should return the initial state', () => {
    const state = mockReducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should handle LOGIN_REQUEST action', () => {
    const action = { type: 'LOGIN_REQUEST' };
    const state = mockReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle LOGIN_SUCCESS action', () => {
    const payload = {
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      token: 'test-token-123',
    };
    const action = { type: 'LOGIN_SUCCESS', payload };
    const state = mockReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(payload.user);
    expect(state.token).toEqual(payload.token);
    expect(state.error).toBe(null);
  });

  it('should handle LOGIN_FAILURE action', () => {
    const errorMessage = 'Invalid credentials';
    const action = { type: 'LOGIN_FAILURE', payload: errorMessage };
    const state = mockReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it('should handle SET_COMPANY_COUNT action', () => {
    const action = { type: 'SET_COMPANY_COUNT', payload: 5 };
    const state = mockReducer(initialState, action);

    expect(state.company_count).toBe(5);
  });

  it('should handle SET_SUBSCRIPTION_STATUS action', () => {
    const status = { status: 'active', message: 'Subscription is active' };
    const action = { type: 'SET_SUBSCRIPTION_STATUS', payload: status };
    const state = mockReducer(initialState, action);

    expect(state.subscription_status).toEqual(status);
  });

  it('should handle LOGOUT action', () => {
    const authenticatedState = {
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com' },
      token: 'test-token',
      loading: false,
      error: null,
      company_count: 3,
      subscription_status: { status: 'active' },
    };

    const action = { type: 'LOGOUT' };
    const state = mockReducer(authenticatedState, action);

    expect(state).toEqual(initialState);
  });

  it('should preserve state when unknown action is dispatched', () => {
    const currentState = {
      ...initialState,
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com' },
    };

    const action = { type: 'UNKNOWN_ACTION' };
    const state = mockReducer(currentState, action);

    expect(state).toEqual(currentState);
  });

  it('should not mutate original state on LOGIN_REQUEST', () => {
    const originalState = { ...initialState };
    const action = { type: 'LOGIN_REQUEST' };

    mockReducer(initialState, action);

    expect(initialState).toEqual(originalState);
  });

  it('should handle multiple consecutive LOGIN_FAILURE actions', () => {
    const firstError = 'First error';
    const secondError = 'Second error';

    let state = mockReducer(initialState, { type: 'LOGIN_FAILURE', payload: firstError });
    expect(state.error).toBe(firstError);

    state = mockReducer(state, { type: 'LOGIN_FAILURE', payload: secondError });
    expect(state.error).toBe(secondError);
  });

  it('should clear error on successful login after failure', () => {
    const errorState = mockReducer(initialState, {
      type: 'LOGIN_FAILURE',
      payload: 'Login failed',
    });

    expect(errorState.error).toBe('Login failed');

    const successState = mockReducer(errorState, {
      type: 'LOGIN_SUCCESS',
      payload: {
        user: { id: 1, email: 'test@example.com' },
        token: 'token-123',
      },
    });

    expect(successState.error).toBe(null);
    expect(successState.isAuthenticated).toBe(true);
  });

  it('should handle LOGIN_SUCCESS with minimal user data', () => {
    const payload = {
      user: { id: 1 },
      token: 'minimal-token',
    };
    const action = { type: 'LOGIN_SUCCESS', payload };
    const state = mockReducer(initialState, action);

    expect(state.user).toEqual({ id: 1 });
    expect(state.isAuthenticated).toBe(true);
  });

  it('should reset authentication state on LOGOUT after successful login', () => {
    let state = mockReducer(initialState, {
      type: 'LOGIN_SUCCESS',
      payload: {
        user: { id: 1, email: 'test@example.com' },
        token: 'token-123',
      },
    });

    expect(state.isAuthenticated).toBe(true);

    state = mockReducer(state, { type: 'LOGOUT' });

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
  });

  it('should maintain company count through login/logout cycle', () => {
    let state = mockReducer(initialState, {
      type: 'SET_COMPANY_COUNT',
      payload: 10,
    });

    expect(state.company_count).toBe(10);

    state = mockReducer(state, { type: 'LOGOUT' });

    expect(state.company_count).toBe(0);
  });

  it('should handle setting company count to zero', () => {
    const action = { type: 'SET_COMPANY_COUNT', payload: 0 };
    const state = mockReducer(initialState, action);

    expect(state.company_count).toBe(0);
  });
});
