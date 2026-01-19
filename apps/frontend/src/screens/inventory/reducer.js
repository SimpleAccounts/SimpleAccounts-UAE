import { INVENTORY } from 'constants/types';

const initState = {
  summary_list: [],
};

const InventoryReducer = (state = initState, action) => {
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
    case INVENTORY.SUMMARY_LIST:
      return {
        ...state,
        summary_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default InventoryReducer;
