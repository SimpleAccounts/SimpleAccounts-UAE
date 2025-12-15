import { createSlice } from '@reduxjs/toolkit';
import { CONTACT } from 'constants/types';

const initialState = {
  contact_list: [],
  country_list: [],
  currency_list: [],
  state_list: [],
  city_list: [],
  contact_type_list: [],
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    setContactList: (state, action) => {
      state.contact_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setStateList: (state, action) => {
      state.state_list = action.payload;
    },
    setCityList: (state, action) => {
      state.city_list = action.payload;
    },
    setContactTypeList: (state, action) => {
      state.contact_type_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(CONTACT.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload || [];
      })
      .addCase(CONTACT.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(CONTACT.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload || [];
      })
      .addCase(CONTACT.STATE_LIST, (state, action) => {
        state.state_list = action.payload || [];
      })
      .addCase(CONTACT.CITY_LIST, (state, action) => {
        state.city_list = action.payload || [];
      })
      .addCase(CONTACT.CONTACT_TYPE_LIST, (state, action) => {
        state.contact_type_list = action.payload || [];
      });
  },
});

export const {
  setContactList,
  setCountryList,
  setCurrencyList,
  setStateList,
  setCityList,
  setContactTypeList,
} = contactSlice.actions;
export default contactSlice.reducer;

