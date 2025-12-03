import { VAT } from 'constants/types'
import {
  authApi
} from 'utils'


// Get Vat By ID
export const getVatByID = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/vat/getById?id=${id}`
    }

    return authApi(data).then((res) => {
      dispatch({
        type: VAT.VAT_ROW,
        payload: res.data
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateVat = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/vat/update',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteVat = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/vat/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}


