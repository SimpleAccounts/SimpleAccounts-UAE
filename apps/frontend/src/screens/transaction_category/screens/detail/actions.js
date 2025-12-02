import { TRANSACTION } from 'constants/types'
import {
  authApi
} from 'utils'


// Get Transaction By ID
export const getTransactionByID = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/transaction/edittransactioncategory?id=${id}`
    }

    return authApi(data).then((res) => {
      dispatch({
        type: TRANSACTION.TRANSACTION_ROW,
        payload: {
          transactionCategoryCode: 2,
          transactionCategoryName: 'temp',
          transactionCategoryDescription: 'temp',
          parentTransactionCategory: {transactionCategoryDescription: 'Loream Ipsume'},
          transactionType: {
            transactionTypeName: 'temp'
          }
        }
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}

// Get All Transaction Types
export const getTransactionTypes = () => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/transaction/gettransactiontype`
    }

    return authApi(data).then((res) => {
      dispatch({
        type: TRANSACTION.TRANSACTION_TYPES,
        payload: res.data
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}


// Get Parent Category Code List
export const getParentCategoryCodeListData = (code, val) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/transaction/getparenttransaction?TransactionTypeCode=${code}&transcationTxt=${val}`
    }

    return authApi(data).then((res) => {
      dispatch({
        type: TRANSACTION.TRANSACTION_PARENT_CATEGORY_CODE_LIST,
        payload: res.data
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}

// Get All Transaction VAT Categories
export const getTransactionVatCategories = () => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/transaction/getvatcategories`
    }

    return authApi(data).then((res) => {
      dispatch({
        type: TRANSACTION.TRANSACTION_VAT_CATEGORIES,
        payload: res.data
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}

// Create & Save Transaction
export const createAndUpdateTransaction = (transaction) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/transaction/savetransaction?id=1`,
      data: transaction
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}