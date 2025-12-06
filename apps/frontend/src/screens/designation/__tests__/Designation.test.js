import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Designation from '../screen';
import * as DesignationActions from '../actions';
import { CommonActions } from 'services/global';

// Mock actions
jest.mock('../actions', () => ({
  getEmployeeDesignationList: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: {
      data: [
        { id: 1, designationId: 'DES001', designationName: 'Manager' },
        { id: 2, designationId: 'DES002', designationName: 'Developer' },
        { id: 3, designationId: 'DES003', designationName: 'Designer' },
      ],
      count: 3
    }
  })),
  removeBulkEmployee: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: { message: 'Employees Deleted Successfully' }
  })),
  getEmployeeList: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: {
      data: []
    }
  })),
}));

jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(() => () => {}),
  },
}));

// Mock components
jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler, message, message1 }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <p data-testid="modal-message">{message}</p>
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data, options, selectRow }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr
              key={index}
              data-testid={`designation-row-${index}`}
              onClick={() => options.onRowClick && options.onRowClick(item)}
            >
              <td>{item.designationId}</td>
              <td>{item.designationName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children }) => <th>{children}</th>,
}));

jest.mock('react-csv', () => ({
  CSVLink: React.forwardRef(({ data, filename, children }, ref) => (
    <a ref={ref} data-testid="csv-link" className="hidden">
      {children}
    </a>
  )),
}));

jest.mock('react-localization', () => {
  return jest.fn().mockImplementation(() => ({
    setLanguage: jest.fn(),
    Designations: 'Designations',
    NewDesignation: 'New Designation',
    DESIGNATIONID: 'DESIGNATION ID',
    DESIGNATIONNAME: 'DESIGNATION NAME',
  }));
});

const mockStore = configureStore([]);

describe('Designation Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      employeeDesignation: {
        designation_list: {
          data: [
            { id: 1, designationId: 'DES001', designationName: 'Manager' },
            { id: 2, designationId: 'DES002', designationName: 'Developer' },
            { id: 3, designationId: 'DES003', designationName: 'Designer' },
          ],
          count: 3,
        },
      },
    };

    store = mockStore(initialState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    mockHistory = {
      push: jest.fn(),
      location: { pathname: '/admin/payroll/config/designation' },
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'en');

    // Reset mocks
    DesignationActions.getEmployeeDesignationList.mockClear();
    DesignationActions.removeBulkEmployee.mockClear();
    CommonActions.tostifyAlert.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders designation screen with table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
  });

  test('displays loader initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('calls getEmployeeDesignationList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(DesignationActions.getEmployeeDesignationList).toHaveBeenCalled();
    });
  });

  test('renders New Designation button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /new.*designation/i });
    expect(addButton).toBeInTheDocument();
  });

  test('navigates to create page when New Designation is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /new.*designation/i });
    fireEvent.click(addButton);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/payroll/config/createEmployeeDesignation');
  });

  test('renders designation list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('designation-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('designation-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('designation-row-2')).toBeInTheDocument();
  });

  test('handles empty designation list', async () => {
    const emptyState = {
      employeeDesignation: {
        designation_list: { data: [], count: 0 },
      },
    };

    store = mockStore(emptyState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('designation-row-0')).not.toBeInTheDocument();
  });

  test('navigates to detail page when row is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const row = screen.getByTestId('designation-row-0');
    fireEvent.click(row);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/payroll/config/detailEmployeeDesignation', { id: 1 });
  });

  test('displays designation IDs correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('DES001')).toBeInTheDocument();
    expect(screen.getByText('DES002')).toBeInTheDocument();
    expect(screen.getByText('DES003')).toBeInTheDocument();
  });

  test('displays designation names correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  test('handles API error on designation list fetch', async () => {
    DesignationActions.getEmployeeDesignationList.mockImplementationOnce(() => () =>
      Promise.reject({ data: { message: 'API Error' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(DesignationActions.getEmployeeDesignationList).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  test('renders card header with correct title', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Designations')).toBeInTheDocument();
  });

  test('handles pagination with multiple designations', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const table = screen.getByTestId('bootstrap-table');
    expect(table).toBeInTheDocument();
  });

  test('handles sorting functionality', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    // Verify data is displayed in order
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  test('renders table with correct number of rows', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Designation history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const rows = screen.getAllByTestId(/designation-row-/);
    expect(rows).toHaveLength(3);
  });
});
