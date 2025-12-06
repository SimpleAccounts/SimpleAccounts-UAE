import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { CONTACT } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Contact Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getContactList', () => {
		it('should fetch contact list successfully', async () => {
			const mockContacts = [
				{ contactId: 1, firstName: 'Ahmed', lastName: 'Ali' },
				{ contactId: 2, firstName: 'Fatima', lastName: 'Hassan' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockContacts,
			});

			const params = {
				name: 'Ahmed',
				email: 'ahmed@example.com',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'firstName',
				paginationDisable: false,
			};

			await store.dispatch(actions.getContactList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.CONTACT_LIST,
				payload: mockContacts,
			});
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: 'John Doe',
				email: 'john.doe@example.com',
				contactType: { value: '1' },
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'email',
				paginationDisable: false,
			};

			await store.dispatch(actions.getContactList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('name=John Doe'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('email=john.doe@example.com'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('contactType=1'),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getContactList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getContactList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('removeBulk', () => {
		it('should remove bulk contacts successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulk(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/contact/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulk({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});
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

			const result = await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency/getactivecurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.CURRENCY_LIST,
				payload: mockCurrencies,
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
				type: CONTACT.COUNTRY_LIST,
				payload: mockCountries,
			});
		});

		it('should handle country list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch countries'));

			await expect(store.dispatch(actions.getCountryList())).rejects.toThrow(
				'Failed to fetch countries'
			);
		});
	});

	describe('getContactTypeList', () => {
		it('should fetch contact type list successfully', async () => {
			const mockContactTypes = [
				{ id: 1, type: 'Supplier' },
				{ id: 2, type: 'Customer' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockContactTypes,
			});

			await store.dispatch(actions.getContactTypeList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getContactTypes',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.CONTACT_TYPE_LIST,
				payload: mockContactTypes,
			});
		});

		it('should handle contact type list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch contact types'));

			await expect(
				store.dispatch(actions.getContactTypeList())
			).rejects.toThrow('Failed to fetch contact types');
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

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.STATE_LIST,
				payload: mockStates,
			});

			expect(result.status).toBe(200);
		});

		it('should dispatch empty array when no country code provided', async () => {
			await store.dispatch(actions.getStateList(null));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.STATE_LIST,
				payload: [],
			});
		});

		it('should handle state list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch states'));

			await expect(store.dispatch(actions.getStateList('AE'))).rejects.toThrow(
				'Failed to fetch states'
			);
		});
	});

	describe('getStateListForShippingAddress', () => {
		it('should fetch state list for shipping address successfully', async () => {
			const mockStates = [
				{ code: 'DXB', name: 'Dubai' },
				{ code: 'AUH', name: 'Abu Dhabi' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockStates,
			});

			const countryCode = 'AE';
			const result = await store.dispatch(
				actions.getStateListForShippingAddress(countryCode)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/datalist/getstate?countryCode=${countryCode}`,
			});

			expect(result).toEqual(mockStates);
		});

		it('should return empty array when no country code provided', async () => {
			const result = await store.dispatch(
				actions.getStateListForShippingAddress(null)
			);

			expect(result).toEqual([]);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch states'));

			await expect(
				store.dispatch(actions.getStateListForShippingAddress('AE'))
			).rejects.toThrow('Failed to fetch states');
		});
	});

	describe('getInvoicesCountContact', () => {
		it('should fetch invoices count for contact successfully', async () => {
			const contactId = 123;
			const mockCount = { count: 25 };

			authApi.mockResolvedValue({
				status: 200,
				data: mockCount,
			});

			const result = await store.dispatch(
				actions.getInvoicesCountContact(contactId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/contact/getInvoicesCountForContact/?contactId=${contactId}`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCount);
		});

		it('should handle invoices count fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch count'));

			await expect(
				store.dispatch(actions.getInvoicesCountContact(123))
			).rejects.toThrow('Failed to fetch count');
		});
	});

	describe('checkValidation', () => {
		it('should check validation successfully', async () => {
			const mockValidation = { isValid: true };

			authApi.mockResolvedValue({
				status: 200,
				data: mockValidation,
			});

			const params = {
				name: 'Test Contact',
				moduleType: 'contact',
			};

			const result = await store.dispatch(actions.checkValidation(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/validation/validate?name=${params.name}&moduleType=${params.moduleType}`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockValidation);
		});

		it('should handle validation check error', async () => {
			authApi.mockRejectedValue(new Error('Validation failed'));

			await expect(
				store.dispatch(actions.checkValidation({ name: 'Test', moduleType: 'contact' }))
			).rejects.toThrow('Validation failed');
		});
	});

	describe('Error Handling', () => {
		it('should handle network timeout', async () => {
			const timeoutError = new Error('Request timeout');
			timeoutError.code = 'ECONNABORTED';
			authApi.mockRejectedValue(timeoutError);

			await expect(
				store.dispatch(actions.getContactList({}))
			).rejects.toThrow('Request timeout');
		});

		it('should handle 401 unauthorized error', async () => {
			const unauthorizedError = new Error('Unauthorized');
			unauthorizedError.response = { status: 401 };
			authApi.mockRejectedValue(unauthorizedError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle 404 not found error', async () => {
			const notFoundError = new Error('Not found');
			notFoundError.response = { status: 404 };
			authApi.mockRejectedValue(notFoundError);

			await expect(
				store.dispatch(actions.getInvoicesCountContact(999))
			).rejects.toThrow('Not found');
		});

		it('should handle 500 server error', async () => {
			const serverError = new Error('Internal server error');
			serverError.response = { status: 500 };
			authApi.mockRejectedValue(serverError);

			await expect(store.dispatch(actions.getCountryList())).rejects.toThrow(
				'Internal server error'
			);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty contact list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getContactList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.CONTACT_LIST,
				payload: [],
			});
		});

		it('should handle null parameters gracefully', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: null,
				email: null,
				contactType: null,
				paginationDisable: false,
			};

			await store.dispatch(actions.getContactList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle large bulk delete operation', async () => {
			const largeIdArray = Array.from({ length: 100 }, (_, i) => i + 1);
			authApi.mockResolvedValue({ status: 200, data: { message: 'Success' } });

			await store.dispatch(actions.removeBulk({ ids: largeIdArray }));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { ids: largeIdArray },
				})
			);
		});

		it('should handle special characters in contact name', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: "O'Brien & Sons",
				paginationDisable: false,
			};

			await store.dispatch(actions.getContactList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle empty country code in getStateList', async () => {
			await store.dispatch(actions.getStateList(''));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: CONTACT.STATE_LIST,
				payload: [],
			});
		});

		it('should handle undefined country code in getStateListForShippingAddress', async () => {
			const result = await store.dispatch(
				actions.getStateListForShippingAddress(undefined)
			);

			expect(result).toEqual([]);
		});
	});
});
