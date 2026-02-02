import { SALARY_TEMPLATE } from 'constants/types';

const initState = {
  salary_structure_dropdown: [],
  template_list: [],
  salary_role_dropdown: [],
};

const SalaryTemplateReducer = (state = initState, action) => {
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
    case SALARY_TEMPLATE.TEMPLATE_LIST:
      return {
        ...state,
        template_list: getArray(payload),
      };

    case SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN:
      return {
        ...state,
        salary_structure_dropdown: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN:
      return {
        ...state,
        salary_role_dropdown: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    default:
      return state;
  }
};

export default SalaryTemplateReducer;
