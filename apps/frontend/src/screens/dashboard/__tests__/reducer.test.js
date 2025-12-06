import DashboardReducer from '../reducer';
import { DASHBOARD } from 'constants/types';

describe('Dashboard Reducer', () => {
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

	it('should handle BANK_ACCOUNT_TYPE action', () => {
		const payload = [
			{ id: 1, name: 'Savings Account' },
			{ id: 2, name: 'Current Account' },
		];
		const action = {
			type: DASHBOARD.BANK_ACCOUNT_TYPE,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.bank_account_type).toEqual(payload);
		expect(newState.bank_account_type).toHaveLength(2);
	});

	it('should handle BANK_ACCOUNT_GRAPH action', () => {
		const payload = {
			labels: ['Jan', 'Feb', 'Mar'],
			data: [1000, 2000, 3000],
		};
		const action = {
			type: DASHBOARD.BANK_ACCOUNT_GRAPH,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.bank_account_graph).toEqual(payload);
		expect(newState.bank_account_graph.labels).toHaveLength(3);
	});

	it('should handle CASH_FLOW_GRAPH action', () => {
		const payload = {
			inflow: [5000, 6000, 7000],
			outflow: [3000, 4000, 5000],
		};
		const action = {
			type: DASHBOARD.CASH_FLOW_GRAPH,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.cash_flow_graph).toEqual(payload);
		expect(newState.cash_flow_graph.inflow).toHaveLength(3);
	});

	it('should handle INVOICE_GRAPH action', () => {
		const payload = {
			paid: 10,
			unpaid: 5,
			overdue: 2,
		};
		const action = {
			type: DASHBOARD.INVOICE_GRAPH,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.invoice_graph).toEqual(payload);
		expect(newState.invoice_graph.paid).toBe(10);
	});

	it('should handle PROFIT_LOSS action', () => {
		const payload = {
			profit: 50000,
			loss: 20000,
			netProfit: 30000,
		};
		const action = {
			type: DASHBOARD.PROFIT_LOSS,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.proft_loss).toEqual(payload);
		expect(newState.proft_loss.netProfit).toBe(30000);
	});

	it('should handle TAXES action', () => {
		const payload = {
			totalVAT: 5000,
			totalTax: 7000,
		};
		const action = {
			type: DASHBOARD.TAXES,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.taxes).toEqual(payload);
	});

	it('should handle REVENUE_GRAPH action', () => {
		const payload = [
			{ month: 'Jan', amount: 10000 },
			{ month: 'Feb', amount: 15000 },
		];
		const action = {
			type: DASHBOARD.REVENUE_GRAPH,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.revenue_graph).toEqual(payload);
		expect(newState.revenue_graph).toHaveLength(2);
	});

	it('should handle EXPENSE_GRAPH action', () => {
		const payload = [
			{ category: 'Office', amount: 5000 },
			{ category: 'Utilities', amount: 3000 },
		];
		const action = {
			type: DASHBOARD.EXPENSE_GRAPH,
			payload,
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.expense_graph).toEqual(payload);
		expect(newState.expense_graph).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const payload = [{ id: 1, name: 'Test Account' }];
		const action = {
			type: DASHBOARD.BANK_ACCOUNT_TYPE,
			payload,
		};

		const stateBefore = { ...initialState };
		DashboardReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple sequential actions correctly', () => {
		const bankAccountAction = {
			type: DASHBOARD.BANK_ACCOUNT_TYPE,
			payload: [{ id: 1, name: 'Account 1' }],
		};

		const taxAction = {
			type: DASHBOARD.TAXES,
			payload: { totalVAT: 1000 },
		};

		let state = DashboardReducer(initialState, bankAccountAction);
		state = DashboardReducer(state, taxAction);

		expect(state.bank_account_type).toHaveLength(1);
		expect(state.taxes.totalVAT).toBe(1000);
	});

	it('should preserve other state properties when updating one property', () => {
		const stateWithData = {
			...initialState,
			revenue_graph: [{ month: 'Jan', amount: 5000 }],
		};

		const action = {
			type: DASHBOARD.EXPENSE_GRAPH,
			payload: [{ category: 'Travel', amount: 2000 }],
		};

		const newState = DashboardReducer(stateWithData, action);

		expect(newState.revenue_graph).toHaveLength(1);
		expect(newState.expense_graph).toHaveLength(1);
	});

	it('should handle empty array payload', () => {
		const action = {
			type: DASHBOARD.REVENUE_GRAPH,
			payload: [],
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.revenue_graph).toEqual([]);
		expect(newState.revenue_graph).toHaveLength(0);
	});

	it('should handle empty object payload', () => {
		const action = {
			type: DASHBOARD.CASH_FLOW_GRAPH,
			payload: {},
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState.cash_flow_graph).toEqual({});
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = DashboardReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});
});
