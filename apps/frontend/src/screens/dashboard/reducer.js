import { DASHBOARD } from 'constants/types';

const initState = {
	bank_account_type: [],
	bank_account_graph: {},
	cash_flow_graph: {},
	invoice_graph: {},
	proft_loss: {},
	revenue_graph: [],
	expense_graph: [],
	taxes: [],
};

const DashboardReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		// Bank Account
		case DASHBOARD.BANK_ACCOUNT_TYPE:
			return {
				...state,
				bank_account_type: Object.assign([], payload),
			};

		case DASHBOARD.BANK_ACCOUNT_GRAPH:
			return {
				...state,
				bank_account_graph: Object.assign({}, payload),
			};

		// Cash Flow
		case DASHBOARD.CASH_FLOW_GRAPH:
			return {
				...state,
				cash_flow_graph: Object.assign({}, payload),
			};

		// Invoice
		case DASHBOARD.INVOICE_GRAPH:
			return {
				...state,
				invoice_graph: Object.assign({}, payload),
			};

		// Profit and Loss
		case DASHBOARD.PROFIT_LOSS:
			return {
				...state,
				proft_loss: Object.assign({}, payload),
			};

		//Taxes
		case DASHBOARD.TAXES:
			return {
				...state,
				taxes: Object.assign({}, payload),
			};

		// Revenues and Expenses
		case DASHBOARD.REVENUE_GRAPH:
			return {
				...state,
				revenue_graph: Object.assign([], payload),
			};

		case DASHBOARD.EXPENSE_GRAPH:
			return {
				...state,
				expense_graph: Object.assign([], payload),
			};

		default:
			return state;
	}
};

export default DashboardReducer;
