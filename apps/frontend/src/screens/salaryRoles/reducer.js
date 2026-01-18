import { SALARY_ROLES } from 'constants/types';

const initState = {
  salaryRole_list: [],
  currency_list: [],
  country_list: [],
};

const SalaryRoleReducer = (state = initState, action) => {
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) {
      const arr = val.data;
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };

  const { type, payload } = action;

  switch (type) {
    case SALARY_ROLES.SALARY_ROLES_LIST:
      return {
        ...state,
        salaryRole_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default SalaryRoleReducer;
