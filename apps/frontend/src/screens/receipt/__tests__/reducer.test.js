import ReceiptReducer from '../reducer';
import { RECEIPT } from 'constants/types';

describe('ReceiptReducer', () => {
	const initialState = {
		receipt_list: [],
		contact_list: [],
		invoice_list: [],
	};

	it('should return the initial state', () => {
		expect(ReceiptReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle RECEIPT.RECEIPT_LIST', () => {
		const mockReceipts = [
			{
				receiptId: 1,
				receiptNumber: 'REC-001',
				amount: 5000,
				date: '2023-12-01',
			},
			{
				receiptId: 2,
				receiptNumber: 'REC-002',
				amount: 7500,
				date: '2023-12-05',
			},
		];

		const action = {
			type: RECEIPT.RECEIPT_LIST,
			payload: mockReceipts,
		};

		const expectedState = {
			...initialState,
			receipt_list: mockReceipts,
		};

		expect(ReceiptReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle RECEIPT.CONTACT_LIST', () => {
		const mockContacts = [
			{ contactId: 1, firstName: 'John', lastName: 'Doe' },
			{ contactId: 2, firstName: 'Jane', lastName: 'Smith' },
		];

		const action = {
			type: RECEIPT.CONTACT_LIST,
			payload: mockContacts,
		};

		const expectedState = {
			...initialState,
			contact_list: mockContacts,
		};

		expect(ReceiptReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle RECEIPT.INVOICE_LIST', () => {
		const mockInvoices = [
			{ invoiceId: 1, invoiceNumber: 'INV-001', amount: 10000 },
			{ invoiceId: 2, invoiceNumber: 'INV-002', amount: 15000 },
		];

		const action = {
			type: RECEIPT.INVOICE_LIST,
			payload: mockInvoices,
		};

		const expectedState = {
			...initialState,
			invoice_list: mockInvoices,
		};

		expect(ReceiptReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle multiple state updates correctly', () => {
		const mockReceipts = [{ receiptId: 1, amount: 1000 }];
		const mockContacts = [{ contactId: 1, firstName: 'John' }];

		const action1 = {
			type: RECEIPT.RECEIPT_LIST,
			payload: mockReceipts,
		};

		const action2 = {
			type: RECEIPT.CONTACT_LIST,
			payload: mockContacts,
		};

		let state = ReceiptReducer(initialState, action1);
		state = ReceiptReducer(state, action2);

		expect(state.receipt_list).toEqual(mockReceipts);
		expect(state.contact_list).toEqual(mockContacts);
	});

	it('should handle empty receipt list', () => {
		const action = {
			type: RECEIPT.RECEIPT_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			receipt_list: [],
		};

		expect(ReceiptReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle empty contact list', () => {
		const action = {
			type: RECEIPT.CONTACT_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			contact_list: [],
		};

		expect(ReceiptReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle empty invoice list', () => {
		const action = {
			type: RECEIPT.INVOICE_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			invoice_list: [],
		};

		expect(ReceiptReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(ReceiptReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate original state', () => {
		const mockReceipts = [{ receiptId: 1, amount: 100 }];
		const action = {
			type: RECEIPT.RECEIPT_LIST,
			payload: mockReceipts,
		};

		const stateBefore = { ...initialState };
		ReceiptReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle large receipt list', () => {
		const mockReceipts = Array.from({ length: 100 }, (_, i) => ({
			receiptId: i + 1,
			receiptNumber: `REC-${String(i + 1).padStart(3, '0')}`,
			amount: (i + 1) * 1000,
		}));

		const action = {
			type: RECEIPT.RECEIPT_LIST,
			payload: mockReceipts,
		};

		const state = ReceiptReducer(initialState, action);

		expect(state.receipt_list).toHaveLength(100);
		expect(state.receipt_list[0].receiptNumber).toBe('REC-001');
		expect(state.receipt_list[99].receiptNumber).toBe('REC-100');
	});

	it('should handle receipts with special characters in reference code', () => {
		const mockReceipts = [
			{ receiptId: 1, receiptReferenceCode: 'REC-2023/12/001' },
			{ receiptId: 2, receiptReferenceCode: 'REC-2023-DXB-002' },
		];

		const action = {
			type: RECEIPT.RECEIPT_LIST,
			payload: mockReceipts,
		};

		const state = ReceiptReducer(initialState, action);

		expect(state.receipt_list[0].receiptReferenceCode).toBe('REC-2023/12/001');
		expect(state.receipt_list[1].receiptReferenceCode).toBe('REC-2023-DXB-002');
	});

	it('should handle contacts with complete information', () => {
		const mockContacts = [
			{
				contactId: 1,
				firstName: 'Ahmed',
				lastName: 'Ali',
				email: 'ahmed.ali@example.com',
				phone: '+971501234567',
				companyName: 'ABC Trading LLC',
			},
		];

		const action = {
			type: RECEIPT.CONTACT_LIST,
			payload: mockContacts,
		};

		const state = ReceiptReducer(initialState, action);

		expect(state.contact_list[0]).toEqual(mockContacts[0]);
		expect(state.contact_list[0].companyName).toBe('ABC Trading LLC');
	});

	it('should handle invoices with various currencies', () => {
		const mockInvoices = [
			{ invoiceId: 1, invoiceNumber: 'INV-001', amount: 10000, currency: 'AED' },
			{ invoiceId: 2, invoiceNumber: 'INV-002', amount: 2500, currency: 'USD' },
			{ invoiceId: 3, invoiceNumber: 'INV-003', amount: 3500, currency: 'EUR' },
		];

		const action = {
			type: RECEIPT.INVOICE_LIST,
			payload: mockInvoices,
		};

		const state = ReceiptReducer(initialState, action);

		expect(state.invoice_list).toHaveLength(3);
		expect(state.invoice_list[1].currency).toBe('USD');
	});

	it('should preserve other state properties when updating one property', () => {
		const existingState = {
			receipt_list: [{ receiptId: 1, amount: 1000 }],
			contact_list: [{ contactId: 1, firstName: 'John' }],
			invoice_list: [{ invoiceId: 1, invoiceNumber: 'INV-001' }],
		};

		const mockNewReceipts = [
			{ receiptId: 2, amount: 2000 },
			{ receiptId: 3, amount: 3000 },
		];

		const action = {
			type: RECEIPT.RECEIPT_LIST,
			payload: mockNewReceipts,
		};

		const state = ReceiptReducer(existingState, action);

		expect(state.receipt_list).toEqual(mockNewReceipts);
		expect(state.contact_list).toEqual(existingState.contact_list);
		expect(state.invoice_list).toEqual(existingState.invoice_list);
	});
});
