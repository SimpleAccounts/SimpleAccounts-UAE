import CustomerInvoiceReducer from '../reducer';
import { DEBIT_NOTE } from 'constants/types';

describe('Debit Notes Reducer', () => {
	const initialState = {
		debit_note_list: [],
		customer_list: [],
		currency_list: [],
		deposit_list: [],
		country_list: [],
		place_of_supply: [],
		status_list: [],
		pay_mode: [],
		invoice_list: [],
	};

	it('should return the initial state', () => {
		expect(CustomerInvoiceReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle DEBIT_NOTE_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, debitNoteNumber: 'DN-001', amount: 8000 },
				{ id: 2, debitNoteNumber: 'DN-002', amount: 6000 },
				{ id: 3, debitNoteNumber: 'DN-003', amount: 4500 },
			],
		};
		const action = {
			type: DEBIT_NOTE.DEBIT_NOTE_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.debit_note_list).toEqual(payload.data);
		expect(newState.debit_note_list).toHaveLength(3);
	});

	it('should handle STATUS_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, status: 'Draft' },
				{ id: 2, status: 'Issued' },
				{ id: 3, status: 'Paid' },
				{ id: 4, status: 'Cancelled' },
			],
		};
		const action = {
			type: DEBIT_NOTE.STATUS_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.status_list).toEqual(payload.data);
		expect(newState.status_list).toHaveLength(4);
	});

	it('should handle CURRENCY_LIST action', () => {
		const payload = {
			data: [
				{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
				{ code: 'USD', name: 'US Dollar', symbol: '$' },
				{ code: 'EUR', name: 'Euro', symbol: '€' },
			],
		};
		const action = {
			type: DEBIT_NOTE.CURRENCY_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.currency_list).toEqual(payload.data);
		expect(newState.currency_list).toHaveLength(3);
	});

	it('should handle DEPOSIT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, type: 'Supplier Deposit', amount: 10000 },
				{ id: 2, type: 'Security Deposit', amount: 5000 },
			],
		};
		const action = {
			type: DEBIT_NOTE.DEPOSIT_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.deposit_list).toEqual(payload.data);
		expect(newState.deposit_list).toHaveLength(2);
	});

	it('should handle PAY_MODE action', () => {
		const payload = {
			data: [
				{ id: 1, mode: 'Cash', description: 'Cash Payment' },
				{ id: 2, mode: 'Cheque', description: 'Cheque Payment' },
				{ id: 3, mode: 'Bank Transfer', description: 'Electronic Transfer' },
			],
		};
		const action = {
			type: DEBIT_NOTE.PAY_MODE,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.pay_mode).toEqual(payload.data);
		expect(newState.pay_mode).toHaveLength(3);
	});

	it('should handle COUNTRY_LIST action', () => {
		const payload = [
			'United Arab Emirates',
			'Saudi Arabia',
			'Bahrain',
			'Kuwait',
			'Oman',
			'Qatar',
		];
		const action = {
			type: DEBIT_NOTE.COUNTRY_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.country_list).toEqual(payload);
		expect(newState.country_list).toHaveLength(6);
	});

	it('should handle PLACE_OF_SUPPLY action', () => {
		const payload = [
			{ id: 1, name: 'Abu Dhabi', code: 'AD' },
			{ id: 2, name: 'Dubai', code: 'DU' },
			{ id: 3, name: 'Sharjah', code: 'SH' },
			{ id: 4, name: 'Ajman', code: 'AJ' },
		];
		const action = {
			type: DEBIT_NOTE.PLACE_OF_SUPPLY,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.place_of_supply).toEqual(payload);
		expect(newState.place_of_supply).toHaveLength(4);
	});

	it('should handle INVOICE_LIST_FOR_DROPDOWN action', () => {
		const payload = [
			{ id: 1, invoiceNumber: 'INV-001', amount: 10000 },
			{ id: 2, invoiceNumber: 'INV-002', amount: 15000 },
		];
		const action = {
			type: DEBIT_NOTE.INVOICE_LIST_FOR_DROPDOWN,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.invoice_list).toEqual(payload);
		expect(newState.invoice_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: DEBIT_NOTE.DEBIT_NOTE_LIST,
			payload: { data: [{ id: 1, debitNoteNumber: 'DN-001' }] },
		};

		const stateBefore = { ...initialState };
		CustomerInvoiceReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple sequential actions correctly', () => {
		const debitNoteAction = {
			type: DEBIT_NOTE.DEBIT_NOTE_LIST,
			payload: { data: [{ id: 1, debitNoteNumber: 'DN-001' }] },
		};

		const currencyAction = {
			type: DEBIT_NOTE.CURRENCY_LIST,
			payload: { data: [{ code: 'AED', name: 'UAE Dirham' }] },
		};

		let state = CustomerInvoiceReducer(initialState, debitNoteAction);
		state = CustomerInvoiceReducer(state, currencyAction);

		expect(state.debit_note_list).toHaveLength(1);
		expect(state.currency_list).toHaveLength(1);
	});

	it('should preserve other state properties when updating one property', () => {
		const stateWithData = {
			...initialState,
			debit_note_list: [{ id: 1, debitNoteNumber: 'DN-001' }],
		};

		const action = {
			type: DEBIT_NOTE.CURRENCY_LIST,
			payload: { data: [{ code: 'USD' }] },
		};

		const newState = CustomerInvoiceReducer(stateWithData, action);

		expect(newState.debit_note_list).toHaveLength(1);
		expect(newState.currency_list).toHaveLength(1);
	});

	it('should handle empty array payload', () => {
		const action = {
			type: DEBIT_NOTE.DEBIT_NOTE_LIST,
			payload: { data: [] },
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.debit_note_list).toEqual([]);
		expect(newState.debit_note_list).toHaveLength(0);
	});

	it('should handle empty object in place_of_supply', () => {
		const action = {
			type: DEBIT_NOTE.PLACE_OF_SUPPLY,
			payload: [],
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.place_of_supply).toEqual([]);
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_DEBIT_NOTE_ACTION',
			payload: { test: 'data' },
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
