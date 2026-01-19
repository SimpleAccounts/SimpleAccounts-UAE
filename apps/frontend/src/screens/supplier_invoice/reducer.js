import { SUPPLIER_INVOICE } from 'constants/types';

const initState = {
  supplier_invoice_list: [],
  project_list: [],
  contact_list: [],
  status_list: [],
  currency_list: [],
  vat_list: [],
  excise_list: [],
  product_list: [],
  supplier_list: [],
  country_list: [],
  deposit_list: [],
  pay_mode: [],
};

const SupplierInvoiceReducer = (state = initState, action) => {
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
    case SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST:
      return {
        ...state,
        supplier_invoice_list: getArray(payload),
      };

    case SUPPLIER_INVOICE.PROJECT_LIST:
      return {
        ...state,
        project_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.STATUS_LIST:
      return {
        ...state,
        status_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.SUPPLIER_LIST:
      return {
        ...state,
        supplier_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.VAT_LIST:
      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case SUPPLIER_INVOICE.EXCISE_LIST:
      return {
        ...state,
        excise_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };
    case SUPPLIER_INVOICE.PAY_MODE:
      return {
        ...state,
        pay_mode: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.PRODUCT_LIST:
      return {
        ...state,
        product_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SUPPLIER_INVOICE.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default SupplierInvoiceReducer;
