import { EMPLOYEE } from 'constants/types';

const initState = {
  employee_list: [],
  currency_list: [],
};

const EmployeeReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case EMPLOYEE.EMPLOYEE_LIST:
      return {
        ...state,
        employee_list: Array.isArray(payload) ? payload : payload?.data || [],
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
