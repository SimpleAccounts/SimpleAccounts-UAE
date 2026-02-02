import { CURRENCYCONVERT } from 'constants/types';

const initState = {
  currency_convert_list: [],
  currency_list: [],
  currency_converstion_list: [],
};

const CurrencyConReducer = (state = initState, action) => {
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
    case CURRENCYCONVERT.CURRENCY_CONVERT_LIST:
      return {
        ...state,
        currency_convert_list: getArray(payload),
      };
    case CURRENCYCONVERT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: getArray(payload),
      };
    case CURRENCYCONVERT.CURRENCY_CONVERTION_LIST:
      return {
        ...state,
        currency_converstion_list: getArray(payload),
      };

    // Vat Data By ID
    // case VAT.VAT_ROW:
    //   return {
    //     ...state,
    //     vat_row: getArray(payload)
    //   }

    default:
      return state;
  }
};

export default CurrencyConReducer;
