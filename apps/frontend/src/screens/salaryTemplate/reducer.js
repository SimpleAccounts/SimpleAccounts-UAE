import { SALARY_TEMPLATE } from 'constants/types'

const initState = {
  salary_structure_dropdown: [],
  template_list:[],
  salary_role_dropdown: [],

}

const SalaryTemplateReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case SALARY_TEMPLATE.TEMPLATE_LIST: 
      return {
        ...state,
        template_list: Object.assign([],payload)
      };

      case SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN: 
      return {
        ...state,
        salary_structure_dropdown: Object.assign([],payload.data)
      }

      case SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN: 

      return {
        ...state,
        salary_role_dropdown: Object.assign([],payload.data)
      }
      
    default:
      return state
  }
}

export default SalaryTemplateReducer