import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { QUOTATION } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

jest.mock('moment', () => {
	const actualMoment = jest.requireActual('moment');
	const mockMoment = (...args) => {
		const m = actualMoment(...args);
		m.format = jest.fn(() => '15-06-2024');
		return m;
	};
	mockMoment.format = actualMoment.format;
	return mockMoment;
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Quotation Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getQuotationList', () => {
		it('should dispatch QUOTATION_LIST action on success', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, quatationNumber: 'QT-001' },
					{ id: 2, quatationNumber: 'QT-002' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const postObj = {
				customerId: { value: '456' },
				quatationNumber: 'QT-001',
				status: { value: 'sent' },
				pageNo: 1,
				pageSize: 10,
			};

			await store.dispatch(actions.getQuotationList(postObj));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.QUOTATION_LIST,
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

			await store.dispatch(actions.getQuotationList(postObj));

			expect(store.getActions()).toHaveLength(0);
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
				type: QUOTATION.EXCISE_LIST,
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
				data: [
					{ id: 1, name: 'Project Alpha' },
					{ id: 2, name: 'Project Beta' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProjectList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.PROJECT_LIST,
				payload: {
					data: mockResponse.data,
				},
			});
		});

		it('should not dispatch if status is not 200', async () => {
			const mockResponse = {
				status: 404,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getProjectList());

			expect(store.getActions()).toHaveLength(0);
		});
	});

	describe('getContactList', () => {
		it('should dispatch CONTACT_LIST with contact type', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Client ABC' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getContactList('customer'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=customer',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].type).toBe(QUOTATION.CONTACT_LIST);
		});

		it('should handle empty contact type parameter', async () => {
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
					{ id: 2, status: 'Sent' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getStatusList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.STATUS_LIST,
				payload: mockResponse,
			});
		});
	});

	describe('getVatList', () => {
		it('should dispatch VAT_LIST and return response', async () => {
			const mockResponse = {
				status: 200,
				data: [
					{ id: 1, rate: 5 },
					{ id: 2, rate: 0 },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVatList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.VAT_LIST,
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
				data: [
					{ id: 1, type: 'Security Deposit' },
					{ id: 2, type: 'Advance' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getDepositList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.DEPOSIT_LIST,
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
				data: [
					{ id: 1, mode: 'Cash' },
					{ id: 2, mode: 'Bank Transfer' },
				],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getPaymentMode());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.PAY_MODE,
				payload: {
					data: mockResponse.data,
				},
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

	describe('getSupplierList', () => {
		it('should dispatch SUPPLIER_LIST action with id parameter', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'Supplier XYZ' }],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getSupplierList('supplier'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/contact/getContactsForDropdown?contactType=supplier',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.SUPPLIER_LIST,
				payload: mockResponse,
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
				data: ['UAE', 'USA', 'UK', 'India'],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: QUOTATION.COUNTRY_LIST,
				payload: mockResponse.data,
			});
		});
	});

	describe('sendMail', () => {
		it('should send quotation email and return response', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Email sent successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const emailData = { id: 1, recipient: 'client@test.com' };
			const result = await store.dispatch(actions.sendMail(emailData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/poquatation/sendQuotation',
				data: emailData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('changeStatus', () => {
		it('should change quotation status successfully', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Status changed' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.changeStatus(1, 'approved'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/poquatation/changeStatus?id=1&status=approved',
			});

			expect(result).toEqual(mockResponse);
		});
	});
});
