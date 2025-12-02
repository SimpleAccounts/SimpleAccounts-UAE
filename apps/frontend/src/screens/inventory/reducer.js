import { INVENTORY } from 'constants/types'

const initState = {
  summary_list: [],
}

const InventoryReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case INVENTORY.SUMMARY_LIST:
      return {
        ...state,
        summary_list: Object.assign([], payload)
      }

    
    default:
      return state
  }
}

export default InventoryReducer