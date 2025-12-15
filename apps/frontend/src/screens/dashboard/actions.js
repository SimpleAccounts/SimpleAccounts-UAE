// Re-export new RTK slice actions for backward compatibility
export {
  getCashFlowGraphData,
  getInvoiceGraphData,
  getProfitLossReport,
  getBankAccountTypes,
  getBankAccountGraphData,
  getProfitAndLossData,
  getTaxes,
  getExpensesGraphData,
  getRevenuesGraphData,
  getTotalBalance,
  setBankAccountType,
  setBankAccountGraph,
  setCashFlowGraph,
  setInvoiceGraph,
  setProfitLoss,
  setTaxes,
  setRevenueGraph,
  setExpenseGraph,
  clearError,
} from './dashboardSlice';

// Legacy empty function
export const initialData = (obj) => {
  return (dispatch) => {};
};
