import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';
import { SALARY_ROLES } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Salary Roles Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getSalaryRoleList', () => {
		it('should dispatch SALARY_ROLES_LIST action when paginationDisable is false', async () => {
			const mockSalaryRoles = [
				{ id: 1, roleName: 'Developer', baseSalary: 5000 },
				{ id: 2, roleName: 'Manager', baseSalary: 8000 },
			];

			const mockResponse = {
				status: 200,
				data: mockSalaryRoles,
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				salaryRoleName: 'Developer',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'roleName',
				paginationDisable: false,
			};

			const result = await store.dispatch(actions.getSalaryRoleList(obj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: SALARY_ROLES.SALARY_ROLES_LIST,
				payload: mockSalaryRoles,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/payroll/salaryRoleList?salaryRoleName=Developer&pageNo=1&pageSize=10&order=desc&sortingCol=roleName&paginationDisable=false',
			});

			expect(result.status).toBe(200);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			const mockSalaryRoles = [
				{ id: 1, roleName: 'Developer', baseSalary: 5000 },
			];

			const mockResponse = {
				status: 200,
				data: mockSalaryRoles,
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				salaryRoleName: '',
				paginationDisable: true,
			};

			const result = await store.dispatch(actions.getSalaryRoleList(obj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);

			expect(result.status).toBe(200);
		});

		it('should handle request with minimal parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {};

			await store.dispatch(actions.getSalaryRoleList(obj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('salaryRoleName=');
			expect(apiCall.url).toContain('pageNo=');
			expect(apiCall.url).toContain('pageSize=');
			expect(apiCall.url).toContain('paginationDisable=false');
		});

		it('should handle request with only salary role name', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, roleName: 'Manager' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				salaryRoleName: 'Manager',
			};

			await store.dispatch(actions.getSalaryRoleList(obj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('salaryRoleName=Manager');
		});

		it('should handle request with pagination parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'baseSalary',
			};

			await store.dispatch(actions.getSalaryRoleList(obj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('pageNo=2');
			expect(apiCall.url).toContain('pageSize=20');
			expect(apiCall.url).toContain('order=asc');
			expect(apiCall.url).toContain('sortingCol=baseSalary');
		});

		it('should handle empty salary role name', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, roleName: 'Role 1' },
					{ id: 2, roleName: 'Role 2' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				salaryRoleName: '',
				pageNo: 1,
				pageSize: 10,
			};

			const result = await store.dispatch(actions.getSalaryRoleList(obj));

			expect(result.data).toHaveLength(2);
			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('salaryRoleName=');
		});

		it('should handle large page size', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				pageNo: 1,
				pageSize: 100,
				paginationDisable: false,
			};

			await store.dispatch(actions.getSalaryRoleList(obj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('pageSize=100');
		});

		it('should handle different sorting orders', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const objAsc = {
				order: 'asc',
				sortingCol: 'roleName',
			};

			await store.dispatch(actions.getSalaryRoleList(objAsc));

			let apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('order=asc');

			jest.clearAllMocks();

			const objDesc = {
				order: 'desc',
				sortingCol: 'baseSalary',
			};

			await store.dispatch(actions.getSalaryRoleList(objDesc));

			apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('order=desc');
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch salary roles');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRoleList({}))
			).rejects.toThrow('Failed to fetch salary roles');
		});

		it('should handle network timeout errors', async () => {
			const mockError = new Error('Network timeout');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRoleList({ salaryRoleName: 'Test' }))
			).rejects.toThrow('Network timeout');
		});

		it('should return response even when dispatch is skipped', async () => {
			const mockSalaryRoles = [
				{ id: 1, roleName: 'Developer' },
				{ id: 2, roleName: 'Manager' },
			];

			const mockResponse = {
				status: 200,
				data: mockSalaryRoles,
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				paginationDisable: true,
			};

			const result = await store.dispatch(actions.getSalaryRoleList(obj));

			expect(result).toEqual(mockResponse);
			expect(result.data).toHaveLength(2);
		});

		it('should handle response with pagination metadata', async () => {
			const mockResponse = {
				status: 200,
				data: {
					items: [{ id: 1, roleName: 'Developer' }],
					totalPages: 5,
					totalItems: 50,
					currentPage: 1,
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				pageNo: 1,
				pageSize: 10,
				paginationDisable: false,
			};

			const result = await store.dispatch(actions.getSalaryRoleList(obj));

			expect(result.data).toHaveProperty('items');
			expect(result.data).toHaveProperty('totalPages');
		});

		it('should handle special characters in salary role name', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				salaryRoleName: 'Senior C++ Developer',
			};

			await store.dispatch(actions.getSalaryRoleList(obj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('salaryRoleName=Senior C++ Developer');
		});

		it('should dispatch action with empty array when no roles found', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const obj = {
				salaryRoleName: 'NonExistentRole',
				paginationDisable: false,
			};

			await store.dispatch(actions.getSalaryRoleList(obj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0].payload).toEqual([]);
		});

		it('should handle multiple consecutive API calls', async () => {
			const mockResponse1 = {
				status: 200,
				data: [{ id: 1, roleName: 'Role 1' }],
			};

			const mockResponse2 = {
				status: 200,
				data: [{ id: 2, roleName: 'Role 2' }],
			};

			authApi
				.mockResolvedValueOnce(mockResponse1)
				.mockResolvedValueOnce(mockResponse2);

			await store.dispatch(actions.getSalaryRoleList({ pageNo: 1 }));
			await store.dispatch(actions.getSalaryRoleList({ pageNo: 2 }));

			expect(authApi).toHaveBeenCalledTimes(2);
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(2);
		});
	});

	describe('Error handling', () => {
		it('should handle 404 errors', async () => {
			const mockError = new Error('Not Found');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRoleList({}))
			).rejects.toThrow('Not Found');
		});

		it('should handle 500 server errors', async () => {
			const mockError = new Error('Internal Server Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRoleList({}))
			).rejects.toThrow('Internal Server Error');
		});

		it('should handle unauthorized errors', async () => {
			const mockError = new Error('Unauthorized');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRoleList({}))
			).rejects.toThrow('Unauthorized');
		});
	});
});
