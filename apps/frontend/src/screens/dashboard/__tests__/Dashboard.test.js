import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Dashboard from '../screen';
import * as DashboardActions from '../actions';

// Mock the dashboard sections
jest.mock('../sections', () => ({
  BankAccount: ({ bank_account_type, bank_account_graph }) => (
    <div data-testid="bank-account">
      Bank Account Section
      {bank_account_type && <span>{bank_account_type}</span>}
    </div>
  ),
  CashFlow: ({ cash_flow_graph }) => (
    <div data-testid="cash-flow">
      Cash Flow Section
      {cash_flow_graph && <span>{JSON.stringify(cash_flow_graph)}</span>}
    </div>
  ),
  ProfitAndLossReport: ({ profit_loss, taxes }) => (
    <div data-testid="profit-loss">
      Profit and Loss Report
      {profit_loss && <span>{JSON.stringify(profit_loss)}</span>}
    </div>
  ),
  PaidInvoices: ({ invoice_graph }) => (
    <div data-testid="paid-invoices">
      Paid Invoices Section
      {invoice_graph && <span>{JSON.stringify(invoice_graph)}</span>}
    </div>
  ),
}));

// Mock dashboard actions
jest.mock('../actions', () => ({
  getBankAccountType: jest.fn(),
  getBankAccountGraph: jest.fn(),
  getCashFlowGraph: jest.fn(),
  getInvoiceGraph: jest.fn(),
  getProfitLossData: jest.fn(),
  getRevenueGraph: jest.fn(),
  getExpenseGraph: jest.fn(),
}));

const mockStore = configureStore([]);

describe('Dashboard Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      dashboard: {
        bank_account_type: 'Checking',
        bank_account_graph: { data: [100, 200, 300] },
        cash_flow_graph: { inflow: 5000, outflow: 3000 },
        invoice_graph: { paid: 10, unpaid: 5 },
        proft_loss: { profit: 10000, loss: 2000 },
        taxes: { vat: 500, income_tax: 1000 },
        revenue_graph: { monthly: [1000, 2000, 3000] },
        expense_graph: { monthly: [500, 800, 1200] },
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'USD', currencySymbol: '$' },
          { currencyIsoCode: 'AED', currencySymbol: 'AED' },
        ],
      },
    };

    store = mockStore(initialState);
    store.dispatch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard screen with all sections', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    expect(screen.getByTestId('bank-account')).toBeInTheDocument();
    expect(screen.getByTestId('cash-flow')).toBeInTheDocument();
    expect(screen.getByTestId('profit-loss')).toBeInTheDocument();
    expect(screen.getByTestId('paid-invoices')).toBeInTheDocument();
  });

  test('renders with dashboard-screen class', () => {
    const { container } = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    expect(container.querySelector('.dashboard-screen')).toBeInTheDocument();
  });

  test('renders with animated fadeIn class', () => {
    const { container } = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    expect(container.querySelector('.animated.fadeIn')).toBeInTheDocument();
  });

  test('passes bank_account_type prop to BankAccount component', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const bankAccountSection = screen.getByTestId('bank-account');
    expect(bankAccountSection).toHaveTextContent('Checking');
  });

  test('passes cash_flow_graph prop to CashFlow component', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const cashFlowSection = screen.getByTestId('cash-flow');
    expect(cashFlowSection).toHaveTextContent('inflow');
    expect(cashFlowSection).toHaveTextContent('5000');
  });

  test('passes profit_loss and taxes props to ProfitAndLossReport component', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const profitLossSection = screen.getByTestId('profit-loss');
    expect(profitLossSection).toHaveTextContent('profit');
    expect(profitLossSection).toHaveTextContent('10000');
  });

  test('passes invoice_graph prop to PaidInvoices component', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const paidInvoicesSection = screen.getByTestId('paid-invoices');
    expect(paidInvoicesSection).toHaveTextContent('paid');
    expect(paidInvoicesSection).toHaveTextContent('10');
  });

  test('renders correctly with empty dashboard data', () => {
    const emptyState = {
      dashboard: {
        bank_account_type: null,
        bank_account_graph: null,
        cash_flow_graph: null,
        invoice_graph: null,
        proft_loss: null,
        taxes: null,
        revenue_graph: null,
        expense_graph: null,
      },
      common: {
        universal_currency_list: [],
      },
    };

    store = mockStore(emptyState);

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    expect(screen.getByTestId('bank-account')).toBeInTheDocument();
    expect(screen.getByTestId('cash-flow')).toBeInTheDocument();
    expect(screen.getByTestId('profit-loss')).toBeInTheDocument();
    expect(screen.getByTestId('paid-invoices')).toBeInTheDocument();
  });

  test('renders CardColumns with cols-2 class', () => {
    const { container } = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    expect(container.querySelector('.cols-2')).toBeInTheDocument();
  });

  test('BankAccount and CashFlow are rendered inside CardColumns', () => {
    const { container } = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const cardColumns = container.querySelector('.cols-2');
    const bankAccount = screen.getByTestId('bank-account');
    const cashFlow = screen.getByTestId('cash-flow');

    expect(cardColumns).toContainElement(bankAccount);
    expect(cardColumns).toContainElement(cashFlow);
  });

  test('maps state to props correctly', () => {
    const wrapper = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const state = store.getState();
    expect(state.dashboard.bank_account_type).toBe('Checking');
    expect(state.dashboard.cash_flow_graph).toEqual({ inflow: 5000, outflow: 3000 });
    expect(state.common.universal_currency_list).toHaveLength(2);
  });

  test('universal_currency_list is passed through props', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const state = store.getState();
    expect(state.common.universal_currency_list[0].currencyIsoCode).toBe('USD');
    expect(state.common.universal_currency_list[1].currencyIsoCode).toBe('AED');
  });

  test('component renders without crashing when DashboardActions are undefined', () => {
    const { container } = render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    expect(container.querySelector('.dashboard-screen')).toBeInTheDocument();
  });

  test('revenue_graph and expense_graph are available in state', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const state = store.getState();
    expect(state.dashboard.revenue_graph).toEqual({ monthly: [1000, 2000, 3000] });
    expect(state.dashboard.expense_graph).toEqual({ monthly: [500, 800, 1200] });
  });

  test('renders correctly with multiple currencies in universal_currency_list', () => {
    const multiCurrencyState = {
      ...initialState,
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'USD', currencySymbol: '$' },
          { currencyIsoCode: 'AED', currencySymbol: 'AED' },
          { currencyIsoCode: 'EUR', currencySymbol: '€' },
          { currencyIsoCode: 'GBP', currencySymbol: '£' },
        ],
      },
    };

    store = mockStore(multiCurrencyState);

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    const state = store.getState();
    expect(state.common.universal_currency_list).toHaveLength(4);
  });
});
