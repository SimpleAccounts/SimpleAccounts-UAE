import {
  authApi,
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
};

export const getPoGrnById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `rest/poquatation/getPoGrnById?id=${_id}`
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
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

  export const getContactById = (id) => {
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
  

