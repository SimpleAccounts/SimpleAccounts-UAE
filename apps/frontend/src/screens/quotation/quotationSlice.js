import { createSlice } from '@reduxjs/toolkit';
import { QUOTATION } from 'constants/types';

const initialState = {
  project_list: [],
  contact_list: [],
  status_list: [],
  currency_list: [],
  vat_list: [],
  product_list: [],
  supplier_list: [],
  country_list: [],
  deposit_list: [],
  pay_mode: [],
  quotation_list: [],
  excise_list: [],
};

const quotationSlice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    setProjectList: (state, action) => {
      state.project_list = action.payload;
    },
    setContactList: (state, action) => {
      state.contact_list = action.payload;
    },
    setStatusList: (state, action) => {
      state.status_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setProductList: (state, action) => {
      state.product_list = action.payload;
    },
    setSupplierList: (state, action) => {
      state.supplier_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setDepositList: (state, action) => {
      state.deposit_list = action.payload;
    },
    setPayMode: (state, action) => {
      state.pay_mode = action.payload;
    },
    setQuotationList: (state, action) => {
      state.quotation_list = action.payload;
    },
    setExciseList: (state, action) => {
      state.excise_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(QUOTATION.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.EXCISE_LIST, (state, action) => {
        state.excise_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(QUOTATION.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(QUOTATION.QUOTATION_LIST, (state, action) => {
        state.quotation_list = action.payload || [];
      });
  },
});

export const {
  setProjectList,
  setContactList,
  setStatusList,
  setCurrencyList,
  setVatList,
  setProductList,
  setSupplierList,
  setCountryList,
  setDepositList,
  setPayMode,
  setQuotationList,
  setExciseList,
} = quotationSlice.actions;
export default quotationSlice.reducer;
