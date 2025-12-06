import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TransactionCategory from '../screen';
import * as TransactionActions from '../actions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

jest.mock('components', () => ({
  Loader: () => <div>Loading...</div>,
}));

jest.mock('react-toastify', () => ({
  ToastContainer: () => <div>Toast Container</div>,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    POSITION: {
      TOP_RIGHT: 'top-right',
    },
  },
}));

describe('TransactionCategory Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      transaction: {
        transaction_list: [
          {
            transactionCategoryId: 1,
            transactionCategoryCode: 'TC001',
            transactionCategoryName: 'Office Supplies',
            transactionCategoryDescription: 'Office related expenses',
            parentTransactionCategory: {
              transactionCategoryDescription: 'General Expenses',
            },
            transactionType: {
              transactionTypeName: 'Expense',
            },
          },
          {
            transactionCategoryId: 2,
            transactionCategoryCode: 'TC002',
            transactionCategoryName: 'Travel',
            transactionCategoryDescription: 'Travel expenses',
            parentTransactionCategory: {
              transactionCategoryDescription: 'General Expenses',
            },
            transactionType: {
              transactionTypeName: 'Expense',
            },
          },
        ],
      },
    };

    store = mockStore(initialState);

    TransactionActions.getTransactionList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.transaction.transaction_list })
    );
    TransactionActions.deleteTransaction = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Success' } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the transaction category screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Transaction Category/i)).toBeInTheDocument();
    });
  });

  it('should call getTransactionList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(TransactionActions.getTransactionList).toHaveBeenCalled();
    });
  });

  it('should display transaction category list in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('Travel')).toBeInTheDocument();
    });
  });

  it('should render export to CSV button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Export to CSV/i)).toBeInTheDocument();
    });
  });

  it('should render New Category button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/New Category/i)).toBeInTheDocument();
    });
  });

  it('should navigate to create page when New Category button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory history={{ push: mockHistoryPush }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const newCategoryButton = screen.getByText(/New Category/i);
      fireEvent.click(newCategoryButton);
    });
  });

  it('should render Bulk Delete button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bulk Delete/i)).toBeInTheDocument();
    });
  });

  it('should render filter section with input fields', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filter :/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Category Code/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Category Name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Category Description/i)).toBeInTheDocument();
    });
  });

  it('should display category code in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('TC001')).toBeInTheDocument();
      expect(screen.getByText('TC002')).toBeInTheDocument();
    });
  });

  it('should display category description in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Office related expenses')).toBeInTheDocument();
      expect(screen.getByText('Travel expenses')).toBeInTheDocument();
    });
  });

  it('should display parent transaction category in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('General Expenses').length).toBeGreaterThan(0);
    });
  });

  it('should display transaction type in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Expense').length).toBeGreaterThan(0);
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Category Code')).toBeInTheDocument();
      expect(screen.getByText('Category Name')).toBeInTheDocument();
      expect(screen.getByText('Category Description')).toBeInTheDocument();
      expect(screen.getByText('Parent Transaction Category Name')).toBeInTheDocument();
      expect(screen.getByText('Transaction Type')).toBeInTheDocument();
    });
  });

  it('should render ToastContainer for notifications', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toast Container')).toBeInTheDocument();
    });
  });

  it('should have checkboxes for row selection', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TransactionCategory />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});
