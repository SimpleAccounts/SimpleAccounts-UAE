import OrganizationReducer from '../reducer';
import { ORGANIZATION } from 'constants/types';

describe('Organization Reducer', () => {
	const initialState = {
		country_list: [],
		industry_type_list: [],
	};

	it('should return the initial state', () => {
		expect(OrganizationReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle ORGANIZATION.COUNTRY_LIST action', () => {
		const mockCountries = [
			{ id: 1, name: 'United Arab Emirates', code: 'AE' },
			{ id: 2, name: 'Saudi Arabia', code: 'SA' },
			{ id: 3, name: 'Kuwait', code: 'KW' },
		];

		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: mockCountries,
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState.country_list).toEqual(mockCountries);
		expect(newState.country_list).toHaveLength(3);
		expect(newState.industry_type_list).toEqual([]);
	});

	it('should handle ORGANIZATION.INDUSTRY_TYPE_LIST action', () => {
		const mockIndustries = [
			{ id: 1, name: 'Technology', code: 'TECH' },
			{ id: 2, name: 'Finance', code: 'FIN' },
			{ id: 3, name: 'Healthcare', code: 'HEALTH' },
		];

		const action = {
			type: ORGANIZATION.INDUSTRY_TYPE_LIST,
			payload: mockIndustries,
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState.industry_type_list).toEqual(mockIndustries);
		expect(newState.industry_type_list).toHaveLength(3);
		expect(newState.country_list).toEqual([]);
	});

	it('should update country list without affecting industry type list', () => {
		const stateWithIndustry = {
			country_list: [],
			industry_type_list: [{ id: 1, name: 'Tech' }],
		};

		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [{ id: 1, name: 'UAE' }],
		};

		const newState = OrganizationReducer(stateWithIndustry, action);

		expect(newState.country_list).toHaveLength(1);
		expect(newState.industry_type_list).toHaveLength(1);
	});

	it('should update industry type list without affecting country list', () => {
		const stateWithCountry = {
			country_list: [{ id: 1, name: 'UAE' }],
			industry_type_list: [],
		};

		const action = {
			type: ORGANIZATION.INDUSTRY_TYPE_LIST,
			payload: [{ id: 1, name: 'Finance' }],
		};

		const newState = OrganizationReducer(stateWithCountry, action);

		expect(newState.industry_type_list).toHaveLength(1);
		expect(newState.country_list).toHaveLength(1);
	});

	it('should handle empty country list payload', () => {
		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [],
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState.country_list).toEqual([]);
		expect(newState.country_list).toHaveLength(0);
	});

	it('should handle empty industry type list payload', () => {
		const action = {
			type: ORGANIZATION.INDUSTRY_TYPE_LIST,
			payload: [],
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState.industry_type_list).toEqual([]);
		expect(newState.industry_type_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [{ id: 1, name: 'UAE' }],
		};

		const stateBefore = { ...initialState };
		OrganizationReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			country_list: [{ id: 1, name: 'Old Country' }],
			industry_type_list: [{ id: 1, name: 'Old Industry' }],
		};

		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [{ id: 2, name: 'New Country' }],
		};

		const newState = OrganizationReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.country_list).not.toBe(currentState.country_list);
	});

	it('should handle multiple country list updates', () => {
		let state = initialState;

		const action1 = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [{ id: 1, name: 'UAE' }],
		};

		state = OrganizationReducer(state, action1);
		expect(state.country_list).toHaveLength(1);

		const action2 = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [
				{ id: 1, name: 'UAE' },
				{ id: 2, name: 'Saudi Arabia' },
			],
		};

		state = OrganizationReducer(state, action2);
		expect(state.country_list).toHaveLength(2);
	});

	it('should handle multiple industry type list updates', () => {
		let state = initialState;

		const action1 = {
			type: ORGANIZATION.INDUSTRY_TYPE_LIST,
			payload: [{ id: 1, name: 'Tech' }],
		};

		state = OrganizationReducer(state, action1);
		expect(state.industry_type_list).toHaveLength(1);

		const action2 = {
			type: ORGANIZATION.INDUSTRY_TYPE_LIST,
			payload: [
				{ id: 1, name: 'Tech' },
				{ id: 2, name: 'Finance' },
				{ id: 3, name: 'Healthcare' },
			],
		};

		state = OrganizationReducer(state, action2);
		expect(state.industry_type_list).toHaveLength(3);
	});

	it('should handle large country list payload', () => {
		const largeCountryList = Array.from({ length: 100 }, (_, i) => ({
			id: i + 1,
			name: `Country ${i + 1}`,
			code: `C${i + 1}`,
		}));

		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: largeCountryList,
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState.country_list).toHaveLength(100);
		expect(newState.country_list[0].name).toBe('Country 1');
		expect(newState.country_list[99].name).toBe('Country 100');
	});

	it('should handle country list with nested properties', () => {
		const countriesWithDetails = [
			{
				id: 1,
				name: 'UAE',
				code: 'AE',
				details: {
					capital: 'Abu Dhabi',
					currency: 'AED',
					population: 10000000,
				},
			},
		];

		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: countriesWithDetails,
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState.country_list[0].details.capital).toBe('Abu Dhabi');
		expect(newState.country_list[0].details.currency).toBe('AED');
	});

	it('should preserve state shape after actions', () => {
		const action = {
			type: ORGANIZATION.COUNTRY_LIST,
			payload: [{ id: 1, name: 'UAE' }],
		};

		const newState = OrganizationReducer(initialState, action);

		expect(newState).toHaveProperty('country_list');
		expect(newState).toHaveProperty('industry_type_list');
		expect(Object.keys(newState)).toHaveLength(2);
	});
});
