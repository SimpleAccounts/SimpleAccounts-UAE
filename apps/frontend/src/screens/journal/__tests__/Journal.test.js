import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Journal from '../screen';
import * as JournalActions from '../actions';
import { CommonActions } from 'services/global';
import moment from 'moment';

// Mock actions
jest.mock('../actions', () => ({
  getJournalList: jest.fn(() => () => Promise.resolve({ status: 200, data: { data: { data: [], count: 0 } } })),
  removeBulkJournal: jest.fn(() => () => Promise.resolve({ status: 200, data: { message: 'Success' } })),
  getSavedPageNum: jest.fn(() => () => {}),
  setCancelFlag: jest.fn(() => () => {}),
}));

jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(() => () => {}),
  },
}));

// Mock components
jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler, message }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{message}</p>
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
  Currency: ({ value, currencySymbol }) => <span>{currencySymbol} {value}</span>,
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr key={index} data-testid={`journal-row-${index}`} onClick={() => {}}>
              <td>{item.journalReferenceNo}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children }) => <th>{children}</th>,
}));

jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: ({ selected, onChange, placeholderText }) => (
    <input
      type="text"
      data-testid="date-picker"
      placeholder={placeholderText}
      value={selected ? selected.toISOString() : ''}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

jest.mock('react-csv', () => ({
  CSVLink: ({ data, children }) => <a data-testid="csv-link">{children}</a>,
}));

const mockStore = configureStore([]);

describe('Journal Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      journal: {
        journal_list: {
          data: {
            data: [
              {
                journalId: 1,
                journalReferenceNo: 'JV-001',
                journalDate: '2024-01-15',
                description: 'Opening Balance',
                postingReferenceType: 'MANUAL',
                postingReferenceTypeDisplayName: 'Manual Entry',
                createdByName: 'Admin',
                journalLineItems: [
                  {
                    transactionCategoryName: 'Cash',
                    debitAmount: 1000,
                    creditAmount: 0,
                  },
                  {
                    transactionCategoryName: 'Capital',
                    debitAmount: 0,
                    creditAmount: 1000,
                  },
                ],
                subTotalDebitAmount: 1000,
                subTotalCreditAmount: 1000,
                totalDebitAmount: 1000,
                totalCreditAmount: 1000,
              },
              {
                journalId: 2,
                journalReferenceNo: 'JV-002',
                journalDate: '2024-01-20',
                description: 'Adjustment Entry',
                postingReferenceType: 'SYSTEM',
                postingReferenceTypeDisplayName: 'System Generated',
                createdByName: 'System',
                journalLineItems: [
                  {
                    transactionCategoryName: 'Bank',
                    debitAmount: 500,
                    creditAmount: 0,
                  },
                  {
                    transactionCategoryName: 'Sales',
                    debitAmount: 0,
                    creditAmount: 500,
                  },
                ],
                subTotalDebitAmount: 500,
                subTotalCreditAmount: 500,
                totalDebitAmount: 500,
                totalCreditAmount: 500,
              },
            ],
            count: 2,
          },
        },
        page_num: 1,
        cancel_flag: false,
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'AED', currencySymbol: 'AED' },
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
      location: { pathname: '/admin/accountant/journal' },
    };

    JournalActions.getJournalList.mockClear();
    JournalActions.removeBulkJournal.mockClear();
    JournalActions.getSavedPageNum.mockClear();
    JournalActions.setCancelFlag.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders journal screen with loader initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('calls getJournalList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(JournalActions.getJournalList).toHaveBeenCalled();
    });
  });

  test('calls setCancelFlag after fetching journal list', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(JournalActions.setCancelFlag).toHaveBeenCalledWith(false);
    });
  });

  test('renders journal table after loading', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
  });

  test('renders Add New Journal button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*journal/i });
    expect(addButton).toBeInTheDocument();
  });

  test('navigates to create journal page when Add New Journal clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*journal/i });
    fireEvent.click(addButton);

    expect(JournalActions.getSavedPageNum).toHaveBeenCalledWith(1);
    expect(mockHistory.push).toHaveBeenCalledWith('/admin/accountant/journal/create');
  });

  test('renders filter section with date picker', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const datePicker = screen.getByTestId('date-picker');
    expect(datePicker).toBeInTheDocument();
  });

  test('renders filter section with reference number input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const refInput = screen.getByPlaceholderText(/reference.*number/i);
    expect(refInput).toBeInTheDocument();
  });

  test('renders filter section with notes input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const notesInput = screen.getByPlaceholderText(/notes/i);
    expect(notesInput).toBeInTheDocument();
  });

  test('renders search button in filter section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const searchButton = buttons.find(btn => btn.querySelector('.fa-search'));
    expect(searchButton).toBeInTheDocument();
  });

  test('renders refresh button in filter section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons.find(btn => btn.querySelector('.fa-refresh'));
    expect(refreshButton).toBeInTheDocument();
  });

  test('renders journal data in table rows', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('journal-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('journal-row-1')).toBeInTheDocument();
  });

  test('handles empty journal list', async () => {
    const emptyState = {
      ...initialState,
      journal: {
        journal_list: {
          data: {
            data: [],
            count: 0,
          },
        },
        page_num: 1,
        cancel_flag: false,
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
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('journal-row-0')).not.toBeInTheDocument();
  });

  test('handles API error on journal list fetch', async () => {
    JournalActions.getJournalList.mockImplementationOnce(() => () =>
      Promise.reject({ data: { message: 'API Error' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(JournalActions.getJournalList).toHaveBeenCalled();
    });
  });

  test('renders journal screen with correct class', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(container.querySelector('.journal-screen')).toBeInTheDocument();
  });

  test('handles cancel_flag from state', async () => {
    const cancelFlagState = {
      ...initialState,
      journal: {
        ...initialState.journal,
        cancel_flag: true,
        page_num: 2,
      },
    };

    store = mockStore(cancelFlagState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Journal history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(JournalActions.getJournalList).toHaveBeenCalled();
    });

    const state = store.getState();
    expect(state.journal.cancel_flag).toBe(true);
    expect(state.journal.page_num).toBe(2);
  });
});
