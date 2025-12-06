import DesignationReducer from '../reducer';
import { EMPLOYEE_DESIGNATION } from 'constants/types';

describe('Designation Reducer', () => {
	const initialState = {
		designation_list: [],
		designationType_list: [],
	};

	it('should return the initial state', () => {
		expect(DesignationReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle EMPLOYEE_DESIGNATION_LIST action', () => {
		const payload = [
			{ id: 1, designationName: 'Manager', code: 'MGR-001', level: 5 },
			{ id: 2, designationName: 'Senior Developer', code: 'DEV-002', level: 4 },
			{ id: 3, designationName: 'Junior Developer', code: 'DEV-003', level: 2 },
		];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list).toEqual(payload);
		expect(newState.designation_list).toHaveLength(3);
	});

	it('should handle EMPLOYEE_DESIGNATION_TYPE_LIST action', () => {
		const payload = [
			{ id: 1, typeName: 'Management', category: 'Leadership' },
			{ id: 2, typeName: 'Technical', category: 'Engineering' },
			{ id: 3, typeName: 'Administrative', category: 'Support' },
		];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designationType_list).toEqual(payload);
		expect(newState.designationType_list).toHaveLength(3);
	});

	it('should handle both actions independently', () => {
		const designationAction = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload: [{ id: 1, designationName: 'Manager' }],
		};

		const typeAction = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
			payload: [{ id: 1, typeName: 'Management' }],
		};

		let state = DesignationReducer(initialState, designationAction);
		expect(state.designation_list).toHaveLength(1);
		expect(state.designationType_list).toHaveLength(0);

		state = DesignationReducer(state, typeAction);
		expect(state.designation_list).toHaveLength(1);
		expect(state.designationType_list).toHaveLength(1);
	});

	it('should handle EMPLOYEE_DESIGNATION_LIST with empty array', () => {
		const payload = [];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list).toEqual([]);
		expect(newState.designation_list).toHaveLength(0);
	});

	it('should handle EMPLOYEE_DESIGNATION_TYPE_LIST with empty array', () => {
		const payload = [];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designationType_list).toEqual([]);
		expect(newState.designationType_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload: [{ id: 1, designationName: 'Test' }],
		};

		const stateBefore = { ...initialState };
		DesignationReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should replace existing designation_list on new action', () => {
		const stateWithData = {
			designation_list: [
				{ id: 1, designationName: 'Old Designation 1' },
				{ id: 2, designationName: 'Old Designation 2' },
			],
			designationType_list: [],
		};

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload: [{ id: 3, designationName: 'New Designation' }],
		};

		const newState = DesignationReducer(stateWithData, action);

		expect(newState.designation_list).toHaveLength(1);
		expect(newState.designation_list[0].id).toBe(3);
	});

	it('should handle complex designation data', () => {
		const payload = [
			{
				id: 1,
				designationName: 'Senior Manager',
				code: 'SMG-001',
				level: 6,
				parentDesignationId: null,
				description: 'Senior management position',
				isActive: true,
				createdDate: '2024-09-25',
			},
		];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list[0]).toHaveProperty('code', 'SMG-001');
		expect(newState.designation_list[0]).toHaveProperty('level', 6);
		expect(newState.designation_list[0]).toHaveProperty('isActive', true);
	});

	it('should handle null values in payload', () => {
		const payload = [
			{
				id: 1,
				designationName: 'Test Designation',
				code: null,
				parentDesignationId: null,
			},
		];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list).toHaveLength(1);
		expect(newState.designation_list[0].code).toBeNull();
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_DESIGNATION_ACTION',
			payload: { test: 'data' },
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state structure when handling unknown actions', () => {
		const stateWithData = {
			designation_list: [{ id: 1, designationName: 'Manager' }],
			designationType_list: [{ id: 1, typeName: 'Management' }],
		};

		const action = {
			type: 'UNKNOWN_ACTION',
			payload: {},
		};

		const newState = DesignationReducer(stateWithData, action);

		expect(newState).toEqual(stateWithData);
		expect(newState.designation_list).toHaveLength(1);
		expect(newState.designationType_list).toHaveLength(1);
	});

	it('should handle large designation dataset', () => {
		const payload = Array.from({ length: 300 }, (_, i) => ({
			id: i + 1,
			designationName: `Designation ${i + 1}`,
			code: `DES-${String(i + 1).padStart(4, '0')}`,
			level: (i % 7) + 1,
		}));

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list).toHaveLength(300);
		expect(newState.designation_list[0].id).toBe(1);
		expect(newState.designation_list[299].id).toBe(300);
	});

	it('should create new array reference for lists', () => {
		const payload = [{ id: 1, designationName: 'Test' }];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list).not.toBe(payload);
		expect(newState.designation_list).toEqual(payload);
	});

	it('should preserve other list when updating one list', () => {
		const stateWithData = {
			designation_list: [{ id: 1, designationName: 'Manager' }],
			designationType_list: [{ id: 1, typeName: 'Management' }],
		};

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload: [{ id: 2, designationName: 'Developer' }],
		};

		const newState = DesignationReducer(stateWithData, action);

		expect(newState.designation_list).toHaveLength(1);
		expect(newState.designation_list[0].id).toBe(2);
		expect(newState.designationType_list).toHaveLength(1);
		expect(newState.designationType_list[0].id).toBe(1);
	});

	it('should handle hierarchical designation structures', () => {
		const payload = [
			{
				id: 1,
				designationName: 'CEO',
				level: 7,
				parentDesignationId: null,
				children: [
					{ id: 2, designationName: 'VP', level: 6 },
					{ id: 3, designationName: 'Director', level: 5 },
				],
			},
		];

		const action = {
			type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
			payload,
		};

		const newState = DesignationReducer(initialState, action);

		expect(newState.designation_list[0]).toHaveProperty('children');
		expect(newState.designation_list[0].children).toHaveLength(2);
	});
});
