import { CURRENCY } from 'constants/types';

const initState = {
  currency_list: [],
};

const CurrencyReducer = (state = initState, action) => {
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
    case CURRENCY.CURRENCY_LIST:
      return {
        ...state,
        currency_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default CurrencyReducer;
