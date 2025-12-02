import { authApi, authFileUploadApi } from 'utils';

export const createInvoice = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/invoice/save',
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

export const getInvoiceNo = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=2`,
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

export const checkValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
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
export const getQuotationById = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/poquatation/getQuotationById?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
  export const getInvoiceById = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/invoice/getInvoiceById?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }


  export const getCompanyById = () => {
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

  export const getProductById = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/product/getProductById?id=${id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
  export const getCustomerShippingAddressbyID = (id) =>{
	return (dispatch) => {
		let data = {
		  method: 'get',
		  url: `/rest/contact/getContactById?contactId=${id}`,
		}
	
		return authApi(data).then((res) => {
		  return res
		}).catch((err) => {
		  throw err
		})
	  }
  }