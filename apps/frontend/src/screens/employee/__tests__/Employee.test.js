import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Employee from '../screen';
import * as EmployeeActions from '../actions';
import { CommonActions } from 'services/global';

// Mock actions
jest.mock('../actions', () => ({
  getEmployeeList: jest.fn(() => () => Promise.resolve({ status: 200, data: { data: [], count: 0 } })),
  removeBulkEmployee: jest.fn(() => () => Promise.resolve({ status: 200, data: { message: 'Success' } })),
}));

jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(() => () => {}),
  },
}));

// Mock components
jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler, message }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{message}</p>
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data, selectRow }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr key={index} data-testid={`employee-row-${index}`}>
              <td>
                {selectRow && selectRow.mode === 'checkbox' && (
                  <input
                    type="checkbox"
                    data-testid={`checkbox-${index}`}
                    onChange={(e) => selectRow.onSelect && selectRow.onSelect(item, e.target.checked, e)}
                  />
                )}
              </td>
              <td>{item.firstName}</td>
              <td>{item.email}</td>
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
  CSVLink: ({ data, children }) => <a data-testid="csv-link">{children}</a>,
}));

const mockStore = configureStore([]);

describe('Employee Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      employee: {
        employee_list: {
          data: [
            {
              id: 1,
              firstName: 'John',
              referenceCode: 'EMP-001',
              email: 'john@example.com',
              vatRegestationNo: 'VAT123',
            },
            {
              id: 2,
              firstName: 'Jane',
              referenceCode: 'EMP-002',
              email: 'jane@example.com',
              vatRegestationNo: 'VAT456',
            },
          ],
          count: 2,
        },
        vat_list: [],
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
      location: { pathname: '/admin/master/employee' },
    };

    EmployeeActions.getEmployeeList.mockClear();
    EmployeeActions.removeBulkEmployee.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders employee screen with loader initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('calls getEmployeeList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(EmployeeActions.getEmployeeList).toHaveBeenCalled();
    });
  });

  test('renders employee table after loading', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
  });

  test('renders New Employee button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const newButton = screen.getByRole('button', { name: /new employee/i });
    expect(newButton).toBeInTheDocument();
  });

  test('navigates to create employee page when New Employee clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const newButton = screen.getByRole('button', { name: /new employee/i });
    fireEvent.click(newButton);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/employee/create');
  });

  test('renders Bulk Delete button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /bulk delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  test('Bulk Delete button is disabled when no rows selected', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /bulk delete/i });
    expect(deleteButton).toBeDisabled();
  });

  test('renders filter section with name input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/name/i);
    expect(nameInput).toBeInTheDocument();
  });

  test('renders filter section with email input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  test('renders search button in filter section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const searchButton = buttons.find(btn => btn.querySelector('.fa-search'));
    expect(searchButton).toBeInTheDocument();
  });

  test('renders refresh button in filter section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons.find(btn => btn.querySelector('.fa-refresh'));
    expect(refreshButton).toBeInTheDocument();
  });

  test('renders employee data in table rows', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('employee-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('employee-row-1')).toBeInTheDocument();
  });

  test('handles empty employee list', async () => {
    const emptyState = {
      employee: {
        employee_list: { data: [], count: 0 },
        vat_list: [],
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
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('employee-row-0')).not.toBeInTheDocument();
  });

  test('handles API error on employee list fetch', async () => {
    EmployeeActions.getEmployeeList.mockImplementationOnce(() => () =>
      Promise.reject({ data: { message: 'API Error' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(EmployeeActions.getEmployeeList).toHaveBeenCalled();
    });
  });

  test('renders employee screen with correct class', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Employee history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(container.querySelector('.employee-screen')).toBeInTheDocument();
  });
});
