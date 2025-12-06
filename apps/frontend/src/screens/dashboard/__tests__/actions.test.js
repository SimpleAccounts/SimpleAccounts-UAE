import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
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
		it('should dispatch CASH_FLOW_GRAPH action on success', async () => {
			const mockResponse = {
				data: {
					inflow: [5000, 6000],
					outflow: [3000, 4000],
				},
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCashFlowGraphData(6));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.CASH_FLOW_GRAPH,
				payload: mockResponse.data,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transaction/getCashFlow?monthNo=6',
			});
		});

		it('should throw error on API failure', async () => {
			const mockError = new Error('API Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getCashFlowGraphData(6))
			).rejects.toThrow('API Error');
		});
	});

	describe('getInvoiceGraphData', () => {
		it('should dispatch INVOICE_GRAPH action on success', async () => {
			const mockResponse = {
				data: { paid: 10, unpaid: 5 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getInvoiceGraphData(12));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.INVOICE_GRAPH,
				payload: mockResponse.data,
			});

			expect(result).toEqual(mockResponse);
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
		it('should dispatch INVOICE_GRAPH action on success', async () => {
			const mockResponse = {
				data: { profit: 50000, loss: 20000 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProfitLossReport(6));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(DASHBOARD.INVOICE_GRAPH);
		});

		it('should handle API errors', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			await expect(
				store.dispatch(actions.getProfitLossReport(6))
			).rejects.toThrow('Network error');
		});
	});

	describe('getBankAccountTypes', () => {
		it('should dispatch BANK_ACCOUNT_TYPE action on successful response', async () => {
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

			await store.dispatch(actions.getBankAccountTypes());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.BANK_ACCOUNT_TYPE,
				payload: mockResponse.data.data,
			});
		});

		it('should not dispatch action if status is not 200', async () => {
			const mockResponse = {
				status: 404,
				data: { data: [] },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getBankAccountTypes());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});
	});

	describe('getBankAccountGraphData', () => {
		it('should dispatch BANK_ACCOUNT_GRAPH action with correct data', async () => {
			const mockResponse = {
				status: 200,
				data: {
					labels: ['Jan', 'Feb'],
					values: [1000, 2000],
				},
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getBankAccountGraphData(1, 6));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.BANK_ACCOUNT_GRAPH,
				payload: mockResponse.data,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/bank/getBankChart?bankId=1&monthCount=6',
			});
		});

		it('should handle errors gracefully', async () => {
			authApi.mockRejectedValue(new Error('Database error'));

			await expect(
				store.dispatch(actions.getBankAccountGraphData(1, 6))
			).rejects.toThrow('Database error');
		});
	});

	describe('getProfitAndLossData', () => {
		it('should dispatch PROFIT_LOSS action and return "1"', async () => {
			const mockResponse = {
				data: { netProfit: 30000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getProfitAndLossData(12));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.PROFIT_LOSS,
				payload: mockResponse.data,
			});

			expect(result).toBe('1');
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
		it('should dispatch TAXES action on success', async () => {
			const mockResponse = {
				data: {
					totalVAT: 5000,
					totalTax: 7000,
				},
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTaxes(6));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.TAXES,
				payload: mockResponse.data,
			});
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
		it('should dispatch EXPENSE_GRAPH action when status is 200', async () => {
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

			await store.dispatch(actions.getExpensesGraphData());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.EXPENSE_GRAPH,
				payload: mockResponse.data.data,
			});
		});

		it('should not dispatch if status is not 200', async () => {
			const mockResponse = {
				status: 500,
				data: { data: [] },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getExpensesGraphData());

			expect(store.getActions()).toHaveLength(0);
		});
	});

	describe('getRevenuesGraphData', () => {
		it('should dispatch REVENUE_GRAPH action with invoice type 2', async () => {
			const mockResponse = {
				status: 200,
				data: {
					data: [{ month: 'Jan', amount: 10000 }],
				},
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRevenuesGraphData());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DASHBOARD.REVENUE_GRAPH,
				payload: mockResponse.data.data,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/invoice/getList?type=2',
			});
		});

		it('should handle network errors', async () => {
			authApi.mockRejectedValue(new Error('Connection timeout'));

			await expect(
				store.dispatch(actions.getRevenuesGraphData())
			).rejects.toThrow('Connection timeout');
		});
	});

	describe('getTotalBalance', () => {
		it('should return response without dispatching action', async () => {
			const mockResponse = {
				data: { totalBalance: 100000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTotalBalance());

			expect(result).toEqual(mockResponse);
			expect(store.getActions()).toHaveLength(0);
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
