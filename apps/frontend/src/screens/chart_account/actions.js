import { CHART_ACCOUNT } from 'constants/types';
import { authApi } from 'utils';

export const getSubTransactionTypes = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/datalist/getsubChartofAccount`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTransactionTypes = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/datalist/getTransactionTypes`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: CHART_ACCOUNT.TRANSACTION_TYPES,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTransactionCategoryList = (obj) => {
	let transactionCategoryCode = obj.transactionCategoryCode
		? obj.transactionCategoryCode
		: '';
	let transactionCategoryName = obj.transactionCategoryName
		? obj.transactionCategoryName
		: '';
	let chartOfAccountId = obj.chartOfAccountId ? obj.chartOfAccountId.value : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/transactioncategory/getList?transactionCategoryCode=${transactionCategoryCode}&transactionCategoryName=${transactionCategoryName}&chartOfAccountId=${chartOfAccountId}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
		};
		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
						payload: res.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTransactionCategoryExportList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/transactioncategory/getExportList`,
		};
		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
						payload: res.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const removeBulk = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/transactioncategory/deleteTransactionCategories',
			data: obj,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getExplainedTransactionCountForTransactionCategory = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/transactioncategory/getExplainedTransactionCountForTransactionCategory/?transactionCategoryId=${id}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
