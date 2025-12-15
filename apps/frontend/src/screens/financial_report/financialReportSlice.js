import { createSlice } from '@reduxjs/toolkit';
import { REPORTS } from 'constants/types';

const initialState = {
  sales_by_customer: [],
  sales_by_item: [],
  purchase_by_vendor: [],
  purchase_by_item: [],
  company_profile: [],
  receivable_invoice: [],
  payable_invoice: [],
  creditnote_details: [],
  setting_list: [],
  payment_history: [],
  ctReport_list: [],
};

const financialReportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setSalesByCustomer: (state, action) => {
      state.sales_by_customer = action.payload;
    },
    setSalesByItem: (state, action) => {
      state.sales_by_item = action.payload;
    },
    setPurchaseByVendor: (state, action) => {
      state.purchase_by_vendor = action.payload;
    },
    setPurchaseByItem: (state, action) => {
      state.purchase_by_item = action.payload;
    },
    setCompanyProfile: (state, action) => {
      state.company_profile = action.payload;
    },
    setReceivableInvoice: (state, action) => {
      state.receivable_invoice = action.payload;
    },
    setPayableInvoice: (state, action) => {
      state.payable_invoice = action.payload;
    },
    setCreditnoteDetails: (state, action) => {
      state.creditnote_details = action.payload;
    },
    setSettingList: (state, action) => {
      state.setting_list = action.payload;
    },
    setPaymentHistory: (state, action) => {
      state.payment_history = action.payload;
    },
    setCtReportList: (state, action) => {
      state.ctReport_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(REPORTS.COMPANY_PROFILE, (state, action) => {
        state.company_profile = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.SALES_BY_CUSTOMER, (state, action) => {
        state.sales_by_customer = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.SALES_BY_ITEM, (state, action) => {
        state.sales_by_item = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.PURCHASE_BY_VENDOR, (state, action) => {
        state.purchase_by_vendor = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.PURCHASE_BY_ITEM, (state, action) => {
        state.purchase_by_item = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.RECEIVABLE_INVOICE, (state, action) => {
        state.receivable_invoice = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.PAYABLE_INVOICE, (state, action) => {
        state.payable_invoice = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.CREDITNOTE_DETAILS, (state, action) => {
        state.creditnote_details = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.SETTING_LIST, (state, action) => {
        state.setting_list = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.PAYMENT_HISTORY, (state, action) => {
        state.payment_history = action.payload?.data || action.payload || [];
      })
      .addCase(REPORTS.CTREPORT_LIST, (state, action) => {
        state.ctReport_list = action.payload?.data || action.payload || [];
      });
  },
});

export const {
  setSalesByCustomer,
  setSalesByItem,
  setPurchaseByVendor,
  setPurchaseByItem,
  setCompanyProfile,
  setReceivableInvoice,
  setPayableInvoice,
  setCreditnoteDetails,
  setSettingList,
  setPaymentHistory,
  setCtReportList,
} = financialReportSlice.actions;
export default financialReportSlice.reducer;

