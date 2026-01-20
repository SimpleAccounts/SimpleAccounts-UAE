import { BANK_ACCOUNT } from 'constants/types';

const initState = {
  bank_account_list: [],
  bank_transaction_list: [],
  account_type_list: [],
  currency_list: [],
  country_list: [],
  transaction_type_list: [],
  transaction_category_list: [],
  project_list: [],
  customer_invoice_list: [],
  expense_list: [],
  expense_categories_list: [],
  user_list: [],
  vendor_list: [],
  vat_list: [],
  reconcile_list: [],
  UnPaidPayrolls_List: [],
  bank_list: [],
};

const BankAccountReducer = (state = initState, action) => {
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
    case BANK_ACCOUNT.BANK_ACCOUNT_LIST:
      return {
        ...state,
        bank_account_list: getArray(payload),
      };

    case BANK_ACCOUNT.BANK_TRANSACTION_LIST:
      return {
        ...state,
        bank_transaction_list: getArray(payload),
      };

    case BANK_ACCOUNT.ACCOUNT_TYPE_LIST:
      return {
        ...state,
        account_type_list: getArray(payload),
      };

    case BANK_ACCOUNT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: getArray(payload),
      };

    case BANK_ACCOUNT.COUNTRY_LIST:
      return {
        ...state,
        country_list: getArray(payload),
      };

    case BANK_ACCOUNT.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: getArray(payload),
      };

    case BANK_ACCOUNT.VENDOR_LIST:
      return {
        ...state,
        vendor_list: getArray(payload),
      };

    case BANK_ACCOUNT.PROJECT_LIST:
      return {
        ...state,
        project_list: getArray(payload),
      };
    case BANK_ACCOUNT.BANK_LIST:
      return {
        ...state,
        bank_list: getArray(payload),
      };

    case BANK_ACCOUNT.CUSTOMER_INVOICE_LIST:
      return {
        ...state,
        customer_invoice_list: getArray(payload),
      };

    case BANK_ACCOUNT.VENDOR_INVOICE_LIST:
      return {
        ...state,
        vendor_invoice_list: getArray(payload),
      };

    case BANK_ACCOUNT.EXPENSE_LIST:
      return {
        ...state,
        expense_list: getArray(payload),
      };

    case BANK_ACCOUNT.EXPENSE_CATEGORIES_LIST:
      return {
        ...state,
        expense_categories_list: getArray(payload),
      };
    case BANK_ACCOUNT.USER_LIST:
      return {
        ...state,
        user_list: getArray(payload),
      };

    case BANK_ACCOUNT.TRANSACTION_TYPE_LIST:
      return {
        ...state,
        transaction_type_list: getArray(payload),
      };

    case BANK_ACCOUNT.RECONCILE_LIST:
      return {
        ...state,
        reconcile_list: payload?.data ? { ...payload } : payload,
      };

    case BANK_ACCOUNT.VAT_LIST:
      return {
        ...state,
        vat_list: getArray(payload),
      };

    case BANK_ACCOUNT.UNPAID_PAYROLLS:
      return {
        ...state,
        UnPaidPayrolls_List: getArray(payload),
      };

    default:
      return state;
  }
};

export default BankAccountReducer;
