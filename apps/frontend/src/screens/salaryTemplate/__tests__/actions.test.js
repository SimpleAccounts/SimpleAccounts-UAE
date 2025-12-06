import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { SALARY_TEMPLATE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('SalaryTemplate Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getSalaryTemplateList', () => {
		it('should fetch salary template list successfully', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Template 1' },
					{ id: 2, name: 'Template 2' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getSalaryTemplateList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/payroll/getDefaultSalaryTemplates',
			});
			expect(result).toEqual(mockResponse);
		});

		it('should handle fetch salary template list with status 200', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getSalaryTemplateList());

			expect(result.status).toBe(200);
			expect(result.data).toEqual([]);
		});

		it('should handle fetch salary template list error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryTemplateList())
			).rejects.toThrow('Network error');
		});

		it('should not dispatch action when status is not 200', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getSalaryTemplateList());

			expect(result).toBeUndefined();
		});

		it('should handle API timeout error', async () => {
			const mockError = new Error('Request timeout');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryTemplateList())
			).rejects.toThrow('Request timeout');
		});
	});

	describe('getSalaryStructureForDropdown', () => {
		it('should fetch salary structure dropdown successfully', async () => {
			const mockData = [
				{ id: 1, label: 'Structure 1', value: 'struct1' },
				{ id: 2, label: 'Structure 2', value: 'struct2' },
			];

			const mockResponse = {
				status: 200,
				data: mockData,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getSalaryStructureForDropdown());

			const dispatchedActions = store.getActions();

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/payroll/getSalaryStructureForDropdown',
			});

			expect(dispatchedActions).toContainEqual({
				type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
				payload: {
					data: mockData,
				},
			});
		});

		it('should dispatch correct action on successful fetch', async () => {
			const mockData = [{ id: 1, name: 'Structure A' }];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			await store.dispatch(actions.getSalaryStructureForDropdown());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(1);
			expect(dispatchedActions[0].type).toBe(
				SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN
			);
		});

		it('should handle fetch salary structure error', async () => {
			const mockError = new Error('Database connection error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryStructureForDropdown())
			).rejects.toThrow('Database connection error');
		});

		it('should not dispatch action when status is not 200', async () => {
			authApi.mockResolvedValue({
				status: 500,
				data: null,
			});

			await store.dispatch(actions.getSalaryStructureForDropdown());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty data response', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getSalaryStructureForDropdown());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});
	});

	describe('getSalaryRolesForDropdown', () => {
		it('should fetch salary roles dropdown successfully', async () => {
			const mockRoles = [
				{ id: 1, label: 'Manager', value: 'manager' },
				{ id: 2, label: 'Developer', value: 'developer' },
			];

			const mockResponse = {
				status: 200,
				data: mockRoles,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getSalaryRolesForDropdown());

			const dispatchedActions = store.getActions();

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/payroll/getSalaryRolesForDropdown',
			});

			expect(dispatchedActions).toContainEqual({
				type: SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN,
				payload: {
					data: mockRoles,
				},
			});
		});

		it('should dispatch correct action with role data', async () => {
			const mockRoles = [
				{ id: 1, roleName: 'Senior Developer' },
				{ id: 2, roleName: 'Junior Developer' },
				{ id: 3, roleName: 'Tech Lead' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockRoles,
			});

			await store.dispatch(actions.getSalaryRolesForDropdown());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data.length).toBe(3);
		});

		it('should handle fetch salary roles error', async () => {
			const mockError = new Error('Unauthorized access');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRolesForDropdown())
			).rejects.toThrow('Unauthorized access');
		});

		it('should not dispatch when response status is not 200', async () => {
			authApi.mockResolvedValue({
				status: 403,
				data: null,
			});

			await store.dispatch(actions.getSalaryRolesForDropdown());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle null response data', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: null,
			});

			await store.dispatch(actions.getSalaryRolesForDropdown());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toBeNull();
		});
	});

	describe('API Error Handling', () => {
		it('should handle 401 Unauthorized error', async () => {
			const mockError = new Error('Unauthorized');
			mockError.response = { status: 401 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryTemplateList())
			).rejects.toThrow('Unauthorized');
		});

		it('should handle 404 Not Found error', async () => {
			const mockError = new Error('Not Found');
			mockError.response = { status: 404 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryStructureForDropdown())
			).rejects.toThrow('Not Found');
		});

		it('should handle 500 Server error', async () => {
			const mockError = new Error('Internal Server Error');
			mockError.response = { status: 500 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getSalaryRolesForDropdown())
			).rejects.toThrow('Internal Server Error');
		});
	});

	describe('Multiple concurrent requests', () => {
		it('should handle multiple concurrent API calls', async () => {
			const mockTemplates = { status: 200, data: [{ id: 1 }] };
			const mockStructures = { status: 200, data: [{ id: 2 }] };
			const mockRoles = { status: 200, data: [{ id: 3 }] };

			authApi
				.mockResolvedValueOnce(mockTemplates)
				.mockResolvedValueOnce(mockStructures)
				.mockResolvedValueOnce(mockRoles);

			await Promise.all([
				store.dispatch(actions.getSalaryTemplateList()),
				store.dispatch(actions.getSalaryStructureForDropdown()),
				store.dispatch(actions.getSalaryRolesForDropdown()),
			]);

			expect(authApi).toHaveBeenCalledTimes(3);
			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(2); // Only structure and roles dispatch actions
		});
	});
});
