import { createSlice } from '@reduxjs/toolkit';
import { IMPORT } from 'constants/types';

const initialState = {
  file_data_list: [],
};

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    setFileDataList: (state, action) => {
      state.file_data_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(IMPORT.FILE_DATA_LIST, (state, action) => {
      state.file_data_list = action.payload || [];
    });
  },
});

export const { setFileDataList } = importSlice.actions;
export default importSlice.reducer;
