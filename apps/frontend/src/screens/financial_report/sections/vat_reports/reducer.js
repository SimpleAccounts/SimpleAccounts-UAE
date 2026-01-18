import { IMPORT } from 'constants/types';

const initState = {
  file_data_list: [],
};

const ImportReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case IMPORT.FILE_DATA_LIST:
      return {
        ...state,
        file_data_list: (Array.isArray(payload) ? payload : (payload?.data || [])),
      };

    default:
      return state;
  }
};

export default ImportReducer;
