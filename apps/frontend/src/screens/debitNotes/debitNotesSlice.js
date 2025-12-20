import { createSlice } from '@reduxjs/toolkit';
import { DEBIT_NOTE } from 'constants/types';

const initialState = {
  debit_note_list: [],
  customer_list: [],
  currency_list: [],
  deposit_list: [],
  country_list: [],
  place_of_supply: [],
  status_list: [],
  pay_mode: [],
  invoice_list: [],
};

const debitNotesSlice = createSlice({
  name: 'debit_notes',
  initialState,
  reducers: {
    setDebitNoteList: (state, action) => {
      state.debit_note_list = action.payload;
    },
    setCustomerList: (state, action) => {
      state.customer_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
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
    setInvoiceList: (state, action) => {
      state.invoice_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(DEBIT_NOTE.DEBIT_NOTE_LIST, (state, action) => {
        state.debit_note_list = action.payload?.data || action.payload || [];
      })
      .addCase(DEBIT_NOTE.STATUS_LIST, (state, action) => {
        state.status_list = action.payload?.data || action.payload || [];
      })
      .addCase(DEBIT_NOTE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(DEBIT_NOTE.DEPOSIT_LIST, (state, action) => {
        state.deposit_list = action.payload?.data || action.payload || [];
      })
      .addCase(DEBIT_NOTE.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload || [];
      })
      .addCase(DEBIT_NOTE.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(DEBIT_NOTE.PLACE_OF_SUPPLY, (state, action) => {
        state.place_of_supply = action.payload || [];
      })
      .addCase(DEBIT_NOTE.INVOICE_LIST_FOR_DROPDOWN, (state, action) => {
        state.invoice_list = action.payload || [];
      });
  },
});

export const {
  setDebitNoteList,
  setCustomerList,
  setCurrencyList,
  setDepositList,
  setCountryList,
  setPlaceOfSupply,
  setStatusList,
  setPayMode,
  setInvoiceList,
} = debitNotesSlice.actions;
export default debitNotesSlice.reducer;
