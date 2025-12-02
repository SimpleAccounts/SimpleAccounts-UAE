import { authApi, authFileUploadApi } from 'utils';

export const createReceipt = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/receipt/save',
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
			url: `/rest/invoice/getDueInvoices?id=${id}&type=CUSTOMER`,
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
