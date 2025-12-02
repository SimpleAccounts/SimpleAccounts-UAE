import {
  authApi
} from 'utils'

export const getReceiptById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/receipt/getReceiptById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteReceipt = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/receipt/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateReceipt = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/receipt/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}