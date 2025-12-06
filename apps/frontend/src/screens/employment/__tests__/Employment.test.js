import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Employment from '../screen';
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

describe('Employment Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      employee: {
        employee_list: {
          data: [
            {
              id: 1,
              fullName: 'Ahmed Ali',
              dob: '1988-05-12',
              referenceCode: 'REF001',
              email: 'ahmed.ali@example.com',
              vatRegestationNo: 'VAT123456789',
            },
            {
              id: 2,
              fullName: 'Sarah Mohammed',
              dob: '1992-08-25',
              referenceCode: 'REF002',
              email: 'sarah.mohammed@example.com',
              vatRegestationNo: 'VAT987654321',
            },
          ],
          count: 2,
        },
        vat_list: [],
      },
    };

    store = mockStore(initialState);

    EmployeeActions.getEmployeeList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.employee.employee_list,
      })
    );

    EmployeeActions.removeBulkEmployee = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Employees Deleted Successfully' },
      })
    );

    EmployeeActions.getCurrencyList = jest.fn(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the employment screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Employment/i)).toBeInTheDocument();
    });
  });

  it('should call getEmployeeList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(EmployeeActions.getEmployeeList).toHaveBeenCalled();
    });
  });

  it('should display employee list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ahmed Ali')).toBeInTheDocument();
      expect(screen.getByText('Sarah Mohammed')).toBeInTheDocument();
    });
  });

  it('should display employee email addresses', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('ahmed.ali@example.com')).toBeInTheDocument();
      expect(screen.getByText('sarah.mohammed@example.com')).toBeInTheDocument();
    });
  });

  it('should display reference codes', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('REF001')).toBeInTheDocument();
      expect(screen.getByText('REF002')).toBeInTheDocument();
    });
  });

  it('should display VAT registration numbers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('VAT123456789')).toBeInTheDocument();
      expect(screen.getByText('VAT987654321')).toBeInTheDocument();
    });
  });

  it('should render New Employment button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/New Employment/i)).toBeInTheDocument();
    });
  });

  it('should render filter section with name input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Name');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('type', 'text');
    });
  });

  it('should render filter section with email input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'text');
    });
  });

  it('should handle name filter input change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.change(nameInput, { target: { value: 'Ahmed' } });
      expect(nameInput.value).toBe('Ahmed');
    });
  });

  it('should handle email filter input change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'ahmed@test.com' } });
      expect(emailInput.value).toBe('ahmed@test.com');
    });
  });

  it('should render search button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find((btn) => btn.querySelector('.fa-search'));
      expect(searchButton).toBeDefined();
    });
  });

  it('should render refresh button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const refreshButtons = screen.getAllByRole('button');
      const refreshButton = refreshButtons.find((btn) => btn.querySelector('.fa-refresh'));
      expect(refreshButton).toBeDefined();
    });
  });

  it('should handle search button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find((btn) => btn.querySelector('.fa-search'));
      if (searchButton) {
        fireEvent.click(searchButton);
        expect(EmployeeActions.getEmployeeList).toHaveBeenCalled();
      }
    });
  });

  it('should handle clear all filters', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.change(nameInput, { target: { value: 'Test' } });
    });

    await waitFor(() => {
      const refreshButtons = screen.getAllByRole('button');
      const refreshButton = refreshButtons.find((btn) => btn.querySelector('.fa-refresh'));
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });
  });

  it('should handle API error gracefully', async () => {
    EmployeeActions.getEmployeeList = jest.fn(() =>
      Promise.reject({
        data: { message: 'Failed to fetch employees' },
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
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

  it('should render table with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Employment />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Date Of Birth')).toBeInTheDocument();
      expect(screen.getByText('Reference Code')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('VAT Registration No')).toBeInTheDocument();
    });
  });
});
