import { createSlice } from '@reduxjs/toolkit';
import { GOODS_RECEVED_NOTE } from 'constants/types';

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
  goods_received_note_list: [],
  po_list: [],
};

const goodsReceivedNoteSlice = createSlice({
  name: 'goods_received_note',
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
    setGoodsReceivedNoteList: (state, action) => {
      state.goods_received_note_list = action.payload;
    },
    setPoList: (state, action) => {
      state.po_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(GOODS_RECEVED_NOTE.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.CONTACT_LIST, (state, action) => {
        state.contact_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.GOODS_RECEVED_NOTE_LIST, (state, action) => {
        state.goods_received_note_list = action.payload || [];
      })
      .addCase(GOODS_RECEVED_NOTE.PO_LIST, (state, action) => {
        state.po_list = action.payload?.data || action.payload || [];
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
  setGoodsReceivedNoteList,
  setPoList,
} = goodsReceivedNoteSlice.actions;
export default goodsReceivedNoteSlice.reducer;
