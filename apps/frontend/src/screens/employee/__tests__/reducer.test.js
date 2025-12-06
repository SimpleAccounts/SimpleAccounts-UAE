import EmployeeReducer from '../reducer';
import { EMPLOYEE } from 'constants/types';

describe('EmployeeReducer', () => {
	const initialState = {
		employee_list: [],
		currency_list: [],
	};

	it('should return the initial state', () => {
		expect(EmployeeReducer(undefined, {})).toEqual(initialState);
	});

	describe('EMPLOYEE_LIST', () => {
		it('should handle EMPLOYEE_LIST action', () => {
			const mockEmployees = [
				{ id: 1, name: 'John Doe', email: 'john@example.com', department: 'IT' },
				{ id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'HR' },
			];

			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: mockEmployees,
			};

			const expectedState = {
				...initialState,
				employee_list: mockEmployees,
			};

			expect(EmployeeReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing employee list', () => {
			const existingState = {
				...initialState,
				employee_list: [{ id: 99, name: 'Old Employee' }],
			};

			const newEmployees = [
				{ id: 1, name: 'New Employee 1' },
				{ id: 2, name: 'New Employee 2' },
			];

			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: newEmployees,
			};

			const newState = EmployeeReducer(existingState, action);
			expect(newState.employee_list).toEqual(newEmployees);
			expect(newState.employee_list).toHaveLength(2);
		});

		it('should handle empty employee list', () => {
			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: [],
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.employee_list).toEqual([]);
		});

		it('should handle employee with pagination data', () => {
			const mockData = {
				data: [
					{ id: 1, name: 'Employee 1' },
					{ id: 2, name: 'Employee 2' },
				],
				totalRecords: 2,
				pageNo: 1,
				pageSize: 10,
			};

			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: mockData,
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.employee_list).toEqual(mockData);
		});
	});

	describe('CURRENCY_LIST', () => {
		it('should handle CURRENCY_LIST action', () => {
			const mockCurrencies = [
				{ code: 'USD', name: 'US Dollar', symbol: '$' },
				{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
				{ code: 'EUR', name: 'Euro', symbol: '€' },
			];

			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: mockCurrencies },
			};

			const expectedState = {
				...initialState,
				currency_list: mockCurrencies,
			};

			expect(EmployeeReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing currency list', () => {
			const existingState = {
				...initialState,
				currency_list: [{ code: 'GBP', name: 'British Pound' }],
			};

			const newCurrencies = [
				{ code: 'USD', name: 'US Dollar' },
				{ code: 'AED', name: 'UAE Dirham' },
			];

			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: newCurrencies },
			};

			const newState = EmployeeReducer(existingState, action);
			expect(newState.currency_list).toEqual(newCurrencies);
		});

		it('should handle empty currency list', () => {
			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: [] },
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.currency_list).toEqual([]);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action', () => {
			const action = {
				type: 'UNKNOWN_ACTION',
				payload: { data: 'test' },
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				employee_list: [{ id: 1 }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = EmployeeReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state', () => {
			const originalState = { ...initialState };
			const payload = [{ id: 1, name: 'Test Employee' }];

			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload,
			};

			EmployeeReducer(originalState, action);
			expect(originalState.employee_list).toEqual([]);
		});

		it('should preserve other state properties when updating employee_list', () => {
			const stateWithData = {
				...initialState,
				employee_list: [{ id: 1 }],
				currency_list: [{ code: 'USD' }],
			};

			const payload = [{ id: 2 }];
			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload,
			};

			const newState = EmployeeReducer(stateWithData, action);
			expect(newState.employee_list).toEqual([{ id: 2 }]);
			expect(newState.currency_list).toEqual([{ code: 'USD' }]);
		});

		it('should preserve other state properties when updating currency_list', () => {
			const stateWithData = {
				...initialState,
				employee_list: [{ id: 1, name: 'Employee' }],
				currency_list: [{ code: 'GBP' }],
			};

			const payload = { data: [{ code: 'AED' }] };
			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload,
			};

			const newState = EmployeeReducer(stateWithData, action);
			expect(newState.currency_list).toEqual([{ code: 'AED' }]);
			expect(newState.employee_list).toEqual([{ id: 1, name: 'Employee' }]);
		});
	});

	describe('complex employee data scenarios', () => {
		it('should handle employees with complete information', () => {
			const complexEmployees = [
				{
					id: 1,
					name: 'John Doe',
					email: 'john@example.com',
					phone: '+971501234567',
					department: 'IT',
					position: 'Senior Developer',
					salary: 15000,
					currency: 'AED',
					joinDate: '2020-01-15',
					status: 'Active',
				},
			];

			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: complexEmployees,
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.employee_list[0]).toHaveProperty('name', 'John Doe');
			expect(newState.employee_list[0]).toHaveProperty('department', 'IT');
			expect(newState.employee_list[0]).toHaveProperty('salary', 15000);
		});

		it('should handle multiple currencies with exchange rates', () => {
			const currenciesWithRates = [
				{ code: 'USD', name: 'US Dollar', rate: 3.67, isActive: true },
				{ code: 'AED', name: 'UAE Dirham', rate: 1.0, isActive: true },
				{ code: 'EUR', name: 'Euro', rate: 4.02, isActive: true },
			];

			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: currenciesWithRates },
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.currency_list).toHaveLength(3);
			expect(newState.currency_list[0].rate).toBe(3.67);
		});
	});
});
