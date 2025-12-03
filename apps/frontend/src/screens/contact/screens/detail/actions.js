import {
  authApi
} from 'utils'

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

export const updateContact = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/contact/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteContact = (id) => {
  return (dispatch) => {
    let data = {
      method: 'delete',
      url: `/rest/contact/delete?id=${id}`,
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