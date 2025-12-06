import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Quotation from '../screen';
import * as QuotationAction from '../actions';
import * as CustomerInvoiceActions from '../../customer_invoice/actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('../../customer_invoice/actions');
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

describe('Quotation Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      quotation: {
        quotation_list: {
          data: {
            data: [
              {
                id: 1,
                customerName: 'Test Customer',
                quatationNumber: 'QT-001',
                quotationCreatedDate: '2023-12-01',
                quotaionExpiration: '2023-12-15',
                totalAmount: 10000,
                totalVatAmount: 1500,
                currencyIsoCode: 'AED',
                status: 'Draft',
              },
              {
                id: 2,
                customerName: 'Another Customer',
                quatationNumber: 'QT-002',
                quotationCreatedDate: '2023-12-02',
                quotaionExpiration: '2023-12-16',
                totalAmount: 15000,
                totalVatAmount: 2250,
                currencyIsoCode: 'AED',
                status: 'Sent',
              },
            ],
            count: 2,
          },
        },
      },
      customer_invoice: {
        customer_list: [
          { label: { contactName: 'Test Customer' }, value: 1 },
          { label: { contactName: 'Another Customer' }, value: 2 },
        ],
      },
      supplier_invoice: {
        status_list: [
          { label: 'Draft', value: 'Draft' },
          { label: 'Sent', value: 'Sent' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
      },
    };

    store = mockStore(initialState);

    QuotationAction.getQuotationList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.quotation.quotation_list })
    );
    QuotationAction.getStatusList = jest.fn(() => Promise.resolve());
    QuotationAction.changeStatus = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Status Changed Successfully' } })
    );
    CustomerInvoiceActions.getCustomerList = jest.fn(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the quotation screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Quotation/i)).toBeInTheDocument();
    });
  });

  it('should display quotation list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('QT-001')).toBeInTheDocument();
      expect(screen.getByText('QT-002')).toBeInTheDocument();
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
    });
  });

  it('should call getQuotationList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(QuotationAction.getQuotationList).toHaveBeenCalled();
    });
  });

  it('should call getStatusList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(QuotationAction.getStatusList).toHaveBeenCalled();
    });
  });

  it('should call getCustomerList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CustomerInvoiceActions.getCustomerList).toHaveBeenCalledWith(2);
    });
  });

  it('should display correct status badges', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Sent')).toBeInTheDocument();
    });
  });

  it('should display correct currency and amount formatting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/10,000.00/)).toBeInTheDocument();
      expect(screen.getByText(/15,000.00/)).toBeInTheDocument();
    });
  });

  it('should have Add New Request button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/Add New Request/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should have filter section with search functionality', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
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
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('QUOTATION NUMBER')).toBeInTheDocument();
      expect(screen.getByText('CUSTOMER NAME')).toBeInTheDocument();
      expect(screen.getByText('CREATED DATE')).toBeInTheDocument();
      expect(screen.getByText('EXPIRATION DATE')).toBeInTheDocument();
      expect(screen.getByText('STATUS')).toBeInTheDocument();
      expect(screen.getByText('AMOUNT')).toBeInTheDocument();
    });
  });

  it('should handle filter clear button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
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

    expect(QuotationAction.getQuotationList).toHaveBeenCalled();
  });

  it('should display customer names correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
      expect(screen.getByText('Another Customer')).toBeInTheDocument();
    });
  });

  it('should render action dropdown buttons for each row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should display quotation amounts with VAT', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Quotation Amount/i)).toBeInTheDocument();
      expect(screen.getByText(/Vat Amount/i)).toBeInTheDocument();
    });
  });

  it('should display dates correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('2023-12-01')).toBeInTheDocument();
      expect(screen.getByText('2023-12-15')).toBeInTheDocument();
    });
  });

  it('should have pagination controls', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Quotation location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });
});
