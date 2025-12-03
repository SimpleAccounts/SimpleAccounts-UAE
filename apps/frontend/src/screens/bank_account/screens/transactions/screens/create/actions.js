import { authFileUploadApi } from 'utils';
import {
	// api,
	authApi,
} from 'utils';

export const createTransaction = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transaction/save',
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

export const getTransactionCategoryListForExplain = (id, bankId) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/reconsile/getTransactionCat?chartOfAccountCategoryId=${id}&bankId=${bankId}`,
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


export const getVatReportListForBank=(id)=>{
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/vatReport/getVatReportListForBank?id=${id}`,
		};
		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
}

export const getAllPayrollList = (postObj) => {
	let pageNo = postObj?.pageNo ? postObj.pageNo : '';
	let pageSize = postObj?.pageSize ? postObj.pageSize : '';
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	let paginationDisable = postObj?.paginationDisable
			? postObj.paginationDisable
			: false;

	let url = `/rest/payroll/getList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;

	return (dispatch) => {
			let data = {
					method: 'get',
					url,
			};
			return authApi(data)
					.then((res) => {
						return res.data
					})
					.catch((err) => {
							throw err;
					});
	};
};