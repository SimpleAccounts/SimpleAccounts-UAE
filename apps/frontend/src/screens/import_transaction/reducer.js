import { IMPORT_TRANSACTION } from 'constants/types';

const initState = {
  date_format_list: [],
};

const ImportTransactionReducer = (state = initState, action) => {
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
    case IMPORT_TRANSACTION.DATE_FORMAT_LIST:
      return {
        ...state,
        date_format_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default ImportTransactionReducer;
