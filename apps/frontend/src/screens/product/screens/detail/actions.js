import {
  authApi
} from 'utils'


export const updateProduct = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/product/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getProductById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/product/getProductById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteProduct = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/product/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}