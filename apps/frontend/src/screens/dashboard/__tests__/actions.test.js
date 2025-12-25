import configureMockStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;
import * as actions from '../actions';
import { DASHBOARD } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Dashboard Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  describe('getCashFlowGraphData', () => {
    it('should dispatch pending and fulfilled actions on success', async () => {
      const mockResponse = {
        data: {
          inflow: [5000, 6000],
          outflow: [3000, 4000],
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getCashFlowGraphData(6));

      const dispatchedActions = store.getActions();
      // Check pending action
      expect(dispatchedActions[0].type).toBe('dashboard/getCashFlowGraphData/pending');
      // Check fulfilled action
      expect(dispatchedActions[1].type).toBe('dashboard/getCashFlowGraphData/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data);

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/transaction/getCashFlow?monthNo=6',
      });

      // RTK thunks resolve with the fulfilled action, not throw
      expect(result.type).toBe('dashboard/getCashFlowGraphData/fulfilled');
    });

    it('should dispatch rejected action on API failure', async () => {
      const mockError = new Error('API Error');
      authApi.mockRejectedValue(mockError);

      const result = await store.dispatch(actions.getCashFlowGraphData(6));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getCashFlowGraphData/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getCashFlowGraphData/rejected');
      expect(result.type).toBe('dashboard/getCashFlowGraphData/rejected');
    });
  });

  describe('getInvoiceGraphData', () => {
    it('should dispatch pending and fulfilled actions on success', async () => {
      const mockResponse = {
        data: { paid: 10, unpaid: 5 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getInvoiceGraphData(12));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getInvoiceGraphData/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getInvoiceGraphData/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data);

      expect(result.type).toBe('dashboard/getInvoiceGraphData/fulfilled');
      expect(result.payload).toEqual(mockResponse.data);
    });

    it('should call API with correct month count parameter', async () => {
      const mockResponse = { data: {} };
      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(actions.getInvoiceGraphData(3));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/invoice/getChartData?monthCount=3',
      });
    });
  });

  describe('getProfitLossReport', () => {
    it('should dispatch pending and fulfilled actions on success', async () => {
      const mockResponse = {
        data: { profit: 50000, loss: 20000 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getProfitLossReport(6));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getProfitLossReport/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getProfitLossReport/fulfilled');
      expect(result.type).toBe('dashboard/getProfitLossReport/fulfilled');
    });

    it('should dispatch rejected action on API errors', async () => {
      authApi.mockRejectedValue(new Error('Network error'));

      const result = await store.dispatch(actions.getProfitLossReport(6));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1].type).toBe('dashboard/getProfitLossReport/rejected');
      expect(result.type).toBe('dashboard/getProfitLossReport/rejected');
    });
  });

  describe('getBankAccountTypes', () => {
    it('should dispatch pending and fulfilled actions on successful response', async () => {
      const mockResponse = {
        status: 200,
        data: {
          data: [
            { id: 1, name: 'Savings' },
            { id: 2, name: 'Current' },
          ],
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getBankAccountTypes());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getBankAccountTypes/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getBankAccountTypes/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data.data);
      expect(result.type).toBe('dashboard/getBankAccountTypes/fulfilled');
    });

    it('should dispatch rejected action if status is not 200', async () => {
      const mockResponse = {
        status: 404,
        data: { data: [] },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getBankAccountTypes());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1].type).toBe('dashboard/getBankAccountTypes/rejected');
      expect(result.type).toBe('dashboard/getBankAccountTypes/rejected');
    });
  });

  describe('getBankAccountGraphData', () => {
    it('should dispatch pending and fulfilled actions with correct data', async () => {
      const mockResponse = {
        status: 200,
        data: {
          labels: ['Jan', 'Feb'],
          values: [1000, 2000],
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(
        actions.getBankAccountGraphData({ account: 1, daterange: 6 })
      );

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getBankAccountGraphData/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getBankAccountGraphData/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data);

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/bank/getBankChart?bankId=1&monthCount=6',
      });

      expect(result.type).toBe('dashboard/getBankAccountGraphData/fulfilled');
    });

    it('should dispatch rejected action on errors', async () => {
      authApi.mockRejectedValue(new Error('Database error'));

      const result = await store.dispatch(
        actions.getBankAccountGraphData({ account: 1, daterange: 6 })
      );

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1].type).toBe('dashboard/getBankAccountGraphData/rejected');
      expect(result.type).toBe('dashboard/getBankAccountGraphData/rejected');
    });
  });

  describe('getProfitAndLossData', () => {
    it('should dispatch pending and fulfilled actions', async () => {
      const mockResponse = {
        data: { netProfit: 30000 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getProfitAndLossData(12));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getProfitAndLossData/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getProfitAndLossData/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data);

      expect(result.type).toBe('dashboard/getProfitAndLossData/fulfilled');
    });

    it('should call API with correct URL', async () => {
      const mockResponse = { data: {} };
      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(actions.getProfitAndLossData(3));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/dashboardReport/profitandloss?monthNo=3',
      });
    });
  });

  describe('getTaxes', () => {
    it('should dispatch pending and fulfilled actions on success', async () => {
      const mockResponse = {
        data: {
          totalVAT: 5000,
          totalTax: 7000,
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTaxes(6));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getTaxes/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getTaxes/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data);
      expect(result.type).toBe('dashboard/getTaxes/fulfilled');
    });

    it('should use correct endpoint with month parameter', async () => {
      const mockResponse = { data: {} };
      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(actions.getTaxes(12));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/dashboardReport/getVatReport?monthNo=12',
      });
    });
  });

  describe('getExpensesGraphData', () => {
    it('should dispatch pending and fulfilled actions when status is 200', async () => {
      const mockResponse = {
        status: 200,
        data: {
          data: [
            { category: 'Office', amount: 5000 },
            { category: 'Travel', amount: 3000 },
          ],
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getExpensesGraphData());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getExpensesGraphData/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getExpensesGraphData/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data.data);
      expect(result.type).toBe('dashboard/getExpensesGraphData/fulfilled');
    });

    it('should dispatch rejected action if status is not 200', async () => {
      const mockResponse = {
        status: 500,
        data: { data: [] },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getExpensesGraphData());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1].type).toBe('dashboard/getExpensesGraphData/rejected');
      expect(result.type).toBe('dashboard/getExpensesGraphData/rejected');
    });
  });

  describe('getRevenuesGraphData', () => {
    it('should dispatch pending and fulfilled actions with invoice type 2', async () => {
      const mockResponse = {
        status: 200,
        data: {
          data: [{ month: 'Jan', amount: 10000 }],
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getRevenuesGraphData());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getRevenuesGraphData/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getRevenuesGraphData/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data.data);

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/invoice/getList?type=2',
      });

      expect(result.type).toBe('dashboard/getRevenuesGraphData/fulfilled');
    });

    it('should dispatch rejected action on network errors', async () => {
      authApi.mockRejectedValue(new Error('Connection timeout'));

      const result = await store.dispatch(actions.getRevenuesGraphData());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1].type).toBe('dashboard/getRevenuesGraphData/rejected');
      expect(result.type).toBe('dashboard/getRevenuesGraphData/rejected');
    });
  });

  describe('getTotalBalance', () => {
    it('should dispatch pending and fulfilled actions', async () => {
      const mockResponse = {
        data: { totalBalance: 100000 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTotalBalance());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('dashboard/getTotalBalance/pending');
      expect(dispatchedActions[1].type).toBe('dashboard/getTotalBalance/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockResponse.data);
      expect(result.type).toBe('dashboard/getTotalBalance/fulfilled');
    });

    it('should call correct API endpoint', async () => {
      const mockResponse = { data: {} };
      authApi.mockResolvedValue(mockResponse);

      await store.dispatch(actions.getTotalBalance());

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/bank/getTotalBalance',
      });
    });
  });

  describe('initialData', () => {
    it('should return a function that accepts dispatch', () => {
      const result = actions.initialData({});
      expect(typeof result).toBe('function');
    });

    it('should not dispatch any actions', () => {
      const dispatchSpy = jest.fn();
      const thunk = actions.initialData({});
      thunk(dispatchSpy);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });
});
