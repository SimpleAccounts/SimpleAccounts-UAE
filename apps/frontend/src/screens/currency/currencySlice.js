import { createSlice } from '@reduxjs/toolkit';
import { CURRENCY } from 'constants/types';

const initialState = {
  currency_list: [],
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(CURRENCY.CURRENCY_LIST, (state, action) => {
      state.currency_list = action.payload?.data || action.payload || [];
    });
  },
});

export const { setCurrencyList } = currencySlice.actions;
export default currencySlice.reducer;

