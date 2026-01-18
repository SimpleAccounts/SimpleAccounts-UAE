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
  invoice_list: [],
};

const CustomerInvoiceReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST:
      return {
        ...state,
        customer_invoice_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.PROJECT_LIST:
      return {
        ...state,
        project_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.CUSTOMER_LIST:
      return {
        ...state,
        customer_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.STATUS_LIST:
      return {
        ...state,
        status_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.VAT_LIST:
      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.PRODUCT_LIST:
      return {
        ...state,
        product_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.DEPOSIT_LIST:
      return {
        ...state,
        deposit_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.PAY_MODE:
      return {
        ...state,
        pay_mode: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case CUSTOMER_INVOICE.COUNTRY_LIST:
      return {
        ...state,
        country_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case CUSTOMER_INVOICE.PLACE_OF_SUPPLY:
      return {
        ...state,
        place_of_supply: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case CUSTOMER_INVOICE.INVOICE_LIST_FOR_DROPDOWN:
      return {
        ...state,
        invoice_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default CustomerInvoiceReducer;
