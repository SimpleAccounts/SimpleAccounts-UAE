import { EMPLOYEE, USER } from 'constants/types'
import {
  authFileUploadApi,authApi
} from 'utils'

export const createUser = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/user/save',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const checkValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?moduleType=${obj.moduleType}&name=${obj.name}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getEmployeesNotInUserForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/employee/getEmployeesNotInUserForDropdown`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: USER.EMPLOYEE_LIST,
						payload: {
							data: res.data,
						},
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

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
  