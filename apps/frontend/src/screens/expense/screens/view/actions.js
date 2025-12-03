import { EXPENSE } from 'constants/types'
import {
  authApi,
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

