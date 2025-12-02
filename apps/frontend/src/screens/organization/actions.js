import { ORGANIZATION } from 'constants/types'
import {
  authFileUploadApi,
  authApi
} from 'utils'

export const createOrganization = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/company/save',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
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
          type: ORGANIZATION.COUNTRY_LIST,
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
          type: ORGANIZATION.INDUSTRY_TYPE_LIST,
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}