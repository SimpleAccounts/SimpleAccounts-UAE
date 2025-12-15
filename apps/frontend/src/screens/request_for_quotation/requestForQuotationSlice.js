import { createSlice } from '@reduxjs/toolkit';
import { REQUEST_FOR_QUOTATION } from 'constants/types';

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
  request_for_quotation_list: [],
  excise_list: [],
};

const requestForQuotationSlice = createSlice({
  name: 'request_for_quotation',
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
    setRequestForQuotationList: (state, action) => {
      state.request_for_quotation_list = action.payload;
    },
    setExciseList: (state, action) => {
      state.excise_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(REQUEST_FOR_QUOTATION.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.EXCISE_LIST, (state, action) => {
        state.excise_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(REQUEST_FOR_QUOTATION.REQUEST_FOR_QUOTATION_LIST, (state, action) => {
        state.request_for_quotation_list = action.payload || [];
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
  setRequestForQuotationList,
  setExciseList,
} = requestForQuotationSlice.actions;
export default requestForQuotationSlice.reducer;

