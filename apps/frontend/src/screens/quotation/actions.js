import { QUOTATION } from 'constants/types';
import { authApi } from 'utils';

export const getQuotationList = postObj => {
  const rawCustomerId = postObj.customerId ? (postObj.customerId.value ?? postObj.customerId) : '';
  const customerId = rawCustomerId !== '' && rawCustomerId != null && !Number.isNaN(Number(rawCustomerId))
    ? Number(rawCustomerId)
    : '';
  const quatationNumber = postObj.quatationNumber ? postObj.quatationNumber : '';
  const status = postObj.status ? postObj.status.value : '';
  const pageNo = postObj?.pageNo !== undefined && postObj?.pageNo !== '' ? postObj.pageNo : 0;
  const pageSize = postObj?.pageSize !== undefined && postObj?.pageSize !== '' ? postObj.pageSize : 10;
  const order = postObj?.order ? postObj.order : '';
  const sortingCol = postObj?.sortingCol ? postObj.sortingCol : '';
  const paginationDisable = postObj?.paginationDisable ? postObj.paginationDisable : false;

  const params = new URLSearchParams();
  if (customerId !== '') params.set('supplierId', String(customerId));
  params.set('quatationNumber', quatationNumber);
  params.set('status', status ?? '');
  params.set('type', '6');
  params.set('pageNo', String(pageNo));
  params.set('pageSize', String(pageSize));
  params.set('order', order);
  params.set('sortingCol', sortingCol);
  params.set('paginationDisable', String(paginationDisable));

  return dispatch => {
    const url = `/rest/poquatation/getListForQuatation?${params.toString()}`;
    return authApi({ method: 'get', url })
      .then(res => {
        if (res.status === 200 && !postObj.paginationDisable) {
          const payload = res.data != null ? res.data : { data: [], count: 0 };
          dispatch({ type: QUOTATION.QUOTATION_LIST, payload });
        }
        return res;
      })
      .catch(err => {
        if (!postObj.paginationDisable) {
          dispatch({ type: QUOTATION.QUOTATION_LIST, payload: { data: [], count: 0 } });
        }
        throw err;
      });
  };
};

export const getExciseList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/exciseTax',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.EXCISE_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};
export const getProjectList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/project/getProjectsForDropdown',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.PROJECT_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getContactList = nameCode => {
  let contactType = nameCode ? nameCode : '';
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/contact/getContactsForDropdown?contactType=${contactType}`,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.CONTACT_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getStatusList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getInvoiceStatusTypes',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.STATUS_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getVatList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/vatCategory',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.VAT_LIST,
            payload: res.data,
          });
          return res;
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getDepositList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/datalist/receipt/tnxCat`,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.DEPOSIT_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getPaymentMode = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/payMode',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.PAY_MODE,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getProductList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/datalist/product?priceType=SALES`,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.PRODUCT_LIST,
            payload: res.data,
          });
          return res;
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getSupplierList = id => {
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/contact/getContactsForDropdown?contactType=${id}`,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.SUPPLIER_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};
export const createSupplier = obj => {
  return dispatch => {
    let data = {
      method: 'post',
      url: '/rest/contact/save',
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

export const removeBulk = obj => {
  return dispatch => {
    let data = {
      method: 'delete',
      url: '/rest/invoice/deletes',
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

export const getCountryList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getcountry',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: QUOTATION.COUNTRY_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const postInvoice = obj => {
  return dispatch => {
    let data = {
      method: 'post',
      url: '/rest/invoice/posting',
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

export const unPostInvoice = obj => {
  return dispatch => {
    let data = {
      method: 'post',
      url: '/rest/invoice/undoPosting',
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

export const deleteInvoice = id => {
  return dispatch => {
    let data = {
      method: 'DELETE',
      url: `/rest/invoice/delete?id=${id}`,
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

export const getInvoiceById = _id => {
  return dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/invoice/getInvoiceById?id=${_id}`,
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

export const getStateList = countryCode => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getstate?countryCode=' + countryCode,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          // dispatch({
          //   type: CONTACT.STATE_LIST,
          //   payload: res.data
          // })
          return res;
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const sendMail = obj => {
  return dispatch => {
    let data = {
      method: 'post',
      url: `/rest/poquatation/sendQuotation`,
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

export const saveGRN = id => {
  return dispatch => {
    let data = {
      method: 'post',
      url: `/rest/poquatation/savegrn?id=${id}`,
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

export const changeStatus = (id, status) => {
  return dispatch => {
    let data = {
      method: 'post',
      url: `/rest/poquatation/changeStatus?id=${id}&status=${status}`,
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
export const getOverdueAmountDetails = invoiceType => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/invoice/getOverDueAmountDetails?type=' + invoiceType,
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
export const getPoPrefix = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=4',
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
