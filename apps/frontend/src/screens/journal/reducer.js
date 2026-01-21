import { JOURNAL } from 'constants/types';

const initState = {
  journal_list: [],
  transaction_category_list: [],
  currency_list: [],
  contact_list: [],
  vat_list: [],
  page_num: 1,
  cancel_flag: false,
};

const JournalReducer = (state = initState, action) => {
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
    case JOURNAL.JOURNAL_LIST:
      return {
        ...state,
        journal_list: getArray(payload),
      };

    case JOURNAL.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case JOURNAL.CONTACT_LIST:
      return {
        ...state,
        contact_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case JOURNAL.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case JOURNAL.VAT_LIST:
      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case JOURNAL.PAGE_NUM:
      return {
        ...state,
        page_num: payload,
      };
    case JOURNAL.CANCEL_FLAG:
      return {
        ...state,
        cancel_flag: payload,
      };

    default:
      return state;
  }
};

export default JournalReducer;
