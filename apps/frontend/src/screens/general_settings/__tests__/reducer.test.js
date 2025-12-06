import SettingsReducer from '../reducer';

describe('General Settings Reducer', () => {
	const initialState = {};

	it('should return the initial state', () => {
		expect(SettingsReducer(undefined, {})).toEqual(initialState);
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_SETTINGS_ACTION',
			payload: { test: 'data' },
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: 'SOME_ACTION',
			payload: { data: 'test' },
		};

		const stateBefore = { ...initialState };
		SettingsReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle undefined state', () => {
		const action = { type: 'TEST_ACTION' };
		const newState = SettingsReducer(undefined, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability', () => {
		const action = {
			type: 'TEST_MUTATION',
			payload: { value: 'test' },
		};

		const state = { existing: 'data' };
		const newState = SettingsReducer(state, action);

		expect(newState).toEqual(state);
		expect(newState).toBe(state);
	});

	it('should handle null action type', () => {
		const action = {
			type: null,
			payload: {},
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle empty action', () => {
		const action = {};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle action with only type', () => {
		const action = {
			type: 'SIMPLE_ACTION',
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle action with complex payload', () => {
		const action = {
			type: 'COMPLEX_ACTION',
			payload: {
				nested: {
					data: {
						value: 'test',
					},
				},
			},
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle multiple sequential unknown actions', () => {
		const action1 = { type: 'ACTION_1', payload: { data: 1 } };
		const action2 = { type: 'ACTION_2', payload: { data: 2 } };
		const action3 = { type: 'ACTION_3', payload: { data: 3 } };

		let state = SettingsReducer(initialState, action1);
		state = SettingsReducer(state, action2);
		state = SettingsReducer(state, action3);

		expect(state).toEqual(initialState);
	});

	it('should handle state with existing properties', () => {
		const stateWithData = {
			setting1: 'value1',
			setting2: 'value2',
		};

		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'test' },
		};

		const newState = SettingsReducer(stateWithData, action);

		expect(newState).toEqual(stateWithData);
	});

	it('should handle action with array payload', () => {
		const action = {
			type: 'ARRAY_ACTION',
			payload: [1, 2, 3, 4, 5],
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle action with string payload', () => {
		const action = {
			type: 'STRING_ACTION',
			payload: 'test string',
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle action with number payload', () => {
		const action = {
			type: 'NUMBER_ACTION',
			payload: 12345,
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should handle action with boolean payload', () => {
		const action = {
			type: 'BOOLEAN_ACTION',
			payload: true,
		};

		const newState = SettingsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
