import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { REQUEST_FOR_QUOTATION } from 'constants/types';
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

describe('Request For Quotation Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getRFQList', () => {
		it('should dispatch REQUEST_FOR_QUOTATION_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, rfqNumber: 'RFQ-001', amount: 50000 },
					{ id: 2, rfqNumber: 'RFQ-002', amount: 75000 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				supplierId: { value: '123' },
				rfqNumber: 'RFQ-001',
				status: { value: 'draft' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getRFQList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: REQUEST_FOR_QUOTATION.REQUEST_FOR_QUOTATION_LIST,
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

			await store.dispatch(actions.getRFQList(postObj));

			expect(store.getActions()).toHaveLength(0);
		});

		it('should call API with type 3 for RFQ', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				rfqNumber: 'RFQ-TEST',
			};

			await store.dispatch(actions.getRFQList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('type=3');
		});

		it('should format dates when provided', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				invoiceDate: new Date('2024-09-25'),
				rfqExpiryDate: new Date('2024-10-25'),
			};

			await store.dispatch(actions.getRFQList(postObj));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('rfqReceiveDate=');
			expect(apiCall.url).toContain('rfqExpiryDate=');
		});
	});

	describe('getProjectList', () => {
		it('should dispatch PROJECT_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Project Alpha' },
					{ id: 2, name: 'Project Beta' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProjectList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: REQUEST_FOR_QUOTATION.PROJECT_LIST,
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
					{ id: 1, rate: 50, category: 'Tobacco' },
					{ id: 2, rate: 100, category: 'Energy Drinks' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getExciseList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: REQUEST_FOR_QUOTATION.EXCISE_LIST,
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
				url: '/rest/contact/getContactsForDropdown?contactType=supplier',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(REQUEST_FOR_QUOTATION.CONTACT_LIST);
		});

		it('should handle empty contact type', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactList());

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toContain('contactType=');
		});
	});

	describe('getStatusList', () => {
		it('should dispatch STATUS_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, status: 'Draft' },
					{ id: 2, status: 'Sent' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getStatusList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: REQUEST_FOR_QUOTATION.STATUS_LIST,
				payload: mockResponse,
			});
		});
	});

	describe('getVatList', () => {
		it('should dispatch VAT_LIST and return response', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, rate: 5, category: 'Standard' },
					{ id: 2, rate: 0, category: 'Zero Rated' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVatList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: REQUEST_FOR_QUOTATION.VAT_LIST,
				payload: {
					data: mockResponse.data,
				},
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
				type: REQUEST_FOR_QUOTATION.DEPOSIT_LIST,
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

	describe('getPaymentMode', () => {
		it('should dispatch PAY_MODE action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, mode: 'Cash' },
					{ id: 2, mode: 'Cheque' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPaymentMode());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: REQUEST_FOR_QUOTATION.PAY_MODE,
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
				data: [
					{ id: 1, name: 'Product A', price: 100 },
					{ id: 2, name: 'Product B', price: 200 },
				],
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
		it('should dispatch SUPPLIER_LIST with contact type id', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, name: 'Supplier One' },
					{ id: 2, name: 'Supplier Two' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getSupplierList('supplier'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=supplier',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(REQUEST_FOR_QUOTATION.SUPPLIER_LIST);
		});
	});

	describe('createSupplier', () => {
		it('should call API with POST method and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, name: 'New Supplier' },
			};

			authApi.mockResolvedValue(mockResponse);

			const supplierData = {
				name: 'New Supplier',
				email: 'newsupplier@test.com',
			};
			const result = await store.dispatch(actions.createSupplier(supplierData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/contact/save',
				data: supplierData,
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
				type: REQUEST_FOR_QUOTATION.COUNTRY_LIST,
				payload: mockResponse.data,
			});
		});
	});

	describe('sendMail', () => {
		it('should call send mail API and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Email sent successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const mailData = { to: 'supplier@test.com', rfqId: 1 };
			const result = await store.dispatch(actions.sendMail(mailData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/poquatation/sendrfq',
				data: mailData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('createPO', () => {
		it('should call create PO API with id', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'PO created successfully', poId: 456 },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.createPO(123));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/poquatation/savepo?id=123',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('changeStatus', () => {
		it('should call change status API with id and status', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Status changed successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.changeStatus(123, 'approved'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/poquatation/changeStatus?id=123&status=approved',
			});

			expect(result).toEqual(mockResponse);
		});
	});
});
