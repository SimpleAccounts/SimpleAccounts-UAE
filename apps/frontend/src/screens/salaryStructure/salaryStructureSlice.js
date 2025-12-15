import { createSlice } from '@reduxjs/toolkit';
import { SALARY_STRUCTURE } from 'constants/types';

const initialState = {
  salaryStructure_list: [],
  currency_list: [],
  country_list: [],
};

const salaryStructureSlice = createSlice({
  name: 'salaryStructure',
  initialState,
  reducers: {
    setSalaryStructureList: (state, action) => {
      state.salaryStructure_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(SALARY_STRUCTURE.SALARY_STRUCTURE_LIST, (state, action) => {
      state.salaryStructure_list = action.payload || [];
    });
  },
});

export const { setSalaryStructureList, setCurrencyList, setCountryList } =
  salaryStructureSlice.actions;
export default salaryStructureSlice.reducer;

