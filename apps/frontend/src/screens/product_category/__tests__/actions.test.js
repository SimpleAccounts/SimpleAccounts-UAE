import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { PRODUCT_CATEGORY } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Product Category Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getProductCategoryList', () => {
		it('should dispatch PRODUCT_CATEGORY_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, categoryCode: 'CAT-001', categoryName: 'Electronics' },
					{ id: 2, categoryCode: 'CAT-002', categoryName: 'Furniture' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				productCategoryCode: 'CAT-001',
				productCategoryName: 'Electronics',
				pageNo: 1,
				pageSize: 10,
			};

			const result = await store.dispatch(actions.getProductCategoryList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
				payload: mockResponse.data,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch when paginationDisable is true', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				paginationDisable: true,
			};

			await store.dispatch(actions.getProductCategoryList(postObj));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should call API with all parameters when obj is provided', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				productCategoryCode: 'CAT-TEST',
				productCategoryName: 'Test Category',
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'categoryName',
				paginationDisable: false,
			};

			await store.dispatch(actions.getProductCategoryList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('productCategoryCode=CAT-TEST');
			expect(apiCall.url).toContain('productCategoryName=Test Category');
			expect(apiCall.url).toContain('pageNo=2');
			expect(apiCall.url).toContain('pageSize=20');
			expect(apiCall.url).toContain('order=asc');
			expect(apiCall.url).toContain('sortingCol=categoryName');
		});

		it('should use simple URL when obj is not provided', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProductCategoryList());

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toBe('/rest/productcategory/getList');
		});

		it('should handle empty parameters with default values', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {};

			await store.dispatch(actions.getProductCategoryList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('productCategoryCode=');
			expect(apiCall.url).toContain('productCategoryName=');
		});

		it('should dispatch with correct payload structure', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, categoryName: 'Test' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = { pageNo: 1 };

			await store.dispatch(actions.getProductCategoryList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST);
			expect(dispatchedActions[0].payload).toEqual(mockResponse.data);
		});

		it('should handle API errors gracefully', async () => {
			const mockError = new Error('Failed to fetch categories');
			authApi.mockRejectedValue(mockError);

			const postObj = { pageNo: 1 };

			await expect(
				store.dispatch(actions.getProductCategoryList(postObj))
			).rejects.toThrow('Failed to fetch categories');
		});

		it('should return response on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, categoryName: 'Category 1' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getProductCategoryList({ pageNo: 1 }));

			expect(result).toEqual(mockResponse);
		});

		it('should handle large category dataset', async () => {
			const largeCategoryList = Array.from({ length: 200 }, (_, i) => ({
				id: i + 1,
				categoryCode: `CAT-${String(i + 1).padStart(4, '0')}`,
				categoryName: `Category ${i + 1}`,
			}));

			const mockResponse = {
				status: 200,
				data: largeCategoryList,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getProductCategoryList({ pageNo: 1 }));

			expect(result.data).toHaveLength(200);
		});

		it('should handle null obj parameter gracefully', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProductCategoryList(null));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toBe('/rest/productcategory/getList');
		});
	});

	describe('deleteProductCategory', () => {
		it('should call DELETE API with correct data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Categories deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1, 2, 3] };
			const result = await store.dispatch(actions.deleteProductCategory(deleteData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/productcategory/deletes',
				data: deleteData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should return response on successful deletion', async () => {
			const mockResponse = {
				status: 200,
				data: { deleted: true, count: 5 },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1, 2, 3, 4, 5] };
			const result = await store.dispatch(actions.deleteProductCategory(deleteData));

			expect(result.status).toBe(200);
			expect(result.data.count).toBe(5);
		});

		it('should handle single category deletion', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Category deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1] };
			await store.dispatch(actions.deleteProductCategory(deleteData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.data.ids).toHaveLength(1);
		});

		it('should handle multiple category deletion', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Multiple categories deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
			await store.dispatch(actions.deleteProductCategory(deleteData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.data.ids).toHaveLength(10);
		});

		it('should handle deletion errors', async () => {
			const mockError = new Error('Deletion failed');
			authApi.mockRejectedValue(mockError);

			const deleteData = { ids: [1, 2] };

			await expect(
				store.dispatch(actions.deleteProductCategory(deleteData))
			).rejects.toThrow('Deletion failed');
		});

		it('should handle unauthorized deletion errors', async () => {
			const mockError = new Error('Unauthorized');
			authApi.mockRejectedValue(mockError);

			const deleteData = { ids: [1] };

			await expect(
				store.dispatch(actions.deleteProductCategory(deleteData))
			).rejects.toThrow('Unauthorized');
		});

		it('should handle empty deletion data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'No categories to delete' },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [] };
			const result = await store.dispatch(actions.deleteProductCategory(deleteData));

			expect(result.status).toBe(200);
		});

		it('should not dispatch any actions on deletion', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted' },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1] };
			await store.dispatch(actions.deleteProductCategory(deleteData));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should handle complex delete object', async () => {
			const mockResponse = {
				status: 200,
				data: { success: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = {
				ids: [1, 2, 3],
				deleteReason: 'Obsolete categories',
				userId: 123,
			};

			await store.dispatch(actions.deleteProductCategory(deleteData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.data).toHaveProperty('deleteReason');
		});

		it('should call authApi exactly once for deletion', async () => {
			const mockResponse = {
				status: 200,
				data: {},
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1, 2] };
			await store.dispatch(actions.deleteProductCategory(deleteData));

			expect(authApi).toHaveBeenCalledTimes(1);
		});
	});

	describe('Action error handling', () => {
		it('should propagate API errors correctly for getProductCategoryList', async () => {
			const apiError = new Error('API Error');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(
				actions.getProductCategoryList({ pageNo: 1 })(dispatch)
			).rejects.toThrow('API Error');
		});

		it('should propagate API errors correctly for deleteProductCategory', async () => {
			const apiError = new Error('Delete API Error');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(
				actions.deleteProductCategory({ ids: [1] })(dispatch)
			).rejects.toThrow('Delete API Error');
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network Error');
			authApi.mockRejectedValue(networkError);

			await expect(
				actions.getProductCategoryList({ pageNo: 1 })(jest.fn())
			).rejects.toThrow();
			await expect(
				actions.deleteProductCategory({ ids: [1] })(jest.fn())
			).rejects.toThrow();
		});
	});
});
