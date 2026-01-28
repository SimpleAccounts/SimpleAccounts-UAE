import { authFileUploadApi } from 'utils';
import {
  // api,
  authApi,
} from 'utils';

export const createTransaction = obj => {
  return dispatch => {
    let data = {
      method: 'post',
      url: '/rest/transaction/save',
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

export const getTransactionCategoryListForExplain = (id, bankId) => {
  return dispatch => {
    // Debug logging
    console.log('getTransactionCategoryListForExplain called with:', { id, bankId, bankIdType: typeof bankId });
    
    // Only include bankId in URL if it's a valid positive integer
    // Exclude: null, undefined, empty string, string "null", string "undefined", 0, negative numbers, NaN
    let validBankId = null;
    
    // Explicit check: if bankId is falsy, null, undefined, empty string, or string "null"/"undefined", exclude it
    if (bankId == null || bankId === undefined || bankId === '' || bankId === 'null' || bankId === 'undefined') {
      validBankId = null;
      console.log('getTransactionCategoryListForExplain - bankId is invalid/null/undefined, excluding from URL');
    } 
    // Check if it's a valid positive integer
    else {
      const numBankId = Number(bankId);
      if (!isNaN(numBankId) && Number.isInteger(numBankId) && numBankId > 0) {
        validBankId = numBankId;
        console.log('getTransactionCategoryListForExplain - valid bankId:', validBankId);
      } else {
        validBankId = null;
        console.log('getTransactionCategoryListForExplain - bankId is not a valid positive integer, excluding from URL');
      }
    }
    
    // Only include bankId parameter if we have a valid value
    const bankIdParam = validBankId ? `&bankId=${validBankId}` : '';
    const finalUrl = `/rest/reconsile/getTransactionCat?chartOfAccountCategoryId=${id}${bankIdParam}`;
    console.log('getTransactionCategoryListForExplain - final URL:', finalUrl);
    
    let data = {
      method: 'get',
      url: finalUrl,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          return res;
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getVatReportListForBank = id => {
  return dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/vatReport/getVatReportListForBank?id=${id}`,
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

export const getAllPayrollList = postObj => {
  let pageNo = postObj?.pageNo ? postObj.pageNo : '';
  let pageSize = postObj?.pageSize ? postObj.pageSize : '';
  let order = postObj?.order ? postObj.order : '';
  let sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
  let paginationDisable = postObj?.paginationDisable ? postObj.paginationDisable : false;

  let url = `/rest/payroll/getList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;

  return dispatch => {
    let data = {
      method: 'get',
      url,
    };
    return authApi(data)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        throw err;
      });
  };
};
