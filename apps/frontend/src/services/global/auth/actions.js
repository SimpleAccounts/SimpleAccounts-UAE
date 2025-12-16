// Re-export new RTK slice actions for backward compatibility
// Legacy exports - these dispatch to COMMON, should be moved to common actions
import { COMMON } from 'constants/types';
import { api, authApi } from 'utils';

export {
  checkAuthStatus,
  logIn,
  register,
  registerStrapiUser,
  registerStrapiCompany,
  getCompanyCount,
  getTimeZoneList,
  getSimpleAccountsreleasenumber,
  logOut,
  signedIn,
  signedOut,
  setUserProfile,
  setCompanyCount,
  clearError,
} from './authSlice';

export const getCurrencyList = () => {
  return dispatch => {
    const data = {
      method: 'get',
      url: '/rest/company/getCurrency',
    };
    return api(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: COMMON.UNIVERSAL_CURRENCY_LIST,
            payload: {
              data: res.data,
            },
          });
          return res;
        }
        // On non-200, dispatch empty list to prevent errors
        dispatch({
          type: COMMON.UNIVERSAL_CURRENCY_LIST,
          payload: {
            data: [],
          },
        });
        return { ...res, data: [] };
      })
      .catch(err => {
        // On error, dispatch empty list instead of throwing
        // This prevents uncaught promise rejections
        dispatch({
          type: COMMON.UNIVERSAL_CURRENCY_LIST,
          payload: {
            data: [],
          },
        });
        return { data: [], status: err?.status || 500 };
      });
  };
};

export const getCurrencylist = () => {
  return dispatch => {
    const data = {
      method: 'get',
      url: '/rest/currency/getcurrency',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: COMMON.CURRENCY_LIST,
            payload: {
              data: res.data,
            },
          });
          return res;
        }
        // On non-200, dispatch empty list to prevent errors
        dispatch({
          type: COMMON.CURRENCY_LIST,
          payload: {
            data: [],
          },
        });
        return { ...res, data: [] };
      })
      .catch(err => {
        // On error, dispatch empty list instead of throwing
        // This prevents uncaught promise rejections
        dispatch({
          type: COMMON.CURRENCY_LIST,
          payload: {
            data: [],
          },
        });
        return { data: [], status: err?.status || 500 };
      });
  };
};
