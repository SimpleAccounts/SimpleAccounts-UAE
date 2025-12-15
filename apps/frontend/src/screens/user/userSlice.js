import { createSlice } from '@reduxjs/toolkit';
import { USER } from 'constants/types';

const initialState = {
  user_list: [],
  role_list: [],
  company_type_list: [],
  employee_list: [],
  designation_dropdown: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserList: (state, action) => {
      state.user_list = action.payload;
    },
    setRoleList: (state, action) => {
      state.role_list = action.payload;
    },
    setCompanyTypeList: (state, action) => {
      state.company_type_list = action.payload;
    },
    setEmployeeList: (state, action) => {
      state.employee_list = action.payload;
    },
    setDesignationDropdown: (state, action) => {
      state.designation_dropdown = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(USER.USER_LIST, (state, action) => {
        state.user_list = action.payload || [];
      })
      .addCase(USER.ROLE_LIST, (state, action) => {
        state.role_list = action.payload || [];
      })
      .addCase(USER.COMPANY_TYPE_LIST, (state, action) => {
        state.company_type_list = action.payload || [];
      })
      .addCase(USER.EMPLOYEE_LIST, (state, action) => {
        state.employee_list = action.payload || [];
      })
      .addCase(USER.DESIGNATION_DROPDOWN, (state, action) => {
        state.designation_dropdown = action.payload || [];
      });
  },
});

export const {
  setUserList,
  setRoleList,
  setCompanyTypeList,
  setEmployeeList,
  setDesignationDropdown,
} = userSlice.actions;
export default userSlice.reducer;

