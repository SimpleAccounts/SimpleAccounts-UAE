import { SALARY_STRUCTURE } from 'constants/types'
import {
  authApi
} from 'utils'

export const getSalaryStructureList = (obj) => {

  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/salaryStructureList?&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
    }
    return authApi(data).then((res) => {
      if (!obj.paginationDisable) {
        dispatch({
          type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
          payload: res.data
        })
      }
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getSalaryList = (obj) => {
  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/getSalaryList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

