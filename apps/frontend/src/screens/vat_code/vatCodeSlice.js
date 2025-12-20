import { createSlice } from '@reduxjs/toolkit';
import { VAT } from 'constants/types';

const initialState = {
  vat_list: [],
  vat_row: {},
};

const vatCodeSlice = createSlice({
  name: 'vat',
  initialState,
  reducers: {
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setVatRow: (state, action) => {
      state.vat_row = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(VAT.VAT_LIST, (state, action) => {
        state.vat_list = action.payload || [];
      })
      .addCase(VAT.VAT_ROW, (state, action) => {
        state.vat_row = action.payload || {};
      });
  },
});

export const { setVatList, setVatRow } = vatCodeSlice.actions;
export default vatCodeSlice.reducer;
