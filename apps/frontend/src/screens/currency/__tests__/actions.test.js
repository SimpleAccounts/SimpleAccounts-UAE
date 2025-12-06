import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { CURRENCY } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Currency Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getCurrencyList', () => {
		it('should dispatch CURRENCY_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 1.0 },
					{ code: 'USD', name: 'US Dollar', symbol: '$', rate: 3.67 },
					{ code: 'EUR', name: 'Euro', symbol: '€', rate: 4.02 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CURRENCY.CURRENCY_LIST,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(result).toEqual(mockResponse);
		});

		it('should call API with correct URL', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency',
			});
		});

		it('should return response when successful', async () => {
			const mockResponse = {
				status: 200,
				data: [{ code: 'AED', name: 'UAE Dirham' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCurrencyList());

			expect(result.status).toBe(200);
			expect(result.data).toHaveLength(1);
		});

		it('should handle empty currency list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});

		it('should handle API errors gracefully', async () => {
			const mockError = new Error('Failed to fetch currencies');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Failed to fetch currencies'
			);
		});

		it('should handle network timeout errors', async () => {
			const mockError = new Error('Network timeout');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Network timeout'
			);
		});

		it('should dispatch action only on status 200', async () => {
			const mockResponse = {
				status: 201,
				data: [{ code: 'AED' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			expect(store.getActions()).toHaveLength(0);
		});

		it('should handle large currency dataset', async () => {
			const largeCurrencyList = Array.from({ length: 150 }, (_, i) => ({
				code: `CUR${i}`,
				name: `Currency ${i}`,
				symbol: `$${i}`,
				rate: (i + 1) * 0.5,
			}));

			const mockResponse = {
				status: 200,
				data: largeCurrencyList,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toHaveLength(150);
		});

		it('should handle currency data with all properties', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{
						id: 1,
						code: 'AED',
						name: 'UAE Dirham',
						symbol: 'د.إ',
						rate: 1.0,
						isActive: true,
						isBaseCurrency: true,
						country: 'United Arab Emirates',
						decimalPlaces: 2,
					},
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data[0]).toHaveProperty('code', 'AED');
			expect(dispatchedActions[0].payload.data[0]).toHaveProperty('rate', 1.0);
			expect(dispatchedActions[0].payload.data[0]).toHaveProperty('isActive', true);
		});

		it('should handle currency data with null values', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{
						code: 'XXX',
						name: 'Unknown',
						symbol: null,
						rate: null,
					},
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data[0].symbol).toBeNull();
		});

		it('should handle multiple currencies with different rates', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ code: 'AED', rate: 1.0 },
					{ code: 'USD', rate: 3.67 },
					{ code: 'EUR', rate: 4.02 },
					{ code: 'GBP', rate: 4.65 },
					{ code: 'SAR', rate: 0.98 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCurrencyList());

			expect(result.data).toHaveLength(5);
			expect(result.data.find((c) => c.code === 'USD').rate).toBe(3.67);
		});

		it('should handle unauthorized errors', async () => {
			const mockError = new Error('Unauthorized access');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Unauthorized access'
			);
		});

		it('should handle server errors', async () => {
			const mockError = new Error('Internal server error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Internal server error'
			);
		});

		it('should dispatch action with correct payload structure', async () => {
			const mockResponse = {
				status: 200,
				data: [{ code: 'AED', name: 'UAE Dirham' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toHaveProperty('type');
			expect(dispatchedActions[0]).toHaveProperty('payload');
			expect(dispatchedActions[0].payload).toHaveProperty('data');
		});

		it('should call authApi exactly once', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledTimes(1);
		});
	});

	describe('Action error handling', () => {
		it('should propagate API errors correctly', async () => {
			const apiError = new Error('API Error');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(actions.getCurrencyList()(dispatch)).rejects.toThrow('API Error');
		});

		it('should handle promise rejection', async () => {
			authApi.mockRejectedValue(new Error('Promise rejected'));

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Promise rejected'
			);
		});
	});
});
