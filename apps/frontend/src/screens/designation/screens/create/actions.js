import {
  authApi
} from 'utils'

export const createEmployeeDesignation = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/employeeDesignation/saveEmployeeDesignation',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
