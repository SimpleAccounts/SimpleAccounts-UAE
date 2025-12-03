import { PROFILE } from 'constants/types'

const initState = {
  currency_list: [],
  country_list: [],
  industry_type_list: [],
  company_type_list: [],
  role_list: [],
  invoicing_state_list: [],
  company_state_list: []
}

const ProfileReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case PROFILE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Object.assign([], payload)
      }

    case PROFILE.COUNTRY_LIST:

      return {
        ...state,
        country_list: Object.assign([], payload)
      }

    case PROFILE.INDUSTRY_TYPE_LIST:

      return {
        ...state,
        industry_type_list: Object.assign([], payload)
      }

      case PROFILE.ROLE_LIST:
        return {
          ...state,
          role_list: Object.assign([], payload)
        }

    case PROFILE.COMPANY_TYPE_LIST:
      return {
        ...state,
        company_type_list: Object.assign([], payload)
      }

      case PROFILE.INVOICING_STATE_LIST:
        return {
          ...state,
          invoicing_state_list: Object.assign([], payload)
        }

        case PROFILE.COMPANY_STATE_LIST:
        return {
          ...state,
          company_state_list: Object.assign([], payload)
        }

    default:
      return state
  }
}

export default ProfileReducer