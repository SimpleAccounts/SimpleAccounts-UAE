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

describe('Employee Bank Details Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getEmployeeList', () => {
		it('should fetch employee list with bank details successfully', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{
						id: 1,
						name: 'John Doe',
						email: 'john@example.com',
						bankDetails: {
							accountNumber: '123456789',
							bankName: 'Emirates NBD',
						},
					},
					{
						id: 2,
						name: 'Jane Smith',
						email: 'jane@example.com',
						bankDetails: {
							accountNumber: '987654321',
							bankName: 'ADCB',
						},
					},
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

			const params = { name: 'Ahmed' };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('name=Ahmed'),
				})
			);
		});

		it('should build correct URL with email filter', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { email: 'employee@company.ae' };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('email=employee@company.ae'),
				})
			);
		});

		it('should handle pagination parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { pageNo: 3, pageSize: 25 };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('pageNo=3&pageSize=25'),
				})
			);
		});

		it('should handle sorting parameters', async () => {
			const mockResponse = { status: 200, data: [] };
			authApi.mockResolvedValue(mockResponse);

			const params = { order: 'desc', sortingCol: 'bankName' };
			await store.dispatch(actions.getEmployeeList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('order=desc&sortingCol=bankName'),
				})
			);
		});

		it('should return employee data with bank account details', async () => {
			const mockData = [
				{
					id: 1,
					name: 'Employee 1',
					bankDetails: { accountNumber: '111', iban: 'AE123' },
				},
			];
			const mockResponse = { status: 200, data: mockData };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeList({}));

			expect(result.data[0].bankDetails).toBeDefined();
			expect(result.data[0].bankDetails.accountNumber).toBe('111');
		});
	});

	describe('getCurrencyList', () => {
		it('should fetch active currencies successfully', async () => {
			const mockCurrencies = [
				{ id: 1, code: 'AED', name: 'UAE Dirham', active: true },
				{ id: 2, code: 'USD', name: 'US Dollar', active: true },
				{ id: 3, code: 'SAR', name: 'Saudi Riyal', active: true },
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
				data: [{ id: 1, code: 'AED' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(1);
			expect(dispatchedActions[0].type).toBe(EMPLOYEE.CURRENCY_LIST);
		});

		it('should not dispatch action when status is not 200', async () => {
			const mockResponse = {
				status: 500,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Service unavailable');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Service unavailable'
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

		it('should fetch currencies for bank details dropdown', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, code: 'AED', symbol: 'د.إ' },
					{ id: 2, code: 'USD', symbol: '$' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data.length).toBe(2);
		});
	});

	describe('removeBulkEmployee', () => {
		it('should delete multiple employees successfully', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Employees deleted successfully', count: 3 },
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
				status: 403,
				data: { error: 'Forbidden' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.removeBulkEmployee([1]));

			expect(result).toBeUndefined();
		});

		it('should handle delete error', async () => {
			const mockError = new Error('Delete operation failed');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.removeBulkEmployee([1, 2]))
			).rejects.toThrow('Delete operation failed');
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
			const mockResponse = { status: 200, data: { deleted: 1 } };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.removeBulkEmployee([5]));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: [5],
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

		it('should delete employees with bank details', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Bank details removed', deleted: 2 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.removeBulkEmployee([10, 20]));

			expect(result.data.deleted).toBe(2);
		});
	});

	describe('API Error Handling', () => {
		it('should handle 401 Unauthorized error', async () => {
			const mockError = new Error('Unauthorized access');
			mockError.response = { status: 401 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getEmployeeList({}))
			).rejects.toThrow('Unauthorized access');
		});

		it('should handle 404 Not Found error', async () => {
			const mockError = new Error('Resource not found');
			mockError.response = { status: 404 };
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Resource not found'
			);
		});

		it('should handle 500 Internal Server Error', async () => {
			const mockError = new Error('Internal server error');
			mockError.response = { status: 500 };
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.removeBulkEmployee([1]))
			).rejects.toThrow('Internal server error');
		});
	});
});
