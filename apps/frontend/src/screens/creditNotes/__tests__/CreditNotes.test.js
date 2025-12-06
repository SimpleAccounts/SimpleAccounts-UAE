import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import CreditNotes from '../screen';
import * as CreditNotesActions from '../actions';
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

describe('CreditNotes Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      customer_invoice: {
        customer_invoice_list: {
          data: [
            {
              id: 1,
              customerName: 'Test Customer',
              invNumber: 'INV-001',
              creditNoteNumber: 'CN-001',
              creditNoteDate: '2023-12-01',
              totalAmount: 1000,
              totalVatAmount: 150,
              currencyName: 'AED',
              currencySymbol: 'AED',
              status: 'Draft',
              statusEnum: 'Draft',
              dueAmount: 1000,
              contactId: 1,
              isCNWithoutProduct: false,
              cnCreatedOnPaidInvoice: false,
            },
            {
              id: 2,
              customerName: 'Another Customer',
              invNumber: 'INV-002',
              creditNoteNumber: 'CN-002',
              creditNoteDate: '2023-12-02',
              totalAmount: 2000,
              totalVatAmount: 300,
              currencyName: 'AED',
              currencySymbol: 'AED',
              status: 'Open',
              statusEnum: 'Open',
              dueAmount: 2000,
              contactId: 2,
              isCNWithoutProduct: false,
              cnCreatedOnPaidInvoice: false,
            },
          ],
          count: 2,
        },
        customer_list: [
          { label: { contactName: 'Test Customer' }, value: 1 },
          { label: { contactName: 'Another Customer' }, value: 2 },
        ],
        status_list: [
          { label: 'Draft', value: 'Draft' },
          { label: 'Open', value: 'Open' },
          { label: 'Closed', value: 'Closed' },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
      },
    };

    store = mockStore(initialState);

    CreditNotesActions.getCreditNoteList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.customer_invoice.customer_invoice_list })
    );
    CreditNotesActions.getStatusList = jest.fn(() => Promise.resolve());
    CreditNotesActions.getCustomerList = jest.fn(() => Promise.resolve());
    CreditNotesActions.getOverdueAmountDetails = jest.fn(() =>
      Promise.resolve({ status: 200, data: { overDueAmount: 0, overDueAmountWeekly: 0, overDueAmountMonthly: 0 } })
    );
    CreditNotesActions.creditNoteposting = jest.fn(() =>
      Promise.resolve({ status: 200, data: 'Credit Note Posted Successfully' })
    );
    CreditNotesActions.unPostInvoice = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Success' } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the credit notes screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Credit Notes/i)).toBeInTheDocument();
    });
  });

  it('should display credit notes list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('CN-001')).toBeInTheDocument();
      expect(screen.getByText('CN-002')).toBeInTheDocument();
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
    });
  });

  it('should call getCreditNoteList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CreditNotesActions.getCreditNoteList).toHaveBeenCalled();
    });
  });

  it('should call getStatusList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CreditNotesActions.getStatusList).toHaveBeenCalled();
    });
  });

  it('should call getCustomerList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CreditNotesActions.getCustomerList).toHaveBeenCalledWith(2);
    });
  });

  it('should display correct status badges', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const badges = screen.getAllByText('Draft');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should display correct currency and amount formatting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/1,000.00/)).toBeInTheDocument();
      expect(screen.getByText(/2,000.00/)).toBeInTheDocument();
    });
  });

  it('should have Add Credit Note button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/Add Credit Note/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should have filter section with search inputs', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filter/i)).toBeInTheDocument();
      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find(btn => btn.querySelector('.fa-search'));
      expect(searchButton).toBeTruthy();
    });
  });

  it('should render table with correct columns', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('CREDIT NOTE')).toBeInTheDocument();
      expect(screen.getByText('CUSTOMER NAME')).toBeInTheDocument();
      expect(screen.getByText('INVOICE NUMBER')).toBeInTheDocument();
      expect(screen.getByText('DATE')).toBeInTheDocument();
      expect(screen.getByText('STATUS')).toBeInTheDocument();
      expect(screen.getByText('AMOUNT')).toBeInTheDocument();
    });
  });

  it('should handle filter clear button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(btn => btn.querySelector('.fa-refresh'));
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });

    expect(CreditNotesActions.getCreditNoteList).toHaveBeenCalled();
  });

  it('should display invoice numbers correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
    });
  });

  it('should render action dropdown buttons for each row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const dropdownToggles = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.fa-chevron-down')
      );
      expect(dropdownToggles.length).toBeGreaterThan(0);
    });
  });

  it('should handle amount input change in filter', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText(/Enter.*Amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });
      expect(amountInput.value).toBe('1000');
    });
  });

  it('should display remaining balance in amount column', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreditNotes location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Remaining Balance/i).length).toBeGreaterThan(0);
    });
  });
});
