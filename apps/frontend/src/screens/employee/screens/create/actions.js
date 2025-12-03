import {
  authApi
} from 'utils'

export const createEmployee = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/employee/save',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
