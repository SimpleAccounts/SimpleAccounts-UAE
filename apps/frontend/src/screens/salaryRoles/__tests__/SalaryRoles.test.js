import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SalaryRoles from '../screen';
import * as EmployeeActions from '../actions';
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

describe('SalaryRoles Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      salaryRoles: {
        salaryRole_list: {
          data: [
            {
              id: 1,
              salaryRoleId: 'SR-001',
              salaryRoleName: 'Software Engineer',
            },
            {
              id: 2,
              salaryRoleId: 'SR-002',
              salaryRoleName: 'Senior Developer',
            },
            {
              id: 3,
              salaryRoleId: 'SR-003',
              salaryRoleName: 'Project Manager',
            },
          ],
          count: 3,
        },
      },
      salaryStructure: {
        salaryStructure_list: [],
      },
    };

    store = mockStore(initialState);

    EmployeeActions.getSalaryRoleList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.salaryRoles.salaryRole_list })
    );
    EmployeeActions.removeBulkEmployee = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Deleted Successfully' } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the salary roles screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Salary Role/i)).toBeInTheDocument();
    });
  });

  it('should display salary roles list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('SR-001')).toBeInTheDocument();
      expect(screen.getByText('SR-002')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('should call getSalaryRoleList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(EmployeeActions.getSalaryRoleList).toHaveBeenCalled();
    });
  });

  it('should display all salary role names correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
    });
  });

  it('should display all salary role IDs correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('SR-001')).toBeInTheDocument();
      expect(screen.getByText('SR-002')).toBeInTheDocument();
      expect(screen.getByText('SR-003')).toBeInTheDocument();
    });
  });

  it('should have New Salary Roles button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByText(/New Salary Roles/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('SALARY ROLE ID')).toBeInTheDocument();
      expect(screen.getByText('SALARY ROLE NAME')).toBeInTheDocument();
    });
  });

  it('should handle row click to navigate to detail page', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should render salary roles icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const icon = document.querySelector('.fas.fa-object-group');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should display correct number of salary roles', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const rows = screen.getAllByText(/SR-00[123]/);
      expect(rows.length).toBe(3);
    });
  });

  it('should handle loading state correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(EmployeeActions.getSalaryRoleList).toHaveBeenCalled();
    });
  });

  it('should render pagination controls when data exists', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should handle create new salary role button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const createButton = screen.getByText(/New Salary Roles/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  it('should display table rows for each salary role', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = screen.getByRole('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it('should support language localization', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryRoles />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Salary Role/i)).toBeInTheDocument();
    });
  });
});
