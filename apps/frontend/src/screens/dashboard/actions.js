import { DASHBOARD } from 'constants/types';
import { authApi } from 'utils';

export const initialData = (obj) => {
	return (dispatch) => {};
};

// Cash Flow Actions

export const getCashFlowGraphData = (daterange) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/transaction/getCashFlow?monthNo=' + daterange,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: DASHBOARD.CASH_FLOW_GRAPH,
					payload: res.data,
				});
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Invoice Actions

export const getInvoiceGraphData = (daterange) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/invoice/getChartData?monthCount=' + daterange,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: DASHBOARD.INVOICE_GRAPH,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const getProfitLossReport = (daterange) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/dashboardReport/profitandloss?monthNo=' + daterange,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: DASHBOARD.INVOICE_GRAPH,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Bank Account Actions

export const getBankAccountTypes = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/bank/list',
		};

		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: DASHBOARD.BANK_ACCOUNT_TYPE,
						payload: res.data.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getBankAccountGraphData = (account, daterange) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url:
				'/rest/bank/getBankChart?bankId=' +
				account +
				'&monthCount=' +
				daterange,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: DASHBOARD.BANK_ACCOUNT_GRAPH,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Profit and Loss

export const getProfitAndLossData = (daterange) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/dashboardReport/profitandloss?monthNo=' + daterange,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: DASHBOARD.PROFIT_LOSS,
					payload: res.data,
				});
				return '1';
			})
			.catch((err) => {
				throw err;
			});
	};
};

//Taxes

export const getTaxes = (daterange) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/dashboardReport/getVatReport?monthNo=' + daterange,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: DASHBOARD.TAXES,
					payload: res.data,
				});
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Revenues and Expenses

export const getExpensesGraphData = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/expense/getList',
		};

		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: DASHBOARD.EXPENSE_GRAPH,
						payload: res.data.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getRevenuesGraphData = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/invoice/getList?type=2',
		};

		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: DASHBOARD.REVENUE_GRAPH,
						payload: res.data.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTotalBalance = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/bank/getTotalBalance`,
		};
		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
