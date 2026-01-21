import { CHART_ACCOUNT } from 'constants/types';

const initState = {
  transaction_type_list: [],
  sub_transaction_type_list: [],
  transaction_category_list: [],
};

const ChartAccountReducer = (state = initState, action) => {
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
    case CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: getArray(payload),
      };

    case CHART_ACCOUNT.TRANSACTION_TYPES:
      return {
        ...state,
        transaction_type_list: getArray(payload),
      };

    case CHART_ACCOUNT.SUB_TRANSACTION_TYPES:
      return {
        ...state,
        sub_transaction_type_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default ChartAccountReducer;
