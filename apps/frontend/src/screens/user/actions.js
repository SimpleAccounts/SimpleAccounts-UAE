import { USER } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

export const getUserList = (obj) => {
	// const value = (obj.active)  ? obj.active : true
	let name = obj.name ? obj.name : '';
	let roleId = obj.roleId ? obj.roleId.value : '';
	let active = obj.active ? obj.active.value : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	let url = `/rest/user/getList?name=${name}&roleId=${roleId}&active=${active}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
	if (obj.dob) {
		let date = moment(obj.dob).format('DD-MM-YYYY');
		url = url + `&dob=${date}`;
	}
	return (dispatch) => {
		let data = {
			method: 'GET',
			url,
		};

		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: USER.USER_LIST,
						payload: res.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getRoleList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/user/getrole`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: USER.ROLE_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getPayrollCount = (userId) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/payroll/getPayrollCountByUserId?userId=${userId}`,
		};
		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getEmployeesNotInUserForDropdown = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/employee/getEmployeesNotInUserForDropdown`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: USER.EMPLOYEE_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getEmployeeDesignationForDropdown = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/employeeDesignation/getEmployeeDesignationForDropdown`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: USER.DESIGNATION_DROPDOWN,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const removeBulk = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/user/deletes',
			data: obj,
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

export const getCompanyTypeList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/company/getCompaniesForDropdown`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: USER.COMPANY_TYPE_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
