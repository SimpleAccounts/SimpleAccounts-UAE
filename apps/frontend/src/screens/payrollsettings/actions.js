import { authApi, } from 'utils';


export const getPayrollSettings = (generateSif) => {
	return (dispatch) => {
		let data = {
			method: 'POST',
			url: `/rest/company/updateSifSettings?generateSif=${generateSif}`,
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


export const getCompanyById = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/company/getCompanyDetails`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }