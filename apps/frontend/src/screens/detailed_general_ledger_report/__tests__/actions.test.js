import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Detailed General Ledger Report Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('getDetailedGeneralLedgerList', () => {
		it('should fetch detailed general ledger list successfully', async () => {
			const mockData = [
				{
					id: 1,
					transactionDate: '2024-01-15',
					accountName: 'Cash',
					debit: 1000,
					credit: 0,
					balance: 1000,
				},
				{
					id: 2,
					transactionDate: '2024-01-16',
					accountName: 'Sales',
					debit: 0,
					credit: 1000,
					balance: 0,
				},
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			const result = await store.dispatch(
				actions.getDetailedGeneralLedgerList(postData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/detailedGeneralLedgerReport/getList?startDate=2024-01-01&endDate=2024-01-31&reportBasis=accrual`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockData);
		});

		it('should include chartOfAccountId when provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'cash',
				chartOfAccountId: 123,
			};

			await store.dispatch(actions.getDetailedGeneralLedgerList(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: expect.stringContaining('chartOfAccountId=123'),
			});
		});

		it('should not include chartOfAccountId when not provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await store.dispatch(actions.getDetailedGeneralLedgerList(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: expect.not.stringContaining('chartOfAccountId'),
			});
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
				chartOfAccountId: 456,
			};

			await store.dispatch(actions.getDetailedGeneralLedgerList(postData));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('startDate=2024-01-01'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('endDate=2024-01-31'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('reportBasis=accrual'),
				})
			);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await expect(
				store.dispatch(actions.getDetailedGeneralLedgerList(postData))
			).rejects.toThrow('Network error');
		});

		it('should return response on status 200', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, amount: 1000 }],
			};
			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'cash',
			};

			const result = await store.dispatch(
				actions.getDetailedGeneralLedgerList(postData)
			);
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await store.dispatch(actions.getDetailedGeneralLedgerList(postData));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty response data', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			const result = await store.dispatch(
				actions.getDetailedGeneralLedgerList(postData)
			);
			expect(result.data).toEqual([]);
		});

		it('should handle different report basis values', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'cash',
			};

			await store.dispatch(actions.getDetailedGeneralLedgerList(postData));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('reportBasis=cash'),
				})
			);
		});

		it('should handle server errors gracefully', async () => {
			authApi.mockRejectedValue(new Error('Internal Server Error'));

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await expect(
				store.dispatch(actions.getDetailedGeneralLedgerList(postData))
			).rejects.toThrow('Internal Server Error');
		});
	});

	describe('getTransactionCategoryList', () => {
		it('should fetch transaction category list successfully', async () => {
			const mockCategories = [
				{ id: 1, categoryName: 'Sales', categoryType: 'Income' },
				{ id: 2, categoryName: 'Purchases', categoryType: 'Expense' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			const result = await store.dispatch(
				actions.getTransactionCategoryList(postData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery?startDate=2024-01-01&endDate=2024-01-31&reportBasis=accrual`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCategories);
		});

		it('should include chartOfAccountId when provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'cash',
				chartOfAccountId: 789,
			};

			await store.dispatch(actions.getTransactionCategoryList(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: expect.stringContaining('chartOfAccountId=789'),
			});
		});

		it('should not include chartOfAccountId when not provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await store.dispatch(actions.getTransactionCategoryList(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: expect.not.stringContaining('chartOfAccountId'),
			});
		});

		it('should build correct URL with date range', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-02-01',
				endDate: '2024-02-29',
				reportBasis: 'cash',
			};

			await store.dispatch(actions.getTransactionCategoryList(postData));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('startDate=2024-02-01'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('endDate=2024-02-29'),
				})
			);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Category fetch failed'));

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await expect(
				store.dispatch(actions.getTransactionCategoryList(postData))
			).rejects.toThrow('Category fetch failed');
		});

		it('should return response on status 200', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, categoryName: 'Sales' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			const result = await store.dispatch(
				actions.getTransactionCategoryList(postData)
			);
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await store.dispatch(actions.getTransactionCategoryList(postData));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty category list', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			const result = await store.dispatch(
				actions.getTransactionCategoryList(postData)
			);
			expect(result.data).toEqual([]);
		});

		it('should handle unauthorized access', async () => {
			authApi.mockRejectedValue(new Error('Unauthorized'));

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await expect(
				store.dispatch(actions.getTransactionCategoryList(postData))
			).rejects.toThrow('Unauthorized');
		});

		it('should use correct API endpoint', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-01-31',
				reportBasis: 'accrual',
			};

			await store.dispatch(actions.getTransactionCategoryList(postData));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('getUsedTransactionCatogery'),
				})
			);
		});
	});
});
