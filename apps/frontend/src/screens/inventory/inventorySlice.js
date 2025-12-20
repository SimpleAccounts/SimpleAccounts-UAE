import { createSlice } from '@reduxjs/toolkit';
import { INVENTORY } from 'constants/types';

const initialState = {
  summary_list: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSummaryList: (state, action) => {
      state.summary_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(INVENTORY.SUMMARY_LIST, (state, action) => {
      state.summary_list = action.payload || [];
    });
  },
});

export const { setSummaryList } = inventorySlice.actions;
export default inventorySlice.reducer;
