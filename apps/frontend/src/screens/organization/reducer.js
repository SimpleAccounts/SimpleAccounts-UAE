import { ORGANIZATION } from 'constants/types';

const initState = {
  country_list: [],
  industry_type_list: [],
};

const OrganizationReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case ORGANIZATION.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case ORGANIZATION.INDUSTRY_TYPE_LIST:
      return {
        ...state,
        industry_type_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default OrganizationReducer;
