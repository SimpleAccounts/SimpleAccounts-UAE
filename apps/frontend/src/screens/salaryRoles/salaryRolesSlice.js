import { createSlice } from '@reduxjs/toolkit';
import { SALARY_ROLES } from 'constants/types';

const initialState = {
  salaryRole_list: [],
  currency_list: [],
  country_list: [],
};

const salaryRolesSlice = createSlice({
  name: 'salaryRoles',
  initialState,
  reducers: {
    setSalaryRoleList: (state, action) => {
      state.salaryRole_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(SALARY_ROLES.SALARY_ROLES_LIST, (state, action) => {
      state.salaryRole_list = action.payload || [];
    });
  },
});

export const { setSalaryRoleList, setCurrencyList, setCountryList } = salaryRolesSlice.actions;
export default salaryRolesSlice.reducer;
