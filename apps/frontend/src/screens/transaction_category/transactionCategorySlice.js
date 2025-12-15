import { createSlice } from '@reduxjs/toolkit';
import { TRANSACTION } from 'constants/types';

const initialState = {
  transaction_list: [],
  transaction_row: {},
};

const transactionCategorySlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactionList: (state, action) => {
      state.transaction_list = action.payload;
    },
    setTransactionRow: (state, action) => {
      state.transaction_row = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(TRANSACTION.TRANSACTION_LIST, (state, action) => {
        state.transaction_list = action.payload || [];
      })
      .addCase(TRANSACTION.TRANSACTION_ROW, (state, action) => {
        state.transaction_row = action.payload || {};
      });
  },
});

export const { setTransactionList, setTransactionRow } = transactionCategorySlice.actions;
export default transactionCategorySlice.reducer;

