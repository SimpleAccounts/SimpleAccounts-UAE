import { EXPENSE } from 'constants/types';

const initState = {
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
};

const ExpenseReducer = (state = initState, action) => {
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return [...val];
    if (Array.isArray(val?.data)) {
      const arr = [...val.data];
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };

  const { type, payload } = action;
  switch (type) {
    case EXPENSE.EXPENSE_LIST:
      return {
        ...state,
        expense_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case EXPENSE.EXPENSE_DETAIL:
      return {
        ...state,
        expense_detail: payload?.data || payload || {},
      };

    case EXPENSE.BANK_LIST:
      return {
        ...state,
        bank_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case EXPENSE.CURRENCY_LIST:
      // const currency_list = payload.map(currency => {
      //   return { label: currency.currencyName, value: currency.currencyCode }
      // })

      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case EXPENSE.PROJECT_LIST:
      //   const project_list = payload.map(project => {
      //     return { label: project.projectName, value: project.projectId }
      //   })

      return {
        ...state,
        project_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case EXPENSE.SUPPLIER_LIST:
      //   const supplier_list = payload.map(supplier => {
      //     return { label: supplier.firstName, value: supplier.contactId }
      //   })

      return {
        ...state,
        supplier_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case EXPENSE.EMPLOYEE_LIST:
      //   const bank_account_list = payload.map(bank_account => {
      //     return { label: bank_account.bankAccountId, value: bank_account.bankAccountName }
      //   })

      return {
        ...state,
        employee_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case EXPENSE.PAYMENT_LIST:
      //   const payment_list = payload.map(payment => {
      //     return { label: payment.amount, value: payment.paymentID }
      //   })

      return {
        ...state,
        payment_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case EXPENSE.VAT_LIST:
      // const vat_list = payload.data.map(vat => {
      //   return { label: vat.name, value: vat.id }
      // })

      return {
        ...state,
        vat_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    case EXPENSE.EXPENSE_CATEGORIES_LIST:
      //   const chart_of_account_list = payload.map((item) => {
      //     return { label: item.transactionCategoryDescription, value: item.transactionCategoryId }
      //   })

      return {
        ...state,
        expense_categories_list: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case EXPENSE.PAY_MODE: {
      let list1 = payload;
      if (list1 && list1.length && list1.length > 0)
        list1 = list1.map((data, index) => {
          if (index == 0) data.label = 'Petty Cash';
          return data;
        });
      return {
        ...state,
        pay_mode_list: Array.isArray(list1) ? list1 : list1?.data || [],
      };
    }

    case EXPENSE.USER_LIST:
      if (payload && payload[0] && payload[0].label) {
        let obj = new Object({ label: 'Company Expense', value: 'Company Expense' });
        payload.unshift(obj);
      }

      return {
        ...state,
        user_list: Array.isArray(payload) ? payload : payload?.data || [],
      };
    case EXPENSE.PAY_TO_LIST: {
      let list = payload;
      if (Array.isArray(list)) {
        list.unshift({ value: 'Company Expense', label: 'Company Expense' });
      }
      return {
        ...state,
        pay_to_list: Array.isArray(list) ? list : list?.data || [],
      };
    }

    default:
      return state;
  }
};
export default ExpenseReducer;
