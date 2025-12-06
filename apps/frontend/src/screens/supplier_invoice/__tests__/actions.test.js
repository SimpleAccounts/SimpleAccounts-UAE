import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { SUPPLIER_INVOICE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('SupplierInvoice Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getSupplierInvoiceList', () => {
		it('should fetch supplier invoice list successfully', async () => {
			const mockInvoices = [
				{ id: 1, invoiceNumber: 'SI-001', amount: 5000 },
				{ id: 2, invoiceNumber: 'SI-002', amount: 3000 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoices,
			});

			const params = {
				supplierId: { value: 'supplier1' },
				referenceNumber: 'REF-001',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'date',
				paginationDisable: false,
			};

			await store.dispatch(actions.getSupplierInvoiceList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST,
				payload: { data: mockInvoices },
			});
		});

		it('should build URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				supplierId: { value: '123' },
				referenceNumber: 'REF-001',
				invoiceDate: '2023-12-01',
				invoiceDueDate: '2023-12-31',
				amount: '5000',
				status: { value: 'approved' },
				pageNo: 2,
				pageSize: 20,
				paginationDisable: false,
			};

			await store.dispatch(actions.getSupplierInvoiceList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('contact=123'),
				})
			);
		});

		it('should not dispatch when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(
				actions.getSupplierInvoiceList({ paginationDisable: true })
			);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			await expect(
				store.dispatch(actions.getSupplierInvoiceList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('getProjectList', () => {
		it('should fetch project list successfully', async () => {
			const mockProjects = [
				{ id: 1, projectName: 'Project Alpha' },
				{ id: 2, projectName: 'Project Beta' },
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
				type: SUPPLIER_INVOICE.PROJECT_LIST,
				payload: { data: mockProjects },
			});
		});

		it('should handle project list error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch projects'));

			await expect(store.dispatch(actions.getProjectList())).rejects.toThrow(
				'Failed to fetch projects'
			);
		});
	});

	describe('getContactList', () => {
		it('should fetch contact list with contact type', async () => {
			const mockContacts = [
				{ contactId: 1, firstName: 'John', lastName: 'Doe' },
				{ contactId: 2, firstName: 'Jane', lastName: 'Smith' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockContacts,
			});

			await store.dispatch(actions.getContactList('1'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=1',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.CONTACT_LIST,
				payload: { data: mockContacts },
			});
		});

		it('should fetch contact list without contact type', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getContactList());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/contact/getContactsForDropdown?contactType=',
				})
			);
		});
	});

	describe('getStatusList', () => {
		it('should fetch status list successfully', async () => {
			const mockStatuses = [
				{ id: 1, name: 'Draft' },
				{ id: 2, name: 'Approved' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockStatuses,
			});

			await store.dispatch(actions.getStatusList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getInvoiceStatusTypes',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.STATUS_LIST,
				payload: { status: 200, data: mockStatuses },
			});
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
				type: SUPPLIER_INVOICE.CURRENCY_LIST,
				payload: { data: mockCurrencies },
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getVatList', () => {
		it('should fetch VAT list successfully', async () => {
			const mockVatList = [
				{ id: 1, name: 'Standard Rate', percentage: 5 },
				{ id: 2, name: 'Zero Rate', percentage: 0 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatList,
			});

			const result = await store.dispatch(actions.getVatList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/vatCategory',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.VAT_LIST,
				payload: { data: mockVatList },
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getExciseList', () => {
		it('should fetch excise list successfully', async () => {
			const mockExciseList = [
				{ id: 1, name: 'Excise Tax A', rate: 50 },
				{ id: 2, name: 'Excise Tax B', rate: 100 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockExciseList,
			});

			await store.dispatch(actions.getExciseList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/exciseTax',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.EXCISE_LIST,
				payload: { data: mockExciseList },
			});
		});
	});

	describe('getDepositList', () => {
		it('should fetch deposit list successfully', async () => {
			const mockDeposits = [
				{ id: 1, amount: 1000 },
				{ id: 2, amount: 2000 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockDeposits,
			});

			await store.dispatch(actions.getDepositList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/receipt/tnxCat',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.DEPOSIT_LIST,
				payload: { data: mockDeposits },
			});
		});
	});

	describe('getPaymentMode', () => {
		it('should fetch payment mode successfully', async () => {
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
				type: SUPPLIER_INVOICE.PAY_MODE,
				payload: { data: mockPayModes },
			});
		});
	});

	describe('getProductList', () => {
		it('should fetch product list successfully', async () => {
			const mockProducts = [
				{ id: 1, productName: 'Product A', price: 100 },
				{ id: 2, productName: 'Product B', price: 200 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockProducts,
			});

			const result = await store.dispatch(actions.getProductList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/product?priceType=PURCHASE',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.PRODUCT_LIST,
				payload: { data: mockProducts },
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getSupplierList', () => {
		it('should fetch supplier list successfully', async () => {
			const mockSuppliers = [
				{ id: 1, name: 'Supplier A' },
				{ id: 2, name: 'Supplier B' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockSuppliers,
			});

			await store.dispatch(actions.getSupplierList('1'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=1',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: SUPPLIER_INVOICE.SUPPLIER_LIST,
				payload: { status: 200, data: mockSuppliers },
			});
		});
	});

	describe('createSupplier', () => {
		it('should create supplier successfully', async () => {
			const mockSupplierData = {
				firstName: 'New Supplier',
				email: 'newsupplier@example.com',
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
	});

	describe('removeBulk', () => {
		it('should remove bulk invoices successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulk(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/invoice/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getCountryList', () => {
		it('should fetch country list successfully', async () => {
			const mockCountries = [
				{ code: 'US', name: 'United States' },
				{ code: 'AE', name: 'United Arab Emirates' },
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
				type: SUPPLIER_INVOICE.COUNTRY_LIST,
				payload: mockCountries,
			});
		});
	});

	describe('postInvoice', () => {
		it('should post invoice successfully', async () => {
			const mockInvoiceData = {
				invoiceNumber: 'INV-001',
				amount: 5000,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { id: 1, ...mockInvoiceData },
			});

			const result = await store.dispatch(actions.postInvoice(mockInvoiceData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/invoice/posting',
				data: mockInvoiceData,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('unPostInvoice', () => {
		it('should unpost invoice successfully', async () => {
			const mockData = { id: 1 };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Unposted successfully' },
			});

			const result = await store.dispatch(actions.unPostInvoice(mockData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/invoice/undoPosting',
				data: mockData,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('deleteInvoice', () => {
		it('should delete invoice successfully', async () => {
			const invoiceId = 123;

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.deleteInvoice(invoiceId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: `/rest/invoice/delete?id=${invoiceId}`,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getInvoiceById', () => {
		it('should fetch invoice by ID successfully', async () => {
			const invoiceId = 456;
			const mockInvoice = {
				id: invoiceId,
				invoiceNumber: 'INV-456',
				amount: 7500,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoice,
			});

			const result = await store.dispatch(actions.getInvoiceById(invoiceId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/invoice/getInvoiceById?id=${invoiceId}`,
			});

			expect(result.data).toEqual(mockInvoice);
		});
	});

	describe('sendMail', () => {
		it('should send mail successfully', async () => {
			const invoiceId = 789;

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Email sent successfully' },
			});

			const result = await store.dispatch(actions.sendMail(invoiceId));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: `/rest/invoice/send?id=${invoiceId}`,
			});

			expect(result.status).toBe(200);
		});
	});
});
