import NotificationReducer from '../reducer';

describe('Notification Reducer', () => {
	const initialState = {};

	it('should return the initial state', () => {
		expect(NotificationReducer(undefined, {})).toEqual(initialState);
	});

	it('should return the initial state when called with undefined state', () => {
		const action = { type: 'INIT' };
		expect(NotificationReducer(undefined, action)).toEqual(initialState);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = NotificationReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: 'SOME_ACTION',
			payload: { data: 'test' },
		};

		const stateBefore = { ...initialState };
		NotificationReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should return state as is for default case', () => {
		const currentState = {};
		const action = { type: 'NON_EXISTENT' };

		const newState = NotificationReducer(currentState, action);
		expect(newState).toBe(currentState);
	});

	it('should handle null action type', () => {
		const action = { type: null };
		const newState = NotificationReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should handle undefined action type', () => {
		const action = {};
		const newState = NotificationReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should maintain state reference when no changes occur', () => {
		const currentState = {};
		const action = { type: 'RANDOM_TYPE' };

		const newState = NotificationReducer(currentState, action);
		expect(newState).toBe(currentState);
	});

	it('should handle empty action object', () => {
		const newState = NotificationReducer(initialState, {});
		expect(newState).toEqual(initialState);
	});

	it('should preserve state shape', () => {
		const action = { type: 'TEST_ACTION' };
		const newState = NotificationReducer(initialState, action);

		expect(typeof newState).toBe('object');
		expect(Object.keys(newState)).toHaveLength(0);
	});

	it('should handle action with payload but unknown type', () => {
		const action = {
			type: 'UNKNOWN',
			payload: {
				notifications: [
					{ id: 1, message: 'Test notification' },
					{ id: 2, message: 'Another notification' },
				],
			},
		};

		const newState = NotificationReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should be a pure function', () => {
		const state1 = NotificationReducer(undefined, { type: 'INIT' });
		const state2 = NotificationReducer(undefined, { type: 'INIT' });

		expect(state1).toEqual(state2);
	});

	it('should handle multiple unknown actions sequentially', () => {
		let state = initialState;

		state = NotificationReducer(state, { type: 'ACTION_1' });
		expect(state).toEqual(initialState);

		state = NotificationReducer(state, { type: 'ACTION_2' });
		expect(state).toEqual(initialState);

		state = NotificationReducer(state, { type: 'ACTION_3' });
		expect(state).toEqual(initialState);
	});

	it('should not add properties from action payload', () => {
		const action = {
			type: 'SOME_TYPE',
			payload: {
				newProperty: 'value',
				anotherProperty: 123,
			},
		};

		const newState = NotificationReducer(initialState, action);
		expect(newState).not.toHaveProperty('newProperty');
		expect(newState).not.toHaveProperty('anotherProperty');
	});

	it('should handle actions with complex nested payload', () => {
		const action = {
			type: 'COMPLEX_ACTION',
			payload: {
				nested: {
					deep: {
						property: 'value',
					},
				},
				array: [1, 2, 3],
			},
		};

		const newState = NotificationReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});
});
