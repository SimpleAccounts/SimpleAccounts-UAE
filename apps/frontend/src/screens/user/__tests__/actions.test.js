import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { USER } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

jest.mock('moment', () => {
	const actualMoment = jest.requireActual('moment');
	const mockMoment = jest.fn((date) => actualMoment(date));
	mockMoment.prototype = actualMoment.prototype;
	return mockMoment;
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('User Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getUserList', () => {
		it('should fetch user list successfully', async () => {
			const mockData = [
				{ id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
				{ id: 2, name: 'Regular User', email: 'user@example.com', role: 'User' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			const params = {
				name: '',
				roleId: { value: '' },
				active: { value: '' },
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'name',
				paginationDisable: false,
			};

			await store.dispatch(actions.getUserList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.USER_LIST,
				payload: mockData,
			});
		});

		it('should build correct URL with name parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: 'John Doe',
				roleId: { value: '' },
				active: { value: '' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getUserList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('name=John Doe'),
				})
			);
		});

		it('should build URL with roleId parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: '',
				roleId: { value: '2' },
				active: { value: '' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getUserList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('roleId=2'),
				})
			);
		});

		it('should build URL with active status parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: '',
				roleId: { value: '' },
				active: { value: 'true' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getUserList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('active=true'),
				})
			);
		});

		it('should include dob parameter when provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const testDate = '1990-01-15';
			const params = {
				name: '',
				roleId: { value: '' },
				active: { value: '' },
				dob: testDate,
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getUserList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('dob='),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				paginationDisable: true,
			};

			await store.dispatch(actions.getUserList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getUserList({}))
			).rejects.toThrow('Network error');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1 }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getUserList({}));
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getRoleList', () => {
		it('should fetch role list successfully', async () => {
			const mockRoles = [
				{ id: 1, roleName: 'Admin' },
				{ id: 2, roleName: 'User' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockRoles,
			});

			await store.dispatch(actions.getRoleList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getrole',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.ROLE_LIST,
				payload: mockRoles,
			});
		});

		it('should handle role list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch roles'));

			await expect(store.dispatch(actions.getRoleList())).rejects.toThrow(
				'Failed to fetch roles'
			);
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, roleName: 'Admin' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getRoleList());
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getPayrollCount', () => {
		it('should fetch payroll count for user successfully', async () => {
			const userId = 123;
			const mockResponse = {
				status: 200,
				data: { count: 5 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getPayrollCount(userId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/payroll/getPayrollCountByUserId?userId=${userId}`,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle payroll count fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch count'));

			await expect(store.dispatch(actions.getPayrollCount(123))).rejects.toThrow(
				'Failed to fetch count'
			);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: { count: 0 } });

			await store.dispatch(actions.getPayrollCount(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('getEmployeesNotInUserForDropdown', () => {
		it('should fetch employees not in user list successfully', async () => {
			const mockEmployees = [
				{ id: 1, name: 'Employee A', employeeCode: 'EMP001' },
				{ id: 2, name: 'Employee B', employeeCode: 'EMP002' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockEmployees,
			});

			await store.dispatch(actions.getEmployeesNotInUserForDropdown({}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getEmployeesNotInUserForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.EMPLOYEE_LIST,
				payload: mockEmployees,
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch employees'));

			await expect(
				store.dispatch(actions.getEmployeesNotInUserForDropdown({}))
			).rejects.toThrow('Failed to fetch employees');
		});
	});

	describe('getEmployeeDesignationForDropdown', () => {
		it('should fetch employee designations successfully', async () => {
			const mockDesignations = [
				{ id: 1, label: 'Manager', value: 'manager' },
				{ id: 2, label: 'Developer', value: 'developer' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockDesignations,
			});

			await store.dispatch(actions.getEmployeeDesignationForDropdown({}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employeeDesignation/getEmployeeDesignationForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.DESIGNATION_DROPDOWN,
				payload: mockDesignations,
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch designations'));

			await expect(
				store.dispatch(actions.getEmployeeDesignationForDropdown({}))
			).rejects.toThrow('Failed to fetch designations');
		});
	});

	describe('removeBulk', () => {
		it('should remove bulk users successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Users deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulk(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/user/deletes',
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
	});

	describe('getCompanyTypeList', () => {
		it('should fetch company type list successfully', async () => {
			const mockCompanyTypes = [
				{ id: 1, name: 'LLC', description: 'Limited Liability Company' },
				{ id: 2, name: 'FZ', description: 'Free Zone' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCompanyTypes,
			});

			await store.dispatch(actions.getCompanyTypeList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/company/getCompaniesForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.COMPANY_TYPE_LIST,
				payload: mockCompanyTypes,
			});
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 404,
				data: [],
			});

			await store.dispatch(actions.getCompanyTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch company types'));

			await expect(store.dispatch(actions.getCompanyTypeList())).rejects.toThrow(
				'Failed to fetch company types'
			);
		});

		it('should handle empty company type list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getCompanyTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.COMPANY_TYPE_LIST,
				payload: [],
			});
		});
	});
});
