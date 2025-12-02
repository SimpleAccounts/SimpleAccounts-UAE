import { EMPLOYEE_DESIGNATION } from 'constants/types'

const initState = {
  designation_list: [],
  designationType_list:[],
}

const DesignationReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST: 
      return {
        ...state,
        designation_list: Object.assign([],payload)
      }
      case EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST: 
      return {
        ...state,
        designationType_list: Object.assign([],payload)
      }
 
    default:
      return state
  }
}

export default DesignationReducer