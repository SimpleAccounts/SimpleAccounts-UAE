import {
  authApi
} from 'utils'

export const createEmployment = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/payroll/saveEmployment',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
