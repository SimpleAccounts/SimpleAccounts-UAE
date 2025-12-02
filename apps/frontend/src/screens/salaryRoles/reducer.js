import { SALARY_ROLES } from 'constants/types'

const initState = {
  salaryRole_list: [],
  currency_list: [],
  country_list: [],

}

const SalaryRoleReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case SALARY_ROLES.SALARY_ROLES_LIST: 
      return {
        ...state,
        salaryRole_list: Object.assign([],payload)
      }
 
    default:
      return state
  }
}

export default SalaryRoleReducer