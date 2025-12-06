import RequestForQuotationReducer from '../reducer';
import { PURCHASE_ORDER } from 'constants/types';

describe('Purchase Order Reducer', () => {
	const initialState = {
		project_list: [],
		contact_list: [],
		status_list: [],
		currency_list: [],
		vat_list: [],
		product_list: [],
		supplier_list: [],
		country_list: [],
		deposit_list: [],
		pay_mode: [],
		purchase_order_list: [],
		rfq_list: [],
	};

	it('should return the initial state', () => {
		expect(RequestForQuotationReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PROJECT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Project Alpha' },
				{ id: 2, name: 'Project Beta' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.PROJECT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.project_list).toEqual(payload.data);
		expect(newState.project_list).toHaveLength(2);
	});

	it('should handle CONTACT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Contact A' },
				{ id: 2, name: 'Contact B' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.CONTACT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.contact_list).toEqual(payload.data);
		expect(newState.contact_list).toHaveLength(2);
	});

	it('should handle STATUS_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, status: 'Draft' },
				{ id: 2, status: 'Sent' },
				{ id: 3, status: 'Approved' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.STATUS_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.status_list).toEqual(payload.data);
		expect(newState.status_list).toHaveLength(3);
	});

	it('should handle CURRENCY_LIST action', () => {
		const payload = {
			data: [
				{ code: 'USD', name: 'US Dollar' },
				{ code: 'AED', name: 'UAE Dirham' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.CURRENCY_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.currency_list).toEqual(payload.data);
		expect(newState.currency_list).toHaveLength(2);
	});

	it('should handle SUPPLIER_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Supplier One' },
				{ id: 2, name: 'Supplier Two' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.SUPPLIER_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.supplier_list).toEqual(payload.data);
	});

	it('should handle VAT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 5, type: 'Standard' },
				{ id: 2, rate: 0, type: 'Zero-rated' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.VAT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.vat_list).toEqual(payload.data);
	});

	it('should handle PAY_MODE action', () => {
		const payload = {
			data: [
				{ id: 1, mode: 'Cash' },
				{ id: 2, mode: 'Bank Transfer' },
				{ id: 3, mode: 'Credit Card' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.PAY_MODE,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.pay_mode).toEqual(payload.data);
		expect(newState.pay_mode).toHaveLength(3);
	});

	it('should handle EXCISE_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 50, type: 'Tobacco' },
				{ id: 2, rate: 100, type: 'Energy Drinks' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.EXCISE_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.excise_list).toEqual(payload.data);
	});

	it('should handle PRODUCT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Product A', price: 100 },
				{ id: 2, name: 'Product B', price: 200 },
			],
		};
		const action = {
			type: PURCHASE_ORDER.PRODUCT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.product_list).toEqual(payload.data);
		expect(newState.product_list).toHaveLength(2);
	});

	it('should handle DEPOSIT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, type: 'Security Deposit' },
				{ id: 2, type: 'Advance Payment' },
			],
		};
		const action = {
			type: PURCHASE_ORDER.DEPOSIT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.deposit_list).toEqual(payload.data);
	});

	it('should handle COUNTRY_LIST action', () => {
		const payload = ['UAE', 'USA', 'UK', 'India'];
		const action = {
			type: PURCHASE_ORDER.COUNTRY_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.country_list).toEqual(payload);
		expect(newState.country_list).toHaveLength(4);
	});

	it('should handle PURCHASE_ORDER_LIST action', () => {
		const payload = [
			{ id: 1, poNumber: 'PO-001', amount: 5000 },
			{ id: 2, poNumber: 'PO-002', amount: 7500 },
		];
		const action = {
			type: PURCHASE_ORDER.PURCHASE_ORDER_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.purchase_order_list).toEqual(payload);
		expect(newState.purchase_order_list).toHaveLength(2);
	});

	it('should handle RFQ_LIST action', () => {
		const payload = [
			{ id: 1, rfqNumber: 'RFQ-001' },
			{ id: 2, rfqNumber: 'RFQ-002' },
		];
		const action = {
			type: PURCHASE_ORDER.RFQ_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.rfq_list).toEqual(payload);
		expect(newState.rfq_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: PURCHASE_ORDER.PRODUCT_LIST,
			payload: { data: [{ id: 1, name: 'Test Product' }] },
		};

		const stateBefore = { ...initialState };
		RequestForQuotationReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
