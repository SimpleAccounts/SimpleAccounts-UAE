import { createSlice } from '@reduxjs/toolkit';
import { EXPENSE } from 'constants/types';

const initialState = {
  expense_list: [],
  expense_detail: {},
  currency_list: [],
  supplier_list: [],
  project_list: [],
  employee_list: [],
  expense_categories_list: [],
  vat_list: [],
  bank_list: [],
  pay_mode_list: [],
  pay_to_list: [],
  payment_list: [],
  user_list: [],
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setExpenseList: (state, action) => {
      state.expense_list = action.payload;
    },
    setExpenseDetail: (state, action) => {
      state.expense_detail = action.payload;
    },
    setCurrencyList: (state, action) => {
      state.currency_list = action.payload;
    },
    setSupplierList: (state, action) => {
      state.supplier_list = action.payload;
    },
    setProjectList: (state, action) => {
      state.project_list = action.payload;
    },
    setEmployeeList: (state, action) => {
      state.employee_list = action.payload;
    },
    setExpenseCategoriesList: (state, action) => {
      state.expense_categories_list = action.payload;
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setBankList: (state, action) => {
      state.bank_list = action.payload;
    },
    setPayModeList: (state, action) => {
      state.pay_mode_list = action.payload;
    },
    setPayToList: (state, action) => {
      state.pay_to_list = action.payload;
    },
    setPaymentList: (state, action) => {
      state.payment_list = action.payload;
    },
    setUserList: (state, action) => {
      state.user_list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(EXPENSE.EXPENSE_LIST, (state, action) => {
        state.expense_list = action.payload || [];
      })
      .addCase(EXPENSE.EXPENSE_DETAIL, (state, action) => {
        state.expense_detail = action.payload || {};
      })
      .addCase(EXPENSE.BANK_LIST, (state, action) => {
        state.bank_list = action.payload?.data || action.payload || [];
      })
      .addCase(EXPENSE.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload || [];
      })
      .addCase(EXPENSE.PROJECT_LIST, (state, action) => {
        state.project_list = action.payload || [];
      })
      .addCase(EXPENSE.SUPPLIER_LIST, (state, action) => {
        state.supplier_list = action.payload || [];
      })
      .addCase(EXPENSE.EMPLOYEE_LIST, (state, action) => {
        state.employee_list = action.payload || [];
      })
      .addCase(EXPENSE.PAYMENT_LIST, (state, action) => {
        state.payment_list = action.payload || [];
      })
      .addCase(EXPENSE.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload || [];
      })
      .addCase(EXPENSE.EXPENSE_CATEGORIES_LIST, (state, action) => {
        state.expense_categories_list = action.payload || [];
      })
      .addCase(EXPENSE.PAY_MODE, (state, action) => {
        let list1 = action.payload;
        if (list1 && list1.length && list1.length > 0) {
          list1 = list1.map((data, index) => {
            if (index == 0) data.label = 'Petty Cash';
            return data;
          });
        }
        state.pay_mode_list = list1 || [];
      })
      .addCase(EXPENSE.USER_LIST, (state, action) => {
        let payload = action.payload;
        if (payload && payload[0] && payload[0].label) {
          let obj = new Object({ label: 'Company Expense', value: 'Company Expense' });
          payload.unshift(obj);
        }
        state.user_list = payload || [];
      })
      .addCase(EXPENSE.PAY_TO_LIST, (state, action) => {
        let list = action.payload;
        list.unshift({ value: 'Company Expense', label: 'Company Expense' });
        state.pay_to_list = list || [];
      });
  },
});

export const {
  setExpenseList,
  setExpenseDetail,
  setCurrencyList,
  setSupplierList,
  setProjectList,
  setEmployeeList,
  setExpenseCategoriesList,
  setVatList,
  setBankList,
  setPayModeList,
  setPayToList,
  setPaymentList,
  setUserList,
} = expenseSlice.actions;
export default expenseSlice.reducer;
