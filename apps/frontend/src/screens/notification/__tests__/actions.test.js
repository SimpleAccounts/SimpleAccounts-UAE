import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Notification Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('initialData', () => {
		it('should return a thunk function', () => {
			const result = actions.initialData({});
			expect(typeof result).toBe('function');
		});

		it('should execute without errors when dispatched', async () => {
			const obj = { data: 'test' };
			await expect(store.dispatch(actions.initialData(obj))).resolves.not.toThrow();
		});

		it('should not dispatch any actions', async () => {
			await store.dispatch(actions.initialData({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle empty object parameter', async () => {
			await expect(store.dispatch(actions.initialData({}))).resolves.not.toThrow();
		});

		it('should handle object with properties', async () => {
			const obj = {
				notifications: [],
				settings: { enabled: true },
			};

			await expect(store.dispatch(actions.initialData(obj))).resolves.not.toThrow();
		});

		it('should handle null parameter', async () => {
			await expect(store.dispatch(actions.initialData(null))).resolves.not.toThrow();
		});

		it('should handle undefined parameter', async () => {
			await expect(store.dispatch(actions.initialData(undefined))).resolves.not.toThrow();
		});

		it('should handle complex nested object', async () => {
			const obj = {
				level1: {
					level2: {
						level3: {
							data: 'deep',
						},
					},
				},
			};

			await expect(store.dispatch(actions.initialData(obj))).resolves.not.toThrow();
		});

		it('should handle array parameter', async () => {
			const arr = [1, 2, 3, 4, 5];
			await expect(store.dispatch(actions.initialData(arr))).resolves.not.toThrow();
		});

		it('should handle string parameter', async () => {
			await expect(store.dispatch(actions.initialData('test'))).resolves.not.toThrow();
		});

		it('should handle number parameter', async () => {
			await expect(store.dispatch(actions.initialData(123))).resolves.not.toThrow();
		});

		it('should handle boolean parameter', async () => {
			await expect(store.dispatch(actions.initialData(true))).resolves.not.toThrow();
			await expect(store.dispatch(actions.initialData(false))).resolves.not.toThrow();
		});

		it('should be callable multiple times', async () => {
			await store.dispatch(actions.initialData({ id: 1 }));
			await store.dispatch(actions.initialData({ id: 2 }));
			await store.dispatch(actions.initialData({ id: 3 }));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle very large object', async () => {
			const largeObj = {
				data: Array.from({ length: 1000 }, (_, i) => ({
					id: i,
					value: `item-${i}`,
				})),
			};

			await expect(store.dispatch(actions.initialData(largeObj))).resolves.not.toThrow();
		});

		it('should not throw when called without parameters', async () => {
			await expect(store.dispatch(actions.initialData())).resolves.not.toThrow();
		});
	});
});
