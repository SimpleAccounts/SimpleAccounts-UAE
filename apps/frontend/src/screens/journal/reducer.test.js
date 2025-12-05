import JournalReducer from './reducer';
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

    describe('JOURNAL_LIST', () => {
        it('should handle JOURNAL_LIST action', () => {
            const payload = [
                { id: 1, referenceNo: 'JRN-001', description: 'Opening Balance', date: '2024-01-01' },
                { id: 2, referenceNo: 'JRN-002', description: 'Adjusting Entry', date: '2024-01-15' },
            ];
            const action = { type: JOURNAL.JOURNAL_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.journal_list).toEqual(payload);
            expect(newState.journal_list).toHaveLength(2);
        });

        it('should replace existing journal list', () => {
            const existingState = {
                ...initialState,
                journal_list: [{ id: 99 }],
            };
            const payload = [{ id: 1 }];
            const action = { type: JOURNAL.JOURNAL_LIST, payload };
            const newState = JournalReducer(existingState, action);
            expect(newState.journal_list).toEqual(payload);
        });

        it('should handle empty journal list', () => {
            const payload = [];
            const action = { type: JOURNAL.JOURNAL_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.journal_list).toEqual([]);
        });
    });

    describe('TRANSACTION_CATEGORY_LIST', () => {
        it('should handle TRANSACTION_CATEGORY_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Sales Revenue', code: '4000' },
                    { id: 2, name: 'Cost of Goods Sold', code: '5000' },
                ],
            };
            const action = { type: JOURNAL.TRANSACTION_CATEGORY_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.transaction_category_list).toEqual(payload.data);
        });
    });

    describe('CONTACT_LIST', () => {
        it('should handle CONTACT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Customer A' },
                    { id: 2, name: 'Vendor B' },
                ],
            };
            const action = { type: JOURNAL.CONTACT_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.contact_list).toEqual(payload.data);
        });
    });

    describe('CURRENCY_LIST', () => {
        it('should handle CURRENCY_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, code: 'AED', name: 'UAE Dirham' },
                    { id: 2, code: 'USD', name: 'US Dollar' },
                ],
            };
            const action = { type: JOURNAL.CURRENCY_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.currency_list).toEqual(payload.data);
        });
    });

    describe('VAT_LIST', () => {
        it('should handle VAT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Standard Rate 5%', percentage: 5 },
                    { id: 2, name: 'Zero Rate', percentage: 0 },
                ],
            };
            const action = { type: JOURNAL.VAT_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.vat_list).toEqual(payload.data);
        });
    });

    describe('PAGE_NUM', () => {
        it('should handle PAGE_NUM action', () => {
            const payload = 5;
            const action = { type: JOURNAL.PAGE_NUM, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.page_num).toBe(5);
        });

        it('should handle page number reset to 1', () => {
            const existingState = { ...initialState, page_num: 10 };
            const payload = 1;
            const action = { type: JOURNAL.PAGE_NUM, payload };
            const newState = JournalReducer(existingState, action);
            expect(newState.page_num).toBe(1);
        });
    });

    describe('CANCEL_FLAG', () => {
        it('should handle CANCEL_FLAG action with true', () => {
            const payload = true;
            const action = { type: JOURNAL.CANCEL_FLAG, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.cancel_flag).toBe(true);
        });

        it('should handle CANCEL_FLAG action with false', () => {
            const existingState = { ...initialState, cancel_flag: true };
            const payload = false;
            const action = { type: JOURNAL.CANCEL_FLAG, payload };
            const newState = JournalReducer(existingState, action);
            expect(newState.cancel_flag).toBe(false);
        });
    });

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION', payload: [] };
            const newState = JournalReducer(initialState, action);
            expect(newState).toEqual(initialState);
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            const payload = [{ id: 1 }];
            const action = { type: JOURNAL.JOURNAL_LIST, payload };
            JournalReducer(originalState, action);
            expect(originalState.journal_list).toEqual([]);
        });

        it('should preserve other state properties when updating', () => {
            const stateWithData = {
                ...initialState,
                journal_list: [{ id: 1 }],
                page_num: 3,
            };
            const payload = { data: [{ id: 2 }] };
            const action = { type: JOURNAL.TRANSACTION_CATEGORY_LIST, payload };
            const newState = JournalReducer(stateWithData, action);
            expect(newState.journal_list).toEqual([{ id: 1 }]);
            expect(newState.page_num).toBe(3);
            expect(newState.transaction_category_list).toEqual([{ id: 2 }]);
        });
    });

    describe('journal entry scenarios', () => {
        it('should handle journal with debit and credit entries', () => {
            const payload = [
                {
                    id: 1,
                    referenceNo: 'JRN-001',
                    description: 'Test Entry',
                    lineItems: [
                        { account: 'Cash', debit: 1000, credit: 0 },
                        { account: 'Revenue', debit: 0, credit: 1000 },
                    ],
                },
            ];
            const action = { type: JOURNAL.JOURNAL_LIST, payload };
            const newState = JournalReducer(initialState, action);
            expect(newState.journal_list[0].lineItems).toHaveLength(2);
        });
    });
});
