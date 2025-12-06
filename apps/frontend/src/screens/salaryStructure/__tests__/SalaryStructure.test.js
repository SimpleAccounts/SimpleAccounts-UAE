import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SalaryStructure from '../screen';
import * as SalaryStructureAction from '../actions';
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

describe('SalaryStructure Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      salaryStructure: {
        salaryStructure_list: {
          data: [
            {
              id: 1,
              salaryStructureId: 1,
              salaryStructureType: 'Monthly',
              salaryStructureName: 'Basic Structure',
            },
            {
              id: 2,
              salaryStructureId: 2,
              salaryStructureType: 'Hourly',
              salaryStructureName: 'Contract Structure',
            },
          ],
          count: 2,
        },
      },
    };

    store = mockStore(initialState);

    SalaryStructureAction.getSalaryStructureList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.salaryStructure.salaryStructure_list,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the salary structure screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/SalaryStructure/i)).toBeInTheDocument();
    });
  });

  it('should call getSalaryStructureList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SalaryStructureAction.getSalaryStructureList).toHaveBeenCalled();
    });
  });

  it('should display salary structure data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Basic Structure')).toBeInTheDocument();
      expect(screen.getByText('Contract Structure')).toBeInTheDocument();
    });
  });

  it('should display salary structure types in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Hourly')).toBeInTheDocument();
    });
  });

  it('should render New Salary Structure button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/NewSalaryStructure/i)).toBeInTheDocument();
    });
  });

  it('should navigate to create salary structure page when New button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const newButton = screen.getByText(/NewSalaryStructure/i);
      fireEvent.click(newButton);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith('/admin/payroll/config/createSalaryStructure');
  });

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/SalaryStructureType/i)).toBeInTheDocument();
      expect(screen.getByText(/SalaryStructureName/i)).toBeInTheDocument();
    });
  });

  it('should render BootstrapTable with data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = document.querySelector('.react-bs-table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should display salary structure icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
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
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryStructure({ history: mockHistory });
    component.goToDetail({ salaryStructureId: 1 });

    expect(mockHistoryPush).toHaveBeenCalledWith(
      '/admin/payroll/config/detailSalaryStructure',
      { id: 1 }
    );
  });

  it('should handle sorting when column header is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryStructure({ history: mockHistory });
    component.sortColumn('salaryStructureName', 'asc');

    expect(SalaryStructureAction.getSalaryStructureList).toHaveBeenCalled();
  });

  it('should handle pagination page size change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryStructure({ history: mockHistory });
    component.onSizePerPageList(20);

    expect(SalaryStructureAction.getSalaryStructureList).toHaveBeenCalled();
  });

  it('should handle pagination page change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryStructure({ history: mockHistory });
    component.onPageChange(2);

    expect(SalaryStructureAction.getSalaryStructureList).toHaveBeenCalled();
  });

  it('should display loading state initially', async () => {
    const emptyStore = mockStore({
      salaryStructure: {
        salaryStructure_list: {
          data: [],
          count: 0,
        },
      },
    });

    render(
      <Provider store={emptyStore}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const component = new SalaryStructure({ history: mockHistory });
    expect(component.state.loading).toBe(true);
  });

  it('should handle error when API call fails', async () => {
    SalaryStructureAction.getSalaryStructureList = jest.fn(() =>
      Promise.reject({
        data: { message: 'Failed to fetch salary structures' },
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryStructure history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith(
        'error',
        'Failed to fetch salary structures'
      );
    });
  });
});
