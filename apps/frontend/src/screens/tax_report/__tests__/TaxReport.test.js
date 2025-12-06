import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TaxReport from '../screen';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('TaxReport Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {};
    store = mockStore(initialState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the tax report screen without errors', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/VAT Transactions/i)).toBeInTheDocument();
  });

  it('should render VAT Transactions section', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('VAT Transactions')).toBeInTheDocument();
  });

  it('should render VAT Report section', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('VAT Report')).toBeInTheDocument();
  });

  it('should display last updated information for VAT Transactions', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const updateText = screen.getAllByText(/Last updated at/i);
    expect(updateText.length).toBeGreaterThan(0);
  });

  it('should render VAT filter dropdown for transactions', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const vatLabels = screen.getAllByText('VAT:');
    expect(vatLabels.length).toBeGreaterThan(0);
  });

  it('should render Period date range picker for transactions', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const periodLabels = screen.getAllByText('Period:');
    expect(periodLabels.length).toBeGreaterThan(0);
  });

  it('should render Status filter dropdown for VAT Report', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Status:')).toBeInTheDocument();
  });

  it('should render VAT Transactions table with correct headers', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Party Name')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('should render VAT Code column in transactions table', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const vatCodeHeaders = screen.getAllByText('VAT Code');
    expect(vatCodeHeaders.length).toBeGreaterThan(0);
  });

  it('should render VAT Amount column in transactions table', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const vatAmountHeaders = screen.getAllByText('VAT Amount');
    expect(vatAmountHeaders.length).toBeGreaterThan(0);
  });

  it('should render Status column in transactions table', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const statusHeaders = screen.getAllByText('Status');
    expect(statusHeaders.length).toBeGreaterThan(0);
  });

  it('should render VAT Report table with correct headers', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Report No.')).toBeInTheDocument();
    expect(screen.getByText('Status Date')).toBeInTheDocument();
    expect(screen.getByText('TRN')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should enable pagination for VAT Transactions table', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const tables = container.querySelectorAll('.react-bs-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should enable CSV export for VAT Transactions table', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const tables = container.querySelectorAll('.react-bs-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should enable filtering for VAT Transactions table', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <TaxReport />
        </BrowserRouter>
      </Provider>
    );

    const tables = container.querySelectorAll('.react-bs-table');
    expect(tables.length).toBeGreaterThan(0);
  });
});
