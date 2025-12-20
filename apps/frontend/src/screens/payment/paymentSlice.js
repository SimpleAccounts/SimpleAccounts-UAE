import { createSlice } from '@reduxjs/toolkit';
import { PAYMENT } from 'constants/types';

const initialState = {
  payment_list: [],
  currency_list: [],
  bank_list: [],
  supplier_list: [],
  invoice_list: [],
  project_list: [],
  country_list: [],
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentList: (state, action) => {
      state.payment_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setBankList: (state, action) => {
      state.bank_list = action.payload;
    },
    setSupplierList: (state, action) => {
      state.supplier_list = action.payload;
    },
    setInvoiceList: (state, action) => {
      state.invoice_list = action.payload;
    },
    setProjectList: (state, action) => {
      state.project_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Backward compatibility with old action types
      .addCase(PAYMENT.PAYMENT_LIST, (state, action) => {
        state.payment_list = action.payload?.data || action.payload || [];
      })
      .addCase(PAYMENT.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(PAYMENT.BANK_LIST, (state, action) => {
        state.bank_list = action.payload?.data || action.payload || [];
      })
      .addCase(PAYMENT.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload?.data || action.payload || [];
      })
      .addCase(PAYMENT.INVOICE_LIST, (state, action) => {
        state.invoice_list = action.payload?.data || action.payload || [];
      })
      .addCase(PAYMENT.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(PAYMENT.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload?.data || action.payload || [];
      });
  },
});

export const {
  setPaymentList,
  setCurrencyList,
  setBankList,
  setSupplierList,
  setInvoiceList,
  setProjectList,
  setCountryList,
} = paymentSlice.actions;
export default paymentSlice.reducer;
