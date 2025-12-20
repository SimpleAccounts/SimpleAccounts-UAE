import { createSlice } from '@reduxjs/toolkit';
import { OPENING_BALANCE } from 'constants/types';

const initialState = {
  transaction_category_list: [],
  opening_balance_list: [],
};

const openingBalanceSlice = createSlice({
  name: 'opening_balance',
  initialState,
  reducers: {
    setTransactionCategoryList: (state, action) => {
      state.transaction_category_list = action.payload;
    },
    setOpeningBalanceList: (state, action) => {
      state.opening_balance_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(OPENING_BALANCE.TRANSACTION_CATEGORY_LIST, (state, action) => {
        state.transaction_category_list = action.payload?.data || action.payload || [];
      })
      .addCase(OPENING_BALANCE.OPENING_BALANCE_LIST, (state, action) => {
        state.opening_balance_list = action.payload || [];
      });
  },
});

export const { setTransactionCategoryList, setOpeningBalanceList } = openingBalanceSlice.actions;
export default openingBalanceSlice.reducer;
