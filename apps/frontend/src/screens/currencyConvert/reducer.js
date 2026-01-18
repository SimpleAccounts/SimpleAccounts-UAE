import { CURRENCYCONVERT } from 'constants/types';

const initState = {
  currency_convert_list: [],
  currency_list: [],
  currency_converstion_list: [],
};

const CurrencyConReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    // Vat List
    case CURRENCYCONVERT.CURRENCY_CONVERT_LIST:
      return {
        ...state,
        currency_convert_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case CURRENCYCONVERT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case CURRENCYCONVERT.CURRENCY_CONVERTION_LIST:
      return {
        ...state,
        currency_converstion_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    // Vat Data By ID
    // case VAT.VAT_ROW:
    //   return {
    //     ...state,
    //     vat_row: (Array.isArray(payload) ? payload : (payload?.data || []))
    //   }

    default:
      return state;
  }
};

export default CurrencyConReducer;
