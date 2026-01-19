import { SALARY_STRUCTURE } from 'constants/types';

const initState = {
  salaryStructure_list: [],
  currency_list: [],
  country_list: [],
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
    case SALARY_STRUCTURE.SALARY_STRUCTURE_LIST:
      return {
        ...state,
        salaryStructure_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default EmployeeReducer;
