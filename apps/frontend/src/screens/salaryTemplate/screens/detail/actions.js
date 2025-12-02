import {
  authApi
} from 'utils'


export const getSalaryTemplateById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/getSalaryTemplateById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateSalaryTemplate = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/payroll/updateSalaryTemplate',
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
