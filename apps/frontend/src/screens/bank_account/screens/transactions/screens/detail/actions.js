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

export const updateTransaction = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transaction/update',
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

export const UnexplainTransaction = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transaction/unexplain',
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
export const getUnPaidPayrollsList = () => {
	console.log("getUnPaidPayrollsList");
	return (dispatch) => {
	   let data = {
		  method: 'get',
		  url: `/rest/payroll/getUnpaidPayrollList`,
	   };
	   return authApi(data)
		  .then((res) => {
			 if (res.status === 200) {
				dispatch({
				   type: BANK_ACCOUNT.UNPAID_PAYROLLS,
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