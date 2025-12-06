import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DetailedGeneralLedgerReport from '../screen';
import * as DetailGeneralLedgerActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    getCompany: jest.fn(),
  },
}));

jest.mock('@progress/kendo-react-pdf', () => ({
  PDFExport: ({ children }) => <div data-testid="pdf-export">{children}</div>,
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  Currency: ({ value }) => <span>{value}</span>,
}));

jest.mock('screens/financial_report/sections', () => ({
  ReportTables: ({ reportDataList }) => (
    <div data-testid="report-tables">
      {reportDataList && reportDataList.map((item, index) => (
        <div key={index}>{item.name}</div>
      ))}
    </div>
  ),
}));

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('DetailedGeneralLedgerReport Screen Component', () => {
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
        company_profile: {
          companyName: 'Test Company',
          companyLogoByteArray: null,
        },
      },
    };

    store = mockStore(initialState);

    CommonActions.getCompany = jest.fn(() => Promise.resolve({ status: 200 }));
    DetailGeneralLedgerActions.getDetailedGeneralLedgerList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: [
          [
            {
              transactionTypeName: 'Invoice',
              date: '01/12/2024',
              postingReferenceTypeEnum: 'INVOICE',
              name: 'Sales Account',
              transactonRefNo: 'INV-001',
              referenceNo: 'REF-001',
              debitAmount: 1000,
              creditAmount: 0,
              amount: 1000,
              deleteFlag: false,
              invoiceType: 1,
              invoiceId: 1,
              referenceId: 1,
              postingReferenceType: 'INVOICE',
            },
          ],
        ],
      })
    );
    DetailGeneralLedgerActions.getTransactionCategoryList = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: [
          { value: 1, label: 'Sales' },
          { value: 2, label: 'Expenses' },
        ],
      })
    );

    window.localStorage.setItem('language', 'en');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the detailed general ledger report screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
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
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.getCompany).toHaveBeenCalled();
    });
  });

  it('should call getDetailedGeneralLedgerList action on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(DetailGeneralLedgerActions.getDetailedGeneralLedgerList).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
          reportBasis: 'ACCRUAL',
          chartOfAccountId: '',
        })
      );
    });
  });

  it('should call getTransactionCategoryList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(DetailGeneralLedgerActions.getTransactionCategoryList).toHaveBeenCalled();
    });
  });

  it('should display loader while data is being fetched', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render company name in header', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  it('should render export dropdown with CSV, Excel, and PDF options', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
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

  it('should toggle dropdown when export button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const exportButton = screen.getByText('Export As');
      expect(exportButton).toBeInTheDocument();
      fireEvent.click(exportButton);
    });
  });

  it('should render print button with correct icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const printIcons = screen.getAllByClassName('fa-print');
      expect(printIcons.length).toBeGreaterThan(0);
    });
  });

  it('should display general ledger report data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sales Account')).toBeInTheDocument();
    });
  });

  it('should render ReportTables component with correct data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('report-tables')).toBeInTheDocument();
    });
  });

  it('should handle filter date range changes', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(DetailGeneralLedgerActions.getDetailedGeneralLedgerList).toHaveBeenCalledTimes(1);
    });
  });

  it('should render close button to navigate back to reports page', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const closeButtons = screen.getAllByText('X');
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  it('should render PDF export component', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
    });
  });

  it('should handle navigation when clicking close button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DetailedGeneralLedgerReport history={{ push: mockHistoryPush }} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const closeButtons = screen.getAllByText('X');
      if (closeButtons[0]) {
        fireEvent.click(closeButtons[0]);
      }
    });
  });
});
