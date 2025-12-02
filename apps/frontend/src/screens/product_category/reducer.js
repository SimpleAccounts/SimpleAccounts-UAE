import { PRODUCT_CATEGORY } from 'constants/types'

const initState = {
    product_category_list: []
}

const VatReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {
    // VAT List
    case PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST:
      return {
        ...state,
        product_category_list: Object.assign([], payload)
      }
    

    default:
      return state
  }
}

export default VatReducer