import { DASHBOARD } from 'constants/types';

const initState = {
  bank_account_type: [],
  bank_account_graph: {},
  cash_flow_graph: {},
  invoice_graph: {},
  proft_loss: {},
  revenue_graph: [],
  expense_graph: [],
  taxes: [],
};

const DashboardReducer = (state = initState, action) => {
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) {
      const arr = val.data;
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };

  const { type, payload } = action;

  switch (type) {
    // Bank Account
    case DASHBOARD.BANK_ACCOUNT_TYPE:
      return {
        ...state,
        bank_account_type: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case DASHBOARD.BANK_ACCOUNT_GRAPH:
      return {
        ...state,
        bank_account_graph: payload?.data || payload || {},
      };

    // Cash Flow
    case DASHBOARD.CASH_FLOW_GRAPH:
      return {
        ...state,
        cash_flow_graph: payload?.data || payload || {},
      };

    // Invoice
    case DASHBOARD.INVOICE_GRAPH:
      return {
        ...state,
        invoice_graph: payload?.data || payload || {},
      };

    // Profit and Loss
    case DASHBOARD.PROFIT_LOSS:
      return {
        ...state,
        proft_loss: payload?.data || payload || {},
      };

    //Taxes
    case DASHBOARD.TAXES:
      return {
        ...state,
        taxes: payload?.data || payload || {},
      };

    // Revenues and Expenses
    case DASHBOARD.REVENUE_GRAPH:
      return {
        ...state,
        revenue_graph: Array.isArray(payload) ? payload : payload?.data || [],
      };

    case DASHBOARD.EXPENSE_GRAPH:
      return {
        ...state,
        expense_graph: Array.isArray(payload) ? payload : payload?.data || [],
      };

    default:
      return state;
  }
};

export default DashboardReducer;
