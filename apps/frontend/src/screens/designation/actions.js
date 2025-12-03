import { EMPLOYEE_DESIGNATION, SALARY_ROLES } from 'constants/types'
import {
  authApi
} from 'utils'


export const getEmployeeDesignationList = (obj) => {

  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/employeeDesignation/EmployeeDesignationList?&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
    }
    return authApi(data).then((res) => {
      if (!obj.paginationDisable) {
        dispatch({
          type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_LIST,
          payload: res.data
        })
      }
      return res
    }).catch((err) => {
      throw err
    })
  }
};


export const getParentDesignationList = (obj) => {

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/employeeDesignation/getParentEmployeeDesignationForDropdown`
    }
    return authApi(data).then((res) => {
      dispatch({
        type: EMPLOYEE_DESIGNATION.EMPLOYEE_DESIGNATION_TYPE_LIST,
        payload: res.data
      })
      return res;
    }).catch((err) => {
      throw err
    })
  }
};

export const getEmployeeCountForDesignation = (id) => {

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/employeeDesignation/getEmployeeDesignationCount?id=${id}`
    }
    return authApi(data).then((res) => {
      return res;
    }).catch((err) => {
      throw err
    })
  }
};
