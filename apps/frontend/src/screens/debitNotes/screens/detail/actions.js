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

export const updateDebitNote = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/creditNote/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteDebitNote = (id) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/creditNote/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
