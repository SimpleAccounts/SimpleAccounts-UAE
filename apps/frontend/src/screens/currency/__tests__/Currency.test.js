import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Currency from '../screen';
import * as currenciesActions from '../actions';

// Mock actions
jest.mock('../actions', () => ({
  getCurrencyList: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: [
      { id: 1, currencyName: 'AED- UAE Dirham', currencySymbol: 'AED' },
      { id: 2, currencyName: 'USD- US Dollar', currencySymbol: '$' },
      { id: 3, currencyName: 'EUR- Euro', currencySymbol: '€' },
    ]
  })),
}));

// Mock components
jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data, options, selectRow }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr
              key={index}
              data-testid={`currency-row-${index}`}
              onClick={() => options.onRowClick && options.onRowClick(item)}
            >
              <td>{item.name}</td>
              <td>{item.symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children, isKey }) => <th data-key={isKey}>{children}</th>,
}));

jest.mock('react-select', () => {
  return jest.fn(({ placeholder, options, className }) => (
    <div data-testid="react-select" className={className}>
      <input placeholder={placeholder} />
    </div>
  ));
});

const mockStore = configureStore([]);

describe('Currency Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      currency: {
        currency_list: [
          { id: 1, currencyName: 'AED- UAE Dirham', currencySymbol: 'AED' },
          { id: 2, currencyName: 'USD- US Dollar', currencySymbol: '$' },
          { id: 3, currencyName: 'EUR- Euro', currencySymbol: '€' },
        ],
      },
    };

    store = mockStore(initialState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    mockHistory = {
      push: jest.fn(),
      location: { pathname: '/admin/settings/currency' },
    };

    // Reset mocks
    currenciesActions.getCurrencyList.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders currency screen with table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
  });

  test('displays loader initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('calls getCurrencyList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(currenciesActions.getCurrencyList).toHaveBeenCalled();
    });
  });

  test('renders currency list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('currency-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('currency-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('currency-row-2')).toBeInTheDocument();
  });

  test('renders New Currency button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /new.*currency/i });
    expect(addButton).toBeInTheDocument();
  });

  test('renders Export to CSV button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export.*csv/i });
    expect(exportButton).toBeInTheDocument();
  });

  test('renders Bulk Delete button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /bulk.*delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  test('opens currency modal when New Currency button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /new.*currency/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/create.*update.*currency/i)).toBeInTheDocument();
    });
  });

  test('displays currency names correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('AED- UAE Dirham')).toBeInTheDocument();
    expect(screen.getByText('USD- US Dollar')).toBeInTheDocument();
    expect(screen.getByText('EUR- Euro')).toBeInTheDocument();
  });

  test('displays currency symbols correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('AED')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  test('handles empty currency list', async () => {
    const emptyState = {
      currency: {
        currency_list: [],
      },
    };

    store = mockStore(emptyState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('currency-row-0')).not.toBeInTheDocument();
  });

  test('closes currency modal when Cancel is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /new.*currency/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/create.*update.*currency/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/create.*update.*currency/i)).not.toBeInTheDocument();
    });
  });

  test('renders modal with form fields when opened', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /new.*currency/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/currency.*name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    });
  });

  test('renders card header with correct title', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Currencies')).toBeInTheDocument();
  });

  test('renders table with correct number of rows', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Currency history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const rows = screen.getAllByTestId(/currency-row-/);
    expect(rows).toHaveLength(3);
  });
});
