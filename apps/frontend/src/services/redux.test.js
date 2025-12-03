/**
 * Tests for Redux state management.
 * These tests verify that Redux store, actions, and reducers work correctly
 * before/after Redux and Redux-Thunk upgrades.
 *
 * Covers: redux 4.0.4 → 4.2.1, redux-thunk 2.3.0 → 2.4.2 upgrades
 */
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';

// Sample reducer for testing
const initialState = {
  loading: false,
  data: null,
  error: null
};

const testReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// Sample async action creator (thunk)
const fetchDataAsync = (success = true) => {
  return (dispatch) => {
    dispatch({ type: 'FETCH_START' });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          dispatch({ type: 'FETCH_SUCCESS', payload: { items: [1, 2, 3] } });
          resolve({ items: [1, 2, 3] });
        } else {
          dispatch({ type: 'FETCH_ERROR', payload: 'Failed to fetch' });
          reject(new Error('Failed to fetch'));
        }
      }, 10);
    });
  };
};

describe('Redux State Management', () => {
  let store;

  beforeEach(() => {
    store = createStore(
      combineReducers({ test: testReducer }),
      applyMiddleware(thunk)
    );
  });

  // ============ Store Creation ============

  describe('Store Creation', () => {
    it('should create store with initial state', () => {
      const state = store.getState();
      expect(state.test).toEqual(initialState);
    });

    it('should have dispatch function', () => {
      expect(typeof store.dispatch).toBe('function');
    });

    it('should have getState function', () => {
      expect(typeof store.getState).toBe('function');
    });

    it('should have subscribe function', () => {
      expect(typeof store.subscribe).toBe('function');
    });
  });

  // ============ Synchronous Actions ============

  describe('Synchronous Actions', () => {
    it('should dispatch FETCH_START action', () => {
      store.dispatch({ type: 'FETCH_START' });
      const state = store.getState();
      expect(state.test.loading).toBe(true);
      expect(state.test.error).toBeNull();
    });

    it('should dispatch FETCH_SUCCESS action with payload', () => {
      const payload = { items: ['a', 'b', 'c'] };
      store.dispatch({ type: 'FETCH_SUCCESS', payload });
      const state = store.getState();
      expect(state.test.loading).toBe(false);
      expect(state.test.data).toEqual(payload);
    });

    it('should dispatch FETCH_ERROR action', () => {
      store.dispatch({ type: 'FETCH_ERROR', payload: 'Error message' });
      const state = store.getState();
      expect(state.test.loading).toBe(false);
      expect(state.test.error).toBe('Error message');
    });

    it('should dispatch RESET action', () => {
      store.dispatch({ type: 'FETCH_SUCCESS', payload: { items: [] } });
      store.dispatch({ type: 'RESET' });
      const state = store.getState();
      expect(state.test).toEqual(initialState);
    });

    it('should ignore unknown actions', () => {
      const stateBefore = store.getState();
      store.dispatch({ type: 'UNKNOWN_ACTION' });
      const stateAfter = store.getState();
      expect(stateAfter).toEqual(stateBefore);
    });
  });

  // ============ Async Actions (Thunks) ============

  describe('Async Actions (Thunks)', () => {
    it('should dispatch thunk for successful fetch', async () => {
      await store.dispatch(fetchDataAsync(true));
      const state = store.getState();
      expect(state.test.loading).toBe(false);
      expect(state.test.data).toEqual({ items: [1, 2, 3] });
      expect(state.test.error).toBeNull();
    });

    it('should dispatch thunk for failed fetch', async () => {
      try {
        await store.dispatch(fetchDataAsync(false));
      } catch (e) {
        // Expected to throw
      }
      const state = store.getState();
      expect(state.test.loading).toBe(false);
      expect(state.test.error).toBe('Failed to fetch');
    });

    it('should set loading state during async operation', (done) => {
      store.dispatch(fetchDataAsync(true));
      // Immediately after dispatch, loading should be true
      const state = store.getState();
      expect(state.test.loading).toBe(true);
      setTimeout(done, 20);
    });
  });

  // ============ Subscriptions ============

  describe('Subscriptions', () => {
    it('should notify subscribers on state change', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.dispatch({ type: 'FETCH_START' });
      expect(listener).toHaveBeenCalledTimes(1);

      store.dispatch({ type: 'FETCH_SUCCESS', payload: {} });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should allow unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.dispatch({ type: 'FETCH_START' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.dispatch({ type: 'FETCH_SUCCESS', payload: {} });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  // ============ Reducer Composition ============

  describe('Reducer Composition', () => {
    it('should combine multiple reducers', () => {
      const anotherReducer = (state = { count: 0 }, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return { count: state.count + 1 };
          default:
            return state;
        }
      };

      const combinedStore = createStore(
        combineReducers({
          test: testReducer,
          counter: anotherReducer
        }),
        applyMiddleware(thunk)
      );

      const state = combinedStore.getState();
      expect(state.test).toBeDefined();
      expect(state.counter).toBeDefined();
      expect(state.counter.count).toBe(0);

      combinedStore.dispatch({ type: 'INCREMENT' });
      expect(combinedStore.getState().counter.count).toBe(1);
    });
  });

  // ============ Middleware ============

  describe('Middleware', () => {
    it('should apply thunk middleware correctly', () => {
      const thunkStore = createStore(
        testReducer,
        applyMiddleware(thunk)
      );

      // Thunk should allow dispatching functions
      expect(() => {
        thunkStore.dispatch((dispatch) => {
          dispatch({ type: 'FETCH_START' });
        });
      }).not.toThrow();

      expect(thunkStore.getState().loading).toBe(true);
    });

    it('should pass extra argument to thunk', () => {
      const api = { fetch: jest.fn() };
      const thunkWithExtra = thunk.withExtraArgument(api);

      const storeWithExtra = createStore(
        testReducer,
        applyMiddleware(thunkWithExtra)
      );

      storeWithExtra.dispatch((dispatch, getState, extraArg) => {
        expect(extraArg).toBe(api);
        expect(typeof extraArg.fetch).toBe('function');
      });
    });
  });

  // ============ State Immutability ============

  describe('State Immutability', () => {
    it('should not mutate previous state', () => {
      const stateBefore = store.getState().test;

      store.dispatch({ type: 'FETCH_SUCCESS', payload: { new: 'data' } });

      const stateAfter = store.getState().test;

      // Objects should be different references
      expect(stateBefore).not.toBe(stateAfter);
      // But original should be unchanged
      expect(stateBefore.data).toBeNull();
    });

    it('should create new state object on each action', () => {
      const state1 = store.getState().test;
      store.dispatch({ type: 'FETCH_START' });
      const state2 = store.getState().test;
      store.dispatch({ type: 'FETCH_SUCCESS', payload: {} });
      const state3 = store.getState().test;

      expect(state1).not.toBe(state2);
      expect(state2).not.toBe(state3);
    });
  });

  // ============ DevTools Compatibility ============

  describe('DevTools Compatibility', () => {
    it('should work with compose for DevTools', () => {
      const composeEnhancers = compose;

      const enhancedStore = createStore(
        testReducer,
        composeEnhancers(applyMiddleware(thunk))
      );

      expect(enhancedStore.getState()).toEqual(initialState);
      enhancedStore.dispatch({ type: 'FETCH_START' });
      expect(enhancedStore.getState().loading).toBe(true);
    });
  });
});
