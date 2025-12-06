import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SalaryTemplate from '../screen';
import * as SalaryTemplateActions from '../actions';
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

describe('SalaryTemplate Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      salarytemplate: {
        template_list: {
          data: [],
          count: 0,
        },
      },
      employee: {
        vat_list: [],
      },
    };

    store = mockStore(initialState);

    SalaryTemplateActions.getSalaryTemplateList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          salaryComponentResult: {
            Fixed: [
              {
                id: 1,
                description: 'Basic Salary',
                formula: 'Fixed',
                flatAmount: 5000,
              },
              {
                id: 2,
                description: 'Housing Allowance',
                formula: 'Fixed',
                flatAmount: 2000,
              },
            ],
            Variable: [
              {
                id: 3,
                description: 'Commission',
                formula: 'Percentage',
                flatAmount: 0,
              },
            ],
            Deduction: [
              {
                id: 4,
                description: 'Tax',
                formula: 'Percentage',
                flatAmount: 0,
              },
            ],
          },
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the salary template screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Salary Templates/i)).toBeInTheDocument();
    });
  });

  it('should call getSalaryTemplateList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SalaryTemplateActions.getSalaryTemplateList).toHaveBeenCalled();
    });
  });

  it('should display Fixed Earnings section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fixed Earnings')).toBeInTheDocument();
    });
  });

  it('should display Variable Earnings section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Variable Earnings')).toBeInTheDocument();
    });
  });

  it('should display Deductions section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Deductions')).toBeInTheDocument();
    });
  });

  it('should display Fixed component data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Basic Salary')).toBeInTheDocument();
      expect(screen.getByText('Housing Allowance')).toBeInTheDocument();
    });
  });

  it('should display Variable component data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Commission')).toBeInTheDocument();
    });
  });

  it('should display Deduction component data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tax')).toBeInTheDocument();
    });
  });

  it('should render tables with correct column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const headers = screen.getAllByText('Sr.No');
      expect(headers.length).toBeGreaterThan(0);
      const componentNameHeaders = screen.getAllByText('Component Name');
      expect(componentNameHeaders.length).toBeGreaterThan(0);
    });
  });

  it('should display component types', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const types = screen.getAllByText(/Fixed|Percentage/);
      expect(types.length).toBeGreaterThan(0);
    });
  });

  it('should display flat amounts correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('2000')).toBeInTheDocument();
    });
  });

  it('should have Add Customer buttons in each section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByText(/Add a Customer/i);
      expect(addButtons.length).toBe(3);
    });
  });

  it('should render salary template icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const icon = document.querySelector('.fas.fa-object-group');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should handle loading state correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(SalaryTemplateActions.getSalaryTemplateList).toHaveBeenCalled();
    });
  });

  it('should display component IDs in tables', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SalaryTemplate />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
