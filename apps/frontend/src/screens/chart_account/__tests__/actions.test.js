import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { CHART_ACCOUNT } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Chart Account Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getSubTransactionTypes', () => {
		it('should fetch sub transaction types successfully', async () => {
			const mockSubTypes = [
				{ id: 1, subTypeName: 'Current Asset', parentType: 'Asset' },
				{ id: 2, subTypeName: 'Fixed Asset', parentType: 'Asset' },
				{ id: 3, subTypeName: 'Current Liability', parentType: 'Liability' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockSubTypes,
			});

			await store.dispatch(actions.getSubTransactionTypes());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/getsubChartofAccount',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload: mockSubTypes,
			});
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Failed to fetch sub transaction types');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSubTransactionTypes())
			).rejects.toThrow('Failed to fetch sub transaction types');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, subTypeName: 'Current Asset' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getSubTransactionTypes());
			expect(result).toEqual(mockResponse);
		});

		it('should handle empty sub transaction types list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getSubTransactionTypes());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload: [],
			});
		});
	});

	describe('getTransactionTypes', () => {
		it('should fetch transaction types successfully', async () => {
			const mockTypes = [
				{ id: 1, typeName: 'Asset', typeCode: 'AST' },
				{ id: 2, typeName: 'Liability', typeCode: 'LIA' },
				{ id: 3, typeName: 'Equity', typeCode: 'EQU' },
				{ id: 4, typeName: 'Revenue', typeCode: 'REV' },
				{ id: 5, typeName: 'Expense', typeCode: 'EXP' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockTypes,
			});

			await store.dispatch(actions.getTransactionTypes());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/getTransactionTypes',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CHART_ACCOUNT.TRANSACTION_TYPES,
				payload: mockTypes,
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			await expect(
				store.dispatch(actions.getTransactionTypes())
			).rejects.toThrow('Network error');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, typeName: 'Asset' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTransactionTypes());
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getTransactionCategoryList', () => {
		it('should fetch transaction category list successfully', async () => {
			const mockCategories = [
				{
					id: 1,
					transactionCategoryCode: 'CAT001',
					transactionCategoryName: 'Sales Revenue',
				},
				{
					id: 2,
					transactionCategoryCode: 'CAT002',
					transactionCategoryName: 'Operating Expenses',
				},
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			const params = {
				transactionCategoryCode: '',
				transactionCategoryName: '',
				chartOfAccountId: { value: '' },
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'transactionCategoryCode',
				paginationDisable: false,
			};

			await store.dispatch(actions.getTransactionCategoryList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: mockCategories,
			});
		});

		it('should build correct URL with category code parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				transactionCategoryCode: 'REV-001',
				transactionCategoryName: '',
				chartOfAccountId: { value: '' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getTransactionCategoryList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('transactionCategoryCode=REV-001'),
				})
			);
		});

		it('should build correct URL with category name parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				transactionCategoryCode: '',
				transactionCategoryName: 'Sales',
				chartOfAccountId: { value: '' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getTransactionCategoryList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('transactionCategoryName=Sales'),
				})
			);
		});

		it('should build URL with chartOfAccountId parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				transactionCategoryCode: '',
				transactionCategoryName: '',
				chartOfAccountId: { value: '123' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getTransactionCategoryList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('chartOfAccountId=123'),
				})
			);
		});

		it('should build URL with pagination parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'transactionCategoryName',
			};

			await store.dispatch(actions.getTransactionCategoryList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageNo=2'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageSize=20'),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				paginationDisable: true,
			};

			await store.dispatch(actions.getTransactionCategoryList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch categories'));

			await expect(
				store.dispatch(actions.getTransactionCategoryList({}))
			).rejects.toThrow('Failed to fetch categories');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1 }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getTransactionCategoryList({})
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getTransactionCategoryExportList', () => {
		it('should fetch export list successfully', async () => {
			const mockExportData = [
				{ id: 1, transactionCategoryCode: 'CAT001' },
				{ id: 2, transactionCategoryCode: 'CAT002' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockExportData,
			});

			const params = { paginationDisable: false };

			await store.dispatch(actions.getTransactionCategoryExportList(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transactioncategory/getExportList',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: mockExportData,
			});
		});

		it('should not dispatch when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getTransactionCategoryExportList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Export failed'));

			await expect(
				store.dispatch(actions.getTransactionCategoryExportList({}))
			).rejects.toThrow('Export failed');
		});
	});

	describe('removeBulk', () => {
		it('should remove bulk transaction categories successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Categories deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulk(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/transactioncategory/deleteTransactionCategories',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulk({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});

		it('should only return response on status 200', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Success' },
			});

			const result = await store.dispatch(actions.removeBulk({ ids: [1] }));
			expect(result).toBeDefined();
			expect(result.status).toBe(200);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.removeBulk({ ids: [1] }));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('getExplainedTransactionCountForTransactionCategory', () => {
		it('should fetch explained transaction count successfully', async () => {
			const categoryId = 123;
			const mockResponse = {
				status: 200,
				data: { count: 15 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getExplainedTransactionCountForTransactionCategory(categoryId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/transactioncategory/getExplainedTransactionCountForTransactionCategory/?transactionCategoryId=${categoryId}`,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch count'));

			await expect(
				store.dispatch(
					actions.getExplainedTransactionCountForTransactionCategory(123)
				)
			).rejects.toThrow('Failed to fetch count');
		});

		it('should only return response on status 200', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { count: 0 },
			});

			const result = await store.dispatch(
				actions.getExplainedTransactionCountForTransactionCategory(1)
			);
			expect(result).toBeDefined();
			expect(result.status).toBe(200);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { count: 5 },
			});

			await store.dispatch(
				actions.getExplainedTransactionCountForTransactionCategory(1)
			);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle zero count', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { count: 0 },
			});

			const result = await store.dispatch(
				actions.getExplainedTransactionCountForTransactionCategory(999)
			);
			expect(result.data.count).toBe(0);
		});
	});
});
