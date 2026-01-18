import { CUSTOMER_INVOICE } from 'constants/types';

const initState = {
  customer_invoice_list: [],
  project_list: [],
  customer_list: [],
  currency_list: [],
  vat_list: [],
  product_list: [],
  deposit_list: [],
  country_list: [],
  place_of_supply: [],
  status_list: [],
  pay_mode: [],
  excise_list: [],
};

const CustomerInvoiceReducer = (state = initState, action) => {
  const { type, payload } = action;

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

  switch (type) {
    case CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST:
      return {
        ...state,
        customer_invoice_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.PROJECT_LIST:
      return {
        ...state,
        project_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.CUSTOMER_LIST:
      return {
        ...state,
        customer_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.STATUS_LIST:
      return {
        ...state,
        status_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.VAT_LIST:
      return {
        ...state,
        vat_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.PRODUCT_LIST:
      return {
        ...state,
        product_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: getArray(payload),
      };

    case CUSTOMER_INVOICE.PAY_MODE:
      return {
        ...state,
        pay_mode: getArray(payload),
      };
    case CUSTOMER_INVOICE.EXCISE_LIST:
      return {
        ...state,
        excise_list: getArray(payload),
      };
    case CUSTOMER_INVOICE.COUNTRY_LIST:
      return {
        ...state,
        country_list: getArray(payload),
      };
    case CUSTOMER_INVOICE.PLACE_OF_SUPPLY:
      return {
        ...state,
        place_of_supply: getArray(payload),
      };

    default:
      return state;
  }
};

export default CustomerInvoiceReducer;
