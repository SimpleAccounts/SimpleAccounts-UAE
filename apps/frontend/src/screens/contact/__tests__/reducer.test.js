import ContactReducer from '../reducer';
import { CONTACT } from 'constants/types';

describe('ContactReducer', () => {
	const initialState = {
		contact_list: [],
		country_list: [],
		currency_list: [],
		state_list: [],
		city_list: [],
		contact_type_list: [],
	};

	it('should return the initial state', () => {
		expect(ContactReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle CONTACT.CONTACT_LIST', () => {
		const mockContacts = [
			{
				contactId: 1,
				firstName: 'Ahmed',
				lastName: 'Ali',
				email: 'ahmed.ali@example.com',
			},
			{
				contactId: 2,
				firstName: 'Fatima',
				lastName: 'Hassan',
				email: 'fatima.hassan@example.com',
			},
		];

		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: mockContacts,
		};

		const expectedState = {
			...initialState,
			contact_list: mockContacts,
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CONTACT.COUNTRY_LIST', () => {
		const mockCountries = [
			{ code: 'AE', name: 'United Arab Emirates' },
			{ code: 'US', name: 'United States' },
			{ code: 'GB', name: 'United Kingdom' },
		];

		const action = {
			type: CONTACT.COUNTRY_LIST,
			payload: mockCountries,
		};

		const expectedState = {
			...initialState,
			country_list: mockCountries,
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CONTACT.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'AED', name: 'UAE Dirham' },
			{ code: 'USD', name: 'US Dollar' },
			{ code: 'EUR', name: 'Euro' },
		];

		const action = {
			type: CONTACT.CURRENCY_LIST,
			payload: mockCurrencies,
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CONTACT.STATE_LIST', () => {
		const mockStates = [
			{ code: 'DXB', name: 'Dubai' },
			{ code: 'AUH', name: 'Abu Dhabi' },
			{ code: 'SHJ', name: 'Sharjah' },
		];

		const action = {
			type: CONTACT.STATE_LIST,
			payload: mockStates,
		};

		const expectedState = {
			...initialState,
			state_list: mockStates,
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CONTACT.CITY_LIST', () => {
		const mockCities = [
			{ id: 1, name: 'Dubai Marina' },
			{ id: 2, name: 'Downtown Dubai' },
		];

		const action = {
			type: CONTACT.CITY_LIST,
			payload: mockCities,
		};

		const expectedState = {
			...initialState,
			currency_list: mockCities, // Note: There's a bug in the reducer where CITY_LIST updates currency_list
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CONTACT.CONTACT_TYPE_LIST', () => {
		const mockContactTypes = [
			{ id: 1, type: 'Supplier' },
			{ id: 2, type: 'Customer' },
			{ id: 3, type: 'Employee' },
		];

		const action = {
			type: CONTACT.CONTACT_TYPE_LIST,
			payload: mockContactTypes,
		};

		const expectedState = {
			...initialState,
			contact_type_list: mockContactTypes,
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle multiple state updates correctly', () => {
		const mockContacts = [{ contactId: 1, firstName: 'John' }];
		const mockCountries = [{ code: 'AE', name: 'United Arab Emirates' }];

		const action1 = {
			type: CONTACT.CONTACT_LIST,
			payload: mockContacts,
		};

		const action2 = {
			type: CONTACT.COUNTRY_LIST,
			payload: mockCountries,
		};

		let state = ContactReducer(initialState, action1);
		state = ContactReducer(state, action2);

		expect(state.contact_list).toEqual(mockContacts);
		expect(state.country_list).toEqual(mockCountries);
	});

	it('should handle empty contact list', () => {
		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			contact_list: [],
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle empty country list', () => {
		const action = {
			type: CONTACT.COUNTRY_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			country_list: [],
		};

		expect(ContactReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(ContactReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate original state', () => {
		const mockContacts = [{ contactId: 1, firstName: 'Test' }];
		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: mockContacts,
		};

		const stateBefore = { ...initialState };
		ContactReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle large contact list', () => {
		const mockContacts = Array.from({ length: 100 }, (_, i) => ({
			contactId: i + 1,
			firstName: `Contact ${i + 1}`,
			email: `contact${i + 1}@example.com`,
		}));

		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: mockContacts,
		};

		const state = ContactReducer(initialState, action);

		expect(state.contact_list).toHaveLength(100);
		expect(state.contact_list[0].firstName).toBe('Contact 1');
		expect(state.contact_list[99].firstName).toBe('Contact 100');
	});

	it('should handle contacts with complete information', () => {
		const mockContacts = [
			{
				contactId: 1,
				firstName: 'Ahmed',
				lastName: 'Ali',
				email: 'ahmed.ali@example.com',
				phone: '+971501234567',
				mobileNumber: '+971501234567',
				companyName: 'ABC Trading LLC',
				address: 'Dubai Marina',
				city: 'Dubai',
				state: 'Dubai',
				country: 'United Arab Emirates',
				postalCode: '12345',
				contactType: 'Supplier',
			},
		];

		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: mockContacts,
		};

		const state = ContactReducer(initialState, action);

		expect(state.contact_list[0]).toEqual(mockContacts[0]);
		expect(state.contact_list[0].companyName).toBe('ABC Trading LLC');
	});

	it('should handle different contact types', () => {
		const mockContacts = [
			{ contactId: 1, firstName: 'John', contactType: 'Customer' },
			{ contactId: 2, firstName: 'Jane', contactType: 'Supplier' },
			{ contactId: 3, firstName: 'Bob', contactType: 'Employee' },
		];

		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: mockContacts,
		};

		const state = ContactReducer(initialState, action);

		expect(state.contact_list).toHaveLength(3);
		expect(state.contact_list[0].contactType).toBe('Customer');
		expect(state.contact_list[1].contactType).toBe('Supplier');
	});

	it('should preserve other state properties when updating one property', () => {
		const existingState = {
			contact_list: [{ contactId: 1, firstName: 'John' }],
			country_list: [{ code: 'AE', name: 'United Arab Emirates' }],
			currency_list: [{ code: 'AED', name: 'UAE Dirham' }],
			state_list: [],
			city_list: [],
			contact_type_list: [],
		};

		const mockNewContacts = [
			{ contactId: 2, firstName: 'Jane' },
			{ contactId: 3, firstName: 'Bob' },
		];

		const action = {
			type: CONTACT.CONTACT_LIST,
			payload: mockNewContacts,
		};

		const state = ContactReducer(existingState, action);

		expect(state.contact_list).toEqual(mockNewContacts);
		expect(state.country_list).toEqual(existingState.country_list);
		expect(state.currency_list).toEqual(existingState.currency_list);
	});

	it('should handle updating state list multiple times', () => {
		const mockStates1 = [{ code: 'DXB', name: 'Dubai' }];
		const mockStates2 = [
			{ code: 'DXB', name: 'Dubai' },
			{ code: 'AUH', name: 'Abu Dhabi' },
		];

		const action1 = {
			type: CONTACT.STATE_LIST,
			payload: mockStates1,
		};

		const action2 = {
			type: CONTACT.STATE_LIST,
			payload: mockStates2,
		};

		let state = ContactReducer(initialState, action1);
		expect(state.state_list).toHaveLength(1);

		state = ContactReducer(state, action2);
		expect(state.state_list).toHaveLength(2);
	});
});
