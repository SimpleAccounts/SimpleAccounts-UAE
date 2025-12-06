import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi, authFileUploadApi } from 'utils';
import { PROFILE, BANK_ACCOUNT } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
	authFileUploadApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Profile Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getUserById', () => {
		it('should call authApi with correct parameters', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, name: 'John Doe', email: 'john@example.com' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getUserById(1));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getById?id=1',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('User not found');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getUserById(999))).rejects.toThrow('User not found');
		});

		it('should work with different user IDs', async () => {
			const mockResponse = { status: 200, data: { id: 42 } };
			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getUserById(42));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getById?id=42',
			});
		});
	});

	describe('getCompanyById', () => {
		it('should call authApi to fetch company details', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, name: 'Test Company', industry: 'Technology' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCompanyById());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/company/getCompanyDetails',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle API errors when fetching company', async () => {
			const mockError = new Error('Company not found');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCompanyById())).rejects.toThrow('Company not found');
		});
	});

	describe('getCurrencyList', () => {
		it('should dispatch CURRENCY_LIST action on successful API call', async () => {
			const mockCurrencies = [
				{ id: 1, code: 'AED', name: 'UAE Dirham' },
				{ id: 2, code: 'SAR', name: 'Saudi Riyal' },
			];

			const mockResponse = {
				status: 200,
				data: mockCurrencies,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.CURRENCY_LIST,
				payload: mockCurrencies,
			});
		});

		it('should not dispatch action on non-200 status', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch currencies');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow('Failed to fetch currencies');
		});
	});

	describe('getCountryList', () => {
		it('should dispatch COUNTRY_LIST action on successful API call', async () => {
			const mockCountries = [
				{ id: 1, name: 'United Arab Emirates', code: 'AE' },
				{ id: 2, name: 'Saudi Arabia', code: 'SA' },
			];

			const mockResponse = {
				status: 200,
				data: mockCountries,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.COUNTRY_LIST,
				payload: mockCountries,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getcountry',
			});
		});

		it('should handle empty country list response', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload).toEqual([]);
		});
	});

	describe('getIndustryTypeList', () => {
		it('should dispatch INDUSTRY_TYPE_LIST action on success', async () => {
			const mockIndustries = [
				{ id: 1, name: 'Technology', code: 'TECH' },
				{ id: 2, name: 'Finance', code: 'FIN' },
			];

			const mockResponse = {
				status: 200,
				data: mockIndustries,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getIndustryTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.INDUSTRY_TYPE_LIST,
				payload: mockIndustries,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getIndustryTypes',
			});
		});
	});

	describe('getCompanyTypeList', () => {
		it('should dispatch COMPANY_TYPE_LIST action on success', async () => {
			const mockCompanyTypes = [
				{ id: 1, name: 'LLC' },
				{ id: 2, name: 'FZE' },
			];

			const mockResponse = {
				status: 200,
				data: mockCompanyTypes,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCompanyTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.COMPANY_TYPE_LIST,
				payload: mockCompanyTypes,
			});
		});
	});

	describe('updateUser', () => {
		it('should call authFileUploadApi with user data', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, message: 'User updated successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const userData = {
				id: 1,
				name: 'John Doe',
				email: 'john@example.com',
			};

			const result = await store.dispatch(actions.updateUser(userData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/user/update',
				data: userData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle update errors', async () => {
			const mockError = new Error('Update failed');
			authFileUploadApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.updateUser({}))).rejects.toThrow('Update failed');
		});
	});

	describe('updateCompany', () => {
		it('should call authFileUploadApi with company data', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, message: 'Company updated successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const companyData = {
				id: 1,
				name: 'Test Company',
				industry: 'Technology',
			};

			const result = await store.dispatch(actions.updateCompany(companyData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/company/update',
				data: companyData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('resetNewpassword', () => {
		it('should call authFileUploadApi to reset password', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Password reset successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const passwordData = {
				oldPassword: 'old123',
				newPassword: 'new456',
			};

			const result = await store.dispatch(actions.resetNewpassword(passwordData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'POST',
				url: '/rest/user/resetNewpassword',
				data: passwordData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle password reset errors', async () => {
			const mockError = new Error('Invalid old password');
			authFileUploadApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.resetNewpassword({}))).rejects.toThrow('Invalid old password');
		});
	});

	describe('getRoleList', () => {
		it('should dispatch ROLE_LIST action and return response', async () => {
			const mockRoles = [
				{ id: 1, name: 'Admin', permissions: ['all'] },
				{ id: 2, name: 'User', permissions: ['read'] },
			];

			const mockResponse = {
				status: 200,
				data: mockRoles,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getRoleList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.ROLE_LIST,
				payload: mockRoles,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getrole',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getStateList', () => {
		it('should dispatch INVOICING_STATE_LIST action for invoicing type', async () => {
			const mockStates = [
				{ id: 1, name: 'Dubai', code: 'DXB' },
				{ id: 2, name: 'Abu Dhabi', code: 'AUH' },
			];

			const mockResponse = {
				status: 200,
				data: mockStates,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getStateList('AE', 'invoicing'));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.INVOICING_STATE_LIST,
				payload: mockStates,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getstate?countryCode=AE',
			});
		});

		it('should dispatch COMPANY_STATE_LIST action for non-invoicing type', async () => {
			const mockStates = [
				{ id: 1, name: 'Sharjah', code: 'SHJ' },
			];

			const mockResponse = {
				status: 200,
				data: mockStates,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getStateList('AE', 'company'));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: PROFILE.COMPANY_STATE_LIST,
				payload: mockStates,
			});
		});
	});

	describe('getCompanyTypeList2', () => {
		it('should return company type list without dispatching', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, name: 'LLC' }],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCompanyTypeList2());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getCompanyType',
			});

			expect(result).toEqual(mockResponse);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});
	});

	describe('getTransactionList', () => {
		it('should dispatch BANK_TRANSACTION_LIST action on success', async () => {
			const mockTransactions = [
				{ id: 1, amount: 1000, type: 'debit' },
				{ id: 2, amount: 500, type: 'credit' },
			];

			const mockResponse = {
				status: 200,
				data: mockTransactions,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTransactionList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toEqual({
				type: BANK_ACCOUNT.BANK_TRANSACTION_LIST,
				payload: {
					data: mockTransactions,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transaction/list',
			});

			expect(result).toEqual(mockResponse);
		});
	});
});
