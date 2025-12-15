import { createSlice } from '@reduxjs/toolkit';
import { CHART_ACCOUNT } from 'constants/types';

const initialState = {
  transaction_type_list: [],
  sub_transaction_type_list: [],
  transaction_category_list: [],
};

const chartAccountSlice = createSlice({
  name: 'chart_account',
  initialState,
  reducers: {
    setTransactionCategoryList: (state, action) => {
      state.transaction_category_list = action.payload;
    },
    setTransactionTypeList: (state, action) => {
      state.transaction_type_list = action.payload;
    },
    setSubTransactionTypeList: (state, action) => {
      state.sub_transaction_type_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST, (state, action) => {
        state.transaction_category_list = action.payload || [];
      })
      .addCase(CHART_ACCOUNT.TRANSACTION_TYPES, (state, action) => {
        state.transaction_type_list = action.payload || [];
      })
      .addCase(CHART_ACCOUNT.SUB_TRANSACTION_TYPES, (state, action) => {
        state.sub_transaction_type_list = action.payload || [];
      });
  },
});

export const {
  setTransactionCategoryList,
  setTransactionTypeList,
  setSubTransactionTypeList,
} = chartAccountSlice.actions;
export default chartAccountSlice.reducer;

