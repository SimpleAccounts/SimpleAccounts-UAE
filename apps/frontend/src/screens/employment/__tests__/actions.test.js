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

describe('Employment Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getEmployeeList', () => {
		it('should fetch employee list successfully', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'John Doe', email: 'john@example.com' },
					{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const params = {
				name: '',
				email: '',
				pageNo: 1,
				pageSize: 10,
				order: 'asc',
				sortingCol: 'name',
				paginationDisable: false,
			};

			const result = await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getList?name=&email=&pageNo=1&pageSize=10&order=asc&sortingCol=name&paginationDisable=false',
			});

			expect(result).toEqual(mockResponse);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: mockResponse.data,
			});
		});

		it('should handle empty parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getEmployeeList({}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getList?name=&email=&pageNo=&pageSize=&order=&sortingCol=&paginationDisable=false',
			});
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { paginationDisable: true };
			await store.dispatch(actions.getEmployeeList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getEmployeeList({}))).rejects.toThrow(
				'Network error'
			);
		});

		it('should build correct URL with name filter', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { name: 'John' };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('name=John'),
				})
			);
		});

		it('should build correct URL with email filter', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { email: 'test@example.com' };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('email=test@example.com'),
				})
			);
		});

		it('should handle pagination parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { pageNo: 2, pageSize: 20 };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageNo=2&pageSize=20'),
				})
			);
		});

		it('should handle sorting parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { order: 'desc', sortingCol: 'email' };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=desc&sortingCol=email'),
				})
			);
		});
	});

	describe('getCurrencyList', () => {
		it('should fetch currency list successfully', async () => {
			const mockCurrencies = [
				{ id: 1, code: 'USD', name: 'US Dollar' },
				{ id: 2, code: 'EUR', name: 'Euro' },
				{ id: 3, code: 'AED', name: 'UAE Dirham' },
			];

			const mockResponse = {
				status: 200,
				data: mockCurrencies,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency/getactivecurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEE.CURRENCY_LIST,
				payload: mockResponse,
			});
		});

		it('should dispatch action only when status is 200', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, code: 'USD' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(1);
			expect(dispatchedActions[0].type).toBe(EMPLOYEE.CURRENCY_LIST);
		});

		it('should not dispatch action when status is not 200', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('API error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'API error'
			);
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
	});

	describe('removeBulkEmployee', () => {
		it('should delete employees successfully', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Employees deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const employeeIds = [1, 2, 3];
			const result = await store.dispatch(
				actions.removeBulkEmployee(employeeIds)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/employee/deletes',
				data: employeeIds,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should return response when status is 200', async () => {
			const mockResponse = {
				status: 200,
				data: { deleted: 5 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.removeBulkEmployee([1, 2, 3]));

			expect(result.status).toBe(200);
			expect(result.data.deleted).toBe(5);
		});

		it('should not return response when status is not 200', async () => {
			const mockResponse = {
				status: 400,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.removeBulkEmployee([1]));

			expect(result).toBeUndefined();
		});

		it('should handle delete error', async () => {
			const mockError = new Error('Delete failed');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.removeBulkEmployee([1, 2]))
			).rejects.toThrow('Delete failed');
		});

		it('should handle empty employee array', async () => {
			const mockResponse = { status: 200, data: {} };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.removeBulkEmployee([]));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: [],
				})
			);
		});

		it('should handle single employee deletion', async () => {
			const mockResponse = { status: 200, data: {} };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.removeBulkEmployee([1]));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: [1],
				})
			);
		});

		it('should not dispatch any action on successful delete', async () => {
			const mockResponse = { status: 200, data: {} };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.removeBulkEmployee([1, 2, 3]));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});
});
