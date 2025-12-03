import { BANK_ACCOUNT } from 'constants/types';
import { PROFILE } from 'constants/types';

import {
  authApi,
  authFileUploadApi
} from 'utils'

export const getUserById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/user/getById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getCompanyById = () => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/company/getCompanyDetails`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getCurrencyList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/currency/getcurrency'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE.CURRENCY_LIST,
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getCountryList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getcountry'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE.COUNTRY_LIST,
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getIndustryTypeList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/datalist/getIndustryTypes`
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE.INDUSTRY_TYPE_LIST,
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getCompanyTypeList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/company/getCompaniesForDropdown`
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE.COMPANY_TYPE_LIST,
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const updateUser = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/user/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateCompany = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/company/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const resetNewpassword = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: '/rest/user/resetNewpassword',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getRoleList = (obj) => {

  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/user/getrole`
      // ?projectName=${obj.projectName}&expenseBudget=${obj.expenseBudget}&revenueBudget=${obj.revenueBudget}&vatRegistrationNumber=${obj.vatRegistrationNumber}&pageNo=${obj.pageNo}&pageSize=${obj.pageSize}`
    }

    return authApi(data).then((res) => {

      dispatch({
        type: PROFILE.ROLE_LIST,
        payload: res.data
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getStateList = (countryCode,type) => {
  let types = type === 'invoicing' ? 'INVOICING_STATE_LIST' : 'COMPANY_STATE_LIST'
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getstate?countryCode=' + countryCode
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE[`${types}`],
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}
export const getCompanyTypeList2 = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/datalist/getCompanyType`
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        return res;
      }
    }).catch((err) => {
      throw err
    })
  }
}


export const getTransactionList = () => {

	let param = `/rest/transaction/list`;
	return (dispatch) => {
		let data = {
			method: 'get',
			url: param,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
						dispatch({
							type: BANK_ACCOUNT.BANK_TRANSACTION_LIST,
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
