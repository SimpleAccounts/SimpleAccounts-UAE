import { authApi, authFileUploadApi } from 'utils';

export const refundPaymentCNWithInvoice = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/creditNote/refund',
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
export const refundPaymentCNWithoutInvoice = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/creditNote/recordPaymentCNWithoutInvoice',
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

