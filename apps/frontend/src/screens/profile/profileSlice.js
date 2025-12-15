import { createSlice } from '@reduxjs/toolkit';
import { PROFILE } from 'constants/types';

const initialState = {
  currency_list: [],
  country_list: [],
  industry_type_list: [],
  company_type_list: [],
  role_list: [],
  invoicing_state_list: [],
  company_state_list: [],
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setIndustryTypeList: (state, action) => {
      state.industry_type_list = action.payload;
    },
    setCompanyTypeList: (state, action) => {
      state.company_type_list = action.payload;
    },
    setRoleList: (state, action) => {
      state.role_list = action.payload;
    },
    setInvoicingStateList: (state, action) => {
      state.invoicing_state_list = action.payload;
    },
    setCompanyStateList: (state, action) => {
      state.company_state_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(PROFILE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload || [];
      })
      .addCase(PROFILE.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(PROFILE.INDUSTRY_TYPE_LIST, (state, action) => {
        state.industry_type_list = action.payload || [];
      })
      .addCase(PROFILE.ROLE_LIST, (state, action) => {
        state.role_list = action.payload || [];
      })
      .addCase(PROFILE.COMPANY_TYPE_LIST, (state, action) => {
        state.company_type_list = action.payload || [];
      })
      .addCase(PROFILE.INVOICING_STATE_LIST, (state, action) => {
        state.invoicing_state_list = action.payload || [];
      })
      .addCase(PROFILE.COMPANY_STATE_LIST, (state, action) => {
        state.company_state_list = action.payload || [];
      });
  },
});

export const {
  setCurrencyList,
  setCountryList,
  setIndustryTypeList,
  setCompanyTypeList,
  setRoleList,
  setInvoicingStateList,
  setCompanyStateList,
} = profileSlice.actions;
export default profileSlice.reducer;

