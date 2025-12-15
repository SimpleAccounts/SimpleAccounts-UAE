import { createSlice } from '@reduxjs/toolkit';
import { PURCHASE_ORDER } from 'constants/types';

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
  purchase_order_list: [],
  rfq_list: [],
  excise_list: [],
};

const purchaseOrderSlice = createSlice({
  name: 'purchase_order',
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
    setPurchaseOrderList: (state, action) => {
      state.purchase_order_list = action.payload;
    },
    setRfqList: (state, action) => {
      state.rfq_list = action.payload;
    },
    setExciseList: (state, action) => {
      state.excise_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(PURCHASE_ORDER.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.EXCISE_LIST, (state, action) => {
        state.excise_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(PURCHASE_ORDER.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(PURCHASE_ORDER.PURCHASE_ORDER_LIST, (state, action) => {
        state.purchase_order_list = action.payload || [];
      })
      .addCase(PURCHASE_ORDER.RFQ_LIST, (state, action) => {
        state.rfq_list = action.payload || [];
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
  setPurchaseOrderList,
  setRfqList,
  setExciseList,
} = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;

