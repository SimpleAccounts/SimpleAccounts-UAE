import ReportsReducer from './reducer';
import { REPORTS } from 'constants/types';

describe('ReportsReducer', () => {
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

    describe('COMPANY_PROFILE', () => {
        it('should handle COMPANY_PROFILE action', () => {
            const payload = { data: [{ name: 'Test Company', address: '123 Main St' }] };
            const action = { type: REPORTS.COMPANY_PROFILE, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.company_profile).toEqual(payload.data);
        });
    });

    describe('SALES_BY_CUSTOMER', () => {
        it('should handle SALES_BY_CUSTOMER action', () => {
            const payload = {
                data: [
                    { customerId: 1, customerName: 'Customer A', totalSales: 50000 },
                    { customerId: 2, customerName: 'Customer B', totalSales: 30000 },
                ],
            };
            const action = { type: REPORTS.SALES_BY_CUSTOMER, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.sales_by_customer).toEqual(payload.data);
            expect(newState.sales_by_customer).toHaveLength(2);
        });

        it('should handle empty sales data', () => {
            const payload = { data: [] };
            const action = { type: REPORTS.SALES_BY_CUSTOMER, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.sales_by_customer).toEqual([]);
        });
    });

    describe('SALES_BY_ITEM', () => {
        it('should handle SALES_BY_ITEM action', () => {
            const payload = {
                data: [
                    { productId: 1, productName: 'Product A', quantitySold: 100, revenue: 10000 },
                    { productId: 2, productName: 'Product B', quantitySold: 50, revenue: 5000 },
                ],
            };
            const action = { type: REPORTS.SALES_BY_ITEM, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.sales_by_item).toEqual(payload.data);
        });
    });

    describe('PURCHASE_BY_VENDOR', () => {
        it('should handle PURCHASE_BY_VENDOR action', () => {
            const payload = {
                data: [
                    { vendorId: 1, vendorName: 'Vendor A', totalPurchases: 25000 },
                    { vendorId: 2, vendorName: 'Vendor B', totalPurchases: 15000 },
                ],
            };
            const action = { type: REPORTS.PURCHASE_BY_VENDOR, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.purchase_by_vendor).toEqual(payload.data);
        });
    });

    describe('PURCHASE_BY_ITEM', () => {
        it('should handle PURCHASE_BY_ITEM action', () => {
            const payload = {
                data: [
                    { itemId: 1, itemName: 'Raw Material A', quantityPurchased: 500, cost: 5000 },
                ],
            };
            const action = { type: REPORTS.PURCHASE_BY_ITEM, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.purchase_by_item).toEqual(payload.data);
        });
    });

    describe('RECEIVABLE_INVOICE', () => {
        it('should handle RECEIVABLE_INVOICE action', () => {
            const payload = {
                data: [
                    { invoiceId: 1, customerName: 'Customer A', amount: 5000, dueDate: '2024-01-15' },
                    { invoiceId: 2, customerName: 'Customer B', amount: 3000, dueDate: '2024-01-20' },
                ],
            };
            const action = { type: REPORTS.RECEIVABLE_INVOICE, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.receivable_invoice).toEqual(payload.data);
        });

        it('should replace existing receivable data', () => {
            const existingState = {
                ...initialState,
                receivable_invoice: [{ invoiceId: 99 }],
            };
            const payload = { data: [{ invoiceId: 1 }] };
            const action = { type: REPORTS.RECEIVABLE_INVOICE, payload };
            const newState = ReportsReducer(existingState, action);
            expect(newState.receivable_invoice).toEqual([{ invoiceId: 1 }]);
        });
    });

    describe('PAYABLE_INVOICE', () => {
        it('should handle PAYABLE_INVOICE action', () => {
            const payload = {
                data: [
                    { invoiceId: 1, vendorName: 'Vendor A', amount: 10000, dueDate: '2024-02-01' },
                ],
            };
            const action = { type: REPORTS.PAYABLE_INVOICE, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.payable_invoice).toEqual(payload.data);
        });
    });

    describe('CREDITNOTE_DETAILS', () => {
        it('should handle CREDITNOTE_DETAILS action', () => {
            const payload = {
                data: [
                    { creditNoteId: 1, customerName: 'Customer A', amount: 500, reason: 'Return' },
                ],
            };
            const action = { type: REPORTS.CREDITNOTE_DETAILS, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.creditnote_details).toEqual(payload.data);
        });
    });

    describe('SETTING_LIST', () => {
        it('should handle SETTING_LIST action', () => {
            const payload = {
                data: [
                    { settingId: 1, name: 'Report Format', value: 'PDF' },
                    { settingId: 2, name: 'Date Range', value: 'Monthly' },
                ],
            };
            const action = { type: REPORTS.SETTING_LIST, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.setting_list).toEqual(payload.data);
        });
    });

    describe('PAYMENT_HISTORY', () => {
        it('should handle PAYMENT_HISTORY action', () => {
            const payload = {
                data: [
                    { paymentId: 1, date: '2024-01-01', amount: 5000, method: 'Bank Transfer' },
                    { paymentId: 2, date: '2024-01-05', amount: 3000, method: 'Cash' },
                ],
            };
            const action = { type: REPORTS.PAYMENT_HISTORY, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.payment_history).toEqual(payload.data);
        });
    });

    describe('CTREPORT_LIST', () => {
        it('should handle CTREPORT_LIST action', () => {
            const payload = {
                data: [
                    { reportId: 1, name: 'Corporate Tax Report Q1', status: 'Filed' },
                ],
            };
            const action = { type: REPORTS.CTREPORT_LIST, payload };
            const newState = ReportsReducer(initialState, action);
            expect(newState.ctReport_list).toEqual(payload.data);
        });
    });

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION', payload: { data: [] } };
            const newState = ReportsReducer(initialState, action);
            expect(newState).toEqual(initialState);
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            const payload = { data: [{ id: 1 }] };
            const action = { type: REPORTS.SALES_BY_CUSTOMER, payload };
            ReportsReducer(originalState, action);
            expect(originalState.sales_by_customer).toEqual([]);
        });

        it('should preserve other state properties when updating', () => {
            const stateWithData = {
                ...initialState,
                sales_by_customer: [{ id: 1 }],
                receivable_invoice: [{ id: 2 }],
            };
            const payload = { data: [{ id: 3 }] };
            const action = { type: REPORTS.PURCHASE_BY_VENDOR, payload };
            const newState = ReportsReducer(stateWithData, action);
            expect(newState.sales_by_customer).toEqual([{ id: 1 }]);
            expect(newState.receivable_invoice).toEqual([{ id: 2 }]);
            expect(newState.purchase_by_vendor).toEqual([{ id: 3 }]);
        });
    });
});
