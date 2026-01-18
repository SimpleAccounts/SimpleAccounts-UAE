import { GOODS_RECEVED_NOTE } from 'constants/types';

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
  goods_received_note_list: [],
  po_list: [],
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
    case GOODS_RECEVED_NOTE.PROJECT_LIST:
      return {
        ...state,
        project_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.STATUS_LIST:
      return {
        ...state,
        status_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.SUPPLIER_LIST:
      return {
        ...state,
        supplier_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.VAT_LIST:
      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.PAY_MODE:
      return {
        ...state,
        pay_mode: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.PRODUCT_LIST:
      return {
        ...state,
        product_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case GOODS_RECEVED_NOTE.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case GOODS_RECEVED_NOTE.GOODS_RECEVED_NOTE_LIST:
      return {
        ...state,
        goods_received_note_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case GOODS_RECEVED_NOTE.PO_LIST:
      return {
        ...state,
        po_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    default:
      return state;
  }
};

export default RequestForQuotationReducer;
