import {
  authApi
} from 'utils'

export const getDetailedGeneralLedgerList = (postData) => {
  const { startDate, endDate,reportBasis,chartOfAccountId} = postData
  let url = `/rest/detailedGeneralLedgerReport/getList?startDate=${startDate}&endDate=${endDate}&reportBasis=${reportBasis}`
  if(chartOfAccountId){
    url = url + `&chartOfAccountId=${chartOfAccountId}`
  }
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

export const getTransactionCategoryList = (postData) => {
  const { startDate, endDate,reportBasis,chartOfAccountId} = postData
  let url = `/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery?startDate=${startDate}&endDate=${endDate}&reportBasis=${reportBasis}`
  if(chartOfAccountId){
    url = url + `&chartOfAccountId=${chartOfAccountId}`
  }
  return (dispatch) => {
    let data ={
      method: 'get',
      url
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
