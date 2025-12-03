import {
  authApi
} from 'utils'

export const getEmployeeDetail = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/employee/getById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateEmployee = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/employee/update',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteEmployee = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/employee/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
