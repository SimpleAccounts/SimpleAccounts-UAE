import { CURRENCY } from 'constants/types'
import {
  authApi
} from 'utils'


export const getCurrencyList = () => {
  return (dispatch) => {
    let data ={
      method: 'get',
      url: '/rest/currency'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: CURRENCY.CURRENCY_LIST,
          payload: {
            data: res.data
          }
        })
        return res
      }
    }).catch((err) => {
      throw err
    })
  }
}



