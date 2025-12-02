import {
  authApi,
  authFileUploadApi
} from 'utils'

export const getGRNById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/poquatation/getGRNById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateGRN = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/poquatation/updategrn',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deletegrn = (id) => {
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