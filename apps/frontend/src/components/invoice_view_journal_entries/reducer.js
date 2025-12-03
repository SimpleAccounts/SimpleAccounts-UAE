import { INVOICE_VIEW_JOURNAL } from 'constants/types'

const initState = {
  invoice_journal_list: [],
}

const InvoiceViewJournalReducer = (state = initState, action) => {
  const { type, payload } = action
  switch (type) {
    case INVOICE_VIEW_JOURNAL.JOURNAL_LIST:    
      return {
        ...state,
        invoice_journal_list: Object.assign([], payload)
      }
    default:
      return state
  }
}

export default InvoiceViewJournalReducer