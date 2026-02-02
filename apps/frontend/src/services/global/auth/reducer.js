import { AUTH } from 'constants/types';

const initState = {
  is_authed: true,
  profile: [],
  ccount: '',
};

const AuthReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case AUTH.SIGNED_IN:
      return {
        ...state,
        is_authed: true,
      };

    case AUTH.SIGNED_OUT:
      return {
        ...state,
        is_authed: false,
      };

    case AUTH.USER_PROFILE:
      return {
        ...state,
        profile: payload?.data || payload || {},
      };

    case AUTH.COMPANYCOUNT:
      return {
        ...state,
        ccount: payload?.data || payload || {},
      };

    default:
      return state;
  }
};

export default AuthReducer;
