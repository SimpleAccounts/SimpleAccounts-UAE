import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ReportsFiling Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('initialData', () => {
		it('should be a function', () => {
			expect(typeof actions.initialData).toBe('function');
		});

		it('should return a function (thunk)', () => {
			const result = actions.initialData({});
			expect(typeof result).toBe('function');
		});

		it('should accept an object parameter', () => {
			const obj = { test: 'value' };
			expect(() => actions.initialData(obj)).not.toThrow();
		});

		it('should handle empty object', () => {
			expect(() => actions.initialData({})).not.toThrow();
		});

		it('should handle null parameter', () => {
			expect(() => actions.initialData(null)).not.toThrow();
		});

		it('should handle undefined parameter', () => {
			expect(() => actions.initialData(undefined)).not.toThrow();
		});

		it('should dispatch without errors', async () => {
			const thunk = actions.initialData({});
			expect(() => store.dispatch(thunk)).not.toThrow();
		});

		it('should not throw when called multiple times', () => {
			expect(() => {
				actions.initialData({});
				actions.initialData({});
				actions.initialData({});
			}).not.toThrow();
		});

		it('should handle object with properties', () => {
			const obj = {
				name: 'test',
				id: 123,
				active: true,
			};
			expect(() => actions.initialData(obj)).not.toThrow();
		});

		it('should return consistent thunk', () => {
			const thunk1 = actions.initialData({});
			const thunk2 = actions.initialData({});

			expect(typeof thunk1).toBe('function');
			expect(typeof thunk2).toBe('function');
		});

		it('should handle nested object parameters', () => {
			const obj = {
				nested: {
					data: {
						value: 'test',
					},
				},
			};
			expect(() => actions.initialData(obj)).not.toThrow();
		});

		it('should handle array in object parameter', () => {
			const obj = {
				items: [1, 2, 3],
				data: ['a', 'b', 'c'],
			};
			expect(() => actions.initialData(obj)).not.toThrow();
		});

		it('should not modify the input object', () => {
			const obj = { test: 'value', count: 5 };
			const objCopy = { ...obj };

			actions.initialData(obj);

			expect(obj).toEqual(objCopy);
		});

		it('should be callable with different parameter types', () => {
			expect(() => actions.initialData({})).not.toThrow();
			expect(() => actions.initialData({ key: 'value' })).not.toThrow();
			expect(() => actions.initialData(null)).not.toThrow();
		});

		it('should return a function that accepts dispatch', () => {
			const thunk = actions.initialData({});
			const mockDispatch = jest.fn();

			expect(() => thunk(mockDispatch)).not.toThrow();
		});
	});

	describe('Action Creator Properties', () => {
		it('should export initialData function', () => {
			expect(actions.initialData).toBeDefined();
			expect(typeof actions.initialData).toBe('function');
		});

		it('should create action creator with correct signature', () => {
			const actionCreator = actions.initialData;
			expect(actionCreator.length).toBe(1); // expects one parameter
		});

		it('should handle concurrent calls', () => {
			expect(() => {
				Promise.all([
					store.dispatch(actions.initialData({})),
					store.dispatch(actions.initialData({})),
					store.dispatch(actions.initialData({})),
				]);
			}).not.toThrow();
		});
	});
});
