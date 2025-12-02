import { VAT } from 'constants/types';
import { authApi } from 'utils';

// Get Vat List
export const getVatList = (obj) => {
	let name = obj && obj.name ? obj.name : '';
	let vatPercentage = obj && obj.vatPercentage ? obj.vatPercentage : '';
	let pageNo = obj && obj.pageNo ? obj.pageNo : '';
	let pageSize = obj && obj.pageSize ? obj.pageSize : '';
	let order = obj && obj.order ? obj.order : '';
	let sortingCol = obj && obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable =
		obj && obj.paginationDisable ? obj.paginationDisable : false;

	let url;
	if (obj) {
		url = `/rest/vat/getList?name=${name}&vatPercentage=${vatPercentage}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
	} else {
		url = `/rest/vat/getList`;
	}
	return (dispatch) => {
		let data = {
			method: 'GET',
			url,
		};

		return authApi(data)
			.then((res) => {
				if (obj && !obj.paginationDisable) {
					dispatch({
						type: VAT.VAT_LIST,
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

// Get Vat By ID
export const getVatByID = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/vat/getById?id=${id}`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: VAT.VAT_ROW,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Create & Save Bat
// export const createBat = (bat) => {
//   return (dispatch) => {
//     let data = {
//       method: 'POST',
//       url: `/rest/vat/savevat?id=1`,
//       data: bat
//     }

//     return authApi(data).then((res) => {
//       return res
//     }).catch((err) => {
//       throw err
//     })
//   }
// }

// // Delete Vat Row
export const deleteVat = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/vat/deletes`,
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

export const getVatCount = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/vat/getProductCountsForVat/?vatId=${id}`,
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
export const getCompanyDetails = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/company/getCompanyDetails`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

