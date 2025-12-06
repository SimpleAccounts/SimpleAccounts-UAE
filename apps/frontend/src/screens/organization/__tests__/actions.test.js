import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi, authFileUploadApi } from 'utils';
import { ORGANIZATION } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
	authFileUploadApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Organization Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('createOrganization', () => {
		it('should call authFileUploadApi with POST method and organization data', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, message: 'Organization created successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const orgData = {
				name: 'Test Organization',
				country: 'UAE',
				industry: 'Technology',
				logo: new File([''], 'logo.png'),
			};

			const result = await store.dispatch(actions.createOrganization(orgData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/company/save',
				data: orgData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle organization creation with minimal data', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 2 },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const minimalData = {
				name: 'Minimal Org',
			};

			const result = await store.dispatch(actions.createOrganization(minimalData));

			expect(result.status).toBe(200);
			expect(authFileUploadApi).toHaveBeenCalled();
		});

		it('should handle organization with complete details', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 3, name: 'Complete Org' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const completeData = {
				name: 'Complete Organization',
				country: 'UAE',
				industry: 'Finance',
				address: '123 Business Street',
				phone: '+971-12345678',
				email: 'info@org.com',
				taxNumber: 'TRN123456',
				logo: new File(['logo content'], 'logo.png', { type: 'image/png' }),
			};

			const result = await store.dispatch(actions.createOrganization(completeData));

			expect(result.data.id).toBe(3);
			const apiCall = authFileUploadApi.mock.calls[0][0];
			expect(apiCall.data.name).toBe('Complete Organization');
		});

		it('should handle API errors during organization creation', async () => {
			const mockError = new Error('Creation failed');
			authFileUploadApi.mockRejectedValue(mockError);

			const orgData = { name: 'Test' };

			await expect(
				store.dispatch(actions.createOrganization(orgData))
			).rejects.toThrow('Creation failed');
		});

		it('should handle validation errors', async () => {
			const mockError = new Error('Validation failed: Name is required');
			authFileUploadApi.mockRejectedValue(mockError);

			const invalidData = {};

			await expect(
				store.dispatch(actions.createOrganization(invalidData))
			).rejects.toThrow('Validation failed');
		});

		it('should handle network timeout errors', async () => {
			const mockError = new Error('Network timeout');
			authFileUploadApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.createOrganization({ name: 'Test' }))
			).rejects.toThrow('Network timeout');
		});
	});

	describe('getCountryList', () => {
		it('should dispatch COUNTRY_LIST action on successful API call', async () => {
			const mockCountries = [
				{ id: 1, name: 'United Arab Emirates', code: 'AE' },
				{ id: 2, name: 'Saudi Arabia', code: 'SA' },
				{ id: 3, name: 'Kuwait', code: 'KW' },
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
				type: ORGANIZATION.COUNTRY_LIST,
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

		it('should not dispatch action on non-200 status', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle API errors when fetching country list', async () => {
			const mockError = new Error('Failed to fetch countries');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCountryList())).rejects.toThrow(
				'Failed to fetch countries'
			);
		});

		it('should handle large country list response', async () => {
			const largeCountryList = Array.from({ length: 200 }, (_, i) => ({
				id: i + 1,
				name: `Country ${i + 1}`,
				code: `C${i + 1}`,
			}));

			const mockResponse = {
				status: 200,
				data: largeCountryList,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getCountryList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload).toHaveLength(200);
		});
	});

	describe('getIndustryTypeList', () => {
		it('should dispatch INDUSTRY_TYPE_LIST action on successful API call', async () => {
			const mockIndustries = [
				{ id: 1, name: 'Technology', code: 'TECH' },
				{ id: 2, name: 'Finance', code: 'FIN' },
				{ id: 3, name: 'Healthcare', code: 'HEALTH' },
			];

			const mockResponse = {
				status: 200,
				data: mockIndustries,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getIndustryTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: ORGANIZATION.INDUSTRY_TYPE_LIST,
				payload: mockIndustries,
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/datalist/getIndustryTypes',
			});
		});

		it('should handle empty industry type list response', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getIndustryTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload).toEqual([]);
		});

		it('should not dispatch action on non-200 status', async () => {
			const mockResponse = {
				status: 500,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getIndustryTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle API errors when fetching industry types', async () => {
			const mockError = new Error('Failed to fetch industry types');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getIndustryTypeList())
			).rejects.toThrow('Failed to fetch industry types');
		});

		it('should handle industry types with additional metadata', async () => {
			const mockIndustries = [
				{
					id: 1,
					name: 'Technology',
					code: 'TECH',
					description: 'Technology sector',
					isActive: true,
				},
			];

			const mockResponse = {
				status: 200,
				data: mockIndustries,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getIndustryTypeList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0].payload[0].description).toBe(
				'Technology sector'
			);
		});

		it('should handle network errors', async () => {
			const mockError = new Error('Network Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getIndustryTypeList())
			).rejects.toThrow('Network Error');
		});
	});

	describe('Error handling across all actions', () => {
		it('should handle 401 unauthorized errors', async () => {
			const mockError = new Error('Unauthorized');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getCountryList())).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle 403 forbidden errors', async () => {
			const mockError = new Error('Forbidden');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getIndustryTypeList())
			).rejects.toThrow('Forbidden');
		});

		it('should handle 500 server errors', async () => {
			const mockError = new Error('Internal Server Error');
			authFileUploadApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.createOrganization({ name: 'Test' }))
			).rejects.toThrow('Internal Server Error');
		});
	});
});
