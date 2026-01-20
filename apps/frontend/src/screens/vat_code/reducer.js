import { VAT } from 'constants/types';

const initState = {
  vat_list: [],
  vat_row: {},
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
    // Vat List
    case VAT.VAT_LIST:
      return {
        ...state,
        vat_list: getArray(payload),
      };

    // Vat Data By ID
    case VAT.VAT_ROW:
      return {
        ...state,
        vat_row: payload?.data || payload || {},
      };

    default:
      return state;
  }
};

export default VatReducer;
