import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { PURCHASE_ORDER } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

jest.mock('moment', () => {
	const actualMoment = jest.requireActual('moment');
	const mockMoment = (...args) => {
		const m = actualMoment(...args);
		m.format = jest.fn(() => '01-01-2024');
		return m;
	};
	mockMoment.format = actualMoment.format;
	return mockMoment;
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Purchase Order Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getpoList', () => {
		it('should dispatch PURCHASE_ORDER_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, poNumber: 'PO-001' },
					{ id: 2, poNumber: 'PO-002' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				supplierId: { value: '123' },
				poNumber: 'PO-001',
				status: { value: 'pending' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getpoList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.PURCHASE_ORDER_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				paginationDisable: true,
			};

			await store.dispatch(actions.getpoList(postObj));

			expect(store.getActions()).toHaveLength(0);
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
				type: PURCHASE_ORDER.EXCISE_LIST,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/exciseTax',
			});
		});
	});

	describe('getProjectList', () => {
		it('should dispatch PROJECT_LIST action when status is 200', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Project Alpha' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProjectList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.PROJECT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
		});

		it('should not dispatch if status is not 200', async () => {
			const mockResponse = {
				status: 500,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProjectList());

			expect(store.getActions()).toHaveLength(0);
		});
	});

	describe('getContactList', () => {
		it('should dispatch CONTACT_LIST with contact type parameter', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Contact A' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactList('supplier'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=supplier',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(PURCHASE_ORDER.CONTACT_LIST);
		});

		it('should handle empty contact type', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=',
			});
		});
	});

	describe('getStatusList', () => {
		it('should dispatch STATUS_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, status: 'Draft' },
					{ id: 2, status: 'Approved' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getStatusList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.STATUS_LIST,
				payload: mockResponse,
			});
		});
	});

	describe('getVatList', () => {
		it('should dispatch VAT_LIST action and return response', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, rate: 5 }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVatList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.VAT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDepositList', () => {
		it('should dispatch DEPOSIT_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, type: 'Security' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getDepositList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.DEPOSIT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
		});
	});

	describe('getPaymentMode', () => {
		it('should dispatch PAY_MODE action when successful', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, mode: 'Cash' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPaymentMode());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.PAY_MODE,
				payload: {
					data: mockResponse.data,
				},
			});
		});
	});

	describe('getProductList', () => {
		it('should dispatch PRODUCT_LIST with PURCHASE price type', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Product A' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getProductList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/product?priceType=PURCHASE',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getSupplierList', () => {
		it('should dispatch SUPPLIER_LIST action with contact type id', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Supplier One' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getSupplierList('vendor'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=vendor',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.SUPPLIER_LIST,
				payload: mockResponse,
			});
		});
	});

	describe('getRFQList', () => {
		it('should dispatch RFQ_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, rfqNumber: 'RFQ-001' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getRFQList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.RFQ_LIST,
				payload: mockResponse,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/poquatation/getRfqPoForDropDown?type=3',
			});
		});
	});

	describe('createSupplier', () => {
		it('should call API with POST method and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, name: 'New Supplier' },
			};

			authApi.mockResolvedValue(mockResponse);

			const supplierData = { name: 'New Supplier', email: 'supplier@test.com' };
			const result = await store.dispatch(actions.createSupplier(supplierData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/contact/save',
				data: supplierData,
			});

			expect(result).toEqual(mockResponse);
			expect(store.getActions()).toHaveLength(0);
		});
	});

	describe('removeBulk', () => {
		it('should call delete API and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const deleteData = { ids: [1, 2, 3] };
			const result = await store.dispatch(actions.removeBulk(deleteData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/invoice/deletes',
				data: deleteData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCountryList', () => {
		it('should dispatch COUNTRY_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: ['UAE', 'USA', 'UK'],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PURCHASE_ORDER.COUNTRY_LIST,
				payload: mockResponse.data,
			});
		});
	});

	describe('postInvoice', () => {
		it('should call posting API and return response on success', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Posted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const invoiceData = { id: 1, amount: 5000 };
			const result = await store.dispatch(actions.postInvoice(invoiceData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/invoice/posting',
				data: invoiceData,
			});

			expect(result).toEqual(mockResponse);
		});
	});
});
