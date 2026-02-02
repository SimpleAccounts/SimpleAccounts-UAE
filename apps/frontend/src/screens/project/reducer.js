import { PROJECT } from 'constants/types';

const initState = {
  project_list: [],
  currency_list: [],
  country_list: [],
  title_list: [],
  contact_list: [],
};

const ProjectReducer = (state = initState, action) => {
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
    case PROJECT.PROJECT_LIST:
      return {
        ...state,
        project_list: getArray(payload),
      };

    case PROJECT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: getArray(payload),
      };

    case PROJECT.COUNTRY_LIST:
      return {
        ...state,
        country_list: getArray(payload),
      };

    case PROJECT.TITLE_LIST:
      return {
        ...state,
        title_list: getArray(payload),
      };

    case PROJECT.CONTACT_LIST:
      return {
        ...state,
        contact_list: getArray(payload),
      };

    default:
      return state;
  }
};

export default ProjectReducer;
