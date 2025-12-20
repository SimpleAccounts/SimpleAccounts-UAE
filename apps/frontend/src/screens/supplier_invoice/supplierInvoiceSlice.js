import { createSlice } from '@reduxjs/toolkit';
import { SUPPLIER_INVOICE } from 'constants/types';

const initialState = {
  supplier_invoice_list: [],
  project_list: [],
  contact_list: [],
  status_list: [],
  currency_list: [],
  vat_list: [],
  excise_list: [],
  product_list: [],
  supplier_list: [],
  country_list: [],
  deposit_list: [],
  pay_mode: [],
};

const supplierInvoiceSlice = createSlice({
  name: 'supplier_invoice',
  initialState,
  reducers: {
    setSupplierInvoiceList: (state, action) => {
      state.supplier_invoice_list = action.payload;
    },
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
    setSupplierList: (state, action) => {
      state.supplier_list = action.payload;
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setExciseList: (state, action) => {
      state.excise_list = action.payload;
    },
    setPayMode: (state, action) => {
      state.pay_mode = action.payload;
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
  },
  extraReducers: builder => {
    builder
      // Backward compatibility with old action types
      .addCase(SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST, (state, action) => {
        state.supplier_invoice_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.EXCISE_LIST, (state, action) => {
        state.excise_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(SUPPLIER_INVOICE.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      });
  },
});

export const {
  setSupplierInvoiceList,
  setProjectList,
  setContactList,
  setStatusList,
  setCurrencyList,
  setSupplierList,
  setVatList,
  setExciseList,
  setPayMode,
  setProductList,
  setDepositList,
  setCountryList,
} = supplierInvoiceSlice.actions;
export default supplierInvoiceSlice.reducer;
