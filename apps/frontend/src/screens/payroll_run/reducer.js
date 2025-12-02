import { EMPLOYEEPAYROLL } from 'constants/types'

const initState = {
    payroll_employee_list: [],

    employee_list_dropdown: [],

    incompleteEmployeeList:[],
    payroll_list:[],
    approver_dropdown_list:[],
    user_approver_generater_dropdown_list:[],
}

const PayrollRunReducer = (state = initState, action) => {
    const { type, payload } = action

    switch (type) {
        // VAT List
        case EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST:
            return {
                ...state,
                payroll_employee_list: Object.assign([], payload)
            }
    
        case EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN:
            return {
                ...state,
                employee_list_dropdown: Object.assign([], payload)
            }
     
     

        case EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST:
             
                return {
                    ...state,
                    incompleteEmployeeList: Object.assign([], payload)
                }
        case EMPLOYEEPAYROLL.PAYROLL_LIST:
             
                    return {
                        ...state,
                        payroll_list: Object.assign([], payload)
                    }
        case EMPLOYEEPAYROLL.APPROVER_DROPDOWN:
             
                        return {
                            ...state,
                            approver_dropdown_list: Object.assign([], payload)
                        }
        case  EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN:
             
                            return {
                                ...state,
                                user_approver_generater_dropdown_list: Object.assign([], payload)
                            }
                       
        default:
            return state
    }
}

export default PayrollRunReducer

