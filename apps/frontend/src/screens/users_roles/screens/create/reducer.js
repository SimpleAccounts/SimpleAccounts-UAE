import { USERS_ROLES } from 'constants/types';

const initState = {
  user_role_list: [],
};

const RoleReducer = (state = initState, action) => {
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
    case USERS_ROLES.USER_ROLE_LIST:
      return {
        ...state,
        user_role_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default RoleReducer;
