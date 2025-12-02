import {
  authApi
} from 'utils'

export const createSalaryRole = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/payroll/saveSalaryRole',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
