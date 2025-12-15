import { createSlice } from '@reduxjs/toolkit';
import { EMPLOYEE } from 'constants/types';

const initialState = {
  employee_list: [],
  currency_list: [],
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployeeList: (state, action) => {
      state.employee_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(EMPLOYEE.EMPLOYEE_LIST, (state, action) => {
        state.employee_list = action.payload || [];
      })
      .addCase(EMPLOYEE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      });
  },
});

export const { setEmployeeList, setCurrencyList } = employeeSlice.actions;
export default employeeSlice.reducer;

