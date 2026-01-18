import { OPENING_BALANCE } from 'constants/types';

const initState = {
  transaction_category_list: [],
  opening_balance_list: [],
};

const OpeningBalanceReducer = (state = initState, action) => {
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
