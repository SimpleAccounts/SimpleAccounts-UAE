import { RECEIPT } from 'constants/types'

const initState = {
  receipt_list: [],
  contact_list: [],
  invoice_list: []
}

const TempReducer = (state = initState, action) => {
  const { type, payload } = action

  switch (type) {

    case RECEIPT.RECEIPT_LIST:
      return {
        ...state,
        receipt_list: Object.assign([], payload)
      }
    case RECEIPT.CONTACT_LIST:
      return {
        ...state,
        contact_list: Object.assign([], payload)
      }
    case RECEIPT.INVOICE_LIST:
      return {
        ...state,
        invoice_list: Object.assign([], payload)
      }
    default:
      return state
  }
}

export default TempReducer