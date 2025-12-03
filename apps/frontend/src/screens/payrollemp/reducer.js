import { EMPLOYEEPAYROLL } from 'constants/types'

const initState = {
    payroll_employee_list: [],
    designation_dropdown: [],
    employee_list_dropdown: [],
    country_list:[],
    state_list:[],
    salary_role_dropdown:[],
    salary_structure_dropdown:[],
    salary_component_fixed_dropdown:[],
    salary_component_varaible_dropdown:[],
    salary_component_deduction_dropdown:[],
    incompleteEmployeeList:[],
}

const PayrollEmployeeReducer = (state = initState, action) => {
    const { type, payload } = action

    switch (type) {
        // VAT List
        case EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST:
            return {
                ...state,
                payroll_employee_list: Object.assign([], payload)
            }
        case EMPLOYEEPAYROLL.DESIGNATION_DROPDOWN:
            return {
                ...state,
                designation_dropdown: Object.assign([], payload)
            }

        case EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN:
            return {
                ...state,
                employee_list_dropdown: Object.assign([], payload)
            }
        case EMPLOYEEPAYROLL.COUNTRY_LIST:
            return {
                ...state,
                country_list: Object.assign([], payload)
            }
        case EMPLOYEEPAYROLL.STATE_LIST:
            return {
                ...state,
                state_list: Object.assign([], payload)
            }
            case EMPLOYEEPAYROLL.SALARY_ROLE_DROPDOWN:
                return {
                    ...state,
                    salary_role_dropdown: Object.assign([], payload)
                }
    
         case EMPLOYEEPAYROLL.SALARY_STRUCTURE_DROPDOWN:
              return {
                  ...state,
                salary_structure_dropdown: Object.assign([], payload)
            } 

            case EMPLOYEEPAYROLL.SALARY_COMPONENT_FIXED_DROPDOWN:
                return {
                    ...state,
                  salary_component_fixed_dropdown: Object.assign([], payload)
              } 

              case EMPLOYEEPAYROLL.SALARY_COMPONENT_VARAIBLE_DROPDOWN:
                return {
                    ...state,
                  salary_component_varaible_dropdown: Object.assign([], payload)
              } 

              case EMPLOYEEPAYROLL.SALARY_COMPONENT_DEDUCTION_DROPDOWN:
                return {
                    ...state,
                  salary_component_deduction_dropdown: Object.assign([], payload)
              } 

              case EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST:
             
                return {
                    ...state,
                    incompleteEmployeeList: Object.assign([], payload)
                }
    
        default:
            return state
    }
}

export default PayrollEmployeeReducer

