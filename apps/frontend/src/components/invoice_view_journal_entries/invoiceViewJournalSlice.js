import { createSlice } from '@reduxjs/toolkit';
import { INVOICE_VIEW_JOURNAL } from 'constants/types';

const initialState = {
  invoice_journal_list: [],
};

const invoiceViewJournalSlice = createSlice({
  name: 'invoice_view_journal',
  initialState,
  reducers: {
    setInvoiceJournalList: (state, action) => {
      state.invoice_journal_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(INVOICE_VIEW_JOURNAL.JOURNAL_LIST, (state, action) => {
      state.invoice_journal_list = action.payload || [];
    });
  },
});

export const { setInvoiceJournalList } = invoiceViewJournalSlice.actions;
export default invoiceViewJournalSlice.reducer;

