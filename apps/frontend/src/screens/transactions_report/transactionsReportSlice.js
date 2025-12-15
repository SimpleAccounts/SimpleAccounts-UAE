import { createSlice } from '@reduxjs/toolkit';
import { TEMP } from 'constants/types';

const initialState = {
  customer_invoice_report: [],
  contact_list: [],
  account_balance_report: [],
  account_type_list: [],
  transaction_type_list: [],
  transaction_category_list: [],
};

const transactionsReportSlice = createSlice({
  name: 'transaction_data',
  initialState,
  reducers: {
    setCustomerInvoiceReport: (state, action) => {
      state.customer_invoice_report = action.payload;
    },
    setContactList: (state, action) => {
      state.contact_list = action.payload;
    },
    setAccountBalanceReport: (state, action) => {
      state.account_balance_report = action.payload;
    },
    setAccountTypeList: (state, action) => {
      state.account_type_list = action.payload;
    },
    setTransactionTypeList: (state, action) => {
      state.transaction_type_list = action.payload;
    },
    setTransactionCategoryList: (state, action) => {
      state.transaction_category_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(TEMP.ACCOUNT_BALANCE_REPORT, (state, action) => {
        state.account_balance_report = action.payload?.data || action.payload || [];
      })
      .addCase(TEMP.CUSTOMER_INVOICE_REPORT, (state, action) => {
        state.customer_invoice_report = action.payload?.data || action.payload || [];
      })
      .addCase(TEMP.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(TEMP.ACCOUNT_TYPE_LIST, (state, action) => {
        state.account_type_list = action.payload?.data || action.payload || [];
      })
      .addCase(TEMP.TRANSACTION_TYPE_LIST, (state, action) => {
        state.transaction_type_list = action.payload?.data || action.payload || [];
      })
      .addCase(TEMP.TRANSACTION_CATEGORY_LIST, (state, action) => {
        state.transaction_category_list = action.payload?.data || action.payload || [];
      });
  },
});

export const {
  setCustomerInvoiceReport,
  setContactList,
  setAccountBalanceReport,
  setAccountTypeList,
  setTransactionTypeList,
  setTransactionCategoryList,
} = transactionsReportSlice.actions;
export default transactionsReportSlice.reducer;

