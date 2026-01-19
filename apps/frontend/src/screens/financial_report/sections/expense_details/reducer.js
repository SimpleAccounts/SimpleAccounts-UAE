import { TEMP } from 'constants/types';

const initState = {
  customer_invoice_report: [],
  contact_list: [],
  account_balance_report: [],
  account_type_list: [],
  transaction_type_list: [],
  transaction_category_list: [],
};

const TempReducer = (state = initState, action) => {
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
    case TEMP.ACCOUNT_BALANCE_REPORT:
      return {
        ...state,
        account_balance_report: (Array.isArray(payload.data) ? payload.data : (payload || [])),
      };

    case TEMP.CUSTOMER_INVOICE_REPORT:
      return {
        ...state,
        customer_invoice_report: (Array.isArray(payload.data) ? payload.data : (payload || [])),
      };

    case TEMP.CONTACT_LIST:
      return {
        ...state,
        contact_list: (Array.isArray(payload.data) ? payload.data : (payload || [])),
      };

    case TEMP.ACCOUNT_TYPE_LIST:
      return {
        ...state,
        account_type_list: (Array.isArray(payload.data) ? payload.data : (payload || [])),
      };

    case TEMP.TRANSACTION_TYPE_LIST:
      return {
        ...state,
        transaction_type_list: (Array.isArray(payload.data) ? payload.data : (payload || [])),
      };

    case TEMP.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: (Array.isArray(payload.data) ? payload.data : (payload || [])),
      };

    default:
      return state;
  }
};

export default TempReducer;
