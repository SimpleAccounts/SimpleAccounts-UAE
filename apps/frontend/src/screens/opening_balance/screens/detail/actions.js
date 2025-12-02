import {
  authApi
} from 'utils'


export const getOpeningBalanceById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/transactionCategoryBalance/getTransactionById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateOpeningBalance = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: '/rest/transactionCategoryBalance/update',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}


export const deleteCurrencyConvert = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/currencyConversion/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
