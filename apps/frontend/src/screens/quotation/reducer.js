import { QUOTATION } from 'constants/types';

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
  quotation_list: [],
  excise_list: [],
};

const RequestForQuotationReducer = (state = initState, action) => {
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
    case QUOTATION.PROJECT_LIST:
      return {
        ...state,
        project_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.STATUS_LIST:
      return {
        ...state,
        status_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.SUPPLIER_LIST:
      return {
        ...state,
        supplier_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.VAT_LIST:
      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case QUOTATION.EXCISE_LIST:
      return {
        ...state,
        excise_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case QUOTATION.PAY_MODE:
      return {
        ...state,
        pay_mode: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.PRODUCT_LIST:
      return {
        ...state,
        product_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case QUOTATION.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case QUOTATION.QUOTATION_LIST:
      return {
        ...state,
        quotation_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    default:
      return state;
  }
};

export default RequestForQuotationReducer;
