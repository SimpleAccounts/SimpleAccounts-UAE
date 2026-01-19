import { PRODUCT_CATEGORY } from 'constants/types';

const initState = {
  product_category_list: [],
};

const VatReducer = (state = initState, action) => {
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
    // VAT List
    case PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST:
      return {
        ...state,
        product_category_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default VatReducer;
