import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import CustomerInvoice from '../screen.jsx';
import customerInvoiceReducer from '../customerInvoiceSlice';
import commonReducer from '../../../services/global/common/commonSlice';

// Mock the components that are used
jest.mock('../../sections', () => ({
  CreateCreditNoteModal: () => (
    <div data-testid="create-credit-note-modal">Create Credit Note Modal</div>
  ),
}));

// Mock createCN component to avoid Redux state dependencies
jest.mock('../../sections/createCN', () => ({
  __esModule: true,
  default: () => <div data-testid="create-credit-note">Create Credit Note</div>,
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete-modal">Confirm Delete Modal</div>,
  SentInvoice: () => <div data-testid="sent-invoice">Sent Invoice</div>,
}));

jest.mock('../sections/email_template', () => ({
  __esModule: true,
  default: () => <div data-testid="email-modal">Email Modal</div>,
}));

// Mock ServerDataTable
jest.mock('@/components/ui/server-data-table', () => ({
  ServerDataTable: ({ data, columns }) => (
    <div data-testid="server-data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>{row[col.accessorKey] || ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      customer_invoice: customerInvoiceReducer,
      common: commonReducer,
      // Add request_for_quotation reducer to prevent errors in createCN component
      request_for_quotation: (state = { project_list: [], contact_list: [], currency_list: [] }) =>
        state,
    },
    preloadedState: {
      customer_invoice: {
        customer_invoice_list: { data: [], count: 0 },
        customer_list: [],
        status_list: [],
        ...initialState.customer_invoice,
      },
      common: {
        universal_currency_list: [],
        ...initialState.common,
      },
      request_for_quotation: {
        project_list: [],
        contact_list: [],
        currency_list: [],
        ...initialState.request_for_quotation,
      },
    },
  });
};

const renderWithProviders = (component, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('CustomerInvoice Component', () => {
  const mockHistory = {
    push: jest.fn(),
    location: { state: null },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'en'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders without crashing', () => {
    const store = createMockStore();
    renderWithProviders(<CustomerInvoice history={mockHistory} />, store);

    // Wait for initial render
    waitFor(() => {
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  test('displays invoice list when data is available', async () => {
    const store = createMockStore({
      customer_invoice: {
        customer_invoice_list: {
          data: [
            {
              id: 1,
              invoiceNumber: 'INV-001',
              customerName: 'Test Customer',
              invoiceAmount: 1000,
              status: 'Draft',
            },
          ],
          count: 1,
        },
        customer_list: [],
        status_list: [],
      },
    });

    renderWithProviders(<CustomerInvoice history={mockHistory} />, store);

    await waitFor(() => {
      const dataTable = screen.queryByTestId('server-data-table');
      expect(dataTable).toBeInTheDocument();
    });
  });

  test('renders create invoice button', async () => {
    const store = createMockStore({
      customer_invoice: {
        customer_invoice_list: { data: [], count: 0 },
        customer_list: [],
        status_list: [],
      },
    });

    renderWithProviders(<CustomerInvoice history={mockHistory} />, store);

    await waitFor(() => {
      const createButton = screen.getByText(/Add.*Invoice/i);
      expect(createButton).toBeInTheDocument();
    });
  });
});
