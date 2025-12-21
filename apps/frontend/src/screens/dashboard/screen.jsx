import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BankAccount, CashFlow, ProfitAndLossReport, PaidInvoices } from './sections';
import * as DashboardActions from './actions';
import './style.scss';

const Dashboard = () => {
  const dispatch = useDispatch();

  // Redux state - using useSelector instead of connect
  const bank_account_type = useSelector(state => state.dashboard.bank_account_type);
  const bank_account_graph = useSelector(state => state.dashboard.bank_account_graph);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);
  const cash_flow_graph = useSelector(state => state.dashboard.cash_flow_graph);
  const invoice_graph = useSelector(state => state.dashboard.invoice_graph);
  const profit_loss = useSelector(state => state.dashboard.proft_loss); // Note: typo in state
  const taxes = useSelector(state => state.dashboard.taxes);
  const revenue_graph = useSelector(state => state.dashboard.revenue_graph);
  const expense_graph = useSelector(state => state.dashboard.expense_graph);

  // Create DashboardActions with dispatch bound for backward compatibility
  // This ensures thunks return promises when called
  const dashboardActionsWithDispatch = useMemo(() => {
    const boundActions = {};
    Object.keys(DashboardActions).forEach(key => {
      const actionCreator = DashboardActions[key];
      if (typeof actionCreator === 'function') {
        // Bind dispatch to the action creator so it returns a promise when called
        boundActions[key] = (...args) => {
          const thunk = actionCreator(...args);
          // If it's a thunk (function), dispatch it; otherwise return as-is
          return typeof thunk === 'function' ? dispatch(thunk) : dispatch(thunk);
        };
      } else {
        boundActions[key] = actionCreator;
      }
    });
    return boundActions;
  }, [dispatch]);

  // Props object for sections (maintain backward compatibility)
  const sectionProps = {
    bank_account_type,
    bank_account_graph,
    universal_currency_list,
    cash_flow_graph,
    invoice_graph,
    profit_loss,
    taxes,
    revenue_graph,
    expense_graph,
    DashboardActions: dashboardActionsWithDispatch,
  };

  // Debug logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Debug logs for development - can be removed if not needed
      // console.log('[Dashboard Debug] Dashboard screen useEffect called');
      // console.log('[Dashboard Debug] Dashboard state from Redux:', {
      //   bank_account_type,
      //   bank_account_graph,
      //   cash_flow_graph,
      //   invoice_graph,
      //   profit_loss,
      // });
    }
  }, [bank_account_type, bank_account_graph, cash_flow_graph, invoice_graph, profit_loss]);

  return (
    <div className="dashboard-screen">
      <div className="animated fadeIn">
        {/* Paid Invoices Section */}
        <PaidInvoices {...sectionProps} />

        {/* Two Column Grid for Bank Account and Cash Flow */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <BankAccount {...sectionProps} />
          {/* <RevenueAndExpense {...sectionProps} /> */}
          <CashFlow {...sectionProps} />
        </div>

        {/* Profit and Loss Report */}
        <ProfitAndLossReport {...sectionProps} />
      </div>
    </div>
  );
};

export default Dashboard;

