import {
  authApi,
  authFileUploadApi
} from 'utils'

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

export const updateInvoice = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/invoice/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteInvoice = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/invoice/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getInvoicesListForCN = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/invoice/getDueInvoices?id=${id}&type=CUSTOMER`,
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

export const refundAgainstInvoices = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/creditNote/applyToInvoice',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}