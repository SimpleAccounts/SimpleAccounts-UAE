import ProfileReducer from '../reducer';
import { PROFILE } from 'constants/types';

describe('Profile Reducer', () => {
	const initialState = {
		currency_list: [],
		country_list: [],
		industry_type_list: [],
		company_type_list: [],
		role_list: [],
		invoicing_state_list: [],
		company_state_list: [],
	};

	it('should return the initial state', () => {
		expect(ProfileReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PROFILE.CURRENCY_LIST action', () => {
		const mockCurrencies = [
			{ id: 1, code: 'AED', name: 'UAE Dirham' },
			{ id: 2, code: 'SAR', name: 'Saudi Riyal' },
			{ id: 3, code: 'USD', name: 'US Dollar' },
		];

		const action = {
			type: PROFILE.CURRENCY_LIST,
			payload: mockCurrencies,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.currency_list).toEqual(mockCurrencies);
		expect(newState.currency_list).toHaveLength(3);
		expect(newState.country_list).toEqual([]);
	});

	it('should handle PROFILE.COUNTRY_LIST action', () => {
		const mockCountries = [
			{ id: 1, name: 'United Arab Emirates', code: 'AE' },
			{ id: 2, name: 'Saudi Arabia', code: 'SA' },
		];

		const action = {
			type: PROFILE.COUNTRY_LIST,
			payload: mockCountries,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.country_list).toEqual(mockCountries);
		expect(newState.country_list).toHaveLength(2);
		expect(newState.currency_list).toEqual([]);
	});

	it('should handle PROFILE.INDUSTRY_TYPE_LIST action', () => {
		const mockIndustries = [
			{ id: 1, name: 'Technology', code: 'TECH' },
			{ id: 2, name: 'Finance', code: 'FIN' },
			{ id: 3, name: 'Healthcare', code: 'HEALTH' },
		];

		const action = {
			type: PROFILE.INDUSTRY_TYPE_LIST,
			payload: mockIndustries,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.industry_type_list).toEqual(mockIndustries);
		expect(newState.industry_type_list).toHaveLength(3);
	});

	it('should handle PROFILE.ROLE_LIST action', () => {
		const mockRoles = [
			{ id: 1, name: 'Admin', permissions: ['all'] },
			{ id: 2, name: 'User', permissions: ['read'] },
		];

		const action = {
			type: PROFILE.ROLE_LIST,
			payload: mockRoles,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.role_list).toEqual(mockRoles);
		expect(newState.role_list).toHaveLength(2);
	});

	it('should handle PROFILE.COMPANY_TYPE_LIST action', () => {
		const mockCompanyTypes = [
			{ id: 1, name: 'LLC', description: 'Limited Liability Company' },
			{ id: 2, name: 'FZE', description: 'Free Zone Establishment' },
		];

		const action = {
			type: PROFILE.COMPANY_TYPE_LIST,
			payload: mockCompanyTypes,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.company_type_list).toEqual(mockCompanyTypes);
		expect(newState.company_type_list).toHaveLength(2);
	});

	it('should handle PROFILE.INVOICING_STATE_LIST action', () => {
		const mockStates = [
			{ id: 1, name: 'Dubai', code: 'DXB' },
			{ id: 2, name: 'Abu Dhabi', code: 'AUH' },
		];

		const action = {
			type: PROFILE.INVOICING_STATE_LIST,
			payload: mockStates,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.invoicing_state_list).toEqual(mockStates);
		expect(newState.invoicing_state_list).toHaveLength(2);
	});

	it('should handle PROFILE.COMPANY_STATE_LIST action', () => {
		const mockStates = [
			{ id: 1, name: 'Sharjah', code: 'SHJ' },
			{ id: 2, name: 'Ajman', code: 'AJM' },
		];

		const action = {
			type: PROFILE.COMPANY_STATE_LIST,
			payload: mockStates,
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState.company_state_list).toEqual(mockStates);
		expect(newState.company_state_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: PROFILE.CURRENCY_LIST,
			payload: [{ id: 1, code: 'AED' }],
		};

		const stateBefore = { ...initialState };
		ProfileReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = ProfileReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			...initialState,
			currency_list: [{ id: 1, code: 'AED' }],
		};

		const action = {
			type: PROFILE.COUNTRY_LIST,
			payload: [{ id: 1, name: 'UAE' }],
		};

		const newState = ProfileReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.country_list).not.toBe(currentState.country_list);
	});

	it('should handle empty payload arrays', () => {
		const action = {
			type: PROFILE.CURRENCY_LIST,
			payload: [],
		};

		const newState = ProfileReducer(initialState, action);
		expect(newState.currency_list).toEqual([]);
		expect(newState.currency_list).toHaveLength(0);
	});

	it('should preserve other state properties when updating one list', () => {
		const stateWithData = {
			...initialState,
			currency_list: [{ id: 1, code: 'AED' }],
			role_list: [{ id: 1, name: 'Admin' }],
		};

		const action = {
			type: PROFILE.COUNTRY_LIST,
			payload: [{ id: 1, name: 'UAE' }],
		};

		const newState = ProfileReducer(stateWithData, action);

		expect(newState.currency_list).toHaveLength(1);
		expect(newState.role_list).toHaveLength(1);
		expect(newState.country_list).toHaveLength(1);
	});

	it('should handle multiple updates to the same list', () => {
		let state = initialState;

		const action1 = {
			type: PROFILE.CURRENCY_LIST,
			payload: [{ id: 1, code: 'AED' }],
		};

		state = ProfileReducer(state, action1);
		expect(state.currency_list).toHaveLength(1);

		const action2 = {
			type: PROFILE.CURRENCY_LIST,
			payload: [
				{ id: 1, code: 'AED' },
				{ id: 2, code: 'SAR' },
				{ id: 3, code: 'USD' },
			],
		};

		state = ProfileReducer(state, action2);
		expect(state.currency_list).toHaveLength(3);
	});

	it('should preserve state shape after all actions', () => {
		const action = {
			type: PROFILE.CURRENCY_LIST,
			payload: [{ id: 1, code: 'AED' }],
		};

		const newState = ProfileReducer(initialState, action);

		expect(newState).toHaveProperty('currency_list');
		expect(newState).toHaveProperty('country_list');
		expect(newState).toHaveProperty('industry_type_list');
		expect(newState).toHaveProperty('company_type_list');
		expect(newState).toHaveProperty('role_list');
		expect(newState).toHaveProperty('invoicing_state_list');
		expect(newState).toHaveProperty('company_state_list');
		expect(Object.keys(newState)).toHaveLength(7);
	});
});
