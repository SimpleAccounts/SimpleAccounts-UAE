import { JOURNAL } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

export const getJournalList = (obj) => {
	let journalDate = obj.journalDate ? obj.journalDate : '';
	let journalReferenceNo = obj.journalReferenceNo ? obj.journalReferenceNo : '';
	let description = obj.description ? obj.description : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	let url = `/rest/journal/getList?journalReferenceNo=${journalReferenceNo}&description=${description}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
	if (journalDate) {
		let date = moment(journalDate).format('YYYY-MM-DD');
		url = url + `&journalDate=${date}`;
	}
	return (dispatch) => {
		let data = {
			method: 'GET',
			url,
		};

		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: JOURNAL.JOURNAL_LIST,
						payload: res,
					});
				}
				return res;
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
			url: '/rest/currency/getCompanyCurrencies',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: JOURNAL.CURRENCY_LIST,
						payload: res,
					});
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTransactionCategoryList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/transactioncategory/getTransactionCategoryListForManualJornal`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: JOURNAL.TRANSACTION_CATEGORY_LIST,
					payload: res,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getContactList = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/contact/getContactsForDropdown`,
		};

		return authApi(data)
			.then((res) => {
				if(res.status === 200){
					dispatch({
						type: JOURNAL.CONTACT_LIST,
						payload: res,
					});					
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getVatList = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/datalist/vatCategory',
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: JOURNAL.VAT_LIST,
					payload: res,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const removeBulkJournal = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/journal/deletes',
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

export const getSavedPageNum = (payload) => {
	return (dispatch) => {
		dispatch({
			type: JOURNAL.PAGE_NUM,
			payload: payload,
		});
	};
};

export const setCancelFlag = (payload) => {
	return (dispatch) => {
		dispatch({
			type: JOURNAL.CANCEL_FLAG,
			payload: payload,
		});
	};
};

export const getInvoicePrefix = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=11',
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
export const checkValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
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

export const getInvoiceNo = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=11`,
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