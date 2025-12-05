import AuthReducer from './reducer';
import { AUTH } from 'constants/types';

describe('AuthReducer', () => {
  const initialState = {
    is_authed: true,
    profile: [],
    ccount: '',
  };

  it('should return initial state when no action provided', () => {
    const result = AuthReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('should handle AUTH.SIGNED_IN', () => {
    const state = { ...initialState, is_authed: false };
    const action = { type: AUTH.SIGNED_IN };

    const result = AuthReducer(state, action);

    expect(result.is_authed).toBe(true);
  });

  it('should handle AUTH.SIGNED_OUT', () => {
    const state = { ...initialState, is_authed: true };
    const action = { type: AUTH.SIGNED_OUT };

    const result = AuthReducer(state, action);

    expect(result.is_authed).toBe(false);
  });

  it('should handle AUTH.USER_PROFILE', () => {
    const userProfile = {
      userId: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const action = {
      type: AUTH.USER_PROFILE,
      payload: { data: userProfile },
    };

    const result = AuthReducer(initialState, action);

    expect(result.profile).toEqual(userProfile);
    expect(result.is_authed).toBe(true);
  });

  it('should handle AUTH.COMPANYCOUNT', () => {
    const companyCount = { count: 5 };
    const action = {
      type: AUTH.COMPANYCOUNT,
      payload: { data: companyCount },
    };

    const result = AuthReducer(initialState, action);

    expect(result.ccount).toEqual(companyCount);
  });

  it('should not mutate state on SIGNED_IN', () => {
    const state = { ...initialState, is_authed: false };
    const action = { type: AUTH.SIGNED_IN };

    const result = AuthReducer(state, action);

    expect(result).not.toBe(state);
    expect(state.is_authed).toBe(false);
  });

  it('should preserve other state properties on USER_PROFILE', () => {
    const state = { ...initialState, is_authed: true, ccount: 'existing' };
    const action = {
      type: AUTH.USER_PROFILE,
      payload: { data: { userId: 1 } },
    };

    const result = AuthReducer(state, action);

    expect(result.is_authed).toBe(true);
    expect(result.ccount).toBe('existing');
    expect(result.profile).toEqual({ userId: 1 });
  });
});
