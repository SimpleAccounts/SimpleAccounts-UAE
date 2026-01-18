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
  const { type, payload } = action;

  switch (type) {
    case PROFILE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PROFILE.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PROFILE.INDUSTRY_TYPE_LIST:
      return {
        ...state,
        industry_type_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PROFILE.ROLE_LIST:
      return {
        ...state,
        role_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PROFILE.COMPANY_TYPE_LIST:
      return {
        ...state,
        company_type_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PROFILE.INVOICING_STATE_LIST:
      return {
        ...state,
        invoicing_state_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PROFILE.COMPANY_STATE_LIST:
      return {
        ...state,
        company_state_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default ProfileReducer;
