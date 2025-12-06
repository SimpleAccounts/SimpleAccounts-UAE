import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { PAYMENT } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Payment Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getCurrencyList', () => {
		it('should fetch currency list successfully', async () => {
			const mockCurrencies = [
				{ code: 'AED', name: 'UAE Dirham' },
				{ code: 'USD', name: 'US Dollar' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCurrencies,
			});

			await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency/getactivecurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PAYMENT.CURRENCY_LIST,
				payload: { status: 200, data: mockCurrencies },
			});
		});

		it('should handle currency list error', async () => {
			authApi.mockRejectedValue(new Error('Currency service unavailable'));

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Currency service unavailable'
			);
		});
	});

	describe('getBankList', () => {
		it('should fetch bank list successfully', async () => {
			const mockBanks = [
				{ bankId: 1, bankName: 'Emirates NBD' },
				{ bankId: 2, bankName: 'Dubai Islamic Bank' },
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
				type: PAYMENT.BANK_LIST,
				payload: { status: 200, data: mockBanks },
			});
		});

		it('should handle bank list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch banks'));

			await expect(store.dispatch(actions.getBankList())).rejects.toThrow(
				'Failed to fetch banks'
			);
		});
	});

	describe('getSupplierContactList', () => {
		it('should fetch supplier contact list successfully', async () => {
			const mockSuppliers = [
				{ supplierId: 1, supplierName: 'Supplier A' },
				{ supplierId: 2, supplierName: 'Supplier B' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockSuppliers,
			});

			const contactType = 1;
			await store.dispatch(actions.getSupplierContactList(contactType));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/contact/getContactsForDropdown?contactType=${contactType}`,
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PAYMENT.SUPPLIER_LIST,
				payload: { status: 200, data: mockSuppliers },
			});
		});

		it('should handle supplier list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch suppliers'));

			await expect(
				store.dispatch(actions.getSupplierContactList(1))
			).rejects.toThrow('Failed to fetch suppliers');
		});
	});

	describe('getSupplierInvoiceList', () => {
		it('should fetch supplier invoice list successfully', async () => {
			const mockInvoices = [
				{ invoiceId: 1, invoiceNumber: 'INV-001', amount: 10000 },
				{ invoiceId: 2, invoiceNumber: 'INV-002', amount: 15000 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoices,
			});

			await store.dispatch(actions.getSupplierInvoiceList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/invoice/getInvoicesForDropdown?type=1',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PAYMENT.INVOICE_LIST,
				payload: { status: 200, data: mockInvoices },
			});
		});

		it('should handle invoice list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch invoices'));

			await expect(
				store.dispatch(actions.getSupplierInvoiceList())
			).rejects.toThrow('Failed to fetch invoices');
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
				type: PAYMENT.PROJECT_LIST,
				payload: { status: 200, data: mockProjects },
			});
		});

		it('should handle project list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch projects'));

			await expect(store.dispatch(actions.getProjectList())).rejects.toThrow(
				'Failed to fetch projects'
			);
		});
	});

	describe('getPaymentList', () => {
		it('should fetch payment list successfully', async () => {
			const mockPayments = [
				{ paymentId: 1, amount: 5000, paymentDate: '2023-12-01' },
				{ paymentId: 2, amount: 7500, paymentDate: '2023-12-05' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockPayments,
			});

			const params = {
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'paymentDate',
				paginationDisable: false,
			};

			await store.dispatch(actions.getPaymentList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PAYMENT.PAYMENT_LIST,
				payload: { status: 200, data: mockPayments },
			});
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				supplierId: { value: 'supplier123' },
				invoiceAmount: 5000,
				paymentDate: '2023-12-01',
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'amount',
				paginationDisable: false,
			};

			await store.dispatch(actions.getPaymentList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('supplierId=supplier123'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('invoiceAmount=5000'),
				})
			);
		});

		it('should format date correctly when provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const dateToTest = '2023-12-15';
			const params = {
				paymentDate: dateToTest,
				paginationDisable: false,
			};

			await store.dispatch(actions.getPaymentList(params));

			const expectedDateFormat = moment(dateToTest).format('YYYY-MM-DD');
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining(`paymentDate=${expectedDateFormat}`),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getPaymentList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getPaymentList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('removeBulkPayments', () => {
		it('should remove bulk payments successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulkPayments(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/payment/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulkPayments({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});
	});

	describe('createSupplier', () => {
		it('should create supplier successfully', async () => {
			const mockSupplierData = {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john.doe@example.com',
				contactType: 1,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { id: 1, ...mockSupplierData },
			});

			const result = await store.dispatch(
				actions.createSupplier(mockSupplierData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/contact/save',
				data: mockSupplierData,
			});

			expect(result.status).toBe(200);
		});

		it('should handle create supplier error', async () => {
			authApi.mockRejectedValue(new Error('Creation failed'));

			await expect(
				store.dispatch(actions.createSupplier({}))
			).rejects.toThrow('Creation failed');
		});
	});

	describe('getInvoiceById', () => {
		it('should fetch invoice by ID successfully', async () => {
			const invoiceId = 123;
			const mockInvoice = {
				invoiceId: 123,
				invoiceNumber: 'INV-123',
				amount: 10000,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoice,
			});

			const result = await store.dispatch(actions.getInvoiceById(invoiceId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/invoice/getInvoiceById?id=${invoiceId}`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockInvoice);
		});

		it('should handle invoice fetch error', async () => {
			authApi.mockRejectedValue(new Error('Invoice not found'));

			await expect(store.dispatch(actions.getInvoiceById(123))).rejects.toThrow(
				'Invoice not found'
			);
		});
	});

	describe('getCountryList', () => {
		it('should fetch country list successfully', async () => {
			const mockCountries = [
				{ code: 'AE', name: 'United Arab Emirates' },
				{ code: 'US', name: 'United States' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCountries,
			});

			await store.dispatch(actions.getCountryList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getcountry',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PAYMENT.COUNTRY_LIST,
				payload: { status: 200, data: mockCountries },
			});
		});

		it('should handle country list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch countries'));

			await expect(store.dispatch(actions.getCountryList())).rejects.toThrow(
				'Failed to fetch countries'
			);
		});
	});

	describe('getStateList', () => {
		it('should fetch state list successfully', async () => {
			const mockStates = [
				{ code: 'DXB', name: 'Dubai' },
				{ code: 'AUH', name: 'Abu Dhabi' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockStates,
			});

			const countryCode = 'AE';
			const result = await store.dispatch(actions.getStateList(countryCode));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/datalist/getstate?countryCode=${countryCode}`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockStates);
		});

		it('should handle state list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch states'));

			await expect(store.dispatch(actions.getStateList('AE'))).rejects.toThrow(
				'Failed to fetch states'
			);
		});
	});

	describe('Error Handling', () => {
		it('should handle network timeout', async () => {
			const timeoutError = new Error('Request timeout');
			timeoutError.code = 'ECONNABORTED';
			authApi.mockRejectedValue(timeoutError);

			await expect(
				store.dispatch(actions.getPaymentList({}))
			).rejects.toThrow('Request timeout');
		});

		it('should handle 401 unauthorized error', async () => {
			const unauthorizedError = new Error('Unauthorized');
			unauthorizedError.response = { status: 401 };
			authApi.mockRejectedValue(unauthorizedError);

			await expect(store.dispatch(actions.getBankList())).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle 500 server error', async () => {
			const serverError = new Error('Internal server error');
			serverError.response = { status: 500 };
			authApi.mockRejectedValue(serverError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Internal server error'
			);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty payment list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getPaymentList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PAYMENT.PAYMENT_LIST,
				payload: { status: 200, data: [] },
			});
		});

		it('should handle null parameters gracefully', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				supplierId: null,
				paymentDate: null,
				paginationDisable: false,
			};

			await store.dispatch(actions.getPaymentList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle large bulk delete operation', async () => {
			const largeIdArray = Array.from({ length: 100 }, (_, i) => i + 1);
			authApi.mockResolvedValue({ status: 200, data: { message: 'Success' } });

			await store.dispatch(actions.removeBulkPayments({ ids: largeIdArray }));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { ids: largeIdArray },
				})
			);
		});
	});
});
