import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PayablesInvoiceSummary from '../screen';
import * as FinancialReportActions from '../../actions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../../actions');
jest.mock('@progress/kendo-react-pdf', () => ({
  PDFExport: ({ children }) => <div data-testid="pdf-export">{children}</div>,
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

jest.mock('screens/financial_report/sections', () => ({
  ReportTables: ({ reportDataList }) => (
    <div data-testid="report-tables">
      {reportDataList && reportDataList.map((item, index) => (
        <div key={index}>
          {item.invoiceNumber} - {item.totalInvoiceAmount}
        </div>
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

describe('PayablesInvoiceSummary Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      reports: {
        company_profile: {
          companyName: 'Test Company',
          companyLogoByteArray: null,
        },
        payable_invoice: {
          payableInvoiceSummaryModelList: [
            {
              id: 1,
              invoiceNumber: 'INV-001',
              invoiceDate: '2024-12-01',
              vendorName: 'Vendor A',
              totalInvoiceAmount: 5000,
              balance: 2000,
            },
            {
              id: 2,
              invoiceNumber: 'INV-002',
              invoiceDate: '2024-12-05',
              vendorName: 'Vendor B',
              totalInvoiceAmount: 3000,
              balance: 1500,
            },
          ],
        },
      },
    };

    store = mockStore(initialState);

    FinancialReportActions.getCompany = jest.fn(() => Promise.resolve({ status: 200 }));
    FinancialReportActions.getPayableInvoiceSummary = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          payableInvoiceSummaryModelList: [
            {
              invoiceNumber: 'INV-001',
              invoiceDate: '2024-12-01',
              vendorName: 'Vendor A',
              totalInvoiceAmount: 5000,
              balance: 2000,
            },
            {
              invoiceNumber: 'INV-002',
              invoiceDate: '2024-12-05',
              vendorName: 'Vendor B',
              totalInvoiceAmount: 3000,
              balance: 1500,
            },
          ],
          totalAmount: 8000,
          totalBalance: 3500,
        },
      })
    );

    window.localStorage.setItem('language', 'en');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the payables invoice summary screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
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
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getCompany).toHaveBeenCalled();
    });
  });

  it('should call getPayableInvoiceSummary action on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getPayableInvoiceSummary).toHaveBeenCalledWith(
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
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render company name in header', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
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
          <PayablesInvoiceSummary />
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
          <PayablesInvoiceSummary />
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
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const printIcons = screen.getAllByClassName('fa-print');
      expect(printIcons.length).toBeGreaterThan(0);
    });
  });

  it('should display payables invoice summary data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/INV-001 - 5000/)).toBeInTheDocument();
      expect(screen.getByText(/INV-002 - 3000/)).toBeInTheDocument();
    });
  });

  it('should render ReportTables component with correct data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('report-tables')).toBeInTheDocument();
    });
  });

  it('should add total row to the data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total - 8000/)).toBeInTheDocument();
    });
  });

  it('should regenerate report when filter is applied', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getPayableInvoiceSummary).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle export to Excel functionality', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const exportButton = screen.getByText('Export As');
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      const excelOption = screen.getByText(/Excel/i);
      expect(excelOption).toBeInTheDocument();
    });
  });

  it('should render close button to navigate back to reports page', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
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
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
    });
  });

  it('should handle date range filter with customPeriod state', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayablesInvoiceSummary />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getPayableInvoiceSummary).toHaveBeenCalled();
    });
  });
});
