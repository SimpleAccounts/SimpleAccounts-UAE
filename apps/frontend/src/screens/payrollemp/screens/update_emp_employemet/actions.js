import {
    authApi
  } from 'utils'


  export const getEmployeeById = (_id) => {
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

  export const updateEmployment = (obj) => {
    return (dispatch) => {
      let data = {
        method: 'post',
        url: `/rest/payroll/updateEmployment`,
        data: obj
      }
  
      return authApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
    }
  }