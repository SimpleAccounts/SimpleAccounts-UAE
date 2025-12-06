import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('General Settings Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getTestUserMailById', () => {
		it('should call API with GET method and return test email', async () => {
			const mockResponse = {
				status: 200,
				data: { email: 'test@example.com', isTest: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTestUserMailById(123));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/user/getTestmail?id=123',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle string id parameter', async () => {
			const mockResponse = {
				status: 200,
				data: { email: 'user@test.com' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTestUserMailById('user-456'));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toBe('/rest/user/getTestmail?id=user-456');
		});

		it('should handle API errors gracefully', async () => {
			const mockError = new Error('API Error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getTestUserMailById(999))
			).rejects.toThrow('API Error');
		});

		it('should work with zero as id', async () => {
			const mockResponse = {
				status: 200,
				data: { email: 'default@test.com' },
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getTestUserMailById(0));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.url).toBe('/rest/user/getTestmail?id=0');
		});
	});

	describe('getGeneralSettingDetail', () => {
		it('should call API to get company settings', async () => {
			const mockResponse = {
				status: 200,
				data: {
					companyName: 'Test Company',
					currency: 'AED',
					fiscalYear: '2024',
					taxNumber: 'TRN123456',
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getGeneralSettingDetail());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/companySetting/get',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should return response with all company settings', async () => {
			const mockResponse = {
				status: 200,
				data: {
					id: 1,
					companyName: 'ABC Corporation',
					address: '123 Business Street',
					phone: '+971-12345678',
					email: 'info@abc.com',
				},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getGeneralSettingDetail());

			expect(result.data).toHaveProperty('companyName');
			expect(result.data).toHaveProperty('address');
			expect(result.data).toHaveProperty('phone');
			expect(result.data).toHaveProperty('email');
		});

		it('should handle empty response data', async () => {
			const mockResponse = {
				status: 200,
				data: {},
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getGeneralSettingDetail());

			expect(result.data).toEqual({});
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch settings');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getGeneralSettingDetail())
			).rejects.toThrow('Failed to fetch settings');
		});

		it('should handle network timeout errors', async () => {
			const mockError = new Error('Network timeout');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getGeneralSettingDetail())
			).rejects.toThrow('Network timeout');
		});
	});

	describe('updateGeneralSettings', () => {
		it('should call API with POST method and settings data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Settings updated successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const settingsData = {
				companyName: 'Updated Company',
				currency: 'USD',
				fiscalYear: '2024-2025',
			};

			const result = await store.dispatch(actions.updateGeneralSettings(settingsData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/companySetting/update',
				data: settingsData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle partial settings update', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Settings updated' },
			};

			authApi.mockResolvedValue(mockResponse);

			const partialData = {
				companyName: 'New Name',
			};

			await store.dispatch(actions.updateGeneralSettings(partialData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.data).toEqual(partialData);
		});

		it('should handle complete settings object', async () => {
			const mockResponse = {
				status: 200,
				data: { success: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const completeData = {
				companyName: 'ABC Corp',
				address: '123 Street',
				phone: '+971123456',
				email: 'contact@abc.com',
				taxNumber: 'TRN123',
				currency: 'AED',
				fiscalYear: '2024',
			};

			const result = await store.dispatch(actions.updateGeneralSettings(completeData));

			expect(result.data.success).toBe(true);
		});

		it('should handle update errors', async () => {
			const mockError = new Error('Update failed');
			authApi.mockRejectedValue(mockError);

			const settingsData = { companyName: 'Test' };

			await expect(
				store.dispatch(actions.updateGeneralSettings(settingsData))
			).rejects.toThrow('Update failed');
		});

		it('should handle validation errors', async () => {
			const mockError = new Error('Validation failed');
			authApi.mockRejectedValue(mockError);

			const invalidData = {
				companyName: '',
				email: 'invalid-email',
			};

			await expect(
				store.dispatch(actions.updateGeneralSettings(invalidData))
			).rejects.toThrow('Validation failed');
		});

		it('should handle empty settings object', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'No changes made' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.updateGeneralSettings({}));

			expect(result.status).toBe(200);
		});

		it('should handle settings with numeric values', async () => {
			const mockResponse = {
				status: 200,
				data: { updated: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const settingsData = {
				fiscalYearStart: 1,
				fiscalYearEnd: 12,
				decimalPlaces: 2,
			};

			await store.dispatch(actions.updateGeneralSettings(settingsData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.data).toHaveProperty('fiscalYearStart', 1);
			expect(apiCall.data).toHaveProperty('decimalPlaces', 2);
		});

		it('should handle settings with boolean values', async () => {
			const mockResponse = {
				status: 200,
				data: { success: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const settingsData = {
				enableVAT: true,
				enableExcise: false,
				autoPosting: true,
			};

			const result = await store.dispatch(actions.updateGeneralSettings(settingsData));

			expect(result.data.success).toBe(true);
		});

		it('should handle nested settings object', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Updated' },
			};

			authApi.mockResolvedValue(mockResponse);

			const settingsData = {
				company: {
					name: 'Test Corp',
					address: {
						street: '123 Main St',
						city: 'Dubai',
					},
				},
			};

			await store.dispatch(actions.updateGeneralSettings(settingsData));

			const apiCall = authApi.mock.calls[0][0];
			expect(apiCall.data.company.name).toBe('Test Corp');
		});

		it('should handle settings with null values', async () => {
			const mockResponse = {
				status: 200,
				data: { cleared: true },
			};

			authApi.mockResolvedValue(mockResponse);

			const settingsData = {
				optionalField: null,
				clearField: null,
			};

			const result = await store.dispatch(actions.updateGeneralSettings(settingsData));

			expect(result.data.cleared).toBe(true);
		});
	});

	describe('Action error handling', () => {
		it('should handle network errors for all actions', async () => {
			const networkError = new Error('Network Error');
			authApi.mockRejectedValue(networkError);

			await expect(actions.getTestUserMailById(1)(jest.fn())).rejects.toThrow();
			await expect(actions.getGeneralSettingDetail()(jest.fn())).rejects.toThrow();
			await expect(actions.updateGeneralSettings({})(jest.fn())).rejects.toThrow();
		});

		it('should propagate API errors correctly', async () => {
			const apiError = new Error('Unauthorized');
			authApi.mockRejectedValue(apiError);

			const dispatch = jest.fn();

			await expect(actions.getGeneralSettingDetail()(dispatch)).rejects.toThrow(
				'Unauthorized'
			);
		});
	});
});
