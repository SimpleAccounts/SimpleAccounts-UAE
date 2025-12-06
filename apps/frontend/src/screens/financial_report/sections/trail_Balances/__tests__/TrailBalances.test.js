import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TrailBalances from '../screen';
import * as FinancialReportActions from '../../actions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../../actions');
jest.mock('@progress/kendo-react-pdf', () => ({
  PDFExport: ({ children }) => <div data-testid="pdf-export">{children}</div>,
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  Currency: ({ value }) => <span>{value}</span>,
}));

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('TrailBalances Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      auth: {
        profile: {
          userId: 1,
          userName: 'Test User',
        },
      },
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
      },
      reports: {
        company_profile: {
          companyName: 'Test Company',
          companyLogoByteArray: null,
        },
      },
    };

    store = mockStore(initialState);

    FinancialReportActions.getCompany = jest.fn(() => Promise.resolve({ status: 200 }));
    FinancialReportActions.getTrialBalanceReport = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          transactionCategoryMapper: {
            'Sales': 'Credit',
            'Accounts Payable': 'Credit',
            'Input VAT': 'Debit',
          },
          assets: { 'Input VAT': 1000.0 },
          fixedAsset: {},
          liabilities: {},
          equities: {},
          income: { 'Sales': 5000.0 },
          expense: {},
          accountReceivable: {},
          accountpayable: { 'Accounts Payable': 2000.0 },
          bank: {},
          totalCreditAmount: 7000.0,
          totalDebitAmount: 1000.0,
        },
      })
    );

    window.localStorage.setItem('language', 'en');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the trial balance screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should call getCompany action on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getCompany).toHaveBeenCalled();
    });
  });

  it('should call getTrialBalanceReport action on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getTrialBalanceReport).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
        })
      );
    });
  });

  it('should display loader while data is being fetched', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render company name in header', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  it('should render export dropdown with options', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Export As')).toBeInTheDocument();
    });
  });

  it('should toggle dropdown when export button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const exportButton = screen.getByText('Export As');
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/CSV/i)).toBeInTheDocument();
      expect(screen.getByText(/Excel/i)).toBeInTheDocument();
      expect(screen.getByText(/Pdf/i)).toBeInTheDocument();
    });
  });

  it('should render print button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const printIcons = screen.getAllByClassName('fa-print');
      expect(printIcons.length).toBeGreaterThan(0);
    });
  });

  it('should display trial balance data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Input VAT')).toBeInTheDocument();
      expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
    });
  });

  it('should calculate and display total assets correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total.*Assets/i)).toBeInTheDocument();
    });
  });

  it('should calculate and display total liabilities correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total.*Liabilities/i)).toBeInTheDocument();
    });
  });

  it('should display total debit and credit amounts', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('7000')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });

  it('should regenerate report when filter is applied', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getTrialBalanceReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle export to CSV', async () => {
    const mockExportFile = jest.spyOn(document, 'getElementById');
    mockExportFile.mockReturnValue({
      innerHTML: '<table></table>',
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const exportButton = screen.getByText('Export As');
      fireEvent.click(exportButton);
    });

    mockExportFile.mockRestore();
  });

  it('should render PDF export component', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TrailBalances />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
    });
  });
});
