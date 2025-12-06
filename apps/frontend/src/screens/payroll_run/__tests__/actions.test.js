import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { EMPLOYEEPAYROLL } from 'constants/types';
import { authApi, authFileUploadApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
	authFileUploadApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Payroll Run Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getPayrollEmployeeList', () => {
		it('should fetch payroll employee list successfully', async () => {
			const mockData = [
				{ id: 1, employeeName: 'John Doe', grossSalary: 10000, netSalary: 8500 },
				{ id: 2, employeeName: 'Jane Smith', grossSalary: 12000, netSalary: 10200 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			const presentDate = '2024-01-01';
			await store.dispatch(actions.getPayrollEmployeeList(presentDate));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/Salary/getSalaryPerMonthList?presentDate=${presentDate}`,
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
				payload: mockData,
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch payroll employees'));

			await expect(
				store.dispatch(actions.getPayrollEmployeeList('2024-01-01'))
			).rejects.toThrow('Failed to fetch payroll employees');
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 404,
				data: [],
			});

			await store.dispatch(actions.getPayrollEmployeeList('2024-01-01'));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty payroll employee list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getPayrollEmployeeList('2024-01-01'));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
				payload: [],
			});
		});
	});

	describe('getIncompletedEmployeeList', () => {
		it('should fetch incompleted employee list successfully', async () => {
			const mockIncompleteEmployees = [
				{ id: 1, name: 'Employee A', missingInfo: 'Bank Details' },
				{ id: 2, name: 'Employee B', missingInfo: 'Salary Structure' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: {
					incompleteEmployeeList: mockIncompleteEmployees,
				},
			});

			await store.dispatch(actions.getIncompletedEmployeeList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/Salary/getIncompleteEmployeeList',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST,
				payload: mockIncompleteEmployees,
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch incomplete employees'));

			await expect(
				store.dispatch(actions.getIncompletedEmployeeList())
			).rejects.toThrow('Failed to fetch incomplete employees');
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 500,
				data: {},
			});

			await store.dispatch(actions.getIncompletedEmployeeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('getSalaryDetailByEmployeeIdNoOfDays', () => {
		it('should fetch salary details successfully', async () => {
			const employeeId = 123;
			const mockResponse = {
				status: 200,
				data: {
					employeeId: 123,
					basicSalary: 8000,
					allowances: 2000,
					deductions: 500,
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getSalaryDetailByEmployeeIdNoOfDays(employeeId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/payroll/getSalaryDetailByEmployeeIdNoOfDays?id=${employeeId}`,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch salary details'));

			await expect(
				store.dispatch(actions.getSalaryDetailByEmployeeIdNoOfDays(123))
			).rejects.toThrow('Failed to fetch salary details');
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.getSalaryDetailByEmployeeIdNoOfDays(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('getEmployeeListWithDetails', () => {
		it('should fetch employee list with details successfully', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Employee 1', department: 'IT' },
					{ id: 2, name: 'Employee 2', department: 'HR' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getEmployeeListWithDetails());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/payroll/payrollemployee/list',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch employee details'));

			await expect(
				store.dispatch(actions.getEmployeeListWithDetails())
			).rejects.toThrow('Failed to fetch employee details');
		});
	});

	describe('updateSalaryComponentAsNoOfDays', () => {
		it('should update salary component successfully', async () => {
			const updateData = {
				employeeId: 123,
				noOfDays: 30,
				componentId: 456,
			};

			const mockResponse = {
				status: 200,
				data: { message: 'Updated successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.updateSalaryComponentAsNoOfDays(updateData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/payroll/updateSalaryComponentAsNoOfDays',
				data: updateData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle update error', async () => {
			authApi.mockRejectedValue(new Error('Update failed'));

			await expect(
				store.dispatch(actions.updateSalaryComponentAsNoOfDays({}))
			).rejects.toThrow('Update failed');
		});
	});

	describe('generateSalary', () => {
		it('should generate salary successfully', async () => {
			const salaryData = {
				employeeIds: [1, 2, 3],
				month: 'January',
				year: 2024,
			};

			const mockResponse = {
				status: 200,
				data: { message: 'Salary generated successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.generateSalary(salaryData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/Salary/generateSalary',
				data: salaryData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle generation error', async () => {
			authApi.mockRejectedValue(new Error('Salary generation failed'));

			await expect(
				store.dispatch(actions.generateSalary({}))
			).rejects.toThrow('Salary generation failed');
		});
	});

	describe('getPayrollList', () => {
		it('should fetch payroll list successfully', async () => {
			const mockPayrollData = [
				{ id: 1, payPeriod: 'January 2024', status: 'Draft' },
				{ id: 2, payPeriod: 'February 2024', status: 'Approved' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockPayrollData,
			});

			const params = {
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'payPeriod',
				paginationDisable: false,
			};

			await store.dispatch(actions.getPayrollList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.PAYROLL_LIST,
				payload: mockPayrollData,
			});
		});

		it('should build URL with pagination parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'status',
			};

			await store.dispatch(actions.getPayrollList(params));

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

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch payroll list'));

			await expect(
				store.dispatch(actions.getPayrollList({}))
			).rejects.toThrow('Failed to fetch payroll list');
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 500,
				data: [],
			});

			await store.dispatch(actions.getPayrollList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('getUserAndRole', () => {
		it('should fetch user and role data successfully', async () => {
			const mockUserRoleData = [
				{ userId: 1, userName: 'Admin', role: 'Administrator' },
				{ userId: 2, userName: 'Manager', role: 'Manager' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockUserRoleData,
			});

			await store.dispatch(actions.getUserAndRole());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/payroll/getUserAndRole',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN,
				payload: {
					data: mockUserRoleData,
				},
			});
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch users and roles'));

			await expect(store.dispatch(actions.getUserAndRole())).rejects.toThrow(
				'Failed to fetch users and roles'
			);
		});

		it('should only dispatch on status 200', async () => {
			authApi.mockResolvedValue({
				status: 404,
				data: [],
			});

			await store.dispatch(actions.getUserAndRole());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('getCompanyDetails', () => {
		it('should fetch company details successfully', async () => {
			const mockCompanyDetails = {
				companyName: 'Test Company',
				address: '123 Main St',
				taxNumber: 'TAX123',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockCompanyDetails,
			});

			const result = await store.dispatch(actions.getCompanyDetails());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/company/getCompanyDetails',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCompanyDetails);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch company details'));

			await expect(store.dispatch(actions.getCompanyDetails())).rejects.toThrow(
				'Failed to fetch company details'
			);
		});

		it('should only return response on status 200', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { companyName: 'Test' },
			});

			const result = await store.dispatch(actions.getCompanyDetails());
			expect(result).toBeDefined();
		});
	});

	describe('updateCompany', () => {
		it('should update company details successfully', async () => {
			const updateData = {
				companyName: 'Updated Company',
				address: '456 New St',
			};

			const mockResponse = {
				status: 200,
				data: { message: 'Company updated successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.updateCompany(updateData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/company/updateCompanyDetailsForPayrollRun',
				data: updateData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle update error', async () => {
			authFileUploadApi.mockRejectedValue(new Error('Update failed'));

			await expect(
				store.dispatch(actions.updateCompany({}))
			).rejects.toThrow('Update failed');
		});

		it('should not dispatch any actions', async () => {
			authFileUploadApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.updateCompany({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});
});
