import {
  authApi
} from 'utils'

export const getSalaryRoleById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/getSalaryRoleById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateSalaryRole = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/payroll/updateSalaryRole',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteSalaryRole = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/payroll/deleteSalaryRole?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
