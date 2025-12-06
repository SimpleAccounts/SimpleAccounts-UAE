import UsersRolesReducer from '../reducer';

describe('UsersRolesReducer', () => {
	const initialState = {};

	it('should return the initial state', () => {
		expect(UsersRolesReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(UsersRolesReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state on unknown action', () => {
		const action = {
			type: 'SOME_RANDOM_ACTION',
			payload: { test: 'value' },
		};

		const stateBefore = { ...initialState };
		const result = UsersRolesReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
		expect(result).toBe(initialState);
	});

	it('should return same state reference for unknown actions', () => {
		const state = {};
		const action = { type: 'UNKNOWN' };

		const newState = UsersRolesReducer(state, action);
		expect(newState).toBe(state);
	});

	it('should handle undefined action type', () => {
		const action = {
			payload: { data: 'test' },
		};

		expect(UsersRolesReducer(initialState, action)).toEqual(initialState);
	});

	it('should handle null action', () => {
		expect(UsersRolesReducer(initialState, null)).toEqual(initialState);
	});

	it('should handle action without payload', () => {
		const action = {
			type: 'TEST_ACTION',
		};

		expect(UsersRolesReducer(initialState, action)).toEqual(initialState);
	});

	it('should handle empty action object', () => {
		expect(UsersRolesReducer(initialState, {})).toEqual(initialState);
	});

	it('should maintain state immutability', () => {
		const state = {};
		const action = { type: 'RANDOM_ACTION', payload: { value: 123 } };

		const newState = UsersRolesReducer(state, action);

		expect(newState).toEqual(state);
		expect(Object.isFrozen(state)).toBe(false);
	});

	it('should handle multiple sequential unknown actions', () => {
		let state = initialState;

		state = UsersRolesReducer(state, { type: 'ACTION_1' });
		state = UsersRolesReducer(state, { type: 'ACTION_2' });
		state = UsersRolesReducer(state, { type: 'ACTION_3' });

		expect(state).toEqual(initialState);
	});

	it('should always return an object', () => {
		const action = { type: 'TEST' };
		const result = UsersRolesReducer(undefined, action);

		expect(typeof result).toBe('object');
		expect(result).not.toBeNull();
	});

	it('should handle action with complex payload', () => {
		const action = {
			type: 'COMPLEX_ACTION',
			payload: {
				roles: [
					{ id: 1, name: 'Admin', permissions: ['read', 'write'] },
					{ id: 2, name: 'User', permissions: ['read'] },
				],
			},
		};

		expect(UsersRolesReducer(initialState, action)).toEqual(initialState);
	});

	it('should be a pure function', () => {
		const state = {};
		const action = { type: 'TEST_ACTION', payload: {} };

		const result1 = UsersRolesReducer(state, action);
		const result2 = UsersRolesReducer(state, action);

		expect(result1).toEqual(result2);
	});

	it('should handle action with array payload', () => {
		const action = {
			type: 'ARRAY_ACTION',
			payload: [
				{ id: 1, role: 'Admin' },
				{ id: 2, role: 'Manager' },
			],
		};

		expect(UsersRolesReducer(initialState, action)).toEqual(initialState);
	});

	it('should handle action with string payload', () => {
		const action = {
			type: 'STRING_ACTION',
			payload: 'test role data',
		};

		expect(UsersRolesReducer(initialState, action)).toEqual(initialState);
	});
});
