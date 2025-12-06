import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { EMPLOYEE_DESIGNATION } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Designation Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getEmployeeDesignationList', () => {
		it('should dispatch EMPLOYEE_DESIGNATION_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, designationName: 'Manager', code: 'MGR-001' },
					{ id: 2, designationName: 'Developer', code: 'DEV-001' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				pageNo: 1,
				pageSize: 10,
				order: 'asc',
				sortingCol: 'designationName',
				paginationDisable: false,
			};

			const result = await store.dispatch(actions.getEmployeeDesignationList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
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

			await store.dispatch(actions.getEmployeeDesignationList(postObj));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should call API with all parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				pageNo: 2,
				pageSize: 20,
				order: 'desc',
				sortingCol: 'code',
				paginationDisable: false,
			};

			await store.dispatch(actions.getEmployeeDesignationList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('pageNo=2');
			expect(apiCall.url).toContain('pageSize=20');
			expect(apiCall.url).toContain('order=desc');
			expect(apiCall.url).toContain('sortingCol=code');
		});

		it('should handle empty parameters with default values', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {};

			await store.dispatch(actions.getEmployeeDesignationList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('pageNo=');
			expect(apiCall.url).toContain('pageSize=');
		});

		it('should return response on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, designationName: 'Test' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getEmployeeDesignationList({ pageNo: 1 })
			);

			expect(result).toEqual(mockResponse);
		});

		it('should handle API errors gracefully', async () => {
			const mockError = new Error('Failed to fetch designations');
			authApi.mockRejectedValue(mockError);

			const postObj = { pageNo: 1 };

			await expect(
				store.dispatch(actions.getEmployeeDesignationList(postObj))
			).rejects.toThrow('Failed to fetch designations');
		});

		it('should call correct endpoint', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getEmployeeDesignationList({ pageNo: 1 }));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.method).toBe('GET');
			expect(apiCall.url).toContain('/rest/employeeDesignation/EmployeeDesignationList');
		});

		it('should handle large designation dataset', async () => {
			const largeDesignationList = Array.from({ length: 250 }, (_, i) => ({
				id: i + 1,
				designationName: `Designation ${i + 1}`,
				code: `DES-${String(i + 1).padStart(4, '0')}`,
			}));

			const mockResponse = {
				status: 200,
				data: largeDesignationList,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getEmployeeDesignationList({ pageNo: 1 })
			);

			expect(result.data).toHaveLength(250);
		});
	});

	describe('getParentDesignationList', () => {
		it('should dispatch EMPLOYEE_DESIGNATION_TYPE_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, typeName: 'Management', category: 'Leadership' },
					{ id: 2, typeName: 'Technical', category: 'Engineering' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getParentDesignationList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: mockResponse.data,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should call API with correct endpoint', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getParentDesignationList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employeeDesignation/getParentEmployeeDesignationForDropdown',
			});
		});

		it('should handle empty parent designation list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getParentDesignationList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload).toEqual([]);
		});

		it('should return response on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, typeName: 'Management' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getParentDesignationList());

			expect(result.status).toBe(200);
			expect(result.data).toHaveLength(1);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch parent designations');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getParentDesignationList())
			).rejects.toThrow('Failed to fetch parent designations');
		});

		it('should dispatch action regardless of obj parameter', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, typeName: 'Test' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getParentDesignationList({ test: 'param' }));

			expect(store.getActions()).toHaveLength(1);
		});

		it('should handle complex parent designation data', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{
						id: 1,
						typeName: 'Executive Management',
						category: 'Leadership',
						level: 7,
						description: 'Top level management',
					},
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getParentDesignationList());

			expect(result.data[0]).toHaveProperty('level', 7);
		});
	});

	describe('getEmployeeCountForDesignation', () => {
		it('should call API with designation id', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 15 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeCountForDesignation(123));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employeeDesignation/getEmployeeDesignationCount?id=123',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should return employee count on success', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 42 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeCountForDesignation(1));

			expect(result.data.count).toBe(42);
		});

		it('should handle zero employee count', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 0 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeCountForDesignation(999));

			expect(result.data.count).toBe(0);
		});

		it('should handle large employee count', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 5000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeCountForDesignation(5));

			expect(result.data.count).toBe(5000);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to get employee count');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getEmployeeCountForDesignation(123))
			).rejects.toThrow('Failed to get employee count');
		});

		it('should not dispatch any actions', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 10 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getEmployeeCountForDesignation(1));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should handle string id parameter', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 5 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getEmployeeCountForDesignation('designation-123'));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('id=designation-123');
		});

		it('should handle negative id values', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 0 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getEmployeeCountForDesignation(-1));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('id=-1');
		});

		it('should handle detailed count response', async () => {
			const mockResponse = {
				status: 200,
				data: {
					count: 25,
					active: 20,
					inactive: 5,
					details: { male: 15, female: 10 },
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeCountForDesignation(1));

			expect(result.data).toHaveProperty('active', 20);
			expect(result.data).toHaveProperty('inactive', 5);
		});

		it('should call authApi exactly once', async () => {
			const mockResponse = {
				status: 200,
				data: { count: 1 },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getEmployeeCountForDesignation(1));

			expect(authApi).toHaveBeenCalledTimes(1);
		});
	});

	describe('Action error handling', () => {
		it('should propagate API errors correctly for getEmployeeDesignationList', async () => {
			const apiError = new Error('API Error');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(
				actions.getEmployeeDesignationList({ pageNo: 1 })(dispatch)
			).rejects.toThrow('API Error');
		});

		it('should propagate API errors correctly for getParentDesignationList', async () => {
			const apiError = new Error('Parent API Error');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(actions.getParentDesignationList()(dispatch)).rejects.toThrow(
				'Parent API Error'
			);
		});

		it('should propagate API errors correctly for getEmployeeCountForDesignation', async () => {
			const apiError = new Error('Count API Error');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(actions.getEmployeeCountForDesignation(1)(dispatch)).rejects.toThrow(
				'Count API Error'
			);
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network Error');
			authApi.mockRejectedValue(networkError);

			await expect(
				actions.getEmployeeDesignationList({ pageNo: 1 })(jest.fn())
			).rejects.toThrow();
			await expect(actions.getParentDesignationList()(jest.fn())).rejects.toThrow();
			await expect(
				actions.getEmployeeCountForDesignation(1)(jest.fn())
			).rejects.toThrow();
		});
	});
});
