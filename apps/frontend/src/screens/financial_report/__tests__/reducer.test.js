import ReportsReducer from '../reducer';
import { REPORTS } from 'constants/types';

describe('Financial Report Reducer', () => {
	const initialState = {
		sales_by_customer: [],
		sales_by_item: [],
		purchase_by_vendor: [],
		purchase_by_item: [],
		company_profile: [],
		receivable_invoice: [],
		payable_invoice: [],
		creditnote_details: [],
		setting_list: [],
		payment_history: [],
		ctReport_list: [],
	};

	it('should return the initial state', () => {
		expect(ReportsReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle REPORTS.COMPANY_PROFILE action', () => {
		const mockCompanyData = [
			{
				id: 1,
				name: 'Test Company',
				address: '123 Business Street',
				taxNumber: 'TRN123456',
			},
		];

		const action = {
			type: REPORTS.COMPANY_PROFILE,
			payload: { data: mockCompanyData },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.company_profile).toEqual(mockCompanyData);
		expect(newState.company_profile).toHaveLength(1);
	});

	it('should handle REPORTS.SALES_BY_CUSTOMER action', () => {
		const mockSalesData = [
			{ customerId: 1, customerName: 'Customer A', totalSales: 50000 },
			{ customerId: 2, customerName: 'Customer B', totalSales: 75000 },
		];

		const action = {
			type: REPORTS.SALES_BY_CUSTOMER,
			payload: { data: mockSalesData },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.sales_by_customer).toEqual(mockSalesData);
		expect(newState.sales_by_customer).toHaveLength(2);
	});

	it('should handle REPORTS.SALES_BY_ITEM action', () => {
		const mockItemSales = [
			{ itemId: 1, itemName: 'Product A', quantity: 100, revenue: 10000 },
			{ itemId: 2, itemName: 'Product B', quantity: 50, revenue: 7500 },
		];

		const action = {
			type: REPORTS.SALES_BY_ITEM,
			payload: { data: mockItemSales },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.sales_by_item).toEqual(mockItemSales);
		expect(newState.sales_by_item).toHaveLength(2);
	});

	it('should handle REPORTS.PURCHASE_BY_VENDOR action', () => {
		const mockPurchaseData = [
			{ vendorId: 1, vendorName: 'Vendor A', totalPurchase: 25000 },
			{ vendorId: 2, vendorName: 'Vendor B', totalPurchase: 30000 },
		];

		const action = {
			type: REPORTS.PURCHASE_BY_VENDOR,
			payload: { data: mockPurchaseData },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.purchase_by_vendor).toEqual(mockPurchaseData);
		expect(newState.purchase_by_vendor).toHaveLength(2);
	});

	it('should handle REPORTS.PURCHASE_BY_ITEM action', () => {
		const mockItemPurchase = [
			{ itemId: 1, itemName: 'Item A', quantity: 200, cost: 20000 },
			{ itemId: 2, itemName: 'Item B', quantity: 150, cost: 15000 },
		];

		const action = {
			type: REPORTS.PURCHASE_BY_ITEM,
			payload: { data: mockItemPurchase },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.purchase_by_item).toEqual(mockItemPurchase);
		expect(newState.purchase_by_item).toHaveLength(2);
	});

	it('should handle REPORTS.RECEIVABLE_INVOICE action', () => {
		const mockReceivables = [
			{ invoiceId: 1, customer: 'Customer A', amount: 5000, dueDate: '2024-12-31' },
			{ invoiceId: 2, customer: 'Customer B', amount: 3000, dueDate: '2024-11-30' },
		];

		const action = {
			type: REPORTS.RECEIVABLE_INVOICE,
			payload: { data: mockReceivables },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.receivable_invoice).toEqual(mockReceivables);
		expect(newState.receivable_invoice).toHaveLength(2);
	});

	it('should handle REPORTS.PAYABLE_INVOICE action', () => {
		const mockPayables = [
			{ invoiceId: 1, vendor: 'Vendor A', amount: 8000, dueDate: '2024-12-15' },
			{ invoiceId: 2, vendor: 'Vendor B', amount: 6000, dueDate: '2024-12-20' },
		];

		const action = {
			type: REPORTS.PAYABLE_INVOICE,
			payload: { data: mockPayables },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.payable_invoice).toEqual(mockPayables);
		expect(newState.payable_invoice).toHaveLength(2);
	});

	it('should handle REPORTS.CREDITNOTE_DETAILS action', () => {
		const mockCreditNotes = [
			{ noteId: 1, customer: 'Customer A', amount: 1000, reason: 'Return' },
			{ noteId: 2, customer: 'Customer B', amount: 500, reason: 'Discount' },
		];

		const action = {
			type: REPORTS.CREDITNOTE_DETAILS,
			payload: { data: mockCreditNotes },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.creditnote_details).toEqual(mockCreditNotes);
		expect(newState.creditnote_details).toHaveLength(2);
	});

	it('should handle REPORTS.SETTING_LIST action', () => {
		const mockSettings = [
			{ id: 1, settingName: 'VAT Rate', value: '5%' },
			{ id: 2, settingName: 'Currency', value: 'AED' },
		];

		const action = {
			type: REPORTS.SETTING_LIST,
			payload: { data: mockSettings },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.setting_list).toEqual(mockSettings);
		expect(newState.setting_list).toHaveLength(2);
	});

	it('should handle REPORTS.PAYMENT_HISTORY action', () => {
		const mockPaymentHistory = [
			{ paymentId: 1, date: '2024-01-15', amount: 5000, method: 'Bank Transfer' },
			{ paymentId: 2, date: '2024-02-20', amount: 3000, method: 'Cash' },
		];

		const action = {
			type: REPORTS.PAYMENT_HISTORY,
			payload: { data: mockPaymentHistory },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.payment_history).toEqual(mockPaymentHistory);
		expect(newState.payment_history).toHaveLength(2);
	});

	it('should handle REPORTS.CTREPORT_LIST action', () => {
		const mockCTReports = [
			{ reportId: 1, period: 'Q1 2024', status: 'Filed' },
			{ reportId: 2, period: 'Q2 2024', status: 'Pending' },
		];

		const action = {
			type: REPORTS.CTREPORT_LIST,
			payload: { data: mockCTReports },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.ctReport_list).toEqual(mockCTReports);
		expect(newState.ctReport_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: REPORTS.SALES_BY_CUSTOMER,
			payload: { data: [{ customerId: 1, customerName: 'Test' }] },
		};

		const stateBefore = { ...initialState };
		ReportsReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_REPORT_ACTION',
			payload: { data: [] },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			...initialState,
			sales_by_customer: [{ customerId: 1, customerName: 'Old Customer' }],
		};

		const action = {
			type: REPORTS.SALES_BY_CUSTOMER,
			payload: { data: [{ customerId: 2, customerName: 'New Customer' }] },
		};

		const newState = ReportsReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.sales_by_customer).not.toBe(currentState.sales_by_customer);
	});

	it('should preserve state shape after all actions', () => {
		const action = {
			type: REPORTS.COMPANY_PROFILE,
			payload: { data: [{ id: 1 }] },
		};

		const newState = ReportsReducer(initialState, action);

		expect(Object.keys(newState)).toHaveLength(11);
		expect(newState).toHaveProperty('sales_by_customer');
		expect(newState).toHaveProperty('sales_by_item');
		expect(newState).toHaveProperty('purchase_by_vendor');
		expect(newState).toHaveProperty('purchase_by_item');
		expect(newState).toHaveProperty('company_profile');
		expect(newState).toHaveProperty('receivable_invoice');
		expect(newState).toHaveProperty('payable_invoice');
		expect(newState).toHaveProperty('creditnote_details');
		expect(newState).toHaveProperty('setting_list');
		expect(newState).toHaveProperty('payment_history');
		expect(newState).toHaveProperty('ctReport_list');
	});

	it('should handle empty data arrays', () => {
		const action = {
			type: REPORTS.SALES_BY_CUSTOMER,
			payload: { data: [] },
		};

		const newState = ReportsReducer(initialState, action);

		expect(newState.sales_by_customer).toEqual([]);
		expect(newState.sales_by_customer).toHaveLength(0);
	});
});
