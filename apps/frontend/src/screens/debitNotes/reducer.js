import { DEBIT_NOTE } from 'constants/types';

const initState = {
  debit_note_list: [],
  customer_list: [],
  currency_list: [],
  deposit_list: [],
  country_list: [],
  place_of_supply: [],
  status_list: [],
  pay_mode: [],
  invoice_list: [],
};

const CustomerInvoiceReducer = (state = initState, action) => {
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
    case DEBIT_NOTE.DEBIT_NOTE_LIST:
      return {
        ...state,
        debit_note_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case DEBIT_NOTE.STATUS_LIST:
      return {
        ...state,
        status_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case DEBIT_NOTE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case DEBIT_NOTE.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case DEBIT_NOTE.PAY_MODE:
      return {
        ...state,
        pay_mode: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case DEBIT_NOTE.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case DEBIT_NOTE.PLACE_OF_SUPPLY:
      return {
        ...state,
        place_of_supply: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case DEBIT_NOTE.INVOICE_LIST_FOR_DROPDOWN:
      return {
        ...state,
        invoice_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default CustomerInvoiceReducer;
