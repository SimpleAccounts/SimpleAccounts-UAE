import { createSlice } from '@reduxjs/toolkit';
import { CURRENCYCONVERT } from 'constants/types';

const initialState = {
  currency_convert_list: [],
  currency_list: [],
  currency_converstion_list: [],
};

const currencyConvertSlice = createSlice({
  name: 'currencyConvert',
  initialState,
  reducers: {
    setCurrencyConvertList: (state, action) => {
      state.currency_convert_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setCurrencyConversionList: (state, action) => {
      state.currency_converstion_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(CURRENCYCONVERT.CURRENCY_CONVERT_LIST, (state, action) => {
        state.currency_convert_list = action.payload || [];
      })
      .addCase(CURRENCYCONVERT.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload || [];
      })
      .addCase(CURRENCYCONVERT.CURRENCY_CONVERTION_LIST, (state, action) => {
        state.currency_converstion_list = action.payload || [];
      });
  },
});

export const { setCurrencyConvertList, setCurrencyList, setCurrencyConversionList } =
  currencyConvertSlice.actions;
export default currencyConvertSlice.reducer;
