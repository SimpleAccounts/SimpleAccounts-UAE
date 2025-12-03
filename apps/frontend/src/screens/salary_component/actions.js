import {
  authApi
} from 'utils'


export const saveSalaryComponent = (obj, isCreated) => {
  let url = isCreated ? '/rest/payroll/updateSalaryComponent' : '/rest/payroll/saveSalaryComponent';
  return (dispatch) => {
    let data = {
      method: 'post',
      url: url,
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const updateSalaryComponent = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/payroll/updateSalaryComponent',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const deleteSalaryComponent = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/payroll/deleteSalaryComponent?id=${id}`
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}


export const getSalaryComponentById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/getSalaryComponentById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const getComponentId = () => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=14`,
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

