import CustomerInvoiceReducer from '../reducer';
import { CUSTOMER_INVOICE } from 'constants/types';

describe('Credit Notes Reducer', () => {
	const initialState = {
		customer_invoice_list: [],
		project_list: [],
		customer_list: [],
		currency_list: [],
		vat_list: [],
		product_list: [],
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

	it('should handle CUSTOMER_INVOICE_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, invoiceNumber: 'CN-001', amount: 5000 },
				{ id: 2, invoiceNumber: 'CN-002', amount: 3000 },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.customer_invoice_list).toEqual(payload.data);
		expect(newState.customer_invoice_list).toHaveLength(2);
	});

	it('should handle PROJECT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, projectName: 'Project X' },
				{ id: 2, projectName: 'Project Y' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.PROJECT_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.project_list).toEqual(payload.data);
		expect(newState.project_list).toHaveLength(2);
	});

	it('should handle CUSTOMER_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Customer A', email: 'customera@test.com' },
				{ id: 2, name: 'Customer B', email: 'customerb@test.com' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.CUSTOMER_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.customer_list).toEqual(payload.data);
		expect(newState.customer_list[0].email).toBe('customera@test.com');
	});

	it('should handle STATUS_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, status: 'Draft' },
				{ id: 2, status: 'Issued' },
				{ id: 3, status: 'Applied' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.STATUS_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.status_list).toEqual(payload.data);
		expect(newState.status_list).toHaveLength(3);
	});

	it('should handle CURRENCY_LIST action', () => {
		const payload = {
			data: [
				{ code: 'AED', name: 'UAE Dirham' },
				{ code: 'USD', name: 'US Dollar' },
				{ code: 'EUR', name: 'Euro' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.CURRENCY_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.currency_list).toEqual(payload.data);
		expect(newState.currency_list).toHaveLength(3);
	});

	it('should handle VAT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 5, category: 'Standard Rate' },
				{ id: 2, rate: 0, category: 'Zero Rate' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.VAT_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.vat_list).toEqual(payload.data);
		expect(newState.vat_list).toHaveLength(2);
	});

	it('should handle PRODUCT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Product One', price: 100 },
				{ id: 2, name: 'Product Two', price: 250 },
				{ id: 3, name: 'Product Three', price: 500 },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.PRODUCT_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.product_list).toEqual(payload.data);
		expect(newState.product_list).toHaveLength(3);
	});

	it('should handle DEPOSIT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, type: 'Customer Deposit' },
				{ id: 2, type: 'Refundable Deposit' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.DEPOSIT_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.deposit_list).toEqual(payload.data);
	});

	it('should handle PAY_MODE action', () => {
		const payload = {
			data: [
				{ id: 1, mode: 'Cash' },
				{ id: 2, mode: 'Credit Card' },
				{ id: 3, mode: 'Bank Transfer' },
			],
		};
		const action = {
			type: CUSTOMER_INVOICE.PAY_MODE,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.pay_mode).toEqual(payload.data);
		expect(newState.pay_mode).toHaveLength(3);
	});

	it('should handle COUNTRY_LIST action', () => {
		const payload = ['United Arab Emirates', 'Saudi Arabia', 'Kuwait', 'Oman'];
		const action = {
			type: CUSTOMER_INVOICE.COUNTRY_LIST,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.country_list).toEqual(payload);
		expect(newState.country_list).toHaveLength(4);
	});

	it('should handle PLACE_OF_SUPPLY action', () => {
		const payload = [
			{ id: 1, name: 'Abu Dhabi' },
			{ id: 2, name: 'Dubai' },
			{ id: 3, name: 'Sharjah' },
		];
		const action = {
			type: CUSTOMER_INVOICE.PLACE_OF_SUPPLY,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.place_of_supply).toEqual(payload);
		expect(newState.place_of_supply).toHaveLength(3);
	});

	it('should handle INVOICE_LIST_FOR_DROPDOWN action', () => {
		const payload = [
			{ id: 1, invoiceNumber: 'INV-001' },
			{ id: 2, invoiceNumber: 'INV-002' },
		];
		const action = {
			type: CUSTOMER_INVOICE.INVOICE_LIST_FOR_DROPDOWN,
			payload,
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState.invoice_list).toEqual(payload);
		expect(newState.invoice_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: CUSTOMER_INVOICE.PRODUCT_LIST,
			payload: { data: [{ id: 1, name: 'Test Product' }] },
		};

		const stateBefore = { ...initialState };
		CustomerInvoiceReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should preserve other state properties when updating', () => {
		const stateWithData = {
			...initialState,
			customer_invoice_list: [{ id: 1, invoiceNumber: 'CN-001' }],
		};

		const action = {
			type: CUSTOMER_INVOICE.PRODUCT_LIST,
			payload: { data: [{ id: 1, name: 'New Product' }] },
		};

		const newState = CustomerInvoiceReducer(stateWithData, action);

		expect(newState.customer_invoice_list).toHaveLength(1);
		expect(newState.product_list).toHaveLength(1);
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = CustomerInvoiceReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
