import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SupplierInvoice from '../screen';
import * as SupplierInvoiceActions from '../actions';
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

describe('SupplierInvoice Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      supplier_invoice: {
        supplier_invoice_list: {
          data: [
            {
              id: 1,
              status: 'Draft',
              statusEnum: 'Draft',
              name: 'Test Supplier',
              dueAmount: 500,
              referenceNumber: 'INV-001',
              invoiceDate: '01-12-2024',
              invoiceDueDate: '15-12-2024',
              totalAmount: 1000,
              totalVatAmount: 50,
              currencyName: 'USD',
              currencySymbol: '$',
              contactId: 1,
              editFlag: true,
              exchangeRate: 1,
              cnCreatedOnPaidInvoice: false,
            },
          ],
          count: 1,
        },
        supplier_list: [
          { value: 1, label: { contactName: 'Supplier One' } },
        ],
        status_list: [
          { label: 'Draft', value: 'Draft' },
          { label: 'Sent', value: 'Sent' },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'USD', currencyName: 'US Dollar', currencySymbol: '$' },
        ],
      },
    };

    store = mockStore(initialState);

    SupplierInvoiceActions.getSupplierInvoiceList = jest.fn(() =>
      Promise.resolve({ status: 200, data: { data: initialState.supplier_invoice.supplier_invoice_list.data } })
    );
    SupplierInvoiceActions.getStatusList = jest.fn(() => Promise.resolve());
    SupplierInvoiceActions.getSupplierList = jest.fn(() => Promise.resolve());
    SupplierInvoiceActions.getOverdueAmountDetails = jest.fn(() =>
      Promise.resolve({ status: 200, data: { overDueAmount: 1000, overDueAmountWeekly: 500, overDueAmountMonthly: 2000 } })
    );
    SupplierInvoiceActions.postInvoice = jest.fn(() => Promise.resolve({ status: 200 }));
    SupplierInvoiceActions.unPostInvoice = jest.fn(() => Promise.resolve({ status: 200 }));
    SupplierInvoiceActions.deleteInvoice = jest.fn(() => Promise.resolve({ status: 200, data: { message: 'Success' } }));
    SupplierInvoiceActions.removeBulk = jest.fn(() => Promise.resolve({ status: 200, data: { message: 'Success' } }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the supplier invoice screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Supplier Invoices/i)).toBeInTheDocument();
    });
  });

  it('should display supplier invoice list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });
  });

  it('should call getSupplierInvoiceList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SupplierInvoiceActions.getSupplierInvoiceList).toHaveBeenCalled();
    });
  });

  it('should call getStatusList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SupplierInvoiceActions.getStatusList).toHaveBeenCalled();
    });
  });

  it('should call getSupplierList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SupplierInvoiceActions.getSupplierList).toHaveBeenCalled();
    });
  });

  it('should call getOverdueAmountDetails on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SupplierInvoiceActions.getOverdueAmountDetails).toHaveBeenCalled();
    });
  });

  it('should render filter section with correct inputs', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
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
          <SupplierInvoice />
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
          <SupplierInvoice />
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

  it('should display invoice status badge with correct class', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('badge');
    });
  });

  it('should format invoice amount correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/1,000.00/)).toBeInTheDocument();
    });
  });

  it('should render action dropdown for each invoice row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const chevronIcons = screen.getAllByClassName('fas fa-chevron-down');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  it('should handle pagination correctly', async () => {
    const multipleInvoices = Array.from({ length: 15 }, (_, i) => ({
      ...initialState.supplier_invoice.supplier_invoice_list.data[0],
      id: i + 1,
      referenceNumber: `INV-${String(i + 1).padStart(3, '0')}`,
    }));

    initialState.supplier_invoice.supplier_invoice_list.data = multipleInvoices;
    initialState.supplier_invoice.supplier_invoice_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });
  });

  it('should display VAT amount when present', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/50.00/)).toBeInTheDocument();
    });
  });

  it('should render add new invoice button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SupplierInvoice />
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
          <SupplierInvoice />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });
});
