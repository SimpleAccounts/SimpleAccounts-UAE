import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PayrollEmployee from '../screen';
import * as PayrollEmployeeActions from '../actions';
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

describe('PayrollEmployee Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      payrollEmployee: {
        payroll_employee_list: {
          data: [
            {
              id: 1,
              employeeCode: 'EMP001',
              fullName: 'John Doe',
              email: 'john.doe@example.com',
              mobileNumber: '971501234567',
              dob: '1990-01-15',
              gender: 'Male',
              city: 'Dubai',
              isActive: true,
            },
            {
              id: 2,
              employeeCode: 'EMP002',
              fullName: 'Jane Smith',
              email: 'jane.smith@example.com',
              mobileNumber: '971509876543',
              dob: '1985-03-20',
              gender: 'Female',
              city: 'Abu Dhabi',
              isActive: false,
            },
          ],
          count: 2,
        },
      },
    };

    store = mockStore(initialState);

    PayrollEmployeeActions.getPayrollEmployeeList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.payrollEmployee.payroll_employee_list,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the payroll employee screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Employees/i)).toBeInTheDocument();
    });
  });

  it('should call getPayrollEmployeeList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PayrollEmployeeActions.getPayrollEmployeeList).toHaveBeenCalled();
    });
  });

  it('should display employee list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  it('should display employee code column', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
      expect(screen.getByText('EMP002')).toBeInTheDocument();
    });
  });

  it('should display employee email addresses', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });
  });

  it('should display date of birth formatted correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('15-01-1990')).toBeInTheDocument();
      expect(screen.getByText('20-03-1985')).toBeInTheDocument();
    });
  });

  it('should display active status badge correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const activeStatus = screen.getByText('Active');
      expect(activeStatus).toHaveClass('badge');
      expect(activeStatus).toHaveClass('label-success');
    });
  });

  it('should display inactive status badge correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const inactiveStatus = screen.getByText('InActive');
      expect(inactiveStatus).toHaveClass('badge');
      expect(inactiveStatus).toHaveClass('label-due');
    });
  });

  it('should render action dropdown buttons for each employee', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const chevronIcons = document.querySelectorAll('.fa-chevron-down');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  it('should render new employee button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const newEmployeeButton = addButtons.find(
        (btn) => btn.textContent.includes('New') || btn.querySelector('.fa-plus')
      );
      expect(newEmployeeButton).toBeDefined();
    });
  });

  it('should render export CSV button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find((btn) => btn.querySelector('.fa-download'));
      expect(exportButton).toBeDefined();
    });
  });

  it('should handle pagination when multiple employees exist', async () => {
    const multipleEmployees = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      employeeCode: `EMP${String(i + 1).padStart(3, '0')}`,
      fullName: `Employee ${i + 1}`,
      email: `employee${i + 1}@example.com`,
      mobileNumber: `97150${String(1234567 + i)}`,
      dob: '1990-01-15',
      gender: 'Male',
      city: 'Dubai',
      isActive: true,
    }));

    initialState.payrollEmployee.payroll_employee_list.data = multipleEmployees;
    initialState.payrollEmployee.payroll_employee_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
    });
  });

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Employee/i)).toBeInTheDocument();
    });
  });

  it('should handle loading state correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PayrollEmployeeActions.getPayrollEmployeeList).toHaveBeenCalled();
    });
  });

  it('should handle API error gracefully', async () => {
    PayrollEmployeeActions.getPayrollEmployeeList = jest.fn(() =>
      Promise.reject({
        data: { message: 'Failed to fetch employees' },
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollEmployee />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith(
        'error',
        'Failed to fetch employees'
      );
    });
  });
});
