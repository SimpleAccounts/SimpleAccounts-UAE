import { createSlice } from '@reduxjs/toolkit';
import { CUSTOMER_INVOICE } from 'constants/types';

const initialState = {
  customer_invoice_list: [],
  project_list: [],
  customer_list: [],
  currency_list: [],
  vat_list: [],
  product_list: [],
  deposit_list: [],
  country_list: [],
  place_of_supply: [],
  status_list: [],
  pay_mode: [],
  excise_list: [],
};

const customerInvoiceSlice = createSlice({
  name: 'customer_invoice',
  initialState,
  reducers: {
    setCustomerInvoiceList: (state, action) => {
      state.customer_invoice_list = action.payload;
    },
    setProjectList: (state, action) => {
      state.project_list = action.payload;
    },
    setCustomerList: (state, action) => {
      state.customer_list = action.payload;
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
    setDepositList: (state, action) => {
      state.deposit_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setPlaceOfSupply: (state, action) => {
      state.place_of_supply = action.payload;
    },
    setStatusList: (state, action) => {
      state.status_list = action.payload;
    },
    setPayMode: (state, action) => {
      state.pay_mode = action.payload;
    },
    setExciseList: (state, action) => {
      state.excise_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Backward compatibility with old action types
      .addCase(CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST, (state, action) => {
        state.customer_invoice_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.CUSTOMER_LIST, (state, action) => {
        state.customer_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.EXCISE_LIST, (state, action) => {
        state.excise_list = action.payload?.data || action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(CUSTOMER_INVOICE.PLACE_OF_SUPPLY, (state, action) => {
        state.place_of_supply = action.payload || [];
      });
  },
});

export const {
  setCustomerInvoiceList,
  setProjectList,
  setCustomerList,
  setCurrencyList,
  setVatList,
  setProductList,
  setDepositList,
  setCountryList,
  setPlaceOfSupply,
  setStatusList,
  setPayMode,
  setExciseList,
} = customerInvoiceSlice.actions;
export default customerInvoiceSlice.reducer;
