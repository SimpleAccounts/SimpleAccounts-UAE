import {
  authApi,
  authFileUploadApi
} from 'utils'

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

export const updateQuatation = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/poquatation/updateQuatation',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deletePo = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/poquatation/delete?id=${id}`
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