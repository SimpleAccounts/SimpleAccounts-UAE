import { TEMP } from 'constants/types'


const initState = {
  customer_invoice_report : [],
contact_list :[],
account_balance_report : [],
account_type_list :[],
transaction_type_list : [],
transaction_category_list : []
}



const TempReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    
    case TEMP.ACCOUNT_BALANCE_REPORT:
    return {
      ...state,
      account_balance_report: Object.assign([], payload.data)
    }


    case TEMP.CUSTOMER_INVOICE_REPORT:
      return {
        ...state,
        customer_invoice_report: Object.assign([], payload.data)
      }

      case TEMP.CONTACT_LIST:
      return {
        ...state,
        contact_list: Object.assign([], payload.data)
      }
      
      case TEMP.ACCOUNT_TYPE_LIST:
      return {
        ...state,
        account_type_list: Object.assign([], payload.data)
      }

      case TEMP.TRANSACTION_TYPE_LIST:
      return {
        ...state,
        transaction_type_list: Object.assign([], payload.data)
      }

      case TEMP.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: Object.assign([], payload.data)
      }


    default:
      return state
  }
}

export default TempReducer