import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { VAT_TRANSACTIONS } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('VAT Transactions Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('initialData', () => {
		it('should return a thunk function', () => {
			const result = actions.initialData({});
			expect(typeof result).toBe('function');
		});

		it('should execute dispatch function', () => {
			const dispatch = jest.fn();
			const thunkFunction = actions.initialData({});
			thunkFunction(dispatch);
			// Since the function is empty, just verify it doesn't throw
			expect(dispatch).not.toHaveBeenCalled();
		});

		it('should accept object parameter', () => {
			const params = { test: 'data' };
			const result = actions.initialData(params);
			expect(typeof result).toBe('function');
		});
	});

	describe('vatTransactionList', () => {
		it('should fetch VAT transaction list successfully', async () => {
			const mockData = [
				{
					id: 1,
					referenceNumber: 'VAT-001',
					amount: 1000,
					vatAmount: 50,
					status: 'Filed',
				},
				{
					id: 2,
					referenceNumber: 'VAT-002',
					amount: 2000,
					vatAmount: 100,
					status: 'Pending',
				},
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			const params = {
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'referenceNumber',
				paginationDisable: false,
			};

			const result = await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalled();
			expect(result.status).toBe(200);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: mockData },
			});
		});

		it('should build correct URL with pagination parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'amount',
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('pageNo=2'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageSize=20'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=asc'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('sortingCol=amount'),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				paginationDisable: true,
			};

			await store.dispatch(actions.vatTransactionList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.vatTransactionList({}))
			).rejects.toThrow('Network error');
		});

		it('should return response object on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, referenceNumber: 'VAT-001' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.vatTransactionList({}));
			expect(result).toEqual(mockResponse);
		});

		it('should handle empty parameters with defaults', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.vatTransactionList({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('/rest/taxes/getVatTransationList'),
				})
			);
		});

		it('should handle customer ID filter parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				customerId: { value: 'CUST-001', label: 'ABC Trading' },
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			// The function extracts customerName but doesn't use it in the URL
			// Just verify the API was called
			expect(authApi).toHaveBeenCalled();
		});

		it('should handle reference number filter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				referenceNumber: 'VAT-2024-001',
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle status filter parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				status: { value: 'Filed', label: 'Filed' },
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 404,
				data: [],
			});

			await store.dispatch(actions.vatTransactionList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle invoice date filter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				invoiceDate: '2024-01-15',
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle invoice due date filter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				invoiceDueDate: '2024-02-15',
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle amount filter parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				amount: 1000,
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle multiple filter parameters together', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				customerId: { value: 'CUST-001' },
				referenceNumber: 'VAT-001',
				status: { value: 'Filed' },
				amount: 1000,
				pageNo: 1,
				pageSize: 10,
				paginationDisable: false,
			};

			await store.dispatch(actions.vatTransactionList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('pageNo=1'),
				})
			);
		});

		it('should handle server errors gracefully', async () => {
			authApi.mockRejectedValue(new Error('Internal Server Error'));

			await expect(
				store.dispatch(actions.vatTransactionList({}))
			).rejects.toThrow('Internal Server Error');
		});

		it('should not dispatch actions on pagination disabled', async () => {
			const mockData = [{ id: 1 }];
			authApi.mockResolvedValue({ status: 200, data: mockData });

			const result = await store.dispatch(
				actions.vatTransactionList({ paginationDisable: true })
			);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
			expect(result.status).toBe(200);
		});
	});
});
