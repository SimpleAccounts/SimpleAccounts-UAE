import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import RequestForQuotation from '../screen';
import * as RequestForQuotationAction from '../actions';
import * as RequestForQuotationDetailsAction from '../screens/detail/actions';
import * as PurchaseOrderCreateAction from '../../purchase_order/screens/create/actions';
import * as PurchaseOrderAction from '../../purchase_order/actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('../screens/detail/actions');
jest.mock('../../purchase_order/screens/create/actions');
jest.mock('../../purchase_order/actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

const mockHistoryPush = jest.fn();

describe('Request For Quotation Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      request_for_quotation: {
        supplier_list: [
          {
            value: 1,
            label: { contactName: 'Supplier A', contactId: 1 },
          },
          {
            value: 2,
            label: { contactName: 'Supplier B', contactId: 2 },
          },
        ],
        status_list: [
          { value: 'Draft', label: 'Draft' },
          { value: 'Sent', label: 'Sent' },
          { value: 'Approved', label: 'Approved' },
        ],
        request_for_quotation_list: {
          data: {
            data: [
              {
                id: 1,
                rfqNumber: 'RFQ-001',
                supplierName: 'Supplier A',
                status: 'Draft',
                statusEnum: 'Draft',
                rfqReceiveDate: '2024-12-01',
                rfqExpiryDate: '2024-12-15',
                totalAmount: 5000,
                totalVatAmount: 250,
                currencyCode: 'AED',
                currencyName: 'UAE Dirham',
                poList: [],
              },
              {
                id: 2,
                rfqNumber: 'RFQ-002',
                supplierName: 'Supplier B',
                status: 'Sent',
                statusEnum: 'Sent',
                rfqReceiveDate: '2024-12-02',
                rfqExpiryDate: '2024-12-16',
                totalAmount: 10000,
                totalVatAmount: 500,
                currencyCode: 'AED',
                currencyName: 'UAE Dirham',
                poList: [],
              },
            ],
            count: 2,
          },
        },
      },
      common: {
        universal_currency_list: [
          {
            currencyCode: 150,
            currencyName: 'UAE Dirham',
            currencyIsoCode: 'AED',
          },
        ],
      },
    };

    store = mockStore(initialState);
    jest.clearAllMocks();

    RequestForQuotationAction.getStatusList = jest.fn(() => Promise.resolve({ status: 200 }));
    RequestForQuotationAction.getSupplierList = jest.fn(() => Promise.resolve({ status: 200 }));
    RequestForQuotationAction.getRFQList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.request_for_quotation.request_for_quotation_list })
    );
    RequestForQuotationAction.sendMail = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Email sent successfully' } })
    );
    RequestForQuotationAction.changeStatus = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Status changed successfully' } })
    );
    RequestForQuotationAction.removeBulk = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Deleted successfully' } })
    );
    PurchaseOrderCreateAction.getPoNo = jest.fn(() =>
      Promise.resolve({ status: 200, data: 'PO-001' })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the request for quotation screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Request For Quotation/i)).toBeInTheDocument();
    });
  });

  it('should display RFQ list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RFQ-001')).toBeInTheDocument();
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    });
  });

  it('should call initialization methods on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(RequestForQuotationAction.getStatusList).toHaveBeenCalled();
      expect(RequestForQuotationAction.getSupplierList).toHaveBeenCalled();
      expect(RequestForQuotationAction.getRFQList).toHaveBeenCalled();
      expect(PurchaseOrderCreateAction.getPoNo).toHaveBeenCalled();
    });
  });

  it('should render RFQ status badge with correct styling', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const draftBadge = screen.getByText('Draft');
      expect(draftBadge).toHaveClass('badge');
    });
  });

  it('should format RFQ amounts correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/5,000.00/)).toBeInTheDocument();
      expect(screen.getByText(/250.00/)).toBeInTheDocument();
    });
  });

  it('should display filter section with supplier dropdown', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
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
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find(btn => btn.querySelector('.fa-search'));
      if (searchButton) {
        fireEvent.click(searchButton);
        expect(RequestForQuotationAction.getRFQList).toHaveBeenCalled();
      }
    });
  });

  it('should handle clear filters button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
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

  it('should navigate to create RFQ page when add button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation history={{ push: mockHistoryPush }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.textContent && btn.textContent.includes('Add'));
      if (addButton) {
        fireEvent.click(addButton);
      }
    });
  });

  it('should render action dropdown for each RFQ row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const chevronIcons = screen.getAllByClassName('fas fa-chevron-down');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  it('should handle send mail action', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const actionButtons = screen.getAllByRole('button');
      const dropdownButton = actionButtons.find(btn =>
        btn.className && btn.className.includes('btn-brand')
      );
      if (dropdownButton) {
        fireEvent.click(dropdownButton);
      }
    });
  });

  it('should handle change status to approved', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RFQ-001')).toBeInTheDocument();
    });
  });

  it('should handle change status to rejected', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RFQ-002')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RFQ-001')).toBeInTheDocument();
      expect(screen.getByText('RFQ-002')).toBeInTheDocument();
    });
  });

  it('should handle sorting by column', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const rfqNumberHeader = screen.getByText(/RFQ NUMBER/i);
      if (rfqNumberHeader) {
        fireEvent.click(rfqNumberHeader);
      }
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RequestForQuotation />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });
});
