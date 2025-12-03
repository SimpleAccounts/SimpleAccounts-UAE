import { CONTACT } from 'constants/types';
import { authApi } from 'utils';

export const getContactList = (obj) => {
	let name = obj.name ? obj.name : '';
	let email = obj.email ? obj.email : '';
	let contactType = obj.contactType ? obj.contactType.value : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/contact/getContactList?name=${name}&email=${email}&contactType=${contactType}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
		};

		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: CONTACT.CONTACT_LIST,
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
			url: '/rest/contact/deletes',
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
						type: CONTACT.CURRENCY_LIST,
						payload: res.data,
					});
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getCountryList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getcountry',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CONTACT.COUNTRY_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getContactTypeList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/datalist/getContactTypes`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CONTACT.CONTACT_TYPE_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getStateList = (countryCode) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getstate?countryCode=' + countryCode,
		};
		if (countryCode) {
			return authApi(data)
				.then((res) => {
					if (res.status === 200) {
						dispatch({
							type: CONTACT.STATE_LIST,
							payload: res.data,
						});
						return res;
					}
				})
				.catch((err) => {
					throw err;
				});
		} else {
			dispatch({
				type: CONTACT.STATE_LIST,
				payload: [],
			});
		}
	};
};
export const getStateListForShippingAddress = (countryCode) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getstate?countryCode=' + countryCode,
		};
		if (countryCode) {
			return authApi(data)
				.then((res) => {
					if (res.status === 200) {
						return res.data;
					}
				})
				.catch((err) => {
					throw err;
				});
		} else {
			return []
		}
	};
};

export const getInvoicesCountContact = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/contact/getInvoicesCountForContact/?contactId=${id}`,
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