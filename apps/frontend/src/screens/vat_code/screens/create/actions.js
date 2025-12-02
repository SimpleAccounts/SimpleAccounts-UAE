import {
  authApi
} from 'utils'


// Create & Save Vat
export const createVat = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/vat/save`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

