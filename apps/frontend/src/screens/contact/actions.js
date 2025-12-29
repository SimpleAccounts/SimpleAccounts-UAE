import { CONTACT } from 'constants/types';
import { authApi } from 'utils';

export const getContactList = obj => {
  // Build query parameters, only including non-empty values
  const params = new URLSearchParams();

  // String parameters - only add if not empty
  if (obj.name && obj.name.trim()) {
    params.append('name', obj.name.trim());
  }
  if (obj.email && obj.email.trim()) {
    params.append('email', obj.email.trim());
  }
  if (obj.contactType) {
    // Handle both object with .value and direct value
    const contactTypeValue =
      typeof obj.contactType === 'object' ? obj.contactType.value : obj.contactType;
    if (contactTypeValue) {
      params.append('contactType', contactTypeValue);
    }
  }

  // Numeric parameters - ensure they are numbers, default to 0 for pageNo, 10 for pageSize
  const pageNo =
    obj.pageNo !== undefined && obj.pageNo !== null && obj.pageNo !== '' ? Number(obj.pageNo) : 0;
  const pageSize =
    obj.pageSize !== undefined && obj.pageSize !== null && obj.pageSize !== ''
      ? Number(obj.pageSize)
      : 10;

  params.append('pageNo', pageNo);
  params.append('pageSize', pageSize);

  // Sorting parameters - only add if not empty
  if (obj.order && obj.order.trim()) {
    params.append('order', obj.order.trim());
  }
  if (obj.sortingCol && obj.sortingCol.trim()) {
    params.append('sortingCol', obj.sortingCol.trim());
  }

  // Boolean parameter
  const paginationDisable = obj.paginationDisable === true;
  params.append('paginationDisable', paginationDisable);

  return dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/contact/getContactList?${params.toString()}`,
    };

    return authApi(data)
      .then(res => {
        if (!paginationDisable) {
          dispatch({
            type: CONTACT.CONTACT_LIST,
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
      url: '/rest/contact/deletes',
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

export const getCurrencyList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/currency/getactivecurrencies',
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: CONTACT.CURRENCY_LIST,
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
            type: CONTACT.COUNTRY_LIST,
            payload: res.data,
          });
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

export const getContactTypeList = () => {
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/datalist/getContactTypes`,
    };
    return authApi(data)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: CONTACT.CONTACT_TYPE_LIST,
            payload: res.data,
          });
        }
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
    if (countryCode) {
      return authApi(data)
        .then(res => {
          if (res.status === 200) {
            dispatch({
              type: CONTACT.STATE_LIST,
              payload: res.data,
            });
            return res;
          }
        })
        .catch(err => {
          throw err;
        });
    } else {
      dispatch({
        type: CONTACT.STATE_LIST,
        payload: [],
      });
    }
  };
};
export const getStateListForShippingAddress = countryCode => {
  return dispatch => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getstate?countryCode=' + countryCode,
    };
    if (countryCode) {
      return authApi(data)
        .then(res => {
          if (res.status === 200) {
            return res.data;
          }
        })
        .catch(err => {
          throw err;
        });
    } else {
      return [];
    }
  };
};

export const getInvoicesCountContact = id => {
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/contact/getInvoicesCountForContact/?contactId=${id}`,
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
export const checkValidation = obj => {
  return dispatch => {
    let data = {
      method: 'get',
      url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
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
