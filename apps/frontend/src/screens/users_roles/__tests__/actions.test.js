import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { USER } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('UsersRoles Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getRoleList', () => {
		it('should fetch role list successfully', async () => {
			const mockRoles = [
				{ id: 1, name: 'Admin', code: 'ADMIN', permissions: [] },
				{ id: 2, name: 'Manager', code: 'MANAGER', permissions: [] },
				{ id: 3, name: 'User', code: 'USER', permissions: [] },
			];

			const mockResponse = {
				status: 200,
				data: mockRoles,
			};

			authApi.mockResolvedValue(mockResponse);

			const params = {
				order: 'asc',
				sortingCol: 'name',
			};

			const result = await store.dispatch(actions.getRoleList(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getrole?order=asc&sortingCol=name',
			});

			expect(result).toEqual(mockResponse);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: USER.ROLE_LIST,
				payload: mockRoles,
			});
		});

		it('should handle empty parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRoleList({}));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getrole?order=&sortingCol=',
			});
		});

		it('should handle null parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRoleList(null));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getrole?order=&sortingCol=',
			});
		});

		it('should handle undefined parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRoleList(undefined));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getrole?order=&sortingCol=',
			});
		});

		it('should dispatch ROLE_LIST action with data', async () => {
			const mockRoles = [{ id: 1, name: 'Admin' }];
			const mockResponse = { status: 200, data: mockRoles };

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRoleList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(USER.ROLE_LIST);
			expect(dispatchedActions[0].payload).toEqual(mockRoles);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getRoleList({}))).rejects.toThrow(
				'Network error'
			);
		});

		it('should handle sorting by order ascending', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRoleList({ order: 'asc' }));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=asc'),
				})
			);
		});

		it('should handle sorting by order descending', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRoleList({ order: 'desc' }));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=desc'),
				})
			);
		});

		it('should handle sorting by specific column', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getRoleList({ sortingCol: 'createdDate' })
			);

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('sortingCol=createdDate'),
				})
			);
		});

		it('should return empty array when no roles exist', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getRoleList({}));

			expect(result.data).toEqual([]);
		});
	});

	describe('getModuleList', () => {
		it('should fetch module list by role code successfully', async () => {
			const mockModules = [
				{ id: 1, name: 'Dashboard', code: 'DASHBOARD', enabled: true },
				{ id: 2, name: 'Reports', code: 'REPORTS', enabled: true },
				{ id: 3, name: 'Settings', code: 'SETTINGS', enabled: false },
			];

			const mockResponse = {
				status: 200,
				data: mockModules,
			};

			authApi.mockResolvedValue(mockResponse);

			const roleCode = 'ADMIN';
			const result = await store.dispatch(actions.getModuleList(roleCode));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/roleModule/getModuleListByRoleCode?roleCode=ADMIN',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle numeric role ID', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getModuleList(123));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('roleCode=123'),
				})
			);
		});

		it('should handle fetch error for module list', async () => {
			const mockError = new Error('Failed to fetch modules');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getModuleList('ADMIN'))
			).rejects.toThrow('Failed to fetch modules');
		});

		it('should not dispatch any action (only returns data)', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getModuleList('USER'));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should return module list with permissions', async () => {
			const mockModules = [
				{
					id: 1,
					name: 'Users',
					permissions: ['create', 'read', 'update', 'delete'],
				},
			];
			const mockResponse = { status: 200, data: mockModules };

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getModuleList('ADMIN'));

			expect(result.data[0].permissions).toBeDefined();
			expect(result.data[0].permissions.length).toBe(4);
		});
	});

	describe('getUsersCountForRole', () => {
		it('should fetch users count for role successfully', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 15, roleId: 1 },
			};

			authApi.mockResolvedValue(mockResponse);

			const roleId = 1;
			const result = await store.dispatch(actions.getUsersCountForRole(roleId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/roleModule/getUsersCountForRole?roleId=1',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle role with zero users', async () => {
			const mockResponse = { status: 200, data: { count: 0 } };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getUsersCountForRole(5));

			expect(result.data.count).toBe(0);
		});

		it('should handle role with multiple users', async () => {
			const mockResponse = { status: 200, data: { count: 100 } };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getUsersCountForRole(2));

			expect(result.data.count).toBe(100);
		});

		it('should handle fetch error for users count', async () => {
			const mockError = new Error('Failed to get user count');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getUsersCountForRole(1))
			).rejects.toThrow('Failed to get user count');
		});

		it('should not dispatch any action', async () => {
			const mockResponse = { status: 200, data: { count: 5 } };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getUsersCountForRole(3));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('deleteRole', () => {
		it('should delete role successfully', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Role deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const roleCode = 'CUSTOM_ROLE';
			const result = await store.dispatch(actions.deleteRole(roleCode));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/roleModule/delete?roleCode=CUSTOM_ROLE',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle numeric role code', async () => {
			const mockResponse = { status: 200, data: {} };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.deleteRole(999));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('roleCode=999'),
				})
			);
		});

		it('should handle delete error', async () => {
			const mockError = new Error('Cannot delete role');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.deleteRole('ADMIN'))
			).rejects.toThrow('Cannot delete role');
		});

		it('should not dispatch any action on delete', async () => {
			const mockResponse = { status: 200, data: {} };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.deleteRole('ROLE_TO_DELETE'));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should return success response on delete', async () => {
			const mockResponse = {
				status: 200,
				data: { success: true, deletedId: 'ROLE123' },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.deleteRole('ROLE123'));

			expect(result.status).toBe(200);
			expect(result.data.success).toBe(true);
		});
	});

	describe('API Error Handling', () => {
		it('should handle 401 Unauthorized error', async () => {
			const mockError = new Error('Unauthorized');
			mockError.response = { status: 401 };
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getRoleList({}))).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle 403 Forbidden error', async () => {
			const mockError = new Error('Forbidden');
			mockError.response = { status: 403 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.deleteRole('ADMIN'))
			).rejects.toThrow('Forbidden');
		});

		it('should handle 404 Not Found error', async () => {
			const mockError = new Error('Role not found');
			mockError.response = { status: 404 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getModuleList('NONEXISTENT'))
			).rejects.toThrow('Role not found');
		});

		it('should handle 500 Internal Server Error', async () => {
			const mockError = new Error('Internal Server Error');
			mockError.response = { status: 500 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getUsersCountForRole(1))
			).rejects.toThrow('Internal Server Error');
		});
	});

	describe('Multiple concurrent requests', () => {
		it('should handle concurrent API calls', async () => {
			const mockRoleList = { status: 200, data: [{ id: 1 }] };
			const mockModuleList = { status: 200, data: [{ id: 2 }] };
			const mockUserCount = { status: 200, data: { count: 5 } };

			authApi
				.mockResolvedValueOnce(mockRoleList)
				.mockResolvedValueOnce(mockModuleList)
				.mockResolvedValueOnce(mockUserCount);

			await Promise.all([
				store.dispatch(actions.getRoleList({})),
				store.dispatch(actions.getModuleList('ADMIN')),
				store.dispatch(actions.getUsersCountForRole(1)),
			]);

			expect(authApi).toHaveBeenCalledTimes(3);
			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(1); // Only getRoleList dispatches
		});
	});
});
