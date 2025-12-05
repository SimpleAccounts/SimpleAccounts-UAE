import DashboardReducer from './reducer';
import { DASHBOARD } from 'constants/types';

describe('DashboardReducer', () => {
    const initialState = {
        bank_account_type: [],
        bank_account_graph: {},
        cash_flow_graph: {},
        invoice_graph: {},
        proft_loss: {},
        revenue_graph: [],
        expense_graph: [],
        taxes: [],
    };

    it('should return the initial state', () => {
        expect(DashboardReducer(undefined, {})).toEqual(initialState);
    });

    describe('BANK_ACCOUNT_TYPE', () => {
        it('should handle BANK_ACCOUNT_TYPE action', () => {
            const payload = [
                { id: 1, name: 'Checking', balance: 5000 },
                { id: 2, name: 'Savings', balance: 10000 },
            ];
            const action = { type: DASHBOARD.BANK_ACCOUNT_TYPE, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.bank_account_type).toEqual(payload);
        });

        it('should replace existing bank_account_type data', () => {
            const existingState = { ...initialState, bank_account_type: [{ id: 1 }] };
            const payload = [{ id: 2, name: 'New Account' }];
            const action = { type: DASHBOARD.BANK_ACCOUNT_TYPE, payload };
            const newState = DashboardReducer(existingState, action);
            expect(newState.bank_account_type).toEqual(payload);
        });
    });

    describe('BANK_ACCOUNT_GRAPH', () => {
        it('should handle BANK_ACCOUNT_GRAPH action', () => {
            const payload = {
                labels: ['Jan', 'Feb', 'Mar'],
                data: [1000, 2000, 3000],
            };
            const action = { type: DASHBOARD.BANK_ACCOUNT_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.bank_account_graph).toEqual(payload);
        });

        it('should handle empty graph data', () => {
            const payload = {};
            const action = { type: DASHBOARD.BANK_ACCOUNT_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.bank_account_graph).toEqual({});
        });
    });

    describe('CASH_FLOW_GRAPH', () => {
        it('should handle CASH_FLOW_GRAPH action', () => {
            const payload = {
                inflow: [5000, 6000, 7000],
                outflow: [3000, 4000, 2000],
                months: ['Jan', 'Feb', 'Mar'],
            };
            const action = { type: DASHBOARD.CASH_FLOW_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.cash_flow_graph).toEqual(payload);
        });
    });

    describe('INVOICE_GRAPH', () => {
        it('should handle INVOICE_GRAPH action', () => {
            const payload = {
                paid: 50,
                pending: 30,
                overdue: 20,
            };
            const action = { type: DASHBOARD.INVOICE_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.invoice_graph).toEqual(payload);
        });
    });

    describe('PROFIT_LOSS', () => {
        it('should handle PROFIT_LOSS action', () => {
            const payload = {
                revenue: 100000,
                expenses: 75000,
                netProfit: 25000,
            };
            const action = { type: DASHBOARD.PROFIT_LOSS, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.proft_loss).toEqual(payload);
        });

        it('should handle negative profit scenario', () => {
            const payload = {
                revenue: 50000,
                expenses: 75000,
                netProfit: -25000,
            };
            const action = { type: DASHBOARD.PROFIT_LOSS, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.proft_loss.netProfit).toBe(-25000);
        });
    });

    describe('TAXES', () => {
        it('should handle TAXES action', () => {
            const payload = {
                vatCollected: 5000,
                vatPaid: 3000,
                netVat: 2000,
            };
            const action = { type: DASHBOARD.TAXES, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.taxes).toEqual(payload);
        });
    });

    describe('REVENUE_GRAPH', () => {
        it('should handle REVENUE_GRAPH action', () => {
            const payload = [
                { month: 'Jan', revenue: 10000 },
                { month: 'Feb', revenue: 12000 },
                { month: 'Mar', revenue: 15000 },
            ];
            const action = { type: DASHBOARD.REVENUE_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.revenue_graph).toEqual(payload);
        });

        it('should handle empty revenue data', () => {
            const payload = [];
            const action = { type: DASHBOARD.REVENUE_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.revenue_graph).toEqual([]);
        });
    });

    describe('EXPENSE_GRAPH', () => {
        it('should handle EXPENSE_GRAPH action', () => {
            const payload = [
                { category: 'Salaries', amount: 50000 },
                { category: 'Rent', amount: 10000 },
                { category: 'Utilities', amount: 5000 },
            ];
            const action = { type: DASHBOARD.EXPENSE_GRAPH, payload };
            const newState = DashboardReducer(initialState, action);
            expect(newState.expense_graph).toEqual(payload);
        });
    });

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION', payload: {} };
            const newState = DashboardReducer(initialState, action);
            expect(newState).toEqual(initialState);
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            const payload = [{ id: 1 }];
            const action = { type: DASHBOARD.BANK_ACCOUNT_TYPE, payload };
            DashboardReducer(originalState, action);
            expect(originalState.bank_account_type).toEqual([]);
        });

        it('should preserve other state properties when updating', () => {
            const stateWithData = {
                ...initialState,
                bank_account_type: [{ id: 1 }],
                invoice_graph: { paid: 10 },
            };
            const payload = { inflow: [1000] };
            const action = { type: DASHBOARD.CASH_FLOW_GRAPH, payload };
            const newState = DashboardReducer(stateWithData, action);
            expect(newState.bank_account_type).toEqual([{ id: 1 }]);
            expect(newState.invoice_graph).toEqual({ paid: 10 });
            expect(newState.cash_flow_graph).toEqual(payload);
        });
    });
});
