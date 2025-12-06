import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { VAT } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('VAT Code Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getVatList', () => {
		it('should fetch VAT list successfully with parameters', async () => {
			const mockVatList = [
				{ id: 1, name: 'Standard Rate', vatPercentage: 5 },
				{ id: 2, name: 'Zero Rate', vatPercentage: 0 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatList,
			});

			const params = {
				name: '',
				vatPercentage: '',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'name',
				paginationDisable: false,
			};

			await store.dispatch(actions.getVatList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: VAT.VAT_LIST,
				payload: mockVatList,
			});
		});

		it('should fetch VAT list without parameters', async () => {
			const mockVatList = [
				{ id: 1, name: 'Standard Rate', vatPercentage: 5 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatList,
			});

			await store.dispatch(actions.getVatList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/vat/getList',
			});
		});

		it('should build correct URL with name parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: 'Standard',
				vatPercentage: '',
				pageNo: 1,
				pageSize: 10,
				paginationDisable: false,
			};

			await store.dispatch(actions.getVatList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('name=Standard'),
				})
			);
		});

		it('should build URL with vatPercentage parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: '',
				vatPercentage: '5',
				pageNo: 1,
				pageSize: 10,
				paginationDisable: false,
			};

			await store.dispatch(actions.getVatList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('vatPercentage=5'),
				})
			);
		});

		it('should build URL with pagination parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'vatPercentage',
				paginationDisable: false,
			};

			await store.dispatch(actions.getVatList(params));

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

			await store.dispatch(actions.getVatList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getVatList({}))
			).rejects.toThrow('Network error');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Standard' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVatList({}));
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getVatByID', () => {
		it('should fetch VAT by ID successfully', async () => {
			const vatId = 123;
			const mockVatRow = {
				id: 123,
				name: 'Standard Rate',
				vatPercentage: 5,
				description: 'Standard VAT rate',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatRow,
			});

			await store.dispatch(actions.getVatByID(vatId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/vat/getById?id=${vatId}`,
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: VAT.VAT_ROW,
				payload: mockVatRow,
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('VAT not found'));

			await expect(
				store.dispatch(actions.getVatByID(999))
			).rejects.toThrow('VAT not found');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, name: 'Standard' },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVatByID(1));
			expect(result).toEqual(mockResponse);
		});

		it('should handle different VAT IDs', async () => {
			const vatIds = [1, 100, 999];

			for (const id of vatIds) {
				authApi.mockResolvedValue({
					status: 200,
					data: { id, name: `VAT ${id}` },
				});

				await store.dispatch(actions.getVatByID(id));

				expect(authApi).toHaveBeenCalledWith(
					expect.objectContaining({
						url: `/rest/vat/getById?id=${id}`,
					})
				);
			}
		});
	});

	describe('deleteVat', () => {
		it('should delete VAT successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'VAT codes deleted successfully' },
			});

			const result = await store.dispatch(actions.deleteVat(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/vat/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.deleteVat({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.deleteVat({ ids: [1] }));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle single VAT deletion', async () => {
			const mockId = { ids: [1] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'VAT deleted' },
			});

			const result = await store.dispatch(actions.deleteVat(mockId));
			expect(result.status).toBe(200);
		});

		it('should handle bulk VAT deletion', async () => {
			const mockIds = { ids: [1, 2, 3, 4, 5] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: '5 VAT codes deleted' },
			});

			const result = await store.dispatch(actions.deleteVat(mockIds));
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: mockIds,
				})
			);
		});
	});

	describe('getVatCount', () => {
		it('should fetch VAT product count successfully', async () => {
			const vatId = 123;
			const mockResponse = {
				status: 200,
				data: { productCount: 50, invoiceCount: 125 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVatCount(vatId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/vat/getProductCountsForVat/?vatId=${vatId}`,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch count'));

			await expect(
				store.dispatch(actions.getVatCount(123))
			).rejects.toThrow('Failed to fetch count');
		});

		it('should only return response on status 200', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { productCount: 10 },
			});

			const result = await store.dispatch(actions.getVatCount(1));
			expect(result).toBeDefined();
			expect(result.status).toBe(200);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { productCount: 5 },
			});

			await store.dispatch(actions.getVatCount(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle zero count', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { productCount: 0, invoiceCount: 0 },
			});

			const result = await store.dispatch(actions.getVatCount(999));
			expect(result.data.productCount).toBe(0);
		});

		it('should handle different VAT IDs', async () => {
			const vatIds = [1, 50, 100];

			for (const id of vatIds) {
				authApi.mockResolvedValue({
					status: 200,
					data: { productCount: id * 10 },
				});

				const result = await store.dispatch(actions.getVatCount(id));
				expect(result.data.productCount).toBe(id * 10);
			}
		});
	});

	describe('getCompanyDetails', () => {
		it('should fetch company details successfully', async () => {
			const mockCompanyDetails = {
				companyName: 'Test Company',
				address: '123 Main St',
				vatRegistrationNumber: 'VAT-REG-123',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockCompanyDetails,
			});

			const result = await store.dispatch(actions.getCompanyDetails());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/company/getCompanyDetails',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCompanyDetails);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch company details'));

			await expect(
				store.dispatch(actions.getCompanyDetails())
			).rejects.toThrow('Failed to fetch company details');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: { companyName: 'Test' },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCompanyDetails());
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.getCompanyDetails());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty company details', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			const result = await store.dispatch(actions.getCompanyDetails());
			expect(result.data).toEqual({});
		});
	});
});
