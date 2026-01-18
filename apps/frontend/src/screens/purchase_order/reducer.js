import { PURCHASE_ORDER } from 'constants/types';

const initState = {
  project_list: [],
  contact_list: [],
  status_list: [],
  currency_list: [],
  vat_list: [],
  product_list: [],
  supplier_list: [],
  country_list: [],
  deposit_list: [],
  pay_mode: [],
  purchase_order_list: [],
  rfq_list: [],
};

const RequestForQuotationReducer = (state = initState, action) => {
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) {
      const arr = val.data;
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };

  const { type, payload } = action;

  switch (type) {
    case PURCHASE_ORDER.PROJECT_LIST:
      return {
        ...state,
        project_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.STATUS_LIST:
      return {
        ...state,
        status_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.SUPPLIER_LIST:
      return {
        ...state,
        supplier_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.VAT_LIST:
      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.PAY_MODE:
      return {
        ...state,
        pay_mode: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PURCHASE_ORDER.EXCISE_LIST:
      return {
        ...state,
        excise_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case PURCHASE_ORDER.PRODUCT_LIST:
      return {
        ...state,
        product_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case PURCHASE_ORDER.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case PURCHASE_ORDER.PURCHASE_ORDER_LIST:
      return {
        ...state,
        purchase_order_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case PURCHASE_ORDER.RFQ_LIST:
      return {
        ...state,
        rfq_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    default:
      return state;
  }
};

export default RequestForQuotationReducer;
