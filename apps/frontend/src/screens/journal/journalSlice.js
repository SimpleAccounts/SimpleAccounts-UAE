import { createSlice } from '@reduxjs/toolkit';
import { JOURNAL } from 'constants/types';

const initialState = {
  journal_list: [],
  transaction_category_list: [],
  currency_list: [],
  contact_list: [],
  vat_list: [],
  page_num: 1,
  cancel_flag: false,
};

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    setJournalList: (state, action) => {
      state.journal_list = action.payload;
    },
    setTransactionCategoryList: (state, action) => {
      state.transaction_category_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setContactList: (state, action) => {
      state.contact_list = action.payload;
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setPageNum: (state, action) => {
      state.page_num = action.payload;
    },
    setCancelFlag: (state, action) => {
      state.cancel_flag = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(JOURNAL.JOURNAL_LIST, (state, action) => {
        state.journal_list = action.payload || [];
      })
      .addCase(JOURNAL.TRANSACTION_CATEGORY_LIST, (state, action) => {
        state.transaction_category_list = action.payload?.data || action.payload || [];
      })
      .addCase(JOURNAL.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(JOURNAL.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(JOURNAL.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(JOURNAL.PAGE_NUM, (state, action) => {
        state.page_num = action.payload;
      })
      .addCase(JOURNAL.CANCEL_FLAG, (state, action) => {
        state.cancel_flag = action.payload;
      });
  },
});

export const {
  setJournalList,
  setTransactionCategoryList,
  setCurrencyList,
  setContactList,
  setVatList,
  setPageNum,
  setCancelFlag,
} = journalSlice.actions;
export default journalSlice.reducer;

