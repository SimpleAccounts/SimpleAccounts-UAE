import { VAT_TRANSACTIONS } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

export const initialData = (obj) => {
	return (dispatch) => {};
};

export const vatTransactionList = (postObj) => {
	let customerName = postObj.customerId ? postObj.customerId.value : '';
	let referenceNumber = postObj.referenceNumber ? postObj.referenceNumber : '';
	let invoiceDate = postObj.invoiceDate ? postObj.invoiceDate : '';
	let invoiceDueDate = postObj.invoiceDueDate ? postObj.invoiceDueDate : '';
	let amount = postObj.amount ? postObj.amount : '';
	let status = postObj.status ? postObj.status.value : '';
	let contactType = 2; //postObj.contactType ? postObj.contactType : ''
	let pageNo = postObj?.pageNo ? postObj.pageNo : '';
	let pageSize = postObj?.pageSize ? postObj.pageSize : '';
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	let paginationDisable = postObj?.paginationDisable
		? postObj.paginationDisable
		: false;

	return (dispatch) => {
		let param = `/rest/taxes/getVatTransationList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
		let data = {
			method: 'get',
			url: param,
			//data: postObj,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					if (!postObj.paginationDisable) {
						dispatch({
							type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
							payload: {
								data: res.data,
							},
						});
					}
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
