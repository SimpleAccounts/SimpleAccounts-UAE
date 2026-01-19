import { OPENING_BALANCE } from 'constants/types';

const initState = {
  transaction_category_list: [],
  opening_balance_list: [],
};

const OpeningBalanceReducer = (state = initState, action) => {
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
    case OPENING_BALANCE.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case OPENING_BALANCE.OPENING_BALANCE_LIST:
      return {
        ...state,
        opening_balance_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    default:
      return state;
  }
};

export default OpeningBalanceReducer;
