import SalaryTemplateReducer from '../reducer';
import { SALARY_TEMPLATE } from 'constants/types';

describe('SalaryTemplateReducer', () => {
	const initialState = {
		salary_structure_dropdown: [],
		template_list: [],
		salary_role_dropdown: [],
	};

	it('should return the initial state', () => {
		expect(SalaryTemplateReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle SALARY_TEMPLATE.TEMPLATE_LIST with empty array', () => {
		const action = {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			template_list: [],
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_TEMPLATE.TEMPLATE_LIST with data', () => {
		const mockTemplates = [
			{ id: 1, name: 'Template 1', description: 'Test template 1' },
			{ id: 2, name: 'Template 2', description: 'Test template 2' },
		];

		const action = {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: mockTemplates,
		};

		const expectedState = {
			...initialState,
			template_list: mockTemplates,
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN with empty array', () => {
		const action = {
			type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
			payload: { data: [] },
		};

		const expectedState = {
			...initialState,
			salary_structure_dropdown: [],
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN with data', () => {
		const mockStructures = [
			{ id: 1, label: 'Structure 1', value: 'struct1' },
			{ id: 2, label: 'Structure 2', value: 'struct2' },
		];

		const action = {
			type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
			payload: { data: mockStructures },
		};

		const expectedState = {
			...initialState,
			salary_structure_dropdown: mockStructures,
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN with empty array', () => {
		const action = {
			type: SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN,
			payload: { data: [] },
		};

		const expectedState = {
			...initialState,
			salary_role_dropdown: [],
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN with data', () => {
		const mockRoles = [
			{ id: 1, label: 'Manager', value: 'manager' },
			{ id: 2, label: 'Developer', value: 'developer' },
			{ id: 3, label: 'Designer', value: 'designer' },
		];

		const action = {
			type: SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN,
			payload: { data: mockRoles },
		};

		const expectedState = {
			...initialState,
			salary_role_dropdown: mockRoles,
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(SalaryTemplateReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state when handling TEMPLATE_LIST', () => {
		const mockTemplates = [{ id: 1, name: 'Template 1' }];
		const action = {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: mockTemplates,
		};

		const stateBefore = { ...initialState };
		SalaryTemplateReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple actions in sequence', () => {
		const templates = [{ id: 1, name: 'Template 1' }];
		const structures = [{ id: 1, label: 'Structure 1' }];
		const roles = [{ id: 1, label: 'Role 1' }];

		let state = SalaryTemplateReducer(initialState, {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: templates,
		});

		state = SalaryTemplateReducer(state, {
			type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
			payload: { data: structures },
		});

		state = SalaryTemplateReducer(state, {
			type: SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN,
			payload: { data: roles },
		});

		expect(state).toEqual({
			template_list: templates,
			salary_structure_dropdown: structures,
			salary_role_dropdown: roles,
		});
	});

	it('should override previous template_list data', () => {
		const firstTemplates = [{ id: 1, name: 'Template 1' }];
		const secondTemplates = [
			{ id: 2, name: 'Template 2' },
			{ id: 3, name: 'Template 3' },
		];

		let state = SalaryTemplateReducer(initialState, {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: firstTemplates,
		});

		state = SalaryTemplateReducer(state, {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: secondTemplates,
		});

		expect(state.template_list).toEqual(secondTemplates);
		expect(state.template_list.length).toBe(2);
	});

	it('should override previous salary_structure_dropdown data', () => {
		const firstStructures = [{ id: 1, label: 'Structure 1' }];
		const secondStructures = [{ id: 2, label: 'Structure 2' }];

		let state = SalaryTemplateReducer(initialState, {
			type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
			payload: { data: firstStructures },
		});

		state = SalaryTemplateReducer(state, {
			type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
			payload: { data: secondStructures },
		});

		expect(state.salary_structure_dropdown).toEqual(secondStructures);
	});

	it('should handle null payload gracefully', () => {
		const action = {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: null,
		};

		// Should not throw error, payload will be assigned as null
		expect(() => SalaryTemplateReducer(initialState, action)).not.toThrow();
	});

	it('should maintain other state properties when updating one property', () => {
		const stateWithData = {
			template_list: [{ id: 1, name: 'Existing Template' }],
			salary_structure_dropdown: [{ id: 1, label: 'Existing Structure' }],
			salary_role_dropdown: [{ id: 1, label: 'Existing Role' }],
		};

		const newRoles = [
			{ id: 2, label: 'New Role 1' },
			{ id: 3, label: 'New Role 2' },
		];

		const state = SalaryTemplateReducer(stateWithData, {
			type: SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN,
			payload: { data: newRoles },
		});

		expect(state.template_list).toEqual(stateWithData.template_list);
		expect(state.salary_structure_dropdown).toEqual(
			stateWithData.salary_structure_dropdown
		);
		expect(state.salary_role_dropdown).toEqual(newRoles);
	});

	it('should handle SALARY_TEMPLATE actions with complex nested data', () => {
		const complexTemplates = [
			{
				id: 1,
				name: 'Complex Template',
				structure: {
					id: 10,
					components: [
						{ name: 'Basic Salary', amount: 5000 },
						{ name: 'HRA', amount: 2000 },
					],
				},
			},
		];

		const action = {
			type: SALARY_TEMPLATE.TEMPLATE_LIST,
			payload: complexTemplates,
		};

		const state = SalaryTemplateReducer(initialState, action);

		expect(state.template_list).toEqual(complexTemplates);
		expect(state.template_list[0].structure.components.length).toBe(2);
	});
});
