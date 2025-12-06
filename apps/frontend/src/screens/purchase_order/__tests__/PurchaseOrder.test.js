import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PurchaseOrder from '../screen';
import * as PurchaseOrderAction from '../actions';
import * as GoodsReceivedNoteCreateAction from '../../goods_received_note/screens/create/actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('../../goods_received_note/screens/create/actions');
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

describe('PurchaseOrder Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      purchase_order: {
        purchase_order_list: {
          data: {
            data: [
              {
                id: 1,
                supplierName: 'Test Supplier',
                poNumber: 'PO-001',
                poApproveDate: '2023-12-01',
                poReceiveDate: '2023-12-15',
                totalAmount: 5000,
                totalVatAmount: 750,
                currencyCode: 'AED',
                currencyName: 'UAE Dirham',
                status: 'Draft',
                statusEnum: 'Draft',
              },
              {
                id: 2,
                supplierName: 'Another Supplier',
                poNumber: 'PO-002',
                poApproveDate: '2023-12-02',
                poReceiveDate: '2023-12-16',
                totalAmount: 3000,
                totalVatAmount: 450,
                currencyCode: 'AED',
                currencyName: 'UAE Dirham',
                status: 'Approved',
                statusEnum: 'Approved',
              },
            ],
            count: 2,
          },
        },
        supplier_list: [
          { label: { contactName: 'Test Supplier' }, value: 1 },
          { label: { contactName: 'Another Supplier' }, value: 2 },
        ],
      },
      supplier_invoice: {
        status_list: [
          { label: 'Draft', value: 'Draft' },
          { label: 'Approved', value: 'Approved' },
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

    PurchaseOrderAction.getpoList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.purchase_order.purchase_order_list })
    );
    PurchaseOrderAction.getStatusList = jest.fn(() => Promise.resolve());
    PurchaseOrderAction.changeStatus = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Status Changed Successfully' } })
    );
    PurchaseOrderAction.sendMail = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Email Sent Successfully' } })
    );
    GoodsReceivedNoteCreateAction.getInvoiceNo = jest.fn(() =>
      Promise.resolve({ data: { prefix: 'GRN', nextNumber: 1 } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the purchase order screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Purchase Order/i)).toBeInTheDocument();
    });
  });

  it('should display purchase order list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('PO-001')).toBeInTheDocument();
      expect(screen.getByText('PO-002')).toBeInTheDocument();
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });
  });

  it('should call getpoList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PurchaseOrderAction.getpoList).toHaveBeenCalled();
    });
  });

  it('should call getStatusList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PurchaseOrderAction.getStatusList).toHaveBeenCalled();
    });
  });

  it('should call getInvoiceNo on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GoodsReceivedNoteCreateAction.getInvoiceNo).toHaveBeenCalled();
    });
  });

  it('should display correct status badges', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  it('should display correct currency and amount formatting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/5,000.00/)).toBeInTheDocument();
      expect(screen.getByText(/3,000.00/)).toBeInTheDocument();
    });
  });

  it('should have Add New Purchase Order button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/Add New Purchase Order/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should have filter section with search functionality', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
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
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('PO NUMBER')).toBeInTheDocument();
      expect(screen.getByText('SUPPLIER NAME')).toBeInTheDocument();
      expect(screen.getByText('PO DATE')).toBeInTheDocument();
      expect(screen.getByText('PO EXPIRY DATE')).toBeInTheDocument();
      expect(screen.getByText('STATUS')).toBeInTheDocument();
      expect(screen.getByText('AMOUNT')).toBeInTheDocument();
    });
  });

  it('should handle filter clear button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
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

    expect(PurchaseOrderAction.getpoList).toHaveBeenCalled();
  });

  it('should display supplier names correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
      expect(screen.getByText('Another Supplier')).toBeInTheDocument();
    });
  });

  it('should render action dropdown buttons for each row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
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

  it('should display purchase order amounts with VAT', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Purchase Order Amount/i)).toBeInTheDocument();
      expect(screen.getByText(/Vat Amount/i)).toBeInTheDocument();
    });
  });

  it('should display dates in correct format', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PurchaseOrder location={{ state: null }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('2023-12-01')).toBeInTheDocument();
      expect(screen.getByText('2023-12-15')).toBeInTheDocument();
    });
  });
});
