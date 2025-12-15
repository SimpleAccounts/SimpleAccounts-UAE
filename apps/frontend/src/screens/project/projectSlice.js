import { createSlice } from '@reduxjs/toolkit';
import { PROJECT } from 'constants/types';

const initialState = {
  project_list: [],
  currency_list: [],
  country_list: [],
  title_list: [],
  contact_list: [],
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjectList: (state, action) => {
      state.project_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setTitleList: (state, action) => {
      state.title_list = action.payload;
    },
    setContactList: (state, action) => {
      state.contact_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(PROJECT.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload || [];
      })
      .addCase(PROJECT.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload || [];
      })
      .addCase(PROJECT.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(PROJECT.TITLE_LIST, (state, action) => {
        state.title_list = action.payload || [];
      })
      .addCase(PROJECT.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload || [];
      });
  },
});

export const {
  setProjectList,
  setCurrencyList,
  setCountryList,
  setTitleList,
  setContactList,
} = projectSlice.actions;
export default projectSlice.reducer;

