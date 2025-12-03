import { CUSTOMER_INVOICE } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

export const getCustomerInvoiceList = (postObj) => {
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
		let param = `/rest/invoice/getList?contact=${customerName}&type=${contactType}&referenceNumber=${referenceNumber}&amount=${amount}&status=${status}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
		if (invoiceDate) {
			let date = moment(invoiceDate).format('YYYY-MM-DD');
			param = param + `&invoiceDate=${date}`;
		}
		if (invoiceDueDate) {
			let date = moment(invoiceDueDate).format('YYYY-MM-DD');
			param = param + `&invoiceDueDate=${date}`;
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
							type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
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
						type: CUSTOMER_INVOICE.PROJECT_LIST,
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

export const getCustomerList = (nameCode) => {
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
						type: CUSTOMER_INVOICE.CUSTOMER_LIST,
						payload: {
							data: res.data,
						},
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getPlaceOfSuppliyList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/invoice/getPlaceOfSupplyForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CUSTOMER_INVOICE.PLACE_OF_SUPPLY,
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
export const getCurrencyList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/currency/getactivecurrencies',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CUSTOMER_INVOICE.CURRENCY_LIST,
						payload: res,
					});
					return res;
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
						type: CUSTOMER_INVOICE.VAT_LIST,
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
export const getExciseList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/exciseTax',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CUSTOMER_INVOICE.EXCISE_LIST,
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
			url: `/rest/datalist/product?priceType=SALES`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CUSTOMER_INVOICE.PRODUCT_LIST,
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
						type: CUSTOMER_INVOICE.DEPOSIT_LIST,
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

export const getContactList = (nameCode) => {
	let contactType = nameCode ? nameCode : '';
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/contact/getContactList?contactType=${contactType}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CUSTOMER_INVOICE.CONTACT_LIST,
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
						type: CUSTOMER_INVOICE.STATUS_LIST,
						payload: res,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const createCustomer = (obj) => {
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
				return res;
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
						type: CUSTOMER_INVOICE.COUNTRY_LIST,
						payload: res.data,
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
						type: CUSTOMER_INVOICE.PAY_MODE,
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

export const sendMail = (id) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/invoice/send?id=${id}`,
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

export const getCustomerInvoicesCountForDelete = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/invoice/getCustomerInvoicesCountForDelete/?invoiceId=${id}`,
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
			url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=2',
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

export const updateInvoicePrefix = (obj) => {
	return (dispatch) => {
	  let data = {
		method: 'post',
		url: '/rest/customizeinvoiceprefixsuffix/update',
		data: obj
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
  export const getInventoryByProductId = (productId) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getInventoryByProductId?id=' + productId,
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
export const getStateListForShippingAddress = (countryCode) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getstate?countryCode=' + countryCode,
		};
		if (countryCode) {
			return authApi(data)
				.then((res) => {
					if (res.status === 200) {
						return res.data;
					}
				})
				.catch((err) => {
					throw err;
				});
		} else {
			return []
		}
	};
};


export const stockInHandTestForProduct = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'post',
		url: `/rest/invoice/stockInHandTestForProduct?invoiceId=${id}`,
	
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

	export const getTaxTreatment = () => {
		return (dispatch) => {
			let data = {
			method: 'GET',
			url: `/rest/datalist/getTaxTreatment`
			}
			return authApi(data).then((res) => {
			return res
			}).catch((err) => {
			throw err
			})
		}
		};