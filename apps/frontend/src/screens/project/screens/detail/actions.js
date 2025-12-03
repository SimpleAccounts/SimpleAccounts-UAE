import {
  authApi
} from 'utils'

// Get Project By ID
export const getProjectById = (id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/project/getProjectById?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteProject = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/project/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateProject = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/project/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}