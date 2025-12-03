import {
  authApi
} from 'utils'

export const createContact = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/contact/save',
      data: obj
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