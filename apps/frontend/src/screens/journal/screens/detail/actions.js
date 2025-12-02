import {
  authApi
} from 'utils'

export const getJournalById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/journal/getById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateJournal = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/journal/update',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteJournal = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/journal/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}