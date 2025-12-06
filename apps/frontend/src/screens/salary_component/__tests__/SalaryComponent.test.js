import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SalaryComponent from '../screen';
import * as DesignationActions from '../actions';
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
};

describe('SalaryComponent (Designation) Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      employeeDesignation: {
        designation_list: {
          data: [
            {
              id: 1,
              designationId: 'D001',
              designationName: 'Software Engineer',
            },
            {
              id: 2,
              designationId: 'D002',
              designationName: 'Senior Developer',
            },
            {
              id: 3,
              designationId: 'D003',
              designationName: 'Project Manager',
            },
          ],
          count: 3,
        },
      },
    };

    store = mockStore(initialState);

    DesignationActions.getEmployeeDesignationList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.employeeDesignation.designation_list,
      })
    );

    DesignationActions.removeBulkEmployee = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Employees Deleted Successfully' },
      })
    );

    DesignationActions.getEmployeeList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          data: [
            { id: 1, designationId: 'D001', designationName: 'Software Engineer' },
          ],
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the designation screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Designations/i)).toBeInTheDocument();
    });
  });

  it('should display designation data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
    });
  });

  it('should display designation IDs in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('D001')).toBeInTheDocument();
      expect(screen.getByText('D002')).toBeInTheDocument();
      expect(screen.getByText('D003')).toBeInTheDocument();
    });
  });

  it('should render New Designation button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/NewDesignation/i)).toBeInTheDocument();
    });
  });

  it('should navigate to create designation page when New button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const newButton = screen.getByText(/NewDesignation/i);
      fireEvent.click(newButton);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith('/admin/payroll/config/createEmployeeDesignation');
  });

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/DESIGNATIONID/i)).toBeInTheDocument();
      expect(screen.getByText(/DESIGNATIONNAME/i)).toBeInTheDocument();
    });
  });

  it('should render BootstrapTable with data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = document.querySelector('.react-bs-table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should display designation icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const icon = document.querySelector('.fas.fa-object-group');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should navigate to detail page when row is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    component.goToDetail({ id: 1 });

    expect(mockHistoryPush).toHaveBeenCalledWith(
      '/admin/payroll/config/detailEmployeeDesignation',
      { id: 1 }
    );
  });

  it('should handle row selection', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    component.onRowSelect({ id: 1 }, true, {});

    expect(component.state.selectedRows).toContain(1);
  });

  it('should handle select all rows', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    component.onSelectAll(true, rows);

    expect(component.state.selectedRows).toEqual([1, 2, 3]);
  });

  it('should handle sorting when column header is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    component.sortColumn('designationName', 'asc');

    await waitFor(() => {
      expect(component.options.sortName).toBe('designationName');
      expect(component.options.sortOrder).toBe('asc');
    });
  });

  it('should handle pagination page size change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    component.onSizePerPageList(20);

    await waitFor(() => {
      expect(component.options.sizePerPage).toBe(20);
    });
  });

  it('should handle pagination page change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    component.onPageChange(2);

    await waitFor(() => {
      expect(component.options.page).toBe(2);
    });
  });

  it('should show alert when bulk delete is attempted with no rows selected', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    component.bulkDelete();

    expect(CommonActions.tostifyAlert).toHaveBeenCalledWith(
      'info',
      'Please select the rows of the table and try again.'
    );
  });

  it('should display loading state initially', async () => {
    const emptyStore = mockStore({
      employeeDesignation: {
        designation_list: {
          data: [],
          count: 0,
        },
      },
    });

    render(
      <Provider store={emptyStore}>
        <BrowserRouter>
          <SalaryComponent history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryComponent({ history: mockHistory });
    expect(component.state.loading).toBe(true);
  });
});
