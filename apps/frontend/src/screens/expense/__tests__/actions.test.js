import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { EXPENSE } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Expense Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getExpenseList', () => {
		it('should fetch expense list successfully', async () => {
			const mockData = [
				{ id: 1, amount: 1000, description: 'Travel expense' },
				{ id: 2, amount: 500, description: 'Office supplies' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockData,
			});

			const params = {
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'date',
				paginationDisable: false,
			};

			await store.dispatch(actions.getExpenseList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.EXPENSE_LIST,
				payload: mockData,
			});
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				payee: { value: 'supplier1' },
				transactionCategoryId: { value: 'cat1' },
				expenseDate: '2023-12-01',
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'amount',
				paginationDisable: false,
			};

			await store.dispatch(actions.getExpenseList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('payee=supplier1'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('transactionCategoryId=cat1'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('expenseDate=2023-12-01'),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getExpenseList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getExpenseList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('getSupplierList', () => {
		it('should fetch supplier list successfully', async () => {
			const mockSuppliers = [
				{ contactId: 1, firstName: 'Supplier A' },
				{ contactId: 2, firstName: 'Supplier B' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockSuppliers,
			});

			await store.dispatch(actions.getSupplierList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=1',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.SUPPLIER_LIST,
				payload: mockSuppliers,
			});
		});

		it('should handle supplier list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch suppliers'));

			await expect(store.dispatch(actions.getSupplierList())).rejects.toThrow(
				'Failed to fetch suppliers'
			);
		});
	});

	describe('getCurrencyList', () => {
		it('should fetch currency list successfully', async () => {
			const mockCurrencies = [
				{ code: 'USD', name: 'US Dollar' },
				{ code: 'AED', name: 'UAE Dirham' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCurrencies,
			});

			const result = await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency/getactivecurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.CURRENCY_LIST,
				payload: { data: mockCurrencies },
			});

			expect(result.status).toBe(200);
		});

		it('should handle currency list error', async () => {
			authApi.mockRejectedValue(new Error('Currency service unavailable'));

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Currency service unavailable'
			);
		});
	});

	describe('getProjectList', () => {
		it('should fetch project list successfully', async () => {
			const mockProjects = [
				{ projectId: 1, projectName: 'Project Alpha' },
				{ projectId: 2, projectName: 'Project Beta' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockProjects,
			});

			await store.dispatch(actions.getProjectList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/project/getProjectsForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.PROJECT_LIST,
				payload: mockProjects,
			});
		});
	});

	describe('removeBulkExpenses', () => {
		it('should remove bulk expenses successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulkExpenses(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/expense/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulkExpenses({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});
	});

	describe('getBankList', () => {
		it('should fetch bank list successfully', async () => {
			const mockBanks = [
				{ bankId: 1, bankName: 'Bank A' },
				{ bankId: 2, bankName: 'Bank B' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockBanks,
			});

			await store.dispatch(actions.getBankList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/bank/list',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.BANK_LIST,
				payload: { status: 200, data: mockBanks },
			});
		});
	});

	describe('getExpenseCategoriesList', () => {
		it('should fetch expense categories successfully', async () => {
			const mockCategories = [
				{ id: 1, name: 'Travel' },
				{ id: 2, name: 'Office Supplies' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			await store.dispatch(actions.getExpenseCategoriesList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactioncategory/getForExpenses',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.EXPENSE_CATEGORIES_LIST,
				payload: mockCategories,
			});
		});
	});

	describe('getVatList', () => {
		it('should fetch VAT list successfully', async () => {
			const mockVatList = [
				{ id: 1, name: 'Standard Rate', rate: 5 },
				{ id: 2, name: 'Zero Rate', rate: 0 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatList,
			});

			await store.dispatch(actions.getVatList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/vat/getList',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.VAT_LIST,
				payload: { status: 200, data: mockVatList },
			});
		});
	});

	describe('getEmployeeList', () => {
		it('should fetch employee list successfully', async () => {
			const mockEmployees = [
				{ id: 1, name: 'John Doe' },
				{ id: 2, name: 'Jane Smith' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockEmployees,
			});

			const result = await store.dispatch(actions.getEmployeeList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/employee/getEmployeesForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.EMPLOYEE_LIST,
				payload: mockEmployees,
			});

			expect(result.data).toEqual(mockEmployees);
		});
	});

	describe('postExpense', () => {
		it('should post expense successfully', async () => {
			const mockExpenseData = {
				amount: 1500,
				description: 'Client meeting',
				category: 'Travel',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { id: 1, ...mockExpenseData },
			});

			const result = await store.dispatch(actions.postExpense(mockExpenseData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/expense/posting',
				data: mockExpenseData,
			});

			expect(result.status).toBe(200);
		});

		it('should handle post expense error', async () => {
			authApi.mockRejectedValue(new Error('Posting failed'));

			await expect(
				store.dispatch(actions.postExpense({}))
			).rejects.toThrow('Posting failed');
		});
	});

	describe('deleteExpense', () => {
		it('should delete expense successfully', async () => {
			const expenseId = 123;

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.deleteExpense(expenseId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: `/rest/expense/delete?expenseId=${expenseId}`,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getPaymentMode', () => {
		it('should fetch payment mode list successfully', async () => {
			const mockPayModes = [
				{ id: 1, label: 'Cash' },
				{ id: 2, label: 'Card' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockPayModes,
			});

			await store.dispatch(actions.getPaymentMode());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/payMode',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.PAY_MODE,
				payload: mockPayModes,
			});
		});
	});

	describe('unPostExpense', () => {
		it('should unpost expense successfully', async () => {
			const mockData = { id: 1 };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Unposted successfully' },
			});

			const result = await store.dispatch(actions.unPostExpense(mockData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/invoice/undoPosting',
				data: mockData,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getUserForDropdown', () => {
		it('should fetch users for dropdown successfully', async () => {
			const mockUsers = [
				{ id: 1, name: 'User 1' },
				{ id: 2, name: 'User 2' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockUsers,
			});

			await store.dispatch(actions.getUserForDropdown());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/user/getUserForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: EXPENSE.USER_LIST,
				payload: mockUsers,
			});
		});
	});

	describe('getTaxTreatment', () => {
		it('should fetch tax treatment successfully', async () => {
			const mockTaxTreatment = [
				{ id: 1, name: 'Standard' },
				{ id: 2, name: 'Exempt' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockTaxTreatment,
			});

			const result = await store.dispatch(actions.getTaxTreatment());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/getTaxTreatment',
			});

			expect(result.data).toEqual(mockTaxTreatment);
		});
	});

	describe('getCompanyDetails', () => {
		it('should fetch company details successfully', async () => {
			const mockCompanyDetails = {
				companyName: 'Test Company',
				address: '123 Main St',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockCompanyDetails,
			});

			const result = await store.dispatch(actions.getCompanyDetails());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/company/getCompanyDetails',
			});

			expect(result.data).toEqual(mockCompanyDetails);
		});
	});
});
