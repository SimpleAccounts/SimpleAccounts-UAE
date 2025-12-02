import { IMPORT_TRANSACTION } from 'constants/types'
import {
  authApi,
  authFileUploadApi

} from 'utils'
// import moment from 'moment'


export const getDateFormatList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/dateFormat/getList'
    }
    return authApi(data).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: IMPORT_TRANSACTION.DATE_FORMAT_LIST,
          payload: res.data
        })
      }
    }).catch((err) => {
      throw err
    })
  }
}

export const getDelimiterList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/transactionParsing/delimiter/list',
    }
    return authApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
  }
}

export const getTableHeaderList = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/transactionParsing/dbColEnum/list',
      // data: obj
    }
    return authFileUploadApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
  }
}

export const getTableDataList = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/transactionParsing/parse',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
  }
}

export const parseFile = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/transactionParsing/parse',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
  }
}

export const getConfigurationList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/transactionParsing/list',
    }
    return authApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
  }
}
export const createConfiguration = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/transactionParsing/save',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
        return res
      }).catch((err) => {
        throw err
      })
  }
}


export const parseCsvFile = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'POST',
			url: `/rest/transactionimport/parseFile`,
     data: obj
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const parseCsvFileWithOutTemplate = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'POST',
			url: `/rest/transactionimport/parseFileWithoutTemplate`,
     data: obj
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const importTransactionWithoutTemplate = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transactionimport/savewithtemplate',
			data: obj,
		};
		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};