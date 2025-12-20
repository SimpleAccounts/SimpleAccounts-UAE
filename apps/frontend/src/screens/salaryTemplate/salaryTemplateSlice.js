import { createSlice } from '@reduxjs/toolkit';
import { SALARY_TEMPLATE } from 'constants/types';

const initialState = {
  salary_structure_dropdown: [],
  template_list: [],
  salary_role_dropdown: [],
};

const salaryTemplateSlice = createSlice({
  name: 'salarytemplate',
  initialState,
  reducers: {
    setTemplateList: (state, action) => {
      state.template_list = action.payload;
    },
    setSalaryStructureDropdown: (state, action) => {
      state.salary_structure_dropdown = action.payload;
    },
    setSalaryRoleDropdown: (state, action) => {
      state.salary_role_dropdown = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(SALARY_TEMPLATE.TEMPLATE_LIST, (state, action) => {
        state.template_list = action.payload || [];
      })
      .addCase(SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN, (state, action) => {
        state.salary_structure_dropdown = action.payload?.data || action.payload || [];
      })
      .addCase(SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN, (state, action) => {
        state.salary_role_dropdown = action.payload?.data || action.payload || [];
      });
  },
});

export const { setTemplateList, setSalaryStructureDropdown, setSalaryRoleDropdown } =
  salaryTemplateSlice.actions;
export default salaryTemplateSlice.reducer;
