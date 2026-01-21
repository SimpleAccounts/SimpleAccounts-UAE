import { EMPLOYEEPAYROLL } from 'constants/types';

const initState = {
  payroll_employee_list: [],

  employee_list_dropdown: [],

  incompleteEmployeeList: [],
  payroll_list: [],
  approver_dropdown_list: [],
  user_approver_generater_dropdown_list: [],
};

const PayrollRunReducer = (state = initState, action) => {
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
    // VAT List
    case EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST:
      return {
        ...state,
        payroll_employee_list: getArray(payload),
      };

    case EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN:
      return {
        ...state,
        employee_list_dropdown: getArray(payload),
      };

    case EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST:
      return {
        ...state,
        incompleteEmployeeList: getArray(payload),
      };
    case EMPLOYEEPAYROLL.PAYROLL_LIST:
      return {
        ...state,
        payroll_list: getArray(payload),
      };
    case EMPLOYEEPAYROLL.APPROVER_DROPDOWN:
      return {
        ...state,
        approver_dropdown_list: getArray(payload),
      };
    case EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN:
      return {
        ...state,
        user_approver_generater_dropdown_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default PayrollRunReducer;
