import DesignationReducer from '../reducer';
import { EMPLOYEE_DESIGNATION } from 'constants/types';

describe('DesignationReducer (Salary Component)', () => {
	const initialState = {
		designation_list: [],
		designationType_list: [],
	};

	it('should return the initial state', () => {
		expect(DesignationReducer(undefined, {})).toEqual(initialState);
	});

	it('should return initial state when undefined is passed', () => {
		const result = DesignationReducer(undefined, { type: 'UNKNOWN' });
		expect(result).toEqual(initialState);
	});

	describe('EMPLOYEE_DESIGNATION_LIST', () => {
		it('should handle EMPLOYEE_DESIGNATION_LIST action with valid data', () => {
			const mockDesignations = [
				{
					id: 1,
					designationCode: 'DES-001',
					designationName: 'Senior Developer',
					department: 'IT',
				},
				{
					id: 2,
					designationCode: 'DES-002',
					designationName: 'HR Manager',
					department: 'Human Resources',
				},
			];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: mockDesignations,
			};

			const expectedState = {
				...initialState,
				designation_list: mockDesignations,
			};

			expect(DesignationReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing designation list', () => {
			const existingState = {
				...initialState,
				designation_list: [
					{ id: 99, designationName: 'Old Designation' }
				],
			};

			const newDesignations = [
				{ id: 1, designationName: 'New Designation 1' },
				{ id: 2, designationName: 'New Designation 2' },
			];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: newDesignations,
			};

			const newState = DesignationReducer(existingState, action);
			expect(newState.designation_list).toEqual(newDesignations);
			expect(newState.designation_list).toHaveLength(2);
		});

		it('should handle empty designation list', () => {
			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: [],
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState.designation_list).toEqual([]);
			expect(newState.designation_list).toHaveLength(0);
		});

		it('should create a new array reference using Object.assign', () => {
			const mockDesignations = [{ id: 1, designationName: 'Test' }];
			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: mockDesignations,
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState.designation_list).not.toBe(mockDesignations);
			expect(newState.designation_list).toEqual(mockDesignations);
		});

		it('should handle designations with complete information', () => {
			const complexDesignations = [
				{
					id: 1,
					designationCode: 'DES-001',
					designationName: 'Software Engineer',
					department: 'Engineering',
					level: 'Senior',
					description: 'Senior software engineer position',
					salaryRange: {
						min: 8000,
						max: 15000,
						currency: 'AED',
					},
					isActive: true,
				},
			];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: complexDesignations,
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState.designation_list[0]).toHaveProperty('designationName', 'Software Engineer');
			expect(newState.designation_list[0].salaryRange.min).toBe(8000);
			expect(newState.designation_list[0]).toHaveProperty('isActive', true);
		});

		it('should preserve designationType_list when updating designation_list', () => {
			const stateWithTypes = {
				...initialState,
				designationType_list: [
					{ id: 1, typeName: 'Permanent' },
					{ id: 2, typeName: 'Contract' },
				],
			};

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: [{ id: 1, designationName: 'Manager' }],
			};

			const newState = DesignationReducer(stateWithTypes, action);
			expect(newState.designation_list).toEqual([{ id: 1, designationName: 'Manager' }]);
			expect(newState.designationType_list).toEqual(stateWithTypes.designationType_list);
		});

		it('should handle large designation list', () => {
			const largeList = Array.from({ length: 50 }, (_, i) => ({
				id: i + 1,
				designationCode: `DES-${String(i + 1).padStart(3, '0')}`,
				designationName: `Designation ${i + 1}`,
			}));

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: largeList,
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState.designation_list).toHaveLength(50);
			expect(newState.designation_list[49].designationName).toBe('Designation 50');
		});
	});

	describe('EMPLOYEE_DESIGNATION_TYPE_LIST', () => {
		it('should handle EMPLOYEE_DESIGNATION_TYPE_LIST action with valid data', () => {
			const mockTypes = [
				{ id: 1, typeName: 'Permanent', typeCode: 'PER' },
				{ id: 2, typeName: 'Contract', typeCode: 'CON' },
				{ id: 3, typeName: 'Temporary', typeCode: 'TMP' },
			];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: mockTypes,
			};

			const expectedState = {
				...initialState,
				designationType_list: mockTypes,
			};

			expect(DesignationReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing designation type list', () => {
			const existingState = {
				...initialState,
				designationType_list: [
					{ id: 99, typeName: 'Old Type' }
				],
			};

			const newTypes = [
				{ id: 1, typeName: 'New Type 1' },
				{ id: 2, typeName: 'New Type 2' },
			];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: newTypes,
			};

			const newState = DesignationReducer(existingState, action);
			expect(newState.designationType_list).toEqual(newTypes);
			expect(newState.designationType_list).toHaveLength(2);
		});

		it('should handle empty designation type list', () => {
			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: [],
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState.designationType_list).toEqual([]);
		});

		it('should preserve designation_list when updating designationType_list', () => {
			const stateWithDesignations = {
				...initialState,
				designation_list: [
					{ id: 1, designationName: 'Manager' },
					{ id: 2, designationName: 'Developer' },
				],
			};

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: [{ id: 1, typeName: 'Permanent' }],
			};

			const newState = DesignationReducer(stateWithDesignations, action);
			expect(newState.designationType_list).toEqual([{ id: 1, typeName: 'Permanent' }]);
			expect(newState.designation_list).toEqual(stateWithDesignations.designation_list);
		});

		it('should handle designation types with additional properties', () => {
			const typesWithDetails = [
				{
					id: 1,
					typeName: 'Permanent',
					typeCode: 'PER',
					description: 'Permanent employment',
					benefits: ['Health Insurance', 'Pension', 'Annual Leave'],
					probationPeriod: 6,
				},
			];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: typesWithDetails,
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState.designationType_list[0].typeName).toBe('Permanent');
			expect(newState.designationType_list[0].benefits).toHaveLength(3);
			expect(newState.designationType_list[0].probationPeriod).toBe(6);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action type', () => {
			const action = {
				type: 'UNKNOWN_ACTION_TYPE',
				payload: { data: 'test' },
			};

			const newState = DesignationReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				designation_list: [{ id: 1, designationName: 'Test' }],
				designationType_list: [{ id: 1, typeName: 'Type' }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = DesignationReducer(currentState, action);
			expect(newState).toEqual(currentState);
			expect(newState).toBe(currentState);
		});

		it('should handle action with missing type', () => {
			const currentState = { ...initialState };
			const action = { payload: { data: 'test' } };

			const newState = DesignationReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state when updating designation_list', () => {
			const originalState = { ...initialState };
			const payload = [{ id: 1, designationName: 'Test' }];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload,
			};

			DesignationReducer(originalState, action);
			expect(originalState.designation_list).toEqual([]);
		});

		it('should not mutate the original state when updating designationType_list', () => {
			const originalState = { ...initialState };
			const payload = [{ id: 1, typeName: 'Test' }];

			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload,
			};

			DesignationReducer(originalState, action);
			expect(originalState.designationType_list).toEqual([]);
		});

		it('should create new state object reference', () => {
			const originalState = { ...initialState };
			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: [{ id: 1 }],
			};

			const newState = DesignationReducer(originalState, action);
			expect(newState).not.toBe(originalState);
		});

		it('should create independent array copies', () => {
			const sourceData = [{ id: 1, designationName: 'Test' }];
			const action = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: sourceData,
			};

			const newState = DesignationReducer(initialState, action);

			// Modify source data
			sourceData.push({ id: 2, designationName: 'Another' });

			// New state should not be affected
			expect(newState.designation_list).toHaveLength(1);
		});

		it('should preserve state immutability on multiple updates', () => {
			let currentState = { ...initialState };

			// First update
			const action1 = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
				payload: [{ id: 1 }],
			};
			const state1 = DesignationReducer(currentState, action1);

			// Second update
			const action2 = {
				type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
				payload: [{ id: 2 }],
			};
			const state2 = DesignationReducer(state1, action2);

			// All states should be different references
			expect(currentState).not.toBe(state1);
			expect(state1).not.toBe(state2);
			expect(currentState.designation_list).toEqual([]);
			expect(state1.designation_list).toEqual([{ id: 1 }]);
			expect(state2.designationType_list).toEqual([{ id: 2 }]);
		});
	});
});
