import { PRODUCT_CATEGORY } from 'constants/types'
import {
  authApi
} from 'utils'



// Get VAT List
export const getProductCategoryList = (obj) => {
  let productCategoryCode = obj && obj.productCategoryCode ? obj.productCategoryCode : '';
  let productCategoryName = obj && obj.productCategoryName ? obj.productCategoryName : '';
  let pageNo = obj && obj.pageNo ? obj.pageNo : '';
  let pageSize = obj && obj.pageSize ? obj.pageSize : '';
  let order = obj && obj.order ? obj.order : '';
  let sortingCol = obj && obj.sortingCol ? obj.sortingCol : '';
  let paginationDisable = obj && obj.paginationDisable ? obj.paginationDisable : false

  let url;

  if(obj) {
    url = `/rest/productcategory/getList?productCategoryCode=${productCategoryCode}&productCategoryName=${productCategoryName}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
  } else {
    url=`/rest/productcategory/getList`
  }
  return (dispatch) => {
    let data = {
      method: 'GET',
      url
    }

    return authApi(data).then((res) => {
      if(obj && !obj.paginationDisable) {
        dispatch({
          type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
          payload: res.data
        })
      }
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteProductCategory = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/productcategory/deletes`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
