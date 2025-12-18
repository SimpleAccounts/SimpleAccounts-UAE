import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from 'utils';
import { DASHBOARD } from 'constants/types';

// ============ Async Thunks ============

export const getCashFlowGraphData = createAsyncThunk(
  'dashboard/getCashFlowGraphData',
  async (daterange, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/transaction/getCashFlow?monthNo=' + daterange,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getInvoiceGraphData = createAsyncThunk(
  'dashboard/getInvoiceGraphData',
  async (daterange, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/invoice/getChartData?monthCount=' + daterange,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getProfitLossReport = createAsyncThunk(
  'dashboard/getProfitLossReport',
  async (daterange, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/dashboardReport/profitandloss?monthNo=' + daterange,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getBankAccountTypes = createAsyncThunk(
  'dashboard/getBankAccountTypes',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/bank/list',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data.data;
      }
      return rejectWithValue('Failed to get bank account types');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getBankAccountGraphData = createAsyncThunk(
  'dashboard/getBankAccountGraphData',
  async (args, { rejectWithValue }) => {
    try {
      // Handle both object and array arguments
      let accountId, monthCount;
      if (Array.isArray(args)) {
        // Called with array: [account, daterange]
        accountId = args[0];
        monthCount = args[1];
      } else if (typeof args === 'object' && args !== null) {
        // Called with object: { account, daterange }
        accountId = args.account;
        monthCount = args.daterange;
      } else {
        // Single argument (fallback)
        accountId = args;
        monthCount = 12; // default
      }
      const data = {
        method: 'GET',
        url: `/rest/bank/getBankChart?bankId=${accountId}&monthCount=${monthCount}`,
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get bank account graph data');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getProfitAndLossData = createAsyncThunk(
  'dashboard/getProfitAndLossData',
  async (daterange, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/dashboardReport/profitandloss?monthNo=' + daterange,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getTaxes = createAsyncThunk(
  'dashboard/getTaxes',
  async (daterange, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/dashboardReport/getVatReport?monthNo=' + daterange,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getExpensesGraphData = createAsyncThunk(
  'dashboard/getExpensesGraphData',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/expense/getList',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data.data;
      }
      return rejectWithValue('Failed to get expenses graph data');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getRevenuesGraphData = createAsyncThunk(
  'dashboard/getRevenuesGraphData',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/invoice/getList?type=2',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data.data;
      }
      return rejectWithValue('Failed to get revenues graph data');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getTotalBalance = createAsyncThunk(
  'dashboard/getTotalBalance',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/bank/getTotalBalance',
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  bank_account_type: [],
  bank_account_graph: {},
  cash_flow_graph: {},
  invoice_graph: {},
  proft_loss: {},
  revenue_graph: [],
  expense_graph: [],
  taxes: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setBankAccountType: (state, action) => {
      state.bank_account_type = action.payload;
    },
    setBankAccountGraph: (state, action) => {
      state.bank_account_graph = action.payload;
    },
    setCashFlowGraph: (state, action) => {
      state.cash_flow_graph = action.payload;
    },
    setInvoiceGraph: (state, action) => {
      state.invoice_graph = action.payload;
    },
    setProfitLoss: (state, action) => {
      state.proft_loss = action.payload;
    },
    setTaxes: (state, action) => {
      state.taxes = action.payload;
    },
    setRevenueGraph: (state, action) => {
      state.revenue_graph = action.payload;
    },
    setExpenseGraph: (state, action) => {
      state.expense_graph = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCashFlowGraphData
      .addCase(getCashFlowGraphData.fulfilled, (state, action) => {
        state.cash_flow_graph = action.payload;
      })
      // getInvoiceGraphData
      .addCase(getInvoiceGraphData.fulfilled, (state, action) => {
        state.invoice_graph = action.payload;
      })
      // getProfitLossReport
      .addCase(getProfitLossReport.fulfilled, (state, action) => {
        state.proft_loss = action.payload;
      })
      // getBankAccountTypes
      .addCase(getBankAccountTypes.fulfilled, (state, action) => {
        state.bank_account_type = action.payload;
      })
      // getBankAccountGraphData
      .addCase(getBankAccountGraphData.fulfilled, (state, action) => {
        state.bank_account_graph = action.payload;
      })
      // getProfitAndLossData
      .addCase(getProfitAndLossData.fulfilled, (state, action) => {
        state.proft_loss = action.payload;
      })
      // getTaxes
      .addCase(getTaxes.fulfilled, (state, action) => {
        state.taxes = action.payload;
      })
      // getExpensesGraphData
      .addCase(getExpensesGraphData.fulfilled, (state, action) => {
        state.expense_graph = action.payload;
      })
      // getRevenuesGraphData
      .addCase(getRevenuesGraphData.fulfilled, (state, action) => {
        state.revenue_graph = action.payload;
      })
      // Backward compatibility with old action types
      .addCase(DASHBOARD.BANK_ACCOUNT_TYPE, (state, action) => {
        state.bank_account_type = action.payload || [];
      })
      .addCase(DASHBOARD.BANK_ACCOUNT_GRAPH, (state, action) => {
        state.bank_account_graph = action.payload || {};
      })
      .addCase(DASHBOARD.CASH_FLOW_GRAPH, (state, action) => {
        state.cash_flow_graph = action.payload || {};
      })
      .addCase(DASHBOARD.INVOICE_GRAPH, (state, action) => {
        state.invoice_graph = action.payload || {};
      })
      .addCase(DASHBOARD.PROFIT_LOSS, (state, action) => {
        state.proft_loss = action.payload || {};
      })
      .addCase(DASHBOARD.TAXES, (state, action) => {
        state.taxes = action.payload || [];
      })
      .addCase(DASHBOARD.REVENUE_GRAPH, (state, action) => {
        state.revenue_graph = action.payload || [];
      })
      .addCase(DASHBOARD.EXPENSE_GRAPH, (state, action) => {
        state.expense_graph = action.payload || [];
      });
  },
});

export const {
  setBankAccountType,
  setBankAccountGraph,
  setCashFlowGraph,
  setInvoiceGraph,
  setProfitLoss,
  setTaxes,
  setRevenueGraph,
  setExpenseGraph,
  clearError,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;

