import { BANK_ACCOUNT } from 'constants/types';
import { authApi } from 'utils';

export const getAccountTypeList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/bank/getaccounttype',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: BANK_ACCOUNT.ACCOUNT_TYPE_LIST,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getCurrencyList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/currency/getactivecurrencies',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: BANK_ACCOUNT.CURRENCY_LIST,
						payload: {
							data: res.data,
						},
					});
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getBankAccountList = (obj) => {
	let bankName = obj.bankName ? obj.bankName : '';
	let bankAccountTypeId = obj.bankAccountTypeId
		? obj.bankAccountTypeId.value
		: '';
	let bankAccountName = obj.bankAccountName ? obj.bankAccountName : '';
	let accountNumber = obj.accountNumber ? obj.accountNumber : '';
	let currencyCode = obj.currencyCode ? obj.currencyCode.value : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	let param = `/rest/bank/list?bankName=${bankName}&bankAccountTypeId=${bankAccountTypeId}&bankAccountName=${bankAccountName}&accountNumber=${accountNumber}&currencyCode=${currencyCode}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;

	return (dispatch) => {
		let data = {
			method: 'get',
			url: param,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					if (!obj.paginationDisable) {
						dispatch({
							type: BANK_ACCOUNT.BANK_ACCOUNT_LIST,
							payload: {
								data: Object.assign([], res.data),
							},
						});
					}
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const deleteBankAccount = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: `/rest/bank/deletebank?id=${_id}`,
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

export const removeBankAccountByID = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: `/rest/bank/${_id}`,
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

export const removeBulkBankAccount = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/bank/multiple',
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

export const getExplainCount = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/transaction/getExplainedTransactionCount/?bankAccountId=${id}`,
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
