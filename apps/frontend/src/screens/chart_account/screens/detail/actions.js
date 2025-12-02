import {
  authApi
} from 'utils'

export const getTransactionCategoryById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/transactioncategory/getTransactionCategoryById?id=${id}`,
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}


export const updateTransactionCategory = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/transactioncategory/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteChartAccount = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/transactioncategory/deleteTransactionCategory?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
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