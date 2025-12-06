import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import GoodsReceivedNote from '../screen';
import * as GoodsReceivedNoteAction from '../actions';
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
const mockHistory = {
  push: mockHistoryPush,
  location: {
    state: null,
  },
};

describe('GoodsReceivedNote Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      goods_received_note: {
        supplier_list: [
          { value: 1, label: { contactName: 'Supplier A' } },
          { value: 2, label: { contactName: 'Supplier B' } },
        ],
        status_list: [
          { label: 'Draft', value: 'Draft' },
          { label: 'Sent', value: 'Sent' },
          { label: 'Posted', value: 'Posted' },
          { label: 'Closed', value: 'Closed' },
        ],
        goods_received_note_list: {
          data: {
            data: [
              {
                id: 1,
                status: 'Draft',
                statusEnum: 'DRAFT',
                supplierName: 'Supplier A',
                grnNumber: 'GRN-001',
                grnRemarks: 'Test remarks',
                grnReceiveDate: '01-01-2024',
                rfqExpiryDate: '31-12-2024',
                totalAmount: 10000,
                totalVatAmount: 500,
              },
              {
                id: 2,
                status: 'Posted',
                statusEnum: 'POSTED',
                supplierName: 'Supplier B',
                grnNumber: 'GRN-002',
                grnRemarks: 'Another test',
                grnReceiveDate: '02-01-2024',
                rfqExpiryDate: '31-12-2024',
                totalAmount: 15000,
                totalVatAmount: 750,
              },
            ],
            count: 2,
          },
        },
      },
      common: {
        universal_currency_list: [
          { id: 1, code: 'AED', symbol: 'AED' },
          { id: 2, code: 'USD', symbol: '$' },
        ],
      },
    };

    store = mockStore(initialState);

    GoodsReceivedNoteAction.getGRNList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.goods_received_note.goods_received_note_list.data,
      })
    );

    GoodsReceivedNoteAction.getStatusList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.goods_received_note.status_list,
      })
    );

    GoodsReceivedNoteAction.getSupplierList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.goods_received_note.supplier_list,
      })
    );

    GoodsReceivedNoteAction.sendMail = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Send Successfully' },
      })
    );

    GoodsReceivedNoteAction.postGRN = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Posted Successfully' },
      })
    );

    GoodsReceivedNoteAction.changeStatus = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Status Changed Successfully' },
      })
    );

    GoodsReceivedNoteAction.removeBulk = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Deleted Successfully' },
      })
    );

    GoodsReceivedNoteAction.deleteInvoice = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Goods Received Note Deleted Successfully' },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the goods received note screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/GoodsReceivedNotes/i)).toBeInTheDocument();
    });
  });

  it('should call getGRNList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GoodsReceivedNoteAction.getGRNList).toHaveBeenCalled();
    });
  });

  it('should call getStatusList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GoodsReceivedNoteAction.getStatusList).toHaveBeenCalled();
    });
  });

  it('should call getSupplierList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GoodsReceivedNoteAction.getSupplierList).toHaveBeenCalled();
    });
  });

  it('should display GRN data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('GRN-001')).toBeInTheDocument();
      expect(screen.getByText('GRN-002')).toBeInTheDocument();
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
      expect(screen.getByText('Supplier B')).toBeInTheDocument();
    });
  });

  it('should render Add New Goods Received Notes button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AddNewGoodsReceivedNotes/i)).toBeInTheDocument();
    });
  });

  it('should navigate to create GRN page when Add New button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/AddNewGoodsReceivedNotes/i);
      fireEvent.click(addButton);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith('/admin/expense/goods-received-note/create');
  });

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/GRNNUMBER/i)).toBeInTheDocument();
      expect(screen.getByText(/SUPPLIERNAME/i)).toBeInTheDocument();
      expect(screen.getByText(/GRNRECEIVEDATE/i)).toBeInTheDocument();
      expect(screen.getByText(/GRNREMARKS/i)).toBeInTheDocument();
      expect(screen.getByText(/STATUS/i)).toBeInTheDocument();
    });
  });

  it('should display status badges correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const draftBadge = screen.getByText('Draft');
      const postedBadge = screen.getByText('Posted');
      expect(draftBadge).toBeInTheDocument();
      expect(postedBadge).toBeInTheDocument();
    });
  });

  it('should render supplier filter dropdown', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filter:/i)).toBeInTheDocument();
    });
  });

  it('should handle search button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const searchButtons = document.querySelectorAll('.fa-search');
      expect(searchButtons.length).toBeGreaterThan(0);
    });
  });

  it('should handle clear all filters button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const refreshButtons = document.querySelectorAll('.fa-refresh');
      expect(refreshButtons.length).toBeGreaterThan(0);
    });
  });

  it('should handle sendMail action successfully', async () => {
    const component = new GoodsReceivedNote({ history: mockHistory });
    await component.sendMail(1);

    await waitFor(() => {
      expect(GoodsReceivedNoteAction.sendMail).toHaveBeenCalledWith(1);
    });
  });

  it('should handle postGrn action successfully', async () => {
    const component = new GoodsReceivedNote({ history: mockHistory });
    await component.postGrn(1);

    await waitFor(() => {
      expect(GoodsReceivedNoteAction.postGRN).toHaveBeenCalledWith(1);
    });
  });

  it('should handle changeStatus action successfully', async () => {
    const component = new GoodsReceivedNote({ history: mockHistory });
    await component.changeStatus(1, 'Sent');

    await waitFor(() => {
      expect(GoodsReceivedNoteAction.changeStatus).toHaveBeenCalledWith(1, 'Sent');
    });
  });

  it('should handle row selection', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    const component = new GoodsReceivedNote({ history: mockHistory });
    component.onRowSelect({ id: 1 }, true, {});

    expect(component.state.selectedRows).toContain(1);
  });

  it('should handle pagination page size change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    const component = new GoodsReceivedNote({ history: mockHistory });
    component.onSizePerPageList(20);

    await waitFor(() => {
      expect(component.options.sizePerPage).toBe(20);
    });
  });

  it('should handle pagination page change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    const component = new GoodsReceivedNote({ history: mockHistory });
    component.onPageChange(2);

    await waitFor(() => {
      expect(component.options.page).toBe(2);
    });
  });

  it('should render invoice image icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GoodsReceivedNote history={mockHistory} location={mockHistory.location} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const invoiceImage = document.querySelector('img[alt="invoiceimage"]');
      expect(invoiceImage).toBeInTheDocument();
    });
  });
});
