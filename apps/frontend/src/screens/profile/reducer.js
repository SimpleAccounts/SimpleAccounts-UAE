import { PROFILE } from 'constants/types';

const initState = {
  currency_list: [],
  country_list: [],
  industry_type_list: [],
  company_type_list: [],
  role_list: [],
  invoicing_state_list: [],
  company_state_list: [],
};

const ProfileReducer = (state = initState, action) => {
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return [...val];
    if (Array.isArray(val?.data)) {
      const arr = [...val.data];
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };

  const { type, payload } = action;

  switch (type) {
    case PROFILE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: getArray(payload),
      };

    case PROFILE.COUNTRY_LIST:
      return {
        ...state,
        country_list: getArray(payload),
      };

    case PROFILE.INDUSTRY_TYPE_LIST:
      return {
        ...state,
        industry_type_list: getArray(payload),
      };

    case PROFILE.ROLE_LIST:
      return {
        ...state,
        role_list: getArray(payload),
      };

    case PROFILE.COMPANY_TYPE_LIST:
      return {
        ...state,
        company_type_list: getArray(payload),
      };

    case PROFILE.INVOICING_STATE_LIST:
      return {
        ...state,
        invoicing_state_list: getArray(payload),
      };

    case PROFILE.COMPANY_STATE_LIST:
      return {
        ...state,
        company_state_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default ProfileReducer;
