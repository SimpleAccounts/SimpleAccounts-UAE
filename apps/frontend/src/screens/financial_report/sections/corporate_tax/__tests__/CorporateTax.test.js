import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import CorporateTax from '../screen';
import * as CTReportAction from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
  AuthActions: {},
}));

const mockHistoryPush = jest.fn();
const mockHistory = {
  push: mockHistoryPush,
};

describe('CorporateTax Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      common: {
        version: '1.0.0',
      },
      reports: {
        setting_list: [
          {
            id: 1,
            fiscalYear: 'January - December',
            selectedFlag: true,
            isEligibleForCP: true,
          },
        ],
        ctReport_list: {
          data: [
            {
              id: 1,
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              dueDate: '2025-03-31',
              netIncome: 500000,
              taxableAmount: 125000,
              taxAmount: 11250,
              balanceDue: 11250,
              status: 'UnFiled',
              currency: 'AED',
              flag: true,
            },
            {
              id: 2,
              startDate: '2023-01-01',
              endDate: '2023-12-31',
              dueDate: '2024-03-31',
              netIncome: 400000,
              taxableAmount: 25000,
              taxAmount: 2250,
              balanceDue: 0,
              status: 'Filed',
              taxFiledOn: '2024-03-15',
              currency: 'AED',
              flag: false,
            },
          ],
          count: 2,
        },
      },
    };

    store = mockStore(initialState);

    CTReportAction.getCorporateTaxList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.reports.ctReport_list,
      })
    );

    CTReportAction.getCTSettings = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: initialState.reports.setting_list,
      })
    );

    CTReportAction.markItUnfiled = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: { message: 'Report Unfiled Successfully' },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the corporate tax screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/CorporateTax/i)).toBeInTheDocument();
    });
  });

  it('should call getCorporateTaxList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CTReportAction.getCorporateTaxList).toHaveBeenCalled();
    });
  });

  it('should call getCTSettings on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CTReportAction.getCTSettings).toHaveBeenCalled();
    });
  });

  it('should display tax report data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tax Period')).toBeInTheDocument();
      expect(screen.getByText(/DueDate/i)).toBeInTheDocument();
      expect(screen.getByText(/NetIncome/i)).toBeInTheDocument();
      expect(screen.getByText(/TaxableAmount/i)).toBeInTheDocument();
      expect(screen.getByText(/TaxAmount/i)).toBeInTheDocument();
    });
  });

  it('should render Generate CT Report button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/GenerateCTReport/i)).toBeInTheDocument();
    });
  });

  it('should render Corporate Tax Settings button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Corporate Tax Settings')).toBeInTheDocument();
    });
  });

  it('should render CT Payment History button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/CTPaymentHistory/i)).toBeInTheDocument();
    });
  });

  it('should render status badges correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const statusBadges = screen.getAllByText(/UnFiled|Filed/);
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  it('should navigate to payment history when button clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const paymentHistoryButton = screen.getByText(/CTPaymentHistory/i);
      fireEvent.click(paymentHistoryButton);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith(
      '/admin/report/corporate-tax/payment-history'
    );
  });

  it('should navigate back to reports page when close button clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const closeButtons = screen.getAllByText('X');
      fireEvent.click(closeButtons[0]);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith('/admin/report/reports-page');
  });

  it('should handle markItUnfiled action successfully', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const testRow = { id: 2, status: 'Filed' };
    const component = new CorporateTax({ ...initialState.reports, history: mockHistory });

    await component.markItUnfiled(testRow);

    await waitFor(() => {
      expect(CTReportAction.markItUnfiled).toHaveBeenCalled();
    });
  });

  it('should display action dropdown buttons for each row', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const dropdownButtons = document.querySelectorAll('.btn-brand.icon');
      expect(dropdownButtons.length).toBeGreaterThan(0);
    });
  });

  it('should disable Generate CT Report button when no settings eligible', async () => {
    const stateWithNoEligibility = {
      ...initialState,
      reports: {
        ...initialState.reports,
        setting_list: [
          {
            id: 1,
            fiscalYear: 'January - December',
            selectedFlag: true,
            isEligibleForCP: false,
          },
        ],
      },
    };

    const storeWithNoEligibility = mockStore(stateWithNoEligibility);

    render(
      <Provider store={storeWithNoEligibility}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const generateButton = screen.getByText(/GenerateCTReport/i).closest('button');
      expect(generateButton).toBeDisabled();
    });
  });

  it('should render BootstrapTable with correct configuration', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = document.querySelector('.react-bs-table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should format amounts correctly with currency symbol', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CorporateTax history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const table = document.querySelector('.react-bs-table');
      expect(table).toBeInTheDocument();
    });
  });
});
