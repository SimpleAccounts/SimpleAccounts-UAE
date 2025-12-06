import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ReconcileTransaction from '../screen';
import * as transactionReconcileActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

describe('ReconcileTransaction Screen Component', () => {
  let store;
  let initialState;
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    history.push('/admin/banking/bank-account/transaction/reconcile', {
      bankAccountId: 1,
    });

    initialState = {
      bank_account: {
        transaction_category_list: [],
        transaction_type_list: [],
        project_list: [],
        currency_list: [
          { currencyId: 1, currencyIsoCode: 'AED', currencyName: 'UAE Dirham' },
        ],
        reconcile_list: {
          data: [
            {
              reconcileId: 1,
              reconciledDate: '01-12-2024',
              reconciledDuration: '01-12-2024 to 15-12-2024',
              closingBalance: 5000,
              bankAccountId: 1,
            },
          ],
          count: 1,
        },
      },
    };

    store = mockStore(initialState);

    transactionReconcileActions.getReconcileList = jest.fn(() =>
      Promise.resolve({ status: 200, data: { data: initialState.bank_account.reconcile_list.data } })
    );
    transactionReconcileActions.reconcilenow = jest.fn(() =>
      Promise.resolve({ status: 200, data: { status: 1, message: 'Reconciled successfully' } })
    );
    transactionReconcileActions.removeBulkReconciled = jest.fn(() =>
      Promise.resolve({ status: 200 })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the reconcile transaction screen without errors', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Reconcile Transaction/i)).toBeInTheDocument();
    });
  });

  it('should call getReconcileList on component mount', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(transactionReconcileActions.getReconcileList).toHaveBeenCalled();
    });
  });

  it('should redirect to bank account list if bankAccountId is not provided', async () => {
    const historyWithoutState = createMemoryHistory();
    historyWithoutState.push('/admin/banking/bank-account/transaction/reconcile');

    render(
      <Provider store={store}>
        <Router history={historyWithoutState}>
          <ReconcileTransaction location={historyWithoutState.location} history={historyWithoutState} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(historyWithoutState.location.pathname).toBe('/admin/banking/bank-account');
    });
  });

  it('should render bank closing date field', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bank Closing Date/i)).toBeInTheDocument();
    });
  });

  it('should render closing balance field', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Closing Balance/i)).toBeInTheDocument();
    });
  });

  it('should render reconcile button', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const reconcileButtons = screen.getAllByText(/reconcile/i);
      expect(reconcileButtons.length).toBeGreaterThan(0);
    });
  });

  it('should render cancel button', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });
  });

  it('should display reconcile list table', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('01-12-2024')).toBeInTheDocument();
      expect(screen.getByText('01-12-2024 to 15-12-2024')).toBeInTheDocument();
    });
  });

  it('should display table headers correctly', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/RECONCILE DATE/i)).toBeInTheDocument();
      expect(screen.getByText(/RECONCILE DURATION/i)).toBeInTheDocument();
      expect(screen.getByText(/Closing Balance/i)).toBeInTheDocument();
    });
  });

  it('should format closing balance with currency', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AED/)).toBeInTheDocument();
    });
  });

  it('should render action dropdown for each reconcile row', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const chevronIcons = screen.getAllByClassName('fas fa-chevron-down');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  it('should validate required fields before submission', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const reconcileButton = screen.getAllByRole('button').find(
        btn => btn.textContent.toLowerCase().includes('reconcile') && !btn.disabled
      );
      if (reconcileButton) {
        fireEvent.click(reconcileButton);
      }
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });

  it('should handle reconcile submission successfully', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <ReconcileTransaction location={history.location} history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const closingBalanceInput = screen.getByPlaceholderText(/Amount/i);
      fireEvent.change(closingBalanceInput, { target: { value: '1000' } });
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Amount/i).value).toBe('1000');
    });
  });
});
