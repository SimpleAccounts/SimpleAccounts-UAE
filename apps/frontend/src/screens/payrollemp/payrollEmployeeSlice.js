import { createSlice } from '@reduxjs/toolkit';
import { EMPLOYEEPAYROLL } from 'constants/types';

const initialState = {
  payroll_employee_list: [],
  designation_dropdown: [],
  employee_list_dropdown: [],
  country_list: [],
  state_list: [],
  salary_role_dropdown: [],
  salary_structure_dropdown: [],
  salary_component_fixed_dropdown: [],
  salary_component_varaible_dropdown: [],
  salary_component_deduction_dropdown: [],
  incompleteEmployeeList: [],
};

const payrollEmployeeSlice = createSlice({
  name: 'payrollEmployee',
  initialState,
  reducers: {
    setPayrollEmployeeList: (state, action) => {
      state.payroll_employee_list = action.payload;
    },
    setDesignationDropdown: (state, action) => {
      state.designation_dropdown = action.payload;
    },
    setEmployeeListDropdown: (state, action) => {
      state.employee_list_dropdown = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setStateList: (state, action) => {
      state.state_list = action.payload;
    },
    setSalaryRoleDropdown: (state, action) => {
      state.salary_role_dropdown = action.payload;
    },
    setSalaryStructureDropdown: (state, action) => {
      state.salary_structure_dropdown = action.payload;
    },
    setSalaryComponentFixedDropdown: (state, action) => {
      state.salary_component_fixed_dropdown = action.payload;
    },
    setSalaryComponentVariableDropdown: (state, action) => {
      state.salary_component_varaible_dropdown = action.payload;
    },
    setSalaryComponentDeductionDropdown: (state, action) => {
      state.salary_component_deduction_dropdown = action.payload;
    },
    setIncompleteEmployeeList: (state, action) => {
      state.incompleteEmployeeList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, (state, action) => {
        state.payroll_employee_list = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.DESIGNATION_DROPDOWN, (state, action) => {
        state.designation_dropdown = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN, (state, action) => {
        state.employee_list_dropdown = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.STATE_LIST, (state, action) => {
        state.state_list = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.SALARY_ROLE_DROPDOWN, (state, action) => {
        state.salary_role_dropdown = action.payload || [];
      })
      .addCase(EMPLOYEEPAYROLL.SALARY_STRUCTURE_DROPDOWN, (state, action) => {
        state.salary_structure_dropdown = action.payload || [];
      })
      .addCase(
        EMPLOYEEPAYROLL.SALARY_COMPONENT_FIXED_DROPDOWN,
        (state, action) => {
          state.salary_component_fixed_dropdown = action.payload || [];
        }
      )
      .addCase(
        EMPLOYEEPAYROLL.SALARY_COMPONENT_VARAIBLE_DROPDOWN,
        (state, action) => {
          state.salary_component_varaible_dropdown = action.payload || [];
        }
      )
      .addCase(
        EMPLOYEEPAYROLL.SALARY_COMPONENT_DEDUCTION_DROPDOWN,
        (state, action) => {
          state.salary_component_deduction_dropdown = action.payload || [];
        }
      )
      .addCase(EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST, (state, action) => {
        state.incompleteEmployeeList = action.payload || [];
      });
  },
});

export const {
  setPayrollEmployeeList,
  setDesignationDropdown,
  setEmployeeListDropdown,
  setCountryList,
  setStateList,
  setSalaryRoleDropdown,
  setSalaryStructureDropdown,
  setSalaryComponentFixedDropdown,
  setSalaryComponentVariableDropdown,
  setSalaryComponentDeductionDropdown,
  setIncompleteEmployeeList,
} = payrollEmployeeSlice.actions;
export default payrollEmployeeSlice.reducer;

