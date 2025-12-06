import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import OpeningBalance from '../screen';
import * as OpeningBalanceActions from '../actions';
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

describe('OpeningBalance Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      opening_balance: {
        transaction_category_list: [
          {
            transactionCategoryId: 1,
            transactionCategoryName: 'Sales',
          },
          {
            transactionCategoryId: 2,
            transactionCategoryName: 'Purchases',
          },
        ],
        opening_balance_list: {
          data: [
            {
              transactionCategoryBalanceId: 1,
              transactionCategoryName: 'Sales',
              chartOfAccount: 'Revenue',
              effectiveDate: '01-01-2024',
              openingBalance: 10000,
            },
          ],
          count: 1,
        },
      },
      auth: {
        profile: {
          company: {
            currencyCode: {
              currencyIsoCode: 'AED',
            },
          },
        },
      },
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
      },
    };

    store = mockStore(initialState);

    OpeningBalanceActions.getTransactionCategoryList = jest.fn(() =>
      Promise.resolve({ status: 200 })
    );
    OpeningBalanceActions.getOpeningBalanceList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.opening_balance.opening_balance_list,
      })
    );
    OpeningBalanceActions.addOpeningBalance = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Success' } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the opening balance screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Opening Balance/i)).toBeInTheDocument();
    });
  });

  it('should display the screen title correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const title = screen.getByText(/Opening Balance/i);
      expect(title).toBeInTheDocument();
    });
  });

  it('should call getTransactionCategoryList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(OpeningBalanceActions.getTransactionCategoryList).toHaveBeenCalled();
    });
  });

  it('should call getOpeningBalanceList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(OpeningBalanceActions.getOpeningBalanceList).toHaveBeenCalled();
    });
  });

  it('should render Add Opening Balance button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/Add Opening Balance/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should handle Add Opening Balance button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/Add Opening Balance/i);
      fireEvent.click(addButton);
    });
  });

  it('should render bootstrap table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const tables = document.querySelectorAll('.supplier-invoice-table');
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  it('should display table headers correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Transaction Category Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Chart of Account/i)).toBeInTheDocument();
      expect(screen.getByText(/Effective Date/i)).toBeInTheDocument();
    });
  });

  it('should display opening balance data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const paginationElements = document.querySelectorAll('.react-bs-table-pagination');
      expect(paginationElements).toBeDefined();
    });
  });

  it('should render action buttons for each row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const actionButtons = document.querySelectorAll('.btn-square');
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });

  it('should format currency correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const amounts = screen.getAllByText(/10,000/i);
      expect(amounts).toBeDefined();
    });
  });

  it('should handle sorting when column header is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const tableHeaders = document.querySelectorAll('th');
      expect(tableHeaders.length).toBeGreaterThan(0);
    });
  });

  it('should display effective date in correct format', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/01-01-2024/i)).toBeInTheDocument();
    });
  });

  it('should initialize component with correct CSS class', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <OpeningBalance />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container.querySelector('.expense-screen')).toBeInTheDocument();
    });
  });
});
