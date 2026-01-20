import { USER } from 'constants/types';

const initState = {
  user_list: [],
  role_list: [],
  company_type_list: [],
  employee_list: [],
  designation_dropdown: [],
};

const UserReducer = (state = initState, action) => {
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
    case USER.USER_LIST:
      return {
        ...state,
        user_list: getArray(payload),
      };

    case USER.ROLE_LIST:
      return {
        ...state,
        role_list: getArray(payload),
      };

    case USER.COMPANY_TYPE_LIST:
      return {
        ...state,
        company_type_list: getArray(payload),
      };
    case USER.EMPLOYEE_LIST:
      return {
        ...state,
        employee_list: getArray(payload),
      };
    case USER.DESIGNATION_DROPDOWN:
      return {
        ...state,
        designation_dropdown: getArray(payload),
      };
    default:
      return state;
  }
};

export default UserReducer;
