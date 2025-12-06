import PayrollEmployeeReducer from '../reducer';
import { EMPLOYEEPAYROLL } from 'constants/types';

describe('PayrollEmployeeReducer', () => {
	const initialState = {
		payroll_employee_list: [],
		designation_dropdown: [],
		employee_list_dropdown: [],
		country_list: [],
		state_list: [],
		salary_role_dropdown: [],
		salary_structure_dropdown: [],
		salary_component_fixed_dropdown: [],
		salary_component_varaible_dropdown: [],
		salary_component_deduction_dropdown: [],
		incompleteEmployeeList: [],
	};

	it('should return the initial state', () => {
		expect(PayrollEmployeeReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PAYROLL_EMPLOYEE_LIST with empty array', () => {
		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			payroll_employee_list: [],
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYROLL_EMPLOYEE_LIST with data', () => {
		const mockEmployees = [
			{ id: 1, name: 'Employee 1', salary: 5000 },
			{ id: 2, name: 'Employee 2', salary: 6000 },
		];

		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: mockEmployees,
		};

		const expectedState = {
			...initialState,
			payroll_employee_list: mockEmployees,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle DESIGNATION_DROPDOWN with data', () => {
		const mockDesignations = [
			{ id: 1, name: 'Manager' },
			{ id: 2, name: 'Developer' },
			{ id: 3, name: 'Designer' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.DESIGNATION_DROPDOWN,
			payload: mockDesignations,
		};

		const expectedState = {
			...initialState,
			designation_dropdown: mockDesignations,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EMPLOYEE_LIST_DDROPDOWN with data', () => {
		const mockEmployees = [
			{ id: 1, label: 'John Doe', value: 'emp1' },
			{ id: 2, label: 'Jane Smith', value: 'emp2' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN,
			payload: mockEmployees,
		};

		const expectedState = {
			...initialState,
			employee_list_dropdown: mockEmployees,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle COUNTRY_LIST with data', () => {
		const mockCountries = [
			{ id: 1, name: 'United Arab Emirates', code: 'AE' },
			{ id: 2, name: 'Saudi Arabia', code: 'SA' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.COUNTRY_LIST,
			payload: mockCountries,
		};

		const expectedState = {
			...initialState,
			country_list: mockCountries,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle STATE_LIST with data', () => {
		const mockStates = [
			{ id: 1, name: 'Dubai' },
			{ id: 2, name: 'Abu Dhabi' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.STATE_LIST,
			payload: mockStates,
		};

		const expectedState = {
			...initialState,
			state_list: mockStates,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_ROLE_DROPDOWN with data', () => {
		const mockRoles = [
			{ id: 1, name: 'Role A' },
			{ id: 2, name: 'Role B' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.SALARY_ROLE_DROPDOWN,
			payload: mockRoles,
		};

		const expectedState = {
			...initialState,
			salary_role_dropdown: mockRoles,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_STRUCTURE_DROPDOWN with data', () => {
		const mockStructures = [
			{ id: 1, name: 'Structure 1', components: [] },
			{ id: 2, name: 'Structure 2', components: [] },
		];

		const action = {
			type: EMPLOYEEPAYROLL.SALARY_STRUCTURE_DROPDOWN,
			payload: mockStructures,
		};

		const expectedState = {
			...initialState,
			salary_structure_dropdown: mockStructures,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_COMPONENT_FIXED_DROPDOWN with data', () => {
		const mockComponents = [
			{ id: 1, name: 'Basic Salary', amount: 5000 },
			{ id: 2, name: 'HRA', amount: 2000 },
		];

		const action = {
			type: EMPLOYEEPAYROLL.SALARY_COMPONENT_FIXED_DROPDOWN,
			payload: mockComponents,
		};

		const expectedState = {
			...initialState,
			salary_component_fixed_dropdown: mockComponents,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_COMPONENT_VARAIBLE_DROPDOWN with data', () => {
		const mockComponents = [
			{ id: 1, name: 'Performance Bonus', percentage: 10 },
			{ id: 2, name: 'Commission', percentage: 5 },
		];

		const action = {
			type: EMPLOYEEPAYROLL.SALARY_COMPONENT_VARAIBLE_DROPDOWN,
			payload: mockComponents,
		};

		const expectedState = {
			...initialState,
			salary_component_varaible_dropdown: mockComponents,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_COMPONENT_DEDUCTION_DROPDOWN with data', () => {
		const mockDeductions = [
			{ id: 1, name: 'Tax', percentage: 5 },
			{ id: 2, name: 'Insurance', amount: 300 },
		];

		const action = {
			type: EMPLOYEEPAYROLL.SALARY_COMPONENT_DEDUCTION_DROPDOWN,
			payload: mockDeductions,
		};

		const expectedState = {
			...initialState,
			salary_component_deduction_dropdown: mockDeductions,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle INCOMPLETED_EMPLOYEE_LIST with data', () => {
		const mockIncompleteEmployees = [
			{ id: 1, name: 'Employee A', status: 'incomplete' },
			{ id: 2, name: 'Employee B', status: 'incomplete' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST,
			payload: mockIncompleteEmployees,
		};

		const expectedState = {
			...initialState,
			incompleteEmployeeList: mockIncompleteEmployees,
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(PayrollEmployeeReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state when handling actions', () => {
		const mockData = [{ id: 1, name: 'Test' }];
		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: mockData,
		};

		const stateBefore = { ...initialState };
		PayrollEmployeeReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple actions in sequence', () => {
		const employees = [{ id: 1, name: 'Employee 1' }];
		const designations = [{ id: 1, name: 'Manager' }];
		const countries = [{ id: 1, name: 'UAE' }];

		let state = PayrollEmployeeReducer(initialState, {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: employees,
		});

		state = PayrollEmployeeReducer(state, {
			type: EMPLOYEEPAYROLL.DESIGNATION_DROPDOWN,
			payload: designations,
		});

		state = PayrollEmployeeReducer(state, {
			type: EMPLOYEEPAYROLL.COUNTRY_LIST,
			payload: countries,
		});

		expect(state).toEqual({
			...initialState,
			payroll_employee_list: employees,
			designation_dropdown: designations,
			country_list: countries,
		});
	});

	it('should maintain other state properties when updating one property', () => {
		const stateWithData = {
			...initialState,
			payroll_employee_list: [{ id: 1, name: 'Existing' }],
			designation_dropdown: [{ id: 1, name: 'Manager' }],
		};

		const newCountries = [{ id: 1, name: 'UAE' }];

		const state = PayrollEmployeeReducer(stateWithData, {
			type: EMPLOYEEPAYROLL.COUNTRY_LIST,
			payload: newCountries,
		});

		expect(state.payroll_employee_list).toEqual(
			stateWithData.payroll_employee_list
		);
		expect(state.designation_dropdown).toEqual(
			stateWithData.designation_dropdown
		);
		expect(state.country_list).toEqual(newCountries);
	});
});
