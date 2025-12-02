import { CURRENCY } from 'constants/types'

const initState = {
  currency_list : []
}

const CurrencyReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {


    case CURRENCY.CURRENCY_LIST:
    return {
      ...state,
      currency_list: Object.assign([], payload.data)
    }

    default:
      return state
  }
}

export default CurrencyReducer