import { createSlice } from '@reduxjs/toolkit';
import { EMPLOYEEPAYROLL } from 'constants/types';

const initialState = {
  payroll_employee_list: [],
  employee_list_dropdown: [],
  incompleteEmployeeList: [],
  payroll_list: [],
  approver_dropdown_list: [],
  user_approver_generater_dropdown_list: [],
};

const payrollRunSlice = createSlice({
  name: 'payrollRun',
  initialState,
  reducers: {
    setPayrollEmployeeList: (state, action) => {
      state.payroll_employee_list = action.payload;
    },
    setEmployeeListDropdown: (state, action) => {
      state.employee_list_dropdown = action.payload;
    },
    setIncompleteEmployeeList: (state, action) => {
      state.incompleteEmployeeList = action.payload;
    },
    setPayrollList: (state, action) => {
      state.payroll_list = action.payload;
    },
    setApproverDropdownList: (state, action) => {
      state.approver_dropdown_list = action.payload;
    },
    setUserApproverGeneraterDropdownList: (state, action) => {
      state.user_approver_generater_dropdown_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, (state, action) => {
        state.payroll_employee_list = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN, (state, action) => {
        state.employee_list_dropdown = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST, (state, action) => {
        state.incompleteEmployeeList = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.PAYROLL_LIST, (state, action) => {
        state.payroll_list = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.APPROVER_DROPDOWN, (state, action) => {
        state.approver_dropdown_list = action.payload || [];
      })
      .addCase(
        EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN,
        (state, action) => {
          state.user_approver_generater_dropdown_list = action.payload || [];
        }
      );
  },
});

export const {
  setPayrollEmployeeList,
  setEmployeeListDropdown,
  setIncompleteEmployeeList,
  setPayrollList,
  setApproverDropdownList,
  setUserApproverGeneraterDropdownList,
} = payrollRunSlice.actions;
export default payrollRunSlice.reducer;

