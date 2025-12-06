import ReportsFilingReducer from '../reducer';

describe('ReportsFilingReducer', () => {
	const initialState = {};

	it('should return the initial state', () => {
		expect(ReportsFilingReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(ReportsFilingReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state on unknown action', () => {
		const action = {
			type: 'SOME_RANDOM_ACTION',
			payload: { test: 'value' },
		};

		const stateBefore = { ...initialState };
		const result = ReportsFilingReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
		expect(result).toBe(initialState);
	});

	it('should return same state reference for unknown actions', () => {
		const state = {};
		const action = { type: 'UNKNOWN' };

		const newState = ReportsFilingReducer(state, action);
		expect(newState).toBe(state);
	});

	it('should handle undefined action type', () => {
		const action = {
			payload: { data: 'test' },
		};

		expect(ReportsFilingReducer(initialState, action)).toEqual(initialState);
	});

	it('should handle null action', () => {
		expect(ReportsFilingReducer(initialState, null)).toEqual(initialState);
	});

	it('should handle action without payload', () => {
		const action = {
			type: 'TEST_ACTION',
		};

		expect(ReportsFilingReducer(initialState, action)).toEqual(initialState);
	});

	it('should handle empty action object', () => {
		expect(ReportsFilingReducer(initialState, {})).toEqual(initialState);
	});

	it('should maintain state immutability', () => {
		const state = {};
		const action = { type: 'RANDOM_ACTION', payload: { value: 123 } };

		const newState = ReportsFilingReducer(state, action);

		expect(newState).toEqual(state);
		expect(Object.isFrozen(state)).toBe(false);
	});

	it('should handle multiple sequential unknown actions', () => {
		let state = initialState;

		state = ReportsFilingReducer(state, { type: 'ACTION_1' });
		state = ReportsFilingReducer(state, { type: 'ACTION_2' });
		state = ReportsFilingReducer(state, { type: 'ACTION_3' });

		expect(state).toEqual(initialState);
	});

	it('should always return an object', () => {
		const action = { type: 'TEST' };
		const result = ReportsFilingReducer(undefined, action);

		expect(typeof result).toBe('object');
		expect(result).not.toBeNull();
	});

	it('should handle action with complex payload', () => {
		const action = {
			type: 'COMPLEX_ACTION',
			payload: {
				nested: {
					data: {
						array: [1, 2, 3],
						object: { key: 'value' },
					},
				},
			},
		};

		expect(ReportsFilingReducer(initialState, action)).toEqual(initialState);
	});

	it('should be a pure function', () => {
		const state = {};
		const action = { type: 'TEST_ACTION', payload: {} };

		const result1 = ReportsFilingReducer(state, action);
		const result2 = ReportsFilingReducer(state, action);

		expect(result1).toEqual(result2);
	});

	it('should handle action with array payload', () => {
		const action = {
			type: 'ARRAY_ACTION',
			payload: [1, 2, 3, 4, 5],
		};

		expect(ReportsFilingReducer(initialState, action)).toEqual(initialState);
	});

	it('should handle action with string payload', () => {
		const action = {
			type: 'STRING_ACTION',
			payload: 'test string',
		};

		expect(ReportsFilingReducer(initialState, action)).toEqual(initialState);
	});
});
