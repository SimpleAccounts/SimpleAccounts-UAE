import RequestForQuotationReducer from './reducer';
import { QUOTATION } from 'constants/types';

describe('RequestForQuotationReducer', () => {
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

    describe('PROJECT_LIST', () => {
        it('should handle PROJECT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Project Alpha', status: 'Active' },
                    { id: 2, name: 'Project Beta', status: 'Completed' },
                ],
            };
            const action = { type: QUOTATION.PROJECT_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.project_list).toEqual(payload.data);
        });
    });

    describe('CONTACT_LIST', () => {
        it('should handle CONTACT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Contact A', email: 'a@test.com' },
                    { id: 2, name: 'Contact B', email: 'b@test.com' },
                ],
            };
            const action = { type: QUOTATION.CONTACT_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.contact_list).toEqual(payload.data);
        });
    });

    describe('STATUS_LIST', () => {
        it('should handle STATUS_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Draft' },
                    { id: 2, name: 'Sent' },
                    { id: 3, name: 'Accepted' },
                    { id: 4, name: 'Rejected' },
                ],
            };
            const action = { type: QUOTATION.STATUS_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.status_list).toEqual(payload.data);
            expect(newState.status_list).toHaveLength(4);
        });
    });

    describe('CURRENCY_LIST', () => {
        it('should handle CURRENCY_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, code: 'AED', name: 'UAE Dirham' },
                    { id: 2, code: 'USD', name: 'US Dollar' },
                ],
            };
            const action = { type: QUOTATION.CURRENCY_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.currency_list).toEqual(payload.data);
        });
    });

    describe('SUPPLIER_LIST', () => {
        it('should handle SUPPLIER_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Supplier X', contactPerson: 'John' },
                    { id: 2, name: 'Supplier Y', contactPerson: 'Jane' },
                ],
            };
            const action = { type: QUOTATION.SUPPLIER_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.supplier_list).toEqual(payload.data);
        });
    });

    describe('VAT_LIST', () => {
        it('should handle VAT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Standard Rate', percentage: 5 },
                    { id: 2, name: 'Zero Rate', percentage: 0 },
                    { id: 3, name: 'Exempt', percentage: 0 },
                ],
            };
            const action = { type: QUOTATION.VAT_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.vat_list).toEqual(payload.data);
        });
    });

    describe('EXCISE_LIST', () => {
        it('should handle EXCISE_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Tobacco', rate: 100 },
                    { id: 2, name: 'Carbonated Drinks', rate: 50 },
                ],
            };
            const action = { type: QUOTATION.EXCISE_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.excise_list).toEqual(payload.data);
        });
    });

    describe('PAY_MODE', () => {
        it('should handle PAY_MODE action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Cash' },
                    { id: 2, name: 'Bank Transfer' },
                    { id: 3, name: 'Credit Card' },
                    { id: 4, name: 'Cheque' },
                ],
            };
            const action = { type: QUOTATION.PAY_MODE, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.pay_mode).toEqual(payload.data);
        });
    });

    describe('PRODUCT_LIST', () => {
        it('should handle PRODUCT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, name: 'Product A', price: 100, sku: 'SKU-001' },
                    { id: 2, name: 'Product B', price: 200, sku: 'SKU-002' },
                ],
            };
            const action = { type: QUOTATION.PRODUCT_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.product_list).toEqual(payload.data);
        });
    });

    describe('DEPOSIT_LIST', () => {
        it('should handle DEPOSIT_LIST action', () => {
            const payload = {
                data: [
                    { id: 1, accountName: 'Main Account', balance: 50000 },
                ],
            };
            const action = { type: QUOTATION.DEPOSIT_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.deposit_list).toEqual(payload.data);
        });
    });

    describe('COUNTRY_LIST', () => {
        it('should handle COUNTRY_LIST action', () => {
            const payload = [
                { id: 1, name: 'United Arab Emirates', code: 'AE' },
                { id: 2, name: 'Saudi Arabia', code: 'SA' },
            ];
            const action = { type: QUOTATION.COUNTRY_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.country_list).toEqual(payload);
        });
    });

    describe('QUOTATION_LIST', () => {
        it('should handle QUOTATION_LIST action', () => {
            const payload = [
                { id: 1, quotationNumber: 'QT-001', amount: 5000, status: 'Draft' },
                { id: 2, quotationNumber: 'QT-002', amount: 8000, status: 'Sent' },
            ];
            const action = { type: QUOTATION.QUOTATION_LIST, payload };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState.quotation_list).toEqual(payload);
        });

        it('should replace existing quotation list', () => {
            const existingState = {
                ...initialState,
                quotation_list: [{ id: 99 }],
            };
            const payload = [{ id: 1 }];
            const action = { type: QUOTATION.QUOTATION_LIST, payload };
            const newState = RequestForQuotationReducer(existingState, action);
            expect(newState.quotation_list).toEqual(payload);
        });
    });

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION', payload: { data: [] } };
            const newState = RequestForQuotationReducer(initialState, action);
            expect(newState).toEqual(initialState);
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            const payload = { data: [{ id: 1 }] };
            const action = { type: QUOTATION.PROJECT_LIST, payload };
            RequestForQuotationReducer(originalState, action);
            expect(originalState.project_list).toEqual([]);
        });

        it('should preserve other state properties when updating', () => {
            const stateWithData = {
                ...initialState,
                project_list: [{ id: 1 }],
                currency_list: [{ id: 2 }],
            };
            const payload = { data: [{ id: 3 }] };
            const action = { type: QUOTATION.VAT_LIST, payload };
            const newState = RequestForQuotationReducer(stateWithData, action);
            expect(newState.project_list).toEqual([{ id: 1 }]);
            expect(newState.currency_list).toEqual([{ id: 2 }]);
            expect(newState.vat_list).toEqual([{ id: 3 }]);
        });
    });
});
