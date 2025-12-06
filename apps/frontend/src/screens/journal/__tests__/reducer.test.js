import JournalReducer from '../reducer';
import { JOURNAL } from 'constants/types';

describe('JournalReducer', () => {
	const initialState = {
		journal_list: [],
		transaction_category_list: [],
		currency_list: [],
		contact_list: [],
		vat_list: [],
		page_num: 1,
		cancel_flag: false,
	};

	it('should return the initial state', () => {
		expect(JournalReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle JOURNAL.JOURNAL_LIST', () => {
		const mockJournals = [
			{
				journalId: 1,
				journalReferenceNo: 'JNL-001',
				journalDate: '2023-12-01',
				description: 'Opening balance',
			},
			{
				journalId: 2,
				journalReferenceNo: 'JNL-002',
				journalDate: '2023-12-05',
				description: 'Adjustment entry',
			},
		];

		const action = {
			type: JOURNAL.JOURNAL_LIST,
			payload: mockJournals,
		};

		const expectedState = {
			...initialState,
			journal_list: mockJournals,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle JOURNAL.TRANSACTION_CATEGORY_LIST', () => {
		const mockCategories = [
			{ transactionCategoryId: 1, transactionCategoryDescription: 'Sales' },
			{ transactionCategoryId: 2, transactionCategoryDescription: 'Purchases' },
		];

		const action = {
			type: JOURNAL.TRANSACTION_CATEGORY_LIST,
			payload: { data: mockCategories },
		};

		const expectedState = {
			...initialState,
			transaction_category_list: mockCategories,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle JOURNAL.CONTACT_LIST', () => {
		const mockContacts = [
			{ contactId: 1, firstName: 'Ahmed', lastName: 'Ali' },
			{ contactId: 2, firstName: 'Fatima', lastName: 'Hassan' },
		];

		const action = {
			type: JOURNAL.CONTACT_LIST,
			payload: { data: mockContacts },
		};

		const expectedState = {
			...initialState,
			contact_list: mockContacts,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle JOURNAL.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'AED', name: 'UAE Dirham' },
			{ code: 'USD', name: 'US Dollar' },
			{ code: 'EUR', name: 'Euro' },
		];

		const action = {
			type: JOURNAL.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle JOURNAL.VAT_LIST', () => {
		const mockVatList = [
			{ id: 1, name: 'Standard Rate', rate: 5 },
			{ id: 2, name: 'Zero Rate', rate: 0 },
		];

		const action = {
			type: JOURNAL.VAT_LIST,
			payload: { data: mockVatList },
		};

		const expectedState = {
			...initialState,
			vat_list: mockVatList,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle JOURNAL.PAGE_NUM', () => {
		const pageNumber = 3;

		const action = {
			type: JOURNAL.PAGE_NUM,
			payload: pageNumber,
		};

		const expectedState = {
			...initialState,
			page_num: pageNumber,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle JOURNAL.CANCEL_FLAG', () => {
		const cancelFlag = true;

		const action = {
			type: JOURNAL.CANCEL_FLAG,
			payload: cancelFlag,
		};

		const expectedState = {
			...initialState,
			cancel_flag: cancelFlag,
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle multiple state updates correctly', () => {
		const mockJournals = [{ journalId: 1, journalReferenceNo: 'JNL-001' }];
		const mockContacts = [{ contactId: 1, firstName: 'John' }];

		const action1 = {
			type: JOURNAL.JOURNAL_LIST,
			payload: mockJournals,
		};

		const action2 = {
			type: JOURNAL.CONTACT_LIST,
			payload: { data: mockContacts },
		};

		let state = JournalReducer(initialState, action1);
		state = JournalReducer(state, action2);

		expect(state.journal_list).toEqual(mockJournals);
		expect(state.contact_list).toEqual(mockContacts);
	});

	it('should handle empty journal list', () => {
		const action = {
			type: JOURNAL.JOURNAL_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			journal_list: [],
		};

		expect(JournalReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle page number updates', () => {
		let state = initialState;

		for (let i = 1; i <= 5; i++) {
			const action = {
				type: JOURNAL.PAGE_NUM,
				payload: i,
			};
			state = JournalReducer(state, action);
			expect(state.page_num).toBe(i);
		}
	});

	it('should handle cancel flag toggle', () => {
		let state = initialState;

		const action1 = {
			type: JOURNAL.CANCEL_FLAG,
			payload: true,
		};
		state = JournalReducer(state, action1);
		expect(state.cancel_flag).toBe(true);

		const action2 = {
			type: JOURNAL.CANCEL_FLAG,
			payload: false,
		};
		state = JournalReducer(state, action2);
		expect(state.cancel_flag).toBe(false);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(JournalReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate original state', () => {
		const mockJournals = [{ journalId: 1, journalReferenceNo: 'JNL-001' }];
		const action = {
			type: JOURNAL.JOURNAL_LIST,
			payload: mockJournals,
		};

		const stateBefore = { ...initialState };
		JournalReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle large journal list', () => {
		const mockJournals = Array.from({ length: 100 }, (_, i) => ({
			journalId: i + 1,
			journalReferenceNo: `JNL-${String(i + 1).padStart(3, '0')}`,
			journalDate: '2023-12-01',
		}));

		const action = {
			type: JOURNAL.JOURNAL_LIST,
			payload: mockJournals,
		};

		const state = JournalReducer(initialState, action);

		expect(state.journal_list).toHaveLength(100);
		expect(state.journal_list[0].journalReferenceNo).toBe('JNL-001');
		expect(state.journal_list[99].journalReferenceNo).toBe('JNL-100');
	});

	it('should handle journals with complete information', () => {
		const mockJournals = [
			{
				journalId: 1,
				journalReferenceNo: 'JNL-001',
				journalDate: '2023-12-01',
				description: 'Monthly closing entries',
				totalDebit: 10000,
				totalCredit: 10000,
				status: 'posted',
				currencyCode: 'AED',
				lineItems: [
					{ accountName: 'Cash', debit: 10000, credit: 0 },
					{ accountName: 'Sales', debit: 0, credit: 10000 },
				],
			},
		];

		const action = {
			type: JOURNAL.JOURNAL_LIST,
			payload: mockJournals,
		};

		const state = JournalReducer(initialState, action);

		expect(state.journal_list[0]).toEqual(mockJournals[0]);
		expect(state.journal_list[0].description).toBe('Monthly closing entries');
		expect(state.journal_list[0].lineItems).toHaveLength(2);
	});

	it('should preserve other state properties when updating one property', () => {
		const existingState = {
			journal_list: [{ journalId: 1 }],
			transaction_category_list: [{ transactionCategoryId: 1 }],
			currency_list: [{ code: 'AED' }],
			contact_list: [{ contactId: 1 }],
			vat_list: [{ id: 1 }],
			page_num: 2,
			cancel_flag: true,
		};

		const mockNewJournals = [
			{ journalId: 2, journalReferenceNo: 'JNL-002' },
			{ journalId: 3, journalReferenceNo: 'JNL-003' },
		];

		const action = {
			type: JOURNAL.JOURNAL_LIST,
			payload: mockNewJournals,
		};

		const state = JournalReducer(existingState, action);

		expect(state.journal_list).toEqual(mockNewJournals);
		expect(state.transaction_category_list).toEqual(
			existingState.transaction_category_list
		);
		expect(state.currency_list).toEqual(existingState.currency_list);
		expect(state.page_num).toBe(2);
		expect(state.cancel_flag).toBe(true);
	});

	it('should handle transaction categories with different types', () => {
		const mockCategories = [
			{ transactionCategoryId: 1, transactionCategoryDescription: 'Bank Charges', type: 'expense' },
			{ transactionCategoryId: 2, transactionCategoryDescription: 'Interest Income', type: 'income' },
			{ transactionCategoryId: 3, transactionCategoryDescription: 'Depreciation', type: 'expense' },
		];

		const action = {
			type: JOURNAL.TRANSACTION_CATEGORY_LIST,
			payload: { data: mockCategories },
		};

		const state = JournalReducer(initialState, action);

		expect(state.transaction_category_list).toHaveLength(3);
		expect(state.transaction_category_list[1].type).toBe('income');
	});

	it('should reset cancel flag correctly', () => {
		const stateWithCancelTrue = {
			...initialState,
			cancel_flag: true,
		};

		const action = {
			type: JOURNAL.CANCEL_FLAG,
			payload: false,
		};

		const state = JournalReducer(stateWithCancelTrue, action);

		expect(state.cancel_flag).toBe(false);
	});
});
