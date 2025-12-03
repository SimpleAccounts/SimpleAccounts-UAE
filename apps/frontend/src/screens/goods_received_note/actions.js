import { GOODS_RECEVED_NOTE } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

export const getGRNList = (postObj) => {
	let supplierId = postObj.supplierId ? postObj.supplierId.value : '';
	let rfqReceiveDate = postObj.invoiceDate ? postObj.invoiceDate : '';
	let rfqExpiryDate = postObj.rfqExpiryDate ? postObj.rfqExpiryDate : '';
	let rfqNumber = postObj.rfqNumber ? postObj.rfqNumber : '';
	let type = postObj.type ? postObj.type : '';
	let status = postObj.status ? postObj.status.value : '';
	let pageNo = postObj?.pageNo ? postObj.pageNo : '';
	let pageSize = postObj?.pageSize ? postObj.pageSize : '';
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	let paginationDisable = postObj?.paginationDisable
		? postObj.paginationDisable
		: false;

	return (dispatch) => {
		let param = `/rest/poquatation/getListForGRN?supplierId=${supplierId}&rfqNumber=${rfqNumber}&status=${status}&type=5&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
		if (rfqReceiveDate) {
			let date = moment(rfqReceiveDate).format('DD-MM-YYYY');
			param = param + `&rfqReceiveDate=${date}`;
		}
		if (rfqExpiryDate) {
			let date = moment(rfqExpiryDate).format('DD-MM-YYYY');
			param = param + `&rfqExpiryDate=${date}`;
		}
		let data = {
			method: 'get',
			url: param,
			// data: postObj
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					if (!postObj.paginationDisable) {
						dispatch({
							type: GOODS_RECEVED_NOTE.GOODS_RECEVED_NOTE_LIST,
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

export const getProjectList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/project/getProjectsForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.PROJECT_LIST,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const saveInvoice = (id) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/invoice/save?id=${id}`,
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


export const changeStatus = (id,status) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/poquatation/changeStatus?id=${id}&status=${status}`,
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

export const getContactList = (nameCode) => {
	let contactType = nameCode ? nameCode : '';
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/contact/getContactsForDropdown?contactType=${contactType}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.CONTACT_LIST,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getStatusList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getInvoiceStatusTypes',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.STATUS_LIST,
						payload: res,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};



export const getVatList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/vatCategory',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.VAT_LIST,
						payload: {
							data: res.data,
						},
					});
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
					dispatch({
						type: GOODS_RECEVED_NOTE.DEPOSIT_LIST,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getPaymentMode = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/payMode',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.PAY_MODE,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getProductList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/datalist/product?priceType=PURCHASE`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.PRODUCT_LIST,
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

export const getSupplierList = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/contact/getContactsForDropdown?contactType=${id}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.SUPPLIER_LIST,
						payload: res,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const createSupplier = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/contact/save',
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

export const removeBulk = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/invoice/deletes',
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

export const getCountryList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getcountry',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.COUNTRY_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const postInvoice = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/invoice/posting',
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

export const unPostInvoice = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/invoice/undoPosting',
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

export const deleteInvoice = (id) => {
	return (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/invoice/delete?id=${id}`,
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

export const getInvoiceById = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/invoice/getInvoiceById?id=${_id}`,
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

export const getStateList = (countryCode) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getstate?countryCode=' + countryCode,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					// dispatch({
					//   type: CONTACT.STATE_LIST,
					//   payload: res.data
					// })
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

// export const sendMail = (id) => {
// 	return (dispatch) => {
// 		let data = {
// 			method: 'post',
// 			url: `/rest/poquatation/sendrfq?id=${id}`,
// 		};
// 		return authApi(data)
// 			.then((res) => {
// 				if (res.status === 200) {
// 					return res;
// 				}
// 			})
// 			.catch((err) => {
// 				throw err;
// 			});
// 	};
// };
export const getOverdueAmountDetails = (invoiceType) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/invoice/getOverDueAmountDetails?type=' + invoiceType,
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
export const getInvoicePrefix = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=5',
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

export const sendMail = (id) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/poquatation/sendGRN?id=${id}`,
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

export const getPurchaseOrderListForDropdown = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/poquatation/getRfqPoForDropDown?type=4`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: GOODS_RECEVED_NOTE.PO_LIST,
						payload: res,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const postGRN = (id) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/poquatation/postGRN?id=${id}`,
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
