import { INVOICE_VIEW_JOURNAL } from 'constants/types';

const initState = {
  invoice_journal_list: [],
};

const InvoiceViewJournalReducer = (state = initState, action) => {
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
    case INVOICE_VIEW_JOURNAL.JOURNAL_LIST:
      return {
        ...state,
        invoice_journal_list: getArray(payload),
      };
    default:
      return state;
  }
};

export default InvoiceViewJournalReducer;
