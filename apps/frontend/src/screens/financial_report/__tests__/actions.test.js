import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';
import { REPORTS } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Financial Report Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getProfitAndLossReport', () => {
		it('should call API with correct date parameters', async () => {
			const mockResponse = {
				status: 200,
				data: { revenue: 100000, expenses: 60000, profit: 40000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
			};

			const result = await store.dispatch(actions.getProfitAndLossReport(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/financialReport/profitandloss?startDate=2024-01-01&endDate=2024-12-31',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle different date ranges', async () => {
			const mockResponse = { status: 200, data: {} };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getProfitAndLossReport({
					startDate: '2024-06-01',
					endDate: '2024-06-30',
				})
			);

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('startDate=2024-06-01');
			expect(apiCall.url).toContain('endDate=2024-06-30');
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch P&L report');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getProfitAndLossReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch P&L report');
		});
	});

	describe('getCashFlowReport', () => {
		it('should call API with correct parameters', async () => {
			const mockResponse = {
				status: 200,
				data: { operatingCash: 50000, investingCash: -20000, financingCash: 10000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
			};

			const result = await store.dispatch(actions.getCashFlowReport(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/financialReport/cashflow?startDate=2024-01-01&endDate=2024-12-31',
			});

			expect(result.status).toBe(200);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch cash flow');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getCashFlowReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch cash flow');
		});
	});

	describe('getAgingReport', () => {
		it('should call API with date parameters', async () => {
			const mockResponse = {
				status: 200,
				data: { current: 10000, thirtyDays: 5000, sixtyDays: 2000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getAgingReport({
					startDate: '2024-01-01',
					endDate: '2024-12-31',
				})
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/simpleaccountReports/getAgingReport?startDate=2024-01-01&endDate=2024-12-31',
			});

			expect(result.status).toBe(200);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch aging report');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getAgingReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch aging report');
		});
	});

	describe('getSalesByCustomer', () => {
		it('should call API and return sales data', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ customerId: 1, customerName: 'Customer A', sales: 50000 },
					{ customerId: 2, customerName: 'Customer B', sales: 75000 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getSalesByCustomer({
					startDate: '2024-01-01',
					endDate: '2024-12-31',
				})
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/simpleaccountReports/salesbycustomer?startDate=2024-01-01&endDate=2024-12-31',
			});

			expect(result.data).toHaveLength(2);
		});

		it('should handle empty sales data', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getSalesByCustomer({
					startDate: '2024-01-01',
					endDate: '2024-12-31',
				})
			);

			expect(result.data).toEqual([]);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch sales by customer');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getSalesByCustomer({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch sales by customer');
		});
	});

	describe('getCustomerAccountStatement', () => {
		it('should call API with contactId parameter', async () => {
			const mockResponse = {
				status: 200,
				data: [{ transactionId: 1, amount: 5000, date: '2024-01-15' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
				contactId: 123,
			};

			const result = await store.dispatch(
				actions.getCustomerAccountStatement(postData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/simpleaccountReports/statementOfAccounts?startDate=2024-01-01&endDate=2024-12-31&contactId=123',
			});

			expect(result.status).toBe(200);
		});

		it('should handle request without contactId', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(
				actions.getCustomerAccountStatement({
					startDate: '2024-01-01',
					endDate: '2024-12-31',
				})
			);

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).not.toContain('&contactId');
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch statement');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getCustomerAccountStatement({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch statement');
		});
	});

	describe('getFtaAuditReport', () => {
		it('should call API with all required parameters', async () => {
			const mockResponse = {
				status: 200,
				data: { auditData: [] },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
				companyId: 1,
				userId: 2,
				taxAgencyId: 3,
			};

			await store.dispatch(actions.getFtaAuditReport(postData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('startDate=2024-01-01');
			expect(apiCall.url).toContain('endDate=2024-12-31');
			expect(apiCall.url).toContain('companyId=1');
			expect(apiCall.url).toContain('userId=2');
			expect(apiCall.url).toContain('taxAgencyId=3');
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch FTA audit report');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getFtaAuditReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
						companyId: 1,
						userId: 2,
						taxAgencyId: 3,
					})
				)
			).rejects.toThrow('Failed to fetch FTA audit report');
		});
	});

	describe('getCompany', () => {
		it('should dispatch COMPANY_PROFILE action on successful API call', async () => {
			const mockCompanyData = [
				{
					id: 1,
					name: 'Test Company',
					address: '123 Business Street',
					taxNumber: 'TRN123456',
				},
			];

			const mockResponse = {
				status: 200,
				data: mockCompanyData,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCompany());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: REPORTS.COMPANY_PROFILE,
				payload: { data: mockCompanyData },
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: 'rest/company/getById?id=10000',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch company');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCompany())).rejects.toThrow(
				'Failed to fetch company'
			);
		});
	});

	describe('getPayrollSummaryReport', () => {
		it('should call API with date parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ employeeId: 1, name: 'Employee A', salary: 5000 },
					{ employeeId: 2, name: 'Employee B', salary: 6000 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getPayrollSummaryReport({
					startDate: '2024-01-01',
					endDate: '2024-12-31',
				})
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/simpleaccountReports/getPayrollSummary?startDate=2024-01-01&endDate=2024-12-31',
			});

			expect(result.data).toHaveLength(2);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch payroll summary');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getPayrollSummaryReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch payroll summary');
		});
	});

	describe('getCustomerList', () => {
		it('should call API and return customer data', async () => {
			const mockCustomers = [
				{ id: 1, name: 'Customer A', contactType: 2 },
				{ id: 2, name: 'Customer B', contactType: 2 },
			];

			const mockResponse = {
				status: 200,
				data: mockCustomers,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCustomerList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=2',
			});

			expect(result).toEqual(mockCustomers);
		});

		it('should handle empty customer list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCustomerList());

			expect(result).toEqual([]);
		});

		it('should handle non-200 status', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCustomerList());

			expect(result).toEqual(mockResponse);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch customers');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCustomerList())).rejects.toThrow(
				'Failed to fetch customers'
			);
		});
	});

	describe('getColumnConfigs', () => {
		it('should call API with config id', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, columns: ['col1', 'col2', 'col3'] },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				id: 1,
				startDate: '2024-01-01',
				endDate: '2024-12-31',
			};

			const result = await store.dispatch(actions.getColumnConfigs(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/reportsconfiguration/getById?id=1',
			});

			expect(result.status).toBe(200);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch column configs');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getColumnConfigs({ id: 1 }))
			).rejects.toThrow('Failed to fetch column configs');
		});
	});

	describe('updateColumnConfigs', () => {
		it('should call API with POST method and config data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Updated successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				id: 1,
				columns: ['col1', 'col2', 'col3'],
			};

			const result = await store.dispatch(actions.updateColumnConfigs(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/reportsconfiguration/update',
				data: postData,
			});

			expect(result.status).toBe(200);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to update column configs');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.updateColumnConfigs({ id: 1 }))
			).rejects.toThrow('Failed to update column configs');
		});
	});

	describe('Error handling across all actions', () => {
		it('should handle network errors', async () => {
			const mockError = new Error('Network Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getProfitAndLossReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Network Error');
		});

		it('should handle unauthorized errors', async () => {
			const mockError = new Error('Unauthorized');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCompany())).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle server errors', async () => {
			const mockError = new Error('Internal Server Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getBalanceReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Internal Server Error');
		});
	});
});
