import { createSlice } from '@reduxjs/toolkit';
import { IMPORT_TRANSACTION } from 'constants/types';

const initialState = {
  date_format_list: [],
};

const importTransactionSlice = createSlice({
  name: 'import_transaction',
  initialState,
  reducers: {
    setDateFormatList: (state, action) => {
      state.date_format_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(IMPORT_TRANSACTION.DATE_FORMAT_LIST, (state, action) => {
      state.date_format_list = action.payload || [];
    });
  },
});

export const { setDateFormatList } = importTransactionSlice.actions;
export default importTransactionSlice.reducer;

