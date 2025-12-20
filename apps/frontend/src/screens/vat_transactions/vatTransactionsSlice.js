import { createSlice } from '@reduxjs/toolkit';
import { VAT_TRANSACTIONS } from 'constants/types';

const initialState = {
  vat_transaction_list: [],
};

const vatTransactionsSlice = createSlice({
  name: 'vat_transactions',
  initialState,
  reducers: {
    setVatTransactionList: (state, action) => {
      state.vat_transaction_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(VAT_TRANSACTIONS.VAT_TRANSACTION_LIST, (state, action) => {
      state.vat_transaction_list = action.payload?.data || action.payload || [];
    });
  },
});

export const { setVatTransactionList } = vatTransactionsSlice.actions;
export default vatTransactionsSlice.reducer;
