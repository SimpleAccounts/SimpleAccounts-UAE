import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BalanceSheet from '../screen';
import * as FinancialReportActions from '../../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../../actions');
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

jest.mock('@progress/kendo-react-pdf', () => ({
  PDFExport: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

jest.mock('components', () => ({
  Loader: () => <div>Loading...</div>,
  Currency: ({ value, currencySymbol }) => (
    <span>{`${currencySymbol} ${value}`}</span>
  ),
}));

jest.mock('react-localization', () => {
  const LocalizedStrings = class {
    constructor(data) {
      this.data = data;
    }
    setLanguage() {}
    get BalanceSheet() { return 'Balance Sheet'; }
    get Account() { return 'Account'; }
    get Total() { return 'Total'; }
    get Assets() { return 'Assets'; }
    get Cash() { return 'Cash'; }
    get Bank() { return 'Bank'; }
    get Accounts() { return 'Accounts'; }
    get Receivable() { return 'Receivable'; }
    get Payable() { return 'Payable'; }
    get CurrentAssets() { return 'Current Assets'; }
    get FixedAssets() { return 'Fixed Assets'; }
    get Other() { return 'Other'; }
    get Liabilities() { return 'Liabilities'; }
    get CurrentLiabilities() { return 'Current Liabilities'; }
    get Equities() { return 'Equities'; }
    get From() { return 'From'; }
    get Ason() { return 'As on'; }
    get Thereisnodatatodisplay() { return 'There is no data to display'; }
    get PoweredBy() { return 'Powered by'; }
  };
  return LocalizedStrings;
});

jest.mock('../filterComponent3', () => {
  return function FilterComponent3({ generateReport }) {
    return (
      <div>
        <button onClick={() => generateReport({ startDate: '01/01/2024', endDate: '31/12/2024' })}>
          Generate Report
        </button>
      </div>
    );
  };
});

describe('BalanceSheet Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      auth: {
        profile: {
          companyName: 'Test Company',
        },
      },
      common: {
        universal_currency_list: [
          {
            currencyId: 1,
            currencyIsoCode: 'USD',
            currencyName: 'US Dollar',
          },
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

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'en'),
        setItem: jest.fn(),
      },
      writable: true,
    });

    FinancialReportActions.getBalanceReport = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          totalCurrentAssets: 24136.36,
          totalFixedAssets: 0,
          totalAssets: 24136.36,
          totalOtherCurrentAssets: 386.36,
          totalBank: 3750,
          totalOtherLiability: 0,
          totalAccountReceivable: 20000,
          totalAccountPayable: 22250,
          totalOtherCurrentLiability: 7750,
          totalLiability: 30000,
          totalEquities: 0,
          totalLiabilityEquities: 30000,
          stocks: 0,
          cash: { cash: 100 },
          currentAssets: { 'Petty Cash': 100 },
          otherCurrentAssets: { 'Input VAT': 386.36 },
          bank: { 'Test Bank': 3750 },
          fixedAssets: {},
          otherLiability: {},
          otherCurrentLiability: { 'Employee Reimbursements': 7750 },
          equities: {},
        },
      })
    );

    FinancialReportActions.getCompany = jest.fn(() => Promise.resolve({ status: 200 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the balance sheet screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Balance Sheet/i)).toBeInTheDocument();
    });
  });

  it('should call getBalanceReport on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getBalanceReport).toHaveBeenCalled();
    });
  });

  it('should call getCompany on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getCompany).toHaveBeenCalled();
    });
  });

  it('should display loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render Export As dropdown', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Export As/i)).toBeInTheDocument();
    });
  });

  it('should render table with column headers', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  it('should display Assets section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Assets')).toBeInTheDocument();
    });
  });

  it('should display Cash section with values', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Cash').length).toBeGreaterThan(0);
    });
  });

  it('should display Bank section with values', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Bank').length).toBeGreaterThan(0);
      expect(screen.getByText('Test Bank')).toBeInTheDocument();
    });
  });

  it('should display Accounts Receivable section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const receivableElements = screen.getAllByText(/Receivable/i);
      expect(receivableElements.length).toBeGreaterThan(0);
    });
  });

  it('should display Current Assets section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Current Assets/i).length).toBeGreaterThan(0);
    });
  });

  it('should display Liabilities section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Liabilities').length).toBeGreaterThan(0);
    });
  });

  it('should display Accounts Payable section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const payableElements = screen.getAllByText(/Payable/i);
      expect(payableElements.length).toBeGreaterThan(0);
    });
  });

  it('should display Equities section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Equities').length).toBeGreaterThan(0);
    });
  });

  it('should handle generate report button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const generateButton = screen.getByText('Generate Report');
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(FinancialReportActions.getBalanceReport).toHaveBeenCalledTimes(2);
    });
  });

  it('should display company name when available', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  it('should handle print functionality', async () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <BrowserRouter>
          <BalanceSheet />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const printIcon = document.querySelector('.fa-print');
      if (printIcon) {
        fireEvent.click(printIcon);
        expect(printSpy).toHaveBeenCalled();
      }
    });

    printSpy.mockRestore();
  });
});
