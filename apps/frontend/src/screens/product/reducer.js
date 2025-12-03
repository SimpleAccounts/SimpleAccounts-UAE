import { PRODUCT } from 'constants/types'

const initState = {
  product_list: [],
  vat_list: [],
  product_warehouse_list: [],
  product_category_list: [],
  inventory_account_list:[],
  inventory_list:[],
  inventory_history_list: [],
}

const ProductReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case PRODUCT.PRODUCT_LIST:
      return {
        ...state,
        product_list: Object.assign([], payload)
      }

    case PRODUCT.PRODUCT_VAT_CATEGORY:

      return {
        ...state,
        vat_list: Object.assign([], payload)
      }

    case PRODUCT.PRODUCT_WHARE_HOUSE:

      return {
        ...state,
        product_warehouse_list: Object.assign([], payload)
      }

    case PRODUCT.PRODUCT_CATEGORY:
      return {
        ...state,
        product_category_list: Object.assign([], payload)
      }
      case PRODUCT.INVENTORY_ACCOUNT_LIST:
        return {
          ...state,
          inventory_account_list: Object.assign([], payload)
        }
        case PRODUCT.INVENTORY_LIST:
          return {
            ...state,
            inventory_list: Object.assign([], payload)
          } 
        case PRODUCT.INVENTORY_HISTORY_LIST:
          return{
            ...state,
            inventory_history_list: Object.assign([], payload)
          }  
    default:
      return state
  }
}

export default ProductReducer