import { createSlice } from '@reduxjs/toolkit';
import { BANK_ACCOUNT } from 'constants/types';

const initialState = {
  bank_account_list: [],
  bank_transaction_list: [],
  account_type_list: [],
  currency_list: [],
  country_list: [],
  transaction_type_list: [],
  transaction_category_list: [],
  project_list: [],
  customer_invoice_list: [],
  expense_list: [],
  expense_categories_list: [],
  user_list: [],
  vendor_list: [],
  vat_list: [],
  reconcile_list: [],
  UnPaidPayrolls_List: [],
  bank_list: [],
};

const bankAccountSlice = createSlice({
  name: 'bank_account',
  initialState,
  reducers: {
    setBankAccountList: (state, action) => {
      state.bank_account_list = action.payload;
    },
    setBankTransactionList: (state, action) => {
      state.bank_transaction_list = action.payload;
    },
    setAccountTypeList: (state, action) => {
      state.account_type_list = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setCountryList: (state, action) => {
      state.country_list = action.payload;
    },
    setTransactionTypeList: (state, action) => {
      state.transaction_type_list = action.payload;
    },
    setTransactionCategoryList: (state, action) => {
      state.transaction_category_list = action.payload;
    },
    setProjectList: (state, action) => {
      state.project_list = action.payload;
    },
    setCustomerInvoiceList: (state, action) => {
      state.customer_invoice_list = action.payload;
    },
    setVendorList: (state, action) => {
      state.vendor_list = action.payload;
    },
    setExpenseList: (state, action) => {
      state.expense_list = action.payload;
    },
    setExpenseCategoriesList: (state, action) => {
      state.expense_categories_list = action.payload;
    },
    setUserList: (state, action) => {
      state.user_list = action.payload;
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setReconcileList: (state, action) => {
      state.reconcile_list = action.payload;
    },
    setUnPaidPayrollsList: (state, action) => {
      state.UnPaidPayrolls_List = action.payload;
    },
    setBankList: (state, action) => {
      state.bank_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(BANK_ACCOUNT.BANK_ACCOUNT_LIST, (state, action) => {
        state.bank_account_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.BANK_TRANSACTION_LIST, (state, action) => {
        state.bank_transaction_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.ACCOUNT_TYPE_LIST, (state, action) => {
        state.account_type_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.TRANSACTION_CATEGORY_LIST, (state, action) => {
        state.transaction_category_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.VENDOR_LIST, (state, action) => {
        state.vendor_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.BANK_LIST, (state, action) => {
        state.bank_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.CUSTOMER_INVOICE_LIST, (state, action) => {
        state.customer_invoice_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.VENDOR_INVOICE_LIST, (state, action) => {
        state.vendor_invoice_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.EXPENSE_LIST, (state, action) => {
        state.expense_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.EXPENSE_CATEGORIES_LIST, (state, action) => {
        state.expense_categories_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.USER_LIST, (state, action) => {
        state.user_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.TRANSACTION_TYPE_LIST, (state, action) => {
        state.transaction_type_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.RECONCILE_LIST, (state, action) => {
        state.reconcile_list = action.payload || [];
      })
      .addCase(BANK_ACCOUNT.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(BANK_ACCOUNT.UNPAID_PAYROLLS, (state, action) => {
        state.UnPaidPayrolls_List = action.payload?.data || action.payload || [];
      });
  },
});

export const {
  setBankAccountList,
  setBankTransactionList,
  setAccountTypeList,
  setCurrencyList,
  setCountryList,
  setTransactionTypeList,
  setTransactionCategoryList,
  setProjectList,
  setCustomerInvoiceList,
  setVendorList,
  setExpenseList,
  setExpenseCategoriesList,
  setUserList,
  setVatList,
  setReconcileList,
  setUnPaidPayrollsList,
  setBankList,
} = bankAccountSlice.actions;
export default bankAccountSlice.reducer;
