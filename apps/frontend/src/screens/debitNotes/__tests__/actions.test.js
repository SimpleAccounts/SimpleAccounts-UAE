import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { DEBIT_NOTE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

jest.mock('moment', () => {
	const actualMoment = jest.requireActual('moment');
	const mockMoment = (...args) => {
		const m = actualMoment(...args);
		m.format = jest.fn(() => '25-09-2024');
		return m;
	};
	mockMoment.format = actualMoment.format;
	return mockMoment;
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Debit Notes Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getdebitNotesList', () => {
		it('should dispatch DEBIT_NOTE_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, referenceNumber: 'DN-001', amount: 8000 },
					{ id: 2, referenceNumber: 'DN-002', amount: 6000 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				customerId: { value: '999' },
				referenceNumber: 'DN-001',
				status: { value: 'issued' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getdebitNotesList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DEBIT_NOTE.DEBIT_NOTE_LIST,
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

			await store.dispatch(actions.getdebitNotesList(postObj));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should call API with type 13 for debit notes', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				referenceNumber: 'DN-TEST',
			};

			await store.dispatch(actions.getdebitNotesList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('type=13');
		});
	});

	describe('getPlaceOfSuppliyList', () => {
		it('should dispatch PLACE_OF_SUPPLY action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Dubai' },
					{ id: 2, name: 'Abu Dhabi' },
					{ id: 3, name: 'Sharjah' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPlaceOfSuppliyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DEBIT_NOTE.PLACE_OF_SUPPLY,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/invoice/getPlaceOfSupplyForDropdown',
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
				type: DEBIT_NOTE.CURRENCY_LIST,
				payload: mockResponse,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDepositList', () => {
		it('should dispatch DEPOSIT_LIST action when successful', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, type: 'Supplier Deposit' },
					{ id: 2, type: 'Security Deposit' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getDepositList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DEBIT_NOTE.DEPOSIT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/receipt/tnxCat',
			});
		});
	});

	describe('getContactList', () => {
		it('should dispatch CONTACT_LIST with contact type', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Supplier ABC' },
					{ id: 2, name: 'Supplier XYZ' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactList('supplier'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactList?contactType=supplier',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(DEBIT_NOTE.CONTACT_LIST);
		});
	});

	describe('getStatusList', () => {
		it('should dispatch STATUS_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, status: 'Draft' },
					{ id: 2, status: 'Issued' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getStatusList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DEBIT_NOTE.STATUS_LIST,
				payload: mockResponse,
			});
		});
	});

	describe('createCustomer', () => {
		it('should call API with POST method and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, name: 'New Customer' },
			};

			authApi.mockResolvedValue(mockResponse);

			const customerData = {
				name: 'New Customer',
				email: 'newcustomer@test.com',
			};
			const result = await store.dispatch(actions.createCustomer(customerData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/contact/save',
				data: customerData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeBulk', () => {
		it('should call delete API with bulk data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Bulk delete successful' },
			};

			authApi.mockResolvedValue(mockResponse);

			const bulkData = { ids: [1, 2, 3, 4, 5] };
			const result = await store.dispatch(actions.removeBulk(bulkData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/invoice/deletes',
				data: bulkData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCountryList', () => {
		it('should dispatch COUNTRY_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: ['UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain'],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DEBIT_NOTE.COUNTRY_LIST,
				payload: mockResponse.data,
			});
		});
	});

	describe('debitNoteposting', () => {
		it('should call posting API and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Debit note posted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const postData = { id: 1, amount: 8000 };
			const result = await store.dispatch(actions.debitNoteposting(postData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/creditNote/creditNotePosting',
				data: postData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('unPostDebitNote', () => {
		it('should call undo posting API', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Posting undone' },
			};

			authApi.mockResolvedValue(mockResponse);

			const unpostData = { id: 1 };
			const result = await store.dispatch(actions.unPostDebitNote(unpostData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/invoice/undoPosting',
				data: unpostData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteInvoice', () => {
		it('should call delete API with invoice id', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Invoice deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.deleteInvoice(456));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/invoice/delete?id=456',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getInvoiceListForDropdown', () => {
		it('should dispatch INVOICE_LIST_FOR_DROPDOWN with type 1', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, invoiceNumber: 'INV-001' },
					{ id: 2, invoiceNumber: 'INV-002' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getInvoiceListForDropdown());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/invoice/getInvoicesForDropdown?type=1',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: DEBIT_NOTE.INVOICE_LIST_FOR_DROPDOWN,
				payload: mockResponse.data,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getProductListById', () => {
		it('should dispatch PRODUCT_LIST with PURCHASE price type and id', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Product A', price: 100 },
					{ id: 2, name: 'Product B', price: 200 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getProductListById(123));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/product?priceType=PURCHASE&id=123',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDebitNoteById', () => {
		it('should return debit note by id with isCNWithoutProduct flag', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, debitNoteNumber: 'DN-001', amount: 5000 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getDebitNoteById(1, false));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/creditNote/getCreditNoteById?id=1&isCNWithoutProduct=false',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle isCNWithoutProduct as true', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 2, debitNoteNumber: 'DN-002' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getDebitNoteById(2, true));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/creditNote/getCreditNoteById?id=2&isCNWithoutProduct=true',
			});
		});
	});
});
