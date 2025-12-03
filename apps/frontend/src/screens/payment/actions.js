import { PAYMENT } from 'constants/types'
import {
  authApi
} from 'utils'
import moment from 'moment'

export const getCurrencyList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/currency/getactivecurrencies'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PAYMENT.CURRENCY_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getBankList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/bank/list'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PAYMENT.BANK_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getSupplierContactList = (id) => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/contact/getContactsForDropdown?contactType=${id}`
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PAYMENT.SUPPLIER_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getSupplierInvoiceList  = (id) => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url:  `/rest/invoice/getInvoicesForDropdown?type=1`
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PAYMENT.INVOICE_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getProjectList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/project/getProjectsForDropdown'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PAYMENT.PROJECT_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getPaymentList = (obj) => {
  let supplierId = obj.supplierId ? obj.supplierId.value : ''
  let paymentDate = obj.paymentDate ?  obj.paymentDate : ''
  let invoiceAmount =  obj.invoiceAmount ? obj.invoiceAmount : ''
  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false
  
  return (dispatch) => {
    let param = `/rest/payment/getlist?supplierId=${supplierId}&invoiceAmount=${invoiceAmount}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
    if (paymentDate) {
      let date = moment(paymentDate).format('YYYY-MM-DD')
      param = param + `&paymentDate=${date}`
    }
    let data = {
      method: 'get',
      url: param
      // data: obj
    }

    return authApi(data).then((res) => {
      if(!obj.paginationDisable) {
        dispatch({
          type: PAYMENT.PAYMENT_LIST,
          payload: res
        })
      }
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const removeBulkPayments = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'delete',
      url: '/rest/payment/deletes',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const createSupplier = (obj) => {
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

export const getInvoiceById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/invoice/getInvoiceById?id=${id}`
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
          return res
      }
    }).catch((err) => {
      throw err
    })
  }
}


export const getCountryList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getcountry'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PAYMENT.COUNTRY_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getStateList = (countryCode) => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getstate?countryCode=' + countryCode
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        return res
      }
    }).catch((err) => {
      throw err
    })
  }
}
