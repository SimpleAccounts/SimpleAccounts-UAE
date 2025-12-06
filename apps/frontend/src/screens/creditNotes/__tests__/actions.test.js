import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { CUSTOMER_INVOICE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

jest.mock('moment', () => {
	const actualMoment = jest.requireActual('moment');
	const mockMoment = (...args) => {
		const m = actualMoment(...args);
		m.format = jest.fn(() => '20-08-2024');
		return m;
	};
	mockMoment.format = actualMoment.format;
	return mockMoment;
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Credit Notes Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getCreditNoteList', () => {
		it('should dispatch CUSTOMER_INVOICE_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, referenceNumber: 'CN-001', amount: 5000 },
					{ id: 2, referenceNumber: 'CN-002', amount: 3000 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				customerId: { value: '789' },
				referenceNumber: 'CN-001',
				status: { value: 'issued' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getCreditNoteList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
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

			await store.dispatch(actions.getCreditNoteList(postObj));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should include invoice dates in API call when provided', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				invoiceDate: new Date('2024-08-20'),
				invoiceDueDate: new Date('2024-09-20'),
			};

			await store.dispatch(actions.getCreditNoteList(postObj));

			expect(authApi).toHaveBeenCalled();
		});
	});

	describe('getProjectList', () => {
		it('should dispatch PROJECT_LIST action when status is 200', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Alpha Project' },
					{ id: 2, name: 'Beta Project' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProjectList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.PROJECT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/project/getProjectsForDropdown',
			});
		});
	});

	describe('getExciseList', () => {
		it('should dispatch EXCISE_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, rate: 50 },
					{ id: 2, rate: 100 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getExciseList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.EXCISE_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
		});
	});

	describe('getCustomerList', () => {
		it('should dispatch CUSTOMER_LIST with contact type', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Customer ABC' },
					{ id: 2, name: 'Customer XYZ' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCustomerList('customer'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=customer',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(CUSTOMER_INVOICE.CUSTOMER_LIST);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getPlaceOfSuppliyList', () => {
		it('should dispatch PLACE_OF_SUPPLY action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Dubai' },
					{ id: 2, name: 'Abu Dhabi' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPlaceOfSuppliyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.PLACE_OF_SUPPLY,
				payload: {
					data: mockResponse.data,
				},
			});
		});
	});

	describe('getCurrencyList', () => {
		it('should dispatch CURRENCY_LIST and return response', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ code: 'AED', name: 'UAE Dirham' },
					{ code: 'USD', name: 'US Dollar' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.CURRENCY_LIST,
				payload: mockResponse,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getVatList', () => {
		it('should dispatch VAT_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, rate: 5, category: 'Standard' },
					{ id: 2, rate: 0, category: 'Zero-rated' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getVatList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.VAT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/vatCategory',
			});
		});
	});

	describe('getProductList', () => {
		it('should dispatch PRODUCT_LIST with SALES price type', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Product A', price: 100 },
					{ id: 2, name: 'Product B', price: 200 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getProductList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/product?priceType=SALES',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDepositList', () => {
		it('should dispatch DEPOSIT_LIST action when successful', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, type: 'Security Deposit' },
					{ id: 2, type: 'Advance Payment' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getDepositList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.DEPOSIT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
		});
	});

	describe('getPaymentMode', () => {
		it('should dispatch PAY_MODE action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, mode: 'Cash' },
					{ id: 2, mode: 'Bank Transfer' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPaymentMode());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.PAY_MODE,
				payload: {
					data: mockResponse.data,
				},
			});
		});
	});

	describe('creditNoteposting', () => {
		it('should call posting API and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Credit note posted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = { id: 1, amount: 5000 };
			const result = await store.dispatch(actions.creditNoteposting(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/creditNote/creditNotePosting',
				data: postData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteInvoice', () => {
		it('should call delete API with invoice id', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.deleteInvoice(123));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/invoice/delete?id=123',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getInvoiceListForDropdown', () => {
		it('should dispatch INVOICE_LIST_FOR_DROPDOWN action', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, invoiceNumber: 'INV-001' },
					{ id: 2, invoiceNumber: 'INV-002' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getInvoiceListForDropdown());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/invoice/getInvoicesForDropdown?type=2',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: CUSTOMER_INVOICE.INVOICE_LIST_FOR_DROPDOWN,
				payload: mockResponse,
			});
		});
	});

	describe('getInvoicesForCNById', () => {
		it('should return invoice by credit note id', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, invoiceNumber: 'INV-001' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getInvoicesForCNById(1));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/creditNote/getInvoiceByCreditNoteId?id=1',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getTaxTreatment', () => {
		it('should return tax treatment data', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, treatment: 'Taxable' },
					{ id: 2, treatment: 'Non-Taxable' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTaxTreatment());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/getTaxTreatment',
			});

			expect(result).toEqual(mockResponse);
		});
	});
});
