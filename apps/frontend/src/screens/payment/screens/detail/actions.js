import {
  authApi
} from 'utils'

export const getPaymentById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payment/getpaymentbyid?paymentId=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updatePayment = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/payment/update',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deletePayment = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/payment/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}