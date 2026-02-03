import { RECEIPT } from 'constants/types';
import {
  // api,
  authApi,
} from 'utils';

import dayjs from '@/utils/date';

export const getReceiptList = obj => {
  let receiptDate = obj.receiptDate ? obj.receiptDate : '';
  let receiptReferenceCode = obj.receiptReferenceCode ? obj.receiptReferenceCode : '';
  let contactId = obj.contactId ? obj.contactId.value : '';
  let invoiceId = obj.invoiceId ? obj.invoiceId.value : '';
  let pageNo = obj.pageNo ? obj.pageNo : '';
  let pageSize = obj.pageSize ? obj.pageSize : '';
  let order = obj.order ? obj.order : '';
  let sortingCol = obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

  let url = `/rest/receipt/getList?referenceCode=${receiptReferenceCode}&contactId=${contactId}&invoiceId=${invoiceId}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
  if (receiptDate) {
    let date = dayjs(receiptDate).format('DD-MM-YYYY');
    url = url + `&receiptDate=${date}`;
  }
  return dispatch => {
    let data = {
      method: 'GET',
      url,
    };
    return authApi(data)
      .then(res => {
        if (!obj.paginationDisable) {
          dispatch({
            type: RECEIPT.RECEIPT_LIST,
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

export const removeBulk = obj => {
  return dispatch => {
    let data = {
      method: 'delete',
      url: '/rest/receipt/deletes',
      data: obj,
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

export const getContactList = id => {
  return dispatch => {
    const contactType = id != null && id !== '' ? id : 2;
    let data = {
      method: 'GET',
      url: `/rest/contact/getContactsForDropdown?contactType=${contactType}`,
    };

    return authApi(data)
      .then(res => {
        dispatch({
          type: RECEIPT.CONTACT_LIST,
          payload: res.data,
        });
        return res;
      })
      .catch(err => {
        throw err;
      });
  };
};
export const getInvoiceList = () => {
  return dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/invoice/getInvoicesForDropdown?type=2`,
    };

    return authApi(data)
      .then(res => {
        dispatch({
          type: RECEIPT.INVOICE_LIST,
          payload: res.data,
        });
        return res;
      })
      .catch(err => {
        throw err;
      });
  };
};
