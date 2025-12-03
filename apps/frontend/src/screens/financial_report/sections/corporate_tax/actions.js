import { authApi, authFileUploadApi } from 'utils';
import { REPORTS } from 'constants/types'

export const getCTSettings = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/corporate/tax/get/setting',
			// data: obj,
		};
		return authApi(data)
			.then((res) => {
				dispatch({
					type: REPORTS.SETTING_LIST,
					payload: {
						data: res.data,
					},
				});
				return res
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const saveCTSettings = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/corporate/tax/save',
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

export const generateCTReport = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/corporate/tax/generatect',
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

export const getCorporateTaxList = (postObj) => {
	let pageNo = postObj?.pageNo ? postObj.pageNo : '';
	let pageSize = postObj?.pageSize ? postObj.pageSize : '';
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/corporate/tax/Corporate/list?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}`,
	
		};
		return authFileUploadApi(data)
			.then((res) => {
				dispatch({
					type: REPORTS.CTREPORT_LIST,
					payload: {
						data: res.data,
					},
				});
				return res			
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const fileCTReport = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/corporate/tax/filect',
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
			url: '/rest/corporate/tax/unfilect',
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

export const getCTPaymentHistoryList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/corporate/tax/payment/history`,
		};
		return authFileUploadApi(data)
			.then((res) => {
				if (res.status === 200) {
                    dispatch({
                        type: REPORTS.PAYMENT_HISTORY,
                        payload: {
                            data: res.data,
                        },
                    });
                }
				return res
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

export const deleteReportById = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'DELETE',
		url: `/rest/corporate/tax/delete?id=${id}`
	  }  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const recordCTPayment = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/corporate/tax/recordctpayment',
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