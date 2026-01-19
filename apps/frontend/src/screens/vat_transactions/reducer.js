import { VAT_TRANSACTIONS } from 'constants/types';

const initState = {
  vat_transaction_list: [],
};

const VatTransactionsReducer = (state = initState, action) => {
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
    case VAT_TRANSACTIONS.VAT_TRANSACTION_LIST:
      return {
        ...state,
        vat_transaction_list: getArray(payload),
      };
    default:
      return state;
  }
};

export default VatTransactionsReducer;
