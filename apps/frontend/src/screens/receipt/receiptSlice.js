import { createSlice } from '@reduxjs/toolkit';
import { RECEIPT } from 'constants/types';

const initialState = {
  receipt_list: [],
  contact_list: [],
  invoice_list: [],
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    setReceiptList: (state, action) => {
      state.receipt_list = action.payload;
    },
    setContactList: (state, action) => {
      state.contact_list = action.payload;
    },
    setInvoiceList: (state, action) => {
      state.invoice_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Backward compatibility with old action types
      .addCase(RECEIPT.RECEIPT_LIST, (state, action) => {
        state.receipt_list = action.payload || [];
      })
      .addCase(RECEIPT.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload || [];
      })
      .addCase(RECEIPT.INVOICE_LIST, (state, action) => {
        state.invoice_list = action.payload || [];
      });
  },
});

export const {
  setReceiptList,
  setContactList,
  setInvoiceList,
} = receiptSlice.actions;
export default receiptSlice.reducer;

