

import { IMPORT } from 'constants/types';
import { authApi, authFileUploadApi } from 'utils';


export const generateReport = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/vatReport/generateVatReport',
			data: obj,
		};
		return authApi(data)
			.then((res) => {
				return res			
			})
			.catch((err) => {
				throw err;
			});
	};
};


export const getVatReportList = (postObj) => {
	let pageNo = postObj?.pageNo ? postObj.pageNo : '';
	let pageSize = postObj?.pageSize ? postObj.pageSize : '';
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/vatReport/getVatReportFilingList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}`,
	
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

export const deleteReportById = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'DELETE',
		url: `/rest/vatReport/delete?id=${id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  
export const fileVatReport = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/vatReport/fileVatReport',
			data: obj,
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


export const markItUnfiled = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/vatReport/undoFiledVatReport',
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

export const getDepositList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/datalist/receipt/tnxCat`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					// dispatch({
					// 	type: CUSTOMER_INVOICE.DEPOSIT_LIST,
					// 	payload: {
					// 		data: res.data,
					// 	},
					// });
					return res.data;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};


export const recordVatPayment = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/vatReport/recordVatPayment',
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
export const getCompany = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: 'rest/company/getById?id=10000',
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
			method: 'get',
			url: '/rest/company/getCompanyDetails',
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

export const VATSetting = (obj) => {
	console.log(obj)
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/simpleaccountReports/VATSetting',
			data: obj,
		};
		return authApi(data)
			.then((res) => {
				return res			
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const getVRN = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=12`,
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
export const getVRNPrefix = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=12',
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