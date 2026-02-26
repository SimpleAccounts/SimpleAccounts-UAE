import { BANK_ACCOUNT } from 'constants/types';
import { authApi, authFileUploadApi } from 'utils';

export const getTransactionDetail = id => {
  return dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/transaction/getById?id=${id}`,
    };
    return authApi(data)
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getReconcileList = obj => {
  let bankId = obj.bankId ? obj.bankId : '';
  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

  return dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/reconsile/list?bankId=${bankId}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
    };
    return authApi(data)
      .then(res => {
        if (!obj.paginationDisable) {
          dispatch({
            type: BANK_ACCOUNT.RECONCILE_LIST,
            payload: res.data,
          });
        }
        return res;
      })
      .catch(err => {
        throw err;
      });
  };
};

export const reconcilenow = obj => {
  return dispatch => {
    // #region agent log
    const paramsString = obj && typeof obj.toString === 'function' ? obj.toString() : String(obj);
    fetch('http://127.0.0.1:7243/ingest/9820ccb9-53bb-49da-b89d-d829448cd2c5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'actions.js:reconcilenow', message: 'reconcilenow request config', data: { objType: obj && obj.constructor ? obj.constructor.name : typeof obj, paramsString: paramsString && paramsString.length <= 500 ? paramsString : (paramsString ? paramsString.slice(0, 500) + '...' : '') }, timestamp: Date.now(), hypothesisId: 'H5' }) }).catch(() => {});
    // #endregion
    let data = {
      method: 'post',
      url: '/rest/reconsile/reconcilenow',
      data: obj,
    };
    return authFileUploadApi(data)
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  };
};

export const removeBulkReconciled = obj => {
  return dispatch => {
    let data = {
      method: 'delete',
      url: '/rest/reconsile/deletes',
      data: obj,
    };
    return authApi(data)
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  };
};
