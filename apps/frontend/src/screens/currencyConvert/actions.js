import { CURRENCYCONVERT } from 'constants/types'
import {
  authApi
} from 'utils'

export const getCurrencyConversionList = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/currencyConversion/getActiveCurrencyConversionList`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: CURRENCYCONVERT.CURRENCY_CONVERT_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getCurrencyConversion = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/currencyConversion/getCurrencyConversionList`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: CURRENCYCONVERT.CURRENCY_CONVERTION_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getCurrencyConversionById = (id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/currencyConversion/getCurrencyConversionById?id=${id}`,
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

export const getCompanyCurrency = (data) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/company/getCompanyCurrency',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: CURRENCYCONVERT.CURRENCY_LIST,
						payload: res.data,
					});
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};