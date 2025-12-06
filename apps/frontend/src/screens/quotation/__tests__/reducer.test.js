import RequestForQuotationReducer from '../reducer';
import { QUOTATION } from 'constants/types';

describe('Quotation Reducer', () => {
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
		quotation_list: [],
		excise_list: [],
	};

	it('should return the initial state', () => {
		expect(RequestForQuotationReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PROJECT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Website Development' },
				{ id: 2, name: 'Mobile App' },
			],
		};
		const action = {
			type: QUOTATION.PROJECT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.project_list).toEqual(payload.data);
		expect(newState.project_list).toHaveLength(2);
	});

	it('should handle CONTACT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Client A', email: 'clienta@test.com' },
				{ id: 2, name: 'Client B', email: 'clientb@test.com' },
			],
		};
		const action = {
			type: QUOTATION.CONTACT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.contact_list).toEqual(payload.data);
		expect(newState.contact_list[0].email).toBe('clienta@test.com');
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
			type: QUOTATION.STATUS_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.status_list).toEqual(payload.data);
		expect(newState.status_list).toHaveLength(4);
	});

	it('should handle CURRENCY_LIST action', () => {
		const payload = {
			data: [
				{ code: 'USD', symbol: '$' },
				{ code: 'EUR', symbol: '€' },
				{ code: 'AED', symbol: 'د.إ' },
			],
		};
		const action = {
			type: QUOTATION.CURRENCY_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.currency_list).toEqual(payload.data);
		expect(newState.currency_list).toHaveLength(3);
	});

	it('should handle SUPPLIER_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Supplier Alpha' },
				{ id: 2, name: 'Supplier Beta' },
			],
		};
		const action = {
			type: QUOTATION.SUPPLIER_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.supplier_list).toEqual(payload.data);
	});

	it('should handle VAT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 5, category: 'Standard' },
				{ id: 2, rate: 0, category: 'Zero-rated' },
				{ id: 3, rate: 5, category: 'Exempt' },
			],
		};
		const action = {
			type: QUOTATION.VAT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.vat_list).toEqual(payload.data);
		expect(newState.vat_list).toHaveLength(3);
	});

	it('should handle EXCISE_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, rate: 50, category: 'Tobacco' },
				{ id: 2, rate: 100, category: 'Soft Drinks' },
			],
		};
		const action = {
			type: QUOTATION.EXCISE_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.excise_list).toEqual(payload.data);
		expect(newState.excise_list).toHaveLength(2);
	});

	it('should handle PAY_MODE action', () => {
		const payload = {
			data: [
				{ id: 1, mode: 'Bank Transfer' },
				{ id: 2, mode: 'Cash' },
				{ id: 3, mode: 'Cheque' },
			],
		};
		const action = {
			type: QUOTATION.PAY_MODE,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.pay_mode).toEqual(payload.data);
		expect(newState.pay_mode).toHaveLength(3);
	});

	it('should handle PRODUCT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, name: 'Laptop', price: 3000 },
				{ id: 2, name: 'Mouse', price: 50 },
				{ id: 3, name: 'Keyboard', price: 150 },
			],
		};
		const action = {
			type: QUOTATION.PRODUCT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.product_list).toEqual(payload.data);
		expect(newState.product_list).toHaveLength(3);
	});

	it('should handle DEPOSIT_LIST action', () => {
		const payload = {
			data: [
				{ id: 1, type: 'Security Deposit', percentage: 10 },
				{ id: 2, type: 'Advance Payment', percentage: 25 },
			],
		};
		const action = {
			type: QUOTATION.DEPOSIT_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.deposit_list).toEqual(payload.data);
	});

	it('should handle COUNTRY_LIST action', () => {
		const payload = ['United Arab Emirates', 'United States', 'United Kingdom', 'India'];
		const action = {
			type: QUOTATION.COUNTRY_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.country_list).toEqual(payload);
		expect(newState.country_list).toHaveLength(4);
	});

	it('should handle QUOTATION_LIST action', () => {
		const payload = [
			{ id: 1, quotationNumber: 'QT-001', amount: 10000 },
			{ id: 2, quotationNumber: 'QT-002', amount: 15000 },
			{ id: 3, quotationNumber: 'QT-003', amount: 20000 },
		];
		const action = {
			type: QUOTATION.QUOTATION_LIST,
			payload,
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState.quotation_list).toEqual(payload);
		expect(newState.quotation_list).toHaveLength(3);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: QUOTATION.PRODUCT_LIST,
			payload: { data: [{ id: 1, name: 'Test Product', price: 100 }] },
		};

		const stateBefore = { ...initialState };
		RequestForQuotationReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should preserve other state properties when updating', () => {
		const stateWithData = {
			...initialState,
			quotation_list: [{ id: 1, quotationNumber: 'QT-001' }],
		};

		const action = {
			type: QUOTATION.PRODUCT_LIST,
			payload: { data: [{ id: 1, name: 'New Product' }] },
		};

		const newState = RequestForQuotationReducer(stateWithData, action);

		expect(newState.quotation_list).toHaveLength(1);
		expect(newState.product_list).toHaveLength(1);
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION_TYPE',
			payload: { test: 'data' },
		};

		const newState = RequestForQuotationReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
