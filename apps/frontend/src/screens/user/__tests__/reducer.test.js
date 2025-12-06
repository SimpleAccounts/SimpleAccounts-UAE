import UserReducer from '../reducer';
import { USER } from 'constants/types';

describe('UserReducer', () => {
	const initialState = {
		user_list: [],
		role_list: [],
		company_type_list: [],
		employee_list: [],
		designation_dropdown: [],
	};

	it('should return the initial state', () => {
		expect(UserReducer(undefined, {})).toEqual(initialState);
	});

	describe('USER_LIST', () => {
		it('should handle USER_LIST action', () => {
			const mockUsers = [
				{ id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
				{ id: 2, name: 'Regular User', email: 'user@example.com', role: 'User' },
			];

			const action = {
				type: USER.USER_LIST,
				payload: mockUsers,
			};

			const expectedState = {
				...initialState,
				user_list: mockUsers,
			};

			expect(UserReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing user list', () => {
			const existingState = {
				...initialState,
				user_list: [{ id: 99, name: 'Old User' }],
			};

			const newUsers = [
				{ id: 1, name: 'New User 1' },
				{ id: 2, name: 'New User 2' },
			];

			const action = {
				type: USER.USER_LIST,
				payload: newUsers,
			};

			const newState = UserReducer(existingState, action);
			expect(newState.user_list).toEqual(newUsers);
			expect(newState.user_list).toHaveLength(2);
		});

		it('should handle empty user list', () => {
			const action = {
				type: USER.USER_LIST,
				payload: [],
			};

			const newState = UserReducer(initialState, action);
			expect(newState.user_list).toEqual([]);
		});

		it('should handle users with pagination data', () => {
			const mockData = {
				data: [
					{ id: 1, name: 'User 1', active: true },
					{ id: 2, name: 'User 2', active: false },
				],
				totalRecords: 2,
				pageNo: 1,
			};

			const action = {
				type: USER.USER_LIST,
				payload: mockData,
			};

			const newState = UserReducer(initialState, action);
			expect(newState.user_list).toEqual(mockData);
		});
	});

	describe('ROLE_LIST', () => {
		it('should handle ROLE_LIST action', () => {
			const mockRoles = [
				{ id: 1, roleName: 'Admin', permissions: ['read', 'write', 'delete'] },
				{ id: 2, roleName: 'User', permissions: ['read'] },
				{ id: 3, roleName: 'Manager', permissions: ['read', 'write'] },
			];

			const action = {
				type: USER.ROLE_LIST,
				payload: mockRoles,
			};

			const expectedState = {
				...initialState,
				role_list: mockRoles,
			};

			expect(UserReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing role list', () => {
			const existingState = {
				...initialState,
				role_list: [{ id: 99, roleName: 'Old Role' }],
			};

			const newRoles = [{ id: 1, roleName: 'New Role' }];

			const action = {
				type: USER.ROLE_LIST,
				payload: newRoles,
			};

			const newState = UserReducer(existingState, action);
			expect(newState.role_list).toEqual(newRoles);
		});

		it('should handle empty role list', () => {
			const action = {
				type: USER.ROLE_LIST,
				payload: [],
			};

			const newState = UserReducer(initialState, action);
			expect(newState.role_list).toEqual([]);
		});
	});

	describe('COMPANY_TYPE_LIST', () => {
		it('should handle COMPANY_TYPE_LIST action', () => {
			const mockCompanyTypes = [
				{ id: 1, name: 'LLC', description: 'Limited Liability Company' },
				{ id: 2, name: 'FZ', description: 'Free Zone' },
				{ id: 3, name: 'Branch', description: 'Branch Office' },
			];

			const action = {
				type: USER.COMPANY_TYPE_LIST,
				payload: mockCompanyTypes,
			};

			const expectedState = {
				...initialState,
				company_type_list: mockCompanyTypes,
			};

			expect(UserReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing company type list', () => {
			const existingState = {
				...initialState,
				company_type_list: [{ id: 99, name: 'Old Type' }],
			};

			const newTypes = [{ id: 1, name: 'New Type' }];

			const action = {
				type: USER.COMPANY_TYPE_LIST,
				payload: newTypes,
			};

			const newState = UserReducer(existingState, action);
			expect(newState.company_type_list).toEqual(newTypes);
		});

		it('should handle empty company type list', () => {
			const action = {
				type: USER.COMPANY_TYPE_LIST,
				payload: [],
			};

			const newState = UserReducer(initialState, action);
			expect(newState.company_type_list).toEqual([]);
		});
	});

	describe('EMPLOYEE_LIST', () => {
		it('should handle EMPLOYEE_LIST action', () => {
			const mockEmployees = [
				{ id: 1, name: 'John Doe', employeeCode: 'EMP001' },
				{ id: 2, name: 'Jane Smith', employeeCode: 'EMP002' },
			];

			const action = {
				type: USER.EMPLOYEE_LIST,
				payload: mockEmployees,
			};

			const expectedState = {
				...initialState,
				employee_list: mockEmployees,
			};

			expect(UserReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing employee list', () => {
			const existingState = {
				...initialState,
				employee_list: [{ id: 99, name: 'Old Employee' }],
			};

			const newEmployees = [{ id: 1, name: 'New Employee' }];

			const action = {
				type: USER.EMPLOYEE_LIST,
				payload: newEmployees,
			};

			const newState = UserReducer(existingState, action);
			expect(newState.employee_list).toEqual(newEmployees);
		});
	});

	describe('DESIGNATION_DROPDOWN', () => {
		it('should handle DESIGNATION_DROPDOWN action', () => {
			const mockDesignations = [
				{ id: 1, label: 'Manager', value: 'manager' },
				{ id: 2, label: 'Developer', value: 'developer' },
				{ id: 3, label: 'Designer', value: 'designer' },
			];

			const action = {
				type: USER.DESIGNATION_DROPDOWN,
				payload: mockDesignations,
			};

			const expectedState = {
				...initialState,
				designation_dropdown: mockDesignations,
			};

			expect(UserReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing designation dropdown', () => {
			const existingState = {
				...initialState,
				designation_dropdown: [{ id: 99, label: 'Old Designation' }],
			};

			const newDesignations = [{ id: 1, label: 'New Designation' }];

			const action = {
				type: USER.DESIGNATION_DROPDOWN,
				payload: newDesignations,
			};

			const newState = UserReducer(existingState, action);
			expect(newState.designation_dropdown).toEqual(newDesignations);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action', () => {
			const action = {
				type: 'UNKNOWN_ACTION',
				payload: { data: 'test' },
			};

			const newState = UserReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				user_list: [{ id: 1 }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = UserReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state', () => {
			const originalState = { ...initialState };
			const payload = [{ id: 1, name: 'Test User' }];

			const action = {
				type: USER.USER_LIST,
				payload,
			};

			UserReducer(originalState, action);
			expect(originalState.user_list).toEqual([]);
		});

		it('should preserve other state properties when updating user_list', () => {
			const stateWithData = {
				...initialState,
				user_list: [{ id: 1 }],
				role_list: [{ id: 1, roleName: 'Admin' }],
			};

			const payload = [{ id: 2 }];
			const action = {
				type: USER.USER_LIST,
				payload,
			};

			const newState = UserReducer(stateWithData, action);
			expect(newState.user_list).toEqual([{ id: 2 }]);
			expect(newState.role_list).toEqual([{ id: 1, roleName: 'Admin' }]);
		});

		it('should preserve all other properties when updating one list', () => {
			const stateWithAllData = {
				user_list: [{ id: 1 }],
				role_list: [{ id: 2 }],
				company_type_list: [{ id: 3 }],
				employee_list: [{ id: 4 }],
				designation_dropdown: [{ id: 5 }],
			};

			const action = {
				type: USER.ROLE_LIST,
				payload: [{ id: 99 }],
			};

			const newState = UserReducer(stateWithAllData, action);
			expect(newState.user_list).toEqual([{ id: 1 }]);
			expect(newState.role_list).toEqual([{ id: 99 }]);
			expect(newState.company_type_list).toEqual([{ id: 3 }]);
			expect(newState.employee_list).toEqual([{ id: 4 }]);
			expect(newState.designation_dropdown).toEqual([{ id: 5 }]);
		});
	});

	describe('complex user data scenarios', () => {
		it('should handle users with complete profile information', () => {
			const complexUsers = [
				{
					id: 1,
					name: 'John Doe',
					email: 'john@example.com',
					roleId: 2,
					active: true,
					dob: '1990-01-15',
					phone: '+971501234567',
					department: 'IT',
					joinDate: '2020-01-01',
				},
			];

			const action = {
				type: USER.USER_LIST,
				payload: complexUsers,
			};

			const newState = UserReducer(initialState, action);
			expect(newState.user_list[0]).toHaveProperty('name', 'John Doe');
			expect(newState.user_list[0]).toHaveProperty('email', 'john@example.com');
			expect(newState.user_list[0]).toHaveProperty('active', true);
		});

		it('should handle roles with detailed permissions', () => {
			const rolesWithPermissions = [
				{
					id: 1,
					roleName: 'Super Admin',
					permissions: ['create', 'read', 'update', 'delete'],
					moduleAccess: ['all'],
					canApprove: true,
				},
				{
					id: 2,
					roleName: 'Accountant',
					permissions: ['read', 'update'],
					moduleAccess: ['invoices', 'expenses', 'reports'],
					canApprove: false,
				},
			];

			const action = {
				type: USER.ROLE_LIST,
				payload: rolesWithPermissions,
			};

			const newState = UserReducer(initialState, action);
			expect(newState.role_list).toHaveLength(2);
			expect(newState.role_list[0].canApprove).toBe(true);
			expect(newState.role_list[1].moduleAccess).toContain('invoices');
		});
	});
});
