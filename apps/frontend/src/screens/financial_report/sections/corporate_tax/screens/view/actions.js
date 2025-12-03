import { authApi, authFileUploadApi } from 'utils';

export const getCTView = (postObj) => {
	let id = postObj?.id ? postObj.id : '';
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/corporate/tax/viewct?id=${id}`,
		};
		return authFileUploadApi(data)
			.then((res) => {
					return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};