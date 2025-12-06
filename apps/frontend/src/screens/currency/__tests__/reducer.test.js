import CurrencyReducer from '../reducer';
import { CURRENCY } from 'constants/types';

describe('Currency Reducer', () => {
	const initialState = {
		currency_list: [],
	};

	it('should return the initial state', () => {
		expect(CurrencyReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle CURRENCY_LIST action', () => {
		const payload = {
			data: [
				{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 1.0 },
				{ code: 'USD', name: 'US Dollar', symbol: '$', rate: 3.67 },
				{ code: 'EUR', name: 'Euro', symbol: '€', rate: 4.02 },
			],
		};
		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list).toEqual(payload.data);
		expect(newState.currency_list).toHaveLength(3);
	});

	it('should handle CURRENCY_LIST with empty array', () => {
		const payload = {
			data: [],
		};
		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list).toEqual([]);
		expect(newState.currency_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload: { data: [{ code: 'AED', name: 'UAE Dirham' }] },
		};

		const stateBefore = { ...initialState };
		CurrencyReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple sequential CURRENCY_LIST actions', () => {
		const action1 = {
			type: CURRENCY.CURRENCY_LIST,
			payload: { data: [{ code: 'AED', name: 'UAE Dirham' }] },
		};

		const action2 = {
			type: CURRENCY.CURRENCY_LIST,
			payload: {
				data: [
					{ code: 'USD', name: 'US Dollar' },
					{ code: 'EUR', name: 'Euro' },
				],
			},
		};

		let state = CurrencyReducer(initialState, action1);
		expect(state.currency_list).toHaveLength(1);

		state = CurrencyReducer(state, action2);
		expect(state.currency_list).toHaveLength(2);
		expect(state.currency_list[0].code).toBe('USD');
	});

	it('should replace existing currency_list on new action', () => {
		const stateWithData = {
			currency_list: [
				{ code: 'AED', name: 'UAE Dirham' },
				{ code: 'SAR', name: 'Saudi Riyal' },
			],
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload: { data: [{ code: 'USD', name: 'US Dollar' }] },
		};

		const newState = CurrencyReducer(stateWithData, action);

		expect(newState.currency_list).toHaveLength(1);
		expect(newState.currency_list[0].code).toBe('USD');
	});

	it('should handle CURRENCY_LIST with complex currency data', () => {
		const payload = {
			data: [
				{
					code: 'GBP',
					name: 'British Pound',
					symbol: '£',
					rate: 4.65,
					isActive: true,
					country: 'United Kingdom',
				},
			],
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list[0]).toHaveProperty('code', 'GBP');
		expect(newState.currency_list[0]).toHaveProperty('rate', 4.65);
		expect(newState.currency_list[0]).toHaveProperty('isActive', true);
	});

	it('should handle CURRENCY_LIST with null values in payload', () => {
		const payload = {
			data: [
				{
					code: 'XXX',
					name: 'Unknown Currency',
					symbol: null,
					rate: null,
				},
			],
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list).toHaveLength(1);
		expect(newState.currency_list[0].symbol).toBeNull();
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_CURRENCY_ACTION',
			payload: { test: 'data' },
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state structure when handling unknown actions', () => {
		const stateWithData = {
			currency_list: [{ code: 'AED', name: 'UAE Dirham' }],
		};

		const action = {
			type: 'UNKNOWN_ACTION',
			payload: {},
		};

		const newState = CurrencyReducer(stateWithData, action);

		expect(newState).toEqual(stateWithData);
		expect(newState.currency_list).toHaveLength(1);
	});

	it('should handle CURRENCY_LIST with large dataset', () => {
		const payload = {
			data: Array.from({ length: 100 }, (_, i) => ({
				code: `CUR${i}`,
				name: `Currency ${i}`,
				symbol: `$${i}`,
				rate: (i + 1) * 0.5,
			})),
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list).toHaveLength(100);
		expect(newState.currency_list[0].code).toBe('CUR0');
		expect(newState.currency_list[99].code).toBe('CUR99');
	});

	it('should create new array reference for currency_list', () => {
		const payload = {
			data: [{ code: 'AED', name: 'UAE Dirham' }],
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list).not.toBe(payload.data);
		expect(newState.currency_list).toEqual(payload.data);
	});

	it('should handle CURRENCY_LIST with duplicate currency codes', () => {
		const payload = {
			data: [
				{ code: 'AED', name: 'UAE Dirham' },
				{ code: 'AED', name: 'UAE Dirham Duplicate' },
				{ code: 'USD', name: 'US Dollar' },
			],
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload,
		};

		const newState = CurrencyReducer(initialState, action);

		expect(newState.currency_list).toHaveLength(3);
	});

	it('should handle state with undefined properties gracefully', () => {
		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload: { data: [{ code: 'AED' }] },
		};

		const newState = CurrencyReducer(undefined, action);

		expect(newState).toHaveProperty('currency_list');
		expect(newState.currency_list).toHaveLength(1);
	});

	it('should preserve state spread operation behavior', () => {
		const existingState = {
			currency_list: [{ code: 'AED', name: 'Old' }],
			additionalProperty: 'should not exist',
		};

		const action = {
			type: CURRENCY.CURRENCY_LIST,
			payload: { data: [{ code: 'USD', name: 'New' }] },
		};

		const newState = CurrencyReducer(existingState, action);

		expect(newState.currency_list).toHaveLength(1);
		expect(newState.currency_list[0].code).toBe('USD');
	});
});
