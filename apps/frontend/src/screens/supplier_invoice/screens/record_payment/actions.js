import { authApi, authFileUploadApi } from 'utils';

export const getReceiptById = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/receipt/getReceiptById?id=1001`,
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

export const updateInvoice = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/invoice/update',
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
export const recordPayment = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/payment/save',
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

export const deleteInvoice = (id) => {
	return (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/invoice/delete?id=${id}`,
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

export const getReceiptNo = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/receipt/getNextReceiptNo?id=${id}`,
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
