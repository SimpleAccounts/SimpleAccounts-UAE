import { IMPORT_TRANSACTION } from 'constants/types'

const initState = {
  date_format_list: []
}

const ImportTransactionReducer = (state = initState, action) => {
  const { type, payload } = action
  switch (type) {

    case IMPORT_TRANSACTION.DATE_FORMAT_LIST:
      return {
        ...state,
        date_format_list: Object.assign([], payload)
      }

    default:
      return state
  }
}

export default ImportTransactionReducer