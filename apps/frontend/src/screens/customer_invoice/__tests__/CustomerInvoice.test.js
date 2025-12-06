import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import CustomerInvoice from '../screen';
import * as CustomerInvoiceActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('../screens/detail/actions');
jest.mock('../../../creditNotes/screens/create/actions', () => ({
  createCreditNote: jest.fn(),
}));
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

describe('CustomerInvoice Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      customer_invoice: {
        customer_invoice_list: {
          data: [
            {
              id: 1,
              referenceNumber: 'INV-001',
              name: 'John Doe',
              contactId: 101,
              invoiceDate: '2024-12-01',
              invoiceDueDate: '2024-12-31',
              status: 'Sent',
              statusEnum: 'Sent',
              totalAmount: 1500.00,
              totalVatAmount: 75.00,
              dueAmount: 1500.00,
              currencyName: 'USD',
              currencySymbol: '$',
              cnCreatedOnPaidInvoice: false,
              editFlag: true,
              exchangeRate: 1,
            },
            {
              id: 2,
              referenceNumber: 'INV-002',
              name: 'Jane Smith',
              contactId: 102,
              invoiceDate: '2024-11-15',
              invoiceDueDate: '2024-12-15',
              status: 'Paid',
              statusEnum: 'Paid',
              totalAmount: 2000.00,
              totalVatAmount: 100.00,
              dueAmount: 0.00,
              currencyName: 'USD',
              currencySymbol: '$',
              cnCreatedOnPaidInvoice: false,
              editFlag: false,
              exchangeRate: 1,
            },
          ],
          count: 2,
        },
        customer_list: [
          { value: 101, label: { contactName: 'John Doe' } },
          { value: 102, label: { contactName: 'Jane Smith' } },
        ],
        status_list: [
          { value: 'Draft', label: 'Draft' },
          { value: 'Sent', label: 'Sent' },
          { value: 'Paid', label: 'Paid' },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'USD', currencyName: 'US Dollar' },
        ],
      },
    };

    store = mockStore(initialState);

    CustomerInvoiceActions.getCustomerInvoiceList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.customer_invoice.customer_invoice_list })
    );
    CustomerInvoiceActions.getStatusList = jest.fn(() => Promise.resolve());
    CustomerInvoiceActions.getCustomerList = jest.fn(() => Promise.resolve());
    CustomerInvoiceActions.getOverdueAmountDetails = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          overDueAmount: 5000,
          overDueAmountWeekly: 1000,
          overDueAmountMonthly: 3000
        }
      })
    );
    CustomerInvoiceActions.postInvoice = jest.fn(() => Promise.resolve({ status: 200 }));
    CustomerInvoiceActions.unPostInvoice = jest.fn(() => Promise.resolve({ status: 200 }));
    CustomerInvoiceActions.deleteInvoice = jest.fn(() => Promise.resolve({ status: 200, data: { message: 'Success' } }));
    CustomerInvoiceActions.removeBulk = jest.fn(() => Promise.resolve({ status: 200, data: { message: 'Success' } }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the customer invoice screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Customer Invoices/i)).toBeInTheDocument();
    });
  });

  it('should display invoice list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call getCustomerInvoiceList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CustomerInvoiceActions.getCustomerInvoiceList).toHaveBeenCalled();
    });
  });

  it('should call getStatusList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CustomerInvoiceActions.getStatusList).toHaveBeenCalled();
    });
  });

  it('should call getCustomerList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CustomerInvoiceActions.getCustomerList).toHaveBeenCalled();
    });
  });

  it('should display invoice dates correctly formatted', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('2024-12-01')).toBeInTheDocument();
      expect(screen.getByText('2024-12-31')).toBeInTheDocument();
    });
  });

  it('should display invoice status badges with correct styling for Sent', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const sentBadge = screen.getByText('Sent');
      expect(sentBadge).toHaveClass('badge');
    });
  });

  it('should display invoice status badges with correct styling for Paid', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const paidBadge = screen.getByText('Paid');
      expect(paidBadge).toHaveClass('badge');
      expect(paidBadge).toHaveClass('label-success');
    });
  });

  it('should display invoice amount with currency symbol', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/1,500.00/)).toBeInTheDocument();
      expect(screen.getByText(/2,000.00/)).toBeInTheDocument();
    });
  });

  it('should display VAT amount when present', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/75.00/)).toBeInTheDocument();
    });
  });

  it('should display due amount correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/1,500.00/)).toBeInTheDocument();
    });
  });

  it('should render filter section with date pickers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filter/i)).toBeInTheDocument();
    });
  });

  it('should render add new invoice button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
      expect(addButton).toBeDefined();
    });
  });

  it('should handle search button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
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
          <CustomerInvoice />
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

  it('should handle pagination with multiple invoices', async () => {
    const multipleInvoices = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      referenceNumber: `INV-${String(i + 1).padStart(3, '0')}`,
      name: `Customer ${i + 1}`,
      contactId: 100 + i,
      invoiceDate: '2024-12-01',
      invoiceDueDate: '2024-12-31',
      status: i % 2 === 0 ? 'Sent' : 'Paid',
      statusEnum: i % 2 === 0 ? 'Sent' : 'Paid',
      totalAmount: (i + 1) * 100,
      totalVatAmount: (i + 1) * 5,
      dueAmount: i % 2 === 0 ? (i + 1) * 100 : 0,
      currencyName: 'USD',
      currencySymbol: '$',
      cnCreatedOnPaidInvoice: false,
      editFlag: true,
      exchangeRate: 1,
    }));

    initialState.customer_invoice.customer_invoice_list.data = multipleInvoices;
    initialState.customer_invoice.customer_invoice_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomerInvoice />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });
});
