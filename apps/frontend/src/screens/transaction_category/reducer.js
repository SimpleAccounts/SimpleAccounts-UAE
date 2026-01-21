import { TRANSACTION } from 'constants/types';

const initState = {
  transaction_list: [],
  transaction_row: {},
};

const TransactionReducer = (state = initState, action) => {
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
    // TRANSACTION List
    case TRANSACTION.TRANSACTION_LIST:
      return {
        ...state,
        transaction_list: getArray(payload),
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
