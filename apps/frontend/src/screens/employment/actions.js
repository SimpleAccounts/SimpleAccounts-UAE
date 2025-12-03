import { EMPLOYEE } from 'constants/types'
import {
  authApi
} from 'utils'

export const getEmployeeList = (obj) => {
  let name = obj.name ? obj.name : '';
  let email = obj.email ? obj.email : '';
  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/employee/getList?name=${name}&email=${email}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
    }
    return authApi(data).then((res) => {
      if(!obj.paginationDisable) {
        dispatch({
          type: EMPLOYEE.EMPLOYEE_LIST,
          payload: res.data
        })
      }
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getCurrencyList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/currency/getactivecurrencies'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: EMPLOYEE.CURRENCY_LIST,
          payload: res
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}
export const removeBulkEmployee = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'delete',
      url: '/rest/employee/deletes',
      data: obj
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
