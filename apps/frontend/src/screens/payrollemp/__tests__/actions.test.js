import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { EMPLOYEEPAYROLL } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('PayrollEmployee Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getPayrollEmployeeList', () => {
		it('should fetch payroll employee list successfully', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'John Doe', salary: 5000 },
					{ id: 2, name: 'Jane Smith', salary: 6000 },
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

			const result = await store.dispatch(
				actions.getPayrollEmployeeList(params)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getList?name=&email=&pageNo=1&pageSize=10&order=asc&sortingCol=name&paginationDisable=false',
			});

			expect(result).toEqual(mockResponse);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
				payload: mockResponse.data,
			});
		});

		it('should handle empty parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPayrollEmployeeList({}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getList?name=&email=&pageNo=&pageSize=&order=&sortingCol=&paginationDisable=false',
			});
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { paginationDisable: true };
			await store.dispatch(actions.getPayrollEmployeeList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getPayrollEmployeeList({}))
			).rejects.toThrow('Network error');
		});

		it('should build correct URL with name filter', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { name: 'John' };
			await store.dispatch(actions.getPayrollEmployeeList(params));

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
			await store.dispatch(actions.getPayrollEmployeeList(params));

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
			await store.dispatch(actions.getPayrollEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageNo=2&pageSize=20'),
				})
			);
		});

		it('should handle sorting parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { order: 'desc', sortingCol: 'salary' };
			await store.dispatch(actions.getPayrollEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=desc&sortingCol=salary'),
				})
			);
		});

		it('should dispatch correct action type', async () => {
			const mockResponse = { status: 200, data: [{ id: 1 }] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPayrollEmployeeList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(
				EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST
			);
		});

		it('should return the response data', async () => {
			const mockResponse = { status: 200, data: [{ id: 1 }, { id: 2 }] };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getPayrollEmployeeList({}));

			expect(result.data.length).toBe(2);
		});
	});

	describe('getPayrollEmployeeList2', () => {
		it('should fetch active employees successfully', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Active Employee 1', active: true },
					{ id: 2, name: 'Active Employee 2', active: true },
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

			const result = await store.dispatch(
				actions.getPayrollEmployeeList2(params)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getListForActiveEmployees?name=&email=&pageNo=1&pageSize=10&order=asc&sortingCol=name&paginationDisable=false',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should use different endpoint than getPayrollEmployeeList', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPayrollEmployeeList2({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('getListForActiveEmployees'),
				})
			);
		});

		it('should dispatch action for active employees', async () => {
			const mockResponse = { status: 200, data: [{ id: 1, active: true }] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPayrollEmployeeList2({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
				payload: mockResponse.data,
			});
		});

		it('should not dispatch when paginationDisable is true', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getPayrollEmployeeList2({ paginationDisable: true })
			);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error for active employees', async () => {
			const mockError = new Error('Database error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getPayrollEmployeeList2({}))
			).rejects.toThrow('Database error');
		});

		it('should handle empty active employee list', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getPayrollEmployeeList2({}));

			expect(result.data).toEqual([]);
		});

		it('should handle name filter for active employees', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getPayrollEmployeeList2({ name: 'Active' })
			);

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('name=Active'),
				})
			);
		});

		it('should handle pagination for active employees', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getPayrollEmployeeList2({ pageNo: 3, pageSize: 15 })
			);

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageNo=3&pageSize=15'),
				})
			);
		});

		it('should handle sorting for active employees', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getPayrollEmployeeList2({ order: 'desc', sortingCol: 'name' })
			);

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=desc&sortingCol=name'),
				})
			);
		});

		it('should return response with active employees', async () => {
			const mockData = [
				{ id: 1, name: 'Employee 1', active: true },
				{ id: 2, name: 'Employee 2', active: true },
			];
			const mockResponse = { status: 200, data: mockData };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getPayrollEmployeeList2({}));

			expect(result.data).toEqual(mockData);
		});
	});

	describe('API Error Handling', () => {
		it('should handle 401 Unauthorized error', async () => {
			const mockError = new Error('Unauthorized');
			mockError.response = { status: 401 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getPayrollEmployeeList({}))
			).rejects.toThrow('Unauthorized');
		});

		it('should handle 404 Not Found error', async () => {
			const mockError = new Error('Not Found');
			mockError.response = { status: 404 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getPayrollEmployeeList2({}))
			).rejects.toThrow('Not Found');
		});

		it('should handle 500 Server error', async () => {
			const mockError = new Error('Internal Server Error');
			mockError.response = { status: 500 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getPayrollEmployeeList({}))
			).rejects.toThrow('Internal Server Error');
		});
	});

	describe('Multiple concurrent requests', () => {
		it('should handle concurrent API calls', async () => {
			const mockResponse1 = { status: 200, data: [{ id: 1 }] };
			const mockResponse2 = { status: 200, data: [{ id: 2 }] };

			authApi
				.mockResolvedValueOnce(mockResponse1)
				.mockResolvedValueOnce(mockResponse2);

			await Promise.all([
				store.dispatch(actions.getPayrollEmployeeList({})),
				store.dispatch(actions.getPayrollEmployeeList2({})),
			]);

			expect(authApi).toHaveBeenCalledTimes(2);
			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(2);
		});
	});
});
