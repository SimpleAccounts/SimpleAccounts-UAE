import {
  authApi
} from 'utils'

export const createAndSaveProject = (project) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/project/save`,
      data: project
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
