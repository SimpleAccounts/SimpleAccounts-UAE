import { TRANSACTION } from 'constants/types';

const initState = {
  transaction_list: [],
  transaction_row: {},
};

const TransactionReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    // TRANSACTION List
    case TRANSACTION.TRANSACTION_LIST:
      return {
        ...state,
        transaction_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    // TRANSACTION Data By ID
    case TRANSACTION.TRANSACTION_ROW:
      return {
        ...state,
        transaction_row: payload?.data || payload || {},
      };

    default:
      return state;
  }
};

export default TransactionReducer;
