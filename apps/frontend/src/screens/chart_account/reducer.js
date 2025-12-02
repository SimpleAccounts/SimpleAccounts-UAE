import { CHART_ACCOUNT } from 'constants/types'

const initState = {
  transaction_type_list: [],
  sub_transaction_type_list: [],
  transaction_category_list: []
}

const ChartAccountReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST:

      return {
        ...state,
        transaction_category_list : Object.assign([], payload)
      }

    case CHART_ACCOUNT.TRANSACTION_TYPES:
    return {
      ...state,
      transaction_type_list : Object.assign([], payload)
    }

    case CHART_ACCOUNT.SUB_TRANSACTION_TYPES:
      return {
        ...state,
        sub_transaction_type_list : Object.assign([], payload)
      }

    default:
      return state
  }
}

export default ChartAccountReducer