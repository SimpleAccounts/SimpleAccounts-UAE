import {
  authApi
} from 'utils'


// Create & Save
export const createCurrencyConvert = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/currencyConversion/save`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const checkValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?moduleType=${obj.moduleType}&currencyCode=${obj.currencyCode}`,
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