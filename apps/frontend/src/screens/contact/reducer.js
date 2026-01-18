import { CONTACT } from 'constants/types';

const initState = {
  contact_list: [],
  country_list: [],
  currency_list: [],
  state_list: [],
  city_list: [],
  contact_type_list: [],
};

const ContactReducer = (state = initState, action) => {
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) {
      const arr = val.data;
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };

  const { type, payload } = action;

  switch (type) {
    case CONTACT.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case CONTACT.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case CONTACT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case CONTACT.STATE_LIST:
      return {
        ...state,
        state_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case CONTACT.CITY_LIST:
      return {
        ...state,
        city_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case CONTACT.CONTACT_TYPE_LIST:
      return {
        ...state,
        contact_type_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    default:
      return state;
  }
};

export default ContactReducer;
