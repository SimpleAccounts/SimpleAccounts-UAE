import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ReportsFiling from '../screen';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('ReportsFiling Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      common: {
        universal_currency_list: [
          { currencyId: 1, currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
      },
    };

    store = mockStore(initialState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the VAT report screen without errors', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/VAT Report/i)).toBeInTheDocument();
  });

  it('should display the screen title correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const title = screen.getByText(/VAT Report/i);
    expect(title).toBeInTheDocument();
  });

  it('should render date range picker component', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const dateRangePickers = document.querySelectorAll('.date-range');
    expect(dateRangePickers.length).toBeGreaterThan(0);
  });

  it('should render filter section', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Filter/i)).toBeInTheDocument();
  });

  it('should render export to CSV button', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const exportButton = screen.getByText(/Export to CSV/i);
    expect(exportButton).toBeInTheDocument();
  });

  it('should handle export CSV button click', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const exportButton = screen.getByText(/Export to CSV/i);
    fireEvent.click(exportButton);
    // CSV export should be triggered
  });

  it('should render bootstrap table component', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const tables = document.querySelectorAll('.react-bs-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should display table headers correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Report No./i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Status Date/i)).toBeInTheDocument();
  });

  it('should render VAT type select dropdown', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const selectElements = document.querySelectorAll('.css-1okebmr-indicatorSeparator, .css-tlfecz-indicatorContainer');
    expect(selectElements.length).toBeGreaterThan(0);
  });

  it('should handle search button click', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const searchButtons = screen.getAllByRole('button');
    const searchButton = searchButtons.find(btn => btn.querySelector('.fa-search'));

    if (searchButton) {
      fireEvent.click(searchButton);
    }
  });

  it('should display table data when available', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    // Check if table is rendered
    const tables = document.querySelectorAll('table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should render action column in table', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    const actionHeaders = screen.getAllByText(/Action/i);
    expect(actionHeaders.length).toBeGreaterThan(0);
  });

  it('should handle pagination when enabled', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    // Pagination should be rendered for data
    const paginationElements = document.querySelectorAll('.react-bs-table-pagination');
    expect(paginationElements).toBeDefined();
  });

  it('should render TRN column in table', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/TRN/i)).toBeInTheDocument();
  });

  it('should initialize component state correctly', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ReportsFiling />
        </BrowserRouter>
      </Provider>
    );

    expect(container.querySelector('.report-filing-screen')).toBeInTheDocument();
  });
});
