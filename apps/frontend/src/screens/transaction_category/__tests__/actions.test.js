import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';
import { TRANSACTION } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Transaction Category Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getTransactionList', () => {
		it('should dispatch TRANSACTION_LIST action on successful API call', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{
						transactionCategoryId: 1,
						transactionCategoryCode: 'TC001',
						transactionCategoryName: 'Revenue',
					},
					{
						transactionCategoryId: 2,
						transactionCategoryCode: 'TC002',
						transactionCategoryName: 'Expenses',
					},
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTransactionList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0].type).toBe(TRANSACTION.TRANSACTION_LIST);

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transaction/gettransactioncategory',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should dispatch hardcoded transaction list data', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload).toHaveLength(2);
			expect(dispatchedActions[0].payload[0].transactionCategoryId).toBe(2);
			expect(dispatchedActions[0].payload[1].transactionCategoryId).toBe(1);
		});

		it('should include parent transaction category in payload', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload[0].parentTransactionCategory).toBeDefined();
			expect(dispatchedActions[0].payload[0].parentTransactionCategory.transactionCategoryDescription).toBe('Loream Ipsume');
		});

		it('should include transaction type in payload', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload[0].transactionType).toBeDefined();
			expect(dispatchedActions[0].payload[0].transactionType.transactionTypeName).toBe('temp');
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch transactions');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionList())).rejects.toThrow('Failed to fetch transactions');
		});

		it('should handle network errors', async () => {
			const mockError = new Error('Network Error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionList())).rejects.toThrow('Network Error');
		});

		it('should return response on successful call', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1 }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTransactionList());

			expect(result.status).toBe(200);
			expect(result).toEqual(mockResponse);
		});

		it('should dispatch action even with empty API response', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0].payload).toHaveLength(2);
		});

		it('should handle 401 unauthorized errors', async () => {
			const mockError = new Error('Unauthorized');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionList())).rejects.toThrow('Unauthorized');
		});

		it('should handle 500 server errors', async () => {
			const mockError = new Error('Internal Server Error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionList())).rejects.toThrow('Internal Server Error');
		});
	});

	describe('deleteTransaction', () => {
		it('should call authApi with DELETE method and correct ID', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Transaction deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.deleteTransaction(1));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/transaction/deletetransactioncategory?id=1',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle deletion with different transaction IDs', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.deleteTransaction(42));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/transaction/deletetransactioncategory?id=42',
			});
		});

		it('should handle deletion errors', async () => {
			const mockError = new Error('Delete failed');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.deleteTransaction(1))).rejects.toThrow('Delete failed');
		});

		it('should handle deletion of non-existent transaction', async () => {
			const mockError = new Error('Transaction not found');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.deleteTransaction(999))).rejects.toThrow('Transaction not found');
		});

		it('should return response on successful deletion', async () => {
			const mockResponse = {
				status: 200,
				data: { success: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.deleteTransaction(5));

			expect(result.status).toBe(200);
			expect(result.data.success).toBe(true);
		});

		it('should handle deletion with string ID', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.deleteTransaction('abc123'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/transaction/deletetransactioncategory?id=abc123',
			});
		});

		it('should not dispatch any actions on deletion', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.deleteTransaction(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle 403 forbidden errors on deletion', async () => {
			const mockError = new Error('Forbidden: Insufficient permissions');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.deleteTransaction(1))).rejects.toThrow('Forbidden');
		});

		it('should handle network timeout on deletion', async () => {
			const mockError = new Error('Request timeout');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.deleteTransaction(1))).rejects.toThrow('Request timeout');
		});

		it('should handle deletion with zero ID', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.deleteTransaction(0));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/transaction/deletetransactioncategory?id=0',
			});
		});
	});

	describe('Error handling', () => {
		it('should propagate API errors correctly', async () => {
			const mockError = new Error('API Error');
			mockError.status = 400;
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getTransactionList())).rejects.toMatchObject({
				message: 'API Error',
			});
		});

		it('should handle connection refused errors', async () => {
			const mockError = new Error('Connection refused');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.deleteTransaction(1))).rejects.toThrow('Connection refused');
		});
	});
});
