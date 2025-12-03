import {
  authApi
} from 'utils'


export const getCurrencyConvertById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/currencyConversion/getCurrencyConversionById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getDeleteStatusById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/currency/getInvoicesCountForCurrency?currencyId=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateCurrencyConvert = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: '/rest/currencyConversion/update',
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
