import { EXPENSE } from 'constants/types'
import {
  authApi,
  authFileUploadApi
} from 'utils'

export const getExpenseDetail = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/expense/getExpenseById?expenseId=${_id}`
    }

    return authApi(data).then((res) => {
      dispatch({
        type: EXPENSE.EXPENSE_DETAIL,
        payload: res
      })
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const getCurrencyList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/currency/getactivecurrencies'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: EXPENSE.CURRENCY_LIST,
          payload: {
            data: res.data
          }
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const updateExpense = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/expense/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteExpense = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/expense/delete?expenseId=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}