import SalaryRoleReducer from '../reducer';
import { SALARY_ROLES } from 'constants/types';

describe('Salary Roles Reducer', () => {
	const initialState = {
		salaryRole_list: [],
		currency_list: [],
		country_list: [],
	};

	it('should return the initial state', () => {
		expect(SalaryRoleReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle SALARY_ROLES.SALARY_ROLES_LIST action', () => {
		const mockSalaryRoles = [
			{ id: 1, roleName: 'Developer', baseSalary: 5000, currency: 'AED' },
			{ id: 2, roleName: 'Manager', baseSalary: 8000, currency: 'AED' },
			{ id: 3, roleName: 'Senior Developer', baseSalary: 7000, currency: 'AED' },
		];

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: mockSalaryRoles,
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState.salaryRole_list).toEqual(mockSalaryRoles);
		expect(newState.salaryRole_list).toHaveLength(3);
	});

	it('should update salary role list without affecting other state', () => {
		const stateWithCurrency = {
			salaryRole_list: [],
			currency_list: [{ id: 1, code: 'AED' }],
			country_list: [{ id: 1, name: 'UAE' }],
		};

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [{ id: 1, roleName: 'Developer' }],
		};

		const newState = SalaryRoleReducer(stateWithCurrency, action);

		expect(newState.salaryRole_list).toHaveLength(1);
		expect(newState.currency_list).toHaveLength(1);
		expect(newState.country_list).toHaveLength(1);
	});

	it('should handle empty salary role list', () => {
		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [],
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState.salaryRole_list).toEqual([]);
		expect(newState.salaryRole_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [{ id: 1, roleName: 'Developer' }],
		};

		const stateBefore = { ...initialState };
		SalaryRoleReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_SALARY_ROLE_ACTION',
			payload: [],
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			...initialState,
			salaryRole_list: [{ id: 1, roleName: 'Old Role' }],
		};

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [{ id: 2, roleName: 'New Role' }],
		};

		const newState = SalaryRoleReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.salaryRole_list).not.toBe(currentState.salaryRole_list);
	});

	it('should handle salary role with complete details', () => {
		const detailedSalaryRoles = [
			{
				id: 1,
				roleName: 'Senior Developer',
				baseSalary: 10000,
				currency: 'AED',
				allowances: {
					housing: 2000,
					transport: 500,
				},
				benefits: ['Health Insurance', 'Annual Leave'],
			},
		];

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: detailedSalaryRoles,
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState.salaryRole_list[0].allowances.housing).toBe(2000);
		expect(newState.salaryRole_list[0].benefits).toContain('Health Insurance');
	});

	it('should handle large salary role list', () => {
		const largeSalaryRoleList = Array.from({ length: 100 }, (_, i) => ({
			id: i + 1,
			roleName: `Role ${i + 1}`,
			baseSalary: 5000 + i * 100,
		}));

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: largeSalaryRoleList,
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState.salaryRole_list).toHaveLength(100);
		expect(newState.salaryRole_list[0].roleName).toBe('Role 1');
		expect(newState.salaryRole_list[99].roleName).toBe('Role 100');
	});

	it('should handle multiple salary role list updates', () => {
		let state = initialState;

		const action1 = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [{ id: 1, roleName: 'Developer' }],
		};

		state = SalaryRoleReducer(state, action1);
		expect(state.salaryRole_list).toHaveLength(1);

		const action2 = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [
				{ id: 1, roleName: 'Developer' },
				{ id: 2, roleName: 'Manager' },
			],
		};

		state = SalaryRoleReducer(state, action2);
		expect(state.salaryRole_list).toHaveLength(2);

		const action3 = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [
				{ id: 1, roleName: 'Developer' },
				{ id: 2, roleName: 'Manager' },
				{ id: 3, roleName: 'Senior Manager' },
			],
		};

		state = SalaryRoleReducer(state, action3);
		expect(state.salaryRole_list).toHaveLength(3);
	});

	it('should preserve state shape after actions', () => {
		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: [{ id: 1, roleName: 'Developer' }],
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState).toHaveProperty('salaryRole_list');
		expect(newState).toHaveProperty('currency_list');
		expect(newState).toHaveProperty('country_list');
		expect(Object.keys(newState)).toHaveLength(3);
	});

	it('should handle salary roles with different currencies', () => {
		const multiCurrencyRoles = [
			{ id: 1, roleName: 'UAE Developer', baseSalary: 5000, currency: 'AED' },
			{ id: 2, roleName: 'US Developer', baseSalary: 8000, currency: 'USD' },
			{ id: 3, roleName: 'UK Developer', baseSalary: 6000, currency: 'GBP' },
		];

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: multiCurrencyRoles,
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState.salaryRole_list).toHaveLength(3);
		expect(newState.salaryRole_list[0].currency).toBe('AED');
		expect(newState.salaryRole_list[1].currency).toBe('USD');
		expect(newState.salaryRole_list[2].currency).toBe('GBP');
	});

	it('should handle salary roles with numeric and string IDs', () => {
		const mixedIdRoles = [
			{ id: 1, roleName: 'Role 1' },
			{ id: '2', roleName: 'Role 2' },
			{ id: 'ABC123', roleName: 'Role 3' },
		];

		const action = {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: mixedIdRoles,
		};

		const newState = SalaryRoleReducer(initialState, action);

		expect(newState.salaryRole_list).toHaveLength(3);
		expect(newState.salaryRole_list[0].id).toBe(1);
		expect(newState.salaryRole_list[1].id).toBe('2');
		expect(newState.salaryRole_list[2].id).toBe('ABC123');
	});

	it('should handle replacement of existing salary role list', () => {
		const initialRoles = [
			{ id: 1, roleName: 'Old Role 1' },
			{ id: 2, roleName: 'Old Role 2' },
		];

		let state = SalaryRoleReducer(initialState, {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: initialRoles,
		});

		expect(state.salaryRole_list).toHaveLength(2);

		const newRoles = [
			{ id: 3, roleName: 'New Role 1' },
			{ id: 4, roleName: 'New Role 2' },
			{ id: 5, roleName: 'New Role 3' },
		];

		state = SalaryRoleReducer(state, {
			type: SALARY_ROLES.SALARY_ROLES_LIST,
			payload: newRoles,
		});

		expect(state.salaryRole_list).toHaveLength(3);
		expect(state.salaryRole_list).toEqual(newRoles);
		expect(state.salaryRole_list).not.toContain(initialRoles[0]);
	});
});
