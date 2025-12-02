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

export const updateInvoice = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/invoice/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}


export const deleteCN = (id) => {
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
export const getCreditNoteById = (_id,isCNWithoutProduct) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/creditNote/getCreditNoteById?id=${_id}&isCNWithoutProduct=${isCNWithoutProduct}`
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const UpdateCreditNotes = (obj) => {
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