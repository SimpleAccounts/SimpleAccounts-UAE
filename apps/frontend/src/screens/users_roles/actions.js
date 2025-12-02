import { USER } from 'constants/types';
import { authApi } from 'utils';

export const getRoleList = (postObj) => {
	let order = postObj?.order ? postObj.order : '';
	let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
	return async (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/user/getrole?order=${order}&sortingCol=${sortingCol}`,
		};

		try {
			const res = await authApi(data);
			dispatch({
				type: USER.ROLE_LIST,
				payload: res.data,
			});
			return res;
		} catch (err) {
			throw err;
		}
	};
};

export const getModuleList = (id) => {
	return async (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/roleModule/getModuleListByRoleCode?roleCode=${id}`,
		};

		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	};
};

export const getUsersCountForRole = (id) => {
	return async (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/roleModule/getUsersCountForRole?roleId=${id}`,
		};

		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	};
};

export const deleteRole = (id) => {
	return async (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/roleModule/delete?roleCode=${id}`
		}

		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
  }
