import RequestForQuotationReducer from '../reducer';
import { REQUEST_FOR_QUOTATION } from 'constants/types';

describe('Request For Quotation Reducer', () => {
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
		request_for_quotation_list: [],
		excise_list: [],
	};

	it('should return the initial state', () => {
		expect(RequestForQuotationReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PROJECT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, projectName: 'Project Alpha', code: 'PA-001' },
				{ id: 2, projectName: 'Project Beta', code: 'PB-002' },
				{ id: 3, projectName: 'Project Gamma', code: 'PG-003' },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.PROJECT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.project_list).toEqual(payload.data);
		expect(newState.project_list).toHaveLength(3);
	});

	it('should handle CONTACT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Supplier ABC', email: 'abc@test.com' },
				{ id: 2, name: 'Supplier XYZ', email: 'xyz@test.com' },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.CONTACT_LIST,
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
				{ id: 3, status: 'Accepted' },
				{ id: 4, status: 'Rejected' },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.STATUS_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

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
			type: REQUEST_FOR_QUOTATION.CURRENCY_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.currency_list).toEqual(payload.data);
		expect(newState.currency_list).toHaveLength(3);
	});

	it('should handle SUPPLIER_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Supplier One', code: 'SUP-001' },
				{ id: 2, name: 'Supplier Two', code: 'SUP-002' },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.SUPPLIER_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.supplier_list).toEqual(payload.data);
		expect(newState.supplier_list).toHaveLength(2);
	});

	it('should handle VAT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 5, category: 'Standard' },
				{ id: 2, rate: 0, category: 'Zero Rated' },
				{ id: 3, rate: 0, category: 'Exempt' },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.VAT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.vat_list).toEqual(payload.data);
		expect(newState.vat_list).toHaveLength(3);
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
			type: REQUEST_FOR_QUOTATION.PAY_MODE,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.pay_mode).toEqual(payload.data);
		expect(newState.pay_mode).toHaveLength(3);
	});

	it('should handle EXCISE_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 50, category: 'Tobacco' },
				{ id: 2, rate: 100, category: 'Energy Drinks' },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.EXCISE_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.excise_list).toEqual(payload.data);
		expect(newState.excise_list).toHaveLength(2);
	});

	it('should handle PRODUCT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Product A', sku: 'SKU-001', price: 100 },
				{ id: 2, name: 'Product B', sku: 'SKU-002', price: 200 },
				{ id: 3, name: 'Product C', sku: 'SKU-003', price: 300 },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.PRODUCT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.product_list).toEqual(payload.data);
		expect(newState.product_list).toHaveLength(3);
	});

	it('should handle DEPOSIT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, type: 'Supplier Deposit', amount: 10000 },
				{ id: 2, type: 'Security Deposit', amount: 5000 },
			],
		};
		const action = {
			type: REQUEST_FOR_QUOTATION.DEPOSIT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.deposit_list).toEqual(payload.data);
		expect(newState.deposit_list).toHaveLength(2);
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
			type: REQUEST_FOR_QUOTATION.COUNTRY_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.country_list).toEqual(payload);
		expect(newState.country_list).toHaveLength(6);
	});

	it('should handle REQUEST_FOR_QUOTATION_LIST action', () => {
		const payload = [
			{ id: 1, rfqNumber: 'RFQ-001', amount: 50000, status: 'Draft' },
			{ id: 2, rfqNumber: 'RFQ-002', amount: 75000, status: 'Sent' },
		];
		const action = {
			type: REQUEST_FOR_QUOTATION.REQUEST_FOR_QUOTATION_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.request_for_quotation_list).toEqual(payload);
		expect(newState.request_for_quotation_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: REQUEST_FOR_QUOTATION.PROJECT_LIST,
			payload: { data: [{ id: 1, projectName: 'Test Project' }] },
		};

		const stateBefore = { ...initialState };
		RequestForQuotationReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple sequential actions correctly', () => {
		const projectAction = {
			type: REQUEST_FOR_QUOTATION.PROJECT_LIST,
			payload: { data: [{ id: 1, projectName: 'Project 1' }] },
		};

		const currencyAction = {
			type: REQUEST_FOR_QUOTATION.CURRENCY_LIST,
			payload: { data: [{ code: 'AED', name: 'UAE Dirham' }] },
		};

		let state = RequestForQuotationReducer(initialState, projectAction);
		state = RequestForQuotationReducer(state, currencyAction);

		expect(state.project_list).toHaveLength(1);
		expect(state.currency_list).toHaveLength(1);
	});

	it('should preserve other state properties when updating one property', () => {
		const stateWithData = {
			...initialState,
			project_list: [{ id: 1, projectName: 'Existing Project' }],
		};

		const action = {
			type: REQUEST_FOR_QUOTATION.CURRENCY_LIST,
			payload: { data: [{ code: 'USD' }] },
		};

		const newState = RequestForQuotationReducer(stateWithData, action);

		expect(newState.project_list).toHaveLength(1);
		expect(newState.currency_list).toHaveLength(1);
	});

	it('should handle empty array payload', () => {
		const action = {
			type: REQUEST_FOR_QUOTATION.PRODUCT_LIST,
			payload: { data: [] },
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.product_list).toEqual([]);
		expect(newState.product_list).toHaveLength(0);
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_RFQ_ACTION',
			payload: { test: 'data' },
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
