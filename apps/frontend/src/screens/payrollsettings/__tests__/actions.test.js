import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Payroll Settings Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('getPayrollSettings', () => {
		it('should fetch payroll settings with generateSif true', async () => {
			const mockSettings = {
				id: 1,
				companyName: 'ABC Company',
				sifEnabled: true,
				payrollCycle: 'Monthly',
				currency: 'AED',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockSettings,
			});

			const result = await store.dispatch(actions.getPayrollSettings(true));

			expect(authApi).toHaveBeenCalledWith({
				method: 'POST',
				url: '/rest/company/updateSifSettings?generateSif=true',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockSettings);
		});

		it('should fetch payroll settings with generateSif false', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			await store.dispatch(actions.getPayrollSettings(false));

			expect(authApi).toHaveBeenCalledWith({
				method: 'POST',
				url: '/rest/company/updateSifSettings?generateSif=false',
			});
		});

		it('should build correct URL with generateSif parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getPayrollSettings(true));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('generateSif=true'),
				})
			);
		});

		it('should use POST method', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getPayrollSettings(true));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
				})
			);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch settings'));

			await expect(
				store.dispatch(actions.getPayrollSettings(true))
			).rejects.toThrow('Failed to fetch settings');
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: { sifEnabled: true },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getPayrollSettings(true));
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getPayrollSettings(true));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle server errors gracefully', async () => {
			authApi.mockRejectedValue(new Error('Internal Server Error'));

			await expect(
				store.dispatch(actions.getPayrollSettings(false))
			).rejects.toThrow('Internal Server Error');
		});

		it('should handle unauthorized access', async () => {
			authApi.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				store.dispatch(actions.getPayrollSettings(true))
			).rejects.toThrow('Unauthorized');
		});

		it('should handle network timeout', async () => {
			authApi.mockRejectedValue(new Error('Request timeout'));

			await expect(
				store.dispatch(actions.getPayrollSettings(true))
			).rejects.toThrow('Request timeout');
		});

		it('should handle boolean parameter correctly', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			// Test with true
			await store.dispatch(actions.getPayrollSettings(true));
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('generateSif=true'),
				})
			);

			// Clear and test with false
			jest.clearAllMocks();
			await store.dispatch(actions.getPayrollSettings(false));
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('generateSif=false'),
				})
			);
		});
	});

	describe('getCompanyById', () => {
		it('should fetch company details successfully', async () => {
			const mockCompany = {
				id: 1,
				companyName: 'ABC Trading LLC',
				registrationNumber: 'REG-12345',
				address: 'Dubai, UAE',
				email: 'info@abc.com',
				phone: '+971-4-1234567',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockCompany,
			});

			const result = await store.dispatch(actions.getCompanyById());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/company/getCompanyDetails',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCompany);
		});

		it('should use correct API endpoint', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getCompanyById());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/company/getCompanyDetails',
				})
			);
		});

		it('should use GET method', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getCompanyById());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
				})
			);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Company not found'));

			await expect(store.dispatch(actions.getCompanyById())).rejects.toThrow(
				'Company not found'
			);
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, companyName: 'Test Company' },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getCompanyById());
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getCompanyById());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle server errors', async () => {
			authApi.mockRejectedValue(new Error('Internal Server Error'));

			await expect(store.dispatch(actions.getCompanyById())).rejects.toThrow(
				'Internal Server Error'
			);
		});

		it('should handle unauthorized access', async () => {
			authApi.mockRejectedValue(new Error('Unauthorized'));

			await expect(store.dispatch(actions.getCompanyById())).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle empty company data', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: {},
			});

			const result = await store.dispatch(actions.getCompanyById());
			expect(result.data).toEqual({});
		});

		it('should handle network errors', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			await expect(store.dispatch(actions.getCompanyById())).rejects.toThrow(
				'Network error'
			);
		});

		it('should return complete company information', async () => {
			const completeCompany = {
				id: 1,
				companyName: 'Test LLC',
				legalName: 'Test Legal Entity LLC',
				registrationNumber: 'REG-001',
				taxNumber: 'TAX-001',
				address: {
					street: '123 Main St',
					city: 'Dubai',
					country: 'UAE',
					postalCode: '12345',
				},
				contacts: {
					email: 'contact@test.com',
					phone: '+971-4-1234567',
					fax: '+971-4-1234568',
				},
				settings: {
					currency: 'AED',
					fiscalYearStart: '01-01',
					fiscalYearEnd: '12-31',
				},
			};

			authApi.mockResolvedValue({
				status: 200,
				data: completeCompany,
			});

			const result = await store.dispatch(actions.getCompanyById());
			expect(result.data).toEqual(completeCompany);
			expect(result.data.address.city).toBe('Dubai');
			expect(result.data.settings.currency).toBe('AED');
		});

		it('should handle validation errors', async () => {
			authApi.mockRejectedValue(new Error('Validation failed'));

			await expect(store.dispatch(actions.getCompanyById())).rejects.toThrow(
				'Validation failed'
			);
		});

		it('should not require any parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			// Should work without any arguments
			await store.dispatch(actions.getCompanyById());

			expect(authApi).toHaveBeenCalled();
		});
	});
});
