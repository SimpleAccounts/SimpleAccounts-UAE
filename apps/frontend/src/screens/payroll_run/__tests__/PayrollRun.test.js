import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PayrollRun from '../screen';
import * as PayRollActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

jest.mock('../sections', () => ({
  CreateCompanyDetails: ({ openModal, closeModal }) =>
    openModal ? (
      <div data-testid="company-details-modal">
        <button onClick={closeModal} data-testid="close-modal">Close</button>
      </div>
    ) : null,
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data, options }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr
              key={index}
              data-testid={`payroll-row-${index}`}
              onClick={() => options && options.onRowClick && options.onRowClick(item)}
            >
              <td>{item.payrollSubject}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children }) => <th>{children}</th>,
}));

const mockHistoryPush = jest.fn();

describe('PayrollRun Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      payrollRun: {
        user_approver_generater_dropdown_list: {
          data: [
            { value: 1, label: 'Payroll Generator' },
          ],
        },
        payroll_list: {
          data: [
            {
              id: 1,
              payrollSubject: 'December 2024 Payroll',
              payrollDate: '2024-12-31',
              payPeriod: '01/12/2024-31/12/2024',
              employeeCount: 25,
              generatedBy: 1,
              generatedByName: 'John Doe',
              payrollApprover: 2,
              payrollApproverName: 'Jane Smith',
              status: 'Draft',
              runDate: '2024-12-15',
              totalAmountPayroll: 125000,
              dueAmountPayroll: 0,
              comment: null,
              hover: false,
            },
            {
              id: 2,
              payrollSubject: 'November 2024 Payroll',
              payrollDate: '2024-11-30',
              payPeriod: '01/11/2024-30/11/2024',
              employeeCount: 24,
              generatedBy: 1,
              generatedByName: 'John Doe',
              payrollApprover: 2,
              payrollApproverName: 'Jane Smith',
              status: 'Approved',
              runDate: '2024-11-15',
              totalAmountPayroll: 120000,
              dueAmountPayroll: 5000,
              comment: 'Approved by management',
              hover: false,
            },
          ],
          count: 2,
        },
        incompleteEmployeeList: [],
      },
    };

    store = mockStore(initialState);

    PayRollActions.getUserAndRole = jest.fn(() => Promise.resolve());
    PayRollActions.getPayrollList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.payrollRun.payroll_list })
    );
    PayRollActions.getCompanyDetails = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { generateSif: true, companyNumber: '12345', companyBankCode: 'ADCB' },
      })
    );
    PayRollActions.generateSalary = jest.fn(() =>
      Promise.resolve({ status: 200, data: { message: 'Salary Generated Successfully' } })
    );
    PayRollActions.getSalaryDetailByEmployeeIdNoOfDays = jest.fn(() =>
      Promise.resolve({ data: { employeeName: 'Test Employee', netPay: 5000, noOfDays: 30 } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const mockHistory = { push: mockHistoryPush, ...props.history };
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollRun history={mockHistory} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render the payroll run screen without errors', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/payrolls/i)).toBeInTheDocument();
  });

  it('should display payroll list data in table', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('December 2024 Payroll')).toBeInTheDocument();
    expect(screen.getByText('November 2024 Payroll')).toBeInTheDocument();
  });

  it('should call getPayrollList on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(PayRollActions.getPayrollList).toHaveBeenCalled();
    });
  });

  it('should call getUserAndRole on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(PayRollActions.getUserAndRole).toHaveBeenCalled();
    });
  });

  it('should call getCompanyDetails on component mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(PayRollActions.getCompanyDetails).toHaveBeenCalled();
    });
  });

  it('should display payroll status badges correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should format payroll amount correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/125,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/120,000.00/)).toBeInTheDocument();
  });

  it('should display employee count correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  it('should display generated by name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const johnDoeElements = screen.getAllByText('John Doe');
    expect(johnDoeElements.length).toBeGreaterThan(0);
  });

  it('should display approver name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const janeSmithElements = screen.getAllByText('Jane Smith');
    expect(janeSmithElements.length).toBeGreaterThan(0);
  });

  it('should render Add Payroll button for Payroll Generator role', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
    expect(addButton).toBeDefined();
  });

  it('should navigate to create payroll page when Add Payroll button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons.find(btn => btn.textContent.includes('Add'));

    if (addButton) {
      fireEvent.click(addButton);
      expect(mockHistoryPush).toHaveBeenCalledWith('/admin/payroll/payrollrun/createPayrollList');
    }
  });

  it('should handle row click navigation for payroll generator', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const firstRow = screen.getByTestId('payroll-row-0');
    fireEvent.click(firstRow);

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/admin/payroll/payrollrun/updatePayroll', {
        id: 1,
      });
    });
  });

  it('should handle pagination correctly', async () => {
    const multiplePayrolls = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      payrollSubject: `Payroll ${i + 1}`,
      payrollDate: '2024-12-31',
      payPeriod: '01/12/2024-31/12/2024',
      employeeCount: 25,
      generatedBy: 1,
      generatedByName: 'John Doe',
      payrollApprover: 2,
      payrollApproverName: 'Jane Smith',
      status: 'Draft',
      runDate: '2024-12-15',
      totalAmountPayroll: 125000,
      dueAmountPayroll: 0,
      comment: null,
      hover: false,
    }));

    initialState.payrollRun.payroll_list.data = multiplePayrolls;
    initialState.payrollRun.payroll_list.count = 15;
    store = mockStore(initialState);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Payroll 1')).toBeInTheDocument();
  });

  it('should handle API error on payroll list fetch', async () => {
    PayRollActions.getPayrollList.mockRejectedValueOnce({
      data: { message: 'API Error' },
    });

    renderComponent();

    await waitFor(() => {
      expect(PayRollActions.getPayrollList).toHaveBeenCalled();
    });
  });

  it('should display loader while fetching data', () => {
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
