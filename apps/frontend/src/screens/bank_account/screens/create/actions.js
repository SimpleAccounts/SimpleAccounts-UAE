import { BANK_ACCOUNT } from "constants/types";
import { authApi } from "utils";

export const getAccountTypeList = () => {
  return async (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/bank/getaccounttype",
    };
    try {
		  const res = await authApi(data);
		  if (res.status === 200) {
			  dispatch({
				  type: BANK_ACCOUNT.ACCOUNT_TYPE_LIST,
				  payload: {
					  data: res.data,
				  },
			  });
		  }
	  } catch (err) {
		  throw err;
	  }
  };
};

export const getCurrencyList = () => {
  return async (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/currency/getactivecurrencies",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.CURRENCY_LIST,
            payload: {
              data: res.data,
            },
          });
          return res;
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const getCountryList = () => {
  return async (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/datalist/getcountry",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.COUNTRY_LIST,
            payload: {
              data: res.data,
            },
          });
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const createBankAccount = (obj) => {
  return async (dispatch) => {
    let data = {
      method: "post",
      url: "/rest/bank/save",
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
export const deleteBankAccount = (id) => {
  return async (dispatch) => {
    let data = {
      method: "delete",
      url: `/rest/bank/${id}`,
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
export const checkValidation = (obj) => {
  return async (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
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
export const getBankList = () => {
  return async (dispatch) => {
    let data = {
      method: "GET",
      url: `/rest/bank/getBankNameList`,
    };
    return authApi(data)
      .then((res) => {
		dispatch({
			type: BANK_ACCOUNT.BANK_LIST,
			payload: {
				data: res.data,
			},
		});
        return res;
      })
      .catch((err) => {
        throw err;
      });
  };
};
