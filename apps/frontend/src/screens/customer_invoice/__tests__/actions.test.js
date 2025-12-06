import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { CUSTOMER_INVOICE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('CustomerInvoice Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getCustomerInvoiceList', () => {
		it('should fetch customer invoice list successfully', async () => {
			const mockInvoices = [
				{ id: 1, invoiceNumber: 'CI-001', amount: 10000 },
				{ id: 2, invoiceNumber: 'CI-002', amount: 5000 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoices,
			});

			const params = {
				customerId: { value: 'customer1' },
				referenceNumber: 'REF-001',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'date',
				paginationDisable: false,
			};

			await store.dispatch(actions.getCustomerInvoiceList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
				payload: { data: mockInvoices },
			});
		});

		it('should build URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				customerId: { value: '456' },
				referenceNumber: 'REF-002',
				invoiceDate: '2023-12-01',
				invoiceDueDate: '2023-12-31',
				amount: '10000',
				status: { value: 'paid' },
				pageNo: 1,
				pageSize: 15,
				paginationDisable: false,
			};

			await store.dispatch(actions.getCustomerInvoiceList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('contact=456'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('type=2'),
				})
			);
		});

		it('should not dispatch when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(
				actions.getCustomerInvoiceList({ paginationDisable: true })
			);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			await expect(
				store.dispatch(actions.getCustomerInvoiceList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('getProjectList', () => {
		it('should fetch project list successfully', async () => {
			const mockProjects = [
				{ id: 1, projectName: 'Project Gamma' },
				{ id: 2, projectName: 'Project Delta' },
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
				type: CUSTOMER_INVOICE.PROJECT_LIST,
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

	describe('getCustomerList', () => {
		it('should fetch customer list with contact type', async () => {
			const mockCustomers = [
				{ customerId: 1, firstName: 'Alice', lastName: 'Smith' },
				{ customerId: 2, firstName: 'Bob', lastName: 'Johnson' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCustomers,
			});

			const result = await store.dispatch(actions.getCustomerList('2'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=2',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CUSTOMER_INVOICE.CUSTOMER_LIST,
				payload: { data: mockCustomers },
			});

			expect(result.status).toBe(200);
		});

		it('should fetch customer list without contact type', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getCustomerList());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/contact/getContactsForDropdown?contactType=',
				})
			);
		});
	});

	describe('getPlaceOfSuppliyList', () => {
		it('should fetch place of supply list successfully', async () => {
			const mockPlaces = [
				{ id: 1, name: 'Dubai' },
				{ id: 2, name: 'Abu Dhabi' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockPlaces,
			});

			await store.dispatch(actions.getPlaceOfSuppliyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/invoice/getPlaceOfSupplyForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CUSTOMER_INVOICE.PLACE_OF_SUPPLY,
				payload: { data: mockPlaces },
			});
		});
	});

	describe('getCurrencyList', () => {
		it('should fetch currency list successfully', async () => {
			const mockCurrencies = [
				{ code: 'USD', name: 'US Dollar' },
				{ code: 'EUR', name: 'Euro' },
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
				type: CUSTOMER_INVOICE.CURRENCY_LIST,
				payload: { status: 200, data: mockCurrencies },
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getVatList', () => {
		it('should fetch VAT list successfully', async () => {
			const mockVatList = [
				{ id: 1, name: 'Standard VAT', percentage: 5 },
				{ id: 2, name: 'Zero Rated', percentage: 0 },
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
				type: CUSTOMER_INVOICE.VAT_LIST,
				payload: { data: mockVatList },
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getExciseList', () => {
		it('should fetch excise list successfully', async () => {
			const mockExciseList = [
				{ id: 1, name: 'Excise A', rate: 50 },
				{ id: 2, name: 'Excise B', rate: 100 },
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
				type: CUSTOMER_INVOICE.EXCISE_LIST,
				payload: { data: mockExciseList },
			});
		});
	});

	describe('getProductList', () => {
		it('should fetch product list successfully', async () => {
			const mockProducts = [
				{ id: 1, productName: 'Product X', price: 1000 },
				{ id: 2, productName: 'Product Y', price: 500 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockProducts,
			});

			const result = await store.dispatch(actions.getProductList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/product?priceType=SALES',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CUSTOMER_INVOICE.PRODUCT_LIST,
				payload: { data: mockProducts },
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getDepositList', () => {
		it('should fetch deposit list successfully', async () => {
			const mockDeposits = [
				{ id: 1, amount: 5000 },
				{ id: 2, amount: 3000 },
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
				type: CUSTOMER_INVOICE.DEPOSIT_LIST,
				payload: { data: mockDeposits },
			});
		});
	});

	describe('getStatusList', () => {
		it('should fetch status list successfully', async () => {
			const mockStatuses = [
				{ id: 1, name: 'Draft' },
				{ id: 2, name: 'Sent' },
				{ id: 3, name: 'Paid' },
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
				type: CUSTOMER_INVOICE.STATUS_LIST,
				payload: { status: 200, data: mockStatuses },
			});
		});
	});

	describe('createCustomer', () => {
		it('should create customer successfully', async () => {
			const mockCustomerData = {
				firstName: 'New Customer',
				email: 'newcustomer@example.com',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { id: 1, ...mockCustomerData },
			});

			const result = await store.dispatch(
				actions.createCustomer(mockCustomerData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/contact/save',
				data: mockCustomerData,
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
				type: CUSTOMER_INVOICE.COUNTRY_LIST,
				payload: mockCountries,
			});
		});
	});

	describe('getPaymentMode', () => {
		it('should fetch payment mode successfully', async () => {
			const mockPayModes = [
				{ id: 1, label: 'Cash' },
				{ id: 2, label: 'Credit Card' },
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
				type: CUSTOMER_INVOICE.PAY_MODE,
				payload: { data: mockPayModes },
			});
		});
	});

	describe('postInvoice', () => {
		it('should post invoice successfully', async () => {
			const mockInvoiceData = {
				invoiceNumber: 'CI-001',
				amount: 10000,
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

	describe('getInvoiceById', () => {
		it('should fetch invoice by ID successfully', async () => {
			const invoiceId = 789;
			const mockInvoice = {
				id: invoiceId,
				invoiceNumber: 'CI-789',
				amount: 15000,
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

	describe('deleteInvoice', () => {
		it('should delete invoice successfully', async () => {
			const invoiceId = 321;

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

	describe('sendMail', () => {
		it('should send mail successfully', async () => {
			const invoiceId = 654;

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

	describe('getOverdueAmountDetails', () => {
		it('should fetch overdue amount details successfully', async () => {
			const invoiceType = 2;
			const mockOverdueData = {
				totalOverdue: 50000,
				count: 15,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockOverdueData,
			});

			const result = await store.dispatch(
				actions.getOverdueAmountDetails(invoiceType)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/invoice/getOverDueAmountDetails?type=${invoiceType}`,
			});

			expect(result.status).toBe(200);
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
});
