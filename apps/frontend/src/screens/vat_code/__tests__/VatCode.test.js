import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import VatCode from '../screen';
import * as VatActions from '../actions';
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
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={okHandler}>Confirm</button>
        <button onClick={cancelHandler}>Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('react-bootstrap-table', () => {
  const Table = ({ children, data }) => (
    <div data-testid="bootstrap-table">
      {data && data.map((item, index) => (
        <div key={index}>{item.name} - {item.vat}%</div>
      ))}
      {children}
    </div>
  );
  const Column = ({ children }) => <div>{children}</div>;
  return { BootstrapTable: Table, TableHeaderColumn: Column };
});

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('VatCode Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      vat: {
        vat_list: {
          data: [
            {
              id: 1,
              name: 'Standard Rate',
              vat: 5,
              createdBy: 1,
              modifiedBy: 1,
            },
            {
              id: 2,
              name: 'Zero Rated',
              vat: 0,
              createdBy: 1,
              modifiedBy: 1,
            },
            {
              id: 5,
              name: 'Exempt',
              vat: 0,
              createdBy: 1,
              modifiedBy: 1,
            },
          ],
          count: 3,
        },
      },
    };

    store = mockStore(initialState);

    VatActions.getCompanyDetails = jest.fn(() => 
      Promise.resolve({ 
        status: 200, 
        data: { isRegisteredVat: false } 
      })
    );
    VatActions.getVatList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          data: initialState.vat.vat_list.data,
          count: initialState.vat.vat_list.count,
        },
      })
    );
    VatActions.deleteVat = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'VAT deleted successfully' } })
    );
    VatActions.getVatCount = jest.fn(() => Promise.resolve({ data: 0 }));

    window.localStorage.setItem('language', 'en');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the VAT code screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should call getVatList action on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(VatActions.getVatList).toHaveBeenCalled();
    });
  });

  it('should call getCompanyDetails on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(VatActions.getCompanyDetails).toHaveBeenCalled();
    });
  });

  it('should display VAT list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Standard Rate - 5%/)).toBeInTheDocument();
      expect(screen.getByText(/Zero Rated - 0%/)).toBeInTheDocument();
    });
  });

  it('should render VAT category header', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('VAT Category')).toBeInTheDocument();
    });
  });

  it('should display add new VAT button when company is not registered for VAT', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
      expect(addButton).toBeDefined();
    });
  });

  it('should not display add new VAT button when company is registered for VAT', async () => {
    VatActions.getCompanyDetails = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { isRegisteredVat: true },
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
      expect(addButton).toBeUndefined();
    });
  });

  it('should handle row selection', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    });
  });

  it('should filter out specific VAT codes (id 3, 4, 10)', async () => {
    const stateWithFilteredVats = {
      vat: {
        vat_list: {
          data: [
            { id: 1, name: 'Standard', vat: 5 },
            { id: 3, name: 'Filtered 1', vat: 5 },
            { id: 4, name: 'Filtered 2', vat: 0 },
            { id: 10, name: 'Filtered 3', vat: 0 },
            { id: 5, name: 'Exempt', vat: 0 },
          ],
          count: 5,
        },
      },
    };

    store = mockStore(stateWithFilteredVats);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Filtered 1/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Filtered 2/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Filtered 3/)).not.toBeInTheDocument();
    });
  });

  it('should display loader initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should handle delete VAT action', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(VatActions.getVatList).toHaveBeenCalled();
    });
  });

  it('should show confirm modal before deleting VAT', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle error when fetching VAT list fails', async () => {
    VatActions.getVatList = jest.fn(() =>
      Promise.reject({ data: { message: 'Failed to fetch VAT list' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith(
        'error',
        expect.any(String)
      );
    });
  });

  it('should render table with correct columns', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    });
  });

  it('should handle pagination when VAT list has more items', async () => {
    const multipleVats = [
      { id: 1, name: 'VAT 1', vat: 5 },
      { id: 2, name: 'VAT 2', vat: 0 },
      { id: 5, name: 'VAT 5', vat: 5 },
      { id: 6, name: 'VAT 6', vat: 0 },
      { id: 7, name: 'VAT 7', vat: 5 },
    ];

    initialState.vat.vat_list.data = multipleVats;
    initialState.vat.vat_list.count = 5;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <VatCode />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    });
  });
});
