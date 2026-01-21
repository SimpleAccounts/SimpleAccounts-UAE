import { EMPLOYEE } from 'constants/types';

const initState = {
  employee_list: [],
  currency_list: [],
};

const EmployeeReducer = (state = initState, action) => {
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
    case EMPLOYEE.EMPLOYEE_LIST:
      return {
        ...state,
        employee_list: getArray(payload),
      };

    case EMPLOYEE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    default:
      return state;
  }
};

export default EmployeeReducer;
