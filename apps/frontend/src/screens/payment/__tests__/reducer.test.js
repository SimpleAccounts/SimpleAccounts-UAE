import PaymentReducer from '../reducer';
import { PAYMENT } from 'constants/types';

describe('PaymentReducer', () => {
	const initialState = {
		payment_list: [],
		currency_list: [],
		bank_list: [],
		supplier_list: [],
		invoice_list: [],
		project_list: [],
		country_list: [],
	};

	it('should return the initial state', () => {
		expect(PaymentReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PAYMENT.PAYMENT_LIST', () => {
		const mockPayments = [
			{ paymentId: 1, amount: 5000, paymentDate: '2023-12-01' },
			{ paymentId: 2, amount: 7500, paymentDate: '2023-12-05' },
		];

		const action = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: mockPayments },
		};

		const expectedState = {
			...initialState,
			payment_list: mockPayments,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYMENT.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'AED', name: 'UAE Dirham' },
			{ code: 'USD', name: 'US Dollar' },
			{ code: 'EUR', name: 'Euro' },
		];

		const action = {
			type: PAYMENT.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYMENT.BANK_LIST', () => {
		const mockBanks = [
			{ bankId: 1, bankName: 'Emirates NBD', accountNumber: '123456' },
			{ bankId: 2, bankName: 'Dubai Islamic Bank', accountNumber: '789012' },
		];

		const action = {
			type: PAYMENT.BANK_LIST,
			payload: { data: mockBanks },
		};

		const expectedState = {
			...initialState,
			bank_list: mockBanks,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYMENT.SUPPLIER_LIST', () => {
		const mockSuppliers = [
			{ supplierId: 1, supplierName: 'Supplier A', email: 'suppliera@example.com' },
			{ supplierId: 2, supplierName: 'Supplier B', email: 'supplierb@example.com' },
		];

		const action = {
			type: PAYMENT.SUPPLIER_LIST,
			payload: { data: mockSuppliers },
		};

		const expectedState = {
			...initialState,
			supplier_list: mockSuppliers,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYMENT.INVOICE_LIST', () => {
		const mockInvoices = [
			{ invoiceId: 1, invoiceNumber: 'INV-001', amount: 10000 },
			{ invoiceId: 2, invoiceNumber: 'INV-002', amount: 15000 },
		];

		const action = {
			type: PAYMENT.INVOICE_LIST,
			payload: { data: mockInvoices },
		};

		const expectedState = {
			...initialState,
			invoice_list: mockInvoices,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYMENT.PROJECT_LIST', () => {
		const mockProjects = [
			{ projectId: 1, projectName: 'Project Alpha' },
			{ projectId: 2, projectName: 'Project Beta' },
		];

		const action = {
			type: PAYMENT.PROJECT_LIST,
			payload: { data: mockProjects },
		};

		const expectedState = {
			...initialState,
			project_list: mockProjects,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PAYMENT.COUNTRY_LIST', () => {
		const mockCountries = [
			{ code: 'AE', name: 'United Arab Emirates' },
			{ code: 'US', name: 'United States' },
			{ code: 'GB', name: 'United Kingdom' },
		];

		const action = {
			type: PAYMENT.COUNTRY_LIST,
			payload: { data: mockCountries },
		};

		const expectedState = {
			...initialState,
			country_list: mockCountries,
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle multiple state updates correctly', () => {
		const mockPayments = [{ paymentId: 1, amount: 1000 }];
		const mockCurrencies = [{ code: 'AED', name: 'UAE Dirham' }];

		const action1 = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: mockPayments },
		};

		const action2 = {
			type: PAYMENT.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		let state = PaymentReducer(initialState, action1);
		state = PaymentReducer(state, action2);

		expect(state.payment_list).toEqual(mockPayments);
		expect(state.currency_list).toEqual(mockCurrencies);
	});

	it('should handle empty payment list', () => {
		const action = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: [] },
		};

		const expectedState = {
			...initialState,
			payment_list: [],
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle empty supplier list', () => {
		const action = {
			type: PAYMENT.SUPPLIER_LIST,
			payload: { data: [] },
		};

		const expectedState = {
			...initialState,
			supplier_list: [],
		};

		expect(PaymentReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(PaymentReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate original state', () => {
		const mockPayments = [{ paymentId: 1, amount: 100 }];
		const action = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: mockPayments },
		};

		const stateBefore = { ...initialState };
		PaymentReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle large payment list', () => {
		const mockPayments = Array.from({ length: 100 }, (_, i) => ({
			paymentId: i + 1,
			paymentNumber: `PAY-${String(i + 1).padStart(3, '0')}`,
			amount: (i + 1) * 1000,
		}));

		const action = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: mockPayments },
		};

		const state = PaymentReducer(initialState, action);

		expect(state.payment_list).toHaveLength(100);
		expect(state.payment_list[0].paymentNumber).toBe('PAY-001');
		expect(state.payment_list[99].paymentNumber).toBe('PAY-100');
	});

	it('should handle payments with complete information', () => {
		const mockPayments = [
			{
				paymentId: 1,
				paymentNumber: 'PAY-001',
				amount: 5000,
				paymentDate: '2023-12-01',
				supplierId: 10,
				supplierName: 'ABC Trading LLC',
				bankId: 5,
				bankName: 'Emirates NBD',
				currency: 'AED',
				status: 'completed',
			},
		];

		const action = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: mockPayments },
		};

		const state = PaymentReducer(initialState, action);

		expect(state.payment_list[0]).toEqual(mockPayments[0]);
		expect(state.payment_list[0].supplierName).toBe('ABC Trading LLC');
	});

	it('should preserve other state properties when updating one property', () => {
		const existingState = {
			payment_list: [{ paymentId: 1, amount: 1000 }],
			currency_list: [{ code: 'AED', name: 'UAE Dirham' }],
			bank_list: [{ bankId: 1, bankName: 'Emirates NBD' }],
			supplier_list: [],
			invoice_list: [],
			project_list: [],
			country_list: [],
		};

		const mockNewPayments = [
			{ paymentId: 2, amount: 2000 },
			{ paymentId: 3, amount: 3000 },
		];

		const action = {
			type: PAYMENT.PAYMENT_LIST,
			payload: { data: mockNewPayments },
		};

		const state = PaymentReducer(existingState, action);

		expect(state.payment_list).toEqual(mockNewPayments);
		expect(state.currency_list).toEqual(existingState.currency_list);
		expect(state.bank_list).toEqual(existingState.bank_list);
	});
});
