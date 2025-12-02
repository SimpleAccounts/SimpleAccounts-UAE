import { SALARY_STRUCTURE } from 'constants/types'

const initState = {
  salaryStructure_list: [],
  currency_list: [],
  country_list: [],

}

const EmployeeReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case SALARY_STRUCTURE.SALARY_STRUCTURE_LIST: 
      return {
        ...state,
        salaryStructure_list: Object.assign([],payload)
      }

    default:
      return state
  }
}

export default EmployeeReducer