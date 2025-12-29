import { USER } from 'constants/types';
import { authApi } from 'utils';

export const getRoleList = postObj => {
  let order = postObj?.order ? postObj.order : '';
  let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
  return async dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/user/getrole?order=${order}&sortingCol=${sortingCol}`,
    };
    const res = await authApi(data);
    dispatch({
      type: USER.ROLE_LIST,
      payload: res.data,
    });
    return res;
  };
};

export const getModuleList = id => {
  return async dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/roleModule/getModuleListByRoleCode?roleCode=${id}`,
    };
    return authApi(data);
  };
};

export const getUsersCountForRole = id => {
  return async dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/roleModule/getUsersCountForRole?roleId=${id}`,
    };
    return authApi(data);
  };
};

export const deleteRole = id => {
  return async dispatch => {
    let data = {
      method: 'DELETE',
      url: `/rest/roleModule/delete?roleCode=${id}`,
    };
    return authApi(data);
  };
};
