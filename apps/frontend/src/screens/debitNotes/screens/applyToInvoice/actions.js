import {
  authApi,
  authFileUploadApi
} from 'utils'

export const getInvoicesListForCN = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/invoice/getDueInvoices?id=${id}&type=SUPPLIER`,
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

export const refundAgainstInvoices = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/creditNote/applyToInvoice',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}