import CustomerInvoiceReducer from '../reducer';
import { CUSTOMER_INVOICE } from 'constants/types';

describe('CustomerInvoiceReducer', () => {
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
		excise_list: [],
	};

	it('should return the initial state', () => {
		expect(CustomerInvoiceReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST', () => {
		const mockInvoices = [
			{ id: 1, invoiceNumber: 'CI-001', amount: 10000, status: 'paid' },
			{ id: 2, invoiceNumber: 'CI-002', amount: 5000, status: 'pending' },
		];

		const action = {
			type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
			payload: { data: mockInvoices },
		};

		const expectedState = {
			...initialState,
			customer_invoice_list: mockInvoices,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.PROJECT_LIST', () => {
		const mockProjects = [
			{ id: 1, projectName: 'Project X', budget: 50000 },
			{ id: 2, projectName: 'Project Y', budget: 30000 },
		];

		const action = {
			type: CUSTOMER_INVOICE.PROJECT_LIST,
			payload: { data: mockProjects },
		};

		const expectedState = {
			...initialState,
			project_list: mockProjects,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.CUSTOMER_LIST', () => {
		const mockCustomers = [
			{ customerId: 1, firstName: 'Alice', lastName: 'Johnson' },
			{ customerId: 2, firstName: 'Bob', lastName: 'Williams' },
		];

		const action = {
			type: CUSTOMER_INVOICE.CUSTOMER_LIST,
			payload: { data: mockCustomers },
		};

		const expectedState = {
			...initialState,
			customer_list: mockCustomers,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.STATUS_LIST', () => {
		const mockStatuses = [
			{ id: 1, name: 'Draft', color: 'gray' },
			{ id: 2, name: 'Sent', color: 'blue' },
			{ id: 3, name: 'Paid', color: 'green' },
		];

		const action = {
			type: CUSTOMER_INVOICE.STATUS_LIST,
			payload: { data: mockStatuses },
		};

		const expectedState = {
			...initialState,
			status_list: mockStatuses,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'USD', name: 'US Dollar', symbol: '$' },
			{ code: 'EUR', name: 'Euro', symbol: '€' },
			{ code: 'GBP', name: 'British Pound', symbol: '£' },
		];

		const action = {
			type: CUSTOMER_INVOICE.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.VAT_LIST', () => {
		const mockVatList = [
			{ id: 1, name: 'Standard VAT', percentage: 5 },
			{ id: 2, name: 'Zero Rated', percentage: 0 },
			{ id: 3, name: 'Exempt', percentage: 0 },
		];

		const action = {
			type: CUSTOMER_INVOICE.VAT_LIST,
			payload: { data: mockVatList },
		};

		const expectedState = {
			...initialState,
			vat_list: mockVatList,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.PRODUCT_LIST', () => {
		const mockProducts = [
			{ id: 1, productName: 'Product Alpha', price: 500 },
			{ id: 2, productName: 'Product Beta', price: 750 },
		];

		const action = {
			type: CUSTOMER_INVOICE.PRODUCT_LIST,
			payload: { data: mockProducts },
		};

		const expectedState = {
			...initialState,
			product_list: mockProducts,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.DEPOSIT_LIST', () => {
		const mockDeposits = [
			{ id: 1, depositAmount: 5000, date: '2023-11-01' },
			{ id: 2, depositAmount: 3000, date: '2023-11-15' },
		];

		const action = {
			type: CUSTOMER_INVOICE.DEPOSIT_LIST,
			payload: { data: mockDeposits },
		};

		const expectedState = {
			...initialState,
			deposit_list: mockDeposits,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.PAY_MODE', () => {
		const mockPayModes = [
			{ id: 1, label: 'Cash', value: 'cash' },
			{ id: 2, label: 'Credit Card', value: 'credit_card' },
			{ id: 3, label: 'Bank Transfer', value: 'bank_transfer' },
		];

		const action = {
			type: CUSTOMER_INVOICE.PAY_MODE,
			payload: { data: mockPayModes },
		};

		const expectedState = {
			...initialState,
			pay_mode: mockPayModes,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.EXCISE_LIST', () => {
		const mockExciseList = [
			{ id: 1, name: 'Excise Tax Type A', rate: 50 },
			{ id: 2, name: 'Excise Tax Type B', rate: 100 },
		];

		const action = {
			type: CUSTOMER_INVOICE.EXCISE_LIST,
			payload: { data: mockExciseList },
		};

		const expectedState = {
			...initialState,
			excise_list: mockExciseList,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.COUNTRY_LIST', () => {
		const mockCountries = [
			{ code: 'US', name: 'United States' },
			{ code: 'AE', name: 'United Arab Emirates' },
			{ code: 'GB', name: 'United Kingdom' },
		];

		const action = {
			type: CUSTOMER_INVOICE.COUNTRY_LIST,
			payload: mockCountries,
		};

		const expectedState = {
			...initialState,
			country_list: mockCountries,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle CUSTOMER_INVOICE.PLACE_OF_SUPPLY', () => {
		const mockPlaces = [
			{ id: 1, name: 'Dubai', code: 'DXB' },
			{ id: 2, name: 'Abu Dhabi', code: 'AUH' },
		];

		const action = {
			type: CUSTOMER_INVOICE.PLACE_OF_SUPPLY,
			payload: mockPlaces,
		};

		const expectedState = {
			...initialState,
			place_of_supply: mockPlaces,
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(CustomerInvoiceReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state', () => {
		const mockInvoices = [{ id: 1, invoiceNumber: 'CI-001' }];
		const action = {
			type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
			payload: { data: mockInvoices },
		};

		const stateBefore = { ...initialState };
		CustomerInvoiceReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple actions in sequence', () => {
		const invoices = [{ id: 1, invoiceNumber: 'CI-001' }];
		const customers = [{ customerId: 1, firstName: 'Alice' }];
		const products = [{ id: 1, productName: 'Product A' }];

		let state = CustomerInvoiceReducer(initialState, {
			type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
			payload: { data: invoices },
		});

		state = CustomerInvoiceReducer(state, {
			type: CUSTOMER_INVOICE.CUSTOMER_LIST,
			payload: { data: customers },
		});

		state = CustomerInvoiceReducer(state, {
			type: CUSTOMER_INVOICE.PRODUCT_LIST,
			payload: { data: products },
		});

		expect(state.customer_invoice_list).toEqual(invoices);
		expect(state.customer_list).toEqual(customers);
		expect(state.product_list).toEqual(products);
	});

	it('should override previous data when same action is dispatched', () => {
		const firstInvoices = [{ id: 1, invoiceNumber: 'CI-001' }];
		const secondInvoices = [
			{ id: 2, invoiceNumber: 'CI-002' },
			{ id: 3, invoiceNumber: 'CI-003' },
		];

		let state = CustomerInvoiceReducer(initialState, {
			type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
			payload: { data: firstInvoices },
		});

		state = CustomerInvoiceReducer(state, {
			type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
			payload: { data: secondInvoices },
		});

		expect(state.customer_invoice_list).toEqual(secondInvoices);
		expect(state.customer_invoice_list.length).toBe(2);
	});

	it('should maintain other state properties when updating one', () => {
		const stateWithData = {
			...initialState,
			customer_invoice_list: [{ id: 1 }],
			customer_list: [{ customerId: 1 }],
		};

		const newProducts = [{ id: 1, productName: 'New Product' }];

		const state = CustomerInvoiceReducer(stateWithData, {
			type: CUSTOMER_INVOICE.PRODUCT_LIST,
			payload: { data: newProducts },
		});

		expect(state.customer_invoice_list).toEqual(
			stateWithData.customer_invoice_list
		);
		expect(state.customer_list).toEqual(stateWithData.customer_list);
		expect(state.product_list).toEqual(newProducts);
	});
});
