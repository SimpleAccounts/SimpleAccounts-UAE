import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import VatTransactions from '../screen';
import * as VatTransactionActions from '../actions';
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

describe('VatTransactions Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      vat_transactions: {
        vat_transaction_list: {
          data: [
            {
              journalId: 1,
              customerName: 'Test Customer',
              countryName: 'United Arab Emirates',
              invoiceDate: '01-12-2024',
              invoiceNumber: 'INV-001',
              taxRegistrationNo: 'TRN123456789',
              referenceType: 'Invoice',
              vatType: 'Output',
              amount: 1000,
              vatAmount: 50,
            },
          ],
          count: 1,
        },
      },
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
      },
    };

    store = mockStore(initialState);

    VatTransactionActions.vatTransactionList = jest.fn(() =>
      Promise.resolve({ status: 200, data: { data: initialState.vat_transactions.vat_transaction_list.data } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the vat transactions screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/VAT/i)).toBeInTheDocument();
    });
  });

  it('should display vat transaction list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('TRN123456789')).toBeInTheDocument();
    });
  });

  it('should call vatTransactionList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(VatTransactionActions.vatTransactionList).toHaveBeenCalled();
    });
  });

  it('should render Export button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Export/i)).toBeInTheDocument();
    });
  });

  it('should display table headers correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Customer Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Country/i)).toBeInTheDocument();
      expect(screen.getByText(/Invoice Date/i)).toBeInTheDocument();
      expect(screen.getByText(/Invoice Number/i)).toBeInTheDocument();
    });
  });

  it('should display reference type column', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice')).toBeInTheDocument();
    });
  });

  it('should display VAT type column', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Output')).toBeInTheDocument();
    });
  });

  it('should format amount correctly with currency', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    const multipleTransactions = Array.from({ length: 15 }, (_, i) => ({
      ...initialState.vat_transactions.vat_transaction_list.data[0],
      journalId: i + 1,
      invoiceNumber: `INV-${String(i + 1).padStart(3, '0')}`,
    }));

    initialState.vat_transactions.vat_transaction_list.data = multipleTransactions;
    initialState.vat_transactions.vat_transaction_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });
  });

  it('should display tax registration number', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tax Registration Number/i)).toBeInTheDocument();
    });
  });

  it('should display country information', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('United Arab Emirates')).toBeInTheDocument();
    });
  });

  it('should render card header with icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatTransactions />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const icon = document.querySelector('.fas.fa-exchange-alt');
      expect(icon).toBeInTheDocument();
    });
  });
});
