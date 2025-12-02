import {
  authApi
} from 'utils'

export const createJournal = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/journal/save',
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
