import { IMPORT } from 'constants/types';

const initState = {
  file_data_list: [],
};

const ImportReducer = (state = initState, action) => {
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
    case IMPORT.FILE_DATA_LIST:
      return {
        ...state,
        file_data_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default ImportReducer;
