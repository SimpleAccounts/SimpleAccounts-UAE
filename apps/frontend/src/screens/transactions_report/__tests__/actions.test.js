import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';
import { TEMP } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Transactions Report Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getCustomerInvoiceReport', () => {
		it('should dispatch CUSTOMER_INVOICE_REPORT action on successful API call', async () => {
			const mockReportData = [
				{ id: 1, invoiceNo: 'INV-001', amount: 1000 },
				{ id: 2, invoiceNo: 'INV-002', amount: 2000 },
			];

			const mockResponse = {
				status: 200,
				data: mockReportData,
			};

			authApi.mockResolvedValue(mockResponse);

			const inputObj = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
				contactName: { value: 123, label: 'Customer A' },
				refNumber: 'INV-001',
			};

			await store.dispatch(actions.getCustomerInvoiceReport(inputObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: TEMP.CUSTOMER_INVOICE_REPORT,
				payload: { data: mockReportData },
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/transactionreport/customerInvoiceReport?refNumber=INV-001&contactId=123',
				data: inputObj,
			});
		});

		it('should handle request without contact name', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const inputObj = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
				contactName: '',
				refNumber: '',
			};

			await store.dispatch(actions.getCustomerInvoiceReport(inputObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('refNumber=&contactId=');
		});

		it('should handle request with only reference number', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, invoiceNo: 'INV-001' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const inputObj = {
				contactName: '',
				refNumber: 'INV-001',
			};

			await store.dispatch(actions.getCustomerInvoiceReport(inputObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('refNumber=INV-001');
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch report');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getCustomerInvoiceReport({}))
			).rejects.toThrow('Failed to fetch report');
		});
	});

	describe('getAccountBalanceReport', () => {
		it('should call API with correct parameters', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ accountId: 1, accountName: 'Cash', balance: 50000 },
					{ accountId: 2, accountName: 'Bank', balance: 100000 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
			};

			const result = await store.dispatch(
				actions.getAccountBalanceReport(postData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactionreport/accountBalanceReport?startDate=2024-01-01&endDate=2024-12-31',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle different date ranges', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = {
				startDate: '2023-06-01',
				endDate: '2023-06-30',
			};

			await store.dispatch(actions.getAccountBalanceReport(postData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('startDate=2023-06-01');
			expect(apiCall.url).toContain('endDate=2023-06-30');
		});

		it('should return response on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ accountId: 1, balance: 1000 }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(
				actions.getAccountBalanceReport({
					startDate: '2024-01-01',
					endDate: '2024-12-31',
				})
			);

			expect(result.status).toBe(200);
			expect(result.data).toHaveLength(1);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch balance report');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(
					actions.getAccountBalanceReport({
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					})
				)
			).rejects.toThrow('Failed to fetch balance report');
		});
	});

	describe('getContactNameList', () => {
		it('should dispatch CONTACT_LIST action on successful API call', async () => {
			const mockContacts = [
				{ id: 1, name: 'Contact A', email: 'contacta@example.com' },
				{ id: 2, name: 'Contact B', email: 'contactb@example.com' },
			];

			const mockResponse = {
				status: 200,
				data: mockContacts,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactNameList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: TEMP.CONTACT_LIST,
				payload: { data: mockContacts },
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/contactlist',
			});
		});

		it('should handle empty contact list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactNameList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch contacts');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getContactNameList())).rejects.toThrow(
				'Failed to fetch contacts'
			);
		});
	});

	describe('getAccountTypeList', () => {
		it('should dispatch ACCOUNT_TYPE_LIST action on successful API call', async () => {
			const mockAccountTypes = [
				{ id: 1, type: 'Savings', code: 'SAV' },
				{ id: 2, type: 'Current', code: 'CUR' },
			];

			const mockResponse = {
				status: 200,
				data: mockAccountTypes,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getAccountTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: TEMP.ACCOUNT_TYPE_LIST,
				payload: { data: mockAccountTypes },
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/bank/getaccounttype',
			});
		});

		it('should handle empty account type list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getAccountTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch account types');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getAccountTypeList())
			).rejects.toThrow('Failed to fetch account types');
		});
	});

	describe('getTransactionTypeList', () => {
		it('should dispatch TRANSACTION_TYPE_LIST action on successful API call', async () => {
			const mockTransactionTypes = [
				{ id: 1, name: 'Income', code: 'INC' },
				{ id: 2, name: 'Expense', code: 'EXP' },
			];

			const mockResponse = {
				status: 200,
				data: mockTransactionTypes,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: TEMP.TRANSACTION_TYPE_LIST,
				payload: { data: mockTransactionTypes },
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactionreport/getTransactionTypes',
			});
		});

		it('should handle empty transaction type list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch transaction types');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getTransactionTypeList())
			).rejects.toThrow('Failed to fetch transaction types');
		});
	});

	describe('getTransactionCategoryList', () => {
		it('should dispatch TRANSACTION_CATEGORY_LIST action on successful API call', async () => {
			const mockCategories = [
				{ id: 1, name: 'Sales', parentId: null },
				{ id: 2, name: 'Services', parentId: null },
				{ id: 3, name: 'Consulting', parentId: 2 },
			];

			const mockResponse = {
				status: 200,
				data: mockCategories,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionCategoryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: TEMP.TRANSACTION_CATEGORY_LIST,
				payload: { data: mockCategories },
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactioncategory/gettransactioncategory',
			});
		});

		it('should handle empty category list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionCategoryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload.data).toEqual([]);
		});

		it('should handle hierarchical category structure', async () => {
			const mockCategories = [
				{ id: 1, name: 'Parent Category', parentId: null },
				{ id: 2, name: 'Child Category', parentId: 1 },
			];

			const mockResponse = {
				status: 200,
				data: mockCategories,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTransactionCategoryList());

			const dispatchedActions = store.getActions();
			const categories = dispatchedActions[0].payload.data;
			expect(categories[0].parentId).toBeNull();
			expect(categories[1].parentId).toBe(1);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch categories');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getTransactionCategoryList())
			).rejects.toThrow('Failed to fetch categories');
		});
	});

	describe('Error handling across all actions', () => {
		it('should handle 404 errors', async () => {
			const mockError = new Error('Not Found');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getContactNameList())).rejects.toThrow(
				'Not Found'
			);
		});

		it('should handle network timeout errors', async () => {
			const mockError = new Error('Network timeout');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getTransactionTypeList())
			).rejects.toThrow('Network timeout');
		});

		it('should handle server errors', async () => {
			const mockError = new Error('Internal Server Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getTransactionCategoryList())
			).rejects.toThrow('Internal Server Error');
		});
	});
});
