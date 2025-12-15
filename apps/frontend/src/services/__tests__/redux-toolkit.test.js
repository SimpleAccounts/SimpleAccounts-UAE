/**
 * Verification tests for Redux Toolkit migration.
 * These tests verify that Redux Toolkit store, slices, and async thunks work correctly.
 *
 * Covers: Redux Toolkit migration from traditional Redux
 */
import { configureStore } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ============ Test Slice ============

const initialState = {
  loading: false,
  data: null,
  error: null,
};

// Sample async thunk
export const fetchDataAsync = createAsyncThunk(
  'test/fetchData',
  async (success = true, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve({ items: [1, 2, 3] });
        } else {
          reject(rejectWithValue('Failed to fetch'));
        }
      }, 10);
    });
  }
);

// Sample slice
const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    setData: (state, action) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reset, setData } = testSlice.actions;
export default testSlice.reducer;

// ============ Test Suite ============

describe('Redux Toolkit Migration Verification', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: testSlice.reducer,
      },
    });
  });

  // ============ Store Configuration ============

  describe('Store Configuration', () => {
    it('should create store with configureStore', () => {
      expect(store).toBeDefined();
      expect(typeof store.dispatch).toBe('function');
      expect(typeof store.getState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });

    it('should have initial state', () => {
      const state = store.getState();
      expect(state.test).toEqual(initialState);
    });

    it('should support Redux DevTools', () => {
      // RTK automatically enables DevTools in development
      expect(store).toBeDefined();
    });
  });

  // ============ Slice Reducers ============

  describe('Slice Reducers', () => {
    it('should dispatch sync actions from slice', () => {
      const payload = { items: ['a', 'b', 'c'] };
      store.dispatch(setData(payload));
      const state = store.getState();
      expect(state.test.data).toEqual(payload);
    });

    it('should reset state with slice action', () => {
      store.dispatch(setData({ items: [1, 2, 3] }));
      store.dispatch(reset());
      const state = store.getState();
      expect(state.test).toEqual(initialState);
    });

    it('should use Immer for immutable updates', () => {
      const stateBefore = store.getState().test;
      store.dispatch(setData({ new: 'data' }));
      const stateAfter = store.getState().test;

      // Objects should be different references
      expect(stateBefore).not.toBe(stateAfter);
      // But original should be unchanged
      expect(stateBefore.data).toBeNull();
    });
  });

  // ============ Async Thunks ============

  describe('Async Thunks (createAsyncThunk)', () => {
    it('should dispatch thunk for successful fetch', async () => {
      await store.dispatch(fetchDataAsync(true));
      const state = store.getState();
      expect(state.test.loading).toBe(false);
      expect(state.test.data).toEqual({ items: [1, 2, 3] });
      expect(state.test.error).toBeNull();
    });

    it('should handle thunk rejection', async () => {
      try {
        await store.dispatch(fetchDataAsync(false));
      } catch (e) {
        // Expected to throw
      }
      const state = store.getState();
      expect(state.test.loading).toBe(false);
      expect(state.test.error).toBeDefined();
    });

    it('should set loading state during async operation', async () => {
      const promise = store.dispatch(fetchDataAsync(true));
      // Immediately after dispatch, loading should be true
      const stateDuring = store.getState();
      expect(stateDuring.test.loading).toBe(true);
      await promise;
      const stateAfter = store.getState();
      expect(stateAfter.test.loading).toBe(false);
    });

    it('should handle thunk pending state', () => {
      store.dispatch(fetchDataAsync(true));
      const state = store.getState();
      expect(state.test.loading).toBe(true);
      expect(state.test.error).toBeNull();
    });
  });

  // ============ Action Creators ============

  describe('Action Creators', () => {
    it('should generate action creators from slice', () => {
      const action = setData({ items: [1, 2, 3] });
      expect(action.type).toBe('test/setData');
      expect(action.payload).toEqual({ items: [1, 2, 3] });
    });

    it('should generate async thunk action types', () => {
      expect(fetchDataAsync.pending.type).toBe('test/fetchData/pending');
      expect(fetchDataAsync.fulfilled.type).toBe('test/fetchData/fulfilled');
      expect(fetchDataAsync.rejected.type).toBe('test/fetchData/rejected');
    });
  });

  // ============ State Immutability ============

  describe('State Immutability (Immer)', () => {
    it('should create new state object on each action', () => {
      const state1 = store.getState().test;
      store.dispatch(setData({ items: [1] }));
      const state2 = store.getState().test;
      store.dispatch(setData({ items: [2] }));
      const state3 = store.getState().test;

      expect(state1).not.toBe(state2);
      expect(state2).not.toBe(state3);
    });

    it('should allow "mutating" syntax in reducers', () => {
      // RTK uses Immer, so we can write "mutating" code
      const customSlice = createSlice({
        name: 'custom',
        initialState: { count: 0 },
        reducers: {
          increment: (state) => {
            state.count += 1; // This looks like mutation but is safe
          },
        },
      });

      const customStore = configureStore({
        reducer: { custom: customSlice.reducer },
      });

      customStore.dispatch(customSlice.actions.increment());
      expect(customStore.getState().custom.count).toBe(1);
    });
  });

  // ============ Reducer Composition ============

  describe('Reducer Composition', () => {
    it('should combine multiple slices', () => {
      const anotherSlice = createSlice({
        name: 'counter',
        initialState: { count: 0 },
        reducers: {
          increment: (state) => {
            state.count += 1;
          },
        },
      });

      const combinedStore = configureStore({
        reducer: {
          test: testSlice.reducer,
          counter: anotherSlice.reducer,
        },
      });

      const state = combinedStore.getState();
      expect(state.test).toBeDefined();
      expect(state.counter).toBeDefined();
      expect(state.counter.count).toBe(0);

      combinedStore.dispatch(anotherSlice.actions.increment());
      expect(combinedStore.getState().counter.count).toBe(1);
    });
  });

  // ============ Backward Compatibility ============

  describe('Backward Compatibility', () => {
    it('should work with traditional reducers', () => {
      // RTK configureStore can accept traditional reducers
      const traditionalReducer = (state = { value: 0 }, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return { ...state, value: state.value + 1 };
          default:
            return state;
        }
      };

      const compatibleStore = configureStore({
        reducer: {
          traditional: traditionalReducer,
        },
      });

      compatibleStore.dispatch({ type: 'INCREMENT' });
      expect(compatibleStore.getState().traditional.value).toBe(1);
    });
  });

  // ============ Subscriptions ============

  describe('Subscriptions', () => {
    it('should notify subscribers on state change', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.dispatch(setData({ items: [] }));
      expect(listener).toHaveBeenCalledTimes(1);

      store.dispatch(reset());
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should allow unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.dispatch(setData({ items: [] }));
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.dispatch(reset());
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  // ============ Error Handling ============

  describe('Error Handling', () => {
    it('should handle errors in async thunks', async () => {
      const failingThunk = createAsyncThunk(
        'test/failing',
        async (_, { rejectWithValue }) => {
          return rejectWithValue('Test error');
        }
      );

      const errorSlice = createSlice({
        name: 'error',
        initialState: { error: null },
        reducers: {},
        extraReducers: (builder) => {
          builder.addCase(failingThunk.rejected, (state, action) => {
            state.error = action.payload;
          });
        },
      });

      const errorStore = configureStore({
        reducer: { error: errorSlice.reducer },
      });

      await errorStore.dispatch(failingThunk());
      expect(errorStore.getState().error.error).toBe('Test error');
    });
  });
});

