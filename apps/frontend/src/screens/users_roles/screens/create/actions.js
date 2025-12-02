import { USERS_ROLES } from 'constants/types';
import { authApi } from 'utils';

export const getRoleList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/roleModule/getList`,
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

export const getUpdatedRoleList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/roleModule/getModuleListByRoleCode?roleCode=1052`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: USERS_ROLES.ROLE_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const createRole = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/roleModule/save',
			data: obj,
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

export const updateRole = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/roleModule/update',
			data: obj,
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
