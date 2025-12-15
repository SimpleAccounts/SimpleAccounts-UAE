import { createSlice } from '@reduxjs/toolkit';
import { ORGANIZATION } from 'constants/types';

const initialState = {
  country_list: [],
  industry_type_list: [],
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setIndustryTypeList: (state, action) => {
      state.industry_type_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ORGANIZATION.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(ORGANIZATION.INDUSTRY_TYPE_LIST, (state, action) => {
        state.industry_type_list = action.payload || [];
      });
  },
});

export const { setCountryList, setIndustryTypeList } = organizationSlice.actions;
export default organizationSlice.reducer;

