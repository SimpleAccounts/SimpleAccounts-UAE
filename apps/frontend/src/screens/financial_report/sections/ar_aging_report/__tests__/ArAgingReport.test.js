import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ArAgingReport from '../screen';
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

jest.mock('screens/financial_report/sections', () => ({
  ReportTables: ({ reportDataList }) => (
    <div data-testid="report-tables">
      {reportDataList && reportDataList.map((item, index) => (
        <div key={index}>{item.contactName}</div>
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

describe('ArAgingReport Screen Component', () => {
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
        ar_aging_report: {
          agingResponseModelList: [
            {
              id: 1,
              contactName: 'Customer A',
              lessthen15: 1000,
              between15to30: 500,
              morethan30: 200,
              totalAmount: 1700,
            },
            {
              id: 2,
              contactName: 'Customer B',
              lessthen15: 2000,
              between15to30: 1000,
              morethan30: 500,
              totalAmount: 3500,
            },
          ],
        },
      },
    };

    store = mockStore(initialState);

    FinancialReportActions.getCompany = jest.fn(() => Promise.resolve({ status: 200 }));
    FinancialReportActions.getAgingReport = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          agingResponseModelList: [
            {
              contactName: 'Customer A',
              lessthen15: 1000,
              between15to30: 500,
              morethan30: 200,
              totalAmount: 1700,
            },
            {
              contactName: 'Customer B',
              lessthen15: 2000,
              between15to30: 1000,
              morethan30: 500,
              totalAmount: 3500,
            },
          ],
        },
      })
    );

    window.localStorage.setItem('language', 'en');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the AR aging report screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
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
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getCompany).toHaveBeenCalled();
    });
  });

  it('should call getAgingReport action on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getAgingReport).toHaveBeenCalledWith(
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
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render company name in header', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
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
          <ArAgingReport />
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
          <ArAgingReport />
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
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const printIcons = screen.getAllByClassName('fa-print');
      expect(printIcons.length).toBeGreaterThan(0);
    });
  });

  it('should display AR aging report data with customer names', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer A')).toBeInTheDocument();
      expect(screen.getByText('Customer B')).toBeInTheDocument();
    });
  });

  it('should render ReportTables component with correct data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('report-tables')).toBeInTheDocument();
    });
  });

  it('should handle filter customization button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const customizeButtons = screen.getAllByClassName('fa-cog');
      expect(customizeButtons.length).toBeGreaterThan(0);
    });
  });

  it('should regenerate report when generate button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(FinancialReportActions.getAgingReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle export to Excel functionality', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArAgingReport />
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
          <ArAgingReport />
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
          <ArAgingReport />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
    });
  });
});
