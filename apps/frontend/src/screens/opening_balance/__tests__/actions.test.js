import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';
import { OPENING_BALANCE } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Opening Balance Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getTransactionCategoryList', () => {
		it('should dispatch TRANSACTION_CATEGORY_LIST action on successful API call', async () => {
			const mockCategories = [
				{ id: 1, name: 'Assets', code: 'AST' },
				{ id: 2, name: 'Liabilities', code: 'LIA' },
				{ id: 3, name: 'Equity', code: 'EQT' },
			];

			const mockResponse = {
				status: 200,
				data: {
					data: mockCategories,
				},
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionCategoryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
				payload: mockResponse.data,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactioncategory/getList?paginationDisable=true',
			});
		});

		it('should not dispatch action on non-200 status', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionCategoryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch categories');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionCategoryList())).rejects.toThrow('Failed to fetch categories');
		});

		it('should handle empty response data', async () => {
			const mockResponse = {
				status: 200,
				data: {
					data: [],
				},
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionCategoryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});
	});

	describe('getOpeningBalanceList', () => {
		it('should dispatch OPENING_BALANCE_LIST action with default parameters', async () => {
			const mockBalances = [
				{ id: 1, categoryId: 1, balance: 10000 },
				{ id: 2, categoryId: 2, balance: 5000 },
			];

			const mockResponse = {
				status: 200,
				data: mockBalances,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getOpeningBalanceList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: OPENING_BALANCE.OPENING_BALANCE_LIST,
				payload: mockBalances,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should build URL with pagination parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const params = {
				pageNo: 1,
				pageSize: 10,
				order: 'asc',
				sortingCol: 'name',
				paginationDisable: false,
			};

			await store.dispatch(actions.getOpeningBalanceList(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transactionCategoryBalance/list?pageNo=1&pageSize=10&order=asc&sortingCol=name&paginationDisable=false',
			});
		});

		it('should handle missing pagination parameters with empty strings', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceList({}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transactionCategoryBalance/list?pageNo=&pageSize=&order=&sortingCol=&paginationDisable=false',
			});
		});

		it('should dispatch action even when condition is always true', async () => {
			const mockBalances = [{ id: 1, balance: 1000 }];

			const mockResponse = {
				status: 404,
				data: mockBalances,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0].payload).toEqual(mockBalances);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch balances');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getOpeningBalanceList({}))).rejects.toThrow('Failed to fetch balances');
		});

		it('should return response on successful call', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, balance: 5000 }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getOpeningBalanceList({}));

			expect(result.status).toBe(200);
			expect(result.data).toHaveLength(1);
		});

		it('should handle pagination disable parameter', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceList({
				paginationDisable: true,
			}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('paginationDisable=true'),
			});
		});

		it('should handle partial pagination parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceList({
				pageNo: 2,
				pageSize: 20,
			}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transactionCategoryBalance/list?pageNo=2&pageSize=20&order=&sortingCol=&paginationDisable=false',
			});
		});

		it('should handle sorting parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceList({
				order: 'desc',
				sortingCol: 'balance',
			}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('order=desc&sortingCol=balance'),
			});
		});
	});

	describe('getOpeningBalanceById', () => {
		it('should call authApi with correct ID parameter', async () => {
			const mockResponse = {
				status: 200,
				data: {
					id: 1,
					categoryId: 1,
					balance: 10000,
					currency: 'AED',
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getOpeningBalanceById(1));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/openingbalance/getById?id=1',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle different ID types', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 42 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceById(42));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/openingbalance/getById?id=42',
			});
		});

		it('should handle string ID', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 'abc123' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceById('abc123'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/openingbalance/getById?id=abc123',
			});
		});

		it('should handle API errors when fetching by ID', async () => {
			const mockError = new Error('Opening balance not found');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getOpeningBalanceById(999))).rejects.toThrow('Opening balance not found');
		});

		it('should not dispatch any actions', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getOpeningBalanceById(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should return full response object', async () => {
			const mockResponse = {
				status: 200,
				data: {
					id: 1,
					balance: 5000,
					metadata: {
						createdAt: '2024-01-01',
					},
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getOpeningBalanceById(1));

			expect(result.data.metadata.createdAt).toBe('2024-01-01');
		});

		it('should handle network errors', async () => {
			const mockError = new Error('Network Error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getOpeningBalanceById(1))).rejects.toThrow('Network Error');
		});
	});

	describe('Error handling', () => {
		it('should handle 401 unauthorized errors', async () => {
			const mockError = new Error('Unauthorized');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionCategoryList())).rejects.toThrow('Unauthorized');
		});

		it('should handle 500 server errors', async () => {
			const mockError = new Error('Internal Server Error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getOpeningBalanceList({}))).rejects.toThrow('Internal Server Error');
		});

		it('should handle timeout errors', async () => {
			const mockError = new Error('Request timeout');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getOpeningBalanceById(1))).rejects.toThrow('Request timeout');
		});
	});
});
