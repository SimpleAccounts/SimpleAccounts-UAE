import { EMPLOYEEPAYROLL} from 'constants/types'

import {
    authApi
  } from 'utils'

  export const getPayrollEmployeeList = (obj) => {
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
            type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
            payload: res.data
          })
        }
        return res
      }).catch((err) => {
        throw err
      })
    }
  }

  export const getPayrollEmployeeList2 = (obj) => {
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
        url: `/rest/employee/getListForActiveEmployees?name=${name}&email=${email}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
      }
      return authApi(data).then((res) => {
        if(!obj.paginationDisable) {
          dispatch({
            type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
            payload: res.data
          })
        }
        return res
      }).catch((err) => {
        throw err
      })
    }
  }
