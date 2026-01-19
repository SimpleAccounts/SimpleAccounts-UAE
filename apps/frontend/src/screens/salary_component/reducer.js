import { EMPLOYEE_DESIGNATION } from 'constants/types';

const initState = {
  designation_list: [],
  designationType_list: [],
};

const DesignationReducer = (state = initState, action) => {
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
    case EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST:
      return {
        ...state,
        designation_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST:
      return {
        ...state,
        designationType_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default DesignationReducer;
