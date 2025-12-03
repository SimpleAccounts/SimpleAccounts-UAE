import { SALARY_ROLES } from 'constants/types'
import {
  authApi
} from 'utils'

export const getSalaryRoleList = (obj) => {
  let salaryRoleName = obj.salaryRoleName ? obj.salaryRoleName : '';
  // let id = obj.id ? obj.id : '';
  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/salaryRoleList?salaryRoleName=${salaryRoleName}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
    }
    return authApi(data).then((res) => {
      if(!obj.paginationDisable) {
        dispatch({
          type: SALARY_ROLES.SALARY_ROLES_LIST,
          payload: res.data
        })
      }
      return res
    }).catch((err) => {
      throw err
    })
  }
}
