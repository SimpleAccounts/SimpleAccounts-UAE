import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { EMPLOYEE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Employee Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getEmployeeList', () => {
		it('should fetch employee list successfully', async () => {
			const mockData = [
				{ id: 1, name: 'John Doe', email: 'john@example.com' },
				{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			const params = {
				name: '',
				email: '',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'name',
				paginationDisable: false,
			};

			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: mockData,
			});
		});

		it('should build correct URL with name parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: 'John Doe',
				email: '',
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('name=John Doe'),
				})
			);
		});

		it('should build correct URL with email parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: '',
				email: 'john@example.com',
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('email=john@example.com'),
				})
			);
		});

		it('should build URL with pagination parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'email',
			};

			await store.dispatch(actions.getEmployeeList(params));

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
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=asc'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('sortingCol=email'),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				paginationDisable: true,
			};

			await store.dispatch(actions.getEmployeeList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getEmployeeList({}))
			).rejects.toThrow('Network error');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1 }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeList({}));
			expect(result).toEqual(mockResponse);
		});

		it('should handle empty parameters object', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getEmployeeList({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('/rest/employee/getList'),
				})
			);
		});
	});

	describe('getCurrencyList', () => {
		it('should fetch currency list successfully', async () => {
			const mockCurrencies = [
				{ code: 'USD', name: 'US Dollar' },
				{ code: 'AED', name: 'UAE Dirham' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCurrencies,
			});

			await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency/getactivecurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { status: 200, data: mockCurrencies },
			});
		});

		it('should handle currency list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Currency service unavailable'));

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Currency service unavailable'
			);
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 404,
				data: [],
			});

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty currency list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { status: 200, data: [] },
			});
		});
	});

	describe('removeBulkEmployee', () => {
		it('should remove bulk employees successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Employees deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulkEmployee(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/employee/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
			expect(result.data.message).toBe('Employees deleted successfully');
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulkEmployee({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});

		it('should only return response on status 200', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Success' },
			});

			const result = await store.dispatch(
				actions.removeBulkEmployee({ ids: [1] })
			);
			expect(result).toBeDefined();
			expect(result.status).toBe(200);
		});

		it('should handle single employee deletion', async () => {
			const mockId = { ids: [1] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Employee deleted' },
			});

			const result = await store.dispatch(actions.removeBulkEmployee(mockId));
			expect(result.status).toBe(200);
		});

		it('should handle empty array of IDs', async () => {
			const mockIds = { ids: [] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'No employees to delete' },
			});

			const result = await store.dispatch(actions.removeBulkEmployee(mockIds));
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: mockIds,
				})
			);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.removeBulkEmployee({ ids: [1] }));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle server validation errors', async () => {
			authApi.mockRejectedValue(
				new Error('Cannot delete employees with active payroll')
			);

			await expect(
				store.dispatch(actions.removeBulkEmployee({ ids: [1, 2, 3] }))
			).rejects.toThrow('Cannot delete employees with active payroll');
		});
	});
});
