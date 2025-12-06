import SupplierInvoiceReducer from '../reducer';
import { SUPPLIER_INVOICE } from 'constants/types';

describe('SupplierInvoiceReducer', () => {
	const initialState = {
		supplier_invoice_list: [],
		project_list: [],
		contact_list: [],
		status_list: [],
		currency_list: [],
		vat_list: [],
		excise_list: [],
		product_list: [],
		supplier_list: [],
		country_list: [],
		deposit_list: [],
		pay_mode: [],
	};

	it('should return the initial state', () => {
		expect(SupplierInvoiceReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST', () => {
		const mockInvoices = [
			{ id: 1, invoiceNumber: 'INV-001', amount: 5000 },
			{ id: 2, invoiceNumber: 'INV-002', amount: 3000 },
		];

		const action = {
			type: SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST,
			payload: { data: mockInvoices },
		};

		const expectedState = {
			...initialState,
			supplier_invoice_list: mockInvoices,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.PROJECT_LIST', () => {
		const mockProjects = [
			{ id: 1, projectName: 'Project A', status: 'active' },
			{ id: 2, projectName: 'Project B', status: 'pending' },
		];

		const action = {
			type: SUPPLIER_INVOICE.PROJECT_LIST,
			payload: { data: mockProjects },
		};

		const expectedState = {
			...initialState,
			project_list: mockProjects,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.CONTACT_LIST', () => {
		const mockContacts = [
			{ contactId: 1, firstName: 'John', lastName: 'Doe' },
			{ contactId: 2, firstName: 'Jane', lastName: 'Smith' },
		];

		const action = {
			type: SUPPLIER_INVOICE.CONTACT_LIST,
			payload: { data: mockContacts },
		};

		const expectedState = {
			...initialState,
			contact_list: mockContacts,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.STATUS_LIST', () => {
		const mockStatuses = [
			{ id: 1, name: 'Draft' },
			{ id: 2, name: 'Approved' },
			{ id: 3, name: 'Paid' },
		];

		const action = {
			type: SUPPLIER_INVOICE.STATUS_LIST,
			payload: { data: mockStatuses },
		};

		const expectedState = {
			...initialState,
			status_list: mockStatuses,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'USD', name: 'US Dollar', symbol: '$' },
			{ code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
		];

		const action = {
			type: SUPPLIER_INVOICE.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.SUPPLIER_LIST', () => {
		const mockSuppliers = [
			{ id: 1, name: 'Supplier A', email: 'supplierA@example.com' },
			{ id: 2, name: 'Supplier B', email: 'supplierB@example.com' },
		];

		const action = {
			type: SUPPLIER_INVOICE.SUPPLIER_LIST,
			payload: { data: mockSuppliers },
		};

		const expectedState = {
			...initialState,
			supplier_list: mockSuppliers,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.VAT_LIST', () => {
		const mockVatList = [
			{ id: 1, name: 'Standard Rate', percentage: 5 },
			{ id: 2, name: 'Zero Rate', percentage: 0 },
		];

		const action = {
			type: SUPPLIER_INVOICE.VAT_LIST,
			payload: { data: mockVatList },
		};

		const expectedState = {
			...initialState,
			vat_list: mockVatList,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.EXCISE_LIST', () => {
		const mockExciseList = [
			{ id: 1, name: 'Excise Tax A', rate: 50 },
			{ id: 2, name: 'Excise Tax B', rate: 100 },
		];

		const action = {
			type: SUPPLIER_INVOICE.EXCISE_LIST,
			payload: { data: mockExciseList },
		};

		const expectedState = {
			...initialState,
			excise_list: mockExciseList,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.PAY_MODE', () => {
		const mockPayModes = [
			{ id: 1, label: 'Cash', value: 'cash' },
			{ id: 2, label: 'Card', value: 'card' },
			{ id: 3, label: 'Bank Transfer', value: 'bank_transfer' },
		];

		const action = {
			type: SUPPLIER_INVOICE.PAY_MODE,
			payload: { data: mockPayModes },
		};

		const expectedState = {
			...initialState,
			pay_mode: mockPayModes,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.PRODUCT_LIST', () => {
		const mockProducts = [
			{ id: 1, productName: 'Product A', price: 100 },
			{ id: 2, productName: 'Product B', price: 200 },
		];

		const action = {
			type: SUPPLIER_INVOICE.PRODUCT_LIST,
			payload: { data: mockProducts },
		};

		const expectedState = {
			...initialState,
			product_list: mockProducts,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.DEPOSIT_LIST', () => {
		const mockDeposits = [
			{ id: 1, depositAmount: 1000, date: '2023-12-01' },
			{ id: 2, depositAmount: 2000, date: '2023-12-02' },
		];

		const action = {
			type: SUPPLIER_INVOICE.DEPOSIT_LIST,
			payload: { data: mockDeposits },
		};

		const expectedState = {
			...initialState,
			deposit_list: mockDeposits,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle SUPPLIER_INVOICE.COUNTRY_LIST', () => {
		const mockCountries = [
			{ code: 'US', name: 'United States' },
			{ code: 'AE', name: 'United Arab Emirates' },
		];

		const action = {
			type: SUPPLIER_INVOICE.COUNTRY_LIST,
			payload: mockCountries,
		};

		const expectedState = {
			...initialState,
			country_list: mockCountries,
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { data: 'some data' },
		};

		expect(SupplierInvoiceReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state', () => {
		const mockInvoices = [{ id: 1, invoiceNumber: 'INV-001' }];
		const action = {
			type: SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST,
			payload: { data: mockInvoices },
		};

		const stateBefore = { ...initialState };
		SupplierInvoiceReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple actions in sequence', () => {
		const invoices = [{ id: 1, invoiceNumber: 'INV-001' }];
		const projects = [{ id: 1, projectName: 'Project A' }];
		const suppliers = [{ id: 1, name: 'Supplier A' }];

		let state = SupplierInvoiceReducer(initialState, {
			type: SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST,
			payload: { data: invoices },
		});

		state = SupplierInvoiceReducer(state, {
			type: SUPPLIER_INVOICE.PROJECT_LIST,
			payload: { data: projects },
		});

		state = SupplierInvoiceReducer(state, {
			type: SUPPLIER_INVOICE.SUPPLIER_LIST,
			payload: { data: suppliers },
		});

		expect(state.supplier_invoice_list).toEqual(invoices);
		expect(state.project_list).toEqual(projects);
		expect(state.supplier_list).toEqual(suppliers);
	});

	it('should override previous data when same action is dispatched', () => {
		const firstInvoices = [{ id: 1, invoiceNumber: 'INV-001' }];
		const secondInvoices = [
			{ id: 2, invoiceNumber: 'INV-002' },
			{ id: 3, invoiceNumber: 'INV-003' },
		];

		let state = SupplierInvoiceReducer(initialState, {
			type: SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST,
			payload: { data: firstInvoices },
		});

		state = SupplierInvoiceReducer(state, {
			type: SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST,
			payload: { data: secondInvoices },
		});

		expect(state.supplier_invoice_list).toEqual(secondInvoices);
		expect(state.supplier_invoice_list.length).toBe(2);
	});
});
