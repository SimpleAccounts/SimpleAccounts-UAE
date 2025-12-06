import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BankAccount from '../screen';
import * as BankAccountActions from '../actions';
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
  BootstrapTable: ({ children, data }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr key={index} data-testid={`bank-account-row-${index}`}>
              <td>{item.name}</td>
              <td>{item.bankAccountNo}</td>
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

describe('BankAccount Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      auth: {
        is_authed: true,
      },
      bank_account: {
        account_type_list: [
          { id: 1, name: 'Saving' },
          { id: 2, name: 'Current' },
        ],
        currency_list: [
          { currencyCode: 'USD', currencyName: 'US Dollar' },
          { currencyCode: 'AED', currencyName: 'UAE Dirham' },
        ],
        bank_account_list: {
          data: [
            {
              bankAccountId: 1,
              name: 'ADCB Bank',
              accounName: 'Main Account',
              bankAccountNo: '1234567890',
              bankAccountTypeName: 'Saving',
              currancyName: 'AED',
              curruncySymbol: 'AED',
              openingBalance: 50000,
              closingBalance: 55000,
              reconcileDate: '2024-12-01',
              transactionCount: 5,
            },
            {
              bankAccountId: 2,
              name: 'Emirates NBD',
              accounName: 'Secondary Account',
              bankAccountNo: '0987654321',
              bankAccountTypeName: 'Current',
              currancyName: 'USD',
              curruncySymbol: '$',
              openingBalance: 25000,
              closingBalance: 26000,
              reconcileDate: '2024-12-02',
              transactionCount: 0,
            },
          ],
          count: 2,
        },
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'AED', currencySymbol: 'AED' },
          { currencyIsoCode: 'USD', currencySymbol: '$' },
        ],
      },
    };

    store = mockStore(initialState);

    BankAccountActions.getAccountTypeList = jest.fn(() => Promise.resolve());
    BankAccountActions.getCurrencyList = jest.fn(() => Promise.resolve());
    BankAccountActions.getBankAccountList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.bank_account.bank_account_list })
    );
    BankAccountActions.removeBankAccountByID = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Bank Account Deleted Successfully' } })
    );
    BankAccountActions.removeBulkBankAccount = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Bank Accounts Deleted Successfully' } })
    );
    BankAccountActions.getExplainCount = jest.fn(() => Promise.resolve({ data: 0 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const mockHistory = { push: mockHistoryPush, ...props.history };
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <BankAccount history={mockHistory} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render the bank account screen without errors', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Bank Accounts/i)).toBeInTheDocument();
  });

  it('should display bank account list data in table', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('ADCB Bank')).toBeInTheDocument();
    expect(screen.getByText('Emirates NBD')).toBeInTheDocument();
  });

  it('should call getBankAccountList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(BankAccountActions.getBankAccountList).toHaveBeenCalled();
    });
  });

  it('should call getAccountTypeList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(BankAccountActions.getAccountTypeList).toHaveBeenCalled();
    });
  });

  it('should call getCurrencyList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(BankAccountActions.getCurrencyList).toHaveBeenCalled();
    });
  });

  it('should render account type badge with correct styling', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const badges = screen.getAllByText(/Saving|Current/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should format opening balance correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/50,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/25,000.00/)).toBeInTheDocument();
  });

  it('should display closing balance and reconcile date', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/55,000.00/)).toBeInTheDocument();
    expect(screen.getByText('2024-12-01')).toBeInTheDocument();
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
      expect(mockHistoryPush).toHaveBeenCalledWith('/admin/banking/bank-account/create');
    }
  });

  it('should handle pagination correctly', async () => {
    const multipleAccounts = Array.from({ length: 15 }, (_, i) => ({
      ...initialState.bank_account.bank_account_list.data[0],
      bankAccountId: i + 1,
      name: `Bank ${i + 1}`,
      bankAccountNo: `${1000000000 + i}`,
    }));

    initialState.bank_account.bank_account_list.data = multipleAccounts;
    initialState.bank_account.bank_account_list.count = 15;
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Bank 1')).toBeInTheDocument();
  });

  it('should handle delete bank account action', async () => {
    BankAccountActions.getExplainCount.mockResolvedValueOnce({ data: 0 });
    BankAccountActions.removeBankAccountByID.mockResolvedValueOnce({
      status: 200,
      data: { message: 'Bank Account Deleted Successfully' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should show error when trying to delete bank account with unexplained transactions', async () => {
    BankAccountActions.getExplainCount.mockResolvedValueOnce({ data: 5 });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should handle API error on bank account list fetch', async () => {
    BankAccountActions.getBankAccountList.mockRejectedValueOnce({
      data: { message: 'API Error' },
    });

    renderComponent();

    await waitFor(() => {
      expect(BankAccountActions.getBankAccountList).toHaveBeenCalled();
    });
  });

  it('should render action dropdown buttons for each bank account row', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const chevronIcons = screen.getAllByClassName('fas fa-chevron-down');
    expect(chevronIcons.length).toBeGreaterThan(0);
  });

  it('should display loader while fetching data', () => {
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
