import {
  authApi,
  authFileUploadApi
} from 'utils'

export const getRFQeById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/poquatation/getRfqById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateRFQ = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/poquatation/updaterfq',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleterfq = (id) => {
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