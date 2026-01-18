import { RECEIPT } from 'constants/types';

const initState = {
  receipt_list: [],
  contact_list: [],
  invoice_list: [],
};

const TempReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case RECEIPT.RECEIPT_LIST:
      return {
        ...state,
        receipt_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case RECEIPT.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case RECEIPT.INVOICE_LIST:
      return {
        ...state,
        invoice_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    default:
      return state;
  }
};

export default TempReducer;
