import { ORGANIZATION } from 'constants/types'

const initState = {
  country_list: [],
  industry_type_list: []
}

const OrganizationReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case ORGANIZATION.COUNTRY_LIST:
      return {
        ...state,
        country_list: Object.assign([],payload)
      }


      case ORGANIZATION.INDUSTRY_TYPE_LIST:
        return {
          ...state,
          industry_type_list: Object.assign([],payload)
        }
  
    default:
      return state
  }
}

export default OrganizationReducer