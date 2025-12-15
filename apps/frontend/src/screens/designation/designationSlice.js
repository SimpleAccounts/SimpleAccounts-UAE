import { createSlice } from '@reduxjs/toolkit';
import { EMPLOYEE_DESIGNATION } from 'constants/types';

const initialState = {
  designation_list: [],
  designationType_list: [],
};

const designationSlice = createSlice({
  name: 'employeeDesignation',
  initialState,
  reducers: {
    setDesignationList: (state, action) => {
      state.designation_list = action.payload;
    },
    setDesignationTypeList: (state, action) => {
      state.designationType_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST, (state, action) => {
        state.designation_list = action.payload || [];
      })
      .addCase(
        EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
        (state, action) => {
          state.designationType_list = action.payload || [];
        }
      );
  },
});

export const { setDesignationList, setDesignationTypeList } = designationSlice.actions;
export default designationSlice.reducer;

