import { PAYMENT } from 'constants/types';

const initState = {
  payment_list: [],
  currency_list: [],
  bank_list: [],
  supplier_list: [],
  invoice_list: [],
  project_list: [],
  country_list: [],
};

const PaymentReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case PAYMENT.PAYMENT_LIST:
      return {
        ...state,
        payment_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PAYMENT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PAYMENT.BANK_LIST:
      return {
        ...state,
        bank_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PAYMENT.SUPPLIER_LIST:
      return {
        ...state,
        supplier_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PAYMENT.INVOICE_LIST:
      return {
        ...state,
        invoice_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PAYMENT.PROJECT_LIST:
      return {
        ...state,
        project_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PAYMENT.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    default:
      return state;
  }
};

export default PaymentReducer;
