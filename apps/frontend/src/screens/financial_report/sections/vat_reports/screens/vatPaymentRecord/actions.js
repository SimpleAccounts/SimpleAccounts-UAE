import { EMPLOYEEPAYROLL } from 'constants/types';
import {
  authApi, authFileUploadApi
} from 'utils'


export const getVatPaymentHistoryList = (postObj) => {
	let pageNo = postObj?.pageNo ? postObj.pageNo : '';
	let pageSize = postObj?.pageSize ? postObj.pageSize : '';
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/vatReport/getVatPaymentHistoryList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}`,
	
		};
		return authFileUploadApi(data)
			.then((res) => {
				return res			
			})
			.catch((err) => {
				throw err;
			});
	};
};
