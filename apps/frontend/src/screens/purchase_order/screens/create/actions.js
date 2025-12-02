import { authApi, authFileUploadApi } from 'utils';

export const initialData = (obj) => {
	return (dispatch) => {};
};

export const createPO = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/poquatation/savepo',
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

export const getPoNo = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=4`,
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

export const getPOById = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/poquatation/getPOById?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }