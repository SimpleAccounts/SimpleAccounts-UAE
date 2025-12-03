import { OPENING_BALANCE } from 'constants/types'
import {
  authApi
} from 'utils'


// Create & Save

export const addOpeningBalance = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url:`/rest/transactionCategoryBalance/save`,
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const getOpeningBalanceList = () => {
  let param = `/rest/transactionCategoryBalance/list?paginationDisable=true`;
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: param
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}