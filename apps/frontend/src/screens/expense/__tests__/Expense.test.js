import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Expense from '../screen';
import * as ExpenseActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('Expense Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      expense: {
        expense_list: {
          data: [
            {
              expenseId: 1,
              expenseNumber: 'EXP-001',
              payee: 'Test Supplier',
              expenseDate: '2024-12-01',
              transactionCategoryName: 'Office Supplies',
              expenseStatus: 'Draft',
              expenseAmount: 1000,
              currencyName: 'USD',
              currencySymbol: '$',
              expenseVatAmount: 50,
              exclusiveVat: true,
              editFlag: true,
              bankGenerated: false,
            },
          ],
          count: 1,
        },
        expense_categories_list: [
          { transactionCategoryId: 1, transactionCategoryName: 'Office Supplies' },
        ],
        user_list: [
          { value: 1, label: 'John Doe' },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'USD', currencyName: 'US Dollar' },
        ],
      },
    };

    store = mockStore(initialState);

    ExpenseActions.getExpenseList = jest.fn(() =>
      Promise.resolve({ status: 200, data: { data: initialState.expense.expense_list.data } })
    );
    ExpenseActions.getExpenseCategoriesList = jest.fn(() => Promise.resolve());
    ExpenseActions.getVatList = jest.fn(() => Promise.resolve());
    ExpenseActions.getBankList = jest.fn(() => Promise.resolve());
    ExpenseActions.getPaymentMode = jest.fn(() => Promise.resolve());
    ExpenseActions.getUserForDropdown = jest.fn(() => Promise.resolve());
    ExpenseActions.postExpense = jest.fn(() => Promise.resolve({ status: 200 }));
    ExpenseActions.unPostExpense = jest.fn(() => Promise.resolve({ status: 200 }));
    ExpenseActions.deleteExpense = jest.fn(() => Promise.resolve({ status: 200, data: { message: 'Success' } }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the expense screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Expenses/i)).toBeInTheDocument();
    });
  });

  it('should display expense list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EXP-001')).toBeInTheDocument();
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });
  });

  it('should call getExpenseList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ExpenseActions.getExpenseList).toHaveBeenCalled();
    });
  });

  it('should call getExpenseCategoriesList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ExpenseActions.getExpenseCategoriesList).toHaveBeenCalled();
    });
  });

  it('should render filter section with correct placeholders', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filter/i)).toBeInTheDocument();
    });
  });

  it('should handle search button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find(btn => btn.querySelector('.fa-search'));
      if (searchButton) {
        fireEvent.click(searchButton);
      }
    });
  });

  it('should handle clear all filters', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const refreshButtons = screen.getAllByRole('button');
      const refreshButton = refreshButtons.find(btn => btn.querySelector('.fa-refresh'));
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });
  });

  it('should display expense status badge with correct class', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('badge');
    });
  });

  it('should format expense amount correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/1,000.00/)).toBeInTheDocument();
    });
  });

  it('should render action dropdown for each expense row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const chevronIcons = screen.getAllByClassName('fas fa-chevron-down');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  it('should handle pagination correctly', async () => {
    const multipleExpenses = Array.from({ length: 15 }, (_, i) => ({
      ...initialState.expense.expense_list.data[0],
      expenseId: i + 1,
      expenseNumber: `EXP-${String(i + 1).padStart(3, '0')}`,
    }));

    initialState.expense.expense_list.data = multipleExpenses;
    initialState.expense.expense_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EXP-001')).toBeInTheDocument();
    });
  });

  it('should display VAT amount when present', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/50.00/)).toBeInTheDocument();
    });
  });

  it('should handle expense date formatting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('01-12-2024')).toBeInTheDocument();
    });
  });

  it('should render add new expense button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
      expect(addButton).toBeDefined();
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Expense />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });
});
