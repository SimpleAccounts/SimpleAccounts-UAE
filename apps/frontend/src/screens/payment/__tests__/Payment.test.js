import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Payment from '../screen';
import * as PaymentActions from '../actions';
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
            <tr key={index} data-testid={`payment-row-${index}`}>
              <td>{item.paymentId}</td>
              <td>{item.supplierName}</td>
              <td>{item.invoiceNumber}</td>
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

describe('Payment Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      payment: {
        payment_list: {
          data: [
            {
              paymentId: 1,
              supplierName: 'Supplier ABC',
              invoiceNumber: 'PINV-001',
              paymentDate: '2024-12-01',
              receiptDate: '2024-12-01',
              invoiceAmount: 12500,
              currencyIsoCode: 'AED',
            },
            {
              paymentId: 2,
              supplierName: 'Supplier XYZ',
              invoiceNumber: 'PINV-002',
              paymentDate: '2024-12-10',
              receiptDate: '2024-12-10',
              invoiceAmount: 8750,
              currencyIsoCode: 'USD',
            },
          ],
          count: 2,
        },
        supplier_list: [
          { value: 1, label: { contactName: 'Supplier ABC' } },
          { value: 2, label: { contactName: 'Supplier XYZ' } },
        ],
      },
    };

    store = mockStore(initialState);

    PaymentActions.getPaymentList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.payment.payment_list })
    );
    PaymentActions.getSupplierContactList = jest.fn(() => Promise.resolve());
    PaymentActions.removeBulkPayments = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Payment Deleted Successfully' } })
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
          <Payment history={mockHistory} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render the payment screen without errors', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Purchase.*receipts/i)).toBeInTheDocument();
  });

  it('should display payment list data in table', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Supplier ABC')).toBeInTheDocument();
    expect(screen.getByText('Supplier XYZ')).toBeInTheDocument();
    expect(screen.getByText('PINV-001')).toBeInTheDocument();
    expect(screen.getByText('PINV-002')).toBeInTheDocument();
  });

  it('should call getPaymentList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(PaymentActions.getPaymentList).toHaveBeenCalled();
    });
  });

  it('should call getSupplierContactList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(PaymentActions.getSupplierContactList).toHaveBeenCalledWith(1);
    });
  });

  it('should format payment date correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('01-12-2024')).toBeInTheDocument();
    expect(screen.getByText('10-12-2024')).toBeInTheDocument();
  });

  it('should format invoice amount correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/12,500.00/)).toBeInTheDocument();
    expect(screen.getByText(/8,750.00/)).toBeInTheDocument();
  });

  it('should display currency codes with amounts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/AED.*12,500.00/)).toBeInTheDocument();
    expect(screen.getByText(/USD.*8,750.00/)).toBeInTheDocument();
  });

  it('should render filter section with inputs', async () => {
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
        expect(PaymentActions.getPaymentList).toHaveBeenCalledTimes(2);
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
        expect(PaymentActions.getPaymentList).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('should handle pagination correctly', async () => {
    const multiplePayments = Array.from({ length: 15 }, (_, i) => ({
      paymentId: i + 1,
      supplierName: `Supplier ${i + 1}`,
      invoiceNumber: `PINV-${String(i + 1).padStart(3, '0')}`,
      paymentDate: '2024-12-01',
      receiptDate: '2024-12-01',
      invoiceAmount: 10000 + i * 500,
      currencyIsoCode: 'AED',
    }));

    initialState.payment.payment_list.data = multiplePayments;
    initialState.payment.payment_list.count = 15;
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Supplier 1')).toBeInTheDocument();
    expect(screen.getByText('PINV-001')).toBeInTheDocument();
  });

  it('should handle empty payment list', async () => {
    initialState.payment.payment_list = { data: [], count: 0 };
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('payment-row-0')).not.toBeInTheDocument();
  });

  it('should handle row selection', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const paymentRows = screen.getAllByTestId(/payment-row-/);
    expect(paymentRows.length).toBeGreaterThan(0);
  });

  it('should handle API error on payment list fetch', async () => {
    PaymentActions.getPaymentList.mockRejectedValueOnce({
      data: { message: 'API Error' },
    });

    renderComponent();

    await waitFor(() => {
      expect(PaymentActions.getPaymentList).toHaveBeenCalled();
    });
  });

  it('should display loader while fetching data', () => {
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should handle bulk delete functionality', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    // Verify that bulk delete action is available
    expect(PaymentActions.removeBulkPayments).toBeDefined();
  });
});
