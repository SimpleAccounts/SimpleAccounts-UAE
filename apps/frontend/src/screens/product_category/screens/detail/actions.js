import {
  authApi
} from 'utils'


export const getProductCategoryById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/productcategory/getById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateProductCategory = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/productcategory/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteProductCategory = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/productcategory/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
export const getProductBy = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/product/getList`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
