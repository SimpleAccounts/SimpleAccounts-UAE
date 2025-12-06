import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ChartAccount from '../screen';
import * as ChartAccountActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler, message, message1 }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <div>{message1}</div>
        <p>{message}</p>
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data, options, onRowClick }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr
              key={index}
              data-testid={`chart-account-row-${index}`}
              onClick={() => options && options.onRowClick && options.onRowClick(item)}
            >
              <td>{item.transactionCategoryCode}</td>
              <td>{item.transactionCategoryName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children }) => <th>{children}</th>,
}));

const mockHistoryPush = jest.fn();

describe('ChartAccount Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      chart_account: {
        transaction_category_list: {
          data: [
            {
              transactionCategoryId: 1,
              transactionCategoryCode: '1000',
              transactionCategoryName: 'Cash',
              chartOfAccountId: 1,
              transactionTypeName: 'Asset',
              editableFlag: true,
            },
            {
              transactionCategoryId: 2,
              transactionCategoryCode: '2000',
              transactionCategoryName: 'Accounts Receivable',
              chartOfAccountId: 1,
              transactionTypeName: 'Asset',
              editableFlag: true,
            },
            {
              transactionCategoryId: 3,
              transactionCategoryCode: '3000',
              transactionCategoryName: 'Revenue',
              chartOfAccountId: 4,
              transactionTypeName: 'Revenue',
              editableFlag: false,
            },
          ],
          count: 3,
        },
        transaction_type_list: [
          { chartOfAccountId: 1, chartOfAccountName: 'Asset' },
          { chartOfAccountId: 2, chartOfAccountName: 'Liability' },
          { chartOfAccountId: 3, chartOfAccountName: 'Equity' },
          { chartOfAccountId: 4, chartOfAccountName: 'Revenue' },
          { chartOfAccountId: 5, chartOfAccountName: 'Expense' },
        ],
      },
    };

    store = mockStore(initialState);

    ChartAccountActions.getTransactionTypes = jest.fn(() => Promise.resolve());
    ChartAccountActions.getTransactionCategoryList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.chart_account.transaction_category_list })
    );
    ChartAccountActions.getTransactionCategoryExportList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.chart_account.transaction_category_list.data,
      })
    );
    ChartAccountActions.removeBulk = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Chart of Account Deleted Successfully' } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const mockHistory = { push: mockHistoryPush, ...props.history };
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ChartAccount history={mockHistory} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render the chart of accounts screen without errors', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Chart of Accounts/i)).toBeInTheDocument();
  });

  it('should display chart of accounts list data in table', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Accounts Receivable')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should call getTransactionCategoryList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(ChartAccountActions.getTransactionCategoryList).toHaveBeenCalled();
    });
  });

  it('should call getTransactionTypes on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(ChartAccountActions.getTransactionTypes).toHaveBeenCalled();
    });
  });

  it('should display account codes correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('3000')).toBeInTheDocument();
  });

  it('should display account types correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const assetTypes = screen.getAllByText('Asset');
    expect(assetTypes.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should render Add New Account button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
    expect(addButton).toBeDefined();
  });

  it('should navigate to create page when Add New Account button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons.find(btn => btn.textContent.includes('Add'));

    if (addButton) {
      fireEvent.click(addButton);
      expect(mockHistoryPush).toHaveBeenCalledWith('/admin/master/chart-account/create');
    }
  });

  it('should render Export to CSV button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const exportButtons = screen.getAllByRole('button');
    const exportButton = exportButtons.find(btn => btn.textContent.includes('export'));
    expect(exportButton).toBeDefined();
  });

  it('should handle row click navigation for editable accounts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const firstRow = screen.getByTestId('chart-account-row-0');
    fireEvent.click(firstRow);

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/admin/master/chart-account/detail', {
        id: 1,
      });
    });
  });

  it('should not navigate for non-editable accounts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const thirdRow = screen.getByTestId('chart-account-row-2');
    fireEvent.click(thirdRow);

    // Should not navigate since editableFlag is false
    await waitFor(() => {
      const calls = mockHistoryPush.mock.calls.filter(
        call => call[0] === '/admin/master/chart-account/detail'
      );
      expect(calls.length).toBe(0);
    });
  });

  it('should handle pagination correctly', async () => {
    const multipleAccounts = Array.from({ length: 15 }, (_, i) => ({
      transactionCategoryId: i + 1,
      transactionCategoryCode: `${1000 + i}`,
      transactionCategoryName: `Account ${i + 1}`,
      chartOfAccountId: 1,
      transactionTypeName: 'Asset',
      editableFlag: true,
    }));

    initialState.chart_account.transaction_category_list.data = multipleAccounts;
    initialState.chart_account.transaction_category_list.count = 15;
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Account 1')).toBeInTheDocument();
  });

  it('should handle API error on transaction category list fetch', async () => {
    ChartAccountActions.getTransactionCategoryList.mockRejectedValueOnce({
      data: { message: 'API Error' },
    });

    renderComponent();

    await waitFor(() => {
      expect(ChartAccountActions.getTransactionCategoryList).toHaveBeenCalled();
    });
  });

  it('should render print button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const printButtons = screen.getAllByRole('button');
    const printButton = printButtons.find(btn => btn.querySelector('.fa-print'));
    expect(printButton).toBeDefined();
  });

  it('should display loader while fetching data', () => {
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
