import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Receipt from '../screen';
import * as ReceiptActions from '../actions';
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
  Currency: ({ value, currencySymbol }) => <span>{currencySymbol} {value}</span>,
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr key={index} data-testid={`receipt-row-${index}`}>
              <td>{item.invoiceNumber}</td>
              <td>{item.customerName}</td>
              <td>{item.receiptId}</td>
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

describe('Receipt Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      receipt: {
        receipt_list: {
          data: [
            {
              receiptId: 1,
              invoiceNumber: 'INV-001',
              customerName: 'ABC Corporation',
              receiptDate: '2024-12-01',
              amount: 5000,
              currencyIsoCode: 'AED',
              unusedAmount: 0,
            },
            {
              receiptId: 2,
              invoiceNumber: 'INV-002',
              customerName: 'XYZ Company',
              receiptDate: '2024-12-05',
              amount: 8500,
              currencyIsoCode: 'USD',
              unusedAmount: 500,
            },
          ],
          count: 2,
        },
        invoice_list: [
          { value: 1, label: 'INV-001' },
          { value: 2, label: 'INV-002' },
        ],
        contact_list: [
          { value: 1, label: { contactName: 'ABC Corporation' } },
          { value: 2, label: { contactName: 'XYZ Company' } },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'AED', currencySymbol: 'AED' },
          { currencyIsoCode: 'USD', currencySymbol: '$' },
        ],
      },
    };

    store = mockStore(initialState);

    ReceiptActions.getReceiptList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.receipt.receipt_list })
    );
    ReceiptActions.getContactList = jest.fn(() => Promise.resolve());
    ReceiptActions.getInvoiceList = jest.fn(() => Promise.resolve());
    ReceiptActions.removeBulk = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Receipt Deleted Successfully' } })
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
          <Receipt history={mockHistory} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render the receipt screen without errors', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Receipts/i)).toBeInTheDocument();
  });

  it('should display receipt list data in table', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('ABC Corporation')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
    expect(screen.getByText('XYZ Company')).toBeInTheDocument();
  });

  it('should call getReceiptList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(ReceiptActions.getReceiptList).toHaveBeenCalled();
    });
  });

  it('should call getContactList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(ReceiptActions.getContactList).toHaveBeenCalledWith(2);
    });
  });

  it('should call getInvoiceList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(ReceiptActions.getInvoiceList).toHaveBeenCalled();
    });
  });

  it('should format receipt date correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('01-12-2024')).toBeInTheDocument();
    expect(screen.getByText('05-12-2024')).toBeInTheDocument();
  });

  it('should format receipt amount correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/5,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/8,500.00/)).toBeInTheDocument();
  });

  it('should display currency codes correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/AED.*5,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/USD.*8,500.00/)).toBeInTheDocument();
  });

  it('should render filter section with search inputs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Filter/i)).toBeInTheDocument();
  });

  it('should handle search button click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const searchButtons = screen.getAllByRole('button');
    const searchButton = searchButtons.find(btn => btn.querySelector('.fa-search'));

    if (searchButton) {
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(ReceiptActions.getReceiptList).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('should handle clear all filters button click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(btn => btn.querySelector('.fa-refresh'));

    if (refreshButton) {
      fireEvent.click(refreshButton);
      await waitFor(() => {
        expect(ReceiptActions.getReceiptList).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('should handle pagination correctly', async () => {
    const multipleReceipts = Array.from({ length: 15 }, (_, i) => ({
      receiptId: i + 1,
      invoiceNumber: `INV-${String(i + 1).padStart(3, '0')}`,
      customerName: `Customer ${i + 1}`,
      receiptDate: '2024-12-01',
      amount: 5000 + i * 100,
      currencyIsoCode: 'AED',
      unusedAmount: 0,
    }));

    initialState.receipt.receipt_list.data = multipleReceipts;
    initialState.receipt.receipt_list.count = 15;
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Customer 1')).toBeInTheDocument();
  });

  it('should handle empty receipt list', async () => {
    initialState.receipt.receipt_list = { data: [], count: 0 };
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('receipt-row-0')).not.toBeInTheDocument();
  });

  it('should handle API error on receipt list fetch', async () => {
    ReceiptActions.getReceiptList.mockRejectedValueOnce({
      data: { message: 'API Error' },
    });

    renderComponent();

    await waitFor(() => {
      expect(ReceiptActions.getReceiptList).toHaveBeenCalled();
    });
  });

  it('should display loader while fetching data', () => {
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
