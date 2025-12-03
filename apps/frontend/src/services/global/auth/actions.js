import { AUTH, COMMON } from 'constants/types';
import { api, authApi, cryptoService } from 'utils';
import config from '../../../constants/config';


export const checkAuthStatus = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/user/current',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: AUTH.SIGNED_IN,
					});
					dispatch({
						type: AUTH.USER_PROFILE,
						payload: {
							data: res.data,
						},
					});
					cryptoService.encryptService('userId', res.data.userId);
					return res;
				} else {
					throw new Error('Auth Failed');
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const logIn = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/auth/token',
			data: obj,
		};
		return api(data)
			.then((res) => {
				dispatch({
					type: AUTH.SIGNED_IN,
				});
				window['localStorage'].setItem('accessToken', res.data.token);
				// window['sessionStorage'].setItem('userId', res.data.userId);

				window['localStorage'].setItem('language', 'en');
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const register = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/company/register',
			data: obj,
		};
		return api(data)
			.then((res) => {
				//	console.log(res);
				// dispatch({
				// 	type: AUTH.REGISTER,
				// });
				//window['localStorage'].setItem('accessToken', res.data.token);
				// window['sessionStorage'].setItem('userId', res.data.userId);

				//return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};


//Test URL: https://strapi-api-test-ae.app.simpleaccounts.io/api/auth/local/register
//Prod URl : https://strapi-api.ae.simpleaccounts.io/api/auth/local/register

export const registerStrapiUser = (obj, companyobj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: 'https://strapi-api.ae.simpleaccounts.io/api/auth/local/register',
			data: obj,
		};
		return api(data)
			.then((res) => {
				//block for updating the id of user coming in response
				let key = "id";
				let companyObjectKey = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`);
				let companyJsonStr = JSON.stringify(companyobj).replace(companyObjectKey, `"${key}": "${res.data.user.id}"`);
				//end of block	
				registerStrapiCompany(res.data.jwt, companyJsonStr);
			})
			.catch((err) => {
				throw err;
			});
	};
};

//TEst URL = https://strapi-api-test-ae.app.simpleaccounts.io/api/companies
//Prod URL : https://strapi-api.ae.simpleaccounts.io/api/companies

export const registerStrapiCompany = (apiToken, companyObj) => {
	//return (dispatch) => {
	try {
		//console.log('Starting API request...');
		let data = {
			method: 'post',
			url: 'https://strapi-api.ae.simpleaccounts.io/api/companies',
			data: companyObj,
			headers: {
				Authorization: `Bearer ${apiToken}`,
				'Content-Type': 'application/json',
			},
		};
		return api(data)
			.then((res) => {
				//console.log(res.data)
			})
			.catch((err) => {
				console.log(err)
				throw err;
			});
	} catch (error) {
		console.log(error)
	}
	//};
};


// export const registerStrapiCompany = (apiToken, companyObj) => {
// 	alert("in reg comp")
// 	return async (dispatch) => {
// 	  try {
// 		console.log('Starting API request...');

// 		const response = await api.post('https://strapi-api-test-ae.app.simpleaccounts.io/api/companies', companyObj, {
// 		  headers: {
// 			Authorization: `Bearer ${apiToken}`,
// 			'Content-Type': 'application/json',
// 		  },
// 		});

// 		console.log('API request successful!');
// 		console.log('Response:', response.data);

// 		// Handle the API response and dispatch appropriate actions
// 		// Example: dispatch({ type: REGISTER_COMPANY_SUCCESS, payload: response.data });
// 	  } catch (error) {
// 		console.log('API request error!');
// 		console.log('Error:', error);

// 		// Handle the error and dispatch appropriate actions
// 		// Example: dispatch({ type: REGISTER_COMPANY_ERROR, payload: error.message });
// 		throw error;
// 	  }
// 	};
//   };

export const getUserSubscription = () => {
	const apiUrl = `${config.SIMPLE_SERVICES_HOST}/api/getSimpleAccountsSubscription`;
	const apiKey = config.SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY;
	const domainUrl = window.location.origin;
	const url = `${apiUrl}?code=${apiKey}&domainUrl=${domainUrl}`;
	
	return async (dispatch) => {
		let data = {
			method: 'get',
			url: url,
		};
		return api(data)
			.then((res) => {
				return res;
			}).catch((err) => {
				throw err;
			});
	};
};


export const getCurrencyList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/company/getCurrency',
		};
		return api(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: COMMON.UNIVERSAL_CURRENCY_LIST,
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
export const getCurrencylist = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/currency/getcurrency',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: COMMON.CURRENCY_LIST,
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

export const logOut = () => {
	return (dispatch) => {
		window['localStorage'].clear();

		dispatch({
			type: AUTH.SIGNED_OUT,
		});
	};
};

export const getCompanyCount = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/company/getCompanyCount',
		};
		return api(data)
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

export const getTimeZoneList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/company/getTimeZoneList',
		};
		return api(data)
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

//function to get Simpleaccounts release number  
export const getSimpleAccountsreleasenumber = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/company/getSimpleAccountsreleasenumber',
		};
		return api(data)
			.then((res) => {
				//console.log("res=",res)
				if (res.status === 200) {
					return res.data;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};