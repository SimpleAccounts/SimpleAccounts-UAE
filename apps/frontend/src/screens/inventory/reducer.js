import { INVENTORY } from 'constants/types';

const initState = {
  summary_list: [],
};

const InventoryReducer = (state = initState, action) => {
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
