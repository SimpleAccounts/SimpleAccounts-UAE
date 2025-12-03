import { JOURNAL } from 'constants/types'

const initState = {
  journal_list: [],
  transaction_category_list: [],
  currency_list: [],
  contact_list: [],
  vat_list: [],
  page_num: 1,
  cancel_flag: false
}

const JournalReducer = (state = initState, action) => {
  const { type, payload } = action
  switch (type) {

    case JOURNAL.JOURNAL_LIST:    
      return {
        ...state,
        journal_list: Object.assign([], payload)
      }

    case JOURNAL.TRANSACTION_CATEGORY_LIST:
      return {
        ...state,
        transaction_category_list: Object.assign([], payload.data)
      }

    case JOURNAL.CONTACT_LIST:
      return {
        ...state,
        contact_list: Object.assign([], payload.data)
      }

    case JOURNAL.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Object.assign([], payload.data)
      }

    case JOURNAL.VAT_LIST:
      return {
        ...state,
        vat_list: Object.assign([], payload.data)
      }

    case JOURNAL.PAGE_NUM:
      return {
        ...state,
        page_num: payload
      }
    case JOURNAL.CANCEL_FLAG:
      return {
        ...state,
        cancel_flag: payload
      }

    default:
      return state
  }
}

export default JournalReducer