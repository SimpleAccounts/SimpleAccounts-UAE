import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Salary Component Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('saveSalaryComponent', () => {
		it('should save new salary component successfully', async () => {
			const mockComponent = {
				componentName: 'Basic Salary',
				componentType: 'Earnings',
				calculationType: 'Fixed',
				amount: 5000,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { id: 1, ...mockComponent },
			});

			const result = await store.dispatch(
				actions.saveSalaryComponent(mockComponent, false)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/payroll/saveSalaryComponent',
				data: mockComponent,
			});

			expect(result.status).toBe(200);
			expect(result.data.id).toBe(1);
		});

		it('should update existing salary component when isCreated is true', async () => {
			const mockComponent = {
				id: 1,
				componentName: 'Updated Basic Salary',
				componentType: 'Earnings',
				amount: 6000,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockComponent,
			});

			const result = await store.dispatch(
				actions.saveSalaryComponent(mockComponent, true)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/payroll/updateSalaryComponent',
				data: mockComponent,
			});

			expect(result.status).toBe(200);
		});

		it('should use correct URL for new component creation', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.saveSalaryComponent({}, false));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/payroll/saveSalaryComponent',
				})
			);
		});

		it('should use correct URL for component update', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.saveSalaryComponent({}, true));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/payroll/updateSalaryComponent',
				})
			);
		});

		it('should handle save error', async () => {
			authApi.mockRejectedValue(new Error('Save failed'));

			await expect(
				store.dispatch(actions.saveSalaryComponent({}, false))
			).rejects.toThrow('Save failed');
		});

		it('should return response on successful save', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, componentName: 'Test Component' },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.saveSalaryComponent({}, false));
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.saveSalaryComponent({}, false));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle complex salary component data', async () => {
			const complexComponent = {
				componentName: 'Housing Allowance',
				componentType: 'Allowance',
				calculationType: 'Percentage',
				basePercentage: 25,
				isActive: true,
				isTaxable: false,
				description: 'Housing allowance for employees',
			};

			authApi.mockResolvedValue({ status: 200, data: complexComponent });

			await store.dispatch(actions.saveSalaryComponent(complexComponent, false));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: complexComponent,
				})
			);
		});
	});

	describe('updateSalaryComponent', () => {
		it('should update salary component successfully', async () => {
			const mockComponent = {
				id: 1,
				componentName: 'Updated Allowance',
				amount: 3000,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockComponent,
			});

			const result = await store.dispatch(
				actions.updateSalaryComponent(mockComponent)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/payroll/updateSalaryComponent',
				data: mockComponent,
			});

			expect(result.status).toBe(200);
		});

		it('should handle update error', async () => {
			authApi.mockRejectedValue(new Error('Update failed'));

			await expect(
				store.dispatch(actions.updateSalaryComponent({}))
			).rejects.toThrow('Update failed');
		});

		it('should return response object', async () => {
			const mockResponse = { status: 200, data: { id: 1 } };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.updateSalaryComponent({}));
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.updateSalaryComponent({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});
	});

	describe('deleteSalaryComponent', () => {
		it('should delete salary component successfully', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Component deleted successfully' },
			});

			const result = await store.dispatch(actions.deleteSalaryComponent(1));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/payroll/deleteSalaryComponent?id=1',
			});

			expect(result.status).toBe(200);
		});

		it('should handle delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.deleteSalaryComponent(1))
			).rejects.toThrow('Delete failed');
		});

		it('should build correct URL with component ID', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.deleteSalaryComponent(123));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/payroll/deleteSalaryComponent?id=123',
				})
			);
		});

		it('should return response object', async () => {
			const mockResponse = { status: 200, data: { deleted: true } };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.deleteSalaryComponent(1));
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.deleteSalaryComponent(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle validation errors', async () => {
			authApi.mockRejectedValue(
				new Error('Cannot delete component in use')
			);

			await expect(
				store.dispatch(actions.deleteSalaryComponent(1))
			).rejects.toThrow('Cannot delete component in use');
		});
	});

	describe('getSalaryComponentById', () => {
		it('should fetch salary component by ID successfully', async () => {
			const mockComponent = {
				id: 1,
				componentName: 'Basic Salary',
				componentType: 'Earnings',
				amount: 5000,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockComponent,
			});

			const result = await store.dispatch(actions.getSalaryComponentById(1));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/payroll/getSalaryComponentById?id=1',
			});

			expect(result.status).toBe(200);
			expect(result.data.id).toBe(1);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Component not found'));

			await expect(
				store.dispatch(actions.getSalaryComponentById(999))
			).rejects.toThrow('Component not found');
		});

		it('should build correct URL with component ID', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getSalaryComponentById(456));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/payroll/getSalaryComponentById?id=456',
				})
			);
		});

		it('should return response object', async () => {
			const mockResponse = { status: 200, data: { id: 1 } };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getSalaryComponentById(1));
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getSalaryComponentById(1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle unauthorized access', async () => {
			authApi.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				store.dispatch(actions.getSalaryComponentById(1))
			).rejects.toThrow('Unauthorized');
		});
	});

	describe('getComponentId', () => {
		it('should fetch next component ID successfully', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { nextId: 'SC-001' },
			});

			const result = await store.dispatch(actions.getComponentId());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=14',
			});

			expect(result.status).toBe(200);
			expect(result.data.nextId).toBe('SC-001');
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to generate ID'));

			await expect(store.dispatch(actions.getComponentId())).rejects.toThrow(
				'Failed to generate ID'
			);
		});

		it('should use correct invoice type parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getComponentId());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('invoiceType=14'),
				})
			);
		});

		it('should return response object', async () => {
			const mockResponse = { status: 200, data: { nextId: 'SC-002' } };
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getComponentId());
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getComponentId());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle server errors', async () => {
			authApi.mockRejectedValue(new Error('Internal Server Error'));

			await expect(store.dispatch(actions.getComponentId())).rejects.toThrow(
				'Internal Server Error'
			);
		});

		it('should use GET method', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.getComponentId());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
				})
			);
		});
	});
});
