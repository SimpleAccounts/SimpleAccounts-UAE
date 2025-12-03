import { PAYMENT } from 'constants/types'

const initState = {
  payment_list: [],
  currency_list: [],
  bank_list: [],
  supplier_list: [],
  invoice_list: [],
  project_list: [],
  country_list: [],
}

const PaymentReducer = (state = initState, action) => {
  const { type, payload } = action

  switch (type) {

    case PAYMENT.PAYMENT_LIST:
      return {
        ...state,
        payment_list: Object.assign([], payload.data)
      }
    case PAYMENT.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Object.assign([], payload.data)
      }
    case PAYMENT.BANK_LIST:
      return {
        ...state,
        bank_list: Object.assign([], payload.data)
      }
    case PAYMENT.SUPPLIER_LIST:
      return {
        ...state,
        supplier_list: Object.assign([], payload.data)
      }
    case PAYMENT.INVOICE_LIST:
      return {
        ...state,
        invoice_list: Object.assign([], payload.data)
      }
    case PAYMENT.PROJECT_LIST:
      return {
        ...state,
        project_list: Object.assign([], payload.data)
      }
      case PAYMENT.COUNTRY_LIST:
        return {
          ...state,
          country_list: Object.assign([], payload.data)
        }
    default:
      return state
  }
}

export default PaymentReducer