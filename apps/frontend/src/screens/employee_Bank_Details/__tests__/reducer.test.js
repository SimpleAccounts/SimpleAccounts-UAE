import EmployeeReducer from '../reducer';
import { EMPLOYEE } from 'constants/types';

describe('EmployeeReducer (Employee Bank Details Module)', () => {
	const initialState = {
		employee_list: [],
		currency_list: [],
	};

	it('should return the initial state', () => {
		expect(EmployeeReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle EMPLOYEE.EMPLOYEE_LIST with empty array', () => {
		const action = {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			employee_list: [],
		};

		expect(EmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EMPLOYEE.EMPLOYEE_LIST with employee bank details data', () => {
		const mockEmployees = [
			{
				id: 1,
				name: 'John Doe',
				email: 'john@example.com',
				bankDetails: {
					accountNumber: '123456789',
					bankName: 'Emirates NBD',
					iban: 'AE070331234567890123456',
				},
			},
			{
				id: 2,
				name: 'Jane Smith',
				email: 'jane@example.com',
				bankDetails: {
					accountNumber: '987654321',
					bankName: 'ADCB',
					iban: 'AE070331234567890123457',
				},
			},
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

	it('should handle EMPLOYEE.CURRENCY_LIST with empty data', () => {
		const action = {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: { data: [] },
		};

		const expectedState = {
			...initialState,
			currency_list: [],
		};

		expect(EmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EMPLOYEE.CURRENCY_LIST with currency data', () => {
		const mockCurrencies = [
			{ id: 1, code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
			{ id: 2, code: 'USD', name: 'US Dollar', symbol: '$' },
			{ id: 3, code: 'EUR', name: 'Euro', symbol: '€' },
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

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(EmployeeReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state when handling EMPLOYEE_LIST', () => {
		const mockEmployees = [
			{ id: 1, name: 'Test Employee', bankAccount: '12345' },
		];
		const action = {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: mockEmployees,
		};

		const stateBefore = { ...initialState };
		EmployeeReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should not mutate state when handling CURRENCY_LIST', () => {
		const mockCurrencies = [{ id: 1, code: 'AED' }];
		const action = {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const stateBefore = { ...initialState };
		EmployeeReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple actions in sequence', () => {
		const employees = [
			{ id: 1, name: 'Employee 1', bankAccount: '111' },
			{ id: 2, name: 'Employee 2', bankAccount: '222' },
		];
		const currencies = [
			{ id: 1, code: 'AED' },
			{ id: 2, code: 'SAR' },
		];

		let state = EmployeeReducer(initialState, {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: employees,
		});

		state = EmployeeReducer(state, {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: { data: currencies },
		});

		expect(state).toEqual({
			employee_list: employees,
			currency_list: currencies,
		});
	});

	it('should override previous employee_list data', () => {
		const firstEmployees = [{ id: 1, name: 'First Employee' }];
		const secondEmployees = [
			{ id: 2, name: 'Second Employee' },
			{ id: 3, name: 'Third Employee' },
		];

		let state = EmployeeReducer(initialState, {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: firstEmployees,
		});

		state = EmployeeReducer(state, {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: secondEmployees,
		});

		expect(state.employee_list).toEqual(secondEmployees);
		expect(state.employee_list.length).toBe(2);
	});

	it('should override previous currency_list data', () => {
		const firstCurrencies = [{ id: 1, code: 'USD' }];
		const secondCurrencies = [
			{ id: 2, code: 'EUR' },
			{ id: 3, code: 'GBP' },
		];

		let state = EmployeeReducer(initialState, {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: { data: firstCurrencies },
		});

		state = EmployeeReducer(state, {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: { data: secondCurrencies },
		});

		expect(state.currency_list).toEqual(secondCurrencies);
		expect(state.currency_list.length).toBe(2);
	});

	it('should maintain other state properties when updating employee_list', () => {
		const stateWithCurrencies = {
			...initialState,
			currency_list: [{ id: 1, code: 'AED' }],
		};

		const newEmployees = [{ id: 1, name: 'New Employee' }];

		const state = EmployeeReducer(stateWithCurrencies, {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: newEmployees,
		});

		expect(state.currency_list).toEqual(stateWithCurrencies.currency_list);
		expect(state.employee_list).toEqual(newEmployees);
	});

	it('should maintain other state properties when updating currency_list', () => {
		const stateWithEmployees = {
			...initialState,
			employee_list: [{ id: 1, name: 'Existing Employee' }],
		};

		const newCurrencies = [{ id: 1, code: 'SAR' }];

		const state = EmployeeReducer(stateWithEmployees, {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: { data: newCurrencies },
		});

		expect(state.employee_list).toEqual(stateWithEmployees.employee_list);
		expect(state.currency_list).toEqual(newCurrencies);
	});

	it('should handle EMPLOYEE_LIST with complex bank details', () => {
		const complexEmployees = [
			{
				id: 1,
				name: 'Employee With Bank Details',
				bankDetails: {
					accountNumber: '1234567890',
					bankName: 'Emirates NBD',
					iban: 'AE070331234567890123456',
					swiftCode: 'EBILAEAD',
					branch: {
						name: 'Dubai Main Branch',
						code: 'DXB001',
						address: 'Sheikh Zayed Road, Dubai',
					},
					currency: 'AED',
				},
			},
		];

		const action = {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: complexEmployees,
		};

		const state = EmployeeReducer(initialState, action);

		expect(state.employee_list).toEqual(complexEmployees);
		expect(state.employee_list[0].bankDetails.branch.code).toBe('DXB001');
	});

	it('should handle null payload gracefully for EMPLOYEE_LIST', () => {
		const action = {
			type: EMPLOYEE.EMPLOYEE_LIST,
			payload: null,
		};

		expect(() => EmployeeReducer(initialState, action)).not.toThrow();
	});

	it('should handle undefined payload.data for CURRENCY_LIST', () => {
		const action = {
			type: EMPLOYEE.CURRENCY_LIST,
			payload: {},
		};

		const state = EmployeeReducer(initialState, action);
		expect(state.currency_list).toBeUndefined();
	});
});
