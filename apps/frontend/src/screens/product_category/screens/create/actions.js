import {
  authApi
} from 'utils'



// Create & Save Bat
export const createProductCategory = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/productcategory/save`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}