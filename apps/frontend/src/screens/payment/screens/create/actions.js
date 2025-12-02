import { authFileUploadApi, authApi } from 'utils';

export const createPayment = (obj) => {
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

export const getList = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/invoice/getDueInvoices?id=${id}&type=SUPPLIER`,
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
