import EmployeeReducer from '../reducer';
import { EMPLOYEE } from 'constants/types';

describe('EmployeeReducer (Employment Module)', () => {
	const initialState = {
		employee_list: [],
		currency_list: [],
	};

	it('should return the initial state', () => {
		expect(EmployeeReducer(undefined, {})).toEqual(initialState);
	});

	it('should return initial state when undefined is passed', () => {
		const result = EmployeeReducer(undefined, { type: 'UNKNOWN' });
		expect(result).toEqual(initialState);
	});

	describe('EMPLOYEE_LIST', () => {
		it('should handle EMPLOYEE_LIST action with valid data', () => {
			const mockEmployees = [
				{ id: 1, name: 'Ahmed Ali', email: 'ahmed@example.com', department: 'Finance' },
				{ id: 2, name: 'Fatima Hassan', email: 'fatima@example.com', department: 'HR' },
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

		it('should replace existing employee list completely', () => {
			const existingState = {
				...initialState,
				employee_list: [
					{ id: 99, name: 'Old Employee', email: 'old@example.com' }
				],
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
			expect(newState.employee_list[0].id).toBe(1);
		});

		it('should handle empty employee list', () => {
			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: [],
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.employee_list).toEqual([]);
			expect(newState.employee_list).toHaveLength(0);
		});

		it('should handle employee list with pagination metadata', () => {
			const mockData = {
				data: [
					{ id: 1, name: 'Employee 1', status: 'Active' },
					{ id: 2, name: 'Employee 2', status: 'Inactive' },
				],
				totalRecords: 50,
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

		it('should create a new array reference using Object.assign', () => {
			const mockEmployees = [{ id: 1, name: 'Test' }];
			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: mockEmployees,
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.employee_list).not.toBe(mockEmployees);
			expect(newState.employee_list).toEqual(mockEmployees);
		});

		it('should handle employee list with complex nested data', () => {
			const complexEmployees = [
				{
					id: 1,
					name: 'Mohammed Ahmed',
					email: 'mohammed@example.com',
					phone: '+971501234567',
					department: { id: 1, name: 'IT' },
					position: { id: 5, title: 'Senior Developer' },
					salary: {
						amount: 15000,
						currency: 'AED',
						paymentType: 'Monthly'
					},
					joinDate: '2020-01-15',
					status: 'Active',
				},
			];

			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: complexEmployees,
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.employee_list[0]).toHaveProperty('name', 'Mohammed Ahmed');
			expect(newState.employee_list[0].department.name).toBe('IT');
			expect(newState.employee_list[0].salary.amount).toBe(15000);
		});
	});

	describe('CURRENCY_LIST', () => {
		it('should handle CURRENCY_LIST action with valid data', () => {
			const mockCurrencies = [
				{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
				{ code: 'USD', name: 'US Dollar', symbol: '$' },
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
				currency_list: [
					{ code: 'GBP', name: 'British Pound', symbol: '£' }
				],
			};

			const newCurrencies = [
				{ code: 'USD', name: 'US Dollar', symbol: '$' },
				{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
			];

			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: newCurrencies },
			};

			const newState = EmployeeReducer(existingState, action);
			expect(newState.currency_list).toEqual(newCurrencies);
			expect(newState.currency_list).toHaveLength(2);
		});

		it('should handle empty currency list', () => {
			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: [] },
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.currency_list).toEqual([]);
		});

		it('should extract data from nested payload structure', () => {
			const currenciesData = [
				{ code: 'AED', name: 'UAE Dirham' },
				{ code: 'SAR', name: 'Saudi Riyal' },
			];

			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: {
					data: currenciesData,
					status: 200,
					message: 'Success'
				},
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState.currency_list).toEqual(currenciesData);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action type', () => {
			const action = {
				type: 'UNKNOWN_ACTION_TYPE',
				payload: { data: 'test' },
			};

			const newState = EmployeeReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				employee_list: [{ id: 1, name: 'Test Employee' }],
				currency_list: [{ code: 'AED' }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = EmployeeReducer(currentState, action);
			expect(newState).toEqual(currentState);
			expect(newState).toBe(currentState);
		});

		it('should handle action with missing type', () => {
			const currentState = { ...initialState };
			const action = { payload: { data: 'test' } };

			const newState = EmployeeReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state when updating employee_list', () => {
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
				employee_list: [{ id: 1, name: 'Old Employee' }],
				currency_list: [{ code: 'USD', name: 'US Dollar' }],
			};

			const payload = [{ id: 2, name: 'New Employee' }];
			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload,
			};

			const newState = EmployeeReducer(stateWithData, action);
			expect(newState.employee_list).toEqual([{ id: 2, name: 'New Employee' }]);
			expect(newState.currency_list).toEqual([{ code: 'USD', name: 'US Dollar' }]);
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

		it('should create new state object reference', () => {
			const originalState = { ...initialState };
			const action = {
				type: EMPLOYEE.EMPLOYEE_LIST,
				payload: [{ id: 1 }],
			};

			const newState = EmployeeReducer(originalState, action);
			expect(newState).not.toBe(originalState);
		});

		it('should not mutate currency_list when updating it', () => {
			const originalCurrencies = [{ code: 'USD' }];
			const stateWithData = {
				...initialState,
				currency_list: originalCurrencies,
			};

			const newCurrencies = [{ code: 'AED' }];
			const action = {
				type: EMPLOYEE.CURRENCY_LIST,
				payload: { data: newCurrencies },
			};

			EmployeeReducer(stateWithData, action);
			expect(originalCurrencies).toEqual([{ code: 'USD' }]);
		});
	});
});
