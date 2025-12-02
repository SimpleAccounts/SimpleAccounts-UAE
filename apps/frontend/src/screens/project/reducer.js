import { PROJECT } from 'constants/types'

const initState = {
  project_list: [],
  currency_list: [],
  country_list: [],
  title_list: [],
  contact_list: []
}

const ProjectReducer = (state = initState, action) => {
  const { type, payload } = action

  switch (type) {

    case PROJECT.PROJECT_LIST:
      return {
        ...state,
        project_list: Object.assign([], payload)
      }

    case PROJECT.CURRENCY_LIST:

      return {
        ...state,
        currency_list: Object.assign([], payload)
      }

    case PROJECT.COUNTRY_LIST:

      return {
        ...state,
        country_list: Object.assign([], payload)
      }

    case PROJECT.TITLE_LIST:
      return {
        ...state,
        title_list: Object.assign([], payload)
      }

    case PROJECT.CONTACT_LIST:
      return {
        ...state,
        contact_list: Object.assign([], payload)
      }


    default:
      return state
  }
}

export default ProjectReducer