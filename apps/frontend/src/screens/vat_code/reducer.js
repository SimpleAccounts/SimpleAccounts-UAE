import { VAT } from 'constants/types'

const initState = {
  vat_list: [],
  vat_row: {}
}

const VatReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {
    // Vat List
    case VAT.VAT_LIST:
      return {
        ...state,
        vat_list: Object.assign([], payload)
      }
    
    // Vat Data By ID
    case VAT.VAT_ROW:
      return {
        ...state,
        vat_row: Object.assign([], payload)
      }

    default:
      return state
  }
}

export default VatReducer