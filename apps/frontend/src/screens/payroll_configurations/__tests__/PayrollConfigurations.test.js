import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PayrollConfigurations from '../screen';
import * as DesignationActions from '../../designation/actions';
import * as SalaryRolesActions from '../../salaryRoles/actions';
import * as SalaryStructureActions from '../../salaryStructure/actions';
import * as PayrollRunActions from '../../payroll_run/actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../../designation/actions');
jest.mock('../../salaryRoles/actions');
jest.mock('../../salaryStructure/actions');
jest.mock('../../payroll_run/actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
    fillManDatoryDetails: jest.fn(),
  },
}));

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('PayrollConfigurations Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      employeeDesignation: {
        designation_list: {
          data: [
            {
              id: 1,
              designationId: 'DES001',
              designationName: 'Manager',
            },
            {
              id: 2,
              designationId: 'DES002',
              designationName: 'Developer',
            },
          ],
          count: 2,
        },
      },
      salaryRoles: {
        salaryRole_list: {
          data: [
            {
              salaryRoleId: 1,
              salaryRoleName: 'Executive',
            },
            {
              salaryRoleId: 2,
              salaryRoleName: 'Staff',
            },
          ],
          count: 2,
        },
      },
      salaryStructure: {
        salaryStructure_list: {
          data: [
            {
              salaryStructureId: 1,
              salaryStructureType: 'Monthly',
              salaryStructureName: 'Standard Monthly',
            },
          ],
          count: 1,
        },
      },
      common: {
        company_details: {
          generateSif: true,
        },
      },
      auth: {
        profile: {
          companyName: 'Test Company',
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

    SalaryRolesActions.getSalaryRoleList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.salaryRoles.salaryRole_list,
      })
    );

    SalaryStructureActions.getSalaryStructureList = jest.fn(() =>
      Promise.resolve({
        status: 200,
      })
    );

    SalaryStructureActions.getSalaryList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          data: [
            {
              id: 1,
              componentCode: 'SC001',
              description: 'Basic Salary',
              componentType: 'Earning',
              calculationType: 1,
            },
          ],
          count: 1,
        },
      })
    );

    PayrollRunActions.getCompanyDetails = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          companyNumber: '1234567890123',
          companyBankCode: '123456789',
        },
      })
    );

    PayrollRunActions.updateCompany = jest.fn(() =>
      Promise.resolve({
        status: 200,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the payroll configurations screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/PayrollConfigurations/i)).toBeInTheDocument();
    });
  });

  it('should call initialization methods on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(DesignationActions.getEmployeeDesignationList).toHaveBeenCalled();
      expect(SalaryStructureActions.getSalaryList).toHaveBeenCalled();
      expect(PayrollRunActions.getCompanyDetails).toHaveBeenCalled();
    });
  });

  it('should render Employee Designation tab', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/EmployeeDesignation/i)).toBeInTheDocument();
    });
  });

  it('should render Company Details tab when generateSif is true', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/CompanyDetails/i)).toBeInTheDocument();
    });
  });

  it('should render Salary Component tab', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/SalaryComponent/i)).toBeInTheDocument();
    });
  });

  it('should display designation list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
  });

  it('should render New Designation button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const newDesignationButton = buttons.find((btn) =>
        btn.textContent.includes('NewDesignation')
      );
      expect(newDesignationButton).toBeDefined();
    });
  });

  it('should switch to Salary Component tab when clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const salaryComponentTab = screen.getByText(/SalaryComponent/i);
      fireEvent.click(salaryComponentTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/ComponentId/i)).toBeInTheDocument();
    });
  });

  it('should display salary component data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const salaryComponentTab = screen.getByText(/SalaryComponent/i);
      fireEvent.click(salaryComponentTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Basic Salary')).toBeInTheDocument();
    });
  });

  it('should render New Salary Component button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const salaryComponentTab = screen.getByText(/SalaryComponent/i);
      fireEvent.click(salaryComponentTab);
    });

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const newComponentButton = buttons.find((btn) =>
        btn.textContent.includes('NewSalaryComponent')
      );
      expect(newComponentButton).toBeDefined();
    });
  });

  it('should switch to Company Details tab when clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const companyDetailsTab = screen.getByText(/CompanyDetails/i);
      fireEvent.click(companyDetailsTab);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/company_num/i)).toBeInTheDocument();
    });
  });

  it('should validate company number field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const companyDetailsTab = screen.getByText(/CompanyDetails/i);
      fireEvent.click(companyDetailsTab);
    });

    await waitFor(() => {
      const companyNumberInput = screen.getByLabelText(/company_num/i);
      expect(companyNumberInput).toHaveAttribute('maxLength', '13');
      expect(companyNumberInput).toHaveAttribute('minLength', '13');
    });
  });

  it('should validate company bank code field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const companyDetailsTab = screen.getByText(/CompanyDetails/i);
      fireEvent.click(companyDetailsTab);
    });

    await waitFor(() => {
      const companyBankCodeInput = screen.getByLabelText(/com_code/i);
      expect(companyBankCodeInput).toHaveAttribute('maxLength', '9');
      expect(companyBankCodeInput).toHaveAttribute('minLength', '9');
    });
  });

  it('should render Save button in Company Details tab', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const companyDetailsTab = screen.getByText(/CompanyDetails/i);
      fireEvent.click(companyDetailsTab);
    });

    await waitFor(() => {
      const saveButtons = screen.getAllByText(/Save/i);
      expect(saveButtons.length).toBeGreaterThan(0);
    });
  });

  it('should handle API error gracefully', async () => {
    DesignationActions.getEmployeeDesignationList = jest.fn(() =>
      Promise.reject({
        data: { message: 'Failed to fetch designations' },
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollConfigurations />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith(
        'error',
        'Failed to fetch designations'
      );
    });
  });
});
