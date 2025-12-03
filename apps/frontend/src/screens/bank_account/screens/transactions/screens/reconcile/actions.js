import { BANK_ACCOUNT } from 'constants/types';
import { authApi, authFileUploadApi } from 'utils';

export const getTransactionDetail = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/transaction/getById?id=${id}`,
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

export const getReconcileList = (obj) => {
	let bankId = obj.bankId ? obj.bankId : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/reconsile/list?bankId=${bankId}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
		};
		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: BANK_ACCOUNT.RECONCILE_LIST,
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

export const reconcilenow = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/reconsile/reconcilenow',
			data: obj,
		};
		return authFileUploadApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const removeBulkReconciled = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/reconsile/deletes',
			data: obj,
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
