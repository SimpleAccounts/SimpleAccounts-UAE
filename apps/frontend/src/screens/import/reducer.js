import { IMPORT } from 'constants/types'

const initState = {
  file_data_list: [],
}

const ImportReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case IMPORT.FILE_DATA_LIST:
       
      return {
        ...state,
        file_data_list: Object.assign([], payload)
      }

    default:
      return state
  }
}

export default ImportReducer