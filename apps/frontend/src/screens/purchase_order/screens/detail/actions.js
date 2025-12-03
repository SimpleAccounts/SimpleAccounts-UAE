import {
  authApi,
  authFileUploadApi
} from 'utils'

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

export const updatePO = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/poquatation/updatepo',
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