import {
  authApi
} from 'utils';
import { REPORTS } from 'constants/types';

export const getPayableInvoiceDetail = (postData) => {
  const { startDate, endDate} = postData
  let url = `/rest/simpleaccountReports/PayableInvoiceDetail?startDate=${startDate}&endDate=${endDate}`
  return (dispatch) => {
    let data = {
      method: 'get',
      url
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        // dispatch({
        //   type: EMPLOYEE.CURRENCY_LIST,
        //   payload: res
        // })
        return res
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getTransactionCategoryList = () => {
  return (dispatch) => {
    let data ={
      method: 'get',
      url: '/rest/transactioncategory/getList'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        return res
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getCompany = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: 'rest/company/getById?id=10000',
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: REPORTS.COMPANY_PROFILE,
            payload: {
              data: res.data,
            },
          });
          return res;
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};